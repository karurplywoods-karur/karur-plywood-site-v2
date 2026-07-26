// src/app/api/webhooks/razorpay/route.ts
// Razorpay webhook receiver. Configure in Razorpay Dashboard -> Settings ->
// Webhooks: URL = https://www.karurplywood.co.in/api/webhooks/razorpay,
// Active events: payment_link.paid, payment_link.expired, payment_link.cancelled.
// Secret must match RAZORPAY_WEBHOOK_SECRET.
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay';
import { sendCustomerFulfillmentWhatsApp } from '@/lib/whatsapp';

export async function POST(req: NextRequest) {
  // IMPORTANT: signature verification needs the raw, unparsed body.
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    console.error('[razorpay webhook] signature verification failed');
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const event = payload?.event;
  const paymentLinkEntity = payload?.payload?.payment_link?.entity;
  const paymentEntity = payload?.payload?.payment?.entity;

  if (!paymentLinkEntity) {
    // Not a payment-link event we handle — acknowledge so Razorpay stops retrying.
    return NextResponse.json({ received: true });
  }

  const razorpayLinkId = paymentLinkEntity.id;
  const orderId = paymentLinkEntity.reference_id; // we set this to our order.id when creating the link

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*, customers(full_name, email, phone)')
    .eq('id', orderId)
    .single();

  if (!order) {
    console.error(`[razorpay webhook] no matching order for reference_id ${orderId}`);
    return NextResponse.json({ received: true });
  }

  if (event === 'payment_link.paid') {
    // Idempotency: if already marked paid, don't double-process.
    if (order.fulfillment_status === 'PAYMENT_RECEIVED' || order.fulfillment_status === 'PREPARING_ORDER') {
      return NextResponse.json({ received: true, already_processed: true });
    }

    await supabaseAdmin.from('payment_links')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('razorpay_payment_link_id', razorpayLinkId);

    await supabaseAdmin.from('orders')
      .update({
        fulfillment_status: 'PAYMENT_RECEIVED',
        payment_status: 'paid',
        razorpay_payment_id: paymentEntity?.id || '',
        reservation_expires_at: null,
      })
      .eq('id', order.id);

    sendCustomerFulfillmentWhatsApp('PAYMENT_RECEIVED', {
      orderNumber: order.order_number,
      customerName: order.customers?.full_name || order.delivery_name,
      customerPhone: order.customers?.phone || order.delivery_phone,
      total: order.total,
      estimatedDeliveryDate: order.estimated_delivery_date,
    }).catch(console.error);

  } else if (event === 'payment_link.expired' || event === 'payment_link.cancelled') {
    await supabaseAdmin.from('payment_links')
      .update({ status: 'expired' })
      .eq('razorpay_payment_link_id', razorpayLinkId);

    // Only auto-expire the reservation if it's still waiting on this exact link
    // (avoids clobbering an order that was already paid via a race condition).
    if (order.fulfillment_status === 'AWAITING_PAYMENT') {
      await supabaseAdmin.from('orders')
        .update({ fulfillment_status: 'RESERVATION_EXPIRED', reservation_expires_at: null })
        .eq('id', order.id);

      sendCustomerFulfillmentWhatsApp('RESERVATION_EXPIRED', {
        orderNumber: order.order_number,
        customerName: order.customers?.full_name || order.delivery_name,
        customerPhone: order.customers?.phone || order.delivery_phone,
        total: order.total,
      }).catch(console.error);
    }
  }

  return NextResponse.json({ received: true });
}
