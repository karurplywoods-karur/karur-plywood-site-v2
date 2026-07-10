// src/app/api/brands/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

// ── GET /api/brands  (public) ──────────────────────────────────
export async function GET() {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name',       { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// ── POST /api/brands  (admin) ──────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, slug, logo_url, description, website,
          seo_title, seo_description, sort_order, is_active } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Brand name is required.' }, { status: 400 });
  }

  // Auto-generate slug from name if not provided
  const finalSlug = slug?.trim() ||
    name.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const { data, error } = await supabaseAdmin
    .from('brands')
    .insert([{
      name:            name.trim(),
      slug:            finalSlug,
      logo_url:        logo_url     || '',
      description:     description  || '',
      website:         website      || '',
      seo_title:       seo_title    || '',
      seo_description: seo_description || '',
      sort_order:      sort_order   != null ? Number(sort_order) : 0,
      is_active:       is_active    ?? true,
    }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A brand with that slug already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
