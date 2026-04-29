// src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [
    { count: totalEnquiries },
    { count: newEnquiries },
    { count: totalReviews },
    { count: pendingReviews },
    { data: recentEnquiries },
    { data: allEnquiries },
  ] = await Promise.all([
    supabaseAdmin.from('enquiries').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabaseAdmin.from('reviews').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('reviews').select('*', { count: 'exact', head: true }).eq('approved', false),
    supabaseAdmin.from('enquiries').select('*').order('created_at', { ascending: false }).limit(5),
    supabaseAdmin.from('enquiries').select('product'),
  ]);

  // Group by product manually
  const productCounts: Record<string, number> = {};
  (allEnquiries || []).forEach((e: any) => {
    const key = e.product || 'Not specified';
    productCounts[key] = (productCounts[key] || 0) + 1;
  });
  const byProduct = Object.entries(productCounts)
    .map(([product, count]) => ({ product, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    totalEnquiries: totalEnquiries || 0,
    newEnquiries: newEnquiries || 0,
    totalReviews: totalReviews || 0,
    pendingReviews: pendingReviews || 0,
    recentEnquiries: recentEnquiries || [],
    byProduct,
  });
}
