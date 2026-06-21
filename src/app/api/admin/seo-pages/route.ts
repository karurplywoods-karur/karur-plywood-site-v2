// src/app/api/admin/seo-pages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { SEO_PAGE_TYPES } from '@/lib/seo';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  // Use supabaseAdmin (service role) to bypass RLS
  let query = supabaseAdmin
    .from('seo_pages')
    .select(`
      id, status, title, word_count, ai_generated_at, content_version, is_published,
      full_path, slug, page_type,
      seo_areas(id, slug, display_name),
      seo_categories(id, slug, display_name)
    `)
    .eq('page_type', SEO_PAGE_TYPES.PRODUCT_LOCATION)
    .order('id', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pages: data || [] });
}
