// src/app/api/products/[id]/route.ts
// Returns a single product + associated products (same category + others)
import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { PRODUCT_SELECT } from '@/lib/products';

function toNullableNumber(value: unknown) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Fetch the main product
  const { data: product, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
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
      .select(PRODUCT_SELECT)
      .eq('in_stock', true)
      .eq('category_id', product.category_id)
      .neq('id', id)
      .order('sort_order', { ascending: true })
      .limit(4),
    supabase
      .from('products')
      .select(PRODUCT_SELECT)
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
  const payload: Record<string, unknown> = {};

  if ('name' in body) {
    payload.name = body.name;
    // Update slug when name changes — keeps slug in sync with name
    const baseSlug = (body.name as string)
      .toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80);
    payload.slug = `${baseSlug}-${Date.now().toString(36)}`;
  }
  if ('category_id' in body) payload.category_id = body.category_id || null;
  if ('description' in body) payload.description = body.description || '';
  if ('image_url' in body) payload.image_url = body.image_url || '';
  if ('image_urls' in body) payload.image_urls = Array.isArray(body.image_urls) ? body.image_urls.filter(Boolean) : [];
  if ('type' in body) payload.type = body.type;
  if ('price' in body) payload.price = toNullableNumber(body.price);
  if ('mrp' in body) payload.mrp = toNullableNumber(body.mrp);
  if ('unit' in body) payload.unit = body.unit || '';
  if ('in_stock' in body) {
    payload.in_stock = body.in_stock ?? true;
    payload.is_active = body.in_stock ?? true;  // keep legacy column in sync
  }
  if ('sort_order' in body) payload.sort_order = toNullableNumber(body.sort_order) ?? 0;

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: 'No product fields supplied.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', params.id)
    .select(PRODUCT_SELECT)
    .single();

  if (error) {
    return NextResponse.json({
      error: error.message,
      hint: error.message.toLowerCase().includes('mrp')
        ? 'The products.mrp column is missing or Supabase schema cache has not refreshed. Run supabase_migration_mrp.sql, then reload the admin page.'
        : undefined,
    }, { status: 500 });
  }
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