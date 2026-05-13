// src/app/api/carpenters/[id]/reviews/route.ts
// Public GET: approved reviews for a specific carpenter
// Public POST: submit a review for a specific carpenter (pending approval)
import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db';

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  // Fetch approved reviews tagged with this carpenter_id
  const { data, error } = await supabase
    .from('reviews')
    .select('id, name, role, rating, message, created_at')
    .eq('approved', true)
    .eq('carpenter_id', params.id)
    .order('created_at', { ascending: false });

  if (error) {
    // If carpenter_id column doesn't exist yet, return empty array gracefully
    console.error('Carpenter reviews GET error:', error.message);
    return NextResponse.json([]);
  }

  return NextResponse.json(data ?? []);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, role, rating, message } = await req.json();

    if (!name || !rating || !message) {
      return NextResponse.json(
        { error: 'Name, rating and message are required.' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('reviews')
      .insert([{
        name:         name.trim(),
        role:         role?.trim() || '',
        rating:       Number(rating),
        message:      message.trim(),
        approved:     false,          // always pending until admin approves
        carpenter_id: params.id,      // links review to this carpenter
      }]);

    if (error) {
      // If carpenter_id column doesn't exist in the reviews table yet, run the migration below
      console.error('Carpenter review POST error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: 'Thank you! Your review will appear after approval.' },
      { status: 201 }
    );
  } catch (err) {
    console.error('Carpenter review POST parse error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUPABASE MIGRATION — run this SQL once in your Supabase SQL Editor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. Add carpenter_id column to reviews table
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS carpenter_id UUID REFERENCES carpenters(id) ON DELETE SET NULL;

-- 2. Index for fast lookup by carpenter
CREATE INDEX IF NOT EXISTS reviews_carpenter_id_idx ON reviews (carpenter_id);

-- 3. RLS: allow anon to read approved carpenter reviews
-- (your existing policy already allows this if approved=true is in the filter)
-- No extra policy needed if your current RLS covers: approved = true

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/
