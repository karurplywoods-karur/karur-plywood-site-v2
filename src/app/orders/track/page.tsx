'use client';
// src/app/orders/track/page.tsx
// Public order tracking — no login needed.
// Customer enters order number (from confirmation email) + last 4 digits of phone.
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const STATUS_STEPS = ['confirmed', 'processing', 'shipped', 'delivered'];
const STEP_LABELS: Record<string, string> = {
  confirmed: 'Order Confirmed', processing: 'Packed', shipped: 'Shipped', delivered: 'Delivered',
};
const STEP_ICONS: Record<string, string> = {
  confirmed: '✓', processing: '📦', shipped: '🚚', delivered: '📬',
};

const STATUS_CONFIG: Record<string, { label: string; desc: string }> = {
  pending:           { label: 'Order Placed', desc: 'Your order has been received and is awaiting confirmation.' },
  confirmed:         { label: 'Order Confirmed', desc: 'Your order has been confirmed and payment received.' },
  processing:        { label: 'Packed', desc: 'Your order has been carefully packed.' },
  shipped:           { label: 'Shipped', desc: 'Your order is on the way and will reach you soon.' },
  out_for_delivery:  { label: 'Out for Delivery', desc: 'Your order is out for delivery.' },
  delivered:         { label: 'Delivered', desc: 'Your order has been delivered.' },
  cancelled:         { label: 'Cancelled', desc: 'This order has been cancelled.' },
};

function TrackingContent() {
  const params = useSearchParams();
  const [ref,    setRef]    = useState(params.get('ref') || '');
  const [phone,  setPhone]  = useState(params.get('phone') || '');
  const [order,  setOrder]  = useState<any>(null);
  const [error,  setError]  = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.get('ref') && params.get('phone')) handleTrack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTrack = async () => {
    if (!ref.trim() || !phone.trim()) { setError('Please fill in both fields.'); return; }
    setError(''); setLoading(true); setOrder(null);
    try {
      const res = await fetch(`/api/orders/track?ref=${encodeURIComponent(ref.trim().toUpperCase())}&phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Could not find this order.'); return; }
      setOrder(data);
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  const s = order ? (STATUS_CONFIG[order.status] || STATUS_CONFIG.pending) : null;
  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1;
  const isCancelled = order?.status === 'cancelled';

  // ── LOOKUP FORM (no order loaded yet) ──
  if (!order) {
    return (
      <div style={{ minHeight: '80vh', background: '#FAF8F5', padding: 'calc(58px + 40px) 0 80px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(1.5rem,3vw,1.9rem)', fontWeight: 700, color: '#0B2447', margin: '0 0 8px' }}>
              Track Your Order
            </h1>
            <p style={{ color: '#6B7280', fontSize: 14, margin: 0 }}>
              Enter your order number and the last 4 digits of your phone number.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E5E1DC', borderRadius: 14, padding: '28px 24px', boxShadow: '0 1px 4px rgba(11,36,71,0.05)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>Order Number</div>
                <input value={ref} onChange={e => setRef(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && handleTrack()}
                  placeholder="KP-2026-0001"
                  style={{ width: '100%', background: '#FAF8F5', border: '1px solid #E5E1DC', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#0B2447', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>Last 4 Digits of Phone</div>
                <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 4))} onKeyDown={e => e.key === 'Enter' && handleTrack()}
                  placeholder="6538" maxLength={4} inputMode="numeric"
                  style={{ width: '100%', background: '#FAF8F5', border: '1px solid #E5E1DC', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#0B2447', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            {error && <div style={{ fontSize: 13, color: '#dc2626', marginBottom: 12 }}>⚠️ {error}</div>}
            <button onClick={handleTrack} disabled={loading}
              style={{ width: '100%', padding: '13px', borderRadius: 8, background: loading ? '#D9640F' : '#F07316', color: '#fff', border: 'none', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '0.8rem', letterSpacing: '.1em', textTransform: 'uppercase', cursor: loading ? 'default' : 'pointer' }}>
              {loading ? 'Looking up…' : 'Track Order →'}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link href="/products" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>← Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT (2-column layout) ──
  return (
    <div style={{ minHeight: '80vh', background: '#FAF8F5', padding: 'calc(58px + 24px) 0 60px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }} className="trk-pad">

        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>
          <Link href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Home</Link> › <span style={{ color: '#F07316', fontWeight: 600 }}>Track Order</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
          <div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(1.4rem,2.6vw,1.8rem)', fontWeight: 700, color: '#0B2447', margin: '0 0 4px' }}>Track Your Order</h1>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Stay updated with your order status in real-time</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <a href="https://wa.me/919159666538" target="_blank" rel="noopener" style={{ fontSize: 12, color: '#16a34a', fontFamily: "'Syne',sans-serif", fontWeight: 700, textDecoration: 'none' }}>💬 Need help? Contact Support</a>
            <button onClick={() => setOrder(null)} style={{ padding: '8px 16px', border: '1px solid #E5E1DC', borderRadius: 6, background: '#FFFFFF', color: '#0B2447', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>← Track Another Order</button>
          </div>
        </div>

        <div className="trk-grid">
          <div>
            {/* Status card */}
            <div className="trk-card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between', marginBottom: 24 }}>
                <div><div className="trk-label">Order ID</div><div className="trk-val">{order.order_number}</div></div>
                <div><div className="trk-label">Order Date</div><div className="trk-val">{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div></div>
                <div><div className="trk-label">Payment Method</div><div className="trk-val">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</div></div>
                <div><div className="trk-label">Total Amount</div><div className="trk-val" style={{ color: '#F07316' }}>₹{order.total?.toLocaleString('en-IN')}</div></div>
                <div>
                  <div className="trk-label">Order Status</div>
                  <span style={{ display: 'inline-block', marginTop: 2, background: isCancelled ? '#fef2f2' : '#f0fdf4', color: isCancelled ? '#dc2626' : '#16a34a', border: `1px solid ${isCancelled ? '#fecaca' : '#bbf7d0'}`, borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>{s!.label}</span>
                </div>
              </div>

              {/* Timeline */}
              {!isCancelled && (
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', padding: '0 6px' }}>
                  {STATUS_STEPS.map((step, i) => {
                    const done = i <= currentStep;
                    const current = i === currentStep;
                    return (
                      <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                        {i > 0 && <div style={{ position: 'absolute', right: '50%', top: 18, width: '100%', height: 2, background: i <= currentStep ? '#16a34a' : '#E5E1DC', zIndex: 0 }} />}
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: done ? (current ? '#FFF4ED' : '#f0fdf4') : '#FFFFFF', border: `2px solid ${done ? (current ? '#F07316' : '#16a34a') : '#E5E1DC'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, zIndex: 1, color: current ? '#F07316' : '#16a34a' }}>
                          {done ? (current ? STEP_ICONS[step] : '✓') : ''}
                        </div>
                        <div style={{ fontSize: 11, color: done ? '#0B2447' : '#9CA3AF', fontFamily: "'Syne',sans-serif", fontWeight: 700, marginTop: 8, textAlign: 'center' }}>{STEP_LABELS[step]}</div>
                        <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{done ? '' : 'Pending'}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Status banner */}
            {!isCancelled && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '16px 20px', marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 22 }}>🚚</span>
                  <div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: '#0B2447' }}>{s!.desc}</div>
                  </div>
                </div>
                {order.estimated_delivery && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>Estimated Delivery</div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: '#16a34a', fontSize: 15 }}>{order.estimated_delivery}</div>
                  </div>
                )}
              </div>
            )}

            {/* Shipment details */}
            <div className="trk-card">
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: '#0B2447', marginBottom: 16 }}>Shipment Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 18 }}>
                {order.tracking_number && (
                  <div>
                    <div className="trk-label">Tracking ID</div>
                    <div className="trk-val">{order.tracking_number}</div>
                  </div>
                )}
                <div>
                  <div className="trk-label">Shipping Address</div>
                  <div style={{ fontSize: 13, color: '#374151' }}>{order.delivery_name}<br />{order.delivery_city} — {order.delivery_pincode}</div>
                </div>
                <div>
                  <div className="trk-label">Contact</div>
                  <a href="https://wa.me/919159666538" target="_blank" rel="noopener" style={{ fontSize: 13, color: '#16a34a', fontWeight: 700, textDecoration: 'none' }}>💬 Chat on WhatsApp</a>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside>
            <div className="trk-card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: '#0B2447' }}>Order Items ({order.order_items?.length || 0})</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
                {order.order_items?.map((item: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#0B2447', fontWeight: 600 }}>{item.product_name}</div>
                      {item.variant_label && <div style={{ fontSize: 11, color: '#6B7280' }}>{item.variant_label}</div>}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0B2447', whiteSpace: 'nowrap' }}>₹{item.line_total?.toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
              {order.discount_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#16a34a', borderTop: '1px solid #E5E1DC', paddingTop: 10 }}>
                  <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ''}</span><span>−₹{order.discount_amount?.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Syne',sans-serif", fontWeight: 700, color: '#0B2447', fontSize: 15, borderTop: '1px solid #E5E1DC', paddingTop: 10, marginTop: 6 }}>
                <span>Total</span><span>₹{order.total?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="trk-help-card">
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '.85rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 3 }}>Need Help With Your Order?</div>
                <div style={{ fontSize: 11, color: '#93A3BC', marginBottom: 10 }}>Our support team is here to assist you</div>
                <a href="tel:+919600707777" style={{ display: 'block', fontSize: 12, color: '#FF9A45', textDecoration: 'none', marginBottom: 4 }}>📞 +91 96007 07777</a>
                <a href="mailto:info@karurplywood.com" style={{ display: 'block', fontSize: 12, color: '#FF9A45', textDecoration: 'none' }}>✉️ info@karurplywood.com</a>
              </div>
              <div className="trk-help-avatar">K</div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .trk-grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
        .trk-card { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; padding: 22px; box-shadow: 0 1px 4px rgba(11,36,71,0.05); }
        .trk-label { font-size: 10px; color: #9CA3AF; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 3px; }
        .trk-val { font-size: 13.5px; color: #0B2447; font-weight: 700; font-family: 'Syne',sans-serif; }
        .trk-help-card { background: #0B2447; border-radius: 10px; padding: 18px; display: flex; align-items: center; justify-content: space-between; gap: 14px; }
        .trk-help-avatar { width: 44px; height: 44px; border-radius: 50%; background: #F07316; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-family: 'Syne',sans-serif; font-weight: 800; font-size: 16px; flex-shrink: 0; border: 2px solid rgba(240,115,22,0.4); }
        @media(max-width:900px){ .trk-grid { grid-template-columns: 1fr !important; } }
        @media(max-width:640px){ .trk-pad { padding-left:16px !important; padding-right:16px !important; } }
      `}</style>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '80vh', background: '#FAF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', paddingTop: 58 }}>
        Loading...
      </div>
    }>
      <TrackingContent />
    </Suspense>
  );
}
