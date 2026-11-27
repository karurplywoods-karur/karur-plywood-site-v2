// src/lib/db.ts  — Supabase client
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Next.js 14 caches every server-side fetch() by default — and supabase-js uses fetch().
// Without this, products added/edited in admin (or by bulk import) never appear on the
// website because the old query result is served from Next's Data Cache.
// 'no-store' makes every query read fresh data from Supabase.
const noStoreFetch: typeof fetch = (input, init) => fetch(input, { ...init, cache: 'no-store' });

// Public client — for read operations (approved reviews, gallery)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: noStoreFetch },
});

// Admin client — bypasses Row Level Security for server-side admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: { fetch: noStoreFetch },
});
