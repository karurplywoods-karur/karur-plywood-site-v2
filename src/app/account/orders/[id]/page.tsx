'use client';
// src/app/account/orders/[id]/page.tsx — order detail with timeline
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/auth-client';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: string; desc: string }> = {
  pending:    { color:'#F97316', bg:'rgba(249,115,22,0.12)',  label:'Pending',    icon:'⏳', desc:'Order placed, awaiting confirmation.' },
  confirmed:  { color:'#25D366', bg:'rgba(37,211,102,0.12)', label:'Confirmed',  icon:'✅', desc:'Order confirmed by our team.' },
  processing: { color:'#3B82F6', bg:'rgba(59,130,246,0.12)', label:'Processing', icon:'⚙️', desc:'Your items are being prepared.' },
  shipped:    { color:'#A855F7', bg:'rgba(168,85,247,0.12)', label:'Shipped',    icon:'🚚', desc:'Order is on its way to you.' },
  delivered:  { color:'#10B981', bg:'rgba(16,185,129,0.12)', label:'Delivered',  icon:'📦', desc:'Order delivered successfully.' },
  cancelled:  { color:'#EF4444', bg:'rgba(239,68,68,0.12)',  label:'Cancelled',  icon:'❌', desc:'Order has been cancelled.' },
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
  }, [id]);

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#070F1F', display:'flex', alignItems:'center', justifyContent:'center', color:'#7A8EA8' }}>
      ⏳ Loading order...
    </div>
  );
  if (!order) return null;

  const s = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const isCancelled = order.status === 'cancelled';
  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div style={{ minHeight:'100vh', background:'#070F1F', padding:'80px 0 60px' }}>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'32px 48px' }} className="od-pad">

        {/* Breadcrumb */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24, fontSize:12, color:'#7A8EA8', fontFamily:"'Syne',sans-serif", flexWrap:'wrap' }}>
          <Link href="/account" style={{ color:'#7A8EA8', textDecoration:'none' }}>Account</Link>
          <span>›</span>
          <Link href="/account/orders" style={{ color:'#7A8EA8', textDecoration:'none' }}>Orders</Link>
          <span>›</span>
          <span style={{ color:'#F97316' }}>{order.order_number}</span>
        </div>

        {/* Order header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:14 }}>
          <div>
            <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'2rem', letterSpacing:'.05em', color:'#F8F9FB', marginBottom:6 }}>
              {order.order_number}
            </h1>
            <div style={{ fontSize:13, color:'#7A8EA8' }}>
              Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}
            </div>
          </div>
          <div style={{ background:s.bg, border:`1px solid ${s.color}40`, borderRadius:8, padding:'12px 20px', textAlign:'center' }}>
            <div style={{ fontSize:22 }}>{s.icon}</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.78rem', fontWeight:700, color:s.color, letterSpacing:'.1em', textTransform:'uppercase' }}>{s.label}</div>
          </div>
        </div>

        {/* Invoice download */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <a
            href={`/account/orders/${id}/invoice`}
            target="_blank"
            rel="noopener"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)', color: '#F97316', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none' }}
          >
            📄 Download GST Invoice
          </a>
          <a
            href={`/orders/track?ref=${order.order_number}&phone=`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#7A8EA8', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none' }}
          >
            📦 Track Order
          </a>
        </div>

        {/* Status Timeline */}
        {!isCancelled && (
          <div style={{ background:'rgba(25,55,109,0.2)', border:'1px solid rgba(249,115,22,0.1)', borderRadius:10, padding:'20px 24px', marginBottom:20 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.65rem', fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:'#F97316', marginBottom:16 }}>
              Order Progress
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:0, overflowX:'auto', paddingBottom:4 }}>
              {STATUS_STEPS.map((step, i) => {
                const sc = STATUS_CONFIG[step];
                const done = currentStep >= i;
                const active = currentStep === i;
                return (
                  <div key={step} style={{ display:'flex', alignItems:'center', flex: i < STATUS_STEPS.length - 1 ? '1' : 'none' }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, flexShrink:0 }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background: done ? sc.color : 'rgba(255,255,255,0.06)', border:`2px solid ${done ? sc.color : 'rgba(255,255,255,0.1)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, transition:'all .3s' }}>
                        {done ? (active ? sc.icon : '✓') : ''}
                      </div>
                      <div style={{ fontSize:10, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color: done ? sc.color : '#7A8EA8', textAlign:'center', whiteSpace:'nowrap' }}>
                        {sc.label}
                      </div>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div style={{ flex:1, height:2, background: currentStep > i ? STATUS_CONFIG[STATUS_STEPS[i]].color : 'rgba(255,255,255,0.08)', margin:'0 6px', marginBottom:22, borderRadius:2, transition:'background .3s' }} />
                    )}
                  </div>
                );
              })}
            </div>
            {order.tracking_number && (
              <div style={{ marginTop:14, fontSize:12, color:'#A855F7', fontFamily:'monospace', background:'rgba(168,85,247,0.08)', padding:'8px 12px', borderRadius:4 }}>
                🚚 Tracking Number: <strong>{order.tracking_number}</strong>
              </div>
            )}
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:20 }} className="od-grid">

          {/* Left */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Items */}
            <div style={{ background:'rgba(25,55,109,0.2)', border:'1px solid rgba(249,115,22,0.1)', borderRadius:10, padding:'18px 20px' }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.65rem', fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:'#F97316', marginBottom:14 }}>
                Order Items
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {(order.order_items || []).map((item: any) => (
                  <div key={item.id} style={{ display:'flex', gap:14, alignItems:'center', paddingBottom:12, borderBottom:'1px solid rgba(249,115,22,0.06)' }}>
                    <div style={{ width:56, height:56, borderRadius:6, overflow:'hidden', background:'rgba(11,36,71,0.6)', border:'1px solid rgba(249,115,22,0.1)', flexShrink:0, position:'relative' }}>
                      {item.product_image ? (
                        <Image src={item.product_image} alt={item.product_name} fill style={{ objectFit:'cover' }} sizes="56px" />
                      ) : (
                        <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>📦</div>
                      )}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'.85rem', color:'#F8F9FB', marginBottom:2 }}>
                        {item.product_name}
                        {item.variant_label && <span style={{ color:'#7A8EA8', fontWeight:500 }}> · {item.variant_label}</span>}
                      </div>
                      {item.category_name && <div style={{ fontSize:11, color:'#F97316', marginBottom:2 }}>{item.category_name}</div>}
                      <div style={{ fontSize:12, color:'#7A8EA8' }}>
                        ₹{item.unit_price.toLocaleString('en-IN')}{item.unit ? ` / ${item.unit}` : ''} × {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'.9rem', color:'#F97316' }}>
                      ₹{item.line_total.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery address */}
            <div style={{ background:'rgba(25,55,109,0.2)', border:'1px solid rgba(249,115,22,0.1)', borderRadius:10, padding:'18px 20px' }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.65rem', fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:'#F97316', marginBottom:12 }}>
                Delivery Address
              </div>
              <div style={{ fontSize:13, color:'#A8BCCC', lineHeight:1.8 }}>
                <strong style={{ color:'#F8F9FB' }}>{order.delivery_name}</strong><br />
                {order.delivery_line1}{order.delivery_line2 ? `, ${order.delivery_line2}` : ''}<br />
                {order.delivery_google_map_link && (
                  <>
                    <a href={order.delivery_google_map_link} target="_blank" rel="noopener" style={{ color:'#4ADE80', textDecoration:'none', fontWeight:700 }}>View Map Location</a><br />
                  </>
                )}
                {order.delivery_city}, {order.delivery_state} — {order.delivery_pincode}<br />
                📞 {order.delivery_phone}
              </div>
            </div>

            {order.notes && (
              <div style={{ background:'rgba(25,55,109,0.2)', border:'1px solid rgba(249,115,22,0.1)', borderRadius:10, padding:'18px 20px' }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.65rem', fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:'#F97316', marginBottom:8 }}>Your Notes</div>
                <div style={{ fontSize:13, color:'#7A8EA8', fontStyle:'italic' }}>{order.notes}</div>
              </div>
            )}
          </div>

          {/* Right — summary */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'rgba(25,55,109,0.2)', border:'1px solid rgba(249,115,22,0.1)', borderRadius:10, padding:'18px 20px' }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'.65rem', fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:'#F97316', marginBottom:14 }}>
                Payment Summary
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8, fontSize:13 }}>
                <div style={{ display:'flex', justifyContent:'space-between', color:'#7A8EA8' }}>
                  <span>Subtotal</span><span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', color:'#7A8EA8' }}>
                  <span>Delivery</span>
                  <span>{order.delivery_charge === 0 ? 'Confirmed by team' : `₹${order.delivery_charge.toLocaleString('en-IN')}`}</span>
                </div>
                {order.discount > 0 && (
                  <div style={{ display:'flex', justifyContent:'space-between', color:'#4ADE80' }}>
                    <span>Discount</span><span>-₹{order.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid rgba(249,115,22,0.15)', paddingTop:10, marginTop:4, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'.95rem', color:'#F8F9FB' }}>
                  <span>Total</span>
                  <span style={{ color:'#F97316' }}>₹{order.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid rgba(249,115,22,0.1)' }}>
                <div style={{ fontSize:11, color:'#7A8EA8', marginBottom:4, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase' }}>Payment Method</div>
                <div style={{ fontSize:14, color:'#F8F9FB' }}>
                  {order.payment_method === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment'}
                </div>
                <div style={{ fontSize:11, color: order.payment_status === 'paid' ? '#4ADE80' : '#F97316', marginTop:4, fontFamily:"'Syne',sans-serif", fontWeight:700 }}>
                  {order.payment_status === 'paid' ? '✅ Paid' : '⏳ Payment Pending'}
                </div>
              </div>
            </div>

            <Link href="/products" style={{ display:'block', padding:'12px 0', background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.25)', borderRadius:6, color:'#F97316', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'.72rem', letterSpacing:'.1em', textTransform:'uppercase', textAlign:'center', textDecoration:'none' }}>
              🛒 Shop Again
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .od-pad { padding:32px 48px; }
        .od-grid { grid-template-columns:1fr 320px; }
        @media(max-width:768px){
          .od-pad { padding:20px !important; }
          .od-grid { grid-template-columns:1fr !important; }
        }
      `}</style>
    </div>
  );
}