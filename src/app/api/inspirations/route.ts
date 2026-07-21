// src/app/api/inspirations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const spaceType = searchParams.get('space');

  let query = supabase.from('inspirations').select('*').eq('published', true).order('sort_order', { ascending: true });
  if (spaceType && spaceType !== 'all') query = query.eq('space_type', spaceType);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}
