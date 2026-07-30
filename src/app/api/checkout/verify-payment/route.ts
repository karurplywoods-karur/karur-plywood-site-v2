// src/app/api/checkout/verify-payment/route.ts
// Called by the browser after Razorpay Checkout.js reports success. The
// client-side callback is NOT trustworthy on its own — this verifies the
// HMAC signature server-side before marking anything paid, then sends the
// confirmation notifications that /api/checkout deferred for online payments.
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/db';
import { verifyRazorpayCheckoutSignature } from '@/lib/razorpay';
import { sendOrderConfirmation, sendOwnerOrderAlert } from '@/lib/email';
import { buildOwnerOrderMessage, getOwnerWhatsAppURL } from '@/lib/whatsapp';

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Please login.' }, { status: 401 });

    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment verification fields.' }, { status: 400 });
    }

    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*), customers(full_name, email, phone)')
      .eq('id', order_id)
      .eq('customer_id', session.user.id) // can only verify your own order
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Idempotency — if a retry/double-fire happens, don't re-send notifications.
    if (order.payment_status === 'paid') {
      return NextResponse.json({ success: true, order_number: order.order_number, already_processed: true });
    }

    if (order.razorpay_order_id !== razorpay_order_id) {
      return NextResponse.json({ error: 'Order/payment mismatch.' }, { status: 400 });
    }

    const isValid = verifyRazorpayCheckoutSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      console.error(`Signature verification FAILED for order ${order.order_number}`);
      return NextResponse.json({ error: 'Payment verification failed. Please contact support before retrying.' }, { status: 400 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ payment_status: 'paid', razorpay_payment_id })
      .eq('id', order_id);
    if (updateError) throw updateError;

    // Now — and only now — send the confirmation notifications that
    // /api/checkout deferred when the order was first created.
    const customer = order.customers as any;
    const deliveryAddress = [
      order.delivery_name, order.delivery_line1, order.delivery_line2,
      order.delivery_city, order.delivery_state, order.delivery_pincode, order.delivery_google_map_link,
    ].filter(Boolean).join(', ');

    sendOrderConfirmation({
      customerName:    customer?.full_name || customer?.email,
      customerEmail:   customer?.email,
      orderNumber:     order.order_number,
      items:           order.order_items,
      subtotal:        order.subtotal,
      deliveryCharge:  order.delivery_charge,
      total:           order.total,
      paymentMethod:   'razorpay',
      deliveryAddress,
    }).catch(console.error);

    sendOwnerOrderAlert({
      orderNumber:    order.order_number,
      customerName:   customer?.full_name || customer?.email,
      customerPhone:  customer?.phone || order.delivery_phone,
      items:          order.order_items,
      total:          order.total,
      paymentMethod:  'razorpay (paid)',
      deliveryAddress,
    }).catch(console.error);

    const waMessage = buildOwnerOrderMessage({
      orderNumber:     order.order_number,
      customerName:    customer?.full_name || customer?.email,
      customerPhone:   customer?.phone || order.delivery_phone,
      items:           order.order_items,
      total:           order.total,
      paymentMethod:   'razorpay (paid)',
      deliveryCity:    order.delivery_city,
      deliveryPincode: order.delivery_pincode,
    });

    return NextResponse.json({
      success: true,
      order_number: order.order_number,
      wa_url: getOwnerWhatsAppURL(waMessage),
    });

  } catch (err: any) {
    console.error('Payment verification error:', err);
    return NextResponse.json({ error: err.message || 'Payment verification failed.' }, { status: 500 });
  }
}
