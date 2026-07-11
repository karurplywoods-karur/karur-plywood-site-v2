// src/app/products/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { getProjectProducts, getCategories } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import { CONTACT } from '@/lib/contact';

const SITE_URL = 'https://www.karurplywood.co.in';

export const metadata: Metadata = {
  title: 'Products | Plywood, Doors, Laminates & Hardware in Karur',
  description: 'Buy premium plywood, doors, laminates and hardware at best prices in Karur. ISI certified. Wholesale & retail. WhatsApp for quick pricing.',
  alternates: { canonical: `${SITE_URL}/products` },
};

const WA = CONTACT.wa;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) {
  const searchQuery = searchParams.search?.trim();
  const [products, categories] = await Promise.all([
    getProjectProducts(searchParams.category, searchQuery),
    getCategories(),
  ]);
  const activeCategory = searchParams.category || 'all';

  return (
    <div style={{ background: 'var(--bg-body)', minHeight: '100vh' }}>

      {/* ── HEADER BAND — dark brand bar ── */}
      <div style={{ background: 'var(--navy-deep)', borderBottom: '3px solid var(--orange)', paddingTop: 58 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 48px 0' }} className="prod-hero-pad">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', paddingBottom: 24 }}>
            <div>
              <div className="eyebrow" style={{ color: 'var(--orange)' }}>All Products</div>
              <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(2.2rem,4vw,3.6rem)', letterSpacing: '.04em', color: '#fff', lineHeight: 1, margin: 0 }}>
                PLYWOOD & BUILDING <span style={{ color: 'var(--orange)' }}>MATERIALS</span>
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted-d)', marginTop: 8, fontWeight: 300 }}>
                ISI Certified · All Major Brands · Wholesale &amp; Retail
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingBottom: 4 }}>
              <a href={`https://wa.me/${WA}?text=Hi%2C+I+need+a+price+list.`} target="_blank" rel="noopener" className="btn-wa">
                💬 Get Price List
              </a>
              <Link href="/quick-order" className="btn-s-dark">⚡ Quick Order</Link>
            </div>
          </div>

          {/* Category filter tabs — on dark band */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingBottom: 0, overflowX: 'auto' }}>
            <Link href="/products" className={`prod-tab-dark${activeCategory === 'all' ? ' prod-tab-dark--active' : ''}`}>All</Link>
            {categories?.map(cat => (
              <Link key={cat.slug} href={`/products?category=${cat.slug}`}
                className={`prod-tab-dark${activeCategory === cat.slug ? ' prod-tab-dark--active' : ''}`}>
                {cat.icon} {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 48px 64px' }} className="prod-content-pad">

        {/* Search result banner */}
        {searchQuery && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--orange-light)', border: '1.5px solid rgba(249,115,22,0.25)', borderRadius: 8, padding: '12px 18px', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontSize: 14, color: 'var(--text-h)', fontWeight: 600 }}>
              🔍 Results for <strong>&ldquo;{searchQuery}&rdquo;</strong> — {products.length} found
            </span>
            <Link href="/products" style={{ fontSize: 12, color: 'var(--text-meta)', fontFamily: 'var(--f-ui)', fontWeight: 600, letterSpacing: '.08em' }}>
              ✕ Clear
            </Link>
          </div>
        )}

        {/* Product count */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <p style={{ fontSize: 13, color: 'var(--text-meta)' }}>
            Showing <strong style={{ color: 'var(--text-h)' }}>{products.length}</strong> product{products.length !== 1 ? 's' : ''}
            {activeCategory !== 'all' && categories?.find(c => c.slug === activeCategory) && (
              <> in <strong style={{ color: 'var(--orange)' }}>{categories.find(c => c.slug === activeCategory)?.name}</strong></>
            )}
          </p>
          <Link href="/quick-order" style={{ fontSize: 12, color: 'var(--orange)', fontFamily: 'var(--f-ui)', fontWeight: 700, letterSpacing: '.06em' }}>
            ⚡ Need it fast? Quick Order →
          </Link>
        </div>

        {/* Grid */}
        {products.length > 0 ? (
          <div className="cp-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-meta)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🪵</div>
            <h3 style={{ fontFamily: 'var(--f-ui)', fontSize: '1.1rem', color: 'var(--text-h)', marginBottom: 8 }}>No products found</h3>
            <p style={{ fontSize: 14 }}>Try a different category or <Link href="/products" style={{ color: 'var(--orange)' }}>view all products</Link>.</p>
          </div>
        )}

        {/* Bulk CTA */}
        {products.length > 0 && (
          <div style={{ marginTop: 56, background: 'var(--navy)', borderRadius: 12, padding: '32px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.4rem,3vw,2.2rem)', color: '#fff', letterSpacing: '.04em', lineHeight: 1 }}>NEED A BULK QUOTE?</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted-d)', marginTop: 6, fontWeight: 300 }}>Best prices for contractors, builders and interior designers. GST invoice included.</p>
            </div>
            <a href={`https://wa.me/${WA}?text=Hi%2C+I+need+a+bulk+quote.`} target="_blank" rel="noopener" className="btn-wa">
              💬 WhatsApp for Bulk Pricing
            </a>
          </div>
        )}
      </div>

      <style>{`
        .cp-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
        .prod-tab-dark {
          padding:8px 16px; border-radius:6px 6px 0 0;
          font-family:var(--f-ui); font-size:.68rem; font-weight:700;
          letter-spacing:.1em; text-transform:uppercase; white-space:nowrap;
          color:rgba(255,255,255,0.5); border:none; background:transparent;
          transition:all .2s; text-decoration:none; display:inline-block;
        }
        .prod-tab-dark:hover { color:#fff; background:rgba(255,255,255,0.06); }
        .prod-tab-dark--active { color:#fff; background:var(--bg-body); border-top:2px solid var(--orange); padding-top:6px; }
        @media(max-width:1200px){ .cp-grid { grid-template-columns:repeat(3,1fr) !important; } }
        @media(max-width:900px) { .cp-grid { grid-template-columns:repeat(2,1fr) !important; gap:14px !important; } }
        @media(max-width:560px) { .cp-grid { grid-template-columns:repeat(2,1fr) !important; gap:12px !important; } .prod-content-pad,.prod-hero-pad { padding-left:16px !important; padding-right:16px !important; } }
        @media(max-width:380px) { .cp-grid { grid-template-columns:1fr !important; } }
      `}</style>
    </div>
  );
}