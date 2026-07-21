'use client';
// src/app/account/orders/page.tsx
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/auth-client';
import AccountSidebar from '@/components/account/AccountSidebar';

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  pending:    { color: '#F07316', bg: '#FFF4ED', border: '#fed7aa', label: 'Pending' },
  confirmed:  { color: '#F07316', bg: '#FFF4ED', border: '#fed7aa', label: 'Processing' },
  processing: { color: '#F07316', bg: '#FFF4ED', border: '#fed7aa', label: 'Processing' },
  shipped:    { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'Shipped' },
  delivered:  { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Delivered' },
  cancelled:  { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Cancelled' },
};

const TABS = [
  { key: 'all', label: 'All Orders' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function OrdersPage() {
  const router = useRouter();
  const supabase = createClient();
  const [customer, setCustomer] = useState<any>(null);
  const [orders,  setOrders]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('all');
  const [search,  setSearch]  = useState('');
  const [sort,    setSort]    = useState('latest');
  const [page,    setPage]    = useState(1);
  const PER_PAGE = 5;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth/login?next=/account/orders'); return; }
      Promise.all([
        fetch('/api/customer').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
      ]).then(([c, o]) => {
        setCustomer(c);
        setOrders(Array.isArray(o) ? o : []);
        setLoading(false);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach(o => {
      if (o.status === 'pending' || o.status === 'processing') c.processing++;
      else if (o.status === 'shipped') c.shipped++;
      else if (o.status === 'delivered') c.delivered++;
      else if (o.status === 'cancelled') c.cancelled++;
    });
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    let list = orders;
    if (tab === 'processing') list = list.filter(o => o.status === 'pending' || o.status === 'processing');
    else if (tab !== 'all') list = list.filter(o => o.status === tab);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(o => o.order_number?.toLowerCase().includes(q) || o.order_items?.some((i: any) => i.product_name?.toLowerCase().includes(q)));
    }
    list = [...list].sort((a, b) => sort === 'latest'
      ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      : new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return list;
  }, [orders, tab, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);

  if (loading) {
    return <div style={{ minHeight: '100vh', background: '#FAF8F5', paddingTop: 58, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>⏳ Loading orders...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F5', paddingTop: 58 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 48px 60px' }} className="ord-pad">

        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 14 }}>
          <Link href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Home</Link> › <Link href="/account" style={{ color: '#9CA3AF', textDecoration: 'none' }}>My Account</Link> › <span style={{ color: '#F07316', fontWeight: 600 }}>My Orders</span>
        </div>

        <div className="ord-layout">
          <AccountSidebar customer={customer} active="orders" />

          <div>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(1.4rem,2.6vw,1.8rem)', fontWeight: 700, color: '#0B2447', margin: '0 0 4px' }}>My Orders</h1>
              <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>View and track all your orders in one place</p>
            </div>

            <div className="ord-tabs">
              {TABS.map(t => (
                <button key={t.key} onClick={() => { setTab(t.key); setPage(1); }} className={`ord-tab${tab === t.key ? ' ord-tab--active' : ''}`}>
                  {t.label} ({counts[t.key] ?? 0})
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by Order ID or Product…" className="ord-search" />
              <select value={sort} onChange={e => setSort(e.target.value)} className="ord-sort">
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {paged.length === 0 ? (
              <div className="ord-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>📦</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: '#0B2447', marginBottom: 8 }}>
                  {tab === 'all' ? 'No orders yet' : `No ${TABS.find(t => t.key === tab)?.label} orders`}
                </div>
                <Link href="/products" style={{ color: '#F07316', fontSize: 13, textDecoration: 'none', fontWeight: 700 }}>Start shopping →</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {paged.map(order => {
                  const s = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                  return (
                    <div key={order.id} className="ord-card ord-row">
                      <div className="ord-row-icon">📦</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Order ID</div>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: '#0B2447', fontSize: 14 }}>{order.order_number}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Order Date</div>
                        <div style={{ fontSize: 13, color: '#374151' }}>{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>{order.order_items?.length || 0} Items</div>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: '#0B2447', fontSize: 14 }}>₹{order.total?.toLocaleString('en-IN')}</div>
                      </div>
                      <div>
                        <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>{s.label}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                        <Link href={`/account/orders/${order.id}`} className="ord-view-btn">View Details</Link>
                        <a href={`/account/orders/${order.id}/invoice`} target="_blank" rel="noopener" style={{ fontSize: 11, color: '#F07316', textDecoration: 'none', fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>↓ Download Invoice</a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: '#6B7280', marginRight: 8 }}>Showing {(page - 1) * PER_PAGE + 1} to {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} orders</span>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="ord-page-btn">‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)} className={`ord-page-btn${n === page ? ' ord-page-btn--active' : ''}`}>{n}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="ord-page-btn">›</button>
              </div>
            )}
          </div>

          <aside>
            <div className="ord-card" style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: '#0B2447', marginBottom: 14 }}>Account Overview</div>
              {[['Total Orders', orders.length], ['Total Spent', `₹${totalSpent.toLocaleString('en-IN')}`]].map(([k, v]) => (
                <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: '1px solid #F1EEE9' }}>
                  <span style={{ color: '#6B7280' }}>{k}</span><span style={{ fontWeight: 700, color: '#0B2447' }}>{v}</span>
                </div>
              ))}
              <Link href="/account" style={{ display: 'block', textAlign: 'center', marginTop: 14, padding: '10px 0', border: '1px solid #E5E1DC', borderRadius: 6, color: '#0B2447', fontSize: 12, fontWeight: 700, fontFamily: "'Syne',sans-serif", textDecoration: 'none' }}>View Dashboard →</Link>
            </div>

            <div className="ord-card" style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: '#0B2447', marginBottom: 14 }}>Need Something?</div>
              {[
                { icon: '📍', t: 'Track Your Order', d: 'Real-time updates', href: '/orders/track' },
                { icon: '↺', t: 'Easy Returns', d: 'Hassle-free returns', href: '/contact' },
                { icon: '💬', t: 'Contact Support', d: "We're here to help", href: '/contact' },
              ].map(item => (
                <Link key={item.t} href={item.href} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '9px 0', textDecoration: 'none', borderBottom: '1px solid #F1EEE9' }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, color: '#0B2447', fontWeight: 600 }}>{item.t}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{item.d}</div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="ord-bom-card">
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: '#0B2447', marginBottom: 4 }}>Upload BOM & Get Best Price</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 12 }}>Upload your carpenter list and get fastest quote</div>
              <Link href="/bom-quote" style={{ display: 'inline-flex', alignItems: 'center', padding: '9px 16px', background: '#F07316', color: '#FFFFFF', borderRadius: 6, fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>📤 Upload BOM</Link>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .ord-layout { display: grid; grid-template-columns: 240px 1fr 260px; gap: 24px; align-items: start; }
        .ord-card { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; padding: 18px; box-shadow: 0 1px 4px rgba(11,36,71,0.05); }
        .ord-tabs { display: flex; gap: 4px; border-bottom: 1px solid #E5E1DC; margin-bottom: 16px; overflow-x: auto; }
        .ord-tab { background: none; border: none; padding: 10px 14px; font-family: 'Syne',sans-serif; font-size: 0.72rem; font-weight: 700; color: #6B7280; white-space: nowrap; cursor: pointer; border-bottom: 2px solid transparent; }
        .ord-tab--active { color: #F07316; border-bottom-color: #F07316; }
        .ord-search { flex: 1; min-width: 200px; padding: 9px 14px; border: 1px solid #E5E1DC; border-radius: 6px; font-size: 13px; background: #FFFFFF; }
        .ord-sort { padding: 9px 12px; border: 1px solid #E5E1DC; border-radius: 6px; font-size: 12px; background: #FFFFFF; color: #0B2447; }
        .ord-row { display: grid; grid-template-columns: 40px 1.6fr 1fr 1fr auto auto; gap: 14px; align-items: center; }
        .ord-row-icon { width: 40px; height: 40px; border-radius: 8px; background: #FFF4ED; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .ord-view-btn { padding: 7px 14px; border: 1px solid #E5E1DC; border-radius: 6px; color: #0B2447; font-size: 11.5px; font-weight: 700; font-family: 'Syne',sans-serif; text-decoration: none; white-space: nowrap; }
        .ord-view-btn:hover { border-color: #F07316; color: #F07316; }
        .ord-page-btn { min-width: 28px; height: 28px; border: 1px solid #E5E1DC; border-radius: 6px; background: #FFFFFF; color: #6B7280; font-size: 12px; cursor: pointer; }
        .ord-page-btn--active { background: #F07316; border-color: #F07316; color: #FFFFFF; }
        .ord-bom-card { background: #FFF4ED; border: 1px solid rgba(240,115,22,0.25); border-radius: 10px; padding: 18px; }
        @media(max-width:1150px){ .ord-layout { grid-template-columns: 200px 1fr; } .ord-layout > aside { grid-column: span 2; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; } .ord-row { grid-template-columns: 1fr 1fr; row-gap: 10px; } .ord-row-icon { display: none; } }
        @media(max-width:768px){ .ord-layout { grid-template-columns: 1fr; } .ord-layout > aside { grid-template-columns: 1fr; } .ord-layout > :first-child { display: none; } }
        @media(max-width:640px){ .ord-pad { padding-left: 16px !important; padding-right: 16px !important; } }
      `}</style>
    </div>
  );
}
