// src/app/api/admin/seo-data/route.ts
import { NextResponse } from 'next/server';
import { createBuildClient } from '@/lib/supabase/build';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createBuildClient();

  const [{ data: areas }, { data: categories }] = await Promise.all([
    supabase.from('seo_areas').select('id, slug, display_name').order('priority'),
    supabase.from('seo_categories').select('id, slug, display_name').order('id'),
  ]);

  return NextResponse.json({ areas: areas || [], categories: categories || [] });
}

