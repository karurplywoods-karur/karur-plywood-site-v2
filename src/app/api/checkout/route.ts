// src/app/api/checkout/route.ts
// Creates order in DB, sends email to customer, returns WA URL for owner notification
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/db';
import { sendOrderConfirmation, sendOwnerOrderAlert } from '@/lib/email';
import { buildOwnerOrderMessage, getOwnerWhatsAppURL } from '@/lib/whatsapp';

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
      return NextResponse.json({ error: 'Please login to place an order.' }, { status: 401 });
    }

    const body = await req.json();
    const { address, items, payment_method, notes } = body;

    // 2. Validate
    if (!items?.length) return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
    if (!address) return NextResponse.json({ error: 'Delivery address required.' }, { status: 400 });
    if (!['cod', 'razorpay'].includes(payment_method)) {
      return NextResponse.json({ error: 'Invalid payment method.' }, { status: 400 });
    }

    // 3. Get customer
    await ensureCustomerExists(session.user, address.phone || '');

    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!customer) return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });

    // 4. Calculate totals
    const subtotal = items.reduce((sum: number, i: any) => sum + (i.unit_price * i.quantity), 0);
    const delivery_charge = 0; // confirmed manually
    const total = subtotal + delivery_charge;

    // 5. Create order
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
        delivery_charge,
        total,
        payment_method,
        payment_status:   payment_method === 'cod' ? 'pending' : 'pending',
        status:           'pending',
        notes:            notes || '',
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // 6. Insert order items (snapshot prices)
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

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // 7. Send confirmation email to customer (fire and forget)
    const deliveryAddress = [
      address.full_name,
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.pincode,
      address.google_map_link,
    ].filter(Boolean).join(', ');

    sendOrderConfirmation({
      customerName:    customer.full_name || customer.email,
      customerEmail:   customer.email,
      orderNumber:     order.order_number,
      items:           orderItems,
      subtotal,
      deliveryCharge:  delivery_charge,
      total,
      paymentMethod:   payment_method,
      deliveryAddress,
    }).catch(console.error);

    // 7b. Notify the owner by email too — independent of WhatsApp, so the
    // order isn't missed if the WhatsApp tab is closed/not seen in time.
    sendOwnerOrderAlert({
      orderNumber:    order.order_number,
      customerName:   customer.full_name || customer.email,
      customerPhone:  customer.phone || address.phone,
      items:          orderItems,
      total,
      paymentMethod:  payment_method,
      deliveryAddress,
    }).catch(console.error);

    // 8. Build owner WhatsApp URL
    const waMessage = buildOwnerOrderMessage({
      orderNumber:     order.order_number,
      customerName:    customer.full_name || customer.email,
      customerPhone:   customer.phone || address.phone,
      items:           orderItems,
      total,
      paymentMethod:   payment_method,
      deliveryCity:    address.city,
      deliveryPincode: address.pincode,
    });

    const waURL = getOwnerWhatsAppURL(waMessage);

    return NextResponse.json({
      success:      true,
      order_id:     order.id,
      order_number: order.order_number,
      wa_url:       waURL,
      // For Razorpay: return razorpay_order_id after creating Razorpay order
    }, { status: 201 });

  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: err.message || 'Checkout failed.' }, { status: 500 });
  }
}