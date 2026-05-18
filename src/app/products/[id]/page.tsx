'use client';
// src/app/products/[id]/page.tsx
// Full product detail page: MRP (slashed) + sale price, gallery, add-to-cart, associated products

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import { getProductBadge } from '@/lib/badges';
import type { Product } from '@/lib/types';

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999';

interface Associated {
  sameCategory: Product[];
  otherProducts: Product[];
}

// ── Mini Product Card (for associated section) ──────────────────────────────
function MiniCard({ product }: { product: Product }) {
  const { items, add, inc, dec } = useCart();
  const cartItem = items.find(i => i.product.id === product.id);
  const qty = cartItem?.quantity || 0;
  const discount = product.mrp && product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : null;

  return (
    <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
      <div className="mini-card">
        <div className="mini-img-wrap">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width:768px) 50vw, 25vw"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="mini-img-placeholder">
              {product.categories?.icon || '📦'}
            </div>
          )}
          {discount && discount > 0 && (
            <div className="mini-discount-badge">{discount}% OFF</div>
          )}
        </div>
        <div className="mini-body">
          <div className="mini-cat">{product.categories?.name}</div>
          <div className="mini-name">{product.name}</div>
          <div className="mini-price-row">
            {product.price ? (
              <>
                <span className="mini-sale">₹{product.price.toLocaleString('en-IN')}</span>
                {product.mrp && product.mrp > product.price && (
                  <span className="mini-mrp">₹{product.mrp.toLocaleString('en-IN')}</span>
                )}
                {product.unit && <span className="mini-unit">/{product.unit}</span>}
              </>
            ) : (
              <span className="mini-tbd">Price on request</span>
            )}
          </div>
          {qty === 0 ? (
            <button
              className="mini-add-btn"
              onClick={e => { e.preventDefault(); add(product); }}
              type="button"
            >
              + Add
            </button>
          ) : (
            <div className="mini-qty" onClick={e => e.preventDefault()}>
              <button className="mini-qty-btn" onClick={() => dec(product)} type="button">−</button>
              <span>{qty}</span>
              <button className="mini-qty-btn" onClick={() => inc(product)} type="button">+</button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Main Product Detail Page ────────────────────────────────────────────────
export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { items, add, inc, dec } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [associated, setAssociated] = useState<Associated>({ sameCategory: [], otherProducts: [] });
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState<string | null>(null);
  const [addedFlash, setAddedFlash] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then(data => {
        if (!data) return;
        setProduct(data.product);
        setAssociated(data.associated);
        setActiveImg(data.product.image_url || null);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [params.id]);

  const cartItem = product ? items.find(i => i.product.id === product.id) : null;
  const qty = cartItem?.quantity || 0;

  const handleAdd = useCallback(() => {
    if (!product) return;
    add(product);
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 1400);
  }, [product, add]);

  const handleWA = useCallback(() => {
    if (!product) return;
    const msg = encodeURIComponent(
      `Hi, I'm interested in *${product.name}*${product.price ? ` (₹${product.price.toLocaleString('en-IN')}${product.unit ? `/${product.unit}` : ''})` : ''}. Please share more details.`
    );
    window.open(`https://wa.me/${WA}?text=${msg}`, '_blank');
  }, [product]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="pdp-spinner" />
      </main>
    );
  }

  // ── Not Found ──────────────────────────────────────────────────────────────
  if (notFound || !product) {
    return (
      <main style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '3rem' }}>🪵</div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', color: 'var(--white)' }}>Product not found</h2>
        <Link href="/products" style={{ color: 'var(--orange)', fontFamily: 'Syne, sans-serif' }}>← Back to Products</Link>
      </main>
    );
  }

  // ── Price calculations ─────────────────────────────────────────────────────
  const badge = getProductBadge(product);
  const hasMRP = product.mrp && product.price && product.mrp > product.price;
  const discount = hasMRP
    ? Math.round(((product.mrp! - product.price!) / product.mrp!) * 100)
    : null;

  const allAssociated = [...associated.sameCategory, ...associated.otherProducts];

  return (
    <>
      {/* ── Breadcrumb ── */}
      <nav className="pdp-breadcrumb">
        <Link href="/" className="pdp-bc-link">Home</Link>
        <span className="pdp-bc-sep">›</span>
        <Link href="/products" className="pdp-bc-link">Products</Link>
        {product.categories && (
          <>
            <span className="pdp-bc-sep">›</span>
            <Link href={`/products?cat=${product.categories.slug}`} className="pdp-bc-link">
              {product.categories.name}
            </Link>
          </>
        )}
        <span className="pdp-bc-sep">›</span>
        <span className="pdp-bc-current">{product.name}</span>
      </nav>

      {/* ── Main Detail Layout ── */}
      <main className="pdp-main">
        <div className="pdp-container">

          {/* LEFT — Image */}
          <div className="pdp-gallery">
            <div className="pdp-main-img-wrap">
              {activeImg ? (
                <Image
                  src={activeImg}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width:768px) 100vw, 50vw"
                  style={{ objectFit: 'cover', borderRadius: '4px' }}
                />
              ) : (
                <div className="pdp-img-placeholder">
                  {product.categories?.icon || '📦'}
                </div>
              )}

              {/* Badges */}
              {badge && (
                <div
                  className="pdp-trust-badge"
                  style={{ background: badge.color, color: badge.textColor }}
                >
                  {badge.emoji} {badge.label}
                </div>
              )}
              {discount && discount > 0 && (
                <div className="pdp-discount-badge">{discount}% OFF</div>
              )}
            </div>
          </div>

          {/* RIGHT — Info */}
          <div className="pdp-info">

            {/* Category pill */}
            {product.categories && (
              <div className="pdp-cat-pill">
                {product.categories.icon} {product.categories.name}
              </div>
            )}

            {/* Product name */}
            <h1 className="pdp-title">{product.name}</h1>

            {/* Price block */}
            <div className="pdp-price-block">
              {product.price ? (
                <>
                  <div className="pdp-price-row">
                    <span className="pdp-sale-price">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    {product.unit && (
                      <span className="pdp-unit">/ {product.unit}</span>
                    )}
                  </div>
                  {hasMRP && (
                    <div className="pdp-mrp-row">
                      <span className="pdp-mrp-label">MRP:</span>
                      <span className="pdp-mrp-price">
                        ₹{product.mrp!.toLocaleString('en-IN')}
                      </span>
                      {discount && discount > 0 && (
                        <span className="pdp-save-tag">
                          You save ₹{(product.mrp! - product.price!).toLocaleString('en-IN')} ({discount}%)
                        </span>
                      )}
                    </div>
                  )}
                  <div className="pdp-price-note">
                    * Prices include GST. Bulk pricing available on request.
                  </div>
                </>
              ) : (
                <div className="pdp-price-enquiry">
                  <span>💬</span>
                  <span>Price on enquiry — tap WhatsApp to get a quote</span>
                </div>
              )}
            </div>

            {/* Stock & delivery */}
            <div className="pdp-meta-row">
              {product.in_stock !== false ? (
                <span className="pdp-in-stock">✓ In Stock</span>
              ) : (
                <span className="pdp-out-stock">✗ Out of Stock</span>
              )}
              <span className="pdp-delivery">
                🚚 Delivery across Tamil Nadu
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="pdp-desc">{product.description}</p>
            )}

            {/* Specs (if any custom fields) */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="pdp-specs">
                <div className="pdp-specs-title">Specifications</div>
                <div className="pdp-specs-grid">
                  {Object.entries(product.specs).map(([k, v]) => (
                    <div key={k} className="pdp-spec-row">
                      <span className="pdp-spec-key">{k}</span>
                      <span className="pdp-spec-val">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="pdp-cta-group">
              {/* Add to Cart / Qty Control */}
              {product.in_stock !== false && (
                qty === 0 ? (
                  <button
                    className={`pdp-add-btn${addedFlash ? ' pdp-add-btn--flash' : ''}`}
                    onClick={handleAdd}
                    type="button"
                  >
                    {addedFlash ? '✓ Added to Cart!' : '+ Add to Cart'}
                  </button>
                ) : (
                  <div className="pdp-qty-ctrl">
                    <button className="pdp-qty-btn" onClick={() => dec(product)} type="button" aria-label="Decrease">−</button>
                    <span className="pdp-qty-num">{qty} in cart</span>
                    <button className="pdp-qty-btn" onClick={() => inc(product)} type="button" aria-label="Increase">+</button>
                  </div>
                )
              )}

              {/* WhatsApp enquiry */}
              <button className="pdp-wa-btn" onClick={handleWA} type="button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.522 5.845L.057 23.926a.5.5 0 0 0 .617.617l6.081-1.465A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.793 9.793 0 0 1-5.021-1.379l-.36-.214-3.73.899.915-3.638-.235-.374A9.794 9.794 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                </svg>
                Enquire on WhatsApp
              </button>
            </div>

            {/* Trust row */}
            <div className="pdp-trust-row">
              {[
                { icon: '✅', text: 'ISI Certified' },
                { icon: '🏪', text: '25+ Years Trust' },
                { icon: '🔄', text: 'Easy Returns' },
                { icon: '📦', text: 'Safe Packaging' },
              ].map(t => (
                <div key={t.text} className="pdp-trust-item">
                  <span>{t.icon}</span>
                  <span>{t.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ── Associated Products ── */}
      {allAssociated.length > 0 && (
        <section className="pdp-assoc">
          <div className="pdp-assoc-inner">
            {/* Same category */}
            {associated.sameCategory.length > 0 && (
              <>
                <div className="pdp-section-header">
                  <h2 className="pdp-section-title">
                    More in {product.categories?.name || 'This Category'}
                  </h2>
                  <Link
                    href={`/products?cat=${product.categories?.slug}`}
                    className="pdp-see-all"
                  >
                    See all →
                  </Link>
                </div>
                <div className="mini-grid">
                  {associated.sameCategory.map(p => (
                    <MiniCard key={p.id} product={p} />
                  ))}
                </div>
              </>
            )}

            {/* Other products */}
            {associated.otherProducts.length > 0 && (
              <>
                <div className="pdp-section-header" style={{ marginTop: '3rem' }}>
                  <h2 className="pdp-section-title">You Might Also Like</h2>
                  <Link href="/products" className="pdp-see-all">Browse all →</Link>
                </div>
                <div className="mini-grid">
                  {associated.otherProducts.map(p => (
                    <MiniCard key={p.id} product={p} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Back to Products */}
      <div className="pdp-back-wrap">
        <button className="pdp-back-btn" onClick={() => router.back()} type="button">
          ← Back to Products
        </button>
      </div>

      {/* ── Styles ── */}
      <style>{`
        /* Breadcrumb */
        .pdp-breadcrumb {
          display: flex; align-items: center; flex-wrap: wrap; gap: 0.3rem;
          padding: 1rem 1.5rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem;
          color: #7A8EA8;
          max-width: 1280px; margin: 0 auto;
        }
        .pdp-bc-link {
          color: #7A8EA8; text-decoration: none;
          transition: color 0.2s;
        }
        .pdp-bc-link:hover { color: var(--orange); }
        .pdp-bc-sep { color: #3A4E6A; }
        .pdp-bc-current { color: var(--white); font-weight: 500; }

        /* Main layout */
        .pdp-main {
          padding: 0 1.5rem 2rem;
          max-width: 1280px; margin: 0 auto;
        }
        .pdp-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: start;
        }
        @media (max-width: 768px) {
          .pdp-container { grid-template-columns: 1fr; gap: 1.5rem; }
        }

        /* Gallery */
        .pdp-gallery { position: sticky; top: 80px; }
        .pdp-main-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 8px;
          overflow: hidden;
          background: #0D1B2E;
          border: 1px solid rgba(249,115,22,0.15);
        }
        .pdp-img-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-size: 5rem; color: #3A4E6A;
        }
        .pdp-trust-badge {
          position: absolute; top: 12px; left: 12px;
          padding: 4px 10px; border-radius: 3px;
          font-family: 'Syne', sans-serif;
          font-size: 0.65rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
        }
        .pdp-discount-badge {
          position: absolute; top: 12px; right: 12px;
          background: #F97316; color: white;
          padding: 4px 10px; border-radius: 3px;
          font-family: 'Syne', sans-serif;
          font-size: 0.7rem; font-weight: 800;
          letter-spacing: 0.05em;
        }

        /* Info column */
        .pdp-cat-pill {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(249,115,22,0.1);
          border: 1px solid rgba(249,115,22,0.25);
          color: var(--orange);
          padding: 4px 12px; border-radius: 20px;
          font-family: 'Syne', sans-serif;
          font-size: 0.65rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          margin-bottom: 0.75rem;
        }
        .pdp-title {
          font-family: 'Bebas Neue', cursive;
          font-size: clamp(2rem, 4vw, 2.8rem);
          color: var(--white);
          line-height: 1.05;
          margin: 0 0 1.25rem;
          letter-spacing: 0.02em;
        }

        /* Price block */
        .pdp-price-block {
          background: rgba(11,36,71,0.6);
          border: 1px solid rgba(249,115,22,0.2);
          border-radius: 8px;
          padding: 1.25rem 1.5rem;
          margin-bottom: 1.25rem;
        }
        .pdp-price-row {
          display: flex; align-items: baseline; gap: 0.5rem;
          margin-bottom: 0.4rem;
        }
        .pdp-sale-price {
          font-family: 'Bebas Neue', cursive;
          font-size: 2.4rem;
          color: #F97316;
          letter-spacing: 0.02em;
          line-height: 1;
        }
        .pdp-unit {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem; color: #7A8EA8;
        }
        .pdp-mrp-row {
          display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .pdp-mrp-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem; color: #5A7A9A;
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .pdp-mrp-price {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          color: #5A7A9A;
          text-decoration: line-through;
          text-decoration-color: #F97316;
          text-decoration-thickness: 1.5px;
        }
        .pdp-save-tag {
          background: rgba(34,197,94,0.12);
          border: 1px solid rgba(34,197,94,0.3);
          color: #4ADE80;
          font-family: 'Syne', sans-serif;
          font-size: 0.65rem; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 2px 8px; border-radius: 3px;
        }
        .pdp-price-note {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.7rem; color: #5A7A9A;
          font-style: italic;
        }
        .pdp-price-enquiry {
          display: flex; align-items: center; gap: 0.5rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; color: #F97316;
        }

        /* Meta row */
        .pdp-meta-row {
          display: flex; align-items: center; flex-wrap: wrap; gap: 1rem;
          margin-bottom: 1.25rem;
          font-family: 'DM Sans', sans-serif; font-size: 0.82rem;
        }
        .pdp-in-stock { color: #4ADE80; font-weight: 600; }
        .pdp-out-stock { color: #F87171; font-weight: 600; }
        .pdp-delivery { color: #7A8EA8; }

        /* Description */
        .pdp-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; line-height: 1.7;
          color: #9DB5CC;
          margin-bottom: 1.25rem;
        }

        /* Specs */
        .pdp-specs {
          background: rgba(11,36,71,0.4);
          border: 1px solid rgba(58,78,106,0.4);
          border-radius: 6px;
          padding: 1rem 1.25rem;
          margin-bottom: 1.25rem;
        }
        .pdp-specs-title {
          font-family: 'Syne', sans-serif;
          font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: #7A8EA8; margin-bottom: 0.75rem;
        }
        .pdp-spec-row {
          display: flex; justify-content: space-between;
          padding: 0.4rem 0;
          border-bottom: 1px solid rgba(58,78,106,0.3);
          font-family: 'DM Sans', sans-serif; font-size: 0.82rem;
        }
        .pdp-spec-row:last-child { border-bottom: none; }
        .pdp-spec-key { color: #7A8EA8; }
        .pdp-spec-val { color: var(--white); font-weight: 500; }

        /* CTA buttons */
        .pdp-cta-group {
          display: flex; flex-direction: column; gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .pdp-add-btn {
          width: 100%;
          padding: 1rem;
          background: var(--orange);
          color: white; border: none; border-radius: 4px;
          font-family: 'Syne', sans-serif;
          font-size: 0.85rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .pdp-add-btn:hover { background: #EA6A0A; transform: translateY(-1px); }
        .pdp-add-btn--flash { background: #25D366 !important; }

        .pdp-qty-ctrl {
          display: flex; align-items: center; justify-content: center; gap: 0;
          border: 2px solid var(--orange); border-radius: 4px;
          overflow: hidden;
        }
        .pdp-qty-btn {
          padding: 0.9rem 1.5rem;
          background: rgba(249,115,22,0.1);
          color: var(--orange); border: none;
          font-size: 1.2rem; cursor: pointer;
          font-family: 'Syne', sans-serif; font-weight: 700;
          transition: background 0.2s;
        }
        .pdp-qty-btn:hover { background: rgba(249,115,22,0.25); }
        .pdp-qty-num {
          flex: 1; text-align: center;
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 0.85rem; letter-spacing: 0.1em;
          color: var(--white);
        }

        .pdp-wa-btn {
          width: 100%;
          padding: 0.85rem 1rem;
          background: transparent;
          border: 1.5px solid rgba(37,211,102,0.4);
          color: #25D366; border-radius: 4px;
          font-family: 'Syne', sans-serif;
          font-size: 0.8rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          transition: background 0.2s, border-color 0.2s;
        }
        .pdp-wa-btn:hover {
          background: rgba(37,211,102,0.08);
          border-color: rgba(37,211,102,0.7);
        }

        /* Trust row */
        .pdp-trust-row {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.6rem;
        }
        .pdp-trust-item {
          display: flex; align-items: center; gap: 0.4rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem; color: #7A8EA8;
          background: rgba(11,36,71,0.4);
          border: 1px solid rgba(58,78,106,0.3);
          padding: 0.5rem 0.75rem; border-radius: 4px;
        }

        /* Associated section */
        .pdp-assoc {
          background: rgba(7,15,31,0.6);
          border-top: 1px solid rgba(58,78,106,0.3);
          padding: 3rem 1.5rem;
          margin-top: 2rem;
        }
        .pdp-assoc-inner { max-width: 1280px; margin: 0 auto; }
        .pdp-section-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .pdp-section-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.2rem; font-weight: 700;
          color: var(--white);
          text-transform: uppercase; letter-spacing: 0.06em;
          margin: 0;
        }
        .pdp-see-all {
          font-family: 'Syne', sans-serif;
          font-size: 0.75rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--orange); text-decoration: none;
          transition: opacity 0.2s;
        }
        .pdp-see-all:hover { opacity: 0.75; }

        /* Mini card grid */
        .mini-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        @media (max-width: 1024px) { .mini-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 640px)  { .mini-grid { grid-template-columns: repeat(2, 1fr); } }

        /* Mini card */
        .mini-card {
          background: rgba(11,36,71,0.5);
          border: 1px solid rgba(58,78,106,0.4);
          border-radius: 6px; overflow: hidden;
          transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }
        .mini-card:hover {
          transform: translateY(-3px);
          border-color: rgba(249,115,22,0.4);
          box-shadow: 0 8px 24px rgba(249,115,22,0.1);
        }
        .mini-img-wrap {
          position: relative; width: 100%; aspect-ratio: 4/3;
          background: #0D1B2E;
        }
        .mini-img-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-size: 2rem; color: #3A4E6A;
        }
        .mini-discount-badge {
          position: absolute; top: 6px; right: 6px;
          background: #F97316; color: white;
          font-family: 'Syne', sans-serif;
          font-size: 0.55rem; font-weight: 800;
          letter-spacing: 0.05em;
          padding: 2px 6px; border-radius: 2px;
        }
        .mini-body { padding: 0.75rem; }
        .mini-cat {
          font-family: 'Syne', sans-serif;
          font-size: 0.55rem; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--orange); margin-bottom: 0.2rem;
        }
        .mini-name {
          font-family: 'Syne', sans-serif;
          font-size: 0.8rem; font-weight: 600;
          color: var(--white); line-height: 1.3;
          margin-bottom: 0.4rem;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .mini-price-row {
          display: flex; align-items: baseline; flex-wrap: wrap; gap: 0.3rem;
          margin-bottom: 0.6rem;
        }
        .mini-sale {
          font-family: 'Bebas Neue', cursive;
          font-size: 1.1rem; color: #F97316;
        }
        .mini-mrp {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.7rem; color: #5A7A9A;
          text-decoration: line-through;
          text-decoration-color: #F97316;
        }
        .mini-unit {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.65rem; color: #5A7A9A;
        }
        .mini-tbd {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.7rem; color: #5A7A9A; font-style: italic;
        }
        .mini-add-btn {
          width: 100%; padding: 0.4rem;
          background: var(--orange); color: white;
          border: none; border-radius: 3px;
          font-family: 'Syne', sans-serif;
          font-size: 0.65rem; font-weight: 700;
          letter-spacing: 0.1em; cursor: pointer;
          transition: background 0.15s;
        }
        .mini-add-btn:hover { background: #EA6A0A; }
        .mini-qty {
          display: flex; align-items: center; justify-content: space-between;
          border: 1.5px solid var(--orange); border-radius: 3px;
          overflow: hidden;
        }
        .mini-qty-btn {
          padding: 0.3rem 0.6rem;
          background: rgba(249,115,22,0.1);
          color: var(--orange); border: none;
          font-size: 0.9rem; cursor: pointer;
          transition: background 0.15s;
        }
        .mini-qty-btn:hover { background: rgba(249,115,22,0.25); }
        .mini-qty span {
          font-family: 'Syne', sans-serif; font-size: 0.7rem;
          font-weight: 700; color: var(--white);
        }

        /* Back button */
        .pdp-back-wrap {
          display: flex; justify-content: center;
          padding: 2rem 1.5rem 3rem;
        }
        .pdp-back-btn {
          background: transparent;
          border: 1px solid rgba(58,78,106,0.5);
          color: #7A8EA8;
          padding: 0.6rem 1.5rem; border-radius: 4px;
          font-family: 'Syne', sans-serif;
          font-size: 0.75rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
        }
        .pdp-back-btn:hover { color: var(--orange); border-color: var(--orange); }

        /* Spinner */
        .pdp-spinner {
          width: 40px; height: 40px;
          border: 3px solid rgba(249,115,22,0.2);
          border-top-color: var(--orange);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}