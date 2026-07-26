// src/app/api/orders/[id]/verify/route.ts
// Admin action: verify stock availability for a RESERVED order.
// This is the only place that moves a reservation to CONFIRMED (payment can
// then be requested) or to UNAVAILABLE (never charged).
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { sendCustomerFulfillmentWhatsApp } from '@/lib/whatsapp';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { action, note, verified_by } = body as {
      action: 'confirm' | 'unavailable';
      note?: string;
      verified_by?: string;
    };

    if (!['confirm', 'unavailable'].includes(action)) {
      return NextResponse.json({ error: 'action must be "confirm" or "unavailable".' }, { status: 400 });
    }

    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*, customers(full_name, email, phone)')
      .eq('id', params.id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (order.fulfillment_status !== 'RESERVED' && order.fulfillment_status !== 'AVAILABILITY_CHECK') {
      return NextResponse.json(
        { error: `Order is already ${order.fulfillment_status} — cannot re-verify.` },
        { status: 409 }
      );
    }

    const nextStatus = action === 'confirm' ? 'CONFIRMED' : 'UNAVAILABLE';
    const verificationStatus = action === 'confirm' ? 'verified' : 'unavailable';

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        fulfillment_status: nextStatus,
        verification_status: verificationStatus,
        verified_by: verified_by || 'admin',
        verified_at: new Date().toISOString(),
        admin_notes: note ? `${order.admin_notes ? order.admin_notes + ' | ' : ''}${note}` : order.admin_notes,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Notify customer — trust-first copy per spec, no payment request bundled here.
    const customerName = order.customers?.full_name || order.customers?.email || order.delivery_name;
    const customerPhone = order.customers?.phone || order.delivery_phone;

    sendCustomerFulfillmentWhatsApp(nextStatus, {
      orderNumber: order.order_number,
      customerName,
      customerPhone,
      total: order.total,
      estimatedDeliveryDate: order.estimated_delivery_date,
      note,
    }).catch(console.error);

    return NextResponse.json({ success: true, order: updated });

  } catch (err: any) {
    console.error('Order verify error:', err);
    return NextResponse.json({ error: err.message || 'Verification failed.' }, { status: 500 });
  }
}
