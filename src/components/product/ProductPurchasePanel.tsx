'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import ProductAddToCart from '@/components/ProductAddToCart';
import { CONTACT } from '@/lib/contact';
import type { Product, ProductVariant } from '@/lib/types';

function variantLabel(variant: ProductVariant) {
  return [variant.thickness, variant.size, variant.grade, variant.finish, variant.color, variant.pack_size]
    .filter(Boolean)
    .join(' / ') || variant.sku;
}

function formatPrice(value: number | null | undefined) {
  return value ? `Rs.${value.toLocaleString('en-IN')}` : 'Contact for price';
}

export default function ProductPurchasePanel({ product }: { product: Product }) {
  const variants = useMemo(
    () => [...(product.product_variants || [])].sort((a, b) => Number(b.is_default) - Number(a.is_default) || a.sort_order - b.sort_order),
    [product.product_variants]
  );
  const [selectedId, setSelectedId] = useState(() => variants.find(v => v.is_default)?.id || variants[0]?.id || '');
  const selected = variants.find(v => v.id === selectedId);

  const price = selected?.price ?? product.price;
  const mrp = selected?.mrp ?? product.mrp;
  const hasMrp = !!mrp && !!price && mrp > price;
  const discount = hasMrp ? Math.round(((mrp! - price!) / mrp!) * 100) : null;
  const stockStatus = selected?.stock_status || (product.in_stock ? 'in_stock' : 'out_of_stock');
  const inStock = stockStatus !== 'out_of_stock';

  return (
    <div className="purchase-panel">
      {variants.length > 0 && (
        <div className="variant-block">
          <div className="panel-label">Choose Variant</div>
          <div className="variant-grid">
            {variants.map(variant => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedId(variant.id)}
                className={`variant-btn${variant.id === selectedId ? ' variant-btn--active' : ''}`}
              >
                <span>{variantLabel(variant)}</span>
                {variant.sku && <small>{variant.sku}</small>}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="price-box">
        {hasMrp && (
          <div className="mrp-row">
            <span className="mrp">{formatPrice(mrp)}</span>
            {discount && <span className="save">SAVE {discount}%</span>}
          </div>
        )}
        <div className="price-row">
          <span className="price">{formatPrice(price)}</span>
          {product.unit && <span className="unit">/ {product.unit}</span>}
        </div>
        <div className={`stock ${inStock ? 'stock--ok' : 'stock--out'}`}>
          {stockStatus === 'made_to_order' ? 'Made to order' : inStock ? 'In stock' : 'Out of stock'}
          {selected?.stock_quantity ? ` / ${selected.stock_quantity} available` : ''}
        </div>
        {hasMrp && price && mrp && (
          <div className="saving">You save Rs.{(mrp - price).toLocaleString('en-IN')} on this order</div>
        )}
      </div>

      <div className="actions">
        <ProductAddToCart product={product} variant={selected} />
        <div className="secondary-actions">
          <a href={`tel:${CONTACT.phoneRaw}`} className="secondary-btn">Call Now</a>
          <Link href="/products" className="secondary-btn secondary-btn--muted">All Products</Link>
        </div>
      </div>

      <style jsx>{`
        .purchase-panel {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-bottom: 24px;
        }
        .panel-label {
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #7A8EA8;
          margin-bottom: 10px;
        }
        .variant-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
        .variant-btn {
          min-height: 48px;
          border: 1px solid rgba(249,115,22,0.18);
          border-radius: 8px;
          background: rgba(11,36,71,0.45);
          color: #F8F9FB;
          text-align: left;
          padding: 9px 11px;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 700;
        }
        .variant-btn small {
          display: block;
          margin-top: 3px;
          color: #7A8EA8;
          font-size: 10px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
        }
        .variant-btn--active {
          border-color: #F97316;
          box-shadow: 0 0 0 2px rgba(249,115,22,0.12);
        }
        .price-box {
          background: rgba(25,55,109,0.4);
          border: 1px solid rgba(249,115,22,0.2);
          border-radius: 10px;
          padding: 20px 22px;
        }
        .mrp-row, .price-row {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }
        .mrp {
          font-size: 15px;
          color: #7A8EA8;
          text-decoration: line-through;
        }
        .save {
          font-size: 12px;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          background: rgba(37,211,102,0.15);
          color: #4ADE80;
          border: 1px solid rgba(37,211,102,0.25);
          border-radius: 3px;
          padding: 2px 8px;
          letter-spacing: .06em;
        }
        .price {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.8rem;
          color: #F97316;
          letter-spacing: .03em;
          line-height: 1;
        }
        .unit {
          font-size: 14px;
          color: #7A8EA8;
          font-family: 'Syne', sans-serif;
        }
        .stock {
          margin-top: 8px;
          font-size: 12px;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
        }
        .stock--ok { color: #4ADE80; }
        .stock--out { color: #F87171; }
        .saving {
          margin-top: 8px;
          font-size: 12px;
          color: #4ADE80;
        }
        .actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .secondary-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .secondary-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 13px 0;
          border-radius: 8px;
          background: transparent;
          border: 1px solid rgba(249,115,22,0.3);
          color: #F97316;
          font-family: 'Syne', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          text-decoration: none;
        }
        .secondary-btn--muted {
          border-color: rgba(255,255,255,0.1);
          color: #7A8EA8;
        }
        @media(max-width: 560px) {
          .variant-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
