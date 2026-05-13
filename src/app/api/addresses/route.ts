import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/db';

export async function GET() {
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('addresses').select('*').eq('customer_id', session.user.id)
    .order('is_default', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { label, full_name, phone, line1, line2, city, state, pincode, is_default } = body;
  if (!full_name || !phone || !line1 || !city || !pincode)
    return NextResponse.json({ error: 'Required fields missing.' }, { status: 400 });

  if (is_default)
    await supabaseAdmin.from('addresses').update({ is_default: false }).eq('customer_id', session.user.id);

  const { data, error } = await supabaseAdmin.from('addresses')
    .insert([{ customer_id: session.user.id, label: label || 'Home', full_name, phone, line1, line2: line2 || '', city, state: state || 'Tamil Nadu', pincode, is_default: is_default ?? false }])
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
