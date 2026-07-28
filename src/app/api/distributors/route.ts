// src/app/api/distributors/route.ts
// Admin-only. Powers the distributor dropdown on /admin/fulfillment and lets
// you maintain your distributor list (own warehouse + external suppliers).
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('distributors')
    .select('*')
    .order('is_own_warehouse', { ascending: false })
    .order('name', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: 'Distributor name is required.' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('distributors')
    .insert([{
      name: body.name,
      contact_person: body.contact_person || '',
      phone: body.phone || '',
      notes: body.notes || '',
      is_own_warehouse: !!body.is_own_warehouse,
      is_active: body.is_active ?? true,
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, ...fields } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const payload: Record<string, unknown> = {};
  for (const key of ['name', 'contact_person', 'phone', 'notes', 'is_own_warehouse', 'is_active']) {
    if (key in fields) payload[key] = fields[key];
  }

  const { data, error } = await supabaseAdmin
    .from('distributors')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
