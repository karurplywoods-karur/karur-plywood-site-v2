'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/lib/CartContext';
import type { Product, ProductVariant } from '@/lib/types';

interface Props {
  product: Product;
  variant?: ProductVariant;
  layout?: 'stack' | 'compact';
}

export default function ProductAddToCart({ product, variant, layout = 'stack' }: Props) {
  const { items, add, inc, dec } = useCart();
  const [flash, setFlash] = useState(false);
  const qty = items.find(i => i.product.id === product.id && (i.variant?.id || '') === (variant?.id || ''))?.quantity || 0;

  const needsVerification = product.fulfillment_type === 'DISTRIBUTOR' || product.fulfillment_type === 'SPECIAL_ORDER' || !!product.verification_required;
  const primaryLabel = needsVerification ? 'Reserve Order' : 'Buy Now';
  const flashLabel = needsVerification ? 'Reserved' : 'Added';

  // If the cart (as a whole) contains any verification-required item, checkout
  // must go through the Reserve Order flow instead of immediate payment —
  // the checkout page itself branches on this, this is just the label hint.
  const cartNeedsReserve = items.some(i =>
    i.product.fulfillment_type === 'DISTRIBUTOR' || i.product.fulfillment_type === 'SPECIAL_ORDER' || i.product.verification_required
  );

  const handleAdd = () => {
    add(product, variant);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 1000);
  };

  if (qty > 0) {
    return (
      <div className={`patc-wrap patc-wrap--${layout}`}>
        <div className="patc-qty">
          <button type="button" onClick={() => dec(product, variant)} aria-label="Decrease quantity">-</button>
          <span>{qty}</span>
          <button type="button" onClick={() => inc(product, variant)} aria-label="Increase quantity">+</button>
        </div>
        {layout === 'stack' && (
          <Link href="/checkout" className="patc-checkout">
            {cartNeedsReserve ? 'Reserve Order' : 'Checkout'}
          </Link>
        )}
        {needsVerification && (
          <p className="patc-note">Availability verified before payment — usually within 15 minutes.</p>
        )}
        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className={`patc-wrap patc-wrap--${layout}`}>
      <button type="button" onClick={handleAdd} className={`patc-add${flash ? ' patc-add--flash' : ''}${needsVerification ? ' patc-add--reserve' : ''}`}>
        {flash ? flashLabel : primaryLabel}
      </button>
      {needsVerification && layout === 'stack' && (
        <p className="patc-note">We'll confirm stock before requesting payment.</p>
      )}
      <style jsx>{styles}</style>
    </div>
  );
}

const styles = `
  .patc-wrap { width: 100%; }
  .patc-wrap--compact { display: block; }
  .patc-add, .patc-checkout {
    width: 100%;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: 1.5px solid #0B2447;
    background: #FFFFFF;
    color: #0B2447;
    font-family: 'Inter', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.15s;
  }
  .patc-add:hover, .patc-checkout:hover { background: #F7F4F0; }
  .patc-add--flash { background: #F07316; border-color: #F07316; color: #FFFFFF; }
  .patc-qty {
    display: grid;
    grid-template-columns: 44px 1fr 44px;
    min-height: 40px;
    border: 1.5px solid #E5E1DC;
    border-radius: 8px;
    overflow: hidden;
  }
  .patc-qty button {
    border: none;
    background: #FAF8F5;
    color: #F07316;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
  }
  .patc-qty span {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0B2447;
    font-family: 'Inter', sans-serif;
    font-weight: 800;
    border-left: 1px solid #E5E1DC;
    border-right: 1px solid #E5E1DC;
  }
  .patc-checkout { margin-top: 10px; background: #F07316; border-color: #F07316; color: #FFFFFF; }
  .patc-checkout:hover { background: #D9640F; }
  .patc-add--reserve { border-color: #0B2447; background: #0B2447; color: #FFFFFF; }
  .patc-add--reserve:hover { background: #143a6b; }
  .patc-note { margin: 6px 0 0; font-size: 0.7rem; color: #6B7280; font-family: 'Inter', sans-serif; text-align: center; }
`;
