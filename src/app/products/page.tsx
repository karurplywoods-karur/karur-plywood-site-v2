// src/app/products/page.tsx
// KEY FIX: Compact cards (no long description), MRP strikethrough, click → detail page
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getProjectProducts, getCategories } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Products | Plywood, Doors, Laminates & Hardware in Karur',
  description: 'Buy premium plywood, doors, laminates and hardware at best prices in Karur. ISI certified. Wholesale & retail. WhatsApp for quick pricing.',
};

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999';

// ── Compact Product Card (server component version) ──────────
function CompactProductCard({ product }: { product: any }) {
  const discount =
    product.mrp && product.price && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null;

  const waText = encodeURIComponent(
    `Hi, I'm interested in *${product.name}*${product.price ? ` (₹${product.price.toLocaleString('en-IN')} ${product.unit || ''})` : ''}. Can you confirm availability?`
  );

  return (
    <div className="cp-card">
      {/* IMAGE — click goes to detail page */}
      <Link href={`/products/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div className="cp-img-wrap">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="cp-img"
              sizes="(max-width:768px) 50vw, 25vw"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="cp-img-placeholder">
              {product.categories?.icon || '📦'}
            </div>
          )}

          {/* Category chip */}
          {product.categories && (
            <div className="cp-cat-badge">
              {product.categories.icon} {product.categories.name}
            </div>
          )}

          {/* Discount badge */}
          {discount && discount > 0 && (
            <div className="cp-discount-badge">
              {discount}% OFF
            </div>
          )}

          {/* Hover overlay */}
          <div className="cp-hover-overlay">
            <span className="cp-hover-text">View Details →</span>
          </div>
        </div>
      </Link>

      {/* BODY */}
      <div className="cp-body">
        {/* Name — link to detail */}
        <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
          <div className="cp-name">{product.name}</div>
        </Link>

        {/* Price row — compact */}
        <div className="cp-price-area">
          {product.mrp && product.mrp > (product.price || 0) && (
            <span className="cp-mrp">₹{product.mrp.toLocaleString('en-IN')}</span>
          )}
          {product.price ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span className="cp-price">₹{product.price.toLocaleString('en-IN')}</span>
              {product.unit && <span className="cp-unit">/{product.unit}</span>}
            </div>
          ) : (
            <span className="cp-no-price">Contact for Price</span>
          )}
        </div>

        {/* Stock */}
        <div className="cp-stock">
          <span className={`cp-stock-dot ${product.in_stock ? 'cp-stock-dot--green' : 'cp-stock-dot--red'}`} />
          <span className={`cp-stock-label ${product.in_stock ? 'cp-stock-label--green' : 'cp-stock-label--red'}`}>
            {product.in_stock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {/* CTAs */}
        <div className="cp-actions">
          <Link href={`/products/${product.id}`} className="cp-detail-btn">
            Details
          </Link>
          <a
            href={`https://wa.me/${WA}?text=${waText}`}
            target="_blank" rel="noopener"
            className="cp-wa-btn"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Enquire
          </a>
        </div>
      </div>
    </div>
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const [products, categories] = await Promise.all([
    getProjectProducts(searchParams.category),
    getCategories(),
  ]);

  const activeCategory = searchParams.category || 'all';

  return (
    <>
      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(160deg,#0a1d3a,#070F1F)',
        borderBottom: '1px solid rgba(249,115,22,0.15)',
        padding: '64px 0',
        paddingTop: 'calc(64px + 58px)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }} className="prod-hero-pad">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: '#F97316', marginBottom: 12 }}>
                <span style={{ width: 20, height: 1, background: '#F97316', display: 'inline-block' }} />
                Project Products
              </div>
              <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2.2rem,4vw,3.8rem)', letterSpacing: '.04em', color: '#F8F9FB', lineHeight: 1, marginBottom: 10 }}>
                PREMIUM BUILDING<br />
                <span style={{ color: '#F97316' }}>MATERIALS</span>
              </h1>
              <p style={{ fontSize: 14, color: '#7A8EA8', maxWidth: 460 }}>
                ISI Certified · All Major Brands · Wholesale &amp; Retail · Karur's Widest Selection
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                href={`https://wa.me/${WA}?text=Hi%2C+I+need+a+price+list+for+your+products.`}
                target="_blank" rel="noopener"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 6, background: '#25D366', color: 'white', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase', textDecoration: 'none' }}>
                💬 Get Price List
              </a>
              <Link href="/quick-order"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 6, background: 'rgba(37,211,102,0.1)', color: '#25D366', fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase', textDecoration: 'none', border: '1px solid rgba(37,211,102,0.25)' }}>
                ⚡ Quick Order
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 48px' }} className="prod-content-pad">

        {/* ── CATEGORY FILTER TABS ── */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
          <Link href="/products"
            className={`prod-filter-tab${activeCategory === 'all' ? ' prod-filter-tab--active' : ''}`}>
            🏷️ All {activeCategory === 'all' && `(${products.length})`}
          </Link>
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className={`prod-filter-tab${activeCategory === cat.slug ? ' prod-filter-tab--active' : ''}`}
            >
              {cat.icon} {cat.name}
            </Link>
          ))}
        </div>

        {/* ── RESULTS COUNT ── */}
        {products.length > 0 && (
          <div style={{ fontSize: 13, color: '#7A8EA8', marginBottom: 24 }}>
            Showing <strong style={{ color: '#F8F9FB' }}>{products.length}</strong> product{products.length !== 1 ? 's' : ''}
            {activeCategory !== 'all' && categories.find(c => c.slug === activeCategory)
              ? ` in ${categories.find(c => c.slug === activeCategory)?.name}`
              : ''}
          </div>
        )}

        {/* ── PRODUCT GRID ── */}
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '2rem', letterSpacing: '.05em', color: '#F8F9FB', marginBottom: 8 }}>
              No Products Found
            </div>
            <p style={{ color: '#7A8EA8', marginBottom: 24 }}>
              Check back soon or ask us on WhatsApp.
            </p>
            <a
              href={`https://wa.me/${WA}?text=Hi%2C+do+you+have+products+in+this+category%3F`}
              target="_blank" rel="noopener"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 8, background: '#25D366', color: 'white', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              💬 Ask on WhatsApp
            </a>
          </div>
        ) : (
          <div className="cp-grid">
            {products.map((product: any) => (
              <CompactProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* ── BOTTOM CTA BANNER ── */}
        {products.length > 0 && (
          <div style={{ marginTop: 64, background: 'linear-gradient(135deg,#0D2B17,#091810)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: 12, padding: '36px 44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 28, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.8rem', letterSpacing: '.05em', color: '#F8F9FB', marginBottom: 6 }}>
                NEED A BULK QUOTE?
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
                Send your list and we'll give you the best wholesale rate.
              </div>
            </div>
            <a
              href={`https://wa.me/${WA}?text=Hi%2C+I+need+a+bulk+quote+for+plywood+and+materials.`}
              target="_blank" rel="noopener"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 8, background: '#25D366', color: 'white', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, textDecoration: 'none', flexShrink: 0 }}>
              💬 Get Bulk Quote on WhatsApp
            </a>
          </div>
        )}
      </div>

      <style>{`
        /* ── GRID ── */
        .cp-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        /* ── COMPACT CARD ── */
        .cp-card {
          background: rgba(25,55,109,0.35);
          border: 1px solid rgba(249,115,22,0.15);
          border-radius: 10px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform .25s, border-color .25s, box-shadow .25s;
        }
        .cp-card:hover {
          border-color: #F97316;
          transform: translateY(-5px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.4);
        }
        .cp-card:hover .cp-img { transform: scale(1.06); }
        .cp-card:hover .cp-hover-overlay { opacity: 1; }

        /* Image */
        .cp-img-wrap {
          position: relative;
          height: 175px;
          background: rgba(11,36,71,0.6);
          overflow: hidden;
          flex-shrink: 0;
        }
        .cp-img { object-fit: cover; transition: transform .4s ease; }
        .cp-img-placeholder {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 44px;
        }

        /* Badges */
        .cp-cat-badge {
          position: absolute; top: 8px; left: 8px;
          background: rgba(7,15,31,0.85);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(249,115,22,0.3);
          border-radius: 3px;
          padding: 2px 8px;
          font-family: 'Syne', sans-serif;
          font-size: 9px; font-weight: 700;
          letter-spacing: .12em; text-transform: uppercase;
          color: #F97316;
        }
        .cp-discount-badge {
          position: absolute; top: 8px; right: 8px;
          background: #25D366;
          border-radius: 3px;
          padding: 2px 7px;
          font-family: 'Syne', sans-serif;
          font-size: 9px; font-weight: 700;
          letter-spacing: .1em;
          color: white;
        }
        .cp-hover-overlay {
          position: absolute; inset: 0;
          background: rgba(7,15,31,0.5);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity .25s;
        }
        .cp-hover-text {
          font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: .1em; text-transform: uppercase;
          color: white;
        }

        /* Body */
        .cp-body {
          padding: 12px 14px 14px;
          display: flex; flex-direction: column;
          flex: 1;
        }
        .cp-name {
          font-family: 'Syne', sans-serif;
          font-size: .86rem; font-weight: 700;
          color: #F8F9FB; line-height: 1.3;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .cp-name:hover { color: #F97316; }

        /* Price */
        .cp-price-area { margin-bottom: 8px; }
        .cp-mrp {
          font-size: 11px;
          color: #7A8EA8;
          text-decoration: line-through;
          display: block;
          margin-bottom: 1px;
        }
        .cp-price {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.4rem;
          color: #F97316;
          letter-spacing: .03em;
          line-height: 1;
        }
        .cp-unit {
          font-size: 11px;
          color: #7A8EA8;
          font-family: 'DM Sans', sans-serif;
        }
        .cp-no-price {
          font-family: 'Syne', sans-serif;
          font-size: 11px; font-weight: 700;
          color: #F97316; letter-spacing: .06em;
        }

        /* Stock */
        .cp-stock {
          display: flex; align-items: center; gap: 5px;
          margin-bottom: 10px;
        }
        .cp-stock-dot {
          width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
        }
        .cp-stock-dot--green { background: #4ADE80; }
        .cp-stock-dot--red   { background: #F87171; }
        .cp-stock-label {
          font-family: 'Syne', sans-serif;
          font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
        }
        .cp-stock-label--green { color: #4ADE80; }
        .cp-stock-label--red   { color: #F87171; }

        /* Actions */
        .cp-actions {
          display: flex; gap: 7px; margin-top: auto;
        }
        .cp-detail-btn {
          flex: 1;
          display: flex; align-items: center; justify-content: center;
          padding: 8px 0;
          border-radius: 4px;
          border: 1px solid rgba(249,115,22,0.3);
          background: transparent; color: #F97316;
          font-family: 'Syne', sans-serif;
          font-size: .65rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
          text-decoration: none;
          transition: background .2s;
        }
        .cp-detail-btn:hover { background: rgba(249,115,22,0.08); }
        .cp-wa-btn {
          flex: 1;
          display: flex; align-items: center; justify-content: center; gap: 5px;
          padding: 8px 0;
          border-radius: 4px;
          background: #25D366; color: white;
          font-family: 'Syne', sans-serif;
          font-size: .65rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
          text-decoration: none;
          transition: background .2s;
        }
        .cp-wa-btn:hover { background: #1fbc59; }

        /* Filter tabs */
        .prod-filter-tab {
          padding: 8px 18px;
          border-radius: 20px;
          border: 1px solid rgba(249,115,22,0.2);
          background: transparent;
          color: #7A8EA8;
          font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 600;
          letter-spacing: .06em;
          text-decoration: none;
          transition: all .2s;
          white-space: nowrap;
        }
        .prod-filter-tab:hover {
          border-color: rgba(249,115,22,0.4);
          color: #F8F9FB;
        }
        .prod-filter-tab--active {
          border-color: #F97316;
          background: rgba(249,115,22,0.12);
          color: #F97316;
        }

        /* Responsive */
        @media(max-width:1200px){ .cp-grid { grid-template-columns: repeat(3,1fr) !important; } }
        @media(max-width:900px) { .cp-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media(max-width:560px) {
          .cp-grid { grid-template-columns: repeat(2,1fr) !important; gap: 12px !important; }
          .prod-content-pad { padding: 28px 16px !important; }
          .prod-hero-pad { padding: 0 20px !important; }
          .cp-img-wrap { height: 140px !important; }
        }
        @media(max-width:380px) { .cp-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}