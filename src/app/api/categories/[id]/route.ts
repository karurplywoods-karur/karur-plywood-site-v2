// src/app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

type Ctx = { params: { id: string } };

const ALLOWED = [
  'name', 'slug', 'display_name', 'icon', 'description', 'parent_id',
  'image_url', 'seo_title', 'seo_description', 'sort_order', 'is_active',
  'base_price', 'price_unit',
];

// ── PATCH /api/categories/[id] ─────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  for (const k of ALLOWED) {
    if (!(k in body)) continue;
    if (k === 'sort_order' || k === 'base_price') {
      updates[k] = body[k] != null && body[k] !== '' ? Number(body[k]) : null;
      continue;
    }
    if (k === 'is_active') { updates[k] = Boolean(body[k]); continue; }
    if (k === 'parent_id') { updates[k] = body[k] || null;  continue; }
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

  // Prevent circular parent reference
  if (updates.parent_id && String(updates.parent_id) === params.id) {
    return NextResponse.json({ error: 'A category cannot be its own parent.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('categories')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A category with that slug already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// ── DELETE /api/categories/[id] ────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Block if products use this category
  const { count: productCount } = await supabaseAdmin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', params.id);

  if (productCount && productCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete — ${productCount} product(s) use this category. Reassign them first.` },
      { status: 409 }
    );
  }

  // Block if sub-categories exist
  const { count: childCount } = await supabaseAdmin
    .from('categories')
    .select('id', { count: 'exact', head: true })
    .eq('parent_id', params.id);

  if (childCount && childCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete — ${childCount} sub-category/ies exist. Delete them first.` },
      { status: 409 }
    );
  }

  const { error } = await supabaseAdmin
    .from('categories')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
