// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

// ── GET /api/categories  (public) ─────────────────────────────
export async function GET() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name',       { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// ── POST /api/categories  (admin) ──────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    name, slug, icon, display_name, description, parent_id,
    image_url, seo_title, seo_description, sort_order, is_active,
    base_price, price_unit,
  } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
  }

  const finalSlug = slug?.trim() ||
    name.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert([{
      name:            name.trim(),
      slug:            finalSlug,
      display_name:    display_name    || name.trim(),
      icon:            icon            || '📦',
      description:     description     || '',
      parent_id:       parent_id       || null,
      image_url:       image_url       || '',
      seo_title:       seo_title       || '',
      seo_description: seo_description || '',
      sort_order:      sort_order      != null ? Number(sort_order) : 0,
      is_active:       is_active       ?? true,
      base_price:      base_price      != null ? Number(base_price) : null,
      price_unit:      price_unit      || 'per sheet',
    }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A category with that slug already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
