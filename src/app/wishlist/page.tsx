'use client';
// src/app/wishlist/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/lib/WishlistContext';
import { useCart } from '@/lib/CartContext';
import ProductImagePlaceholder from '@/components/ProductImagePlaceholder';

export default function WishlistPage() {
  const { items, remove, clear } = useWishlist();
  const { add } = useCart();

  return (
    <main style={{ minHeight: '70vh', background: '#070F1F', padding: 'calc(58px + 40px) 0 80px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#F97316', marginBottom: 8 }}>
              Saved Products
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 700, color: '#F8F9FB', margin: 0 }}>
              My Wishlist {items.length > 0 && <span style={{ fontSize: '1.2rem', color: '#7A8EA8' }}>({items.length})</span>}
            </h1>
          </div>
          {items.length > 0 && (
            <button onClick={clear} style={{ fontSize: 12, color: '#7A8EA8', background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontFamily: "'Syne',sans-serif", fontWeight: 600 }}>
              Clear All
            </button>
          )}
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🤍</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.8rem', color: '#F8F9FB', margin: '0 0 10px' }}>
              Your wishlist is empty
            </h2>
            <p style={{ color: '#7A8EA8', fontSize: 14, marginBottom: 28 }}>
              Browse products and tap the heart icon to save items for later.
            </p>
            <Link href="/products" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 10, background: 'linear-gradient(135deg,#C8884A,#8B5E2A)', color: '#fff', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '0.78rem', letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Browse Products
            </Link>
          </div>
        )}

        {/* Product grid */}
        {items.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {items.map(product => {
              const hasMRP = product.mrp && product.price && product.mrp > product.price;
              const discount = hasMRP ? Math.round(((product.mrp! - product.price!) / product.mrp!) * 100) : null;

              return (
                <div key={product.id} style={{ background: '#0d1e36', border: '1px solid rgba(249,115,22,0.12)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                  {/* Image */}
                  <Link href={`/products/${product.id}`} style={{ display: 'block', position: 'relative', aspectRatio: '4/3', flexShrink: 0 }}>
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width:768px) 100vw, 33vw"
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
                      <div style={{ position: 'absolute', top: 10, left: 10, background: '#25D366', color: '#fff', borderRadius: 4, padding: '3px 8px', fontSize: 11, fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>
                        {discount}% OFF
                      </div>
                    )}
                  </Link>

                  {/* Body */}
                  <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {product.categories && (
                      <div style={{ fontSize: '0.58rem', fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#F97316', marginBottom: 4 }}>
                        {product.categories.icon} {product.categories.name}
                      </div>
                    )}

                    <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#F8F9FB', lineHeight: 1.3, marginBottom: 8 }}>
                        {product.name}
                      </div>
                    </Link>

                    {product.price ? (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
                        <span style={{ fontSize: 18, fontWeight: 700, color: '#F97316', fontFamily: "'Cormorant Garamond',serif" }}>
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.unit && <span style={{ fontSize: 12, color: '#7A8EA8' }}>/ {product.unit}</span>}
                        {hasMRP && (
                          <span style={{ fontSize: 13, color: '#5A6E80', textDecoration: 'line-through', textDecorationColor: '#F97316' }}>
                            ₹{product.mrp!.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: '#7A8EA8', marginBottom: 14, fontStyle: 'italic' }}>Price on enquiry</div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginTop: 'auto' }}>
                      <button
                        onClick={() => { add(product); remove(product.id); }}
                        style={{ padding: '10px 0', borderRadius: 8, background: 'linear-gradient(135deg,#C8884A,#8B5E2A)', color: '#fff', border: 'none', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '0.7rem', letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                        Add to Cart
                      </button>
                      <button
                        onClick={() => remove(product.id)}
                        title="Remove from wishlist"
                        style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.06)', color: '#F87171', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Continue shopping */}
        {items.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link href="/products" style={{ fontSize: 13, color: '#7A8EA8', textDecoration: 'none', fontFamily: "'Syne',sans-serif", fontWeight: 600 }}>
              ← Continue Browsing Products
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
