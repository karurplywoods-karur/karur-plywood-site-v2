// src/lib/catalogImport.ts
// Shared CSV parsing + validation for the one-sheet catalog import.
// One CSV row = one variant. Rows with the same product_name are grouped
// into a single product. Used by BOTH /api/import/preview and /execute
// (execute re-parses the file itself — it never trusts the browser).

import { supabaseAdmin } from '@/lib/db';

export const STOCK_STATUSES = ['in_stock', 'low_stock', 'out_of_stock', 'made_to_order'] as const;
export const MAX_ROWS = 500;

// ── CSV parsing ──────────────────────────────────────────────
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, '');
  const firstLine = text.split(/\r?\n/, 1)[0] || '';
  const delim = !firstLine.includes(',') && firstLine.includes(';') ? ';'
              : !firstLine.includes(',') && firstLine.includes('\t') ? '\t' : ',';

  const rows: string[][] = [];
  let row: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; } else inQ = false;
      } else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === delim) { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cur); cur = ''; rows.push(row); row = [];
    } else cur += c;
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

const HEADER_ALIASES: Record<string, string> = {
  name: 'product_name', product: 'product_name', productname: 'product_name', product_name: 'product_name',
  category_name: 'category', category_slug: 'category', category: 'category',
  brand_name: 'brand', brand_slug: 'brand', brand: 'brand',
  description: 'description', desc: 'description',
  unit: 'unit', image: 'image_url', image_url: 'image_url', photo: 'image_url',
  thickness: 'thickness', size: 'size', grade: 'grade', finish: 'finish', color: 'color', colour: 'color',
  pack_size: 'pack_size', pack: 'pack_size',
  price: 'price', sale_price: 'price', selling_price: 'price',
  mrp: 'mrp', stock: 'stock_quantity', stock_quantity: 'stock_quantity', qty: 'stock_quantity', quantity: 'stock_quantity',
  stock_status: 'stock_status', status: 'stock_status',
};

export interface RawRecord { rowNumber: number; data: Record<string, string> }

export function toRecords(rows: string[][]): { records: RawRecord[]; missingHeaders: string[] } {
  if (!rows.length) return { records: [], missingHeaders: ['product_name', 'category', 'price'] };
  const headers = rows[0].map(h => {
    const k = h.trim().toLowerCase().replace(/[\s-]+/g, '_');
    return HEADER_ALIASES[k] || k;
  });
  const missingHeaders = ['product_name', 'category'].filter(h => !headers.includes(h));
  const records: RawRecord[] = [];
  for (let i = 1; i < rows.length; i++) {
    if (!rows[i].some(c => c.trim() !== '')) continue; // skip blank lines
    const data: Record<string, string> = {};
    headers.forEach((h, idx) => { if (h && !(h in data)) data[h] = (rows[i][idx] ?? '').trim(); });
    records.push({ rowNumber: i + 1, data });
  }
  return { records, missingHeaders };
}

// ── helpers ──────────────────────────────────────────────────
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

function parseMoney(v: string): number | null | 'bad' {
  if (!v) return null;
  const cleaned = v.replace(/₹|rs\.?|inr|,|\s/gi, '');
  if (cleaned === '') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : 'bad';
}

export function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 70);
}

const rand = () => Math.random().toString(36).slice(2, 7);

export function makeSku(productName: string, thickness: string, index: number): string {
  const p = productName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'PRD';
  const t = thickness.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return [p, t, rand().toUpperCase() + index.toString(36).toUpperCase()].filter(Boolean).join('-');
}

// ── lookup context from DB ───────────────────────────────────
export interface Ctx {
  categories: { id: any; name: string; slug: string }[];
  brands: { id: any; name: string; slug: string }[];
  products: { id: any; name: string; slug: string }[];
  variantSigs: Map<string, Set<string>>; // productId -> signatures
}

export const variantSig = (v: { thickness: string; size: string; grade: string; finish: string; color: string; pack_size: string }) =>
  [v.thickness, v.size, v.grade, v.finish, v.color, v.pack_size].map(norm).join('|');

export async function loadCtx(): Promise<Ctx> {
  const [cats, brands, prods] = await Promise.all([
    supabaseAdmin.from('categories').select('id,name,slug'),
    supabaseAdmin.from('brands').select('id,name,slug'),
    supabaseAdmin.from('products').select('id,name,slug').limit(5000),
  ]);
  if (cats.error) throw new Error('Could not load categories: ' + cats.error.message);
  if (prods.error) throw new Error('Could not load products: ' + prods.error.message);
  // brands table is optional — if it is missing, brand column is simply ignored
  const ctx: Ctx = {
    categories: cats.data || [],
    brands: brands.error ? [] : brands.data || [],
    products: prods.data || [],
    variantSigs: new Map(),
  };
  const ids = ctx.products.map(p => p.id);
  if (ids.length) {
    const { data } = await supabaseAdmin
      .from('product_variants')
      .select('product_id,thickness,size,grade,finish,color,pack_size')
      .in('product_id', ids)
      .limit(20000);
    for (const v of data || []) {
      const key = String(v.product_id);
      if (!ctx.variantSigs.has(key)) ctx.variantSigs.set(key, new Set());
      ctx.variantSigs.get(key)!.add(variantSig(v as any));
    }
  }
  return ctx;
}

// ── validation / grouping ────────────────────────────────────
export type RowStatus = 'valid' | 'duplicate' | 'error';

export interface VariantData {
  row: number;
  thickness: string; size: string; grade: string; finish: string; color: string; pack_size: string;
  price: number | null; mrp: number | null; stock_quantity: number; stock_status: string;
}

export interface ProductGroup {
  name: string;
  category_id: any; category_name: string;
  brand_id: any; brand_name: string;
  description: string; unit: string; image_url: string;
  existing_id: any | null;
  variants: VariantData[]; // only valid, de-duplicated variants
}

export interface RowReport {
  row: number;
  status: RowStatus;
  errors: string[];
  warnings: string[];
  product: string;
  category: string;
  brand: string;
  variant: string;
  price: number | null;
  mrp: number | null;
  action: 'new product' | 'add to existing' | '';
}

export function buildCatalog(records: RawRecord[], ctx: Ctx) {
  const groups = new Map<string, ProductGroup>();
  const reports: RowReport[] = [];
  const catNames = ctx.categories.map(c => c.name).join(', ') || '(none created yet)';

  for (const rec of records) {
    const d = rec.data;
    const errors: string[] = [];
    const warnings: string[] = [];
    const name = (d.product_name || '').trim();

    if (!name) errors.push('product_name is empty');

    // category
    const catKey = norm(d.category || '');
    const cat = catKey ? ctx.categories.find(c => norm(c.name) === catKey || norm(c.slug) === catKey) : undefined;
    if (!d.category) errors.push('category is empty');
    else if (!cat) errors.push(`Category "${d.category}" not found. Valid: ${catNames}`);

    // brand (optional)
    let brand: { id: any; name: string } | undefined;
    if (d.brand) {
      const bKey = norm(d.brand);
      brand = ctx.brands.find(b => norm(b.name) === bKey || norm(b.slug) === bKey);
      if (!brand) warnings.push(`Brand "${d.brand}" not found — left blank`);
    }

    // numbers
    const price = parseMoney(d.price || '');
    const mrp = parseMoney(d.mrp || '');
    if (price === 'bad') errors.push(`price "${d.price}" is not a number`);
    if (mrp === 'bad') errors.push(`mrp "${d.mrp}" is not a number`);
    const priceN = price === 'bad' ? null : price;
    const mrpN = mrp === 'bad' ? null : mrp;
    if (priceN === null && !errors.length) warnings.push('No price — product will have no price shown');
    if (priceN !== null && mrpN !== null && mrpN < priceN) warnings.push('MRP is lower than price');

    let qty = 0;
    if (d.stock_quantity) {
      const q = Number(d.stock_quantity.replace(/,/g, ''));
      if (Number.isFinite(q) && q >= 0) qty = Math.floor(q);
      else warnings.push(`stock_quantity "${d.stock_quantity}" ignored`);
    }

    let stockStatus = 'in_stock';
    if (d.stock_status) {
      const s = d.stock_status.toLowerCase().trim().replace(/[\s-]+/g, '_');
      if ((STOCK_STATUSES as readonly string[]).includes(s)) stockStatus = s;
      else warnings.push(`stock_status "${d.stock_status}" not recognised — set to in_stock`);
    }

    const variant: VariantData = {
      row: rec.rowNumber,
      thickness: d.thickness || '', size: d.size || '', grade: d.grade || '',
      finish: d.finish || '', color: d.color || '', pack_size: d.pack_size || '',
      price: priceN, mrp: mrpN, stock_quantity: qty, stock_status: stockStatus,
    };
    const variantLabel = [variant.thickness, variant.size, variant.grade, variant.finish, variant.color, variant.pack_size]
      .filter(Boolean).join(' · ') || 'single variant';

    const report: RowReport = {
      row: rec.rowNumber, status: 'valid', errors, warnings,
      product: name, category: cat?.name || d.category || '', brand: brand?.name || d.brand || '',
      variant: variantLabel, price: priceN, mrp: mrpN, action: '',
    };

    if (errors.length) { report.status = 'error'; reports.push(report); continue; }

    // group by product name
    const gKey = norm(name);
    let g = groups.get(gKey);
    if (!g) {
      const existing = ctx.products.find(p => norm(p.name) === gKey);
      g = {
        name, category_id: cat!.id, category_name: cat!.name,
        brand_id: brand?.id ?? null, brand_name: brand?.name || '',
        description: d.description || '', unit: d.unit || '', image_url: d.image_url || '',
        existing_id: existing?.id ?? null, variants: [],
      };
      groups.set(gKey, g);
    } else {
      if (cat!.id !== g.category_id) warnings.push(`Different category than earlier row — "${g.category_name}" is used`);
      if (!g.description && d.description) g.description = d.description;
      if (!g.unit && d.unit) g.unit = d.unit;
      if (!g.image_url && d.image_url) g.image_url = d.image_url;
      if (!g.brand_id && brand) { g.brand_id = brand.id; g.brand_name = brand.name; }
    }
    report.action = g.existing_id != null ? 'add to existing' : 'new product';

    // duplicate variant check (inside file + already in DB)
    const sig = variantSig(variant);
    const inDb = g.existing_id != null && ctx.variantSigs.get(String(g.existing_id))?.has(sig);
    const inFile = g.variants.some(v => variantSig(v) === sig);
    if (inDb || inFile) {
      report.status = 'duplicate';
      report.warnings.push(inDb ? 'This variant already exists — skipped' : 'Repeated variant in this file — skipped');
    } else {
      g.variants.push(variant);
    }
    reports.push(report);
  }

  return { groups: Array.from(groups.values()).filter(g => g.variants.length > 0), reports };
}
