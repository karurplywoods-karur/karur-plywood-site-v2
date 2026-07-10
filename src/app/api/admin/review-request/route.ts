// src/app/api/admin/review-request/route.ts
// When an enquiry is marked "converted", call this to queue a WhatsApp review request.
// Uses Supabase to track who was already sent a request (no duplicates).
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { CONTACT } from '@/lib/contact';

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { enquiry_id } = await req.json();
  if (!enquiry_id) return NextResponse.json({ error: 'enquiry_id required' }, { status: 400 });

  // Fetch the enquiry
  const { data: enquiry, error } = await supabaseAdmin
    .from('enquiries').select('*').eq('id', enquiry_id).single();
  if (error || !enquiry) return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });

  // Check if review request was already sent
  if (enquiry.review_requested) {
    return NextResponse.json({ error: 'Review request already sent for this customer.' }, { status: 400 });
  }

  // Phone must be a real number
  const phone = (enquiry.phone || '').replace(/\D/g, '');
  if (!phone || phone.length < 10 || phone === 'NA') {
    return NextResponse.json({ error: 'No valid phone number for this enquiry.' }, { status: 400 });
  }

  // Build the WhatsApp review request message
  const customerName = enquiry.name && enquiry.name !== 'WhatsApp Click' ? enquiry.name : 'Customer';
  const message = encodeURIComponent(
    `Hi ${customerName}! 😊\n\nThank you for choosing *Karur Plywood & Company*.\n\nWe hope you are happy with your purchase. It would mean a lot to us if you could leave us a Google review — it helps other customers find us and takes only 30 seconds!\n\n⭐ Leave a review here:\n${CONTACT.googleReviewUrl}\n\nThank you for your support!\n\n_Karur Plywood & Company, Karur_`
  );

  const waURL = `https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${message}`;

  // Mark the enquiry as review_requested so we don't send twice
  await supabaseAdmin
    .from('enquiries')
    .update({ review_requested: true, review_requested_at: new Date().toISOString() })
    .eq('id', enquiry_id);

  return NextResponse.json({ success: true, wa_url: waURL, message: 'Open this URL to send the review request on WhatsApp.' });
}

// GET — fetch all converted enquiries eligible for review request
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabaseAdmin
    .from('enquiries')
    .select('id, name, phone, product_name, created_at, review_requested, review_requested_at')
    .eq('status', 'converted')
    .order('created_at', { ascending: false });

  return NextResponse.json(data ?? []);
}
