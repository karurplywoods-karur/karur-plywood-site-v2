// src/app/api/orders/track/route.ts
// Public endpoint — no auth required.
// Looks up order by order_number + last 4 digits of delivery phone.
// Returns safe subset of order data (no customer PII beyond what they entered).

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get('ref')?.trim().toUpperCase();
  const phone4      = searchParams.get('phone')?.trim().replace(/\D/g, '').slice(-4);

  if (!orderNumber) {
    return NextResponse.json({ error: 'Order number is required.' }, { status: 400 });
  }
  if (!phone4 || phone4.length < 4) {
    return NextResponse.json({ error: 'Last 4 digits of your phone number are required.' }, { status: 400 });
  }

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select(`
      id, order_number, status, created_at, updated_at,
      subtotal, discount_amount, delivery_charge, total,
      coupon_code, payment_method, payment_status,
      delivery_name, delivery_city, delivery_pincode,
      tracking_number, admin_notes,
      fulfillment_status, verification_status, is_reservation,
      delivery_zone_code, estimated_delivery_date, reservation_expires_at,
      order_items (
        product_name, variant_label, quantity, unit_price, line_total
      )
    `)
    .eq('order_number', orderNumber)
    .maybeSingle();

  if (error) {
    console.error('[track]', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }

  if (!order) {
    return NextResponse.json({ error: 'Order not found. Please check the order number.' }, { status: 404 });
  }

  // Verify phone — compare last 4 digits of delivery_phone stored on order
  const { data: full } = await supabaseAdmin
    .from('orders')
    .select('delivery_phone')
    .eq('id', order.id)
    .single();

  const storedPhone4 = (full?.delivery_phone || '').replace(/\D/g, '').slice(-4);
  if (storedPhone4 !== phone4) {
    return NextResponse.json({ error: 'Phone number does not match this order.' }, { status: 401 });
  }

  return NextResponse.json(order);
}
