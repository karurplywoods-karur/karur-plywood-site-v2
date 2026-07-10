'use client';
// src/components/WishlistButton.tsx
// Heart icon button â€” toggles product in/out of wishlist.
// Shows filled red heart when in wishlist, outline when not.

import { useWishlist } from '@/lib/WishlistContext';
import type { Product } from '@/lib/types';

interface Props {
  product: Product;
  size?: 'sm' | 'md';
  className?: string;
}

export default function WishlistButton({ product, size = 'md' }: Props) {
  const { toggle, has } = useWishlist();
  const saved = has(product.id);
  const dim = size === 'sm' ? 28 : 34;

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product); }}
      title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      style={{
        width: dim, height: dim,
        borderRadius: '50%',
        border: `1px solid ${saved ? 'rgba(248,113,113,0.5)' : 'rgba(249,115,22,0.2)'}`,
        background: saved ? 'rgba(248,113,113,0.12)' : 'rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        fontSize: size === 'sm' ? 13 : 16,
        transition: 'all 0.2s',
        flexShrink: 0,
      }}
    >
      {saved ? 'â¤ï¸' : 'ðŸ¤'}
    </button>
  );
}

