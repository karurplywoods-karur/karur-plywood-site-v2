// src/app/admin/layout.tsx
// Auth protection for all /admin/* sub-routes.
// The login page at /admin/page.tsx is the only exception —
// detected by checking if it's a direct /admin path with no sub-route.
import { getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // In Next.js 14 App Router, the 'next-url' header contains the full URL
  // being processed. We use it to detect the login page (/admin) vs sub-routes.
  const h = headers();
  const rawUrl = h.get('next-url') || h.get('x-url') || '';

  let pathname = '';
  try {
    // next-url can be a full URL or just a path
    pathname = rawUrl.startsWith('http')
      ? new URL(rawUrl).pathname
      : rawUrl.split('?')[0];
  } catch {}

  // Allow the login page through without auth check
  const isLoginPage = pathname === '/admin' || pathname === '/admin/';
  if (isLoginPage) return <>{children}</>;

  // All other /admin/* routes require auth
  const session = await getAdminSession();
  if (!session) redirect('/admin');

  return <>{children}</>;
}