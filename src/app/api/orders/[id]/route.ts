import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', params.id)
    .eq('customer_id', session.user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  return NextResponse.json(data);
}
