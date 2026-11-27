'use client';
// src/components/home/HomeProductCard.tsx
// Homepage-only product card. Reuses the existing cart (useCart) and Product type;
// the shared ProductCard is intentionally left untouched.
import { useCallback, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { useCart } from '@/lib/CartContext';

export default function HomeProductCard({ product }: { product: Product }) {
  const { items, add, inc, dec } = useCart();
  const qty = items.find(i => i.product.id === product.id)?.quantity || 0;
  const [flash, setFlash] = useState(false);

  const hasMRP = !!(product.mrp && product.price && product.mrp > product.price);
  const discount = hasMRP ? Math.round(((product.mrp! - product.price!) / product.mrp!) * 100) : 0;
  const brand = product.brands?.name || product.brand || null;
  const spec = product.thickness || product.size || null;
  const inStock = product.in_stock !== false;

  const onAdd = useCallback(() => {
    add(product);
    setFlash(true);
    setTimeout(() => setFlash(false), 1200);
  }, [add, product]);

  return (
    <div className="hp-pcard">
      <Link href={`/products/${product.id}`} className="hp-pcard-img" aria-label={product.name}>
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill sizes="(max-width:640px) 50vw, (max-width:1100px) 33vw, 25vw" style={{ objectFit: 'cover' }} />
        ) : (
          <span className="hp-pcard-noimg">{product.categories?.icon || '📦'}</span>
        )}
        {discount > 0 && <span className="hp-pcard-off">{discount}% OFF</span>}
      </Link>
      <div className="hp-pcard-body">
        {brand && <div className="hp-pcard-brand">{brand}</div>}
        <Link href={`/products/${product.id}`} className="hp-pcard-name">{product.name}</Link>
        {spec && <div className="hp-pcard-spec">{spec}</div>}
        {product.price ? (
          <div className="hp-pcard-price">
            <span className="hp-pcard-sell">₹{product.price.toLocaleString('en-IN')}</span>
            {product.unit && <span className="hp-pcard-unit">/ {product.unit}</span>}
            {hasMRP && <span className="hp-pcard-mrp">₹{product.mrp!.toLocaleString('en-IN')}</span>}
          </div>
        ) : (
          <div className="hp-pcard-enq">Price on enquiry</div>
        )}
        <div className={`hp-pcard-stock ${inStock ? 'in' : 'out'}`}>● {inStock ? 'In Stock' : 'Out of Stock'}</div>
        {qty === 0 ? (
          <button type="button" className="hp-pcard-btn" onClick={onAdd} disabled={!inStock}>
            {flash ? '✓ Added' : 'Add to Cart'}
          </button>
        ) : (
          <div className="hp-pcard-qty">
            <button type="button" onClick={() => dec(product)} aria-label="Decrease quantity">−</button>
            <span>{qty}</span>
            <button type="button" onClick={() => inc(product)} aria-label="Increase quantity">+</button>
          </div>
        )}
      </div>
    </div>
  );
}
