// src/app/api/checkout/route.ts
// Creates order in DB, sends email to customer, returns WA URL for owner notification
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/db';
import { sendOrderConfirmation, sendOwnerOrderAlert } from '@/lib/email';
import { buildOwnerOrderMessage, getOwnerWhatsAppURL } from '@/lib/whatsapp';
import { getDeliveryPromiseForCoords, getDeliveryPromiseForArea } from '@/lib/deliveryEngine';
import { createRazorpayOrder } from '@/lib/razorpay';

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
    const { address, items, payment_method, notes, coupon_code } = body;

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

    // 4b. Apply coupon if provided
    let discount_amount = 0;
    let coupon_id: string | null = null;
    let applied_coupon_code: string | null = null;

    if (coupon_code) {
      const { data: coupon } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .ilike('code', coupon_code.trim())
        .eq('is_active', true)
        .maybeSingle();

      if (coupon && (!coupon.expires_at || new Date(coupon.expires_at) > new Date())
          && (!coupon.usage_limit || coupon.used_count < coupon.usage_limit)
          && subtotal >= (coupon.min_order_value || 0)) {
        if (coupon.discount_type === 'percent') {
          discount_amount = Math.round((subtotal * coupon.discount_value) / 100);
          if (coupon.max_discount && discount_amount > coupon.max_discount) {
            discount_amount = coupon.max_discount;
          }
        } else {
          discount_amount = Math.min(coupon.discount_value, subtotal);
        }
        coupon_id = coupon.id;
        applied_coupon_code = coupon.code;
      }
    }

    const total = Math.max(0, subtotal + delivery_charge - discount_amount);

    // Real zone-based delivery estimate — same engine the Reserve Order flow
    // uses, so Buy Now orders get an accurate date too instead of the old
    // generic "3-5 Business Days" placeholder.
    let deliveryPromise = null;
    if (address.latitude != null && address.longitude != null) {
      deliveryPromise = await getDeliveryPromiseForCoords(address.latitude, address.longitude);
    }
    if (!deliveryPromise && address.city) {
      deliveryPromise = await getDeliveryPromiseForArea(address.city);
    }
    // Not blocking checkout if the zone can't be auto-resolved — same
    // trust-first principle as the reserve flow.

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
        discount_amount,
        total,
        coupon_id,
        coupon_code: applied_coupon_code,
        payment_method,
        payment_status:   'pending', // set to 'paid' only after signature verification (razorpay) — never here
        status:           'pending',
        // These are READY_STOCK/Buy Now orders — no distributor verification
        // needed, so they skip straight past RESERVED/AVAILABILITY_CHECK.
        // Only Reserve Order (/api/orders/reserve) uses the RESERVED start state.
        fulfillment_status: 'CONFIRMED',
        verification_status: 'verified',
        is_reservation: false,
        delivery_zone_code: deliveryPromise?.zone.zone_code ?? null,
        estimated_delivery_date: deliveryPromise?.estimatedDeliveryDate ?? null,
        notes:            notes || '',
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // 5b. Record coupon usage + increment used_count
    if (coupon_id && order?.id) {
      await Promise.all([
        supabaseAdmin.from('coupon_usages').insert([{
          coupon_id,
          customer_id: session.user.id,
          order_id:    order.id,
        }]),
        supabaseAdmin.rpc('increment_coupon_usage', { coupon_uuid: coupon_id }),
      ]).catch(console.error);
    }

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

    const deliveryAddress = [
      address.full_name,
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.pincode,
      address.google_map_link,
    ].filter(Boolean).join(', ');

    // ── COD: nothing to charge, confirm immediately (unchanged behavior) ──
    if (payment_method === 'cod') {
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

      sendOwnerOrderAlert({
        orderNumber:    order.order_number,
        customerName:   customer.full_name || customer.email,
        customerPhone:  customer.phone || address.phone,
        items:          orderItems,
        total,
        paymentMethod:  payment_method,
        deliveryAddress,
      }).catch(console.error);

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

      return NextResponse.json({
        success:      true,
        order_id:     order.id,
        order_number: order.order_number,
        wa_url:       getOwnerWhatsAppURL(waMessage),
      }, { status: 201 });
    }

    // ── Online payment: create a real Razorpay order for the Checkout.js  ──
    // ── popup. Confirmation notifications are NOT sent yet — the order   ──
    // ── stays payment_status='pending' until /api/checkout/verify-payment ──
    // ── confirms a signature-verified successful payment. This is the    ──
    // ── fix for orders previously being labeled "Paid Online" without    ──
    // ── ever actually being charged.                                     ──
    let razorpayOrder;
    try {
      razorpayOrder = await createRazorpayOrder({ orderId: order.id, amountRupees: total });
    } catch (rzpErr: any) {
      console.error('Razorpay order creation failed:', rzpErr);
      // Order already exists in DB as 'pending' — safe to leave it; the
      // customer sees a clear error and can retry rather than losing the cart.
      return NextResponse.json({
        error: 'Could not start online payment right now. Please try again, or choose Cash on Delivery.',
      }, { status: 502 });
    }

    await supabaseAdmin.from('orders')
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq('id', order.id);

    return NextResponse.json({
      success:      true,
      order_id:     order.id,
      order_number: order.order_number,
      razorpay: {
        order_id: razorpayOrder.id,
        amount:   razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key_id:   process.env.RAZORPAY_KEY_ID, // publishable, safe client-side
      },
    }, { status: 201 });

  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: err.message || 'Checkout failed.' }, { status: 500 });
  }
}