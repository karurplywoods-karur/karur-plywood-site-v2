// src/app/api/carpenters/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const area = searchParams.get('area');
  const all  = searchParams.get('all'); // admin only

  if (all) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { data, error } = await supabaseAdmin
      .from('carpenters').select('*').order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  let query = supabase
    .from('carpenters')
    .select('*')
    .eq('verified', true)
    .order('rating', { ascending: false });

  if (area) query = query.eq('area', area);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// Public application to join directory
export async function POST(req: NextRequest) {
  try {
    const { name, phone, area, speciality, experience, bio, wa_number } = await req.json();
    if (!name || !phone || !area) {
      return NextResponse.json({ error: 'Name, phone and area are required.' }, { status: 400 });
    }
    const { error } = await supabaseAdmin
      .from('carpenters')
      .insert([{ name, phone, area, speciality: speciality || [], experience: experience || 1, bio: bio || '', wa_number: wa_number || '', verified: false }]);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, message: 'Application received! We will verify and add you within 24 hours.' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
