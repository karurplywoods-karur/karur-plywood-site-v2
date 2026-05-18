'use client';
// src/app/products/page.tsx — UPDATED: No QuickView modal, cards link to /products/[id]
import { useState, useEffect } from 'react';
import { CartProvider } from '@/lib/CartContext';
import ProductCard from '@/components/ProductCard';
import type { Product, Category } from '@/lib/types';

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919159666538';

type SortKey = 'default' | 'price_asc' | 'price_desc' | 'name';

function StoreInner() {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [activeSlug, setActiveSlug] = useState('all');
  const [sortBy,     setSortBy]     = useState<SortKey>('default');
  const [search,     setSearch]     = useState('');

  // Fetch products + categories
  useEffect(() => {
    Promise.all([
      fetch('/api/products?type=project').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([p, c]) => {
      setProducts(Array.isArray(p) ? p : []);
      setCategories(Array.isArray(c) ? c : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Filter + Sort
  const filtered = products
    .filter(p => {
      const matchCat = activeSlug === 'all' || p.categories?.slug === activeSlug;
      const matchSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc')  return (a.price ?? 0) - (b.price ?? 0);
      if (sortBy === 'price_desc') return (b.price ?? 0) - (a.price ?? 0);
      if (sortBy === 'name')       return a.name.localeCompare(b.name);
      return (a.sort_order ?? 999) - (b.sort_order ?? 999);
    });

  const catCounts = categories.reduce((acc, cat) => {
    acc[cat.slug] = products.filter(p => p.categories?.slug === cat.slug).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      {/* Page Hero */}
      <section className="store-hero">
        <div className="store-hero-inner">
          <div className="store-hero-eyebrow">Premium Building Materials</div>
          <h1 className="store-hero-title">
            SHOP ONLINE,<br/>
            <span style={{ color: '#F97316' }}>DELIVERED TO YOU</span>
          </h1>
          <p className="store-hero-sub">
            Browse {products.length > 0 ? products.length + '+' : ''} products — plywood, laminates, doors & hardware. Order online or via WhatsApp, we deliver across Tamil Nadu.
          </p>
        </div>

        {/* Trust bar */}
        <div className="store-trust-bar">
          {[
            { icon: '🚚', text: 'Delivery across Tamil Nadu' },
            { icon: '✅', text: 'ISI Certified Products' },
            { icon: '💬', text: 'Order via WhatsApp' },
            { icon: '🏪', text: '25+ Years of Trust' },
          ].map(t => (
            <div key={t.text} className="trust-item">
              <span>{t.icon}</span>
              <span>{t.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Filters + Search */}
      <section className="store-filters-section">
        {/* Search */}
        <div className="store-search-wrap">
          <span className="store-search-icon">🔍</span>
          <input
            className="store-search"
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="store-search-clear" onClick={() => setSearch('')} type="button">✕</button>
          )}
        </div>

        {/* Category tabs */}
        <div className="store-tabs-row">
          <button
            className={`store-tab${activeSlug === 'all' ? ' store-tab--active' : ''}`}
            onClick={() => setActiveSlug('all')}
            type="button"
          >
            All ({products.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.slug}
              className={`store-tab${activeSlug === cat.slug ? ' store-tab--active' : ''}`}
              onClick={() => setActiveSlug(cat.slug)}
              type="button"
            >
              {cat.icon} {cat.name} ({catCounts[cat.slug] || 0})
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="store-sort-row">
          <span className="store-sort-label">Sort:</span>
          {(['default', 'price_asc', 'price_desc', 'name'] as SortKey[]).map(k => (
            <button
              key={k}
              className={`store-sort-btn${sortBy === k ? ' store-sort-btn--active' : ''}`}
              onClick={() => setSortBy(k)}
              type="button"
            >
              {{ default: 'Featured', price_asc: 'Price ↑', price_desc: 'Price ↓', name: 'A–Z' }[k]}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="store-results-info">
          {loading ? 'Loading…' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''}${search ? ` matching "${search}"` : ''}`}
        </div>
      </section>

      {/* Products Grid */}
      <section className="store-grid-section">
        {loading ? (
          <div className="store-loading">
            <div className="store-spinner" />
            <span>Loading products…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="store-empty">
            <div style={{ fontSize: '3rem' }}>🔍</div>
            <h3>No products found</h3>
            <p>Try a different category or search term.</p>
            <button
              onClick={() => { setSearch(''); setActiveSlug('all'); }}
              className="store-empty-reset"
              type="button"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="store-grid">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Bulk CTA Banner */}
      <section className="store-bulk-banner">
        <div className="store-bulk-inner">
          <div className="store-bulk-text">
            <h2 className="store-bulk-title">Need Bulk Quantities?</h2>
            <p className="store-bulk-sub">
              Contractors & interior designers get special pricing. Send us your project requirements.
            </p>
          </div>
          <a
            href={`https://wa.me/${WA}?text=${encodeURIComponent("Hi, I need a bulk/project quote for building materials.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="store-bulk-btn"
          >
            Get Project Quote
          </a>
        </div>
      </section>

      <style>{`
        .store-hero {
          padding: 4rem 1.5rem 2rem;
          text-align: center;
          background: radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.08) 0%, transparent 70%);
        }
        .store-hero-inner { max-width: 680px; margin: 0 auto 2rem; }
        .store-hero-eyebrow {
          font-family: 'Syne', sans-serif; font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--orange); margin-bottom: 0.75rem;
        }
        .store-hero-title {
          font-family: 'Bebas Neue', cursive;
          font-size: clamp(2.4rem, 6vw, 4rem);
          color: var(--white); line-height: 1; margin: 0 0 1rem;
          letter-spacing: 0.02em;
        }
        .store-hero-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; color: #7A8EA8; line-height: 1.6; margin: 0;
        }
        .store-trust-bar {
          display: flex; align-items: center; justify-content: center;
          flex-wrap: wrap; gap: 1.5rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(58,78,106,0.3);
          border-bottom: 1px solid rgba(58,78,106,0.3);
          max-width: 900px; margin: 0 auto;
        }
        .trust-item {
          display: flex; align-items: center; gap: 0.4rem;
          font-family: 'DM Sans', sans-serif; font-size: 0.78rem; color: #9DB5CC;
        }

        /* Filters */
        .store-filters-section { padding: 1.5rem 1.5rem 0; max-width: 1280px; margin: 0 auto; }
        .store-search-wrap {
          position: relative; max-width: 480px; margin-bottom: 1.25rem;
        }
        .store-search-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          font-size: 0.85rem; pointer-events: none;
        }
        .store-search {
          width: 100%; padding: 0.65rem 2.5rem 0.65rem 2.5rem;
          background: rgba(11,36,71,0.6);
          border: 1px solid rgba(58,78,106,0.5);
          border-radius: 6px;
          color: var(--white); font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
          outline: none; transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .store-search:focus { border-color: rgba(249,115,22,0.5); }
        .store-search::placeholder { color: #5A7A9A; }
        .store-search-clear {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: #5A7A9A; cursor: pointer;
          font-size: 0.75rem; padding: 4px;
        }

        .store-tabs-row {
          display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;
        }
        .store-tab {
          padding: 0.4rem 1rem; border-radius: 20px;
          font-family: 'Syne', sans-serif; font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          background: rgba(11,36,71,0.5);
          border: 1px solid rgba(58,78,106,0.4);
          color: #7A8EA8; cursor: pointer; transition: all 0.2s;
        }
        .store-tab:hover { color: var(--white); border-color: rgba(58,78,106,0.8); }
        .store-tab--active {
          background: var(--orange); border-color: var(--orange); color: white;
        }

        .store-sort-row {
          display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        .store-sort-label {
          font-family: 'Syne', sans-serif; font-size: 0.65rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase; color: #5A7A9A;
        }
        .store-sort-btn {
          padding: 0.3rem 0.75rem; border-radius: 4px;
          font-family: 'DM Sans', sans-serif; font-size: 0.75rem;
          background: transparent; border: 1px solid rgba(58,78,106,0.4);
          color: #7A8EA8; cursor: pointer; transition: all 0.2s;
        }
        .store-sort-btn:hover { color: var(--white); }
        .store-sort-btn--active { border-color: var(--orange); color: var(--orange); }

        .store-results-info {
          font-family: 'DM Sans', sans-serif; font-size: 0.78rem; color: #5A7A9A;
          margin-bottom: 1.5rem;
        }

        /* Grid */
        .store-grid-section { padding: 0 1.5rem 3rem; max-width: 1280px; margin: 0 auto; }
        .store-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        @media (max-width: 480px) {
          .store-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
        }

        .store-loading, .store-empty {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 1rem; padding: 4rem 1rem; color: #7A8EA8;
          font-family: 'DM Sans', sans-serif; text-align: center;
        }
        .store-empty h3 { font-family: 'Syne', sans-serif; color: var(--white); margin: 0; }
        .store-empty-reset {
          padding: 0.5rem 1.25rem; background: var(--orange);
          border: none; border-radius: 4px; color: white;
          font-family: 'Syne', sans-serif; font-size: 0.75rem;
          font-weight: 700; letter-spacing: 0.1em; cursor: pointer;
        }
        .store-spinner {
          width: 36px; height: 36px;
          border: 3px solid rgba(249,115,22,0.2);
          border-top-color: var(--orange); border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Bulk banner */
        .store-bulk-banner {
          background: linear-gradient(135deg, rgba(249,115,22,0.12), rgba(11,36,71,0.8));
          border-top: 1px solid rgba(249,115,22,0.2);
          border-bottom: 1px solid rgba(249,115,22,0.2);
          padding: 2.5rem 1.5rem;
        }
        .store-bulk-inner {
          max-width: 900px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 1.5rem;
        }
        .store-bulk-title {
          font-family: 'Syne', sans-serif; font-size: 1.3rem; font-weight: 800;
          color: var(--white); margin: 0 0 0.4rem; text-transform: uppercase;
        }
        .store-bulk-sub {
          font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
          color: #7A8EA8; margin: 0;
        }
        .store-bulk-btn {
          padding: 0.85rem 2rem; background: var(--orange);
          color: white; text-decoration: none; border-radius: 4px;
          font-family: 'Syne', sans-serif; font-size: 0.8rem;
          font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          white-space: nowrap; transition: background 0.2s;
        }
        .store-bulk-btn:hover { background: #EA6A0A; }
      `}</style>
    </>
  );
}

export default function StorePage() {
  return (
    <CartProvider>
      <StoreInner />
    </CartProvider>
  );
}