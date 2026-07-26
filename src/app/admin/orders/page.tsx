'use client';
// src/app/admin/orders/page.tsx — Full order management
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Order {
  id: string; order_number: string; status: string;
  total: number; subtotal: number; delivery_charge: number;
  payment_method: string; payment_status: string;
  delivery_name: string; delivery_phone: string;
  delivery_city: string; delivery_pincode: string;
  delivery_line1: string; delivery_line2: string;
  delivery_google_map_link?: string;
  delivery_state: string; tracking_number: string;
  admin_notes: string; notes: string; created_at: string;
  order_items: any[];
  customers: { full_name: string; email: string; phone: string };
  // Phase 1 — order fulfillment / delivery system
  fulfillment_status?: string;
  verification_status?: 'pending' | 'verified' | 'unavailable';
  delivery_zone_code?: string | null;
  estimated_delivery_date?: string | null;
  verified_by?: string;
  verified_at?: string;
  assigned_staff_name?: string;
  distributor_id?: string | null;
  reservation_expires_at?: string | null;
  is_reservation?: boolean;
}

const STATUS_STEPS = ['pending','confirmed','processing','shipped','delivered'];
const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  pending:    { color:'#F97316', bg:'rgba(249,115,22,0.12)',  label:'Pending',    icon:'⏳' },
  confirmed:  { color:'#25D366', bg:'rgba(37,211,102,0.12)', label:'Confirmed',  icon:'✅' },
  processing: { color:'#3B82F6', bg:'rgba(59,130,246,0.12)', label:'Processing', icon:'⚙️' },
  shipped:    { color:'#A855F7', bg:'rgba(168,85,247,0.12)', label:'Shipped',    icon:'🚚' },
  delivered:  { color:'#10B981', bg:'rgba(16,185,129,0.12)', label:'Delivered',  icon:'📦' },
  cancelled:  { color:'#EF4444', bg:'rgba(239,68,68,0.12)',  label:'Cancelled',  icon:'❌' },
};

// Fulfillment pipeline (Phase 1 — Reserve Order flow). Only meaningfully
// shown for orders that went through /api/orders/reserve; READY_STOCK/Buy Now
// orders sit at CONFIRMED and follow the legacy status pipeline above instead.
const FULFILLMENT_CONFIG: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  RESERVED:            { color:'#F97316', bg:'rgba(249,115,22,0.12)', label:'Reserved — Verifying',  icon:'🙏' },
  AVAILABILITY_CHECK:  { color:'#F97316', bg:'rgba(249,115,22,0.12)', label:'Checking Availability', icon:'🔍' },
  CONFIRMED:           { color:'#25D366', bg:'rgba(37,211,102,0.12)', label:'Confirmed',             icon:'✅' },
  AWAITING_PAYMENT:    { color:'#FDE047', bg:'rgba(253,224,71,0.14)', label:'Awaiting Payment',       icon:'💳' },
  PAYMENT_RECEIVED:    { color:'#4ADE80', bg:'rgba(74,222,128,0.14)', label:'Payment Received',       icon:'💰' },
  PREPARING_ORDER:     { color:'#3B82F6', bg:'rgba(59,130,246,0.12)', label:'Preparing Order',        icon:'📦' },
  OUT_FOR_DELIVERY:    { color:'#A855F7', bg:'rgba(168,85,247,0.12)', label:'Out for Delivery',       icon:'🚚' },
  DELIVERED:           { color:'#10B981', bg:'rgba(16,185,129,0.12)', label:'Delivered',              icon:'✅' },
  RESERVATION_EXPIRED: { color:'#EF4444', bg:'rgba(239,68,68,0.12)',  label:'Reservation Expired',    icon:'⏰' },
  UNAVAILABLE:         { color:'#EF4444', bg:'rgba(239,68,68,0.12)',  label:'Unavailable',            icon:'⚠️' },
  CANCELLED:           { color:'#EF4444', bg:'rgba(239,68,68,0.12)',  label:'Cancelled',              icon:'❌' },
};
const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919159666538';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders,    setOrders]    = useState<Order[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('all');
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [editNote,  setEditNote]  = useState<Record<string, string>>({});
  const [editTrack, setEditTrack] = useState<Record<string, string>>({});
  const [saving,    setSaving]    = useState<string | null>(null);
  const [msg,       setMsg]       = useState<{ text: string; ok: boolean } | null>(null);

  const showMsg = (text: string, ok = true) => {
    setMsg({ text, ok }); setTimeout(() => setMsg(null), 3000);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const url = filter === 'all' ? '/api/orders/admin' : `/api/orders/admin?status=${filter}`;
    const res = await fetch(url);
    if (res.status === 401) { router.push('/admin'); return; }
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [filter, router]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateOrder = async (id: string, payload: any) => {
    setSaving(id);
    const res = await fetch('/api/orders/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...payload }),
    });
    setSaving(null);
    if (res.ok) {
      showMsg('✅ Order updated. Status email sent to customer.');
      fetchOrders();
    } else {
      showMsg('❌ Update failed.', false);
    }
  };

  const setFulfillmentStatus = async (id: string, fulfillment_status: string, note?: string) => {
    setSaving(id);
    const res = await fetch('/api/orders/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, fulfillment_status, note }),
    });
    setSaving(null);
    if (res.ok) { showMsg('✅ Updated. Customer notified on WhatsApp.'); fetchOrders(); }
    else { const d = await res.json().catch(() => ({})); showMsg(`❌ ${d.error || 'Update failed.'}`, false); }
  };

  const verifyAvailability = async (id: string, action: 'confirm' | 'unavailable', note?: string) => {
    setSaving(id);
    const res = await fetch(`/api/orders/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, note }),
    });
    setSaving(null);
    if (res.ok) { showMsg(action === 'confirm' ? '✅ Availability confirmed.' : '⚠️ Marked unavailable.'); fetchOrders(); }
    else { const d = await res.json().catch(() => ({})); showMsg(`❌ ${d.error || 'Action failed.'}`, false); }
  };

  const generatePaymentLink = async (id: string) => {
    setSaving(id);
    const res = await fetch(`/api/orders/${id}/payment-link`, { method: 'POST' });
    setSaving(null);
    if (res.ok) { showMsg('✅ Payment link sent to customer.'); fetchOrders(); }
    else { const d = await res.json().catch(() => ({})); showMsg(`❌ ${d.error || 'Could not generate link.'}`, false); }
  };

  const stats = {
    total:     orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    shipped:   orders.filter(o => o.status === 'shipped').length,
    revenue:   orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0),
  };

  const inp: React.CSSProperties = {
    background:'rgba(255,255,255,0.05)', border:'1px solid rgba(249,115,22,0.2)',
    borderRadius:4, padding:'7px 10px', color:'#F8F9FB',
    fontFamily:"'Inter',sans-serif", fontSize:12, outline:'none',
  };

  const actionBtn = (color: string): React.CSSProperties => ({
    padding:'8px 14px', borderRadius:4, border:`1px solid ${color}55`, background:`${color}1F`,
    color, fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:11, letterSpacing:'.06em',
    textTransform:'uppercase', cursor:'pointer',
  });

  return (
    <div style={{ minHeight:'100vh', background:'#070F1F', color:'#F8F9FB', fontFamily:"'Inter',sans-serif" }}>

      {/* Topbar */}
      <div style={{ background:'rgba(11,36,71,0.9)', borderBottom:'1px solid rgba(249,115,22,0.15)', padding:'0 28px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, backdropFilter:'blur(10px)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <button onClick={() => router.push('/admin/dashboard')}
            style={{ background:'none', border:'1px solid rgba(249,115,22,0.2)', borderRadius:4, color:'#7A8EA8', padding:'5px 11px', cursor:'pointer', fontFamily:"'Inter',sans-serif", fontSize:11, letterSpacing:'.08em', textTransform:'uppercase' }}>
            ← Dashboard
          </button>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, letterSpacing:'.06em' }}>
            🛒 Order Management
          </div>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          {msg && (
            <div style={{ fontSize:12, padding:'5px 12px', borderRadius:4, background:msg.ok ? 'rgba(37,211,102,0.1)':'rgba(248,113,113,0.1)', color:msg.ok ? '#4ADE80':'#F87171', border:`1px solid ${msg.ok ? 'rgba(37,211,102,0.25)':'rgba(248,113,113,0.25)'}` }}>
              {msg.text}
            </div>
          )}
          <button onClick={fetchOrders} style={{ background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', borderRadius:4, color:'#F97316', padding:'6px 14px', cursor:'pointer', fontFamily:"'Inter',sans-serif", fontSize:11, letterSpacing:'.12em', textTransform:'uppercase' }}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'28px' }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:24 }} className="admin-stats">
          {[
            { label:'Total Orders',  val:stats.total,     color:'#F97316' },
            { label:'Pending',       val:stats.pending,   color:'#F97316' },
            { label:'Confirmed',     val:stats.confirmed, color:'#25D366' },
            { label:'Shipped',       val:stats.shipped,   color:'#A855F7' },
            { label:'Revenue (Delivered)', val:`₹${stats.revenue.toLocaleString('en-IN')}`, color:'#FDE047' },
          ].map(s => (
            <div key={s.label} style={{ background:'rgba(25,55,109,0.35)', border:'1px solid rgba(249,115,22,0.12)', borderRadius:8, padding:'16px 18px' }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.8rem', letterSpacing:'.04em', color:s.color, lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:10, fontFamily:"'Inter',sans-serif", fontWeight:700, letterSpacing:'.15em', textTransform:'uppercase', color:'#7A8EA8', marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap' }}>
          {['all', ...Object.keys(STATUS_CONFIG)].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:'7px 14px', borderRadius:3, border:'1px solid', fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:11, letterSpacing:'.1em', textTransform:'uppercase', cursor:'pointer',
                borderColor: filter===f ? '#F97316' : 'rgba(255,255,255,0.1)',
                background:  filter===f ? 'rgba(249,115,22,0.12)' : 'transparent',
                color:       filter===f ? '#F97316' : '#7A8EA8',
              }}>
              {f === 'all' ? 'All Orders' : `${STATUS_CONFIG[f].icon} ${STATUS_CONFIG[f].label}`}
            </button>
          ))}
        </div>

        {/* Orders */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'#7A8EA8' }}>⏳ Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🛒</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.6rem', color:'#F8F9FB' }}>NO ORDERS</div>
            <p style={{ color:'#7A8EA8', marginTop:8 }}>Orders placed by customers will appear here.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {orders.map(order => {
              const s = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const fStatus = order.fulfillment_status || 'CONFIRMED';
              const fs = FULFILLMENT_CONFIG[fStatus] || FULFILLMENT_CONFIG.CONFIRMED;
              const isReserveFlow = !!order.is_reservation;
              const isOpen = expanded === order.id;
              return (
                <div key={order.id} style={{ background:'rgba(25,55,109,0.25)', border:`1px solid ${isOpen ? 'rgba(249,115,22,0.3)' : 'rgba(249,115,22,0.1)'}`, borderRadius:10, overflow:'hidden', transition:'border-color .2s' }}>

                  {/* Order row */}
                  <div style={{ padding:'16px 20px', display:'grid', gridTemplateColumns:'auto 1fr auto auto', gap:16, alignItems:'center', cursor:'pointer' }}
                    onClick={() => setExpanded(isOpen ? null : order.id)}>
                    <div>
                      <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:'.88rem', color:'#F8F9FB', marginBottom:3 }}>
                        {order.order_number}
                      </div>
                      <div style={{ fontSize:11, color:'#7A8EA8' }}>
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize:13, color:'#F8F9FB', fontWeight:600, marginBottom:2 }}>
                        {order.customers?.full_name || '—'}
                      </div>
                      <div style={{ fontSize:11, color:'#7A8EA8' }}>
                        {order.customers?.email} · {order.delivery_city}
                      </div>
                      <div style={{ fontSize:11, color:'#7A8EA8' }}>
                        {order.order_items?.length || 0} items · {order.payment_method === 'cod' ? '💵 COD' : '💳 Online'}
                      </div>
                    </div>

                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.3rem', color:'#F97316', letterSpacing:'.03em' }}>
                        ₹{order.total.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize:9, fontFamily:"'Inter',sans-serif", fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color: order.payment_status === 'paid' ? '#4ADE80' : '#F97316' }}>
                        {order.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                      </div>
                    </div>

                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      {isReserveFlow && (
                        <span style={{ fontSize:9, fontFamily:"'Inter',sans-serif", fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', background:fs.bg, color:fs.color, padding:'4px 10px', borderRadius:2 }}>
                          {fs.icon} {fs.label}
                        </span>
                      )}
                      <span style={{ fontSize:9, fontFamily:"'Inter',sans-serif", fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', background:s.bg, color:s.color, padding:'4px 10px', borderRadius:2 }}>
                        {s.icon} {s.label}
                      </span>
                      <span style={{ color:'#7A8EA8', fontSize:14 }}>{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{ borderTop:'1px solid rgba(249,115,22,0.1)', padding:'20px' }}>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:20 }} className="order-detail-grid">

                        {/* Customer */}
                        <div style={{ background:'rgba(7,15,31,0.5)', borderRadius:6, padding:'14px 16px' }}>
                          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'.16em', textTransform:'uppercase', color:'#F97316', marginBottom:10 }}>Customer</div>
                          <div style={{ fontSize:13, color:'#F8F9FB', fontWeight:600, marginBottom:3 }}>{order.customers?.full_name}</div>
                          <div style={{ fontSize:12, color:'#7A8EA8', lineHeight:1.7 }}>
                            {order.customers?.email}<br/>
                            📞 {order.customers?.phone || order.delivery_phone}
                          </div>
                          <a href={`https://wa.me/${(order.customers?.phone || order.delivery_phone).replace(/\D/g,'')}?text=Hi%2C+this+is+Karur+Plywood+regarding+order+${order.order_number}`}
                            target="_blank" rel="noopener"
                            style={{ display:'inline-flex', alignItems:'center', gap:5, marginTop:10, padding:'6px 12px', background:'#25D366', color:'white', borderRadius:4, fontSize:11, fontFamily:"'Inter',sans-serif", fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', textDecoration:'none' }}>
                            💬 WhatsApp
                          </a>
                        </div>

                        {/* Delivery */}
                        <div style={{ background:'rgba(7,15,31,0.5)', borderRadius:6, padding:'14px 16px' }}>
                          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'.16em', textTransform:'uppercase', color:'#F97316', marginBottom:10 }}>Delivery Address</div>
                          <div style={{ fontSize:12, color:'#A8BCCC', lineHeight:1.8 }}>
                            <strong style={{ color:'#F8F9FB' }}>{order.delivery_name}</strong><br/>
                            {order.delivery_line1}{order.delivery_line2 ? `, ${order.delivery_line2}` : ''}<br/>
                            {order.delivery_google_map_link && (
                              <>
                                <a href={order.delivery_google_map_link} target="_blank" rel="noopener" style={{ color:'#4ADE80', textDecoration:'none', fontWeight:700 }}>View Map Location</a><br/>
                              </>
                            )}
                            {order.delivery_city}, {order.delivery_state}<br/>
                            PIN: {order.delivery_pincode}<br/>
                            📞 {order.delivery_phone}
                          </div>
                        </div>

                        {/* Payment */}
                        <div style={{ background:'rgba(7,15,31,0.5)', borderRadius:6, padding:'14px 16px' }}>
                          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'.16em', textTransform:'uppercase', color:'#F97316', marginBottom:10 }}>Payment</div>
                          <div style={{ fontSize:12, color:'#7A8EA8', display:'flex', flexDirection:'column', gap:5 }}>
                            <div style={{ display:'flex', justifyContent:'space-between' }}><span>Subtotal</span><span style={{ color:'#F8F9FB' }}>₹{order.subtotal.toLocaleString('en-IN')}</span></div>
                            <div style={{ display:'flex', justifyContent:'space-between' }}><span>Delivery</span><span style={{ color:'#F8F9FB' }}>₹{order.delivery_charge.toLocaleString('en-IN')}</span></div>
                            <div style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid rgba(249,115,22,0.1)', paddingTop:6, marginTop:2, fontWeight:700, fontSize:13 }}>
                              <span style={{ color:'#F8F9FB' }}>Total</span>
                              <span style={{ color:'#F97316' }}>₹{order.total.toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ marginTop:4, fontSize:11, color: order.payment_status === 'paid' ? '#4ADE80' : '#F97316', fontWeight:700 }}>
                              {order.payment_method === 'cod' ? '💵 Cash on Delivery' : '💳 Online'} · {order.payment_status}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Fulfillment & Delivery (Phase 1 — Reserve Order flow only) */}
                      {isReserveFlow && (
                        <div style={{ background:'rgba(7,15,31,0.5)', borderRadius:6, padding:'14px 16px', marginBottom:20 }}>
                          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'.16em', textTransform:'uppercase', color:'#F97316', marginBottom:12 }}>
                            Fulfillment & Delivery
                          </div>
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, fontSize:12 }} className="fulfillment-grid">
                            <div>
                              <div style={{ color:'#7A8EA8', fontSize:10, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:3 }}>Delivery Zone</div>
                              <div style={{ color:'#F8F9FB', fontWeight:600 }}>{order.delivery_zone_code ? `Zone ${order.delivery_zone_code}` : '—'}</div>
                            </div>
                            <div>
                              <div style={{ color:'#7A8EA8', fontSize:10, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:3 }}>Estimated Delivery</div>
                              <div style={{ color:'#F8F9FB', fontWeight:600 }}>
                                {order.estimated_delivery_date ? new Date(order.estimated_delivery_date).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : '—'}
                              </div>
                            </div>
                            <div>
                              <div style={{ color:'#7A8EA8', fontSize:10, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:3 }}>Verification</div>
                              <div style={{ color: order.verification_status === 'verified' ? '#4ADE80' : order.verification_status === 'unavailable' ? '#F87171' : '#F97316', fontWeight:700 }}>
                                {order.verification_status === 'verified' ? '✅ Verified' : order.verification_status === 'unavailable' ? '⚠️ Unavailable' : '⏳ Pending'}
                                {order.verified_by ? ` · ${order.verified_by}` : ''}
                              </div>
                            </div>
                            <div>
                              <div style={{ color:'#7A8EA8', fontSize:10, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:3 }}>Payment Window</div>
                              <div style={{ color:'#F8F9FB', fontWeight:600 }}>
                                {order.reservation_expires_at && fStatus === 'AWAITING_PAYMENT'
                                  ? `Expires ${new Date(order.reservation_expires_at).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}`
                                  : '—'}
                              </div>
                            </div>
                          </div>
                          <div style={{ marginTop:12 }}>
                            <label style={{ display:'block', fontSize:10, color:'#7A8EA8', fontFamily:"'Inter',sans-serif", fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:4 }}>Assigned Staff</label>
                            <input style={{ ...inp, width:'100%', maxWidth:260 }}
                              placeholder="Staff name handling this order"
                              defaultValue={order.assigned_staff_name || ''}
                              onBlur={e => e.target.value !== (order.assigned_staff_name || '') && updateOrder(order.id, { assigned_staff_name: e.target.value })}
                            />
                          </div>
                        </div>
                      )}


                      <div style={{ background:'rgba(7,15,31,0.4)', borderRadius:6, padding:'14px 16px', marginBottom:16 }}>
                        <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'.16em', textTransform:'uppercase', color:'#F97316', marginBottom:12 }}>Order Items</div>
                        {(order.order_items || []).map((item: any) => (
                          <div key={item.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid rgba(249,115,22,0.06)', fontSize:13 }}>
                            <div>
                              <div style={{ color:'#F8F9FB', fontWeight:600 }}>
                                {item.product_name}
                                {item.variant_label && <span style={{ color:'#F97316', fontWeight:500 }}> · {item.variant_label}</span>}
                              </div>
                              <div style={{ color:'#7A8EA8', fontSize:11 }}>{item.category_name} · ₹{item.unit_price.toLocaleString('en-IN')}{item.unit ? `/${item.unit}` : ''}</div>
                            </div>
                            <div style={{ display:'flex', gap:20, alignItems:'center' }}>
                              <span style={{ color:'#7A8EA8' }}>× {item.quantity}</span>
                              <span style={{ color:'#F97316', fontWeight:700, fontFamily:"'Inter',sans-serif" }}>₹{item.line_total.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }} className="order-actions-grid">

                        {/* Status update */}
                        <div style={{ background:'rgba(7,15,31,0.4)', borderRadius:6, padding:'14px 16px' }}>
                          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'.16em', textTransform:'uppercase', color:'#F97316', marginBottom:10 }}>Update Status</div>
                          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
                            {[...STATUS_STEPS, 'cancelled'].map(st => {
                              const sc = STATUS_CONFIG[st];
                              return (
                                <button key={st} onClick={() => updateOrder(order.id, { status: st, admin_notes: editNote[order.id] || order.admin_notes, tracking_number: editTrack[order.id] || order.tracking_number })}
                                  disabled={order.status === st || saving === order.id}
                                  style={{ padding:'6px 10px', borderRadius:3, border:'1px solid', cursor: order.status === st ? 'default' : 'pointer', fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:10, letterSpacing:'.08em', textTransform:'uppercase', opacity: order.status === st ? 1 : 0.8,
                                    borderColor: order.status === st ? sc.color : 'rgba(255,255,255,0.1)',
                                    background:  order.status === st ? sc.bg : 'transparent',
                                    color:       order.status === st ? sc.color : '#7A8EA8',
                                  }}>
                                  {sc.icon} {sc.label}
                                </button>
                              );
                            })}
                          </div>
                          <div style={{ fontSize:11, color:'#7A8EA8', fontFamily:"'Inter',sans-serif" }}>
                            📧 Status email will be sent to customer automatically.
                          </div>
                        </div>

                        {/* Notes + Tracking */}
                        <div style={{ background:'rgba(7,15,31,0.4)', borderRadius:6, padding:'14px 16px', display:'flex', flexDirection:'column', gap:10 }}>
                          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'.16em', textTransform:'uppercase', color:'#F97316', marginBottom:2 }}>Tracking & Notes</div>
                          <div>
                            <label style={{ display:'block', fontSize:10, color:'#7A8EA8', fontFamily:"'Inter',sans-serif", fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:4 }}>Tracking Number</label>
                            <input style={{ ...inp, width:'100%' }}
                              placeholder="Enter tracking number"
                              value={editTrack[order.id] ?? order.tracking_number}
                              onChange={e => setEditTrack(prev => ({ ...prev, [order.id]: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label style={{ display:'block', fontSize:10, color:'#7A8EA8', fontFamily:"'Inter',sans-serif", fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:4 }}>Admin Notes (internal)</label>
                            <textarea style={{ ...inp, width:'100%', resize:'none' }} rows={2}
                              placeholder="Internal notes for this order"
                              value={editNote[order.id] ?? order.admin_notes}
                              onChange={e => setEditNote(prev => ({ ...prev, [order.id]: e.target.value }))}
                            />
                          </div>
                          <button onClick={() => updateOrder(order.id, { status: order.status, admin_notes: editNote[order.id] ?? order.admin_notes, tracking_number: editTrack[order.id] ?? order.tracking_number })}
                            disabled={saving === order.id}
                            style={{ padding:'8px 0', background:'rgba(249,115,22,0.12)', border:'1px solid rgba(249,115,22,0.3)', borderRadius:4, color:'#F97316', fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:11, letterSpacing:'.1em', textTransform:'uppercase', cursor:'pointer' }}>
                            {saving === order.id ? '⏳ Saving...' : '✓ Save Notes & Tracking'}
                          </button>
                        </div>
                      </div>

                      {isReserveFlow && (
                        <div style={{ background:'rgba(7,15,31,0.4)', borderRadius:6, padding:'14px 16px', marginTop:16 }}>
                          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'.16em', textTransform:'uppercase', color:'#F97316', marginBottom:10 }}>
                            Fulfillment Actions
                          </div>
                          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                            {(fStatus === 'RESERVED' || fStatus === 'AVAILABILITY_CHECK') && (
                              <>
                                <button onClick={() => verifyAvailability(order.id, 'confirm')} disabled={saving === order.id}
                                  style={actionBtn('#25D366')}>✅ Verify Availability</button>
                                <button onClick={() => { const note = window.prompt('Reason (shown to customer, optional):') || undefined; verifyAvailability(order.id, 'unavailable', note); }}
                                  disabled={saving === order.id} style={actionBtn('#F87171')}>⚠️ Mark Unavailable</button>
                              </>
                            )}
                            {fStatus === 'CONFIRMED' && (
                              <button onClick={() => generatePaymentLink(order.id)} disabled={saving === order.id}
                                style={actionBtn('#FDE047')}>💳 Generate Payment Link</button>
                            )}
                            {fStatus === 'AWAITING_PAYMENT' && (
                              <button onClick={() => setFulfillmentStatus(order.id, 'PAYMENT_RECEIVED')} disabled={saving === order.id}
                                style={actionBtn('#4ADE80')}>💰 Mark Paid (manual)</button>
                            )}
                            {fStatus === 'PAYMENT_RECEIVED' && (
                              <button onClick={() => setFulfillmentStatus(order.id, 'PREPARING_ORDER')} disabled={saving === order.id}
                                style={actionBtn('#3B82F6')}>📦 Prepare Order</button>
                            )}
                            {fStatus === 'PREPARING_ORDER' && (
                              <button onClick={() => setFulfillmentStatus(order.id, 'OUT_FOR_DELIVERY')} disabled={saving === order.id}
                                style={actionBtn('#A855F7')}>🚚 Dispatch</button>
                            )}
                            {fStatus === 'OUT_FOR_DELIVERY' && (
                              <button onClick={() => setFulfillmentStatus(order.id, 'DELIVERED')} disabled={saving === order.id}
                                style={actionBtn('#10B981')}>✅ Mark Delivered</button>
                            )}
                            {!['DELIVERED','CANCELLED','PAYMENT_RECEIVED','PREPARING_ORDER','OUT_FOR_DELIVERY'].includes(fStatus) && (
                              <button onClick={() => { if (window.confirm('Cancel this reservation? The customer will be notified. No payment has been collected.')) setFulfillmentStatus(order.id, 'CANCELLED'); }}
                                disabled={saving === order.id} style={actionBtn('#EF4444')}>❌ Cancel</button>
                            )}
                          </div>
                          <div style={{ fontSize:11, color:'#7A8EA8', fontFamily:"'Inter',sans-serif", marginTop:10 }}>
                            💬 Each action sends the matching WhatsApp update to the customer automatically — no manual copy-paste needed.
                          </div>
                        </div>
                      )}

                      {order.notes && (
                        <div style={{ marginTop:12, padding:'10px 14px', background:'rgba(249,115,22,0.04)', border:'1px solid rgba(249,115,22,0.08)', borderRadius:6, fontSize:13, color:'#7A8EA8', fontStyle:'italic' }}>
                          💬 Customer note: "{order.notes}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .admin-stats { grid-template-columns:repeat(5,1fr); }
        .order-detail-grid { grid-template-columns:1fr 1fr 1fr; }
        .order-actions-grid { grid-template-columns:1fr 1fr; }
        .fulfillment-grid { grid-template-columns:repeat(4,1fr); }
        select option, textarea { background:#0d1f3a; }
        input:focus, textarea:focus, select:focus { border-color:#F97316 !important; }
        @media(max-width:900px){
          .admin-stats { grid-template-columns:repeat(2,1fr) !important; }
          .order-detail-grid { grid-template-columns:1fr !important; }
          .order-actions-grid { grid-template-columns:1fr !important; }
          .fulfillment-grid { grid-template-columns:1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
