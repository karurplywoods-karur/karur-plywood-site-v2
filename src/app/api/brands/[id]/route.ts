// src/app/api/brands/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

type Ctx = { params: { id: string } };

const ALLOWED = [
  'name', 'slug', 'logo_url', 'description', 'website',
  'seo_title', 'seo_description', 'sort_order', 'is_active',
];

// ── PATCH /api/brands/[id] ─────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  for (const k of ALLOWED) {
    if (!(k in body)) continue;
    if (k === 'sort_order') { updates[k] = Number(body[k]) || 0; continue; }
    if (k === 'is_active')  { updates[k] = Boolean(body[k]);     continue; }
    if (k === 'slug' && body[k]) {
      updates[k] = (body[k] as string).toLowerCase().trim()
        .replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
      continue;
    }
    updates[k] = body[k];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('brands')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A brand with that slug already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// ── DELETE /api/brands/[id] ────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check if any products use this brand
  const { count } = await supabaseAdmin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('brand_id', params.id);  // brand_id is UUID, matches brands.id

  if (count && count > 0) {
    return NextResponse.json(
      { error: `Cannot delete — ${count} product(s) use this brand. Reassign them first.` },
      { status: 409 }
    );
  }

  const { error } = await supabaseAdmin
    .from('brands')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}