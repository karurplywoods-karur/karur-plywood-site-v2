'use client';
// src/app/cart/page.tsx
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/CartContext';
import { useWishlist } from '@/lib/WishlistContext';
import ProductCard from '@/components/ProductCard';
import type { Product, ProductVariant } from '@/lib/types';

function itemKey(product: Product, variant?: ProductVariant | null) {
  return `${product.id}:${variant?.id || 'base'}`;
}
function itemPrice(product: Product, variant?: ProductVariant | null) {
  return variant?.price ?? product.price ?? 0;
}
function itemMrp(product: Product, variant?: ProductVariant | null) {
  return variant?.mrp ?? product.mrp ?? null;
}
function variantLabel(variant?: ProductVariant | null) {
  if (!variant) return null;
  return [variant.thickness, variant.size, variant.grade, variant.finish, variant.color, variant.pack_size].filter(Boolean).join(' / ') || null;
}

export default function CartPage() {
  const { items, inc, dec, setQty, clear, total } = useCart();
  const { add: addToWishlist } = useWishlist();
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/products?limit=5')
      .then(r => r.json())
      .then(data => setRelated(Array.isArray(data) ? data.slice(0, 5) : []))
      .catch(() => setRelated([]));
  }, []);

  const gstIncluded = Math.round(total - total / 1.18);
  const freeShippingThreshold = 10000;
  const shippingFree = total >= freeShippingThreshold;

  const saveForLater = (item: typeof items[number]) => {
    addToWishlist(item.product);
    setQty(item.product, 0, item.variant);
  };

  if (items.length === 0) {
    return (
      <div style={{ background: '#FAF8F5', minHeight: '70vh', paddingTop: 58 }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '90px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🛒</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: '1.3rem', fontWeight: 700, color: '#0B2447', marginBottom: 10 }}>Your cart is empty</h1>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 26 }}>Browse our products and add items to get started.</p>
          <Link href="/products" style={{ display: 'inline-flex', padding: '13px 28px', background: '#F07316', color: '#FFFFFF', borderRadius: 6, fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', textDecoration: 'none' }}>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#FAF8F5', paddingTop: 58 }}>

      {/* Breadcrumb */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E1DC', padding: '10px 0' }}>
        <div className="cart-pad" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>
          <div style={{ fontSize: 12, color: '#9CA3AF', display: 'flex', gap: 6 }}>
            <Link href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Home</Link><span>›</span>
            <span style={{ color: '#F07316', fontWeight: 600 }}>Cart</span>
          </div>
        </div>
      </div>

      <div className="cart-pad" style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 48px 60px' }}>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(1.4rem,2.6vw,1.8rem)', fontWeight: 700, color: '#0B2447', margin: 0 }}>
            Your Cart <span style={{ fontWeight: 400, fontSize: '0.9rem', color: '#6B7280' }}>({items.reduce((s, i) => s + i.quantity, 0)} Items)</span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#16a34a', fontFamily: "'Syne',sans-serif", fontWeight: 600 }}>
            🛡️ 100% Secure Shopping <span style={{ color: '#9CA3AF', fontWeight: 400 }}>— Your data is safe and protected</span>
          </div>
        </div>

        <div className="cart-grid">
          {/* Items table */}
          <div>
            <div className="cart-table-card">
              <div className="cart-table-head">
                <span>Product</span><span>Price</span><span>Quantity</span><span style={{ textAlign: 'right' }}>Total</span>
              </div>
              {items.map(item => {
                const key = itemKey(item.product, item.variant);
                const price = itemPrice(item.product, item.variant);
                const mrp = itemMrp(item.product, item.variant);
                const vLabel = variantLabel(item.variant);
                return (
                  <div key={key} className="cart-row">
                    <div className="cart-row-product">
                      <div className="cart-row-img">
                        {item.product.image_url
                          ? <Image src={item.product.image_url} alt={item.product.name} fill style={{ objectFit: 'cover' }} sizes="72px" />
                          : <div className="cart-row-img-fallback">🪵</div>}
                      </div>
                      <div>
                        <div className="cart-row-name">{item.product.name}</div>
                        {vLabel && <div className="cart-row-variant">{vLabel}</div>}
                        <div className="cart-row-stock">✓ In Stock</div>
                        <div className="cart-row-links">
                          <button onClick={() => saveForLater(item)}>Save for later</button>
                          <span>|</span>
                          <button onClick={() => setQty(item.product, 0, item.variant)}>Remove</button>
                        </div>
                      </div>
                    </div>
                    <div className="cart-row-price">
                      <div className="cart-row-price-now">₹{price.toLocaleString('en-IN')}</div>
                      {mrp && mrp > price && <div className="cart-row-mrp">MRP ₹{mrp.toLocaleString('en-IN')}</div>}
                      {item.product.unit && <div className="cart-row-unit">/ {item.product.unit}</div>}
                    </div>
                    <div>
                      <div className="cart-row-qty">
                        <button onClick={() => dec(item.product, item.variant)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => inc(item.product, item.variant)}>+</button>
                      </div>
                      {item.product.unit && <div className="cart-row-qty-unit">{item.product.unit}</div>}
                    </div>
                    <div className="cart-row-total">₹{(price * item.quantity).toLocaleString('en-IN')}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, flexWrap: 'wrap', gap: 12 }}>
              <Link href="/products" className="cart-continue-btn">← Continue Shopping</Link>
              <button onClick={clear} className="cart-clear-btn-page">🗑 Clear Cart</button>
            </div>
          </div>

          {/* Order summary sidebar */}
          <aside>
            <div className="cart-summary-card">
              <h2 className="cart-summary-title">Order Summary</h2>
              <div className="cart-summary-row"><span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} Items)</span><span>₹{total.toLocaleString('en-IN')}</span></div>
              <div className="cart-summary-row"><span>Shipping</span><span style={{ color: shippingFree ? '#16a34a' : '#0B2447' }}>{shippingFree ? 'Free' : 'Calculated at checkout'}</span></div>
              <div className="cart-summary-row"><span>GST (18%)</span><span style={{ color: '#6B7280' }}>Included</span></div>
              <div className="cart-summary-total-row">
                <span>Total Amount</span>
                <span className="cart-summary-total-val">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 16 }}>(Inclusive of all taxes)</div>
              <Link href="/checkout" className="cart-checkout-cta">Proceed to Checkout →</Link>
              <div style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 10 }}>🔒 Secure Checkout</div>
            </div>

            <div className="cart-summary-card">
              <div style={{ fontSize: 12.5, color: '#0B2447', fontWeight: 700, marginBottom: 10 }}>Have a coupon?</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input placeholder="Enter coupon code" className="cart-coupon-input" />
                <button className="cart-coupon-btn">Apply</button>
              </div>
            </div>

            <div className="cart-summary-card">
              {[
                { i: '🚚', t: 'Free Delivery', d: 'On orders above ₹10,000' },
                { i: '🔒', t: 'Secure Payments', d: '100% safe & secure' },
                { i: '↺', t: 'Easy Returns', d: '7 days easy returns' },
                { i: '📄', t: 'GST Invoice', d: 'Billing with GST' },
              ].map((f, i) => (
                <div key={f.t} className="cart-delivery-row" style={{ marginBottom: i === 3 ? 0 : 14 }}>
                  <span style={{ fontSize: 18 }}>{f.i}</span>
                  <div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '0.76rem', fontWeight: 700, color: '#0B2447' }}>{f.t}</div>
                    <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>{f.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        {/* You may also like */}
        {related.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#0B2447', marginBottom: 18 }}>You May Also Like</h2>
            <div className="cart-related-grid">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* Feature strip */}
      <div className="cart-feature-strip">
        <div className="cart-pad" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>
          {[
            { i: '🛡️', t: '100% Original Products', d: 'Sourced from trusted brands' },
            { i: '✓', t: 'Best Price Guarantee', d: 'Get the best price always' },
            { i: '🚚', t: 'Fast Delivery Across India', d: 'Quick & reliable delivery' },
            { i: '🔒', t: 'Secure Payments', d: '100% safe & secure' },
            { i: '🎧', t: 'Expert Support', d: 'We are here to help' },
          ].map(f => (
            <div key={f.t} className="cart-feature-item">
              <span style={{ fontSize: 20 }}>{f.i}</span>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '0.74rem', fontWeight: 700, color: '#FFFFFF' }}>{f.t}</div>
                <div style={{ fontSize: '0.64rem', color: '#93A3BC' }}>{f.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .cart-grid { display: grid; grid-template-columns: 1fr 320px; gap: 24px; align-items: start; }
        .cart-table-card { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; overflow: hidden; }
        .cart-table-head { display: grid; grid-template-columns: 2.3fr 1fr 1fr 0.8fr; padding: 12px 20px; background: #FAF8F5; border-bottom: 1px solid #E5E1DC; font-family: 'Syne',sans-serif; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #6B7280; }
        .cart-row { display: grid; grid-template-columns: 2.3fr 1fr 1fr 0.8fr; padding: 18px 20px; border-bottom: 1px solid #F1EEE9; align-items: center; }
        .cart-row:last-child { border-bottom: none; }
        .cart-row-product { display: flex; gap: 14px; align-items: flex-start; }
        .cart-row-img { position: relative; width: 68px; height: 68px; border-radius: 8px; overflow: hidden; background: #F2EDE5; flex-shrink: 0; }
        .cart-row-img-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .cart-row-name { font-family: 'Syne',sans-serif; font-weight: 700; font-size: 0.86rem; color: #0B2447; margin-bottom: 3px; }
        .cart-row-variant { font-size: 0.72rem; color: #6B7280; margin-bottom: 3px; }
        .cart-row-stock { font-size: 0.68rem; color: #16a34a; font-weight: 600; margin-bottom: 6px; }
        .cart-row-links { display: flex; gap: 8px; font-size: 0.7rem; }
        .cart-row-links button { background: none; border: none; padding: 0; cursor: pointer; color: #6B7280; text-decoration: underline; font-family: inherit; }
        .cart-row-links button:hover { color: #F07316; }
        .cart-row-links span { color: #D1CBC2; }
        .cart-row-price-now { font-family: 'Syne',sans-serif; font-weight: 700; color: #0B2447; font-size: 0.86rem; }
        .cart-row-mrp { font-size: 0.72rem; color: #9CA3AF; text-decoration: line-through; }
        .cart-row-unit { font-size: 0.68rem; color: #6B7280; }
        .cart-row-qty { display: inline-grid; grid-template-columns: 30px 34px 30px; border: 1px solid #E5E1DC; border-radius: 6px; overflow: hidden; }
        .cart-row-qty button { border: none; background: #FAF8F5; color: #F07316; font-size: 15px; font-weight: 700; cursor: pointer; height: 30px; }
        .cart-row-qty span { display: flex; align-items: center; justify-content: center; font-family: 'Syne',sans-serif; font-weight: 700; color: #0B2447; border-left: 1px solid #E5E1DC; border-right: 1px solid #E5E1DC; font-size: 13px; }
        .cart-row-qty-unit { font-size: 0.62rem; color: #6B7280; margin-top: 4px; }
        .cart-row-total { font-family: 'Syne',sans-serif; font-weight: 700; color: #0B2447; font-size: 0.9rem; text-align: right; }

        .cart-continue-btn { display: inline-flex; align-items: center; padding: 11px 20px; border: 1px solid #E5E1DC; border-radius: 6px; color: #0B2447; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 0.74rem; letter-spacing: 0.05em; text-decoration: none; background: #FFFFFF; }
        .cart-continue-btn:hover { border-color: #F07316; color: #F07316; }
        .cart-clear-btn-page { display: inline-flex; align-items: center; gap: 6px; padding: 11px 20px; border: 1px solid #fecaca; border-radius: 6px; color: #dc2626; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 0.74rem; letter-spacing: 0.05em; background: #FFFFFF; cursor: pointer; }
        .cart-clear-btn-page:hover { background: #fef2f2; }

        .cart-summary-card { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; padding: 20px; margin-bottom: 16px; }
        .cart-summary-title { font-family: 'Syne',sans-serif; font-size: 1rem; font-weight: 700; color: #0B2447; margin-bottom: 16px; }
        .cart-summary-row { display: flex; justify-content: space-between; font-size: 13px; color: #4B5563; margin-bottom: 10px; }
        .cart-summary-total-row { display: flex; justify-content: space-between; align-items: baseline; border-top: 1px solid #E5E1DC; padding-top: 14px; margin-top: 6px; font-family: 'Syne',sans-serif; font-weight: 700; color: #0B2447; }
        .cart-summary-total-val { font-family: 'Bebas Neue',sans-serif; font-size: 1.6rem; color: #F07316; }
        .cart-checkout-cta { display: flex; align-items: center; justify-content: center; padding: 13px 0; background: #F07316; color: #FFFFFF; border-radius: 6px; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 0.8rem; letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none; margin-top: 6px; }
        .cart-checkout-cta:hover { background: #D9640F; }
        .cart-coupon-input { flex: 1; min-width: 0; padding: 9px 12px; border: 1px solid #E5E1DC; border-radius: 6px; font-size: 12.5px; background: #FAF8F5; }
        .cart-coupon-btn { padding: 9px 16px; background: #0B2447; color: #FFFFFF; border: none; border-radius: 6px; font-family: 'Syne',sans-serif; font-size: 0.72rem; font-weight: 700; cursor: pointer; }
        .cart-delivery-row { display: flex; gap: 12px; align-items: flex-start; }

        .cart-related-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }

        .cart-feature-strip { background: #0B2447; padding: 24px 0; margin-top: 40px; display: flex; }
        .cart-feature-strip > .cart-pad { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
        .cart-feature-item { display: flex; align-items: center; gap: 10px; }

        @media(max-width:1000px){ .cart-grid { grid-template-columns: 1fr !important; } .cart-related-grid { grid-template-columns: repeat(3,1fr) !important; } .cart-feature-strip > .cart-pad { grid-template-columns: repeat(2,1fr) !important; } }
        @media(max-width:768px){
          .cart-table-head { display: none; }
          .cart-row { grid-template-columns: 1fr !important; gap: 10px; }
          .cart-row-price, .cart-row-total { text-align: left !important; }
        }
        @media(max-width:640px){ .cart-pad { padding-left:16px !important; padding-right:16px !important; } .cart-related-grid { grid-template-columns: repeat(2,1fr) !important; } }
      `}</style>
    </div>
  );
}
