// src/app/api/architects/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const isUUID = /^[0-9a-f-]{36}$/.test(params.id);
  let query = supabase.from('architects').select('*, architect_projects(*)').eq('verified', true);
  query = isUUID ? query.eq('id', params.id) : query.eq('slug', params.id);
  const { data, error } = await query.maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { error } = await supabaseAdmin.from('architects').update(body).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { error } = await supabaseAdmin.from('architects').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
