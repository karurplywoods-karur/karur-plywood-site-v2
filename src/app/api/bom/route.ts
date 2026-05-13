// src/app/api/bom/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

const BUCKET = 'bom-images';
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

// ── PUBLIC: submit BOM ────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const name     = (form.get('name')     as string | null)?.trim() || '';
    const phone    = (form.get('phone')    as string | null)?.trim() || '';
    const location = (form.get('location') as string | null)?.trim() || '';
    const notes    = (form.get('notes')    as string | null)?.trim() || '';
    const file     = form.get('image')     as File | null;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required.' }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: 'Image is required.' }, { status: 400 });
    }

    // Validate file
    const mimeType = file.type || 'image/jpeg';
    if (!ALLOWED_TYPES.includes(mimeType) && !mimeType.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed (JPG, PNG, WebP).' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Image too large. Max 10 MB.' }, { status: 400 });
    }

    // Upload to Supabase Storage
    const ext       = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const path      = `bom-images/${Date.now()}-${cleanName}`;

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: mimeType, upsert: false });

    if (uploadError) {
      console.error('BOM upload error:', uploadError);
      return NextResponse.json({ error: 'Image upload failed. Please try again.' }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(uploadData.path);

    // Save to database
    const { data, error: dbError } = await supabaseAdmin
      .from('bom_requests')
      .insert([{
        name,
        phone,
        location,
        notes,
        image_url:  urlData.publicUrl,
        image_path: uploadData.path,
        status:     'pending',
        notified:   false,
      }])
      .select('id')
      .single();

    if (dbError) {
      console.error('BOM DB error:', dbError);
      return NextResponse.json({ error: 'Failed to save your request. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (err: any) {
    console.error('BOM POST error:', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}

// ── ADMIN: fetch all BOMs ─────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const newOnly = searchParams.get('new'); // for push-notification polling

  let query = supabaseAdmin
    .from('bom_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  // Polling endpoint: return only un-notified pending BOMs, then mark them notified
  if (newOnly === '1') {
    const { data, error } = await supabaseAdmin
      .from('bom_requests')
      .select('id, name, phone, created_at')
      .eq('status', 'pending')
      .eq('notified', false)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Mark as notified
    if (data && data.length > 0) {
      const ids = data.map((r: any) => r.id);
      await supabaseAdmin
        .from('bom_requests')
        .update({ notified: true })
        .in('id', ids);
    }

    return NextResponse.json(data ?? []);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
