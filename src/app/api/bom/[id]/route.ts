// src/app/api/bom/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { status } = body;

  const validStatuses = ['pending', 'quoted', 'converted', 'rejected'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }

  const updates: Record<string, any> = { status };
  if (status === 'quoted')    updates.quoted_at    = new Date().toISOString();
  if (status === 'converted') updates.converted_at = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from('bom_requests')
    .update(updates)
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Fetch image_path before deleting
  const { data: bom } = await supabaseAdmin
    .from('bom_requests')
    .select('image_path')
    .eq('id', params.id)
    .single();

  // Delete from storage if path exists
  if (bom?.image_path) {
    await supabaseAdmin.storage
      .from('bom-images')
      .remove([bom.image_path]);
  }

  const { error } = await supabaseAdmin
    .from('bom_requests')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
