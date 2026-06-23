// src/app/api/products/[id]/variants/[variantId]/route.ts
// This file is COMPLETELY MISSING from the repo — Codex did not create it.
// VariantManager.tsx calls PATCH and DELETE on this URL for edit/delete/set-default.
// Without this file, those buttons 404 silently.

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

type Ctx = { params: { id: string; variantId: string } };

const ALLOWED = [
  'sku', 'slug', 'thickness', 'size', 'grade', 'finish', 'color', 'pack_size',
  'attributes', 'price', 'mrp', 'stock_quantity', 'stock_status',
  'is_default', 'sort_order', 'seo_title', 'seo_description',
];
const NUMERIC = ['price', 'mrp', 'stock_quantity', 'sort_order'];

// ── PATCH /api/products/[id]/variants/[variantId]  (admin) ─────
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  // Promoting to default clears other variants first
  if (body.is_default) {
    await supabaseAdmin
      .from('product_variants')
      .update({ is_default: false })
      .eq('product_id', params.id);
  }

  const updates: Record<string, unknown> = {};
  for (const k of ALLOWED) {
    if (k in body) {
      updates[k] = NUMERIC.includes(k)
        ? (body[k] !== '' && body[k] != null ? Number(body[k]) : null)
        : body[k];
    }
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('product_variants')
    .update(updates)
    .eq('id', params.variantId)
    .eq('product_id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// ── DELETE /api/products/[id]/variants/[variantId]  (admin) ────
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabaseAdmin
    .from('product_variants')
    .delete()
    .eq('id', params.variantId)
    .eq('product_id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
