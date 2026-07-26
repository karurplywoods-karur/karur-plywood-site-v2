// src/app/api/orders/[id]/payment-link/route.ts
// Admin action: generate a Razorpay payment link for a CONFIRMED order.
// Payment is only ever requested from this point forward — never earlier.
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { createRazorpayPaymentLink } from '@/lib/razorpay';
import { getDeliverySettings } from '@/lib/deliveryEngine';
import { sendCustomerFulfillmentWhatsApp } from '@/lib/whatsapp';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.karurplywood.co.in';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*, customers(full_name, email, phone)')
      .eq('id', params.id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (order.fulfillment_status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: `Order must be CONFIRMED before generating a payment link (currently ${order.fulfillment_status}).` },
        { status: 409 }
      );
    }

    const settings = await getDeliverySettings(true);
    const customerName = order.customers?.full_name || order.delivery_name;
    const customerPhone = order.customers?.phone || order.delivery_phone;
    const customerEmail = order.customers?.email;

    const link = await createRazorpayPaymentLink({
      orderId: order.id,
      orderNumber: order.order_number,
      amountRupees: order.total,
      customerName,
      customerPhone,
      customerEmail,
      expiryMinutes: settings.payment_link_expiry_minutes,
      callbackUrl: `${SITE_URL}/orders/${order.id}?payment=complete`,
    });

    const expiresAt = new Date(link.expire_by * 1000).toISOString();

    const { error: linkInsertError } = await supabaseAdmin.from('payment_links').insert([{
      order_id: order.id,
      razorpay_payment_link_id: link.id,
      short_url: link.short_url,
      amount: order.total,
      status: 'created',
      expires_at: expiresAt,
    }]);
    if (linkInsertError) throw linkInsertError;

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        fulfillment_status: 'AWAITING_PAYMENT',
        reservation_expires_at: expiresAt,
        razorpay_order_id: link.id, // reuse existing column for the payment-link id
      })
      .eq('id', order.id)
      .select()
      .single();
    if (updateError) throw updateError;

    sendCustomerFulfillmentWhatsApp('AWAITING_PAYMENT', {
      orderNumber: order.order_number,
      customerName,
      customerPhone,
      total: order.total,
      estimatedDeliveryDate: order.estimated_delivery_date,
      paymentLinkUrl: link.short_url,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      payment_link: { short_url: link.short_url, expires_at: expiresAt },
    });

  } catch (err: any) {
    console.error('Payment link generation error:', err);
    return NextResponse.json({ error: err.message || 'Payment link generation failed.' }, { status: 500 });
  }
}
