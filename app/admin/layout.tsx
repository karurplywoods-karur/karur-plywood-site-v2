// src/app/admin/layout.tsx
import { getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
