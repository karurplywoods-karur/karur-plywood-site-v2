// src/app/api/orders/reserve/route.ts
// Reserve Order flow (Phase 1). Used for products where fulfillment_type is
// DISTRIBUTOR or SPECIAL_ORDER — i.e. verification_required = true.
// Mirrors /api/checkout/route.ts but NEVER collects payment here. Payment is
// only requested after an admin confirms availability (see /api/orders/[id]/verify
// and the payment-link module).
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/db';
import { sendOwnerOrderAlert } from '@/lib/email';
import { buildOwnerOrderMessage, getOwnerWhatsAppURL, buildCustomerFulfillmentMessage, sendCustomerFulfillmentWhatsApp } from '@/lib/whatsapp';
import { getDeliveryPromiseForCoords, getDeliveryPromiseForArea } from '@/lib/deliveryEngine';

async function ensureCustomerExists(user: any, fallbackPhone = '') {
  const { error } = await supabaseAdmin
    .from('customers')
    .upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      email: user.email || '',
      avatar_url: user.user_metadata?.avatar_url || '',
      phone: fallbackPhone,
    }, { onConflict: 'id', ignoreDuplicates: true });

  if (error) throw error;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const supabase = createServerSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Please login to reserve an order.' }, { status: 401 });
    }

    const body = await req.json();
    const { address, items, notes } = body;

    // 2. Validate
    if (!items?.length) return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
    if (!address) return NextResponse.json({ error: 'Delivery address required.' }, { status: 400 });

    // 3. Look up products to confirm fulfillment type + collect preferred distributor
    const productIds = [...new Set(items.map((i: any) => i.product_id).filter(Boolean))];
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, fulfillment_type, verification_required, preferred_distributor_id')
      .in('id', productIds);
    if (productsError) throw productsError;

    const productMap = new Map((products ?? []).map((p: any) => [p.id, p]));
    const anyRequiresVerification = items.some((i: any) => productMap.get(i.product_id)?.verification_required);

    if (!anyRequiresVerification) {
      return NextResponse.json({
        error: 'None of these items require verification — use Buy Now / regular checkout instead.',
      }, { status: 400 });
    }

    // Use the preferred distributor of the first verification-required item as
    // the order's routing hint (own warehouse -> preferred -> alternative is
    // resolved during the admin verification step, not here).
    const firstVerifiedItem = items.find((i: any) => productMap.get(i.product_id)?.verification_required);
    const preferredDistributorId = productMap.get(firstVerifiedItem?.product_id)?.preferred_distributor_id ?? null;

    // 4. Delivery zone + promise — prefer lat/lng pin, fall back to city text
    let deliveryPromise = null;
    if (address.latitude != null && address.longitude != null) {
      deliveryPromise = await getDeliveryPromiseForCoords(address.latitude, address.longitude);
    }
    if (!deliveryPromise && address.city) {
      deliveryPromise = await getDeliveryPromiseForArea(address.city);
    }
    // Not blocking the reservation if the zone can't be auto-resolved — the
    // admin will confirm delivery timing manually during verification. Never
    // reject a reservation just because auto zone-matching failed.

    // 5. Get customer
    await ensureCustomerExists(session.user, address.phone || '');
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', session.user.id)
      .single();
    if (!customer) return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });

    // 6. Totals (informational only at this stage — no payment collected)
    const subtotal = items.reduce((sum: number, i: any) => sum + (i.unit_price * i.quantity), 0);
    const total = subtotal;

    // 7. Create order in RESERVED state
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([{
        customer_id:      session.user.id,
        address_id:       address.id || null,
        delivery_name:    address.full_name,
        delivery_phone:   address.phone,
        delivery_line1:   address.line1,
        delivery_line2:   address.line2 || '',
        delivery_city:    address.city,
        delivery_state:   address.state || 'Tamil Nadu',
        delivery_pincode: address.pincode,
        delivery_google_map_link: address.google_map_link || '',
        delivery_latitude:        address.latitude ?? null,
        delivery_longitude:       address.longitude ?? null,
        subtotal,
        delivery_charge: 0,
        discount_amount: 0,
        total,
        payment_method:   'cod', // placeholder; real method chosen when payment link is generated
        payment_status:   'pending',
        status:            'pending', // legacy field — unchanged, existing admin UI keeps working
        fulfillment_status: 'RESERVED',
        verification_status: 'pending',
        is_reservation: true,
        distributor_id:    preferredDistributorId,
        delivery_zone_code: deliveryPromise?.zone.zone_code ?? null,
        estimated_delivery_date: deliveryPromise?.estimatedDeliveryDate ?? null,
        notes: notes || '',
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // 8. Insert order items (snapshot prices)
    const orderItems = items.map((i: any) => ({
      order_id:      order.id,
      product_id:    i.product_id || null,
      variant_id:    i.variant_id || null,
      variant_sku:   i.variant_sku || '',
      variant_label: i.variant_label || '',
      product_name:  i.product_name,
      product_image: i.product_image || '',
      category_name: i.category_name || '',
      unit:          i.unit || '',
      unit_price:    i.unit_price,
      quantity:      i.quantity,
      line_total:    i.unit_price * i.quantity,
    }));

    const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    // 9. Notify customer: reservation received, verifying availability
    const fulfillmentData = {
      orderNumber: order.order_number,
      customerName: customer.full_name || customer.email,
      customerPhone: customer.phone || address.phone,
      total,
      estimatedDeliveryDate: deliveryPromise?.estimatedDeliveryDate,
      verificationSlaMinutes: deliveryPromise?.verificationSlaMinutes ?? 15,
    };
    sendCustomerFulfillmentWhatsApp('RESERVED', fulfillmentData).catch(console.error);

    // 10. Notify owner (email + WhatsApp click-to-chat URL, same as checkout)
    const deliveryAddress = [
      address.full_name, address.line1, address.line2, address.city,
      address.state, address.pincode, address.google_map_link,
    ].filter(Boolean).join(', ');

    sendOwnerOrderAlert({
      orderNumber:    order.order_number,
      customerName:   customer.full_name || customer.email,
      customerPhone:  customer.phone || address.phone,
      items:          orderItems,
      total,
      paymentMethod:  'Reservation — availability verification required',
      deliveryAddress,
    }).catch(console.error);

    const waMessage = buildOwnerOrderMessage({
      orderNumber:     order.order_number,
      customerName:    customer.full_name || customer.email,
      customerPhone:   customer.phone || address.phone,
      items:           orderItems,
      total,
      paymentMethod:   'Reservation (verify stock before payment)',
      deliveryCity:    address.city,
      deliveryPincode: address.pincode,
    });

    return NextResponse.json({
      success:      true,
      order_id:     order.id,
      order_number: order.order_number,
      fulfillment_status: 'RESERVED',
      estimated_delivery_date: deliveryPromise?.estimatedDeliveryDate ?? null,
      delivery_zone: deliveryPromise?.zone.zone_name ?? null,
      wa_url:       getOwnerWhatsAppURL(waMessage),
    }, { status: 201 });

  } catch (err: any) {
    console.error('Reserve order error:', err);
    return NextResponse.json({ error: err.message || 'Reservation failed.' }, { status: 500 });
  }
}
