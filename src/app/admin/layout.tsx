// src/app/admin/layout.tsx
// Layout is intentionally minimal — each admin sub-page handles its own auth.
// DO NOT add session checks here: the login page at /admin/page.tsx shares
// this layout, which causes infinite redirect loops.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}