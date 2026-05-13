// src/lib/auth-server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: any) {
          try { cookieStore.set({ name, value, ...options }); } catch {}
        },
        remove(name: string, options: any) {
          try { cookieStore.set({ name, value: '', ...options }); } catch {}
        },
      },
    }
  );
}

export async function getSession() {
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getCustomer() {
  const session = await getSession();
  if (!session) return null;
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from('customers')
    .select('*')
    .eq('id', session.user.id)
    .single();
  return data;
}
