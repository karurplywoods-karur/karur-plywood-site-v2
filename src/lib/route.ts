// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { PRODUCT_SELECT } from '@/lib/products';

function toNullableNumber(value: unknown) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

// GET /api/products?type=project&category=slug
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
      .select(PRODUCT_SELECT)
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT)
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
  const { name, category_id, description, image_url, type, price, mrp, unit, in_stock, sort_order } = body;

  if (!name || !type) return NextResponse.json({ error: 'Name and type are required.' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert([{
      name,
      category_id: category_id || null,
      description: description || '',
      image_url: image_url || '',
      type,
      price: toNullableNumber(price),
      mrp: toNullableNumber(mrp),
      unit: unit || '',
      in_stock: in_stock ?? true,
      is_active: in_stock ?? true,   // keep legacy column in sync
      sort_order: toNullableNumber(sort_order) ?? 0,
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({
      error: error.message,
      hint: error.message.toLowerCase().includes('mrp')
        ? 'The products.mrp column is missing or Supabase schema cache has not refreshed. Run supabase_migration_mrp.sql, then reload the admin page.'
        : undefined,
    }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
