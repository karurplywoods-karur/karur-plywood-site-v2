// src/app/api/products/[id]/route.ts
// Returns a single product + associated products (same category + others)
import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Fetch the main product
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (id, name, slug, icon)
    `)
    .eq('id', id)
    .single();

  if (error || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  // Fetch associated products:
  // 1) Same category (up to 4)
  // 2) Other categories (up to 4) — to give a cross-sell feel
  const [sameCatRes, otherRes] = await Promise.all([
    supabase
      .from('products')
      .select(`*, categories (id, name, slug, icon)`)
      .eq('in_stock', true)
      .eq('category_id', product.category_id)
      .neq('id', id)
      .order('sort_order', { ascending: true })
      .limit(4),
    supabase
      .from('products')
      .select(`*, categories (id, name, slug, icon)`)
      .eq('in_stock', true)
      .neq('category_id', product.category_id)
      .neq('id', id)
      .order('sort_order', { ascending: true })
      .limit(4),
  ]);

  return NextResponse.json({
    product,
    associated: {
      sameCategory: sameCatRes.data ?? [],
      otherProducts: otherRes.data ?? [],
    },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const payload = {
    name: body.name,
    category_id: body.category_id || null,
    description: body.description || '',
    image_url: body.image_url || '',
    type: body.type,
    price: body.price ?? null,
    mrp: body.mrp ?? null,
    unit: body.unit || '',
    in_stock: body.in_stock ?? true,
    sort_order: body.sort_order ?? 0,
  };

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', params.id)
    .select('*, categories(id,name,slug,icon)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
