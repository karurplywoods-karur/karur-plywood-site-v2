// src/app/api/blog/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get('all');
  const slug = searchParams.get('slug');

  // Single post by slug (public)
  if (slug) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();
    if (error) {
      console.error('Blog GET slug error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    return NextResponse.json(data);
  }

  // Admin: all posts including drafts
  if (all) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('id, title, slug, excerpt, category, published, published_at, read_time, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Blog GET all error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data ?? []);
  }

  // Public: only published posts
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_image, category, tags, published_at, read_time, author')
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Blog GET public error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { title, slug, excerpt, content, cover_image, category, tags, published, author, read_time } = body;

    if (!title?.trim()) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    if (!slug?.trim())  return NextResponse.json({ error: 'Slug is required.' }, { status: 400 });

    const cleanSlug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');

    const payload = {
      title:        title.trim(),
      slug:         cleanSlug,
      excerpt:      excerpt?.trim() || '',
      content:      content?.trim() || '',
      cover_image:  cover_image?.trim() || '',
      category:     category || 'General',
      tags:         Array.isArray(tags) ? tags : [],
      published:    published === true,
      author:       author?.trim() || 'Karur Plywood Team',
      read_time:    Number(read_time) || 5,
      published_at: published === true ? new Date().toISOString() : null,
    };

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Blog POST error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error('Blog POST parse error:', err);
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
}
