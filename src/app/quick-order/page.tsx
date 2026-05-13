'use client';
// src/app/quick-order/page.tsx
import { useEffect, useState, useCallback, useRef } from 'react';
import ProductCard from '@/components/ProductCard';
import { CartProvider, useCart } from '@/lib/CartContext';
import { trackWAClick, generateTrackingId } from '@/lib/analytics';
import type { Product } from '@/lib/types';

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919159666538';

// ── Debounce hook ─────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function QuickOrderInner() {
  const { items, add, inc, dec, setQty, clear, total, count } = useCart();
  const [products, setProducts]         = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);
  const [fetchError, setFetchError]     = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCart, setShowCart]         = useState(false);

  // ── Search ────────────────────────────────────────────────────
  const [searchRaw, setSearchRaw] = useState('');
  const searchQuery  = useDebounce(searchRaw.trim(), 300);   // 300 ms debounce
  const isDebouncing = searchRaw.trim() !== searchQuery;     // true while settling
  const searchRef    = useRef<HTMLInputElement>(null);

  // ── Fetch products once on mount ──────────────────────────────
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    setLoading(true);
    setFetchError(false);

    fetch('/api/products?type=quick', { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => {
        clearTimeout(timer);
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        clearTimeout(timer);
        if (err.name !== 'AbortError') { console.error('Quick order fetch:', err); setFetchError(true); }
        setProducts([]);
        setLoading(false);
      });

    return () => { clearTimeout(timer); controller.abort(); };
  }, []);

  // ── Filter pipeline ───────────────────────────────────────────
  // 1. Category
  const catFiltered = activeFilter === 'all'
    ? products
    : products.filter(p => p.categories?.name === activeFilter);

  // 2. Debounced search — name, description, category
  const filtered = searchQuery
    ? catFiltered.filter(p => {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.description?.toLowerCase().includes(q) ?? false) ||
          (p.categories?.name?.toLowerCase().includes(q) ?? false)
        );
      })
    : catFiltered;

  const isSearching = searchQuery.length > 0;

  const cats = Array.from(
    new Set(products.map(p => p.categories?.name).filter(Boolean))
  ) as string[];

  const clearSearch = () => { setSearchRaw(''); searchRef.current?.focus(); };

  // ── WhatsApp order ────────────────────────────────────────────
  const handleWhatsAppOrder = useCallback(() => {
    if (items.length === 0) return;
    const lines = items
      .map(i => `• ${i.product.name} x${i.quantity}${i.product.price ? ` (₹${(i.product.price * i.quantity).toLocaleString('en-IN')})` : ''}`)
      .join('\n');
    const totalLine = total > 0 ? `\n\nTotal: ₹${total.toLocaleString('en-IN')}` : '';
    const text = `Hi, I want to place a quick order:\n\n${lines}${totalLine}\n\nPlease confirm availability and delivery.`;

    trackWAClick({ source: 'cart', quantity: items.reduce((s, i) => s + i.quantity, 0), total_value: total });
    fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Quick Order Cart', phone: 'N/A', message: text,
        tracking_id: generateTrackingId(), source: 'website', wa_source: 'cart',
        quantity: items.reduce((s, i) => s + i.quantity, 0), total_value: total,
      }),
    }).catch(() => {});
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, '_blank');
  }, [items, total]);

  const getCartItem = (p: Product) => items.find(i => i.product.id === p.id);

  return (
    <>
      {/* ── HERO ── */}
      <section style={{ background:'linear-gradient(135deg,#0D1C10,#091410)', borderBottom:'1px solid rgba(37,211,102,0.15)', padding:'80px 0', paddingTop:'calc(58px + 80px)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 48px' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:20 }}>
            <div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'rgba(37,211,102,0.1)', border:'1px solid rgba(37,211,102,0.2)', borderRadius:20, padding:'5px 14px', fontSize:12, color:'#25D366', fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:16 }}>
                ⚡ Quick Order — Fast Moving Items
              </div>
              <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(2.8rem,5vw,4.5rem)', letterSpacing:'0.04em', color:'#F8F9FB', lineHeight:0.95, marginBottom:'0.75rem' }}>
                ADD TO CART,<br />
                <span style={{ color:'#25D366' }}>ORDER ON WHATSAPP</span>
              </h1>
              <p style={{ fontSize:14, color:'#7A8EA8', maxWidth:460, lineHeight:1.8, fontWeight:300 }}>
                Select items and quantities, then send your order directly on WhatsApp. Fast delivery within Karur.
              </p>
            </div>

            {count > 0 && (
              <div style={{ background:'rgba(37,211,102,0.1)', border:'1px solid rgba(37,211,102,0.25)', borderRadius:14, padding:'20px 24px', minWidth:200 }}>
                <div style={{ fontSize:11, color:'#7A8EA8', fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>Cart Summary</div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, letterSpacing:'0.04em', color:'#25D366', lineHeight:1 }}>{count} items</div>
                {total > 0 && <div style={{ fontSize:14, color:'#7A8EA8', marginTop:4 }}>≈ ₹{total.toLocaleString('en-IN')}</div>}
                <button onClick={() => setShowCart(true)}
                  style={{ marginTop:14, width:'100%', padding:'10px 0', borderRadius:6, background:'#25D366', color:'white', border:'none', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, letterSpacing:'0.08em', cursor:'pointer' }}>
                  View Cart →
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── MAIN ── */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'48px 48px', paddingBottom: count > 0 ? '120px' : '48px' }} className="page-pad">

        {/* ── SEARCH + FILTER BAR (only when products loaded) ── */}
        {!loading && !fetchError && products.length > 0 && (
          <div style={{ marginBottom:32 }}>

            {/* Search input */}
            <div style={{ position:'relative', marginBottom:14 }}>

              {/* Left icon: spinning SVG while debouncing, magnifier otherwise */}
              <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', display:'flex', alignItems:'center' }}>
                {isDebouncing ? (
                  <svg width="17" height="17" viewBox="0 0 16 16" style={{ animation:'qo-spin 0.65s linear infinite' }} aria-hidden="true">
                    <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(37,211,102,0.25)" strokeWidth="2"/>
                    <path d="M8 2 A6 6 0 0 1 14 8" fill="none" stroke="#25D366" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                    stroke={searchQuery ? '#25D366' : '#7A8EA8'}
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                )}
              </span>

              <input
                ref={searchRef}
                type="text"
                value={searchRaw}
                onChange={e => setSearchRaw(e.target.value)}
                placeholder="Search — e.g. Fevicol, laminate, hinge, screw..."
                aria-label="Search quick order products"
                autoComplete="off"
                spellCheck={false}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${searchQuery ? 'rgba(37,211,102,0.45)' : 'rgba(37,211,102,0.18)'}`,
                  borderRadius: 8,
                  padding: '13px 42px 13px 42px',
                  fontSize: 14,
                  color: '#F8F9FB',
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                  boxShadow: searchQuery ? '0 0 0 3px rgba(37,211,102,0.07)' : 'none',
                } as React.CSSProperties}
              />

              {/* Clear ✕ button */}
              {searchRaw && (
                <button
                  onClick={clearSearch}
                  aria-label="Clear search"
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 4,
                    width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#7A8EA8', cursor: 'pointer', fontSize: 12, lineHeight: 1,
                    transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.15)'; (e.currentTarget as HTMLButtonElement).style.color='#F8F9FB'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.07)'; (e.currentTarget as HTMLButtonElement).style.color='#7A8EA8'; }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category pills + result count */}
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
              <span style={{ fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'#7A8EA8', flexShrink:0, marginRight:4 }}>
                Filter:
              </span>
              {['all', ...cats].map(c => (
                <button
                  key={c}
                  onClick={() => setActiveFilter(c)}
                  style={{
                    padding: '5px 14px', borderRadius: 20, border: '1px solid', fontSize: 12,
                    fontWeight: 600, cursor: 'pointer', fontFamily: "'Syne',sans-serif",
                    transition: 'all 0.18s', letterSpacing: '0.04em',
                    borderColor: activeFilter===c ? '#25D366' : 'rgba(37,211,102,0.15)',
                    background:  activeFilter===c ? 'rgba(37,211,102,0.15)' : 'transparent',
                    color:       activeFilter===c ? '#25D366' : '#7A8EA8',
                  }}
                >
                  {c === 'all' ? `All (${products.length})` : c}
                </button>
              ))}

              {/* Live count badge — only when filtering/searching + debounce settled */}
              {(isSearching || activeFilter !== 'all') && !isDebouncing && (
                <span style={{ marginLeft:'auto', fontSize:12, color: filtered.length > 0 ? '#7A8EA8' : '#FCA5A5', fontFamily:"'Syne',sans-serif", fontWeight:600, flexShrink:0 }}>
                  {filtered.length === 0 ? 'No results' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── LOADING SKELETON ── */}
        {loading && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:18 }} className="quick-grid">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} style={{ background:'rgba(25,55,109,0.2)', border:'1px solid rgba(249,115,22,0.06)', borderRadius:12, height:280, animation:'qo-shimmer 1.5s ease-in-out infinite', opacity:0.5 }} />
            ))}
          </div>
        )}

        {/* ── ERROR STATE ── */}
        {!loading && fetchError && (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'2rem', letterSpacing:'0.05em', color:'#F8F9FB', marginBottom:8 }}>UNABLE TO LOAD PRODUCTS</div>
            <p style={{ color:'#7A8EA8', marginBottom:24 }}>Connection problem. Refresh or order via WhatsApp.</p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={() => window.location.reload()} style={{ padding:'12px 24px', background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.3)', borderRadius:6, color:'#F97316', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer' }}>🔄 Refresh</button>
              <a href={`https://wa.me/${WA}?text=Hi%2C+I+want+to+place+a+quick+order.+Can+you+help%3F`} target="_blank" rel="noopener"
                style={{ padding:'12px 24px', background:'#25D366', borderRadius:6, color:'white', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:8 }}>
                💬 Order on WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* ── EMPTY — NO PRODUCTS IN DB ── */}
        {!loading && !fetchError && products.length === 0 && (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📦</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'2rem', letterSpacing:'0.05em', color:'#F8F9FB', marginBottom:8 }}>PRODUCTS COMING SOON</div>
            <p style={{ color:'#7A8EA8', marginBottom:24 }}>Browse the full catalogue or order on WhatsApp.</p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <a href="/products" style={{ padding:'12px 24px', background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.3)', borderRadius:6, color:'#F97316', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, textDecoration:'none' }}>Browse All Products →</a>
              <a href={`https://wa.me/${WA}?text=Hi%2C+I+want+to+place+a+quick+order.+Can+you+send+me+a+price+list%3F`} target="_blank" rel="noopener"
                style={{ padding:'12px 24px', background:'#25D366', borderRadius:6, color:'white', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:8 }}>
                💬 Order on WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* ── NO SEARCH RESULTS ── */}
        {!loading && !fetchError && products.length > 0 && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <div style={{ fontSize:44, marginBottom:14 }}>🔍</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.8rem', letterSpacing:'0.05em', color:'#F8F9FB', marginBottom:8 }}>
              NO RESULTS FOR &ldquo;{searchQuery || activeFilter}&rdquo;
            </div>
            <p style={{ color:'#7A8EA8', marginBottom:24, fontSize:14 }}>
              Try a different keyword, or clear the search to browse all products.
            </p>
            <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
              {searchRaw && (
                <button onClick={clearSearch}
                  style={{ padding:'10px 22px', background:'rgba(37,211,102,0.1)', border:'1px solid rgba(37,211,102,0.2)', borderRadius:6, color:'#25D366', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer' }}>
                  ✕ Clear Search
                </button>
              )}
              {activeFilter !== 'all' && (
                <button onClick={() => setActiveFilter('all')}
                  style={{ padding:'10px 22px', background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', borderRadius:6, color:'#F97316', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer' }}>
                  Show All Categories
                </button>
              )}
              <a href={`https://wa.me/${WA}?text=Hi%2C+I%27m+looking+for+${encodeURIComponent(searchQuery || activeFilter)}+—+do+you+have+it+in+stock%3F`}
                target="_blank" rel="noopener"
                style={{ padding:'10px 22px', background:'#25D366', borderRadius:6, color:'white', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6 }}>
                💬 Ask on WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* ── PRODUCTS GRID ── */}
        {!loading && !fetchError && filtered.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:18 }} className="quick-grid">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} mode="quick"
                cartItem={getCartItem(p)}
                onAdd={add} onInc={inc} onDec={dec} onSetQty={setQty} />
            ))}
          </div>
        )}

        {/* ── DELIVERY NOTE ── */}
        {!loading && !fetchError && products.length > 0 && (
          <div style={{ marginTop:36, padding:'14px 20px', background:'rgba(37,211,102,0.06)', border:'1px solid rgba(37,211,102,0.15)', borderRadius:8, display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:20, flexShrink:0 }}>🚚</span>
            <div>
              <span style={{ fontSize:13, fontWeight:600, color:'#4ADE80', fontFamily:"'Syne',sans-serif" }}>Free delivery within Karur</span>
              <span style={{ fontSize:13, color:'#7A8EA8' }}> on orders above ₹5,000 · Same-day dispatch available</span>
            </div>
          </div>
        )}
      </div>

      {/* ── STICKY CART BAR ── */}
      {count > 0 && (
        <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'rgba(13,28,16,0.97)', backdropFilter:'blur(12px)', borderTop:'1px solid rgba(37,211,102,0.25)', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, zIndex:500, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:38, height:38, background:'#25D366', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:'white' }}>{count}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'#F8F9FB', fontFamily:"'Syne',sans-serif" }}>{count} item{count>1?'s':''} in cart</div>
              {total > 0 && <div style={{ fontSize:12, color:'#7A8EA8' }}>Est. ₹{total.toLocaleString('en-IN')}</div>}
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => setShowCart(true)}
              style={{ padding:'10px 20px', borderRadius:6, background:'transparent', border:'1px solid rgba(37,211,102,0.3)', color:'#25D366', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer' }}>
              View Cart
            </button>
            <button onClick={handleWhatsAppOrder}
              style={{ padding:'10px 24px', borderRadius:6, background:'#25D366', border:'none', color:'white', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
              💬 Order on WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* ── CART MODAL ── */}
      {showCart && (
        <div onClick={() => setShowCart(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:9000, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width:'100%', maxWidth:520, background:'#0d1f3a', borderRadius:'20px 20px 0 0', padding:'28px 24px', maxHeight:'80vh', overflow:'auto', border:'1px solid rgba(37,211,102,0.2)', borderBottom:'none' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:'0.04em', color:'#F8F9FB' }}>YOUR CART ({count})</div>
              <button onClick={() => setShowCart(false)} style={{ background:'none', border:'1px solid rgba(249,115,22,0.2)', borderRadius:6, color:'#7A8EA8', padding:'6px 12px', cursor:'pointer', fontFamily:"'Syne',sans-serif", fontSize:12 }}>✕ Close</button>
            </div>

            {items.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 0', color:'#7A8EA8' }}>Your cart is empty.</div>
            ) : (
              <>
                {items.map(item => (
                  <div key={item.product.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 0', borderBottom:'1px solid rgba(249,115,22,0.08)' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:600, color:'#F8F9FB', fontFamily:"'Syne',sans-serif" }}>{item.product.name}</div>
                      {item.product.price && <div style={{ fontSize:12, color:'#7A8EA8' }}>₹{item.product.price.toLocaleString('en-IN')} × {item.quantity} = ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</div>}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', border:'1px solid rgba(249,115,22,0.2)', borderRadius:4, overflow:'hidden' }}>
                      <button onClick={() => dec(item.product)} style={{ width:34, height:34, background:'rgba(249,115,22,0.08)', border:'none', color:'#F97316', fontSize:18, fontWeight:700, cursor:'pointer' }}>−</button>
                      <input type="number" min="1" max="9999" value={item.quantity}
                        onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 1) setQty(item.product, v); }}
                        onFocus={e => e.target.select()}
                        style={{ width:60, textAlign:'center', fontWeight:700, fontSize:14, color:'#F8F9FB', background:'transparent', border:'none', borderLeft:'1px solid rgba(249,115,22,0.2)', borderRight:'1px solid rgba(249,115,22,0.2)', padding:'0 4px', height:34, MozAppearance:'textfield', fontFamily:"'Syne',sans-serif" } as React.CSSProperties}
                      />
                      <button onClick={() => inc(item.product)} style={{ width:34, height:34, background:'rgba(249,115,22,0.08)', border:'none', color:'#F97316', fontSize:18, fontWeight:700, cursor:'pointer' }}>+</button>
                    </div>
                  </div>
                ))}

                {total > 0 && (
                  <div style={{ display:'flex', justifyContent:'space-between', padding:'16px 0', borderTop:'1px solid rgba(249,115,22,0.12)', marginTop:8 }}>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:'#F8F9FB' }}>Estimated Total</div>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, letterSpacing:'0.04em', color:'#25D366' }}>₹{total.toLocaleString('en-IN')}</div>
                  </div>
                )}

                <button onClick={handleWhatsAppOrder}
                  style={{ width:'100%', marginTop:16, padding:'14px 0', borderRadius:6, background:'#25D366', border:'none', color:'white', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, cursor:'pointer', letterSpacing:'0.06em', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                  💬 Order on WhatsApp
                </button>
                <button onClick={() => { clear(); setShowCart(false); }}
                  style={{ width:'100%', marginTop:10, padding:'11px 0', borderRadius:6, background:'transparent', border:'1px solid rgba(248,113,113,0.2)', color:'#F87171', fontSize:13, cursor:'pointer', fontFamily:"'Syne',sans-serif" }}>
                  🗑️ Clear Cart
                </button>
                <p style={{ fontSize:12, color:'#7A8EA8', textAlign:'center', marginTop:12 }}>
                  WhatsApp will open with your complete order. Final price confirmed by our team.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes qo-shimmer { 0%,100%{opacity:0.3} 50%{opacity:0.6} }
        @keyframes qo-spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        @media(max-width:1200px){ .quick-grid{grid-template-columns:repeat(3,1fr)!important} }
        @media(max-width:900px) { .quick-grid{grid-template-columns:repeat(2,1fr)!important} }
        @media(max-width:640px) {
          .quick-grid{grid-template-columns:1fr!important}
          .page-pad{padding:28px 20px!important;padding-bottom:120px!important}
        }
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
