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
            Checkout
          </Link>
        )}
        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className={`patc-wrap patc-wrap--${layout}`}>
      <button type="button" onClick={handleAdd} className={`patc-add${flash ? ' patc-add--flash' : ''}`}>
        {flash ? 'Added' : 'Add to Cart'}
      </button>
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
    border: none;
    background: #25D366;
    color: white;
    font-family: 'Syne', sans-serif;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-decoration: none;
    cursor: pointer;
  }
  .patc-add--flash { background: #F97316; }
  .patc-qty {
    display: grid;
    grid-template-columns: 44px 1fr 44px;
    min-height: 44px;
    border: 1px solid rgba(249,115,22,0.3);
    border-radius: 8px;
    overflow: hidden;
  }
  .patc-qty button {
    border: none;
    background: rgba(249,115,22,0.12);
    color: #F97316;
    font-size: 20px;
    font-weight: 700;
    cursor: pointer;
  }
  .patc-qty span {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #F8F9FB;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
  }
  .patc-checkout { margin-top: 10px; background: #F97316; color: #0B2447; }
`;

