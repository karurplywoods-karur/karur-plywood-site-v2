// src/app/api/admin/seo-pages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createBuildClient } from '@/lib/supabase/build';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const supabase = createBuildClient();

  let query = supabase
    .from('seo_pages')
    .select(`
      id, status, title, word_count, ai_generated_at, content_version, is_published,
      full_path, slug, page_type,
      seo_areas(id, slug, display_name),
      seo_categories(id, slug, display_name)
    `)
    .eq('page_type', 'location_category')
    .order('id', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pages: data || [] });
}
