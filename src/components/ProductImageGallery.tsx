'use client';
// src/components/ProductImageGallery.tsx
// Shows a main image + thumbnail strip below.
// Clicking a thumbnail swaps the main image.
// Falls back to ProductImagePlaceholder if no images exist.

import { useState } from 'react';
import Image from 'next/image';
import ProductImagePlaceholder from '@/components/ProductImagePlaceholder';

interface Props {
  images: string[];           // All images: [primary, ...extras]
  productName: string;
  categoryName?: string;
  categoryIcon?: string;
  brandName?: string;
}

export default function ProductImageGallery({
  images,
  productName,
  categoryName,
  categoryIcon,
  brandName,
}: Props) {
  const validImages = images.filter(Boolean);
  const [active, setActive] = useState(0);

  if (validImages.length === 0) {
    return (
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: 16, overflow: 'hidden' }}>
        <ProductImagePlaceholder
          name={productName}
          categoryName={categoryName}
          categoryIcon={categoryIcon}
          brandName={brandName}
          size="detail"
        />
      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: 16, overflow: 'hidden', background: '#0a1628', marginBottom: validImages.length > 1 ? 12 : 0 }}>
        <Image
          key={validImages[active]}
          src={validImages[active]}
          alt={`${productName} â€” image ${active + 1}`}
          fill
          style={{ objectFit: 'cover', transition: 'opacity 0.25s' }}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={active === 0}
        />

        {/* Image counter badge */}
        {validImages.length > 1 && (
          <div style={{
            position: 'absolute', bottom: 12, right: 12,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            color: '#F8F9FB', fontSize: 11, fontWeight: 700,
            fontFamily: "'Syne',sans-serif", letterSpacing: '.06em',
            padding: '4px 10px', borderRadius: 20,
          }}>
            {active + 1} / {validImages.length}
          </div>
        )}

        {/* Prev / Next arrows for mobile swipe-feel */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={() => setActive(i => (i - 1 + validImages.length) % validImages.length)}
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Previous image"
            >â€¹</button>
            <button
              onClick={() => setActive(i => (i + 1) % validImages.length)}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Next image"
            >â€º</button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {validImages.length > 1 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {validImages.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              style={{
                flexShrink: 0,
                width: 64, height: 64,
                borderRadius: 8, overflow: 'hidden',
                border: `2px solid ${i === active ? '#F97316' : 'rgba(249,115,22,0.15)'}`,
                padding: 0, cursor: 'pointer',
                background: '#0a1628',
                transition: 'border-color 0.2s',
                position: 'relative',
              }}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={src}
                alt={`${productName} thumbnail ${i + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

