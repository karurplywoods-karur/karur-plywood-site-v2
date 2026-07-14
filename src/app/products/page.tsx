// src/app/products/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { getProjectProducts, getCategories, getBrands } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import SortSelect from '@/components/SortSelect';
import { CONTACT } from '@/lib/contact';

const SITE_URL = 'https://www.karurplywood.co.in';

export const metadata: Metadata = {
  title: 'Products | Plywood, Doors, Laminates & Hardware in Karur',
  description: 'Buy premium plywood, doors, laminates and hardware at best prices in Karur. ISI certified. Wholesale & retail. WhatsApp for quick pricing.',
  alternates: { canonical: `${SITE_URL}/products` },
};

const WA = CONTACT.wa;
const PER_PAGE = 24;
const THICKNESS_OPTIONS = ['3mm', '6mm', '9mm', '12mm', '18mm', '25mm'];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: {
    category?: string; search?: string; brand?: string; thickness?: string;
    priceMin?: string; priceMax?: string; sort?: string; page?: string;
  };
}) {
  const searchQuery = searchParams.search?.trim();
  const brandSlugs = searchParams.brand ? searchParams.brand.split(',') : undefined;
  const thicknessVals = searchParams.thickness ? searchParams.thickness.split(',') : undefined;
  const priceMin = searchParams.priceMin ? Number(searchParams.priceMin) : undefined;
  const priceMax = searchParams.priceMax ? Number(searchParams.priceMax) : undefined;
  const sort = (searchParams.sort as any) || 'popular';
  const page = Math.max(1, parseInt(searchParams.page || '1'));

  const [allProducts, categories, brands] = await Promise.all([
    getProjectProducts(searchParams.category, searchQuery, { brandSlugs, thickness: thicknessVals, priceMin, priceMax, sort }),
    getCategories(),
    getBrands(),
  ]);

  const activeCategory = searchParams.category || 'all';
  const total = allProducts.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const products = allProducts.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Helper to build a query string preserving other filters
  const buildHref = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { ...searchParams, ...overrides };
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v as string); });
    const qs = params.toString();
    return `/products${qs ? `?${qs}` : ''}`;
  };

  const activeBrandSet = new Set(brandSlugs || []);
  const activeThicknessSet = new Set(thicknessVals || []);

  return (
    <div style={{ background: '#FAF8F5', minHeight: '100vh', paddingTop: 58 }}>

      {/* ── Breadcrumb + title ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 40px 0' }} className="prod-hero-pad">
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 14 }}>
          <Link href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Home</Link> &gt; Products
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(1.6rem,3vw,2.1rem)', fontWeight: 700, color: '#0B2447', margin: 0 }}>
              All Products
            </h1>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>Premium materials. Trusted brands.</p>
          </div>
        </div>

        {/* Category tabs — icon topped */}
        <div className="cat-tabs">
          <Link href="/products" className={`cat-tab${activeCategory === 'all' ? ' cat-tab--active' : ''}`}>
            <span className="cat-tab-icon">▦</span>All Products
          </Link>
          {categories?.map(cat => (
            <Link key={cat.slug} href={`/products?category=${cat.slug}`}
              className={`cat-tab${activeCategory === cat.slug ? ' cat-tab--active' : ''}`}>
              <span className="cat-tab-icon">{cat.icon}</span>{cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Body: sidebar + grid ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 40px 64px', display: 'flex', gap: 28, alignItems: 'flex-start' }} className="prod-body">

        {/* Sidebar */}
        <aside className="prod-sidebar">
          <div className="sb-block">
            <div className="sb-title">Categories</div>
            <div className="sb-cat-list">
              {categories?.map(cat => (
                <Link key={cat.slug} href={`/products?category=${cat.slug}`}
                  className={`sb-cat-link${activeCategory === cat.slug ? ' sb-cat-link--active' : ''}`}>
                  {cat.name} <span>›</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="sb-block">
            <div className="sb-title">Filter By</div>

            <div className="sb-filter-group">
              <div className="sb-filter-label">Brand</div>
              <div className="sb-checklist">
                {brands.map(b => (
                  <Link
                    key={b.slug}
                    href={buildHref({ brand: activeBrandSet.has(b.slug)
                      ? Array.from(activeBrandSet).filter(s => s !== b.slug).join(',') || undefined
                      : Array.from(new Set([...activeBrandSet, b.slug])).join(',') })}
                    className="sb-check-row"
                  >
                    <span className={`sb-checkbox${activeBrandSet.has(b.slug) ? ' sb-checkbox--on' : ''}`}>{activeBrandSet.has(b.slug) ? '✓' : ''}</span>
                    {b.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="sb-filter-group">
              <div className="sb-filter-label">Thickness</div>
              <div className="sb-checklist">
                {THICKNESS_OPTIONS.map(t => (
                  <Link
                    key={t}
                    href={buildHref({ thickness: activeThicknessSet.has(t)
                      ? Array.from(activeThicknessSet).filter(s => s !== t).join(',') || undefined
                      : Array.from(new Set([...activeThicknessSet, t])).join(',') })}
                    className="sb-check-row"
                  >
                    <span className={`sb-checkbox${activeThicknessSet.has(t) ? ' sb-checkbox--on' : ''}`}>{activeThicknessSet.has(t) ? '✓' : ''}</span>
                    {t}
                  </Link>
                ))}
              </div>
            </div>

            {(brandSlugs?.length || thicknessVals?.length || priceMin || priceMax) ? (
              <Link href="/products" className="sb-clear-btn">Clear Filters</Link>
            ) : null}
          </div>
        </aside>

        {/* Main column */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Search result banner */}
          {searchQuery && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFF4ED', border: '1.5px solid rgba(240,115,22,0.25)', borderRadius: 8, padding: '12px 18px', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontSize: 14, color: '#0B2447', fontWeight: 600 }}>
                🔍 Results for <strong>&ldquo;{searchQuery}&rdquo;</strong> — {total} found
              </span>
              <Link href="/products" style={{ fontSize: 12, color: '#6B7280', fontFamily: "'Syne',sans-serif", fontWeight: 600, letterSpacing: '.08em' }}>
                ✕ Clear
              </Link>
            </div>
          )}

          {/* Count + Sort */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
            <p style={{ fontSize: 13, color: '#6B7280' }}>
              Showing <strong style={{ color: '#0B2447' }}>{products.length ? (page - 1) * PER_PAGE + 1 : 0}-{Math.min(page * PER_PAGE, total)}</strong> of <strong style={{ color: '#0B2447' }}>{total}</strong> products
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 12, color: '#6B7280', fontFamily: "'Syne',sans-serif" }}>Sort by:</label>
              <SortSelect current={sort} />
            </div>
          </div>

          {/* Grid */}
          {products.length > 0 ? (
            <div className="cp-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#6B7280' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🪵</div>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: '1.1rem', color: '#0B2447', marginBottom: 8 }}>No products found</h3>
              <p style={{ fontSize: 14 }}>Try a different category or <Link href="/products" style={{ color: '#F07316' }}>view all products</Link>.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <Link href={buildHref({ page: String(Math.max(1, page - 1)) })} className={`page-btn${page === 1 ? ' page-btn--disabled' : ''}`}>←</Link>
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 6).map(n => (
                <Link key={n} href={buildHref({ page: String(n) })} className={`page-num${n === page ? ' page-num--active' : ''}`}>{n}</Link>
              ))}
              {totalPages > 6 && <span className="page-ellipsis">…</span>}
              {totalPages > 6 && <Link href={buildHref({ page: String(totalPages) })} className={`page-num${totalPages === page ? ' page-num--active' : ''}`}>{totalPages}</Link>}
              <Link href={buildHref({ page: String(Math.min(totalPages, page + 1)) })} className={`page-btn${page === totalPages ? ' page-btn--disabled' : ''}`}>→</Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Feature strip ── */}
      <div className="prod-feature-strip">
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px' }} className="feature-strip-inner">
          {[
            { i: '🛡️', t: '100% Original Products', d: 'Sourced from trusted brands' },
            { i: '✓', t: 'Best Price Guarantee', d: 'Get the best price always' },
            { i: '🚚', t: 'Fast Delivery Across India', d: 'Quick & reliable delivery' },
            { i: '🔒', t: 'Secure Payments', d: '100% safe & secure' },
            { i: '↺', t: 'Easy Returns', d: '7 days easy returns' },
          ].map(f => (
            <div key={f.t} className="feature-item">
              <span className="feature-item-icon">{f.i}</span>
              <div>
                <div className="feature-item-t">{f.t}</div>
                <div className="feature-item-d">{f.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .cat-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 0; border-bottom: 1px solid #E5E1DC; }
        .cat-tab { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 18px; font-family: 'Syne',sans-serif; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.04em; color: #6B7280; text-decoration: none; white-space: nowrap; border-bottom: 2px solid transparent; transition: all .15s; }
        .cat-tab-icon { font-size: 18px; }
        .cat-tab:hover { color: #0B2447; }
        .cat-tab--active { color: #F07316; border-bottom-color: #F07316; }

        .prod-sidebar { width: 240px; flex-shrink: 0; }
        .sb-block { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; padding: 18px; margin-bottom: 16px; }
        .sb-title { font-family: 'Syne',sans-serif; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #0B2447; margin-bottom: 12px; }
        .sb-cat-list { display: flex; flex-direction: column; }
        .sb-cat-link { display: flex; justify-content: space-between; padding: 8px 2px; font-size: 13px; color: #374151; text-decoration: none; border-bottom: 1px solid #F5F2ED; }
        .sb-cat-link:last-child { border-bottom: none; }
        .sb-cat-link:hover, .sb-cat-link--active { color: #F07316; }
        .sb-filter-group { margin-bottom: 16px; }
        .sb-filter-group:last-of-type { margin-bottom: 10px; }
        .sb-filter-label { font-size: 12px; font-weight: 700; color: #0B2447; margin-bottom: 8px; }
        .sb-checklist { display: flex; flex-direction: column; gap: 6px; max-height: 220px; overflow-y: auto; }
        .sb-check-row { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: #4B5563; text-decoration: none; padding: 2px 0; }
        .sb-check-row:hover { color: #0B2447; }
        .sb-checkbox { width: 15px; height: 15px; border: 1.5px solid #D1CBC2; border-radius: 3px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #FFFFFF; }
        .sb-checkbox--on { background: #F07316; border-color: #F07316; }
        .sb-clear-btn { display: block; text-align: center; padding: 9px 0; border: 1px solid #E5E1DC; border-radius: 6px; color: #6B7280; font-family: 'Syne',sans-serif; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; margin-top: 8px; }
        .sb-clear-btn:hover { border-color: #F07316; color: #F07316; }

        .sort-select { font-size: 12px; border: 1px solid #E5E1DC; border-radius: 6px; padding: 6px 10px; color: #0B2447; background: #FFFFFF; font-family: 'Syne',sans-serif; }

        .cp-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; }
        @media(max-width:1100px){ .cp-grid { grid-template-columns:repeat(3,1fr) !important; } .prod-sidebar { display: none; } }
        @media(max-width:640px) { .cp-grid { grid-template-columns:repeat(2,1fr) !important; gap:12px !important; } .prod-body,.prod-hero-pad { padding-left:16px !important; padding-right:16px !important; } }
        @media(max-width:380px) { .cp-grid { grid-template-columns:1fr !important; } }

        .pagination { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 40px; }
        .page-btn, .page-num { display: flex; align-items: center; justify-content: center; min-width: 32px; height: 32px; border-radius: 6px; border: 1px solid #E5E1DC; color: #6B7280; text-decoration: none; font-size: 13px; font-family: 'Syne',sans-serif; }
        .page-btn:hover, .page-num:hover { border-color: #F07316; color: #F07316; }
        .page-btn--disabled { opacity: 0.4; pointer-events: none; }
        .page-num--active { background: #F07316; border-color: #F07316; color: #FFFFFF; }
        .page-ellipsis { color: #9CA3AF; padding: 0 2px; }

        .prod-feature-strip { background: #0B2447; padding: 26px 0; margin-top: 8px; }
        .feature-strip-inner { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
        .feature-item { display: flex; align-items: center; gap: 12px; }
        .feature-item-icon { font-size: 22px; flex-shrink: 0; }
        .feature-item-t { font-family: 'Syne',sans-serif; font-size: 0.76rem; font-weight: 700; color: #FFFFFF; }
        .feature-item-d { font-size: 0.66rem; color: #93A3BC; margin-top: 2px; }
        @media(max-width:900px){ .feature-strip-inner { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  );
}
