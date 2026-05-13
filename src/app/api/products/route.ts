// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

// GET /api/products?type=project|quick&category=slug
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const category = searchParams.get('category');
  const all = searchParams.get('all'); // admin only

  if (all) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*, categories(id,name,slug,icon)')
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  let query = supabase
    .from('products')
    .select('*, categories(id,name,slug,icon)')
    .eq('in_stock', true)
    .order('sort_order', { ascending: true });

  if (type) query = query.eq('type', type);

  if (category) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', category).single();
    if (cat) query = query.eq('category_id', cat.id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/products — admin only
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, category_id, description, image_url, type, price, unit, in_stock } = body;

  if (!name || !type) return NextResponse.json({ error: 'Name and type are required.' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert([{ name, category_id: category_id || null, description: description || '', image_url: image_url || '', type, price: price || null, unit: unit || '', in_stock: in_stock ?? true }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
