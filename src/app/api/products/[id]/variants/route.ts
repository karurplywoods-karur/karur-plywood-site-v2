// src/app/api/products/[id]/variants/route.ts
// REPLACES the existing GET-only file — adds POST (create variant, admin)
// GET remains public (no auth), POST requires admin session via supabaseAdmin

import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

type Ctx = { params: { id: string } };

// ── GET /api/products/[id]/variants  (public) ──────────────────
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', params.id)
    .order('is_default', { ascending: false })
    .order('sort_order',  { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// ── POST /api/products/[id]/variants  (admin) ──────────────────
export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  // Clear other defaults before promoting this one
  if (body.is_default) {
    await supabaseAdmin
      .from('product_variants')
      .update({ is_default: false })
      .eq('product_id', params.id);
  }

  const { data, error } = await supabaseAdmin
    .from('product_variants')
    .insert([{
      product_id:       params.id,
      // If no SKU entered, generate a unique one from product+timestamp
      // After FIX_SKU_AND_PRODUCTS.sql runs, null is also safe
      sku: body.sku?.trim() || `${params.id.slice(-6)}-${Date.now().toString(36)}`,
      slug:             body.slug             || null,
      thickness:        body.thickness        || '',
      size:             body.size             || '',
      grade:            body.grade            || '',
      finish:           body.finish           || '',
      color:            body.color            || '',
      pack_size:        body.pack_size        || '',
      attributes:       body.attributes       || {},
      price:            body.price            != null && body.price !== '' ? Number(body.price) : null,
      mrp:              body.mrp              != null && body.mrp   !== '' ? Number(body.mrp)   : null,
      stock_quantity:   body.stock_quantity   != null ? Number(body.stock_quantity) : 0,
      stock_status:     body.stock_status     || 'in_stock',
      is_default:       body.is_default       ?? false,
      sort_order:       body.sort_order       != null ? Number(body.sort_order) : 0,
      seo_title:        body.seo_title        || '',
      seo_description:  body.seo_description  || '',
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}