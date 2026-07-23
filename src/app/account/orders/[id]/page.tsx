'use client';
// src/app/account/orders/[id]/page.tsx — order detail with timeline
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/auth-client';

const STATUS_STEPS = ['confirmed', 'processing', 'shipped', 'delivered'];
const STEP_LABELS: Record<string, string> = { confirmed: 'Order Confirmed', processing: 'Packed', shipped: 'Shipped', delivered: 'Delivered' };
const STEP_DESC: Record<string, string> = {
  confirmed: 'Your order has been confirmed and payment received.',
  processing: 'Your order has been carefully packed.',
  shipped: 'Your order has been shipped.',
  delivered: 'Your order has been delivered.',
};

const STATUS_BADGE: Record<string, { color: string; bg: string; border: string; label: string }> = {
  pending:    { color: '#F07316', bg: '#FFF4ED', border: '#fed7aa', label: 'Pending' },
  confirmed:  { color: '#F07316', bg: '#FFF4ED', border: '#fed7aa', label: 'Confirmed' },
  processing: { color: '#F07316', bg: '#FFF4ED', border: '#fed7aa', label: 'Processing' },
  shipped:    { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'Shipped' },
  delivered:  { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Delivered' },
  cancelled:  { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Cancelled' },
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const supabase = createClient();
  const [order,   setOrder]   = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth/login'); return; }
      fetch(`/api/orders/${id}`).then(r => r.json()).then(data => {
        if (data.error) router.push('/account/orders');
        else { setOrder(data); setLoading(false); }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading || !order) return (
    <div style={{ minHeight: '100vh', background: '#FAF8F5', paddingTop: 58, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
      ⏳ Loading order...
    </div>
  );

  const badge = STATUS_BADGE[order.status] || STATUS_BADGE.pending;
  const isCancelled = order.status === 'cancelled';
  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F5', paddingTop: 58 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 48px 60px' }} className="od-pad">

        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 14 }}>
          <Link href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Home</Link> › <Link href="/account" style={{ color: '#9CA3AF', textDecoration: 'none' }}>My Account</Link> › <Link href="/account/orders" style={{ color: '#9CA3AF', textDecoration: 'none' }}>My Orders</Link> › <span style={{ color: '#F07316', fontWeight: 600 }}>Order Details</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(1.4rem,2.6vw,1.8rem)', fontWeight: 700, color: '#0B2447', margin: '0 0 4px' }}>Order Details</h1>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Detailed information about your order</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <a href={`/account/orders/${id}/invoice`} target="_blank" rel="noopener" className="od-btn-outline">↓ Download Invoice</a>
            <Link href="/products" className="od-btn-outline">↻ Reorder</Link>
          </div>
        </div>

        <div className="od-card" style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div className="od-label">Order ID</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, color: '#0B2447', fontSize: 15 }}>{order.order_number}</div>
            </div>
            <span style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>{badge.label}</span>
          </div>
          <div><div className="od-label">Order Date</div><div className="od-val">{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div></div>
          <div><div className="od-label">Payment Method</div><div className="od-val">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</div></div>
          <div><div className="od-label">Total Amount</div><div className="od-val" style={{ color: '#F07316' }}>₹{order.total?.toLocaleString('en-IN')} <span style={{ fontSize: 11, color: order.payment_status === 'paid' ? '#16a34a' : '#F07316', fontWeight: 700 }}>{order.payment_status === 'paid' ? 'Paid' : 'Pending'}</span></div></div>
          <div>
            <div className="od-label">Delivery Address</div>
            <div className="od-val" style={{ fontWeight: 400, fontSize: 12.5 }}>{order.delivery_name}<br />{order.delivery_city}, {order.delivery_state} — {order.delivery_pincode}<br />📞 {order.delivery_phone}</div>
          </div>
        </div>

        <div className="od-grid">
          <div>
            {/* Timeline card */}
            {!isCancelled && (
              <div className="od-card" style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, color: '#0B2447', marginBottom: 20 }}>Order Tracking</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {STATUS_STEPS.map((step, i) => {
                    const done = currentStep >= i;
                    const active = currentStep === i;
                    const isLast = i === STATUS_STEPS.length - 1;
                    return (
                      <div key={step} style={{ display: 'flex', gap: 14 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: 26, height: 26, borderRadius: '50%', background: done ? (active ? '#FFF4ED' : '#f0fdf4') : '#FFFFFF', border: `2px solid ${done ? (active ? '#F07316' : '#16a34a') : '#E5E1DC'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: active ? '#F07316' : '#16a34a', flexShrink: 0 }}>
                            {done ? '✓' : ''}
                          </div>
                          {!isLast && <div style={{ width: 2, flex: 1, minHeight: 30, background: currentStep > i ? '#16a34a' : '#E5E1DC' }} />}
                        </div>
                        <div style={{ paddingBottom: isLast ? 0 : 22 }}>
                          <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, color: done ? '#0B2447' : '#9CA3AF' }}>{STEP_LABELS[step]}</div>
                          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{done ? STEP_DESC[step] : 'Pending'}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Delivery details */}
            <div className="od-card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, color: '#0B2447' }}>Delivery Details</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: order.delivery_google_map_link ? 16 : 0 }}>
                {order.tracking_number && (
                  <div><div className="od-label">Tracking ID</div><div className="od-val">{order.tracking_number}</div></div>
                )}
                <div>
                  <div className="od-label">Delivered To</div>
                  <div style={{ fontSize: 13, color: '#374151' }}>{order.delivery_name}<br />{order.delivery_line1}{order.delivery_line2 ? `, ${order.delivery_line2}` : ''}<br />{order.delivery_city}, {order.delivery_state} — {order.delivery_pincode}<br />📞 {order.delivery_phone}</div>
                </div>
              </div>
              {order.delivery_google_map_link && (
                <a href={order.delivery_google_map_link} target="_blank" rel="noopener" className="od-btn-outline" style={{ display: 'inline-flex' }}>📍 Track on Delivery</a>
              )}
            </div>

            {order.notes && (
              <div className="od-card" style={{ marginBottom: 16 }}>
                <div className="od-label" style={{ marginBottom: 8 }}>Your Notes</div>
                <div style={{ fontSize: 13, color: '#4B5563', fontStyle: 'italic' }}>{order.notes}</div>
              </div>
            )}

            {/* Need help */}
            <div className="od-card" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 24 }}>🎧</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, color: '#0B2447' }}>Need Help?</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>Our support team is here to help you with any queries.</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a href="https://wa.me/919159666538" target="_blank" rel="noopener" className="od-btn-outline" style={{ color: '#16a34a', borderColor: '#bbf7d0' }}>💬 WhatsApp</a>
                <a href="tel:+919600707777" className="od-btn-outline">📞 Call Us</a>
                <a href="mailto:info@karurplywood.com" className="od-btn-outline">✉️ Email Us</a>
              </div>
            </div>
          </div>

          {/* Right — order items summary */}
          <aside>
            <div className="od-card">
              <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, color: '#0B2447', marginBottom: 14 }}>Order Items ({order.order_items?.length || 0})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
                {(order.order_items || []).map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 6, overflow: 'hidden', background: '#F2EDE5', flexShrink: 0, position: 'relative' }}>
                      {item.product_image
                        ? <Image src={item.product_image} alt={item.product_name} fill style={{ objectFit: 'cover' }} sizes="48px" />
                        : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📦</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0B2447', lineHeight: 1.3 }}>{item.product_name}</div>
                      <div style={{ fontSize: 11, color: '#6B7280' }}>{item.variant_label ? `${item.variant_label} · ` : ''}Qty {item.quantity}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0B2447', whiteSpace: 'nowrap' }}>₹{item.line_total?.toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #E5E1DC', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280' }}><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString('en-IN')}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280' }}><span>Shipping</span><span style={{ color: order.delivery_charge ? '#0B2447' : '#16a34a' }}>{order.delivery_charge ? `₹${order.delivery_charge.toLocaleString('en-IN')}` : 'Free'}</span></div>
                {order.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}><span>Discount</span><span>−₹{order.discount.toLocaleString('en-IN')}</span></div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Inter',sans-serif", fontWeight: 700, color: '#0B2447', fontSize: 15, borderTop: '1px solid #E5E1DC', paddingTop: 8, marginTop: 2 }}>
                  <span>Total Amount</span><span style={{ color: order.payment_status === 'paid' ? '#0B2447' : '#0B2447' }}>₹{order.total?.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ textAlign: 'right', fontSize: 11, color: order.payment_status === 'paid' ? '#16a34a' : '#F07316', fontWeight: 700 }}>{order.payment_status === 'paid' ? 'Paid' : 'Pending'}</div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .od-card { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; padding: 20px; box-shadow: 0 1px 4px rgba(11,36,71,0.05); }
        .od-label { font-size: 10px; color: #9CA3AF; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 3px; }
        .od-val { font-size: 13px; color: #0B2447; font-weight: 700; font-family: 'Inter',sans-serif; }
        .od-btn-outline { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border: 1px solid #E5E1DC; border-radius: 6px; color: #0B2447; font-size: 12px; font-weight: 700; font-family: 'Inter',sans-serif; text-decoration: none; white-space: nowrap; background: #FFFFFF; }
        .od-btn-outline:hover { border-color: #F07316; color: #F07316; }
        .od-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; align-items: start; }
        @media(max-width:900px){ .od-grid { grid-template-columns: 1fr !important; } }
        @media(max-width:640px){ .od-pad { padding-left: 16px !important; padding-right: 16px !important; } }
      `}</style>
    </div>
  );
}
