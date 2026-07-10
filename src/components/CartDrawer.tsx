'use client';
// src/components/CartDrawer.tsx
import { useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/auth-client';
import { useCart } from '@/lib/CartContext';

interface Props { open: boolean; onClose: () => void; }

function cartItemKey(item: any) {
  return `${item.product.id}:${item.variant?.id || 'base'}`;
}

function cartItemPrice(item: any) {
  return item.variant?.price ?? item.product.price ?? 0;
}

function cartItemVariantLabel(item: any) {
  if (!item.variant) return '';
  return [item.variant.thickness, item.variant.size, item.variant.grade, item.variant.finish, item.variant.color, item.variant.pack_size]
    .filter(Boolean)
    .join(' / ') || item.variant.sku || '';
}

export default function CartDrawer({ open, onClose }: Props) {
  const { items, inc, dec, setQty, clear, total, count } = useCart();
  const router = useRouter();
  const supabase = createClient();

  const handleCheckout = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      onClose();
      router.push('/auth/login?next=/checkout');
      return;
    }
    onClose();
    router.push('/checkout');
  }, [supabase, router, onClose]);

  return (
    <>
      {open && <div className="cart-backdrop" onClick={onClose} />}
      <div className={`cart-drawer${open ? ' cart-drawer--open' : ''}`}>

        {/* Header */}
        <div className="cart-header">
          <div className="cart-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
            </svg>
            Your Cart
            {count > 0 && <span className="cart-count-badge">{count}</span>}
          </div>
          <button className="cart-close-btn" onClick={onClose}>âœ•</button>
        </div>

        {/* Body */}
        <div className="cart-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div style={{ fontSize: 52, marginBottom: 16 }}>ðŸ›’</div>
              <div className="cart-empty-title">Your cart is empty</div>
              <p className="cart-empty-sub">Browse shop or quick-order products and add items to get started.</p>
              <button className="cart-empty-btn" onClick={onClose}>Browse Products â†’</button>
            </div>
          ) : (
            <div className="cart-items">
              {items.map(item => (
                <div key={cartItemKey(item)} className="cart-item">
                  <div className="cart-item-img">
                    {item.product.image_url ? (
                      <Image src={item.product.image_url} alt={item.product.name} fill style={{ objectFit: 'cover' }} sizes="60px" />
                    ) : (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                        {item.product.categories?.icon || 'ðŸ“¦'}
                      </div>
                    )}
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.product.name}</div>
                    {item.product.categories && (
                      <div className="cart-item-cat">{item.product.categories.name}</div>
                    )}
                    {cartItemVariantLabel(item) && <div className="cart-item-variant">{cartItemVariantLabel(item)}</div>}
                    {cartItemPrice(item) > 0 && (
                      <div className="cart-item-price">
                        â‚¹{(cartItemPrice(item) * item.quantity).toLocaleString('en-IN')}
                        <span style={{ color: '#7A8EA8', fontSize: 11, fontWeight: 400 }}>
                          {' '}(â‚¹{cartItemPrice(item).toLocaleString('en-IN')} Ã— {item.quantity})
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="cart-item-controls">
                    <div className="cart-qty-ctrl">
                      <button onClick={() => dec(item.product, item.variant)} className="cart-qty-btn">âˆ’</button>
                      <input
                        type="number" min="1"
                        value={item.quantity}
                        onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 1) setQty(item.product, v, item.variant); }}
                        className="cart-qty-input"
                      />
                      <button onClick={() => inc(item.product, item.variant)} className="cart-qty-btn">+</button>
                    </div>
                    <button onClick={() => setQty(item.product, 0, item.variant)} className="cart-remove-btn">ðŸ—‘ï¸</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-footer">
            {total > 0 && (
              <div className="cart-subtotal">
                <span>Subtotal ({count} item{count !== 1 ? 's' : ''})</span>
                <span className="cart-subtotal-val">â‚¹{total.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="cart-footer-note">ðŸ“¦ Delivery charges confirmed by our team</div>
            <button onClick={handleCheckout} className="cart-checkout-btn">
              Proceed to Checkout â†’
            </button>
            <button onClick={clear} className="cart-clear-btn">Clear Cart</button>
          </div>
        )}
      </div>

      <style>{`
        .cart-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:8000; backdrop-filter:blur(2px); }
        .cart-drawer { position:fixed; top:0; right:0; bottom:0; width:420px; max-width:100vw; background:#070F1F; border-left:1px solid rgba(249,115,22,0.15); z-index:8001; display:flex; flex-direction:column; transform:translateX(100%); transition:transform .3s cubic-bezier(.4,0,.2,1); box-shadow:-20px 0 60px rgba(0,0,0,0.5); }
        .cart-drawer--open { transform:translateX(0); }
        .cart-header { display:flex; align-items:center; justify-content:space-between; padding:18px 20px; border-bottom:1px solid rgba(249,115,22,0.1); flex-shrink:0; }
        .cart-title { font-family:'Syne',sans-serif; font-size:.82rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#F8F9FB; display:flex; align-items:center; gap:10px; }
        .cart-count-badge { background:#F97316; color:#0B2447; font-size:10px; font-weight:700; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; }
        .cart-close-btn { background:none; border:1px solid rgba(249,115,22,0.2); border-radius:4px; color:#7A8EA8; width:28px; height:28px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:12px; transition:all .15s; }
        .cart-close-btn:hover { color:#F97316; border-color:#F97316; }
        .cart-body { flex:1; overflow-y:auto; padding:4px 0; }
        .cart-body::-webkit-scrollbar { width:3px; }
        .cart-body::-webkit-scrollbar-thumb { background:rgba(249,115,22,0.3); border-radius:3px; }
        .cart-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; padding:40px 24px; text-align:center; }
        .cart-empty-title { font-family:'Syne',sans-serif; font-weight:700; font-size:1rem; color:#F8F9FB; margin-bottom:8px; }
        .cart-empty-sub { font-size:13px; color:#7A8EA8; margin-bottom:20px; line-height:1.6; }
        .cart-empty-btn { padding:9px 20px; border-radius:4px; background:rgba(249,115,22,0.1); border:1px solid rgba(249,115,22,0.3); color:#F97316; font-family:'Syne',sans-serif; font-size:.7rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; }
        .cart-items { padding:4px 0; }
        .cart-item { display:flex; gap:12px; align-items:center; padding:12px 20px; border-bottom:1px solid rgba(249,115,22,0.06); }
        .cart-item-img { width:56px; height:56px; border-radius:6px; overflow:hidden; position:relative; background:rgba(25,55,109,0.5); flex-shrink:0; border:1px solid rgba(249,115,22,0.1); }
        .cart-item-info { flex:1; min-width:0; }
        .cart-item-name { font-family:'Syne',sans-serif; font-size:.78rem; font-weight:700; color:#F8F9FB; line-height:1.3; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:2px; }
        .cart-item-cat { font-size:10px; color:#F97316; margin-bottom:3px; }
        .cart-item-variant { font-size:10px; color:#7A8EA8; margin-bottom:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .cart-item-price { font-size:12px; font-weight:700; color:#F97316; }
        .cart-item-controls { display:flex; flex-direction:column; align-items:flex-end; gap:5px; flex-shrink:0; }
        .cart-qty-ctrl { display:flex; align-items:center; border:1px solid rgba(249,115,22,0.2); border-radius:4px; overflow:hidden; }
        .cart-qty-btn { width:26px; height:26px; background:rgba(249,115,22,0.08); border:none; color:#F97316; font-size:14px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; }
        .cart-qty-btn:hover { background:rgba(249,115,22,0.18); }
        .cart-qty-input { width:36px; text-align:center; background:transparent; border:none; border-left:1px solid rgba(249,115,22,0.2); border-right:1px solid rgba(249,115,22,0.2); color:#F8F9FB; font-size:12px; font-weight:700; height:26px; outline:none; font-family:'Syne',sans-serif; -moz-appearance:textfield; }
        .cart-qty-input::-webkit-outer-spin-button,.cart-qty-input::-webkit-inner-spin-button { -webkit-appearance:none; }
        .cart-remove-btn { background:none; border:none; color:#7A8EA8; cursor:pointer; font-size:12px; padding:0; transition:color .15s; }
        .cart-remove-btn:hover { color:#F87171; }
        .cart-footer { border-top:1px solid rgba(249,115,22,0.12); padding:16px 20px; flex-shrink:0; background:rgba(11,36,71,0.3); }
        .cart-subtotal { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; font-size:12px; color:#7A8EA8; }
        .cart-subtotal-val { font-family:'Bebas Neue',sans-serif; font-size:1.3rem; color:#F97316; letter-spacing:.03em; }
        .cart-footer-note { font-size:10px; color:#7A8EA8; margin-bottom:12px; font-family:'Syne',sans-serif; letter-spacing:.06em; }
        .cart-checkout-btn { width:100%; padding:13px 0; background:#F97316; color:#0B2447; border:none; border-radius:6px; font-family:'Syne',sans-serif; font-weight:700; font-size:.78rem; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; transition:all .2s; margin-bottom:8px; }
        .cart-checkout-btn:hover { background:#FF9A45; transform:translateY(-1px); box-shadow:0 6px 20px rgba(249,115,22,0.4); }
        .cart-clear-btn { width:100%; padding:8px 0; background:transparent; border:1px solid rgba(248,113,113,0.2); border-radius:6px; color:#F87171; font-family:'Syne',sans-serif; font-size:.68rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; }
        .cart-clear-btn:hover { background:rgba(248,113,113,0.08); }
        @media(max-width:480px){ .cart-drawer { width:100vw; } }
      `}</style>
    </>
  );
}

