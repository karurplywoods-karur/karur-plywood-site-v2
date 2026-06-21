import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
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

function buildPatch(body: any) {
  const payload: Record<string, unknown> = {};

  if ('sku' in body) payload.sku = String(body.sku || '').trim();
  if ('slug' in body) payload.slug = body.slug || null;
  if ('thickness' in body) payload.thickness = body.thickness || '';
  if ('size' in body) payload.size = body.size || '';
  if ('grade' in body) payload.grade = body.grade || '';
  if ('finish' in body) payload.finish = body.finish || '';
  if ('color' in body) payload.color = body.color || '';
  if ('pack_size' in body) payload.pack_size = body.pack_size || '';
  if ('attributes' in body) payload.attributes = body.attributes && typeof body.attributes === 'object' ? body.attributes : {};
  if ('price' in body) payload.price = toNullableNumber(body.price);
  if ('mrp' in body) payload.mrp = toNullableNumber(body.mrp);
  if ('stock_quantity' in body) payload.stock_quantity = toInteger(body.stock_quantity);
  if ('stock_status' in body) payload.stock_status = STOCK_STATUSES.has(body.stock_status) ? body.stock_status : 'in_stock';
  if ('is_default' in body) payload.is_default = Boolean(body.is_default);
  if ('sort_order' in body) payload.sort_order = toInteger(body.sort_order);
  if ('seo_title' in body) payload.seo_title = body.seo_title || '';
  if ('seo_description' in body) payload.seo_description = body.seo_description || '';

  return payload;
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; variantId: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const productId = Number(params.id);
  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: 'Invalid product id.' }, { status: 400 });
  }

  const body = await req.json();
  const payload = buildPatch(body);

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: 'No variant fields supplied.' }, { status: 400 });
  }

  if (payload.is_default === true) {
    await supabaseAdmin
      .from('product_variants')
      .update({ is_default: false })
      .eq('product_id', productId)
      .neq('id', params.variantId);
  }

  const { data, error } = await supabaseAdmin
    .from('product_variants')
    .update(payload)
    .eq('id', params.variantId)
    .eq('product_id', productId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; variantId: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const productId = Number(params.id);
  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: 'Invalid product id.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('product_variants')
    .delete()
    .eq('id', params.variantId)
    .eq('product_id', productId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
