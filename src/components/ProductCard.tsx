'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import type { Product, CartItem } from '@/lib/types';
import { getProductBadge } from '@/lib/badges';
import { trackAddToCart } from '@/lib/analytics';

interface Props {
  product: Product;
  mode: 'project' | 'quick';
  cartItem?: CartItem;
  onAdd?: (p: Product) => void;
  onInc?: (p: Product) => void;
  onDec?: (p: Product) => void;
  onSetQty?: (p: Product, qty: number) => void;
}

function QtyControl({
  qty,
  product,
  onInc,
  onDec,
  onSetQty,
}: {
  qty: number;
  product: Product;
  onInc?: (p: Product) => void;
  onDec?: (p: Product) => void;
  onSetQty?: (p: Product, qty: number) => void;
}) {
  const [editing, setEditing] = useState(false);

  const commitQty = (raw: string) => {
    const num = Math.max(0, Math.floor(parseInt(raw, 10) || 0));
    onSetQty?.(product, num);
    setEditing(false);
  };

  return (
    <div className="pcard-qty-ctrl">
      <button onClick={() => onDec?.(product)} className="pcard-qty-btn" type="button">-</button>
      {editing ? (
        <input
          type="number"
          min="0"
          className="pcard-qty-input"
          defaultValue={qty}
          autoFocus
          onBlur={e => commitQty(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') commitQty((e.target as HTMLInputElement).value);
            if (e.key === 'Escape') setEditing(false);
          }}
        />
      ) : (
        <button type="button" className="pcard-qty-num" onClick={() => setEditing(true)}>
          {qty}
        </button>
      )}
      <button onClick={() => onInc?.(product)} className="pcard-qty-btn" type="button">+</button>
    </div>
  );
}

function ProductModal({
  product,
  qty,
  onClose,
  onAdd,
  onInc,
  onDec,
  onSetQty,
}: {
  product: Product;
  qty: number;
  onClose: () => void;
  onAdd: () => void;
  onInc?: (p: Product) => void;
  onDec?: (p: Product) => void;
  onSetQty?: (p: Product, qty: number) => void;
}) {
  const badge = getProductBadge(product);
  const specs = [
    product.categories?.name ? { label: 'Category', value: product.categories.name } : null,
    product.unit ? { label: 'Unit', value: product.unit } : null,
    { label: 'Type', value: product.type === 'quick' ? 'Quick Order' : 'Shop Product' },
    { label: 'Availability', value: product.in_stock ? 'In Stock' : 'Out of Stock' },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">x</button>
        <div className="modal-inner">
          <div className="modal-img-col">
            <div className="modal-img-wrap">
              {product.image_url ? (
                <Image src={product.image_url} alt={product.name} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 400px" />
              ) : (
                <div className="modal-img-placeholder">{product.categories?.icon || 'Box'}</div>
              )}
              {badge && <div className="modal-badge" style={{ background: badge.color, color: badge.textColor }}>{badge.emoji} {badge.label}</div>}
            </div>
          </div>

          <div className="modal-detail-col">
            {product.categories && <div className="modal-cat-tag">{product.categories.icon} {product.categories.name}</div>}
            <h2 className="modal-title">{product.name}</h2>
            {product.price ? (
              <div className="modal-price-row">
                <span className="modal-price">Rs.{product.price.toLocaleString('en-IN')}</span>
                {product.unit && <span className="modal-unit">/ {product.unit}</span>}
              </div>
            ) : null}
            <div className="modal-stock-row">
              <span className={`modal-stock-dot${product.in_stock ? '' : ' modal-stock-dot--out'}`} />
              <span className="modal-stock-label">{product.in_stock ? 'In Stock' : 'Out of Stock'}</span>
            </div>
            {product.description && <p className="modal-desc">{product.description}</p>}
            <div className="modal-specs">
              <div className="modal-specs-title">Specifications</div>
              <div className="modal-specs-table">
                {specs.map(s => (
                  <div key={s.label} className="modal-spec-row">
                    <span className="modal-spec-label">{s.label}</span>
                    <span className="modal-spec-val">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-ctas">
              {qty === 0 ? (
                <button onClick={onAdd} className="modal-add-btn" type="button" disabled={!product.in_stock}>Add to Cart</button>
              ) : (
                <QtyControl qty={qty} product={product} onInc={onInc} onDec={onDec} onSetQty={onSetQty} />
              )}
              <button onClick={onClose} className="modal-secondary-btn" type="button">Continue Shopping</button>
            </div>
            <p className="modal-note">Use the cart icon to review items and proceed to checkout.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductCard({ product, mode, cartItem, onAdd, onInc, onDec, onSetQty }: Props) {
  const qty = cartItem?.quantity || 0;
  const badge = getProductBadge(product);
  const categoryName = product.categories?.name;
  const [modalOpen, setModalOpen] = useState(false);

  const handleAdd = useCallback(() => {
    trackAddToCart({ product_id: product.id, product_name: product.name, category: categoryName, price: product.price ?? undefined, quantity: 1 });
    onAdd?.(product);
  }, [product, categoryName, onAdd]);

  const handleInc = useCallback(() => {
    trackAddToCart({ product_id: product.id, product_name: product.name, category: categoryName, price: product.price ?? undefined, quantity: 1 });
    onInc?.(product);
  }, [product, categoryName, onInc]);

  const spec = [product.categories?.name, product.unit ? `Per ${product.unit}` : null].filter(Boolean).join(' | ');

  return (
    <>
      <div className={`pcard${!product.in_stock ? ' pcard--oos' : ''}`} data-card-mode={mode}>
        <div className="pcard-img-wrap" onClick={() => setModalOpen(true)}>
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="pcard-img" sizes="(max-width: 768px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
          ) : (
            <div className="pcard-img-placeholder">{product.categories?.icon || 'Box'}</div>
          )}
          {badge && <div className="pcard-badge" style={{ background: badge.color, color: badge.textColor }}>{badge.emoji} {badge.label}</div>}
          {qty > 0 && <div className="pcard-qty-dot">{qty}</div>}
          <div className="pcard-hover-overlay"><span className="pcard-view-hint">View Details</span></div>
        </div>

        <div className="pcard-body">
          <div className="pcard-stock">
            <span className={`pcard-stock-dot${product.in_stock ? '' : ' pcard-stock-dot--out'}`} />
            <span className="pcard-stock-label">{product.in_stock ? 'In Stock' : 'Out of Stock'}</span>
          </div>
          <div className="pcard-name" title={product.name}>{product.name}</div>
          {spec && <div className="pcard-spec">{spec}</div>}
          {product.price ? (
            <div className="pcard-price-row">
              <span className="pcard-price">Rs.{product.price.toLocaleString('en-IN')}</span>
              {product.unit && <span className="pcard-unit">/{product.unit}</span>}
            </div>
          ) : (
            <div className="pcard-price-row"><span className="pcard-contact-price">Contact for price</span></div>
          )}
          <div className="pcard-ctas">
            {qty === 0 ? (
              <>
                <button onClick={handleAdd} className="pcard-add-btn" type="button" disabled={!product.in_stock}>Add to Cart</button>
                <button onClick={() => setModalOpen(true)} className="pcard-details-btn" type="button">Details</button>
              </>
            ) : (
              <QtyControl qty={qty} product={product} onInc={handleInc} onDec={onDec} onSetQty={onSetQty} />
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <ProductModal
          product={product}
          qty={qty}
          onClose={() => setModalOpen(false)}
          onAdd={handleAdd}
          onInc={handleInc}
          onDec={onDec}
          onSetQty={onSetQty}
        />
      )}

      <style>{`
        .pcard { background: rgba(25,55,109,0.35); border: 1px solid rgba(249,115,22,0.12); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; transition: transform .25s, box-shadow .25s, border-color .25s; position: relative; height: 100%; }
        .pcard:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.45); border-color: rgba(249,115,22,0.35); }
        .pcard--oos { opacity: 0.65; }
        .pcard-img-wrap { position: relative; height: 150px; overflow: hidden; background: rgba(11,36,71,0.6); flex-shrink: 0; cursor: pointer; }
        .pcard-img { object-fit: cover; transition: transform .4s ease; }
        .pcard:hover .pcard-img { transform: scale(1.06); }
        .pcard-img-placeholder { height: 100%; display: flex; align-items: center; justify-content: center; font-size: 40px; color: #7A8EA8; }
        .pcard-badge { position: absolute; top: 8px; left: 8px; font-family: 'Syne', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; padding: 2px 8px; border-radius: 2px; white-space: nowrap; }
        .pcard-qty-dot { position: absolute; top: 8px; right: 8px; background: #25D366; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: white; }
        .pcard-hover-overlay { position: absolute; inset: 0; background: rgba(7,15,31,0.55); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity .2s; }
        .pcard:hover .pcard-hover-overlay { opacity: 1; }
        .pcard-view-hint { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: white; background: rgba(249,115,22,0.85); padding: 6px 14px; border-radius: 3px; }
        .pcard-body { padding: 12px 14px 14px; display: flex; flex-direction: column; flex: 1; gap: 5px; }
        .pcard-stock { display: flex; align-items: center; gap: 5px; }
        .pcard-stock-dot { width: 6px; height: 6px; border-radius: 50%; background: #25D366; flex-shrink: 0; }
        .pcard-stock-dot--out { background: #F87171; }
        .pcard-stock-label { font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #7A8EA8; }
        .pcard-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: .85rem; color: #F8F9FB; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .pcard-spec { font-size: 11px; color: #7A8EA8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: .04em; }
        .pcard-price-row { display: flex; align-items: baseline; gap: 4px; margin-top: 2px; }
        .pcard-price { font-family: 'Bebas Neue', sans-serif; font-size: 1.35rem; color: #F97316; letter-spacing: .03em; line-height: 1; }
        .pcard-unit { font-size: 11px; color: #7A8EA8; }
        .pcard-contact-price { font-size: 12px; color: #7A8EA8; font-family: 'Syne', sans-serif; font-style: italic; }
        .pcard-ctas { display: flex; gap: 7px; margin-top: auto; padding-top: 8px; }
        .pcard-add-btn { flex: 2; padding: 8px 0; border-radius: 4px; background: #F97316; color: #0B2447; border: none; font-family: 'Syne', sans-serif; font-weight: 700; font-size: .68rem; letter-spacing: .1em; text-transform: uppercase; cursor: pointer; transition: all .2s; }
        .pcard-add-btn:hover:not(:disabled) { background: #FF9A45; }
        .pcard-add-btn:disabled { opacity: .55; cursor: not-allowed; }
        .pcard-details-btn { flex: 1; padding: 8px 0; border-radius: 4px; border: 1px solid rgba(249,115,22,0.25); color: #F97316; background: transparent; font-family: 'Syne', sans-serif; font-weight: 700; font-size: .65rem; letter-spacing: .1em; text-transform: uppercase; cursor: pointer; transition: all .2s; white-space: nowrap; }
        .pcard-details-btn:hover { background: rgba(249,115,22,0.1); }
        .pcard-qty-ctrl { display: flex; align-items: center; border: 1px solid rgba(249,115,22,0.25); border-radius: 4px; overflow: hidden; width: 100%; }
        .pcard-qty-btn { width: 32px; height: 32px; flex-shrink: 0; background: rgba(249,115,22,0.08); border: none; color: #F97316; font-size: 16px; font-weight: 700; cursor: pointer; }
        .pcard-qty-num, .pcard-qty-input { flex: 1; text-align: center; font-weight: 700; font-size: 13px; color: #F8F9FB; background: transparent; border: none; border-left: 1px solid rgba(249,115,22,0.2); border-right: 1px solid rgba(249,115,22,0.2); height: 32px; font-family: 'Syne', sans-serif; }
        .pcard-qty-num { cursor: pointer; }
        .pcard-qty-input { outline: none; -moz-appearance: textfield; }
        .pcard-qty-input::-webkit-outer-spin-button, .pcard-qty-input::-webkit-inner-spin-button { -webkit-appearance: none; }
        .modal-overlay { position: fixed; inset: 0; z-index: 8000; background: rgba(0,0,0,0.85); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal-box { position: relative; background: #0d1a30; border: 1px solid rgba(249,115,22,0.25); border-radius: 12px; width: 100%; max-width: 860px; max-height: 90vh; overflow-y: auto; box-shadow: 0 32px 80px rgba(0,0,0,0.7); }
        .modal-close { position: absolute; top: 14px; right: 16px; z-index: 10; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #7A8EA8; border-radius: 6px; width: 32px; height: 32px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; }
        .modal-inner { display: grid; grid-template-columns: 380px 1fr; min-height: 460px; }
        .modal-img-col { border-right: 1px solid rgba(249,115,22,0.1); display: flex; flex-direction: column; }
        .modal-img-wrap { position: relative; height: 300px; flex-shrink: 0; background: rgba(11,36,71,0.6); overflow: hidden; }
        .modal-img-placeholder { height: 100%; display: flex; align-items: center; justify-content: center; font-size: 44px; color: #7A8EA8; }
        .modal-badge { position: absolute; bottom: 12px; left: 12px; font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; padding: 4px 10px; border-radius: 3px; }
        .modal-detail-col { padding: 32px 28px; display: flex; flex-direction: column; gap: 0; }
        .modal-cat-tag { font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #F97316; margin-bottom: 10px; }
        .modal-title { font-family: 'Syne', sans-serif; font-size: 1.35rem; font-weight: 800; color: #F8F9FB; line-height: 1.25; margin-bottom: 14px; }
        .modal-price-row { display: flex; align-items: baseline; gap: 6px; margin-bottom: 10px; }
        .modal-price { font-family: 'Bebas Neue', sans-serif; font-size: 2.2rem; color: #F97316; letter-spacing: .04em; line-height: 1; }
        .modal-unit, .modal-stock-label, .modal-desc, .modal-note { color: #7A8EA8; }
        .modal-stock-row { display: flex; align-items: center; gap: 7px; margin-bottom: 18px; }
        .modal-stock-dot { width: 7px; height: 7px; border-radius: 50%; background: #25D366; flex-shrink: 0; }
        .modal-stock-dot--out { background: #F87171; }
        .modal-desc { font-size: 13px; line-height: 1.8; margin-bottom: 20px; font-weight: 300; }
        .modal-specs { margin-bottom: 24px; }
        .modal-specs-title { font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: #7A8EA8; margin-bottom: 10px; }
        .modal-specs-table { border: 1px solid rgba(249,115,22,0.1); border-radius: 6px; overflow: hidden; }
        .modal-spec-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 1px solid rgba(249,115,22,0.07); font-size: 13px; }
        .modal-spec-row:last-child { border-bottom: none; }
        .modal-spec-label { color: #7A8EA8; font-weight: 500; }
        .modal-spec-val { color: #F8F9FB; font-weight: 600; font-family: 'Syne', sans-serif; font-size: 12px; }
        .modal-ctas { display: flex; gap: 10px; margin-top: auto; margin-bottom: 10px; }
        .modal-add-btn { flex: 2; display: flex; align-items: center; justify-content: center; padding: 13px 0; border-radius: 6px; background: #F97316; color: #0B2447; border: none; font-family: 'Syne', sans-serif; font-weight: 700; font-size: .78rem; letter-spacing: .1em; text-transform: uppercase; cursor: pointer; }
        .modal-secondary-btn { flex: 1; display: flex; align-items: center; justify-content: center; padding: 13px 0; border-radius: 6px; border: 1px solid rgba(249,115,22,0.3); color: #F97316; background: transparent; font-family: 'Syne', sans-serif; font-weight: 700; font-size: .72rem; letter-spacing: .1em; text-transform: uppercase; cursor: pointer; }
        .modal-note { font-size: 11px; text-align: center; letter-spacing: .04em; }
        @media(max-width:720px) { .modal-inner { grid-template-columns: 1fr !important; } .modal-img-col { border-right: none; border-bottom: 1px solid rgba(249,115,22,0.1); } .modal-img-wrap { height: 220px !important; } .modal-detail-col { padding: 20px !important; } }
      `}</style>
    </>
  );
}