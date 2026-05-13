// src/app/api/orders/route.ts — customer order history
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/db';

export async function GET() {
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`*, order_items(*)`)
    .eq('customer_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
