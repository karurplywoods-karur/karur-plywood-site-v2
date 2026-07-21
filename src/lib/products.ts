// src/lib/products.ts — Supabase product queries
import { supabase, supabaseAdmin } from './db';
import type { Product, Category } from './types';

// PRODUCT_SELECT — columns fetched for every product query.
// brands: logo_url excluded here — added back after PRODUCTS_SCHEMA_FIX.sql runs.
// A missing column in any join causes the entire query to silently return [].
export const PRODUCT_SELECT = `
  *,
  categories(id, name, slug, icon),
  brands(id, name, slug),
  product_variants(*)
`;

// ── PUBLIC QUERIES ──────────────────────────────────────

export interface ProductFilters {
  categorySlug?: string;
  searchQuery?: string;
  brandSlugs?: string[];
  thickness?: string[];
  priceMin?: number;
  priceMax?: number;
  sort?: 'popular' | 'price_asc' | 'price_desc' | 'newest';
}

export async function getProjectProducts(categorySlug?: string, searchQuery?: string, filters?: Omit<ProductFilters, 'categorySlug' | 'searchQuery'>): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('in_stock', true);

  // Only filter by type if no search — search should span all types
  if (!searchQuery) query = query.eq('type', 'project');

  if (categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
    if (cat) query = query.eq('category_id', cat.id);
  }

  if (searchQuery) query = query.ilike('name', `%${searchQuery}%`);

  if (filters?.brandSlugs?.length) {
    const { data: brandRows } = await supabase.from('brands').select('id').in('slug', filters.brandSlugs);
    const ids = (brandRows || []).map(b => b.id);
    if (ids.length) query = query.in('brand_id', ids);
  }

  if (filters?.thickness?.length) query = query.in('thickness', filters.thickness);
  if (filters?.priceMin != null) query = query.gte('price', filters.priceMin);
  if (filters?.priceMax != null) query = query.lte('price', filters.priceMax);

  switch (filters?.sort) {
    case 'price_asc': query = query.order('price', { ascending: true }); break;
    case 'price_desc': query = query.order('price', { ascending: false }); break;
    case 'newest': query = query.order('created_at', { ascending: false }); break;
    default: query = query.order('sort_order', { ascending: true });
  }

  const { data, error } = await query;
  if (error) { console.error(error); return []; }
  return (data as Product[]) || [];
}

export async function getBrands(): Promise<{ id: string | number; name: string; slug: string; logo_url?: string; description?: string; website?: string }[]> {
  const { data, error } = await supabase.from('brands').select('id,name,slug,logo_url,description,website').order('name', { ascending: true });
  if (error) { console.error(error); return []; }
  return data || [];
}

export async function getBrandBySlug(slug: string) {
  const { data } = await supabase.from('brands').select('*').eq('slug', slug).maybeSingle();
  return data;
}

export async function getBrandProductCount(brandId: string | number) {
  const { count } = await supabase.from('products').select('id', { count: 'exact', head: true }).eq('brand_id', brandId).eq('in_stock', true);
  return count || 0;
}

// Counts for sidebar filter facets, scoped to the current category/search context
// (but not the facet being counted itself — standard faceted-search behavior).
export async function getFacetCounts(categorySlug?: string, searchQuery?: string) {
  let categoryId: string | number | null = null;
  if (categorySlug) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).single();
    categoryId = cat?.id ?? null;
  }

  const baseFilter = (q: any) => {
    q = q.eq('in_stock', true);
    if (!searchQuery) q = q.eq('type', 'project');
    if (categoryId) q = q.eq('category_id', categoryId);
    if (searchQuery) q = q.ilike('name', `%${searchQuery}%`);
    return q;
  };

  const [brands, thicknessRows] = await Promise.all([
    getBrands(),
    baseFilter(supabase.from('products').select('thickness')).not('thickness', 'is', null),
  ]);

  const brandCounts = await Promise.all(brands.map(async b => {
    const { count } = await baseFilter(supabase.from('products').select('id', { count: 'exact', head: true })).eq('brand_id', b.id);
    return [b.slug, count || 0] as const;
  }));

  const thicknessCounts: Record<string, number> = {};
  (thicknessRows.data || []).forEach((r: any) => {
    if (r.thickness) thicknessCounts[r.thickness] = (thicknessCounts[r.thickness] || 0) + 1;
  });

  return { brandCounts: Object.fromEntries(brandCounts), thicknessCounts };
}

export async function getQuickProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('type', 'quick')
    .eq('in_stock', true)
    .order('sort_order', { ascending: true });

  if (error) { console.error(error); return []; }
  return (data as Product[]) || [];
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) { console.error(error); return []; }
  return (data as Category[]) || [];
}

// ── ADMIN QUERIES (service role) ────────────────────────

export async function adminGetAllProducts(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(PRODUCT_SELECT)
    .order('created_at', { ascending: false });

  if (error) { console.error(error); return []; }
  return (data as Product[]) || [];
}

export async function adminCreateProduct(product: Partial<Product>): Promise<{ data: Product | null; error: string | null }> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Product, error: null };
}

export async function adminUpdateProduct(id: string, updates: Partial<Product>): Promise<{ error: string | null }> {
  const { error } = await supabaseAdmin
    .from('products')
    .update(updates)
    .eq('id', id);

  if (error) return { error: error.message };
  return { error: null };
}

export async function adminDeleteProduct(id: string): Promise<{ error: string | null }> {
  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };
  return { error: null };
}

export async function adminGetCategories(): Promise<Category[]> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) return [];
  return (data as Category[]) || [];
}