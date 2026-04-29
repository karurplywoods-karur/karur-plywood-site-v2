'use client';
// src/components/ProductCard.tsx
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

export default function ProductCard({ product, mode, cartItem, onAdd, onInc, onDec, onSetQty }: Props) {
  const qty = cartItem?.quantity || 0;
  const badge = getProductBadge(product);
  const categoryName = product.categories?.name;

  // Local editing state so the input feels instant
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');

  // ── WA tracking click ──────────────────────────────
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

  // ── Add to cart ─────────────────────────────────────
  const handleAdd = useCallback(() => {
    trackAddToCart({ product_id: product.id, product_name: product.name, category: categoryName, price: product.price ?? undefined, quantity: 1 });
    onAdd?.(product);
  }, [product, categoryName, onAdd]);

  const handleInc = useCallback(() => {
    trackAddToCart({ product_id: product.id, product_name: product.name, category: categoryName, price: product.price ?? undefined, quantity: 1 });
    onInc?.(product);
  }, [product, categoryName, onInc]);

  // ── Typed quantity commit ────────────────────────────
  const commitQty = useCallback((raw: string) => {
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= 0) {
      if (num !== qty) {
        if (onSetQty) {
          onSetQty(product, num);
        } else if (num === 0) {
          // dec to 0 = remove
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

  return (
    <div className="pc-card">

      {/* IMAGE */}
      <div className="pc-image-wrap">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="pc-img"
            sizes="(max-width:768px) 100vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="pc-image-placeholder">
            {product.categories?.icon || '📦'}
          </div>
        )}

        {/* Category badge */}
        {product.categories && (
          <div className="pc-badge-cat">
            {product.categories.icon} {product.categories.name}
          </div>
        )}

        {/* Trust badge */}
        {badge && (
          <div
            className="pc-badge-trust"
            style={{ background: badge.color, color: badge.textColor, border: `1px solid ${badge.textColor}30` }}
          >
            {badge.emoji} {badge.label}
          </div>
        )}

        {/* Cart indicator */}
        {qty > 0 && <div className="pc-qty-indicator">{qty}</div>}
      </div>

      {/* BODY */}
      <div className="pc-body">
        <div className="pc-cat">{product.categories?.name}</div>
        <div className="pc-name">{product.name}</div>
        <div className="pc-desc">{product.description}</div>

        {product.price && (
          <div className="pc-price-row">
            <span className="pc-price">₹{product.price.toLocaleString('en-IN')}</span>
            {product.unit && <span className="pc-unit">{product.unit}</span>}
          </div>
        )}

        {/* CTA */}
        {mode === 'project' ? (
          <button onClick={handleWAClick} className="pc-wa-btn" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Enquire on WhatsApp
          </button>
        ) : (
          qty === 0 ? (
            <button onClick={handleAdd} className="pc-add-btn" type="button">
              + Add to Cart
            </button>
          ) : (
            <div className="pc-qty-ctrl">
              <button
                onClick={() => onDec?.(product)}
                className="pc-qty-btn"
                type="button"
                aria-label="Decrease quantity"
              >
                −
              </button>

              {/* Typeable quantity field */}
              {editing ? (
                <input
                  type="number"
                  min="0"
                  className="pc-qty-input"
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
                  className="pc-qty-num"
                  onClick={() => { setInputVal(String(qty)); setEditing(true); }}
                  title="Tap to type quantity"
                  aria-label={`Quantity ${qty}, tap to edit`}
                >
                  {qty}
                </button>
              )}

              <button
                onClick={handleInc}
                className="pc-qty-btn"
                type="button"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          )
        )}

        {/* Hint for large quantities */}
        {mode === 'quick' && qty > 0 && (
          <div style={{ fontSize: 10, color: '#7A8EA8', textAlign: 'center', marginTop: 5, fontFamily: "'Syne',sans-serif", letterSpacing: '0.06em' }}>
            TAP NUMBER TO TYPE QUANTITY
          </div>
        )}
      </div>
    </div>
  );
}
