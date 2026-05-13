import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { sendStatusUpdate } from '@/lib/email';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  let query = supabaseAdmin
    .from('orders')
    .select('*, order_items(*), customers(full_name, email, phone)')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, status, admin_notes, tracking_number } = await req.json();
  if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 });

  const updates: any = { status };
  if (admin_notes !== undefined) updates.admin_notes = admin_notes;
  if (tracking_number !== undefined) updates.tracking_number = tracking_number;

  const { error } = await supabaseAdmin.from('orders').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('order_number, customers(full_name, email)')
    .eq('id', id)
    .single();

  if (order?.customers) {
    const c = order.customers as any;
    sendStatusUpdate({
      customerName: c.full_name || c.email,
      customerEmail: c.email,
      orderNumber: order.order_number,
      status,
    }).catch(console.error);
  }

  return NextResponse.json({ success: true });
}
