// src/app/api/carpenters/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  // Public — fetch single verified carpenter with their projects
  const { data, error } = await supabase
    .from('carpenters')
    .select('*, carpenter_projects(*)')
    .eq('id', params.id)
    .eq('verified', true)
    .maybeSingle();

  // If not found as verified, try without verified filter for admin preview
  if (!data && !error) {
    return NextResponse.json({ error: 'Carpenter not found' }, { status: 404 });
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { error } = await supabaseAdmin
    .from('carpenters').update(body).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { error } = await supabaseAdmin
    .from('carpenters').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
