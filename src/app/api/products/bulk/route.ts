// src/app/api/products/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

interface BulkRow {
  name: string;
  category_id?: string;
  description?: string;
  image_url?: string;
  type: 'project' | 'quick';
  price?: number | null;
  unit?: string;
  in_stock?: boolean;
}

// GET /api/products/bulk — returns CSV template
export async function GET() {
  const template = [
    'name,type,category_name,description,price,unit,image_url,in_stock',
    'BWR Grade Plywood 18mm,project,Plywood,Boiling Water Resistant plywood for kitchens and bathrooms,2800,per sheet,https://example.com/image.jpg,true',
    'Fevicol SH 1kg,quick,Adhesives,Premium synthetic resin adhesive,180,per kg,,true',
  ].join('\n');

  return new NextResponse(template, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="products-template.csv"',
    },
  });
}

// POST /api/products/bulk — upload CSV
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    if (!file.name.endsWith('.csv')) return NextResponse.json({ error: 'Only .csv files are accepted.' }, { status: 400 });
    if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: 'File too large. Max 2MB.' }, { status: 400 });

    const text = await file.text();
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    if (lines.length < 2) return NextResponse.json({ error: 'CSV must have a header row and at least one data row.' }, { status: 400 });

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const nameIdx    = header.indexOf('name');
    const typeIdx    = header.indexOf('type');
    const catIdx     = header.indexOf('category_name');
    const descIdx    = header.indexOf('description');
    const priceIdx   = header.indexOf('price');
    const unitIdx    = header.indexOf('unit');
    const imgIdx     = header.indexOf('image_url');
    const stockIdx   = header.indexOf('in_stock');

    if (nameIdx === -1) return NextResponse.json({ error: 'CSV must have a "name" column.' }, { status: 400 });
    if (typeIdx === -1) return NextResponse.json({ error: 'CSV must have a "type" column (project or quick).' }, { status: 400 });

    // Fetch all categories for name→id mapping
    const { data: categories } = await supabaseAdmin.from('categories').select('id, name');
    const catMap: Record<string, string> = {};
    (categories || []).forEach((c: any) => { catMap[c.name.toLowerCase()] = c.id; });

    const products: BulkRow[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      const name = cols[nameIdx]?.trim();
      const type = cols[typeIdx]?.trim().toLowerCase();

      if (!name) { errors.push(`Row ${i + 1}: missing name`); continue; }
      if (type !== 'project' && type !== 'quick') {
        errors.push(`Row ${i + 1}: type must be "project" or "quick", got "${type}"`);
        continue;
      }

      const catName = catIdx >= 0 ? cols[catIdx]?.trim().toLowerCase() : '';
      const category_id = catName && catMap[catName] ? catMap[catName] : null;

      const price = priceIdx >= 0 && cols[priceIdx]?.trim()
        ? parseFloat(cols[priceIdx].trim())
        : null;

      const in_stock = stockIdx >= 0
        ? cols[stockIdx]?.trim().toLowerCase() !== 'false'
        : true;

      products.push({
        name,
        type: type as 'project' | 'quick',
        category_id: category_id || undefined,
        description: descIdx >= 0 ? cols[descIdx]?.trim() || '' : '',
        price: price && !isNaN(price) ? price : null,
        unit: unitIdx >= 0 ? cols[unitIdx]?.trim() || '' : '',
        image_url: imgIdx >= 0 ? cols[imgIdx]?.trim() || '' : '',
        in_stock,
      });
    }

    if (products.length === 0) {
      return NextResponse.json({
        error: 'No valid products found in CSV.',
        row_errors: errors,
      }, { status: 400 });
    }

    // Insert in batches of 50
    const BATCH = 50;
    let inserted = 0;
    for (let b = 0; b < products.length; b += BATCH) {
      const batch = products.slice(b, b + BATCH);
      const { error } = await supabaseAdmin.from('products').insert(batch);
      if (error) {
        return NextResponse.json({
          error: `Database error on batch ${Math.floor(b / BATCH) + 1}: ${error.message}`,
          inserted,
          row_errors: errors,
        }, { status: 500 });
      }
      inserted += batch.length;
    }

    return NextResponse.json({
      success: true,
      inserted,
      skipped: errors.length,
      row_errors: errors.length > 0 ? errors : undefined,
    }, { status: 201 });

  } catch (err: any) {
    console.error('Bulk upload error:', err);
    return NextResponse.json({ error: 'Failed to process CSV file.' }, { status: 500 });
  }
}

/** Parse a single CSV line handling quoted values */
function parseCSVLine(line: string): string[] {
  const cols: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      cols.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  cols.push(current.trim());
  return cols;
}
