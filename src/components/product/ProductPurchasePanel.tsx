'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';
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
  const router = useRouter();
  const { add } = useCart();
  const variants = useMemo(
    () => [...(product.product_variants || [])].sort((a, b) => Number(b.is_default) - Number(a.is_default) || a.sort_order - b.sort_order),
    [product.product_variants]
  );
  const [selectedId, setSelectedId] = useState(() => variants.find(v => v.is_default)?.id || variants[0]?.id || '');
  const selected = variants.find(v => v.id === selectedId);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const price = selected?.price ?? product.price;
  const mrp = selected?.mrp ?? product.mrp;
  const hasMrp = !!mrp && !!price && mrp > price;
  const discount = hasMrp ? Math.round(((mrp! - price!) / mrp!) * 100) : null;
  const stockStatus = selected?.stock_status || (product.in_stock ? 'in_stock' : 'out_of_stock');
  const inStock = stockStatus !== 'out_of_stock';
  const needsVerification = product.fulfillment_type === 'DISTRIBUTOR' || product.fulfillment_type === 'SPECIAL_ORDER' || !!product.verification_required;

  const addToCart = () => {
    for (let i = 0; i < qty; i++) add(product, selected);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };
  const buyNow = () => {
    for (let i = 0; i < qty; i++) add(product, selected);
    router.push('/checkout');
  };

  return (
    <div className="purchase-panel">
      {variants.length > 0 && (
        <div className="variant-block">
          <div className="panel-label">Thickness</div>
          <div className="variant-grid">
            {variants.map(variant => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedId(variant.id)}
                className={`variant-btn${variant.id === selectedId ? ' variant-btn--active' : ''}`}
              >
                <span>{variantLabel(variant)}</span>
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
        <div className="qty-row">
          <div className="qty-stepper">
            <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
            <span>{qty}</span>
            <button type="button" onClick={() => setQty(q => q + 1)} aria-label="Increase quantity">+</button>
          </div>
          {product.unit && <span className="qty-unit">{product.unit}</span>}
        </div>
        <div className="btn-row">
          <button type="button" onClick={addToCart} disabled={!inStock} className="btn-add-to-cart">
            {added ? '✓ Added' : '🛒 Add to Cart'}
          </button>
          <button type="button" onClick={buyNow} disabled={!inStock} className={`btn-buy-now${needsVerification ? ' btn-buy-now--reserve' : ''}`}>
            {needsVerification ? 'Reserve Order' : 'Buy Now'}
          </button>
        </div>
        {needsVerification && (
          <div className="verify-note">We'll confirm stock before requesting payment — usually within 15 minutes.</div>
        )}
      </div>

      <style jsx>{`
        .purchase-panel {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-bottom: 24px;
        }
        .panel-label {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #6B7280;
          margin-bottom: 10px;
        }
        .variant-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .variant-btn {
          min-height: 42px;
          border: 1.5px solid #E5E1DC;
          border-radius: 6px;
          background: #FFFFFF;
          color: #0B2447;
          text-align: center;
          padding: 8px 16px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 700;
        }
        .variant-btn--active {
          border-color: #0B2447;
          background: #0B2447;
          color: #FFFFFF;
        }
        .price-box {
          background: #FAF8F5;
          border: 1.5px solid #E5E1DC;
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
          color: #9CA3AF;
          text-decoration: line-through;
        }
        .save {
          font-size: 12px;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
          border-radius: 3px;
          padding: 2px 8px;
          letter-spacing: .06em;
        }
        .price {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2.8rem;
          color: #F07316;
          letter-spacing: .03em;
          line-height: 1;
        }
        .unit {
          font-size: 14px;
          color: #6B7280;
          font-family: 'Inter', sans-serif;
        }
        .stock {
          margin-top: 8px;
          font-size: 12px;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
        }
        .stock--ok { color: #16a34a; }
        .stock--out { color: #dc2626; }
        .saving {
          margin-top: 8px;
          font-size: 12px;
          color: #16a34a;
        }
        .actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .qty-row { display: flex; align-items: center; gap: 12px; }
        .qty-stepper { display: grid; grid-template-columns: 38px 44px 38px; border: 1.5px solid #E5E1DC; border-radius: 6px; overflow: hidden; }
        .qty-stepper button { border: none; background: #FAF8F5; color: #0B2447; font-size: 16px; font-weight: 700; cursor: pointer; height: 38px; }
        .qty-stepper span { display: flex; align-items: center; justify-content: center; color: #0B2447; font-family: 'Inter', sans-serif; font-weight: 800; border-left: 1px solid #E5E1DC; border-right: 1px solid #E5E1DC; }
        .qty-unit { font-size: 13px; color: #6B7280; }
        .btn-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .btn-add-to-cart, .btn-buy-now {
          min-height: 46px;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
        }
        .btn-add-to-cart { background: #FFFFFF; border: 1.5px solid #0B2447; color: #0B2447; }
        .btn-add-to-cart:hover { background: #F7F4F0; }
        .btn-buy-now { background: #F07316; border: none; color: #FFFFFF; }
        .btn-buy-now:hover { background: #D9640F; }
        .btn-buy-now--reserve { background: #0B2447; }
        .btn-buy-now--reserve:hover { background: #143a6b; }
        .verify-note {
          font-family: 'Inter', sans-serif;
          font-size: 11.5px;
          color: #6B7280;
          text-align: center;
          margin-top: -2px;
        }
        .btn-add-to-cart:disabled, .btn-buy-now:disabled { opacity: 0.5; cursor: not-allowed; }
        @media(max-width: 560px) {
          .variant-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
