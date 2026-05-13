'use client';
// src/components/ProductCard.tsx  — Compact card + modal redesign
import { useCallback, useState } from 'react';
import Image from 'next/image';
import type { Product, CartItem } from '@/lib/types';
import { getProductBadge } from '@/lib/badges';
import { trackWAClick, trackViewProduct, trackAddToCart, generateTrackingId } from '@/lib/analytics';

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999';

interface Props {
  product: Product;
  mode: 'project' | 'quick';
  cartItem?: CartItem;
  onAdd?:    (p: Product) => void;
  onInc?:    (p: Product) => void;
  onDec?:    (p: Product) => void;
  onSetQty?: (p: Product, qty: number) => void;
}

// ── Modal Component ────────────────────────────────────────────
function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const badge = getProductBadge(product);
  const categoryName = product.categories?.name;

  const handleWA = () => {
    trackWAClick({ source: 'product_card', product_name: product.name, category: categoryName });
    const trackingId = generateTrackingId();
    fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Modal WA Click', phone: 'N/A', product: product.name,
        message: `Modal WA click: ${product.name}`,
        tracking_id: trackingId, source: 'website', wa_source: 'product_card',
        product_name: product.name, category: categoryName,
      }),
    }).catch(() => {});
    const text = encodeURIComponent(`Hi, I am interested in ${product.name}. Can you help me?`);
    window.open(`https://wa.me/${WA}?text=${text}`, '_blank');
  };

  // Derive specs from product data
  const specs: { label: string; value: string }[] = [];
  if (product.categories?.name) specs.push({ label: 'Category', value: product.categories.name });
  if (product.unit) specs.push({ label: 'Unit', value: product.unit });
  if (product.type === 'project') specs.push({ label: 'Type', value: 'Project Grade' });
  if (product.type === 'quick')   specs.push({ label: 'Type', value: 'Quick Order' });
  specs.push({ label: 'Availability', value: product.in_stock ? 'In Stock' : 'Out of Stock' });

  // Use-cases derived from category
  const USE_CASES: Record<string, string[]> = {
    plywood:   ['Furniture & Wardrobes', 'Kitchen Cabinets', 'False Ceiling', 'Structural Work'],
    doors:     ['Main Entrance', 'Bedroom & Bath', 'Office Interiors', 'Commercial Spaces'],
    laminates: ['Kitchen Shutters', 'Wardrobe Surfaces', 'Table Tops', 'Wall Panels'],
    hardware:  ['Furniture Fitting', 'Door & Window', 'Cabinet Hardware', 'Structural Fixing'],
  };
  const useCases = USE_CASES[product.categories?.slug || ''] || ['Home Interiors', 'Commercial Projects', 'Renovation Work'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        {/* Close */}
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="modal-inner">
          {/* Left — image */}
          <div className="modal-img-col">
            <div className="modal-img-wrap">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              ) : (
                <div className="modal-img-placeholder">
                  {product.categories?.icon || '📦'}
                </div>
              )}
              {badge && (
                <div className="modal-badge" style={{ background: badge.color, color: badge.textColor }}>
                  {badge.emoji} {badge.label}
                </div>
              )}
            </div>

            {/* Use cases */}
            <div className="modal-use-cases">
              <div className="modal-use-title">IDEAL FOR</div>
              <div className="modal-use-grid">
                {useCases.map(u => (
                  <div key={u} className="modal-use-chip">✓ {u}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — details */}
          <div className="modal-detail-col">
            {product.categories && (
              <div className="modal-cat-tag">
                {product.categories.icon} {product.categories.name}
              </div>
            )}

            <h2 className="modal-title">{product.name}</h2>

            {product.price && (
              <div className="modal-price-row">
                <span className="modal-price">₹{product.price.toLocaleString('en-IN')}</span>
                {product.unit && <span className="modal-unit">/ {product.unit}</span>}
              </div>
            )}

            <div className="modal-stock-row">
              <span className={`modal-stock-dot${product.in_stock ? '' : ' modal-stock-dot--out'}`} />
              <span className="modal-stock-label">{product.in_stock ? 'In Stock' : 'Out of Stock'}</span>
            </div>

            {product.description && (
              <p className="modal-desc">{product.description}</p>
            )}

            {/* Specs table */}
            <div className="modal-specs">
              <div className="modal-specs-title">SPECIFICATIONS</div>
              <div className="modal-specs-table">
                {specs.map(s => (
                  <div key={s.label} className="modal-spec-row">
                    <span className="modal-spec-label">{s.label}</span>
                    <span className="modal-spec-val">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="modal-ctas">
              <button onClick={handleWA} className="modal-wa-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Enquire on WhatsApp
              </button>
              <a
                href={`tel:+91${(process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999').slice(2)}`}
                className="modal-call-btn"
              >
                📞 Call Now
              </a>
            </div>

            <p className="modal-note">Our team replies within minutes. No obligation.</p>
          </div>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed; inset: 0; z-index: 8000;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: modalFadeIn 0.2s ease;
        }
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .modal-box {
          position: relative;
          background: #0d1a30;
          border: 1px solid rgba(249,115,22,0.25);
          border-radius: 12px;
          width: 100%; max-width: 860px;
          max-height: 90vh;
          overflow-y: auto;
          animation: modalSlideUp 0.25s ease;
          box-shadow: 0 32px 80px rgba(0,0,0,0.7);
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .modal-close {
          position: absolute; top: 14px; right: 16px; z-index: 10;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
          color: #7A8EA8; border-radius: 6px; width: 32px; height: 32px;
          cursor: pointer; font-size: 14px; transition: all 0.15s;
          display: flex; align-items: center; justify-content: center;
        }
        .modal-close:hover { background: rgba(249,115,22,0.15); color: #F97316; border-color: #F97316; }

        .modal-inner {
          display: grid; grid-template-columns: 380px 1fr;
          min-height: 460px;
        }

        /* Image column */
        .modal-img-col {
          border-right: 1px solid rgba(249,115,22,0.1);
          display: flex; flex-direction: column;
        }
        .modal-img-wrap {
          position: relative; height: 300px; flex-shrink: 0;
          background: rgba(11,36,71,0.6); overflow: hidden;
        }
        .modal-img-placeholder {
          height: 100%; display: flex; align-items: center;
          justify-content: center; font-size: 80px;
        }
        .modal-badge {
          position: absolute; bottom: 12px; left: 12px;
          font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700;
          letter-spacing: .12em; text-transform: uppercase;
          padding: 4px 10px; border-radius: 3px;
        }

        .modal-use-cases { padding: 20px; flex: 1; }
        .modal-use-title {
          font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700;
          letter-spacing: .2em; text-transform: uppercase;
          color: #7A8EA8; margin-bottom: 12px;
        }
        .modal-use-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .modal-use-chip {
          font-size: 12px; color: #A8BCCC;
          background: rgba(249,115,22,0.06);
          border: 1px solid rgba(249,115,22,0.12);
          border-radius: 3px; padding: 5px 10px;
          font-family: 'Syne', sans-serif; font-weight: 600;
        }

        /* Detail column */
        .modal-detail-col { padding: 32px 28px; display: flex; flex-direction: column; gap: 0; }

        .modal-cat-tag {
          font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700;
          letter-spacing: .18em; text-transform: uppercase;
          color: #F97316; margin-bottom: 10px;
        }
        .modal-title {
          font-family: 'Syne', sans-serif; font-size: 1.35rem; font-weight: 800;
          color: #F8F9FB; line-height: 1.25; margin-bottom: 14px;
        }
        .modal-price-row {
          display: flex; align-items: baseline; gap: 6px; margin-bottom: 10px;
        }
        .modal-price {
          font-family: 'Bebas Neue', sans-serif; font-size: 2.2rem;
          color: #F97316; letter-spacing: .04em; line-height: 1;
        }
        .modal-unit { font-size: 13px; color: #7A8EA8; }

        .modal-stock-row {
          display: flex; align-items: center; gap: 7px; margin-bottom: 18px;
        }
        .modal-stock-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #25D366; flex-shrink: 0;
        }
        .modal-stock-dot--out { background: #F87171; }
        .modal-stock-label { font-size: 12px; color: #7A8EA8; font-family: 'Syne', sans-serif; font-weight: 600; }

        .modal-desc {
          font-size: 13px; color: #7A8EA8; line-height: 1.8;
          margin-bottom: 20px; font-weight: 300;
        }

        .modal-specs { margin-bottom: 24px; }
        .modal-specs-title {
          font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700;
          letter-spacing: .2em; text-transform: uppercase;
          color: #7A8EA8; margin-bottom: 10px;
        }
        .modal-specs-table {
          border: 1px solid rgba(249,115,22,0.1); border-radius: 6px; overflow: hidden;
        }
        .modal-spec-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 12px; border-bottom: 1px solid rgba(249,115,22,0.07);
          font-size: 13px;
        }
        .modal-spec-row:last-child { border-bottom: none; }
        .modal-spec-label { color: #7A8EA8; font-weight: 500; }
        .modal-spec-val   { color: #F8F9FB; font-weight: 600; font-family: 'Syne', sans-serif; font-size: 12px; }

        .modal-ctas { display: flex; gap: 10px; margin-top: auto; margin-bottom: 10px; }
        .modal-wa-btn {
          flex: 2; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 13px 0; border-radius: 6px;
          background: #25D366; color: white; border: none;
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: .78rem;
          letter-spacing: .1em; text-transform: uppercase;
          cursor: pointer; transition: background .2s, transform .15s;
        }
        .modal-wa-btn:hover { background: #1fbc59; transform: translateY(-1px); }
        .modal-call-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 13px 0; border-radius: 6px;
          border: 1px solid rgba(249,115,22,0.3); color: #F97316;
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: .72rem;
          letter-spacing: .1em; text-transform: uppercase;
          text-decoration: none; transition: all .2s;
        }
        .modal-call-btn:hover { background: rgba(249,115,22,0.1); }
        .modal-note { font-size: 11px; color: #7A8EA8; text-align: center; letter-spacing: .04em; }

        /* Responsive */
        @media(max-width: 720px) {
          .modal-inner { grid-template-columns: 1fr !important; }
          .modal-img-col { border-right: none; border-bottom: 1px solid rgba(249,115,22,0.1); }
          .modal-img-wrap { height: 220px !important; }
          .modal-detail-col { padding: 20px !important; }
          .modal-box { max-height: 95vh; }
        }
      `}</style>
    </div>
  );
}


// ── Main ProductCard ───────────────────────────────────────────
export default function ProductCard({ product, mode, cartItem, onAdd, onInc, onDec, onSetQty }: Props) {
  const qty = cartItem?.quantity || 0;
  const badge = getProductBadge(product);
  const categoryName = product.categories?.name;
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');

  const handleWAClick = useCallback(async () => {
    const trackingId = generateTrackingId();
    trackWAClick({ source: 'product_card', product_name: product.name, category: categoryName });
    trackViewProduct({ product_id: product.id, product_name: product.name, category: categoryName, price: product.price ?? undefined });
    fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'WhatsApp Click', phone: 'N/A', product: product.name,
        message: `Product card WA click: ${product.name}`,
        tracking_id: trackingId, source: 'website', wa_source: 'product_card',
        product_name: product.name, category: categoryName,
      }),
    }).catch(() => {});
    const text = encodeURIComponent(`Hi, I am interested in ${product.name}. Can you help me?`);
    window.open(`https://wa.me/${WA}?text=${text}`, '_blank');
  }, [product, categoryName]);

  const handleAdd = useCallback(() => {
    trackAddToCart({ product_id: product.id, product_name: product.name, category: categoryName, price: product.price ?? undefined, quantity: 1 });
    onAdd?.(product);
  }, [product, categoryName, onAdd]);

  const handleInc = useCallback(() => {
    trackAddToCart({ product_id: product.id, product_name: product.name, category: categoryName, price: product.price ?? undefined, quantity: 1 });
    onInc?.(product);
  }, [product, categoryName, onInc]);

  const commitQty = useCallback((raw: string) => {
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= 0) {
      if (num !== qty) {
        if (onSetQty) {
          onSetQty(product, num);
        } else if (num === 0) {
          const diff = qty;
          for (let i = 0; i < diff; i++) onDec?.(product);
        } else {
          const diff = num - qty;
          if (diff > 0) for (let i = 0; i < diff; i++) onInc?.(product);
          else for (let i = 0; i < Math.abs(diff); i++) onDec?.(product);
        }
      }
    }
    setEditing(false);
  }, [qty, product, onSetQty, onInc, onDec]);

  // Compact one-liner spec
  const spec = [
    product.categories?.name,
    product.unit ? `Per ${product.unit}` : null,
  ].filter(Boolean).join(' · ');

  return (
    <>
      <div className={`pcard${!product.in_stock ? ' pcard--oos' : ''}`}>

        {/* IMAGE */}
        <div className="pcard-img-wrap" onClick={() => setModalOpen(true)}>
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="pcard-img"
              sizes="(max-width: 768px) 50vw, 25vw"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="pcard-img-placeholder">
              {product.categories?.icon || '📦'}
            </div>
          )}

          {/* Badge */}
          {badge && (
            <div
              className="pcard-badge"
              style={{ background: badge.color, color: badge.textColor }}
            >
              {badge.emoji} {badge.label}
            </div>
          )}

          {/* Cart qty indicator */}
          {qty > 0 && <div className="pcard-qty-dot">{qty}</div>}

          {/* Hover overlay — view details hint */}
          <div className="pcard-hover-overlay">
            <span className="pcard-view-hint">View Details</span>
          </div>
        </div>

        {/* BODY */}
        <div className="pcard-body">
          {/* Stock */}
          <div className="pcard-stock">
            <span className={`pcard-stock-dot${product.in_stock ? '' : ' pcard-stock-dot--out'}`} />
            <span className="pcard-stock-label">{product.in_stock ? 'In Stock' : 'Out of Stock'}</span>
          </div>

          {/* Name */}
          <div className="pcard-name" title={product.name}>{product.name}</div>

          {/* Spec line */}
          {spec && <div className="pcard-spec">{spec}</div>}

          {/* Price */}
          {product.price ? (
            <div className="pcard-price-row">
              <span className="pcard-price">₹{product.price.toLocaleString('en-IN')}</span>
              {product.unit && <span className="pcard-unit">/{product.unit}</span>}
            </div>
          ) : (
            <div className="pcard-price-row">
              <span className="pcard-contact-price">Contact for price</span>
            </div>
          )}

          {/* CTAs */}
          {mode === 'project' ? (
            <div className="pcard-ctas">
              <button onClick={handleWAClick} className="pcard-wa-btn" type="button">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Enquire
              </button>
              <button onClick={() => setModalOpen(true)} className="pcard-details-btn" type="button">
                Details
              </button>
            </div>
          ) : (
            /* Quick order mode */
            <div className="pcard-ctas">
              {qty === 0 ? (
                <>
                  <button onClick={handleAdd} className="pcard-add-btn" type="button">
                    + Add
                  </button>
                  <button onClick={() => setModalOpen(true)} className="pcard-details-btn" type="button">
                    Details
                  </button>
                </>
              ) : (
                <div className="pcard-qty-ctrl">
                  <button onClick={() => onDec?.(product)} className="pcard-qty-btn" type="button">−</button>
                  {editing ? (
                    <input
                      type="number" min="0"
                      className="pcard-qty-input"
                      defaultValue={qty}
                      autoFocus
                      onBlur={e => commitQty(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitQty((e.target as HTMLInputElement).value);
                        if (e.key === 'Escape') setEditing(false);
                      }}
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <button
                      type="button"
                      className="pcard-qty-num"
                      onClick={() => { setInputVal(String(qty)); setEditing(true); }}
                    >
                      {qty}
                    </button>
                  )}
                  <button onClick={handleInc} className="pcard-qty-btn" type="button">+</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <ProductModal product={product} onClose={() => setModalOpen(false)} />
      )}

      <style>{`
        /* ── COMPACT PRODUCT CARD ── */
        .pcard {
          background: rgba(25,55,109,0.35);
          border: 1px solid rgba(249,115,22,0.12);
          border-radius: 8px; overflow: hidden;
          display: flex; flex-direction: column;
          transition: transform .25s, box-shadow .25s, border-color .25s;
          position: relative;
        }
        .pcard:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.45);
          border-color: rgba(249,115,22,0.35);
        }
        .pcard--oos { opacity: 0.65; }

        /* Image */
        .pcard-img-wrap {
          position: relative; height: 150px; overflow: hidden;
          background: rgba(11,36,71,0.6); flex-shrink: 0;
          cursor: pointer;
        }
        .pcard-img { object-fit: cover; transition: transform .4s ease; }
        .pcard:hover .pcard-img { transform: scale(1.06); }
        .pcard-img-placeholder {
          height: 100%; display: flex; align-items: center;
          justify-content: center; font-size: 52px;
        }
        .pcard-badge {
          position: absolute; top: 8px; left: 8px;
          font-family: 'Syne', sans-serif; font-size: 9px; font-weight: 700;
          letter-spacing: .1em; text-transform: uppercase;
          padding: 2px 8px; border-radius: 2px;
          white-space: nowrap;
        }
        .pcard-qty-dot {
          position: absolute; top: 8px; right: 8px;
          background: #25D366; border-radius: 50%;
          width: 20px; height: 20px;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; color: white;
        }
        .pcard-hover-overlay {
          position: absolute; inset: 0;
          background: rgba(7,15,31,0.55);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity .2s;
        }
        .pcard:hover .pcard-hover-overlay { opacity: 1; }
        .pcard-view-hint {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 12px; letter-spacing: .12em; text-transform: uppercase;
          color: white; background: rgba(249,115,22,0.85);
          padding: 6px 14px; border-radius: 3px;
        }

        /* Body */
        .pcard-body {
          padding: 12px 14px 14px;
          display: flex; flex-direction: column; flex: 1; gap: 5px;
        }

        /* Stock */
        .pcard-stock {
          display: flex; align-items: center; gap: 5px;
        }
        .pcard-stock-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #25D366; flex-shrink: 0;
        }
        .pcard-stock-dot--out { background: #F87171; }
        .pcard-stock-label {
          font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700;
          letter-spacing: .1em; text-transform: uppercase;
          color: #7A8EA8;
        }

        /* Name */
        .pcard-name {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: .85rem; color: #F8F9FB;
          line-height: 1.3;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }

        /* Spec */
        .pcard-spec {
          font-size: 11px; color: #7A8EA8;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          letter-spacing: .04em;
        }

        /* Price */
        .pcard-price-row {
          display: flex; align-items: baseline; gap: 4px;
          margin-top: 2px;
        }
        .pcard-price {
          font-family: 'Bebas Neue', sans-serif; font-size: 1.35rem;
          color: #F97316; letter-spacing: .03em; line-height: 1;
        }
        .pcard-unit { font-size: 11px; color: #7A8EA8; }
        .pcard-contact-price {
          font-size: 12px; color: #7A8EA8;
          font-family: 'Syne', sans-serif; font-style: italic;
        }

        /* CTAs */
        .pcard-ctas {
          display: flex; gap: 7px; margin-top: auto; padding-top: 8px;
        }
        .pcard-wa-btn {
          flex: 2; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 8px 0; border-radius: 4px;
          background: #25D366; color: white; border: none;
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: .65rem;
          letter-spacing: .1em; text-transform: uppercase;
          cursor: pointer; transition: background .2s;
          white-space: nowrap;
        }
        .pcard-wa-btn:hover { background: #1fbc59; }
        .pcard-details-btn {
          flex: 1; padding: 8px 0; border-radius: 4px;
          border: 1px solid rgba(249,115,22,0.25); color: #F97316;
          background: transparent;
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: .65rem;
          letter-spacing: .1em; text-transform: uppercase;
          cursor: pointer; transition: all .2s;
          white-space: nowrap;
        }
        .pcard-details-btn:hover { background: rgba(249,115,22,0.1); }
        .pcard-add-btn {
          flex: 2; padding: 8px 0; border-radius: 4px;
          background: #F97316; color: #0B2447; border: none;
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: .68rem;
          letter-spacing: .1em; text-transform: uppercase;
          cursor: pointer; transition: all .2s;
        }
        .pcard-add-btn:hover { background: #FF9A45; }

        /* Qty controls */
        .pcard-qty-ctrl {
          display: flex; align-items: center;
          border: 1px solid rgba(249,115,22,0.25); border-radius: 4px;
          overflow: hidden; width: 100%;
        }
        .pcard-qty-btn {
          width: 32px; height: 32px; flex-shrink: 0;
          background: rgba(249,115,22,0.08); border: none;
          color: #F97316; font-size: 16px; font-weight: 700;
          cursor: pointer; transition: background .15s;
        }
        .pcard-qty-btn:hover { background: rgba(249,115,22,0.2); }
        .pcard-qty-num {
          flex: 1; text-align: center; font-weight: 700; font-size: 13px;
          color: #F8F9FB; background: transparent; border: none;
          border-left: 1px solid rgba(249,115,22,0.2);
          border-right: 1px solid rgba(249,115,22,0.2);
          cursor: pointer; height: 32px; font-family: 'Syne', sans-serif;
        }
        .pcard-qty-input {
          flex: 1; text-align: center; font-weight: 700; font-size: 13px;
          color: #F8F9FB; background: rgba(249,115,22,0.1); border: none;
          border-left: 1px solid rgba(249,115,22,0.2);
          border-right: 1px solid rgba(249,115,22,0.2);
          height: 32px; outline: none;
          font-family: 'Syne', sans-serif;
          -moz-appearance: textfield;
        }
        .pcard-qty-input::-webkit-outer-spin-button,
        .pcard-qty-input::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>
    </>
  );
}
