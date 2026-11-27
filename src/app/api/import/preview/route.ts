// src/app/api/import/preview/route.ts
// GET  -> valid category / brand names (shown in the import screen)
// POST -> multipart { file: CSV }  → validates the sheet, writes NOTHING.

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { buildCatalog, loadCtx, MAX_ROWS, parseCsv, toRecords } from '@/lib/catalogImport';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const ctx = await loadCtx();
    return NextResponse.json({
      categories: ctx.categories.map(c => c.name),
      brands: ctx.brands.map(b => b.name),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({ error: 'Please upload a .csv file (in Excel: Save As → CSV).' }, { status: 400 });
    }

    const { records, missingHeaders } = toRecords(parseCsv(await file.text()));
    if (missingHeaders.length) {
      return NextResponse.json({
        error: `Missing column(s): ${missingHeaders.join(', ')}. Download the template and keep its header row.`,
      }, { status: 400 });
    }
    if (!records.length) return NextResponse.json({ error: 'The file has no data rows.' }, { status: 400 });
    if (records.length > MAX_ROWS) {
      return NextResponse.json({ error: `Too many rows (${records.length}). Maximum is ${MAX_ROWS} per upload.` }, { status: 400 });
    }

    const ctx = await loadCtx();
    const createMissing = form.get('create_missing') === '1';
    const { groups, reports, newCategories, newBrands } = buildCatalog(records, ctx, { createMissing });

    return NextResponse.json({
      total: reports.length,
      valid: reports.filter(r => r.status === 'valid').length,
      duplicates: reports.filter(r => r.status === 'duplicate').length,
      errors: reports.filter(r => r.status === 'error').length,
      new_products: groups.filter(g => g.existing_id == null).length,
      existing_products: groups.filter(g => g.existing_id != null).length,
      new_categories: newCategories,
      new_brands: newBrands,
      rows: reports,
    });
  } catch (e: any) {
    console.error('Import preview error:', e);
    return NextResponse.json({ error: e.message || 'Preview failed.' }, { status: 500 });
  }
}
