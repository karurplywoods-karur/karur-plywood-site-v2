// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, role, rating, message } = await req.json();
    if (!name || !rating || !message) {
      return NextResponse.json({ error: 'Name, rating and message are required.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('reviews')
      .insert([{ name, role: role || '', rating, message, approved: false }]);

    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Thank you! Your review will appear after approval.' }, { status: 201 });
  } catch (err) {
    console.error('Review POST error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const all = url.searchParams.get('all');

  if (all) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // Public: only approved reviews
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
