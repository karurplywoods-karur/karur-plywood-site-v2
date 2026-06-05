import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', params.id)
    .order('is_default', { ascending: false })
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
