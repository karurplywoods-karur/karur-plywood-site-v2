// src/app/api/enquiries/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, phone, location, product, message,
      // tracking fields
      tracking_id, source, wa_source,
      product_name, category, quantity, total_value,
    } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('enquiries')
      .insert([{
        name,
        phone,
        location: location || '',
        product: product || '',
        message: message || '',
        status: 'new',
        // tracking
        tracking_id: tracking_id || undefined,
        source: source || 'website',
        wa_source: wa_source || null,
        product_name: product_name || null,
        category: category || null,
        quantity: quantity || null,
        total_value: total_value || null,
      }])
      .select('id, tracking_id')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, id: data.id, tracking_id: data.tracking_id }, { status: 201 });
  } catch (err) {
    console.error('Enquiry POST error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
