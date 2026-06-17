import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Standard client for build-time/static data fetching
// Does NOT use cookies - safe to call outside request scope
export function createBuildClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}