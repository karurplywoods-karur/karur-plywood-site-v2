// src/app/api/orders/admin/delivery/route.ts
// Customer-care updates for the "delivery charges are extra" workflow.
// PATCH { id, action?: 'enable', ...delivery fields }
// All rules live in lib/deliveryWorkflow.ts (unit-tested). This route never touches
// payment columns (payment_status, razorpay_*, total, subtotal) — product payment
// and the transport charge stay completely separate.

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { validateDeliveryUpdate, type DeliveryUpdate } from '@/lib/deliveryWorkflow';

export const dynamic = 'force-dynamic';

const TEXT_FIELDS = ['delivery_status', 'transport_type', 'transporter_name', 'transporter_phone',
  'customer_approval_status', 'delivery_payment_status', 'delivery_payment_note', 'care_remarks'] as const;
const NUMBER_FIELDS = ['actual_transport_cost', 'delivery_charge_quoted'] as const;

const MIGRATION_HINT = 'Delivery columns are missing in the database — run supabase/migrations/20261128_delivery_workflow.sql in the Supabase SQL Editor.';

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { id, action } = body;
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const { data: current, error: readErr } = await supabaseAdmin.from('orders').select('*').eq('id', id).single();
  if (readErr || !current) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  if (!('delivery_status' in current)) return NextResponse.json({ error: MIGRATION_HINT }, { status: 500 });

  const updatedBy = (session as any).email || (session as any).username || 'admin';

  // ── Enable the workflow on an older order ──────────────────────────────
  if (action === 'enable') {
    if (current.delivery_status) return NextResponse.json({ error: 'Delivery workflow is already enabled for this order.' }, { status: 400 });
    if (current.shipping_method === 'pickup') return NextResponse.json({ error: 'Store-pickup orders have no delivery workflow.' }, { status: 400 });
    if (['shipped', 'delivered'].includes(current.status) || ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(current.fulfillment_status)) {
      return NextResponse.json({ error: 'This order has already been dispatched.' }, { status: 400 });
    }
    const { error } = await supabaseAdmin.from('orders').update({
      delivery_status: 'Pending Confirmation',
      customer_approval_status: 'Pending',
      delivery_payment_status: 'Pay on delivery',
      delivery_updated_by: updatedBy,
    }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // ── Normal update ──────────────────────────────────────────────────────
  const update: Record<string, any> = {};
  for (const k of TEXT_FIELDS) if (body[k] !== undefined) update[k] = String(body[k] ?? '').trim();
  for (const k of NUMBER_FIELDS) {
    if (body[k] === undefined) continue;
    update[k] = body[k] === '' || body[k] === null ? null : Number(body[k]);
  }
  if (body.expected_delivery_date !== undefined) update.expected_delivery_date = body.expected_delivery_date || null;
  // empty status strings mean "unchanged"
  if (update.delivery_status === '') delete update.delivery_status;
  if (update.customer_approval_status === '') delete update.customer_approval_status;
  if (update.delivery_payment_status === '') delete update.delivery_payment_status;

  const result = validateDeliveryUpdate(current, update as DeliveryUpdate);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  const { error } = await supabaseAdmin.from('orders')
    .update({ ...result.patch, delivery_updated_by: updatedBy })
    .eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
