// src/app/api/admin/coupons/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

async function checkAdmin() {
  const session = await getAdminSession();
  if (!session) return null;
  return session;
}

export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { code, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, expires_at } = body;
  if (!code || !discount_value || !discount_type) {
    return NextResponse.json({ error: 'code, discount_type and discount_value are required.' }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin
    .from('coupons')
    .insert([{ code: code.toUpperCase(), description, discount_type, discount_value, min_order_value: min_order_value || 0, max_discount: max_discount || null, usage_limit: usage_limit || null, expires_at: expires_at || null }])
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const { error } = await supabaseAdmin.from('coupons').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
