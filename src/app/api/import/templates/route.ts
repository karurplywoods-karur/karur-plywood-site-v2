// src/app/api/import/templates/route.ts
// Downloadable CSV template. Example rows use YOUR real category/brand names.

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const q = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [{ data: cats }, { data: brands }] = await Promise.all([
    supabaseAdmin.from('categories').select('name').order('sort_order').limit(2),
    supabaseAdmin.from('brands').select('name').limit(1),
  ]);
  const cat1 = cats?.[0]?.name || 'Plywood';
  const cat2 = cats?.[1]?.name || cat1;
  const brand = brands?.[0]?.name || '';

  const header = 'product_name,category,brand,description,unit,image_url,thickness,size,grade,finish,color,pack_size,price,mrp,stock_quantity,stock_status';
  const lines = [
    // same product_name on several rows = ONE product with several variants
    [ 'Marine Plywood', cat1, brand, 'ISI certified BWP grade marine plywood', 'per sheet', '', '12mm', '8x4 ft', 'BWP', '', '', '1 sheet', '2200', '2500', '30', 'in_stock' ],
    [ 'Marine Plywood', cat1, '', '', '', '', '19mm', '8x4 ft', 'BWP', '', '', '1 sheet', '3200', '3500', '50', 'in_stock' ],
    [ 'Marine Plywood', cat1, '', '', '', '', '25mm', '8x4 ft', 'BWP', '', '', '1 sheet', '4500', '5000', '5', 'low_stock' ],
    [ 'Soft Close Hinge', cat2, brand, 'Hydraulic soft close hinge', 'per piece', '', '', '', '', '', '', '1 piece', '85', '95', '200', 'in_stock' ],
  ].map(r => r.map(q).join(','));

  // BOM so Excel opens it with the right encoding
  return new NextResponse('\uFEFF' + [header, ...lines].join('\r\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="catalog_import_template.csv"',
    },
  });
}
