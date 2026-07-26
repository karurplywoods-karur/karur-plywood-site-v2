import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { sendStatusUpdate } from '@/lib/email';
import { sendCustomerWhatsAppStatus, sendCustomerFulfillmentWhatsApp } from '@/lib/whatsapp';

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

  const { id, status, fulfillment_status, admin_notes, tracking_number, assigned_staff_name, note } = await req.json();
  if (!id || (status === undefined && fulfillment_status === undefined && admin_notes === undefined && tracking_number === undefined && assigned_staff_name === undefined)) {
    return NextResponse.json({ error: 'id and at least one field to update are required' }, { status: 400 });
  }

  const updates: any = {};
  if (status) updates.status = status;
  if (fulfillment_status) updates.fulfillment_status = fulfillment_status;
  if (fulfillment_status === 'PAYMENT_RECEIVED') updates.payment_status = 'paid';
  if (admin_notes !== undefined) updates.admin_notes = admin_notes;
  if (tracking_number !== undefined) updates.tracking_number = tracking_number;
  if (assigned_staff_name !== undefined) updates.assigned_staff_name = assigned_staff_name;

  const { error } = await supabaseAdmin.from('orders').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('order_number, total, payment_method, estimated_delivery_date, delivery_phone, delivery_name, customers(full_name, email, phone)')
    .eq('id', id)
    .single();

  if (order?.customers) {
    const c = order.customers as any;

    if (status) {
      // Legacy status pipeline (READY_STOCK / Buy Now orders)
      sendStatusUpdate({
        customerName:  c.full_name || c.email,
        customerEmail: c.email,
        orderNumber:   order.order_number,
        status,
      }).catch(console.error);

      if (c.phone) {
        sendCustomerWhatsAppStatus(status, {
          orderNumber:    order.order_number,
          customerName:   c.full_name || 'Customer',
          customerPhone:  c.phone,
          total:          order.total || 0,
          paymentMethod:  order.payment_method || 'cod',
          trackingNumber: tracking_number,
          adminNotes:     admin_notes,
        }).catch(console.error);
      }
    }

    if (fulfillment_status) {
      // Reserve Order pipeline (Prepare/Dispatch/Deliver/Cancel/Mark Paid)
      sendCustomerFulfillmentWhatsApp(fulfillment_status, {
        orderNumber: order.order_number,
        customerName: c.full_name || order.delivery_name,
        customerPhone: c.phone || order.delivery_phone,
        total: order.total || 0,
        estimatedDeliveryDate: order.estimated_delivery_date,
        note,
      }).catch(console.error);
    }
  }

  return NextResponse.json({ success: true });
}