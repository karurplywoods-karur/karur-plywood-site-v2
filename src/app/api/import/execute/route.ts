// src/app/api/import/execute/route.ts
// POST   -> multipart { file: CSV } — re-validates the file on the server, then
//           creates products + variants in bulk. No import_batches table needed.
// DELETE -> { product_ids, variant_ids } — undo an import you just ran.

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { buildCatalog, loadCtx, makeSku, MAX_ROWS, parseCsv, slugify, toRecords, type VariantData } from '@/lib/catalogImport';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const chunk = <T,>(arr: T[], n: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
};

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file received.' }, { status: 400 });

    const { records, missingHeaders } = toRecords(parseCsv(await file.text()));
    if (missingHeaders.length) return NextResponse.json({ error: `Missing column(s): ${missingHeaders.join(', ')}` }, { status: 400 });
    if (!records.length || records.length > MAX_ROWS) {
      return NextResponse.json({ error: `File must have 1–${MAX_ROWS} data rows.` }, { status: 400 });
    }

    const ctx = await loadCtx();
    const createMissing = form.get('create_missing') === '1';
    const { groups, reports, newCategories, newBrands } = buildCatalog(records, ctx, { createMissing });
    const skippedRows = reports.filter(r => r.status !== 'valid').length;

    const errors: { row: number | string; error: string }[] = [];
    const createdProductIds: any[] = [];
    const createdCategoryIds: any[] = [];
    const createdBrandIds: any[] = [];
    const createdVariantIds: any[] = [];
    let productsCreated = 0;
    let productsUpdated = 0;
    let variantsCreated = 0;

    // ── 0. create missing categories / brands (only when ticked) ──
    const normKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
    if (newCategories.length) {
      const { data: last } = await supabaseAdmin.from('categories').select('sort_order').order('sort_order', { ascending: false }).limit(1);
      let order = ((last?.[0]?.sort_order as number) ?? 0) + 1;
      const takenSlugs = new Set(ctx.categories.map(c => c.slug));
      for (const name of newCategories) {
        let slug = slugify(name) || 'category';
        while (takenSlugs.has(slug)) slug += '-' + Math.random().toString(36).slice(2, 4);
        takenSlugs.add(slug);
        const { data, error } = await supabaseAdmin.from('categories').insert([{ name, slug, icon: '📦', sort_order: order++ }]).select('id,name').single();
        if (error) {
          errors.push({ row: '-', error: `Category "${name}" not created: ${error.message}` });
          continue;
        }
        createdCategoryIds.push(data.id);
        groups.forEach(g => { if (g.category_id == null && normKey(g.category_name) === normKey(name)) g.category_id = data.id; });
      }
    }
    if (newBrands.length) {
      const takenSlugs = new Set(ctx.brands.map(b => b.slug));
      for (const name of newBrands) {
        let slug = slugify(name) || 'brand';
        while (takenSlugs.has(slug)) slug += '-' + Math.random().toString(36).slice(2, 4);
        takenSlugs.add(slug);
        const { data, error } = await supabaseAdmin.from('brands').insert([{ name, slug }]).select('id,name').single();
        if (error) {
          errors.push({ row: '-', error: `Brand "${name}" not created (left blank): ${error.message}` });
          continue;
        }
        createdBrandIds.push(data.id);
        groups.forEach(g => { if (g.brand_id == null && g.brand_name && normKey(g.brand_name) === normKey(name)) g.brand_id = data.id; });
      }
    }
    // a product whose category could not be created cannot be inserted safely
    for (let i = groups.length - 1; i >= 0; i--) {
      if (groups[i].category_id == null && groups[i].existing_id == null) {
        errors.push({ row: groups[i].variants[0].row, error: `Product "${groups[i].name}" skipped: category "${groups[i].category_name}" missing` });
        groups.splice(i, 1);
      }
    }

    // ── 1. create new products (bulk) ────────────────────────
    const newGroups = groups.filter(g => g.existing_id == null);
    const productIdByGroup = new Map<typeof groups[number], any>();
    const stamp = Date.now().toString(36);

    for (const part of chunk(newGroups, 100)) {
      const rows = part.map((g, i) => {
        const prices = g.variants.map(v => v.price).filter((p): p is number => p !== null);
        const lowest = prices.length ? g.variants.reduce((a, b) => (b.price !== null && (a.price === null || b.price < a.price) ? b : a)) : null;
        const row: Record<string, any> = {
          slug: `${slugify(g.name)}-${stamp}${i.toString(36)}${Math.random().toString(36).slice(2, 4)}`,
          name: g.name,
          category_id: g.category_id,
          description: g.description,
          image_url: g.image_url,
          type: 'project',
          price: lowest?.price ?? null,
          mrp: lowest?.mrp ?? null,
          unit: g.unit,
          in_stock: true,
          is_active: true,
          sort_order: 0,
        };
        if (g.brand_id != null) row.brand_id = g.brand_id;
        return row;
      });

      const { data, error } = await supabaseAdmin.from('products').insert(rows).select('id,slug');
      if (error) {
        part.forEach(g => errors.push({ row: g.variants[0].row, error: `Product "${g.name}" not created: ${error.message}` }));
        continue;
      }
      const bySlug = new Map((data || []).map((r: any) => [r.slug, r.id]));
      part.forEach((g, i) => {
        const id = bySlug.get(rows[i].slug);
        if (id != null) { productIdByGroup.set(g, id); createdProductIds.push(id); productsCreated++; }
      });
    }
    for (const g of groups) if (g.existing_id != null) productIdByGroup.set(g, g.existing_id);

    // ── 2. create variants (bulk, with per-row fallback) ─────
    type VRow = { group: typeof groups[number]; v: VariantData; payload: Record<string, any> };
    const vrows: VRow[] = [];
    groups.forEach(g => {
      const pid = productIdByGroup.get(g);
      if (pid == null) return;
      g.variants.forEach((v, i) => {
        vrows.push({
          group: g, v,
          payload: {
            product_id: pid,
            sku: makeSku(g.name, v.thickness, i),
            thickness: v.thickness, size: v.size, grade: v.grade,
            finish: v.finish, color: v.color, pack_size: v.pack_size,
            price: v.price, mrp: v.mrp,
            stock_quantity: v.stock_quantity, stock_status: v.stock_status,
            is_default: g.existing_id == null && i === 0,
            sort_order: i,
          },
        });
      });
    });

    const okByGroup = new Map<typeof groups[number], number>();
    const noteOk = (g: typeof groups[number], n: number) => okByGroup.set(g, (okByGroup.get(g) || 0) + n);

    for (const part of chunk(vrows, 200)) {
      const { data, error } = await supabaseAdmin.from('product_variants').insert(part.map(p => p.payload)).select('id');
      if (!error) {
        (data || []).forEach((r: any) => createdVariantIds.push(r.id));
        variantsCreated += part.length;
        part.forEach(p => noteOk(p.group, 1));
        continue;
      }
      // bulk insert failed → retry row by row to find exactly which rows are bad
      for (const p of part) {
        const { data: one, error: e1 } = await supabaseAdmin.from('product_variants').insert([p.payload]).select('id').single();
        if (e1) errors.push({ row: p.v.row, error: e1.message });
        else { createdVariantIds.push(one.id); variantsCreated++; noteOk(p.group, 1); }
      }
    }

    // ── 3. tidy up: a new product with zero variants is removed ──
    for (const g of newGroups) {
      const pid = productIdByGroup.get(g);
      if (pid != null && !okByGroup.get(g)) {
        await supabaseAdmin.from('products').delete().eq('id', pid);
        const idx = createdProductIds.indexOf(pid);
        if (idx >= 0) createdProductIds.splice(idx, 1);
        productsCreated--;
      }
    }
    productsUpdated = groups.filter(g => g.existing_id != null && okByGroup.get(g)).length;

    return NextResponse.json({
      success: variantsCreated > 0,
      products_created: productsCreated,
      products_updated: productsUpdated,
      variants_created: variantsCreated,
      skipped: skippedRows,
      errors,
      created_categories: createdCategoryIds.length,
      created_brands: createdBrandIds.length,
      rollback: { product_ids: createdProductIds, variant_ids: createdVariantIds, category_ids: createdCategoryIds, brand_ids: createdBrandIds },
    });
  } catch (e: any) {
    console.error('Import execute error:', e);
    return NextResponse.json({ error: e.message || 'Import failed.' }, { status: 500 });
  }
}

// ── DELETE: undo the import that was just run ─────────────────
export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { product_ids = [], variant_ids = [], category_ids = [], brand_ids = [] } = await req.json();
  if (!product_ids.length && !variant_ids.length) return NextResponse.json({ error: 'Nothing to undo.' }, { status: 400 });

  if (variant_ids.length) {
    const { error } = await supabaseAdmin.from('product_variants').delete().in('id', variant_ids);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (product_ids.length) {
    const { error } = await supabaseAdmin.from('products').delete().in('id', product_ids);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // remove categories/brands this import created — only if nothing else uses them now
  for (const id of category_ids) {
    const { count } = await supabaseAdmin.from('products').select('id', { count: 'exact', head: true }).eq('category_id', id);
    if (!count) await supabaseAdmin.from('categories').delete().eq('id', id);
  }
  for (const id of brand_ids) {
    const { count } = await supabaseAdmin.from('products').select('id', { count: 'exact', head: true }).eq('brand_id', id);
    if (!count) await supabaseAdmin.from('brands').delete().eq('id', id);
  }
  return NextResponse.json({ success: true, products_deleted: product_ids.length, variants_deleted: variant_ids.length });
}
