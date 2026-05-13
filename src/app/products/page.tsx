'use client';
// src/app/products/page.tsx
// Converted to client component to support debounced search.
// Server-side category filtering via URL params is preserved via router.
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import type { Product, Category } from '@/lib/types';

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919159666538';

// ── Debounce hook ─────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function ProductsPage() {
  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  // ── Search ────────────────────────────────────────────────────
  const [searchRaw, setSearchRaw]   = useState('');
  const searchQuery  = useDebounce(searchRaw.trim(), 300);
  const isDebouncing = searchRaw.trim() !== searchQuery;
  const searchRef    = useRef<HTMLInputElement>(null);

  // ── Fetch all project products once ───────────────────────────
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    setLoading(true);
    fetch('/api/products?type=project', { signal: controller.signal })
      .then(r => r.json())
      .then(data => { clearTimeout(timer); setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { clearTimeout(timer); if (err.name !== 'AbortError') console.error(err); setProducts([]); setLoading(false); });

    return () => { clearTimeout(timer); controller.abort(); };
  }, []);

  // ── Fetch categories once ─────────────────────────────────────
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // ── Filter pipeline ───────────────────────────────────────────
  const catFiltered = activeCategory === 'all'
    ? products
    : products.filter(p => p.categories?.slug === activeCategory);

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

  const isSearching  = searchQuery.length > 0;
  const isFiltering  = activeCategory !== 'all';
  const clearSearch  = () => { setSearchRaw(''); searchRef.current?.focus(); };

  return (
    <>
      {/* ── HERO ── */}
      <section style={{ background:'linear-gradient(135deg,#1C140D,#161009)', borderBottom:'1px solid rgba(200,136,74,0.15)', padding:'64px 0', paddingTop:'calc(58px + 64px)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 48px' }} className="prod-pad">
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:20 }}>
            <div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:11, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'#C8884A', marginBottom:12, fontFamily:"'Syne',sans-serif" }}>
                <span style={{ width:20, height:1, background:'#C8884A', display:'inline-block' }}/>
                Project Products
              </div>
              <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(2.8rem,5vw,4.5rem)', letterSpacing:'0.04em', color:'#F8F9FB', lineHeight:0.95, marginBottom:10 }}>
                PREMIUM <span style={{ color:'#F97316' }}>BUILDING MATERIALS</span>
              </h1>
              <p style={{ fontSize:14, color:'#7A8EA8', maxWidth:500, lineHeight:1.8, fontWeight:300 }}>
                ISI Certified · All Major Brands · Wholesale &amp; Retail · Karur&apos;s Widest Selection
              </p>
            </div>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <a href={`https://wa.me/${WA}?text=Hi%2C+I+need+a+price+list+for+your+products.`} target="_blank" rel="noopener"
                style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 22px', borderRadius:6, background:'#25D366', color:'white', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, letterSpacing:'0.08em', textTransform:'uppercase', textDecoration:'none' }}>
                💬 Get Price List
              </a>
              <Link href="/quick-order"
                style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 22px', borderRadius:6, background:'rgba(37,211,102,0.1)', color:'#25D366', fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:13, letterSpacing:'0.06em', textDecoration:'none', border:'1px solid rgba(37,211,102,0.25)' }}>
                ⚡ Quick Order
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTER + SEARCH TOOLBAR ── */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'32px 48px 0' }} className="prod-pad">

        {/* Search input */}
        <div style={{ position:'relative', marginBottom:18 }}>
          <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', display:'flex', alignItems:'center' }}>
            {isDebouncing ? (
              <svg width="17" height="17" viewBox="0 0 16 16" style={{ animation:'pd-spin 0.65s linear infinite' }} aria-hidden="true">
                <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(249,115,22,0.25)" strokeWidth="2"/>
                <path d="M8 2 A6 6 0 0 1 14 8" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                stroke={searchQuery ? '#F97316' : '#7A8EA8'}
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
            placeholder="Search products — e.g. Century, BWR, 18mm plywood, laminate..."
            aria-label="Search products"
            autoComplete="off"
            spellCheck={false}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: `1.5px solid ${searchQuery ? 'rgba(249,115,22,0.45)' : 'rgba(200,136,74,0.2)'}`,
              borderRadius: 8,
              padding: '13px 42px 13px 44px',
              fontSize: 14,
              color: '#F8F9FB',
              fontFamily: "'DM Sans', sans-serif",
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxSizing: 'border-box',
              boxShadow: searchQuery ? '0 0 0 3px rgba(249,115,22,0.07)' : 'none',
            } as React.CSSProperties}
          />

          {searchRaw && (
            <button
              onClick={clearSearch}
              aria-label="Clear search"
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 4,
                width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#7A8EA8', cursor: 'pointer', fontSize: 12,
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.15)'; (e.currentTarget as HTMLButtonElement).style.color='#F8F9FB'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.07)'; (e.currentTarget as HTMLButtonElement).style.color='#7A8EA8'; }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Category tabs + result count row */}
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <button
            onClick={() => setActiveCategory('all')}
            style={{
              padding:'7px 16px', borderRadius:20, border:'1px solid', fontSize:12,
              fontWeight:600, cursor:'pointer', fontFamily:"'Syne',sans-serif", transition:'all 0.18s',
              borderColor: activeCategory==='all' ? '#F97316' : 'rgba(200,136,74,0.2)',
              background:  activeCategory==='all' ? 'rgba(249,115,22,0.12)' : 'transparent',
              color:       activeCategory==='all' ? '#F97316' : '#7A8EA8',
            }}>
            🏷️ All ({products.length})
          </button>

          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              style={{
                padding:'7px 16px', borderRadius:20, border:'1px solid', fontSize:12,
                fontWeight:600, cursor:'pointer', fontFamily:"'Syne',sans-serif", transition:'all 0.18s',
                borderColor: activeCategory===cat.slug ? '#F97316' : 'rgba(200,136,74,0.2)',
                background:  activeCategory===cat.slug ? 'rgba(249,115,22,0.12)' : 'transparent',
                color:       activeCategory===cat.slug ? '#F97316' : '#7A8EA8',
              }}>
              {cat.icon} {cat.name}
            </button>
          ))}

          {/* Live result count */}
          {(isSearching || isFiltering) && !isDebouncing && (
            <span style={{ marginLeft:'auto', fontSize:12, color: filtered.length > 0 ? '#7A8EA8' : '#FCA5A5', fontFamily:"'Syne',sans-serif", fontWeight:600, flexShrink:0 }}>
              {filtered.length === 0 ? 'No results' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`}
            </span>
          )}
        </div>
      </div>

      {/* ── PRODUCT GRID ── */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'32px 48px 64px' }} className="prod-pad">

        {/* Loading skeleton */}
        {loading && (
          <div className="prod-grid">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background:'rgba(25,55,109,0.2)', border:'1px solid rgba(249,115,22,0.06)', borderRadius:12, height:300, animation:'pd-shimmer 1.5s ease-in-out infinite', opacity:0.5 }} />
            ))}
          </div>
        )}

        {/* No results from search/filter */}
        {!loading && products.length > 0 && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <div style={{ fontSize:44, marginBottom:14 }}>🔍</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.8rem', letterSpacing:'0.05em', color:'#F8F9FB', marginBottom:8 }}>
              NO RESULTS FOR &ldquo;{searchQuery || activeCategory}&rdquo;
            </div>
            <p style={{ color:'#7A8EA8', marginBottom:22, fontSize:14 }}>Try a different keyword or clear the filter.</p>
            <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
              {searchRaw && (
                <button onClick={clearSearch}
                  style={{ padding:'10px 22px', background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', borderRadius:6, color:'#F97316', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer' }}>
                  ✕ Clear Search
                </button>
              )}
              {isFiltering && (
                <button onClick={() => setActiveCategory('all')}
                  style={{ padding:'10px 22px', background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', borderRadius:6, color:'#F97316', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer' }}>
                  Show All Categories
                </button>
              )}
              <a href={`https://wa.me/${WA}?text=Hi%2C+I%27m+looking+for+${encodeURIComponent(searchQuery || activeCategory)}+—+do+you+have+it%3F`}
                target="_blank" rel="noopener"
                style={{ padding:'10px 22px', background:'#25D366', borderRadius:6, color:'white', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6 }}>
                💬 Ask on WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* Empty DB state */}
        {!loading && products.length === 0 && (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📦</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'2rem', letterSpacing:'0.05em', color:'#F8F9FB', marginBottom:8 }}>PRODUCTS COMING SOON</div>
            <p style={{ color:'#7A8EA8', marginBottom:24 }}>Check back soon or ask us on WhatsApp.</p>
            <a href={`https://wa.me/${WA}?text=Hi%2C+do+you+have+products+in+this+category%3F`} target="_blank" rel="noopener"
              style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 24px', borderRadius:6, background:'#25D366', color:'white', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, textDecoration:'none' }}>
              💬 Ask on WhatsApp
            </a>
          </div>
        )}

        {/* Products */}
        {!loading && filtered.length > 0 && (
          <div className="prod-grid">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} mode="project" />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {!loading && filtered.length > 0 && (
          <div style={{ marginTop:56, background:'linear-gradient(135deg,#0D2B17,#091810)', border:'1px solid rgba(37,211,102,0.2)', borderRadius:16, padding:'36px 44px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:28, flexWrap:'wrap' }}>
            <div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.6rem', letterSpacing:'0.05em', color:'#F8F9FB', marginBottom:6 }}>Need a Bulk Quote?</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)' }}>Send your list and we&apos;ll give you the best wholesale rate.</div>
            </div>
            <a href={`https://wa.me/${WA}?text=Hi%2C+I+need+a+bulk+quote+for+plywood+and+materials.`} target="_blank" rel="noopener"
              style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 24px', borderRadius:6, background:'#25D366', color:'white', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, letterSpacing:'0.08em', textTransform:'uppercase', textDecoration:'none', flexShrink:0 }}>
              💬 Get Bulk Quote on WhatsApp
            </a>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pd-shimmer { 0%,100%{opacity:0.3} 50%{opacity:0.6} }
        @keyframes pd-spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .prod-pad { padding-left: 48px; padding-right: 48px; }

        /* ── PRODUCT GRID — fixed breakpoints ── */
        .prod-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        /* Tablet: 2 columns */
        @media (max-width: 900px) {
          .prod-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        /* Mobile: 1 column */
        @media (max-width: 540px) {
          .prod-grid { grid-template-columns: 1fr !important; gap: 14px !important; }
          .prod-pad  { padding-left: 16px !important; padding-right: 16px !important; }
        }
      `}</style>
    </>
  );
}
