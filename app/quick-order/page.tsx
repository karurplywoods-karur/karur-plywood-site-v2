'use client';
// src/app/quick-order/page.tsx
import { useEffect, useState, useCallback } from 'react';
import ProductCard from '@/components/ProductCard';
import { CartProvider, useCart } from '@/lib/CartContext';
import { trackWAClick, generateTrackingId } from '@/lib/analytics';
import type { Product } from '@/lib/types';

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999';

function QuickOrderInner() {
  const { items, add, inc, dec, setQty, clear, total, count } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetch('/api/products?type=quick')
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  // Unique categories from products
  const cats = Array.from(new Set(products.map(p => p.categories?.name).filter(Boolean))) as string[];
  const filtered = activeFilter === 'all' ? products : products.filter(p => p.categories?.name === activeFilter);

  const handleWhatsAppOrder = useCallback(() => {
    if (items.length === 0) return;

    const lines = items.map(i =>
      `• ${i.product.name} x${i.quantity}${i.product.price ? ` (₹${(i.product.price * i.quantity).toLocaleString('en-IN')})` : ''}`
    ).join('\n');
    const totalLine = total > 0 ? `\n\nTotal: ₹${total.toLocaleString('en-IN')}` : '';
    const text = `Hi, I want to place a quick order:\n\n${lines}${totalLine}\n\nPlease confirm availability and delivery.`;

    // GA4 tracking
    trackWAClick({
      source: 'cart',
      quantity: items.reduce((s, i) => s + i.quantity, 0),
      total_value: total,
    });

    // Supabase tracking — fire and forget
    const trackingId = generateTrackingId();
    fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Quick Order Cart',
        phone: 'N/A',
        message: text,
        tracking_id: trackingId,
        source: 'website',
        wa_source: 'cart',
        quantity: items.reduce((s, i) => s + i.quantity, 0),
        total_value: total,
      }),
    }).catch(() => {});

    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, '_blank');
  }, [items, total]);

  const getCartItem = (p: Product) => items.find(i => i.product.id === p.id);

  return (
    <>
      {/* Hero */}
      <section style={{ background:'linear-gradient(135deg,#0D1C10,#091410)',borderBottom:'1px solid rgba(37,211,102,0.15)',padding:'64px 0' }}>
        <div style={{ maxWidth:1200,margin:'0 auto',padding:'0 48px' }}>
          <div style={{ display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:20 }}>
            <div>
              <div style={{ display:'inline-flex',alignItems:'center',gap:10,background:'rgba(37,211,102,0.1)',border:'1px solid rgba(37,211,102,0.2)',borderRadius:20,padding:'5px 14px',fontSize:12,color:'#25D366',fontWeight:600,marginBottom:14 }}>
                ⚡ Quick Order — Fast Moving Items
              </div>
              <h1 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(36px,5vw,58px)',fontWeight:700,color:'#F0E8DC',lineHeight:1.1,marginBottom:10 }}>
                Add to Cart,<br/><span style={{ color:'#25D366',fontStyle:'italic',fontWeight:400 }}>Order on WhatsApp.</span>
              </h1>
              <p style={{ fontSize:15,color:'#9A8070',maxWidth:460 }}>Select items and quantities, then send your order directly on WhatsApp. Fast delivery within Karur.</p>
            </div>
            {/* Cart summary */}
            {count > 0 && (
              <div style={{ background:'rgba(37,211,102,0.1)',border:'1px solid rgba(37,211,102,0.25)',borderRadius:14,padding:'20px 24px',minWidth:200 }}>
                <div style={{ fontSize:12,color:'#9A8070',marginBottom:4 }}>Cart Summary</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:700,color:'#25D366',lineHeight:1 }}>{count} items</div>
                {total > 0 && <div style={{ fontSize:14,color:'#C8B8A0',marginTop:4 }}>≈ ₹{total.toLocaleString('en-IN')}</div>}
                <button onClick={() => setShowCart(true)}
                  style={{ marginTop:14,width:'100%',padding:'10px 0',borderRadius:8,background:'#25D366',color:'white',border:'none',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'Outfit,sans-serif' }}>
                  View Cart →
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <div style={{ maxWidth:1200,margin:'0 auto',padding:'48px 48px' }} className="page-pad">

        {/* Category filter */}
        <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:36 }}>
          {['all',...cats].map(c => (
            <button key={c} onClick={() => setActiveFilter(c)}
              style={{ padding:'7px 16px',borderRadius:20,border:'1px solid',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'Outfit,sans-serif',transition:'all 0.2s',
                borderColor: activeFilter===c ? '#25D366' : 'rgba(37,211,102,0.15)',
                background: activeFilter===c ? 'rgba(37,211,102,0.15)' : 'transparent',
                color: activeFilter===c ? '#25D366' : '#9A8070' }}>
              {c === 'all' ? `🏷️ All (${products.length})` : c}
            </button>
          ))}
        </div>

        {/* Products */}
        {loading ? (
          <div style={{ textAlign:'center',padding:'80px 0' }}>
            <div style={{ fontSize:40,marginBottom:12 }}>⏳</div>
            <div style={{ color:'#9A8070' }}>Loading products...</div>
          </div>
        ) : (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:18 }} className="quick-grid">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} mode="quick"
                cartItem={getCartItem(p)}
                onAdd={add} onInc={inc} onDec={dec} onSetQty={setQty} />
            ))}
          </div>
        )}

        {/* Sticky cart bar */}
        {count > 0 && (
          <div style={{ position:'fixed',bottom:0,left:0,right:0,background:'#1C140D',borderTop:'1px solid rgba(37,211,102,0.25)',padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,zIndex:500,flexWrap:'wrap' }}>
            <div style={{ display:'flex',alignItems:'center',gap:16 }}>
              <div style={{ width:36,height:36,background:'#25D366',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:16,color:'white' }}>{count}</div>
              <div>
                <div style={{ fontSize:13,fontWeight:600,color:'#F0E8DC' }}>{count} item{count>1?'s':''} in cart</div>
                {total > 0 && <div style={{ fontSize:12,color:'#9A8070' }}>Est. ₹{total.toLocaleString('en-IN')}</div>}
              </div>
            </div>
            <div style={{ display:'flex',gap:10 }}>
              <button onClick={() => setShowCart(true)}
                style={{ padding:'10px 20px',borderRadius:8,background:'transparent',border:'1px solid rgba(37,211,102,0.3)',color:'#25D366',fontWeight:600,fontSize:13,cursor:'pointer',fontFamily:'Outfit,sans-serif' }}>
                View Cart
              </button>
              <button onClick={handleWhatsAppOrder}
                style={{ padding:'10px 24px',borderRadius:8,background:'#25D366',border:'none',color:'white',fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'Outfit,sans-serif',display:'flex',alignItems:'center',gap:8 }}>
                💬 Order on WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div onClick={() => setShowCart(false)} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:9000,display:'flex',alignItems:'flex-end',justifyContent:'center' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width:'100%',maxWidth:520,background:'#1C140D',borderRadius:'20px 20px 0 0',padding:'28px 24px',maxHeight:'80vh',overflow:'auto',border:'1px solid rgba(200,136,74,0.2)',borderBottom:'none' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24 }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:700,color:'#F0E8DC' }}>Your Cart ({count})</div>
              <button onClick={() => setShowCart(false)} style={{ background:'none',border:'1px solid rgba(200,136,74,0.2)',borderRadius:8,color:'#9A8070',padding:'6px 12px',cursor:'pointer',fontFamily:'Outfit,sans-serif' }}>✕ Close</button>
            </div>

            {items.length === 0 ? (
              <div style={{ textAlign:'center',padding:'40px 0',color:'#9A8070' }}>Your cart is empty.</div>
            ) : (
              <>
                {items.map(item => (
                  <div key={item.product.id} style={{ display:'flex',alignItems:'center',gap:14,padding:'14px 0',borderBottom:'1px solid rgba(200,136,74,0.1)' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14,fontWeight:600,color:'#F0E8DC' }}>{item.product.name}</div>
                      {item.product.price && <div style={{ fontSize:12,color:'#9A8070' }}>₹{item.product.price} × {item.quantity} = ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</div>}
                    </div>
                    <div style={{ display:'flex',alignItems:'center',gap:0,border:'1px solid rgba(249,115,22,0.2)',borderRadius:4,overflow:'hidden' }}>
                      <button onClick={() => dec(item.product)} style={{ width:34,height:34,background:'rgba(249,115,22,0.08)',border:'none',color:'#F97316',fontSize:18,fontWeight:700,cursor:'pointer' }}>−</button>
                      <input
                        type="number"
                        min="1"
                        max="9999"
                        value={item.quantity}
                        onChange={e => {
                          const v = parseInt(e.target.value);
                          if (!isNaN(v) && v >= 1) setQty(item.product, v);
                        }}
                        onFocus={e => e.target.select()}
                        style={{ width:60,textAlign:'center',fontWeight:700,fontSize:14,color:'#F8F9FB',background:'transparent',border:'none',borderLeft:'1px solid rgba(249,115,22,0.2)',borderRight:'1px solid rgba(249,115,22,0.2)',padding:'0 4px',height:34,MozAppearance:'textfield',fontFamily:"'Syne',sans-serif" } as React.CSSProperties}
                      />
                      <button onClick={() => inc(item.product)} style={{ width:34,height:34,background:'rgba(249,115,22,0.08)',border:'none',color:'#F97316',fontSize:18,fontWeight:700,cursor:'pointer' }}>+</button>
                    </div>
                  </div>
                ))}

                {total > 0 && (
                  <div style={{ display:'flex',justifyContent:'space-between',padding:'16px 0',borderTop:'1px solid rgba(200,136,74,0.15)',marginTop:8 }}>
                    <div style={{ fontWeight:700,fontSize:15,color:'#F0E8DC' }}>Estimated Total</div>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:'#E0A86A' }}>₹{total.toLocaleString('en-IN')}</div>
                  </div>
                )}

                <button onClick={handleWhatsAppOrder}
                  style={{ width:'100%',marginTop:16,padding:'14px 0',borderRadius:8,background:'#25D366',border:'none',color:'white',fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:'Outfit,sans-serif',display:'flex',alignItems:'center',justifyContent:'center',gap:10 }}>
                  💬 Order on WhatsApp
                </button>
                <button onClick={() => { clear(); setShowCart(false); }}
                  style={{ width:'100%',marginTop:10,padding:'11px 0',borderRadius:8,background:'transparent',border:'1px solid rgba(248,113,113,0.2)',color:'#F87171',fontSize:13,cursor:'pointer',fontFamily:'Outfit,sans-serif' }}>
                  🗑️ Clear Cart
                </button>
                <p style={{ fontSize:12,color:'#9A8070',textAlign:'center',marginTop:12 }}>
                  WhatsApp will open with your complete order. Final price confirmed by our team.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media(max-width:1024px){.quick-grid{grid-template-columns:repeat(3,1fr)!important}}
        @media(max-width:768px){.quick-grid{grid-template-columns:repeat(2,1fr)!important}.page-pad{padding:32px 20px!important;padding-bottom:100px!important}}
        @media(max-width:480px){.quick-grid{grid-template-columns:1fr!important}}
      `}</style>
    </>
  );
}

export default function QuickOrderPage() {
  return (
    <CartProvider>
      <QuickOrderInner />
    </CartProvider>
  );
}
