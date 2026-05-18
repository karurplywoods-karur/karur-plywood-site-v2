// src/app/api/products/[id]/route.ts
// Returns a single product + associated products (same category + others)
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    .eq('is_active', true)
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
      .eq('is_active', true)
      .eq('categories.id', product.category_id)
      .neq('id', id)
      .order('sort_order', { ascending: true })
      .limit(4),
    supabase
      .from('products')
      .select(`*, categories (id, name, slug, icon)`)
      .eq('is_active', true)
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