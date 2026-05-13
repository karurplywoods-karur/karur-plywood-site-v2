import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/db';

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabaseAdmin.from('addresses').delete()
    .eq('id', params.id).eq('customer_id', session.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (body.is_default)
    await supabaseAdmin.from('addresses').update({ is_default: false }).eq('customer_id', session.user.id);

  const { error } = await supabaseAdmin.from('addresses').update(body)
    .eq('id', params.id).eq('customer_id', session.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
