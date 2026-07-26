// src/app/api/cron/expire-reservations/route.ts
// Safety-net sweep: expires AWAITING_PAYMENT orders whose payment link has
// passed its expiry, in case the Razorpay `payment_link.expired` webhook is
// delayed or missed. Call this every few minutes from an external scheduler —
// Vercel Hobby cron only supports once/day, so use the paired GitHub Actions
// workflow (.github/workflows/expire-reservations.yml) instead, same pattern
// as your blog generator.
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { sendCustomerFulfillmentWhatsApp } from '@/lib/whatsapp';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const nowIso = new Date().toISOString();

  // Find payment links that are still "created" but past their expiry.
  const { data: staleLinks, error: linksError } = await supabaseAdmin
    .from('payment_links')
    .select('id, order_id, expires_at')
    .eq('status', 'created')
    .lt('expires_at', nowIso);

  if (linksError) {
    console.error('[cron expire-reservations] fetch error:', linksError);
    return NextResponse.json({ error: linksError.message }, { status: 500 });
  }

  if (!staleLinks?.length) {
    return NextResponse.json({ expired: 0 });
  }

  let expiredCount = 0;

  for (const link of staleLinks) {
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('*, customers(full_name, email, phone)')
      .eq('id', link.order_id)
      .single();

    // Only expire orders still genuinely waiting on payment — never touch an
    // order that already got paid via a race with the webhook.
    if (!order || order.fulfillment_status !== 'AWAITING_PAYMENT') continue;

    await supabaseAdmin.from('payment_links').update({ status: 'expired' }).eq('id', link.id);
    await supabaseAdmin.from('orders')
      .update({ fulfillment_status: 'RESERVATION_EXPIRED', reservation_expires_at: null })
      .eq('id', order.id);

    sendCustomerFulfillmentWhatsApp('RESERVATION_EXPIRED', {
      orderNumber: order.order_number,
      customerName: order.customers?.full_name || order.delivery_name,
      customerPhone: order.customers?.phone || order.delivery_phone,
      total: order.total,
    }).catch(console.error);

    expiredCount++;
  }

  return NextResponse.json({ expired: expiredCount, checked: staleLinks.length });
}
