'use client';
// src/app/account/page.tsx â€” Account dashboard
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/auth-client';

interface Customer { id: string; full_name: string; email: string; phone: string; avatar_url: string; created_at: string; }
interface Order { id: string; order_number: string; status: string; total: number; created_at: string; order_items: any[]; }

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  pending:    { color: '#F97316', bg: 'rgba(249,115,22,0.12)',  label: 'Pending' },
  confirmed:  { color: '#25D366', bg: 'rgba(37,211,102,0.12)', label: 'Confirmed' },
  processing: { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', label: 'Processing' },
  shipped:    { color: '#A855F7', bg: 'rgba(168,85,247,0.12)', label: 'Shipped' },
  delivered:  { color: '#10B981', bg: 'rgba(16,185,129,0.12)', label: 'Delivered' },
  cancelled:  { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  label: 'Cancelled' },
};

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth/login?next=/account'); return; }
      Promise.all([
        fetch('/api/customer').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
      ]).then(([c, o]) => {
        setCustomer(c);
        setOrders(Array.isArray(o) ? o.slice(0, 5) : []);
        setLoading(false);
      });
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) return (
    <div className="account-page">
      <div style={{ textAlign: 'center', padding: '120px 0', color: '#7A8EA8' }}>â³ Loading...</div>
      <AccStyles />
    </div>
  );

  const sc = (status: string) => STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <div className="account-page">
      <div className="account-inner">

        {/* Header */}
        <div className="account-header">
          <div className="account-avatar">
            {customer?.avatar_url
              ? <img src={customer.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : <span style={{ fontSize: 32 }}>ðŸ‘¤</span>
            }
          </div>
          <div className="account-header-info">
            <h1 className="account-name">{customer?.full_name || 'My Account'}</h1>
            <div className="account-email">{customer?.email}</div>
            {customer?.phone && <div className="account-phone">ðŸ“ž {customer.phone}</div>}
            <div className="account-since">Member since {new Date(customer?.created_at || '').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</div>
          </div>
          <button onClick={handleLogout} className="account-logout-btn">Sign Out</button>
        </div>

        {/* Quick links */}
        <div className="account-nav-grid">
          {[
            { href: '/account/orders',    icon: 'ðŸ“¦', label: 'My Orders',    sub: `${orders.length} total` },
            { href: '/account/addresses', icon: 'ðŸ“', label: 'Addresses',    sub: 'Manage delivery addresses' },
            { href: '/account/profile',   icon: 'âœï¸', label: 'Edit Profile', sub: 'Name, phone, password' },
            { href: '/products',          icon: 'ðŸ›’', label: 'Shop Now',     sub: 'Browse all products' },
          ].map(item => (
            <Link key={item.href} href={item.href} className="account-nav-card">
              <div className="account-nav-icon">{item.icon}</div>
              <div className="account-nav-label">{item.label}</div>
              <div className="account-nav-sub">{item.sub}</div>
              <div className="account-nav-arrow">â†’</div>
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        <div className="account-section">
          <div className="account-section-header">
            <div className="account-section-title">Recent Orders</div>
            <Link href="/account/orders" className="account-section-link">View all â†’</Link>
          </div>

          {orders.length === 0 ? (
            <div className="account-empty">
              <div style={{ fontSize: 40, marginBottom: 12 }}>ðŸ“¦</div>
              <div style={{ color: '#7A8EA8', fontSize: 14 }}>No orders yet. Start shopping!</div>
              <Link href="/products" className="account-shop-btn">Browse Products â†’</Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => {
                const s = sc(order.status);
                return (
                  <Link key={order.id} href={`/account/orders/${order.id}`} className="order-card">
                    <div className="order-card-left">
                      <div className="order-number">{order.order_number}</div>
                      <div className="order-date">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      <div className="order-items-preview">{order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}</div>
                    </div>
                    <div className="order-card-right">
                      <div className="order-total">â‚¹{order.total.toLocaleString('en-IN')}</div>
                      <div className="order-status-badge" style={{ background: s.bg, color: s.color }}>{s.label}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>
      <AccStyles />
    </div>
  );
}

function AccStyles() {
  return <style>{`
    .account-page { min-height:100vh; background:#070F1F; padding:80px 0 60px; }
    .account-inner { max-width:900px; margin:0 auto; padding:32px 48px; }

    .account-header { display:flex; align-items:center; gap:20px; background:rgba(25,55,109,0.25); border:1px solid rgba(249,115,22,0.15); border-radius:12px; padding:24px 28px; margin-bottom:24px; flex-wrap:wrap; }
    .account-avatar { width:72px; height:72px; border-radius:50%; background:rgba(249,115,22,0.1); border:2px solid rgba(249,115,22,0.3); display:flex; align-items:center; justify-content:center; flex-shrink:0; overflow:hidden; }
    .account-header-info { flex:1; min-width:0; }
    .account-name { font-family:'Syne',sans-serif; font-size:1.3rem; font-weight:700; color:#F8F9FB; margin-bottom:4px; }
    .account-email { font-size:13px; color:#7A8EA8; margin-bottom:2px; }
    .account-phone { font-size:13px; color:#7A8EA8; margin-bottom:2px; }
    .account-since { font-size:11px; color:#7A8EA8; margin-top:4px; font-family:'Syne',sans-serif; letter-spacing:.08em; }
    .account-logout-btn { padding:9px 18px; background:rgba(248,113,113,0.08); border:1px solid rgba(248,113,113,0.2); border-radius:6px; color:#F87171; font-family:'Syne',sans-serif; font-size:.68rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; transition:all .2s; white-space:nowrap; }
    .account-logout-btn:hover { background:rgba(248,113,113,0.15); }

    .account-nav-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:28px; }
    .account-nav-card { background:rgba(25,55,109,0.25); border:1px solid rgba(249,115,22,0.12); border-radius:10px; padding:18px 16px; text-decoration:none; display:flex; flex-direction:column; gap:4px; transition:all .2s; position:relative; }
    .account-nav-card:hover { border-color:#F97316; transform:translateY(-3px); }
    .account-nav-icon { font-size:24px; margin-bottom:6px; }
    .account-nav-label { font-family:'Syne',sans-serif; font-size:.8rem; font-weight:700; color:#F8F9FB; }
    .account-nav-sub { font-size:11px; color:#7A8EA8; }
    .account-nav-arrow { position:absolute; top:16px; right:16px; color:#F97316; font-size:14px; opacity:0; transition:opacity .2s; }
    .account-nav-card:hover .account-nav-arrow { opacity:1; }

    .account-section { background:rgba(25,55,109,0.2); border:1px solid rgba(249,115,22,0.1); border-radius:10px; padding:20px 24px; }
    .account-section-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
    .account-section-title { font-family:'Syne',sans-serif; font-size:.72rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:#F97316; }
    .account-section-link { font-size:12px; color:#F97316; text-decoration:none; font-family:'Syne',sans-serif; font-weight:700; }

    .account-empty { text-align:center; padding:32px 0; }
    .account-shop-btn { display:inline-block; margin-top:14px; padding:9px 20px; background:rgba(249,115,22,0.1); border:1px solid rgba(249,115,22,0.25); border-radius:6px; color:#F97316; font-family:'Syne',sans-serif; font-size:.68rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; text-decoration:none; }

    .orders-list { display:flex; flex-direction:column; gap:8px; }
    .order-card { display:flex; justify-content:space-between; align-items:center; padding:14px 16px; background:rgba(7,15,31,0.4); border:1px solid rgba(249,115,22,0.08); border-radius:8px; text-decoration:none; transition:border-color .2s; }
    .order-card:hover { border-color:rgba(249,115,22,0.3); }
    .order-number { font-family:'Syne',sans-serif; font-size:.82rem; font-weight:700; color:#F8F9FB; margin-bottom:3px; }
    .order-date { font-size:11px; color:#7A8EA8; margin-bottom:2px; }
    .order-items-preview { font-size:11px; color:#7A8EA8; }
    .order-card-right { display:flex; flex-direction:column; align-items:flex-end; gap:6px; }
    .order-total { font-family:'Bebas Neue',sans-serif; font-size:1.2rem; color:#F97316; letter-spacing:.03em; }
    .order-status-badge { font-family:'Syne',sans-serif; font-size:9px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; padding:3px 9px; border-radius:2px; }

    @media(max-width:768px){
      .account-inner { padding:20px !important; }
      .account-nav-grid { grid-template-columns:repeat(2,1fr) !important; }
    }
    @media(max-width:480px){
      .account-nav-grid { grid-template-columns:1fr 1fr !important; }
    }
  `}</style>;
}

