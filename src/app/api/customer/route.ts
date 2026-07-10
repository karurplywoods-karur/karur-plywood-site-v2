// src/app/api/customer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/db';

async function ensureCustomerExists(userId: string, user: any) {
  const { data: existing } = await supabaseAdmin
    .from('customers').select('id').eq('id', userId).single();
  if (existing) return;
  await supabaseAdmin.from('customers').insert([{
    id:         userId,
    full_name:  user.user_metadata?.full_name || user.user_metadata?.name || '',
    email:      user.email || '',
    avatar_url: user.user_metadata?.avatar_url || '',
    phone:      '',
  }]);
}

export async function GET() {
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await ensureCustomerExists(session.user.id, session.user);

  const { data, error } = await supabaseAdmin
    .from('customers').select('*').eq('id', session.user.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { full_name, phone } = await req.json();
  const { error } = await supabaseAdmin
    .from('customers').update({ full_name, phone }).eq('id', session.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
