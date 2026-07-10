// src/app/api/import/execute/route.ts
// Executes the import for a previously previewed batch.
// Supports rollback â€” stores inserted IDs so they can be deleted
// if the admin requests an undo within the session.

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

function slugify(name: string, suffix: string): string {
  return name.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 70) + '-' + suffix;
}

// â”€â”€ POST /api/import/execute â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Body: { batch_id: string, skip_errors: boolean }
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { batch_id, skip_errors = true } = await req.json();
  if (!batch_id) return NextResponse.json({ error: 'batch_id is required.' }, { status: 400 });

  // Load the batch
  const { data: batch, error: batchErr } = await supabaseAdmin
    .from('import_batches')
    .select('*')
    .eq('id', batch_id)
    .single();

  if (batchErr || !batch) {
    return NextResponse.json({ error: 'Batch not found. Run preview first.' }, { status: 404 });
  }
  if (batch.status === 'done') {
    return NextResponse.json({ error: 'This batch has already been imported.' }, { status: 409 });
  }

  // Mark as importing
  await supabaseAdmin
    .from('import_batches')
    .update({ status: 'importing' })
    .eq('id', batch_id);

  const rows: any[] = batch.preview_data || [];
  const validRows = rows.filter((r: any) => r.status !== 'error');

  const inserted: string[] = [];
  const errorRows: any[]   = [];
  let insertedCount = 0;

  try {
    if (batch.batch_type === 'products') {
      for (let i = 0; i < validRows.length; i++) {
        const r = validRows[i];
        const p = r.preview;
        try {
          const slug = slugify(p.name, (Date.now() + i).toString(36));
          const { data, error } = await supabaseAdmin
            .from('products')
            .insert([{
              slug,
              name:         p.name,
              category_id:  p.category_id  || null,
              brand_id:     p.brand_id     || null,  // UUID â€” matches brands.id type
              description:  p.description  || '',
              image_url:    p.image_url    || '',
              price:        p.price        ? Number(p.price) : null,
              mrp:          p.mrp          ? Number(p.mrp)   : null,
              unit:         p.unit         || '',
              type:         p.type         || 'project',
              in_stock:     true,
              is_active:    true,
              sort_order:   Number(p.sort_order) || 0,
            }])
            .select('id')
            .single();
          if (error) throw error;
          inserted.push(String(data.id));
          insertedCount++;
        } catch (e: any) {
          errorRows.push({ row: r.row, error: e.message, data: p });
          if (!skip_errors) throw e;
        }
      }
    }

    else if (batch.batch_type === 'variants') {
      for (let i = 0; i < validRows.length; i++) {
        const r = validRows[i];
        const p = r.preview;
        if (!p.product_id) {
          errorRows.push({ row: r.row, error: 'product_id not resolved', data: p });
          continue;
        }
        try {
          const { data, error } = await supabaseAdmin
            .from('product_variants')
            .insert([{
              product_id:     Number(p.product_id),
              sku:            null,    // blank sku = null (after constraint fix)
              thickness:      p.thickness     || '',
              size:           p.size          || '',
              grade:          p.grade         || '',
              finish:         p.finish        || '',
              color:          p.color         || '',
              pack_size:      p.pack_size     || '',
              price:          p.price         ? Number(p.price)          : null,
              mrp:            p.mrp           ? Number(p.mrp)            : null,
              stock_quantity: p.stock_quantity ? Number(p.stock_quantity) : 0,
              stock_status:   p.stock_status  || 'in_stock',
              is_default:     false,
              sort_order:     i,
            }])
            .select('id')
            .single();
          if (error) throw error;
          inserted.push(String(data.id));
          insertedCount++;
        } catch (e: any) {
          errorRows.push({ row: r.row, error: e.message, data: p });
          if (!skip_errors) throw e;
        }
      }
    }

    else if (batch.batch_type === 'images') {
      for (let i = 0; i < validRows.length; i++) {
        const r = validRows[i];
        const p = r.preview;
        if (!p.product_id) {
          errorRows.push({ row: r.row, error: 'product_id not resolved', data: p });
          continue;
        }
        try {
          const { data, error } = await supabaseAdmin
            .from('product_images')
            .insert([{
              product_id:  Number(p.product_id),
              image_url:   p.image_url   || '',
              sort_order:  Number(p.sort_order) || i,
              alt_text:    p.alt_text    || '',
            }])
            .select('id')
            .single();
          if (error) throw error;
          inserted.push(String(data.id));
          insertedCount++;
        } catch (e: any) {
          errorRows.push({ row: r.row, error: e.message, data: p });
          if (!skip_errors) throw e;
        }
      }
    }

    // Mark done, store rollback data
    await supabaseAdmin
      .from('import_batches')
      .update({
        status:        'done',
        inserted:      insertedCount,
        skipped:       errorRows.length,
        error_rows:    errorRows,
        rollback_data: { table: batch.batch_type === 'products' ? 'products' : batch.batch_type === 'variants' ? 'product_variants' : 'product_images', ids: inserted },
        completed_at:  new Date().toISOString(),
      })
      .eq('id', batch_id);

    return NextResponse.json({
      success:   true,
      inserted:  insertedCount,
      skipped:   errorRows.length,
      errors:    errorRows,
      batch_id,
    });

  } catch (fatal: any) {
    // Fatal error (skip_errors = false) â€” roll back everything inserted so far
    if (inserted.length > 0) {
      const table = batch.batch_type === 'products'
        ? 'products'
        : batch.batch_type === 'variants'
          ? 'product_variants'
          : 'product_images';
      await supabaseAdmin.from(table).delete().in('id', inserted);
    }

    await supabaseAdmin
      .from('import_batches')
      .update({ status: 'failed', error_rows: [{ error: fatal.message }] })
      .eq('id', batch_id);

    return NextResponse.json({ error: fatal.message, rolled_back: inserted.length }, { status: 500 });
  }
}

// â”€â”€ DELETE /api/import/execute â€” rollback a completed import â”€â”€â”€
export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { batch_id } = await req.json();
  if (!batch_id) return NextResponse.json({ error: 'batch_id is required.' }, { status: 400 });

  const { data: batch } = await supabaseAdmin
    .from('import_batches')
    .select('*')
    .eq('id', batch_id)
    .single();

  if (!batch || batch.status !== 'done') {
    return NextResponse.json({ error: 'No completed batch found to roll back.' }, { status: 404 });
  }

  const rollback = batch.rollback_data as { table: string; ids: string[] };
  if (!rollback?.ids?.length) {
    return NextResponse.json({ error: 'No rollback data available.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from(rollback.table)
    .delete()
    .in('id', rollback.ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin
    .from('import_batches')
    .update({ status: 'rolled_back' })
    .eq('id', batch_id);

  return NextResponse.json({ success: true, deleted: rollback.ids.length });
}
