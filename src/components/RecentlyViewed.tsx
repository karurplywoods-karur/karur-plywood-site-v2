'use client';
// src/components/RecentlyViewed.tsx
// Shows products the customer recently viewed.
// Mounts only on client; renders nothing during SSR.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import ProductImagePlaceholder from '@/components/ProductImagePlaceholder';

const KEY = 'karur-plywood-recently-viewed';
const MAX_DISPLAY = 4;

export default function RecentlyViewed({ excludeId }: { excludeId?: string | number }) {
  const [items, setItems] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) {
        const all: Product[] = JSON.parse(saved);
        setItems(
          all
            .filter(p => p.id !== excludeId)
            .slice(0, MAX_DISPLAY)
        );
      }
    } catch {}
  }, [excludeId]);

  if (!mounted || items.length === 0) return null;

  return (
    <section style={{ background: '#070F1F', borderTop: '1px solid rgba(249,115,22,0.08)', padding: '48px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }} className="rv-pad">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#F97316', marginBottom: 6 }}>
              Your Browsing History
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.6rem', fontWeight: 700, color: '#F8F9FB', margin: 0 }}>
              Recently Viewed
            </h2>
          </div>
          <button
            onClick={() => { localStorage.removeItem(KEY); setItems([]); }}
            style={{ fontSize: 11, color: '#5A6E80', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Syne',sans-serif", fontWeight: 600, letterSpacing: '.06em' }}
          >
            Clear history
          </button>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="rv-grid">
          {items.map(product => {
            const hasMRP = product.mrp && product.price && product.mrp > product.price;
            const discount = hasMRP
              ? Math.round(((product.mrp! - product.price!) / product.mrp!) * 100)
              : null;

            return (
              <Link key={product.id} href={`/products/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ background: '#0d1e36', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.2s, transform 0.2s' }}
                  className="rv-card">
                  {/* Image */}
                  <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        style={{ objectFit: 'cover', transition: 'transform 0.3s' }}
                        sizes="(max-width:768px) 50vw, 25vw"
                        className="rv-img"
                      />
                    ) : (
                      <ProductImagePlaceholder
                        name={product.name}
                        categoryName={product.categories?.name}
                        categoryIcon={product.categories?.icon}
                        brandName={(product as any).brands?.name}
                        size="card"
                      />
                    )}
                    {discount && discount > 0 && (
                      <div style={{ position: 'absolute', top: 8, left: 8, background: '#25D366', color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>
                        {discount}% OFF
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: '10px 12px 12px' }}>
                    {product.categories && (
                      <div style={{ fontSize: '0.55rem', fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#F97316', marginBottom: 3 }}>
                        {product.categories.icon} {product.categories.name}
                      </div>
                    )}
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#F0E8DC', lineHeight: 1.3, marginBottom: 6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                      {product.name}
                    </div>
                    {product.price ? (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#F97316', fontFamily: "'Cormorant Garamond',serif" }}>
                          â‚¹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.unit && <span style={{ fontSize: 10, color: '#7A8EA8' }}>/ {product.unit}</span>}
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: '#7A8EA8', fontStyle: 'italic' }}>Price on enquiry</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        .rv-card:hover { border-color: rgba(249,115,22,0.35) !important; transform: translateY(-3px); }
        .rv-card:hover .rv-img { transform: scale(1.05); }
        @media(max-width: 768px) { .rv-grid { grid-template-columns: repeat(2,1fr) !important; } .rv-pad { padding: 0 20px !important; } }
        @media(max-width: 480px) { .rv-grid { grid-template-columns: repeat(2,1fr) !important; } }
      `}</style>
    </section>
  );
}

