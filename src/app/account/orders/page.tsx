'use client';
// src/app/account/orders/page.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/auth-client';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  pending:    { color:'#F97316', bg:'rgba(249,115,22,0.12)',  label:'Pending',    icon:'â³' },
  confirmed:  { color:'#25D366', bg:'rgba(37,211,102,0.12)', label:'Confirmed',  icon:'âœ…' },
  processing: { color:'#3B82F6', bg:'rgba(59,130,246,0.12)', label:'Processing', icon:'âš™ï¸' },
  shipped:    { color:'#A855F7', bg:'rgba(168,85,247,0.12)', label:'Shipped',    icon:'ðŸšš' },
  delivered:  { color:'#10B981', bg:'rgba(16,185,129,0.12)', label:'Delivered',  icon:'ðŸ“¦' },
  cancelled:  { color:'#EF4444', bg:'rgba(239,68,68,0.12)',  label:'Cancelled',  icon:'âŒ' },
};

export default function OrdersPage() {
  const router = useRouter();
  const supabase = createClient();
  const [orders,  setOrders]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth/login?next=/account/orders'); return; }
      fetch('/api/orders').then(r => r.json()).then(data => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      });
    });
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div style={{ minHeight:'100vh', background:'#070F1F', padding:'80px 0 60px' }}>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'32px 48px' }} className="orders-pad">

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:28 }}>
          <Link href="/account" style={{ color:'#7A8EA8', fontSize:13, textDecoration:'none', fontFamily:"'Syne',sans-serif" }}>
            â† My Account
          </Link>
          <span style={{ color:'#7A8EA8' }}>â€º</span>
          <span style={{ color:'#F8F9FB', fontSize:13, fontFamily:"'Syne',sans-serif", fontWeight:700 }}>My Orders</span>
        </div>

        <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'2rem', letterSpacing:'.05em', color:'#F8F9FB', marginBottom:20 }}>
          MY ORDERS
        </h1>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:6, marginBottom:24, flexWrap:'wrap' }}>
          {['all', ...Object.keys(STATUS_CONFIG)].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding:'7px 14px', borderRadius:4, border:'1px solid',
                borderColor: filter===f ? '#F97316' : 'rgba(255,255,255,0.1)',
                background: filter===f ? 'rgba(249,115,22,0.12)' : 'transparent',
                color: filter===f ? '#F97316' : '#7A8EA8',
                fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11,
                letterSpacing:'.1em', textTransform:'uppercase', cursor:'pointer',
              }}>
              {f === 'all' ? `All (${orders.length})` : STATUS_CONFIG[f]?.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'#7A8EA8' }}>â³ Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <div style={{ fontSize:48, marginBottom:14 }}>ðŸ“¦</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.6rem', color:'#F8F9FB', marginBottom:8 }}>
              {filter === 'all' ? 'No orders yet' : `No ${STATUS_CONFIG[filter]?.label} orders`}
            </div>
            <Link href="/products" style={{ color:'#F97316', fontSize:13, textDecoration:'none' }}>Start shopping â†’</Link>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {filtered.map(order => {
              const s = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              return (
                <Link key={order.id} href={`/account/orders/${order.id}`} style={{ textDecoration:'none' }}>
                  <div style={{ background:'rgba(25,55,109,0.25)', border:'1px solid rgba(249,115,22,0.12)', borderRadius:10, padding:'18px 20px', transition:'border-color .2s', display:'grid', gridTemplateColumns:'1fr auto', gap:16, alignItems:'center' }}
                    className="order-row">
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, flexWrap:'wrap' }}>
                        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'.9rem', color:'#F8F9FB' }}>
                          {order.order_number}
                        </span>
                        <span style={{ fontSize:9, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', background:s.bg, color:s.color, padding:'3px 9px', borderRadius:2 }}>
                          {s.icon} {s.label}
                        </span>
                      </div>
                      <div style={{ fontSize:12, color:'#7A8EA8', marginBottom:6 }}>
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
                        {' Â· '}{order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
                        {' Â· '}{order.payment_method === 'cod' ? 'ðŸ’µ COD' : 'ðŸ’³ Online'}
                      </div>
                      {order.tracking_number && (
                        <div style={{ fontSize:11, color:'#A855F7', fontFamily:'monospace' }}>
                          ðŸšš Tracking: {order.tracking_number}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.4rem', color:'#F97316', letterSpacing:'.03em' }}>
                        â‚¹{order.total.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize:11, color:'#F97316', fontFamily:"'Syne',sans-serif", fontWeight:700, marginTop:4 }}>
                        View Details â†’
                      </div>
                      <a
                        href={`/account/orders/${order.id}/invoice`}
                        target="_blank"
                        rel="noopener"
                        onClick={e => e.stopPropagation()}
                        style={{ fontSize:10, color:'#7A8EA8', fontFamily:"'Syne',sans-serif", fontWeight:600, textDecoration:'none', display:'inline-block', marginTop:4 }}>
                        ðŸ“„ Invoice
                      </a>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <style>{`
        .orders-pad { padding:32px 48px; }
        .order-row:hover { border-color:rgba(249,115,22,0.35) !important; }
        @media(max-width:640px){ .orders-pad { padding:20px !important; } }
      `}</style>
    </div>
  );
}
