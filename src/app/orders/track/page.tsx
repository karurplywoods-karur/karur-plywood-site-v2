'use client';
// src/app/orders/track/page.tsx
// Public order tracking â€” no login needed.
// Customer enters order number (from confirmation email) + last 4 digits of phone.
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: string; desc: string }> = {
  pending:    { color: '#F97316', label: 'Order Placed',    icon: 'ðŸ“‹', desc: 'Your order has been received and is awaiting confirmation from our team.' },
  confirmed:  { color: '#25D366', label: 'Confirmed',       icon: 'âœ…', desc: 'Your order is confirmed. We are preparing it for dispatch.' },
  processing: { color: '#3B82F6', label: 'Being Prepared',  icon: 'ðŸ­', desc: 'Your items are being picked and packed at our depot.' },
  shipped:    { color: '#A855F7', label: 'Out for Delivery', icon: 'ðŸš›', desc: 'Your order is on its way. Please ensure someone is available to receive it.' },
  delivered:  { color: '#10B981', label: 'Delivered',       icon: 'ðŸ“¦', desc: 'Your order has been delivered. Thank you for shopping with us!' },
  cancelled:  { color: '#EF4444', label: 'Cancelled',       icon: 'âŒ', desc: 'This order has been cancelled.' },
};

function TrackingContent() {
  const params = useSearchParams();
  const [ref,    setRef]    = useState(params.get('ref') || '');
  const [phone,  setPhone]  = useState(params.get('phone') || '');
  const [order,  setOrder]  = useState<any>(null);
  const [error,  setError]  = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-lookup if params present in URL
  useEffect(() => {
    if (params.get('ref') && params.get('phone')) handleTrack();
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

  return (
    <div style={{ minHeight: '80vh', background: '#070F1F', padding: 'calc(58px + 40px) 0 80px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>ðŸ“¦</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 700, color: '#F8F9FB', margin: '0 0 8px' }}>
            Track Your Order
          </h1>
          <p style={{ color: '#7A8EA8', fontSize: 14, margin: 0 }}>
            Enter your order number and the last 4 digits of your phone number.
          </p>
        </div>

        {/* Lookup form */}
        <div style={{ background: 'rgba(11,36,71,0.5)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 16, padding: '28px 24px', marginBottom: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: '#7A8EA8', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Order Number</div>
              <input
                value={ref}
                onChange={e => setRef(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleTrack()}
                placeholder="KP-2026-0001"
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#F8F9FB', fontFamily: 'Outfit,monospace', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#7A8EA8', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Last 4 Digits of Phone</div>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 4))}
                onKeyDown={e => e.key === 'Enter' && handleTrack()}
                placeholder="6538"
                maxLength={4}
                inputMode="numeric"
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#F8F9FB', fontFamily: 'Outfit,monospace', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {error && <div style={{ fontSize: 13, color: '#F87171', marginBottom: 12 }}>âš ï¸ {error}</div>}

          <button onClick={handleTrack} disabled={loading}
            style={{ width: '100%', padding: '13px', borderRadius: 10, background: loading ? '#5c4a2e' : 'linear-gradient(135deg,#C8884A,#8B5E2A)', color: '#fff', border: 'none', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '0.8rem', letterSpacing: '.12em', textTransform: 'uppercase', cursor: loading ? 'default' : 'pointer' }}>
            {loading ? 'Looking upâ€¦' : 'Track Order â†’'}
          </button>
        </div>

        {/* Result */}
        {order && s && (
          <div style={{ background: 'rgba(11,36,71,0.5)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 16, overflow: 'hidden' }}>

            {/* Status header */}
            <div style={{ background: `${s.color}18`, borderBottom: `1px solid ${s.color}30`, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 32 }}>{s.icon}</span>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: s.color, marginBottom: 3 }}>
                  {order.order_number}
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.5rem', fontWeight: 700, color: '#F8F9FB', lineHeight: 1 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 13, color: '#7A8EA8', marginTop: 3 }}>{s.desc}</div>
              </div>
            </div>

            {/* Progress timeline */}
            {!isCancelled && (
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(249,115,22,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {STATUS_STEPS.map((step, i) => {
                    const sc = STATUS_CONFIG[step];
                    const done    = i <= currentStep;
                    const current = i === currentStep;
                    return (
                      <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                        {/* Connector line */}
                        {i > 0 && (
                          <div style={{ position: 'absolute', left: '-50%', top: 14, width: '100%', height: 2, background: i <= currentStep ? '#F97316' : 'rgba(249,115,22,0.15)', zIndex: 0, transition: 'background 0.3s' }} />
                        )}
                        {/* Circle */}
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? (current ? '#F97316' : '#5c3a1e') : 'rgba(249,115,22,0.08)', border: `2px solid ${done ? '#F97316' : 'rgba(249,115,22,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, zIndex: 1, transition: 'all 0.3s' }}>
                          {done ? (current ? sc.icon : 'âœ“') : ''}
                        </div>
                        <div style={{ fontSize: 9, color: done ? '#C8884A' : '#5A6E80', fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 5, textAlign: 'center' }}>
                          {sc.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Order details */}
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#7A8EA8', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 3 }}>Delivery To</div>
                  <div style={{ fontSize: 14, color: '#F0E8DC' }}>{order.delivery_name}</div>
                  <div style={{ fontSize: 13, color: '#7A8EA8' }}>{order.delivery_city} â€” {order.delivery_pincode}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#7A8EA8', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 3 }}>Payment</div>
                  <div style={{ fontSize: 14, color: '#F0E8DC' }}>{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</div>
                  <div style={{ fontSize: 13, color: '#7A8EA8' }}>Total: â‚¹{order.total?.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {order.tracking_number && (
                <div style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#A855F7', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 2 }}>Tracking Reference</div>
                  <div style={{ fontSize: 15, color: '#F8F9FB', fontFamily: 'monospace', fontWeight: 600 }}>{order.tracking_number}</div>
                </div>
              )}

              {/* Items */}
              <div style={{ fontSize: 11, color: '#7A8EA8', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10 }}>Items</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {order.order_items?.map((item: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#F0E8DC', fontWeight: 600 }}>{item.product_name}</div>
                      {item.variant_label && <div style={{ fontSize: 11, color: '#7A8EA8' }}>{item.variant_label}</div>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, color: '#F97316', fontWeight: 600 }}>â‚¹{item.line_total?.toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: 11, color: '#7A8EA8' }}>Qty: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ borderTop: '1px solid rgba(249,115,22,0.1)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {order.discount_amount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#4ADE80' }}>
                    <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
                    <span>âˆ’â‚¹{order.discount_amount?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#F8F9FB', fontSize: 15 }}>
                  <span>Total</span>
                  <span>â‚¹{order.total?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Help */}
              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <a href="https://wa.me/919159666538" target="_blank" rel="noopener"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#25D366', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  ðŸ’¬ Questions? Chat with us on WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Link href="/products" style={{ fontSize: 13, color: '#7A8EA8', textDecoration: 'none' }}>â† Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '80vh', background: '#070F1F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7A8EA8' }}>
        Loading...
      </div>
    }>
      <TrackingContent />
    </Suspense>
  );
}

