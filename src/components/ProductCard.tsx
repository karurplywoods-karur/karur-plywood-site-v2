'use client';
// src/components/ProductCard.tsx
import { useCallback, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product, CartItem } from '@/lib/types';
import { getProductBadge } from '@/lib/badges';
import { useCart } from '@/lib/CartContext';
import ProductImagePlaceholder from '@/components/ProductImagePlaceholder';
import WishlistButton from '@/components/WishlistButton';

interface Props {
  product: Product;
  mode?: 'project' | 'quick';
  cartItem?: CartItem;
  onAdd?: (p: Product) => void;
  onInc?: (p: Product) => void;
  onDec?: (p: Product) => void;
  showDescription?: boolean;
}

export default function ProductCard({ product, cartItem: cartItemProp, onAdd, onInc, onDec, showDescription = false }: Props) {
  const { items, add, inc, dec } = useCart();
  const cartItem = cartItemProp || items.find(i => i.product.id === product.id);
  const qty = cartItem?.quantity || 0;
  const badge = getProductBadge(product);
  const [addedFlash, setAddedFlash] = useState(false);

  const hasMRP = product.mrp && product.price && product.mrp > product.price;
  const discount = hasMRP ? Math.round(((product.mrp! - product.price!) / product.mrp!) * 100) : null;

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    (onAdd || add)(product);
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 1200);
  }, [product, add, onAdd]);

  const handleInc = useCallback((e: React.MouseEvent) => { e.preventDefault(); (onInc || inc)(product); }, [product, inc, onInc]);
  const handleDec = useCallback((e: React.MouseEvent) => { e.preventDefault(); (onDec || dec)(product); }, [product, dec, onDec]);

  return (
    <div className="pc-card">
      {/* Image */}
      <Link href={`/products/${product.id}`} className="pc-image-wrap" style={{ display:'block', textDecoration:'none' }}>
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="pc-img" sizes="(max-width:768px)50vw,25vw" style={{ objectFit:'cover' }} />
        ) : (
          <div className="pc-image-placeholder">
            <ProductImagePlaceholder name={product.name} categoryName={product.categories?.name} categoryIcon={product.categories?.icon} brandName={(product as any).brands?.name} size="card" />
          </div>
        )}
        {/* Hover overlay */}
        <div style={{ position:'absolute', inset:0, background:'rgba(11,36,71,0.18)', display:'flex', alignItems:'center', justifyContent:'center', opacity:0, transition:'opacity .2s' }} className="pc-hover-overlay">
          <span style={{ background:'var(--orange)', color:'#fff', fontFamily:'var(--f-ui)', fontWeight:700, fontSize:11, letterSpacing:'.1em', textTransform:'uppercase', padding:'7px 16px', borderRadius:4 }}>View Details</span>
        </div>
        {/* Trust badge */}
        {badge && (
          <div className="pc-badge-trust" style={{ background: badge.color, color: badge.textColor }}>
            {badge.emoji} {badge.label}
          </div>
        )}
        {/* Discount */}
        {discount && discount > 0 && (
          <div style={{ position:'absolute', top:8, left:8, background:'#16a34a', color:'#fff', borderRadius:3, padding:'2px 7px', fontSize:10, fontWeight:700, fontFamily:'var(--f-ui)', letterSpacing:'.05em', zIndex:2 }}>
            {discount}% OFF
          </div>
        )}
        {qty > 0 && <div className="pc-qty-indicator">{qty}</div>}
      </Link>

      {/* Body */}
      <div className="pc-body">
        {/* Category row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
          {product.categories && (
            <span style={{ fontSize:'0.58rem', fontFamily:'var(--f-ui)', fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:'var(--orange)' }}>
              {product.categories.icon} {product.categories.name}
            </span>
          )}
          {product.in_stock !== false ? (
            <span style={{ fontSize:'0.55rem', fontFamily:'var(--f-ui)', fontWeight:700, color:'#16a34a', letterSpacing:'.08em' }}>● In Stock</span>
          ) : (
            <span style={{ fontSize:'0.55rem', fontFamily:'var(--f-ui)', fontWeight:700, color:'#dc2626', letterSpacing:'.08em' }}>● Out of Stock</span>
          )}
        </div>

        {/* Name */}
        <Link href={`/products/${product.id}`} style={{ textDecoration:'none' }}>
          <div className="pc-name">{product.name}</div>
        </Link>

        {/* Price */}
        {product.price ? (
          <div className="pc-price-row">
            <span className="pc-price">₹{product.price.toLocaleString('en-IN')}</span>
            {product.unit && <span className="pc-unit">/ {product.unit}</span>}
            {hasMRP && <span className="pc-mrp">₹{product.mrp!.toLocaleString('en-IN')}</span>}
          </div>
        ) : (
          <div style={{ fontSize:12, color:'var(--text-meta)', fontStyle:'italic', marginBottom:'0.85rem' }}>Price on enquiry</div>
        )}

        {/* Actions */}
        {qty === 0 ? (
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:6, marginTop:'auto' }}>
            <button onClick={handleAdd} className={`pc-add-btn${addedFlash ? ' pc-add-btn--flash' : ''}`} type="button">
              {addedFlash ? '✓ Added' : 'Add to Cart'}
            </button>
            <WishlistButton product={product} size="sm" />
            <Link href={`/products/${product.id}`} style={{ display:'flex', alignItems:'center', justifyContent:'center', border:'1.5px solid var(--border-mid)', borderRadius:'var(--r)', color:'var(--text-meta)', fontSize:11, fontFamily:'var(--f-ui)', fontWeight:700, padding:'0 10px', textDecoration:'none', transition:'all .2s', whiteSpace:'nowrap' }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--orange)'; (e.currentTarget as HTMLElement).style.color='var(--orange)'; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--border-mid)'; (e.currentTarget as HTMLElement).style.color='var(--text-meta)'; }}>
              Info
            </Link>
          </div>
        ) : (
          <div className="pc-qty-ctrl" style={{ marginTop:'auto' }}>
            <button onClick={handleDec} className="pc-qty-btn" type="button">−</button>
            <span className="pc-qty-num">{qty}</span>
            <button onClick={handleInc} className="pc-qty-btn" type="button">+</button>
          </div>
        )}
      </div>

      <style>{`
        .pc-card:hover .pc-hover-overlay { opacity:1 !important; }
        .pc-add-btn--flash { background:#16a34a !important; }
      `}</style>
    </div>
  );
}
