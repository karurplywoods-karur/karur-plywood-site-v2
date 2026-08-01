'use client';
// src/components/account/AccountSidebar.tsx
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/auth-client';

interface Customer { full_name?: string; email?: string; phone?: string; }

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊', href: '/account' },
  { key: 'orders', label: 'My Orders', icon: '📦', href: '/account/orders' },
  { key: 'wishlist', label: 'Wishlist', icon: '♡', href: '/wishlist' },
  { key: 'addresses', label: 'Saved Addresses', icon: '📍', href: '/account/addresses' },
  { key: 'bom', label: 'BOM Uploads', icon: '📤', href: '/bom-quote' },
  { key: 'profile', label: 'Account Details', icon: '👤', href: '/account/profile' },
];

export default function AccountSidebar({ customer, active }: { customer: Customer | null; active: string }) {
  const router = useRouter();
  const supabase = createClient();

  const initials = (customer?.full_name || 'U').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <aside className="acc-sidebar">
      <div className="acc-sidebar-user">
        <div className="acc-avatar">{initials}</div>
        <div style={{ minWidth: 0 }}>
          <div className="acc-user-name">{customer?.full_name || 'My Account'}</div>
          {customer?.phone && <div className="acc-user-sub">{customer.phone}</div>}
          {customer?.email && <div className="acc-user-sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{customer.email}</div>}
        </div>
      </div>
      <Link href="/account/profile" className="acc-edit-link">✎ Edit Profile</Link>

      <nav className="acc-nav">
        {NAV_ITEMS.map(item => (
          <Link key={item.key} href={item.href} className={`acc-nav-item${active === item.key ? ' acc-nav-item--active' : ''}`}>
            <span className="acc-nav-icon">{item.icon}</span>{item.label}
          </Link>
        ))}
        <button onClick={handleLogout} className="acc-nav-item acc-nav-logout">
          <span className="acc-nav-icon">⏻</span>Logout
        </button>
      </nav>

      <style>{`
        .acc-sidebar { width: 240px; flex-shrink: 0; }
        .acc-sidebar-user { display: flex; gap: 12px; align-items: center; background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; padding: 16px; margin-bottom: 8px; }
        .acc-avatar { width: 42px; height: 42px; border-radius: 50%; background: #0B2447; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-family: 'Inter',sans-serif; font-weight: 800; font-size: 15px; flex-shrink: 0; }
        .acc-user-name { font-family: 'Inter',sans-serif; font-weight: 700; font-size: 13.5px; color: #0B2447; }
        .acc-user-sub { font-size: 11px; color: #6B7280; }
        .acc-edit-link { display: block; font-size: 11.5px; color: #F07316; text-decoration: none; font-family: 'Inter',sans-serif; font-weight: 700; margin: 8px 2px 16px; }
        .acc-nav { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; }
        .acc-nav-item { display: flex; align-items: center; gap: 10px; padding: 11px 16px; font-size: 13px; color: #4B5563; text-decoration: none; border-bottom: 1px solid #F5F2ED; background: none; border-left: none; border-right: none; border-top: none; text-align: left; width: 100%; cursor: pointer; font-family: inherit; }
        .acc-nav-item:last-child { border-bottom: none; }
        .acc-nav-item:hover { background: #FAF8F5; color: #0B2447; }
        .acc-nav-item--active { background: #FFF4ED; color: #F07316; font-weight: 700; border-left: 3px solid #F07316; padding-left: 13px; }
        .acc-nav-icon { width: 18px; text-align: center; flex-shrink: 0; }
        .acc-nav-logout { color: #dc2626; }
        .acc-nav-logout:hover { background: #fef2f2; color: #dc2626; }
      `}</style>
    </aside>
  );
}
