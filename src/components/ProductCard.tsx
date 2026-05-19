'use client';
// src/components/ProductCard.tsx — ecommerce product card with cart controls
import { useCallback, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product, CartItem } from '@/lib/types';
import { getProductBadge } from '@/lib/badges';
import { useCart } from '@/lib/CartContext';

interface Props {
  product: Product;
  mode?: 'project' | 'quick';
  cartItem?: CartItem;
  onAdd?: (p: Product) => void;
  onInc?: (p: Product) => void;
  onDec?: (p: Product) => void;
  onSetQty?: (p: Product, qty: number) => void;
  showDescription?: boolean;
}

export default function ProductCard({
  product,
  cartItem: cartItemProp,
  onAdd,
  onInc,
  onDec,
  showDescription = true,
}: Props) {
  const { items, add, inc, dec } = useCart();
  const cartItem = cartItemProp || items.find(i => i.product.id === product.id);
  const qty = cartItem?.quantity || 0;
  const badge = getProductBadge(product);
  const categoryName = product.categories?.name;
  const [addedFlash, setAddedFlash] = useState(false);

  // Price calculations
  const hasMRP = product.mrp && product.price && product.mrp > product.price;
  const discount = hasMRP
    ? Math.round(((product.mrp! - product.price!) / product.mrp!) * 100)
    : null;

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Don't navigate when clicking Add
    (onAdd || add)(product);
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 1200);
  }, [product, add, onAdd]);

  const handleInc = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    (onInc || inc)(product);
  }, [product, inc, onInc]);

  const handleDec = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    (onDec || dec)(product);
  }, [product, dec, onDec]);

  return (
    <div className="pc-card" style={{ position: 'relative' }}>

        {/* IMAGE */}
        <Link href={`/products/${product.id}`} className="pc-image-wrap" style={{ display: 'block', textDecoration: 'none' }}>
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

          {/* Hover overlay — "View Details" */}
          <div className="pc-quickview-overlay">
            <span className="pc-quickview-label">View Details</span>
          </div>

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

          {/* Discount badge */}
          {discount && discount > 0 && (
            <div className="pc-discount-badge">{discount}% OFF</div>
          )}

          {/* Cart qty bubble */}
          {qty > 0 && (
            <div className="pc-qty-indicator">{qty}</div>
          )}
        </Link>

        {/* BODY */}
        <div className="pc-body">
          <div className="pc-cat">{categoryName}</div>
          <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
            <div className="pc-name">{product.name}</div>
          </Link>
          {showDescription && product.description && (
            <div className="pc-desc">{product.description}</div>
          )}

          {/* Price row — MRP slashed + Sale price */}
          {product.price ? (
            <div className="pc-price-block">
              <div className="pc-price-row">
                <span className="pc-price">₹{product.price.toLocaleString('en-IN')}</span>
                {product.unit && <span className="pc-unit">/ {product.unit}</span>}
              </div>
              {hasMRP && (
                <div className="pc-mrp-row">
                  <span className="pc-mrp-label">MRP</span>
                  <span className="pc-mrp">₹{product.mrp!.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: '#7A8EA8', marginBottom: '0.9rem', fontStyle: 'italic' }}>
              Price on enquiry
            </div>
          )}

          {/* CTA — Add to Cart or Qty Control */}
          {qty === 0 ? (
            <div className="pc-actions-row">
              <button
                onClick={handleAdd}
                className={`pc-add-btn${addedFlash ? ' pc-add-btn--flash' : ''}`}
                type="button"
              >
                {addedFlash ? 'Added!' : 'Add to Cart'}
              </button>
              <Link href={`/products/${product.id}`} className="pc-detail-link">
                Details
              </Link>
            </div>
          ) : (
            <div className="pc-qty-ctrl">
              <button
                onClick={handleDec}
                className="pc-qty-btn"
                type="button"
                aria-label="Decrease"
              >−</button>
              <span className="pc-qty-num">{qty}</span>
              <button
                onClick={handleInc}
                className="pc-qty-btn"
                type="button"
                aria-label="Increase"
              >+</button>
            </div>
          )}
        </div>

        <style>{`
          .pc-quickview-overlay {
            position: absolute; inset: 0;
            background: rgba(7,15,31,0.5);
            display: flex; align-items: center; justify-content: center;
            opacity: 0; transition: opacity 0.25s;
            pointer-events: none;
          }
          .pc-card:hover .pc-quickview-overlay { opacity: 1; }
          .pc-quickview-label {
            font-family: 'Syne', sans-serif;
            font-size: 0.7rem; font-weight: 700;
            letter-spacing: 0.14em; text-transform: uppercase;
            color: white;
            background: rgba(249,115,22,0.9);
            padding: 8px 18px; border-radius: 3px;
          }
          .pc-add-btn--flash {
            background: #25D366 !important;
            transform: scale(1.02);
          }
          .pc-actions-row {
            display: grid;
            grid-template-columns: 1fr 0.52fr;
            gap: 8px;
            align-items: stretch;
          }
          .pc-detail-link {
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(249,115,22,0.3);
            border-radius: var(--r);
            color: var(--orange);
            font-family: var(--f-ui);
            font-size: 0.65rem;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            text-decoration: none;
          }
          .pc-detail-link:hover { background: rgba(249,115,22,0.08); }
          .pc-cat {
            font-family: 'Syne', sans-serif;
            font-size: 0.6rem; font-weight: 700;
            letter-spacing: 0.18em; text-transform: uppercase;
            color: var(--orange); margin-bottom: 0.3rem;
          }
          /* Price block */
          .pc-price-block { margin-bottom: 0.9rem; }
          .pc-price-row {
            display: flex; align-items: baseline; gap: 0.3rem;
          }
          .pc-mrp-row {
            display: flex; align-items: center; gap: 0.3rem;
            margin-top: 0.2rem;
          }
          .pc-mrp-label {
            font-family: 'DM Sans', sans-serif;
            font-size: 0.65rem; color: #5A7A9A;
            text-transform: uppercase; letter-spacing: 0.06em;
          }
          .pc-mrp {
            font-family: 'DM Sans', sans-serif;
            font-size: 0.8rem; color: #5A7A9A;
            text-decoration: line-through;
            text-decoration-color: #F97316;
            text-decoration-thickness: 1.5px;
          }
          .pc-unit {
            font-family: 'DM Sans', sans-serif;
            font-size: 0.72rem; color: #7A8EA8;
          }
          /* Discount badge on image */
          .pc-discount-badge {
            position: absolute; top: 8px; right: 8px;
            background: #F97316; color: white;
            font-family: 'Syne', sans-serif;
            font-size: 0.55rem; font-weight: 800;
            letter-spacing: 0.05em;
            padding: 3px 7px; border-radius: 2px;
            z-index: 2;
          }
        `}</style>
    </div>
  );
}
