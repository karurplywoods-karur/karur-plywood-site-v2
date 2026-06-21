import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

const STOCK_STATUSES = new Set(['in_stock', 'low_stock', 'out_of_stock', 'made_to_order']);

function toNullableNumber(value: unknown) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toInteger(value: unknown, fallback = 0) {
  if (value === '' || value === null || value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : fallback;
}

function variantPayload(body: any, productId: string) {
  const stockStatus = STOCK_STATUSES.has(body.stock_status) ? body.stock_status : 'in_stock';
  const sku = String(body.sku || '').trim();
  const fallbackSku = [
    productId,
    body.thickness,
    body.size,
    body.grade,
    body.finish,
    body.color,
    body.pack_size,
  ].filter(Boolean).join('-').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return {
    product_id: Number(productId),
    sku: sku || fallbackSku || `${productId}-standard`,
    slug: body.slug || null,
    thickness: body.thickness || '',
    size: body.size || '',
    grade: body.grade || '',
    finish: body.finish || '',
    color: body.color || '',
    pack_size: body.pack_size || '',
    attributes: body.attributes && typeof body.attributes === 'object' ? body.attributes : {},
    price: toNullableNumber(body.price),
    mrp: toNullableNumber(body.mrp),
    stock_quantity: toInteger(body.stock_quantity),
    stock_status: stockStatus,
    is_default: Boolean(body.is_default),
    sort_order: toInteger(body.sort_order),
    seo_title: body.seo_title || '',
    seo_description: body.seo_description || '',
  };
}

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

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const productId = Number(params.id);
  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: 'Invalid product id.' }, { status: 400 });
  }

  const body = await req.json();
  const payload = variantPayload(body, params.id);

  if (payload.is_default) {
    await supabaseAdmin
      .from('product_variants')
      .update({ is_default: false })
      .eq('product_id', productId);
  }

  const { data, error } = await supabaseAdmin
    .from('product_variants')
    .insert([payload])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
