// src/lib/products.ts — Supabase product queries
import { supabase, supabaseAdmin } from './db';
import type { Product, Category } from './types';

// ── PUBLIC QUERIES ──────────────────────────────────────

export async function getProjectProducts(categorySlug?: string): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*, categories(id, name, slug, icon)')
    .eq('type', 'project')
    .eq('in_stock', true)
    .order('sort_order', { ascending: true });

  if (categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
    if (cat) query = query.eq('category_id', cat.id);
  }

  const { data, error } = await query;
  if (error) { console.error(error); return []; }
  return (data as Product[]) || [];
}

export async function getQuickProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name, slug, icon)')
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
    .select('*, categories(id, name, slug, icon)')
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
