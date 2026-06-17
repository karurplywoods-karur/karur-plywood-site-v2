'use client';
// src/app/checkout/page.tsx
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/auth-client';
import { useCart } from '@/lib/CartContext';

interface Address {
  id: string; label: string; full_name: string; phone: string;
  line1: string; line2: string; city: string; state: string;
  pincode: string; google_map_link: string; latitude: number | null;
  longitude: number | null; is_default: boolean;
}

const STEPS = ['Delivery', 'Payment', 'Review'];

const STATUS_LABEL: Record<string, { color: string; label: string }> = {
  pending:    { color: '#F97316', label: 'Pending' },
  confirmed:  { color: '#25D366', label: 'Confirmed' },
  processing: { color: '#3B82F6', label: 'Processing' },
  shipped:    { color: '#A855F7', label: 'Shipped' },
  delivered:  { color: '#10B981', label: 'Delivered' },
  cancelled:  { color: '#EF4444', label: 'Cancelled' },
};

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

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = createClient();
  const { items, total, count, clear } = useCart();

  const [step,       setStep]       = useState(0);
  const [session,    setSession]    = useState<any>(null);
  const [addresses,  setAddresses]  = useState<Address[]>([]);
  const [selAddrId,  setSelAddrId]  = useState('');
  const [newAddr,    setNewAddr]    = useState(false);
  const [addrForm,   setAddrForm]   = useState({
    label: 'Home',
    full_name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
    google_map_link: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [payment,    setPayment]    = useState<'cod' | 'razorpay'>('cod');
  const [notes,      setNotes]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [locating,   setLocating]   = useState(false);
  const [locationMsg,setLocationMsg]= useState('');
  const [orderDone,  setOrderDone]  = useState<{ order_number: string; wa_url: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) router.push('/auth/login?next=/checkout');
    });
  }, []);

  useEffect(() => {
    if (!session) return;
    fetch('/api/addresses').then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        setAddresses(data);
        const def = data.find((a: Address) => a.is_default);
        if (def) setSelAddrId(def.id);
        else if (data.length === 0) setNewAddr(true);
      }
    });
  }, [session]);

  const setAddr = (k: string, v: string) => setAddrForm(f => ({ ...f, [k]: v }));

  const selectedAddress = addresses.find(a => a.id === selAddrId);

  const handleUseCurrentLocation = useCallback(() => {
    setError('');
    setLocationMsg('');

    if (!navigator.geolocation) {
      setError('Location access is not supported on this device.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        const mapLink = `https://www.google.com/maps?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`;
        setAddrForm(f => ({
          ...f,
          google_map_link: mapLink,
          latitude,
          longitude,
          city: f.city || 'Karur',
          state: f.state || 'Tamil Nadu',
        }));
        setLocationMsg('Current location added as a map link. Please complete door number, street and pincode.');
        setLocating(false);
      },
      () => {
        setError('Unable to access current location. Please allow location permission or enter the address manually.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  }, []);

  const saveNewAddress = async () => {
    const res = await fetch('/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...addrForm, is_default: addresses.length === 0 }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return false; }
    setAddresses(prev => [...prev, data]);
    setSelAddrId(data.id);
    setNewAddr(false);
    return true;
  };

  const handleNext = async () => {
    setError('');
    if (step === 0) {
      if (newAddr) {
        if (!addrForm.full_name || !addrForm.phone || !addrForm.line1 || !addrForm.city || !addrForm.pincode) {
          setError('Please fill all required address fields.'); return;
        }
        const ok = await saveNewAddress();
        if (!ok) return;
      } else if (!selAddrId) {
        setError('Please select a delivery address.'); return;
      }
    }
    if (step < 2) setStep(s => s + 1);
    else await handlePlaceOrder();
  };

  const handlePlaceOrder = async () => {
    setLoading(true); setError('');
    const addr = selectedAddress;
    if (!addr) { setError('No address selected.'); setLoading(false); return; }

    const orderItems = items.map(i => ({
      product_id:    i.product.id,
      variant_id:    i.variant?.id || null,
      variant_sku:   i.variant?.sku || '',
      variant_label: cartItemVariantLabel(i),
      product_name:  i.product.name,
      product_image: i.product.image_url || '',
      category_name: i.product.categories?.name || '',
      unit:          i.product.unit || '',
      unit_price:    cartItemPrice(i),
      quantity:      i.quantity,
    }));

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: addr, items: orderItems, payment_method: payment, notes }),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Order failed. Please try again.'); setLoading(false); return; }

    clear();
    setOrderDone({ order_number: data.order_number, wa_url: data.wa_url });
    setLoading(false);

    // Open WhatsApp for owner notification
    if (data.wa_url) {
      setTimeout(() => window.open(data.wa_url, '_blank'), 800);
    }
  };

  // ── ORDER SUCCESS ──
  if (orderDone) return (
    <div className="checkout-page">
      <div className="checkout-success">
        <div className="success-icon">✅</div>
        <h1 className="success-title">Order Placed!</h1>
        <div className="success-order-num">{orderDone.order_number}</div>
        <p className="success-msg">
          A confirmation email has been sent to you. Our team will contact you shortly to confirm delivery.
        </p>
        <div className="success-actions">
          <Link href="/account/orders" className="success-btn-primary">View My Orders</Link>
          <Link href="/products" className="success-btn-secondary">Continue Shopping</Link>
        </div>
        <div className="success-wa-note">
          💬 A WhatsApp notification was sent to our team about your order.
        </div>
      </div>
      <CheckoutStyles />
    </div>
  );

  // ── EMPTY CART ──
  if (count === 0 && !orderDone) return (
    <div className="checkout-page">
      <div className="checkout-empty">
        <div style={{ fontSize: 52, marginBottom: 16 }}>🛒</div>
        <h2 className="co-section-title">Your cart is empty</h2>
        <p style={{ color: '#7A8EA8', marginBottom: 24 }}>Add some products before checking out.</p>
        <Link href="/products" className="co-btn-primary">Browse Products</Link>
      </div>
      <CheckoutStyles />
    </div>
  );

  return (
    <div className="checkout-page">
      <div className="checkout-inner">

        {/* Steps */}
        <div className="co-steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`co-step${i === step ? ' co-step--active' : i < step ? ' co-step--done' : ''}`}>
              <div className="co-step-num">{i < step ? '✓' : i + 1}</div>
              <div className="co-step-label">{s}</div>
              {i < STEPS.length - 1 && <div className="co-step-line" />}
            </div>
          ))}
        </div>

        <div className="co-layout">

          {/* ── LEFT: STEP CONTENT ── */}
          <div className="co-main">

            {/* STEP 0 — DELIVERY ADDRESS */}
            {step === 0 && (
              <div className="co-section">
                <div className="co-section-title">Delivery Address</div>

                {!newAddr && (
                  <div className="addr-list">
                    {addresses.length > 0 ? addresses.map(a => (
                      <div key={a.id}
                        onClick={() => setSelAddrId(a.id)}
                        className={`addr-card${selAddrId === a.id ? ' addr-card--selected' : ''}`}>
                        <div className="addr-radio">
                          <div className={`addr-radio-dot${selAddrId === a.id ? ' active' : ''}`} />
                        </div>
                        <div className="addr-info">
                          <div className="addr-label-row">
                            <span className="addr-label-badge">{a.label}</span>
                            {a.is_default && <span className="addr-default-badge">Default</span>}
                          </div>
                          <div className="addr-name">{a.full_name}</div>
                          <div className="addr-text">
                            {a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />
                            {a.google_map_link && (
                              <>
                                <a href={a.google_map_link} target="_blank" rel="noopener" className="review-map-link">View Map Location</a><br />
                              </>
                            )}
                            {a.city}, {a.state} — {a.pincode}
                          </div>
                          <div className="addr-phone">📞 {a.phone}</div>
                        </div>
                      </div>
                    )) : (
                      <div className="addr-empty-box">
                        <div className="addr-empty-title">No saved delivery address</div>
                        <p>Add a new address here, or manage saved addresses from your account.</p>
                      </div>
                    )}
                    <div className="addr-actions-row">
                      <button onClick={() => { setNewAddr(true); setError(''); }} className="addr-add-btn">
                        + Add New Address
                      </button>
                      <Link href="/account/addresses" className="addr-manage-link">
                        Manage Addresses
                      </Link>
                    </div>
                  </div>
                )}

                {newAddr && (
                  <div className="co-form">
                    {addresses.length > 0 && (
                      <button onClick={() => setNewAddr(false)} className="co-back-link">← Use saved address</button>
                    )}
                    <div className="location-card">
                      <div>
                        <div className="location-title">Add current location</div>
                        <p>We will save a Google Maps link with this address for delivery guidance.</p>
                      </div>
                      <button type="button" onClick={handleUseCurrentLocation} disabled={locating} className="location-btn">
                        {locating ? 'Locating...' : 'Use Current Location'}
                      </button>
                    </div>
                    {locationMsg && <div className="co-info">{locationMsg}</div>}
                    {addrForm.google_map_link && (
                      <a href={addrForm.google_map_link} target="_blank" rel="noopener" className="map-preview-link">
                        Open captured location in Google Maps
                      </a>
                    )}
                    <div className="co-form-row">
                      <div className="co-field">
                        <label className="co-label">Label</label>
                        <select className="co-inp" value={addrForm.label} onChange={e => setAddr('label', e.target.value)}>
                          {['Home', 'Office', 'Site', 'Other'].map(l => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                      <div className="co-field">
                        <label className="co-label">Full Name *</label>
                        <input className="co-inp" placeholder="Rajan Kumar" value={addrForm.full_name} onChange={e => setAddr('full_name', e.target.value)} />
                      </div>
                    </div>
                    <div className="co-field">
                      <label className="co-label">Phone Number *</label>
                      <input className="co-inp" placeholder="+91 98765 43210" value={addrForm.phone} onChange={e => setAddr('phone', e.target.value)} />
                    </div>
                    <div className="co-field">
                      <label className="co-label">Door No., Street *</label>
                      <input className="co-inp" placeholder="12A, Main Road" value={addrForm.line1} onChange={e => setAddr('line1', e.target.value)} />
                    </div>
                    <div className="co-field">
                      <label className="co-label">Area / Landmark</label>
                      <input className="co-inp" placeholder="Near Bus Stand" value={addrForm.line2} onChange={e => setAddr('line2', e.target.value)} />
                    </div>
                    <div className="co-form-row">
                      <div className="co-field">
                        <label className="co-label">City *</label>
                        <input className="co-inp" placeholder="Karur" value={addrForm.city} onChange={e => setAddr('city', e.target.value)} />
                      </div>
                      <div className="co-field">
                        <label className="co-label">Pincode *</label>
                        <input className="co-inp" placeholder="639001" value={addrForm.pincode} onChange={e => setAddr('pincode', e.target.value)} />
                      </div>
                    </div>
                    <div className="co-field">
                      <label className="co-label">State</label>
                      <input className="co-inp" value={addrForm.state} onChange={e => setAddr('state', e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 1 — PAYMENT */}
            {step === 1 && (
              <div className="co-section">
                <div className="co-section-title">Payment Method</div>
                <div className="payment-options">
                  <div onClick={() => setPayment('cod')} className={`payment-card${payment === 'cod' ? ' payment-card--selected' : ''}`}>
                    <div className="payment-radio"><div className={`addr-radio-dot${payment === 'cod' ? ' active' : ''}`} /></div>
                    <div className="payment-icon">💵</div>
                    <div>
                      <div className="payment-name">Cash on Delivery</div>
                      <div className="payment-sub">Pay when your order arrives. No upfront payment needed.</div>
                    </div>
                  </div>
                  <div onClick={() => setPayment('razorpay')} className={`payment-card${payment === 'razorpay' ? ' payment-card--selected' : ''}`}>
                    <div className="payment-radio"><div className={`addr-radio-dot${payment === 'razorpay' ? ' active' : ''}`} /></div>
                    <div className="payment-icon">💳</div>
                    <div>
                      <div className="payment-name">Pay Online</div>
                      <div className="payment-sub">UPI, Cards, Net Banking via Razorpay. Secure & instant.</div>
                    </div>
                  </div>
                </div>
                <div className="co-field" style={{ marginTop: 20 }}>
                  <label className="co-label">Order Notes (optional)</label>
                  <textarea className="co-inp" rows={3} style={{ resize: 'none' }}
                    placeholder="e.g. Please call before delivery. Need items by Tuesday."
                    value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
              </div>
            )}

            {/* STEP 2 — REVIEW */}
            {step === 2 && (
              <div className="co-section">
                <div className="co-section-title">Review Your Order</div>

                {/* Address summary */}
                {selectedAddress && (
                  <div className="review-block">
                    <div className="review-block-label">Delivering to</div>
                    <div className="review-addr">
                      <strong>{selectedAddress.full_name}</strong><br />
                      {selectedAddress.line1}{selectedAddress.line2 ? `, ${selectedAddress.line2}` : ''}<br />
                      {selectedAddress.city}, {selectedAddress.state} — {selectedAddress.pincode}<br />
                      📞 {selectedAddress.phone}
                    </div>
                    {selectedAddress.google_map_link && (
                      <a href={selectedAddress.google_map_link} target="_blank" rel="noopener" className="review-map-link">View Map Location</a>
                    )}
                    <button onClick={() => setStep(0)} className="review-edit-btn">Edit</button>
                  </div>
                )}

                {/* Payment summary */}
                <div className="review-block">
                  <div className="review-block-label">Payment</div>
                  <div className="review-payment">
                    {payment === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment (Razorpay)'}
                  </div>
                  <button onClick={() => setStep(1)} className="review-edit-btn">Edit</button>
                </div>

                {/* Items */}
                <div className="review-block">
                  <div className="review-block-label">Items ({count})</div>
                  {items.map(i => (
                    <div key={cartItemKey(i)} className="review-item">
                      <span className="review-item-name">
                        {i.product.name}
                        {cartItemVariantLabel(i) && <small className="review-item-variant">{cartItemVariantLabel(i)}</small>}
                      </span>
                      <span className="review-item-qty">× {i.quantity}</span>
                      <span className="review-item-price">
                        {cartItemPrice(i) ? `₹${(cartItemPrice(i) * i.quantity).toLocaleString('en-IN')}` : '—'}
                      </span>
                    </div>
                  ))}
                </div>

                {notes && (
                  <div className="review-block">
                    <div className="review-block-label">Your Notes</div>
                    <div style={{ fontSize: 13, color: '#7A8EA8', fontStyle: 'italic' }}>{notes}</div>
                  </div>
                )}
              </div>
            )}

            {error && <div className="co-error">{error}</div>}

            {/* Navigation */}
            <div className="co-nav">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} className="co-btn-back">← Back</button>
              )}
              <button onClick={handleNext} disabled={loading} className="co-btn-primary">
                {loading ? '⏳ Placing order...' :
                  step < 2 ? 'Continue →' : '✓ Place Order'}
              </button>
            </div>
          </div>

          {/* ── RIGHT: ORDER SUMMARY ── */}
          <div className="co-summary">
            <div className="co-summary-title">Order Summary</div>
            <div className="co-summary-items">
              {items.map(i => (
                <div key={cartItemKey(i)} className="co-summary-item">
                  <div className="co-summary-item-name">
                    {i.product.name}
                    {cartItemVariantLabel(i) && <small className="co-summary-item-variant">{cartItemVariantLabel(i)}</small>}
                    <span className="co-summary-item-qty"> × {i.quantity}</span>
                  </div>
                  <div className="co-summary-item-price">
                    {cartItemPrice(i)
                      ? `₹${(cartItemPrice(i) * i.quantity).toLocaleString('en-IN')}`
                      : '—'}
                  </div>
                </div>
              ))}
            </div>
            <div className="co-summary-totals">
              <div className="co-summary-row">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="co-summary-row">
                <span>Delivery</span>
                <span style={{ color: '#4ADE80' }}>To be confirmed</span>
              </div>
              <div className="co-summary-total">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="co-summary-note">
              🔒 Secure checkout · Delivery confirmed by our team
            </div>
          </div>
        </div>
      </div>
      <CheckoutStyles />
    </div>
  );
}

function CheckoutStyles() {
  return <style>{`
    .checkout-page { min-height:100vh; background:#070F1F; padding: 80px 0 60px; }
    .checkout-inner { max-width:1100px; margin:0 auto; padding:32px 48px; }
    .checkout-success { max-width:500px; margin:80px auto; text-align:center; background:rgba(25,55,109,0.3); border:1px solid rgba(249,115,22,0.2); border-radius:14px; padding:48px 36px; }
    .checkout-empty { max-width:400px; margin:100px auto; text-align:center; }
    .success-icon { font-size:56px; margin-bottom:16px; }
    .success-title { font-family:'Bebas Neue',sans-serif; font-size:2rem; letter-spacing:.05em; color:#F8F9FB; margin-bottom:8px; }
    .success-order-num { font-family:'Bebas Neue',sans-serif; font-size:1.6rem; color:#F97316; margin-bottom:14px; }
    .success-msg { font-size:14px; color:#7A8EA8; line-height:1.7; margin-bottom:28px; }
    .success-actions { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-bottom:20px; }
    .success-btn-primary { padding:12px 24px; background:#F97316; color:#0B2447; border-radius:6px; font-family:'Syne',sans-serif; font-weight:700; font-size:.78rem; letter-spacing:.1em; text-transform:uppercase; text-decoration:none; }
    .success-btn-secondary { padding:12px 24px; border:1px solid rgba(249,115,22,0.3); color:#F97316; border-radius:6px; font-family:'Syne',sans-serif; font-weight:700; font-size:.78rem; letter-spacing:.1em; text-transform:uppercase; text-decoration:none; }
    .success-wa-note { font-size:12px; color:#7A8EA8; background:rgba(37,211,102,0.08); border:1px solid rgba(37,211,102,0.15); border-radius:6px; padding:10px 14px; }

    .co-steps { display:flex; align-items:center; justify-content:center; margin-bottom:36px; gap:0; }
    .co-step { display:flex; align-items:center; gap:8px; }
    .co-step-num { width:28px; height:28px; border-radius:50%; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-size:11px; font-weight:700; color:#7A8EA8; }
    .co-step--active .co-step-num { background:#F97316; border-color:#F97316; color:#0B2447; }
    .co-step--done .co-step-num { background:rgba(37,211,102,0.2); border-color:#4ADE80; color:#4ADE80; }
    .co-step-label { font-family:'Syne',sans-serif; font-size:.68rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#7A8EA8; }
    .co-step--active .co-step-label { color:#F8F9FB; }
    .co-step--done .co-step-label { color:#4ADE80; }
    .co-step-line { width:40px; height:1px; background:rgba(255,255,255,0.1); margin:0 12px; }

    .co-layout { display:grid; grid-template-columns:1fr 340px; gap:28px; align-items:start; }
    .co-section { background:rgba(25,55,109,0.25); border:1px solid rgba(249,115,22,0.12); border-radius:10px; padding:24px; margin-bottom:16px; }
    .co-section-title { font-family:'Syne',sans-serif; font-size:.75rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:#F97316; margin-bottom:18px; }
    .co-form { display:flex; flex-direction:column; gap:14px; }
    .co-form-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .co-field { display:flex; flex-direction:column; gap:5px; }
    .co-label { font-family:'Syne',sans-serif; font-size:.6rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#7A8EA8; }
    .co-inp { background:rgba(7,15,31,0.6); border:1px solid rgba(249,115,22,0.15); border-radius:6px; padding:10px 13px; font-size:14px; color:#F8F9FB; font-family:'DM Sans',sans-serif; outline:none; transition:border-color .2s; width:100%; }
    .co-inp:focus { border-color:#F97316; }
    .co-inp::placeholder { color:#7A8EA8; }
    .co-back-link { background:none; border:none; color:#F97316; font-size:12px; font-family:'Syne',sans-serif; cursor:pointer; margin-bottom:12px; padding:0; }
    .co-info { background:rgba(37,211,102,0.08); border:1px solid rgba(37,211,102,0.2); border-radius:6px; padding:10px 14px; font-size:13px; color:#4ADE80; }
    .map-preview-link, .review-map-link { display:inline-flex; align-items:center; width:max-content; color:#4ADE80; font-family:'Syne',sans-serif; font-size:.68rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; text-decoration:none; }
    .map-preview-link:hover, .review-map-link:hover { color:#25D366; text-decoration:underline; }

    .addr-list { display:flex; flex-direction:column; gap:10px; }
    .addr-empty-box { background:rgba(7,15,31,0.35); border:1px dashed rgba(249,115,22,0.25); border-radius:8px; padding:22px; text-align:center; }
    .addr-empty-title { font-family:'Syne',sans-serif; font-size:.78rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#F8F9FB; margin-bottom:8px; }
    .addr-empty-box p { font-size:13px; color:#7A8EA8; line-height:1.6; }
    .addr-actions-row { display:grid; grid-template-columns:1fr auto; gap:10px; align-items:stretch; }
    .addr-card { display:flex; gap:14px; align-items:flex-start; padding:16px; border:1px solid rgba(249,115,22,0.12); border-radius:8px; cursor:pointer; transition:border-color .2s; background:rgba(7,15,31,0.3); }
    .addr-card--selected { border-color:#F97316; background:rgba(249,115,22,0.05); }
    .addr-radio { width:18px; height:18px; border-radius:50%; border:2px solid rgba(249,115,22,0.3); display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:2px; }
    .addr-radio-dot { width:8px; height:8px; border-radius:50%; background:transparent; transition:background .15s; }
    .addr-radio-dot.active { background:#F97316; }
    .addr-info { flex:1; }
    .addr-label-row { display:flex; gap:6px; margin-bottom:4px; }
    .addr-label-badge { font-family:'Syne',sans-serif; font-size:9px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; background:rgba(249,115,22,0.1); color:#F97316; border:1px solid rgba(249,115,22,0.2); padding:2px 7px; border-radius:2px; }
    .addr-default-badge { font-family:'Syne',sans-serif; font-size:9px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; background:rgba(37,211,102,0.1); color:#4ADE80; border:1px solid rgba(37,211,102,0.2); padding:2px 7px; border-radius:2px; }
    .addr-name { font-weight:700; color:#F8F9FB; font-size:14px; margin-bottom:3px; }
    .addr-text { font-size:13px; color:#7A8EA8; line-height:1.6; margin-bottom:3px; }
    .addr-phone { font-size:12px; color:#7A8EA8; }
    .addr-add-btn { padding:10px 0; background:transparent; border:1px dashed rgba(249,115,22,0.3); border-radius:6px; color:#F97316; font-family:'Syne',sans-serif; font-size:.7rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; width:100%; transition:all .2s; }
    .addr-add-btn:hover { background:rgba(249,115,22,0.06); border-style:solid; }
    .addr-manage-link { display:flex; align-items:center; justify-content:center; padding:10px 16px; border:1px solid rgba(249,115,22,0.2); border-radius:6px; color:#7A8EA8; font-family:'Syne',sans-serif; font-size:.68rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; text-decoration:none; white-space:nowrap; }
    .addr-manage-link:hover { border-color:#F97316; color:#F97316; }

    .location-card { display:flex; align-items:center; justify-content:space-between; gap:16px; background:rgba(37,211,102,0.06); border:1px solid rgba(37,211,102,0.16); border-radius:8px; padding:14px 16px; }
    .location-title { font-family:'Syne',sans-serif; font-size:.72rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#4ADE80; margin-bottom:4px; }
    .location-card p { font-size:12px; color:#7A8EA8; line-height:1.5; }
    .location-btn { flex-shrink:0; padding:9px 14px; border:none; border-radius:6px; background:#25D366; color:white; font-family:'Syne',sans-serif; font-size:.68rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; cursor:pointer; }
    .location-btn:disabled { opacity:.65; cursor:not-allowed; }

    .payment-options { display:flex; flex-direction:column; gap:10px; }
    .payment-card { display:flex; gap:14px; align-items:center; padding:16px; border:1px solid rgba(249,115,22,0.12); border-radius:8px; cursor:pointer; transition:border-color .2s; background:rgba(7,15,31,0.3); }
    .payment-card--selected { border-color:#F97316; background:rgba(249,115,22,0.05); }
    .payment-radio { width:18px; height:18px; border-radius:50%; border:2px solid rgba(249,115,22,0.3); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .payment-icon { font-size:24px; flex-shrink:0; }
    .payment-name { font-family:'Syne',sans-serif; font-size:.82rem; font-weight:700; color:#F8F9FB; margin-bottom:3px; }
    .payment-sub { font-size:12px; color:#7A8EA8; line-height:1.5; }

    .review-block { background:rgba(7,15,31,0.4); border:1px solid rgba(249,115,22,0.08); border-radius:6px; padding:14px 16px; margin-bottom:10px; position:relative; }
    .review-block-label { font-family:'Syne',sans-serif; font-size:.6rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:#F97316; margin-bottom:8px; }
    .review-addr { font-size:13px; color:#A8BCCC; line-height:1.75; }
    .review-payment { font-size:14px; color:#F8F9FB; }
    .review-edit-btn { position:absolute; top:12px; right:12px; background:none; border:1px solid rgba(249,115,22,0.2); border-radius:4px; color:#F97316; font-size:11px; font-family:'Syne',sans-serif; font-weight:700; padding:4px 10px; cursor:pointer; }
    .review-item { display:flex; align-items:center; padding:7px 0; border-bottom:1px solid rgba(249,115,22,0.06); font-size:13px; }
    .review-item:last-child { border-bottom:none; }
    .review-item-name { flex:1; color:#A8BCCC; }
    .review-item-variant, .co-summary-item-variant { display:block; margin-top:2px; font-size:11px; color:#7A8EA8; font-family:'DM Sans',sans-serif; font-weight:500; }
    .review-item-qty { color:#7A8EA8; margin-right:12px; font-size:12px; }
    .review-item-price { color:#F97316; font-weight:700; font-family:'Syne',sans-serif; min-width:80px; text-align:right; }

    .co-error { background:rgba(248,113,113,0.1); border:1px solid rgba(248,113,113,0.2); border-radius:6px; padding:10px 14px; font-size:13px; color:#FCA5A5; margin-bottom:14px; }
    .co-nav { display:flex; gap:12px; }
    .co-btn-back { padding:12px 20px; background:transparent; border:1px solid rgba(249,115,22,0.2); border-radius:6px; color:#7A8EA8; font-family:'Syne',sans-serif; font-size:.72rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; transition:all .2s; }
    .co-btn-back:hover { border-color:#F97316; color:#F97316; }
    .co-btn-primary { flex:1; padding:13px 0; background:#F97316; color:#0B2447; border:none; border-radius:6px; font-family:'Syne',sans-serif; font-weight:700; font-size:.82rem; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; transition:all .2s; text-decoration:none; text-align:center; display:block; }
    .co-btn-primary:hover:not(:disabled) { background:#FF9A45; transform:translateY(-1px); }
    .co-btn-primary:disabled { opacity:.6; cursor:not-allowed; }

    .co-summary { background:rgba(25,55,109,0.25); border:1px solid rgba(249,115,22,0.12); border-radius:10px; padding:22px; position:sticky; top:80px; }
    .co-summary-title { font-family:'Syne',sans-serif; font-size:.72rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:#F97316; margin-bottom:16px; }
    .co-summary-items { display:flex; flex-direction:column; gap:8px; margin-bottom:16px; }
    .co-summary-item { display:flex; justify-content:space-between; align-items:flex-start; gap:8px; }
    .co-summary-item-name { font-size:13px; color:#A8BCCC; flex:1; line-height:1.4; }
    .co-summary-item-qty { font-size:12px; color:#7A8EA8; }
    .co-summary-item-price { font-size:13px; font-weight:700; color:#F8F9FB; white-space:nowrap; }
    .co-summary-totals { border-top:1px solid rgba(249,115,22,0.1); padding-top:14px; display:flex; flex-direction:column; gap:8px; margin-bottom:14px; }
    .co-summary-row { display:flex; justify-content:space-between; font-size:13px; color:#7A8EA8; }
    .co-summary-total { display:flex; justify-content:space-between; font-family:'Syne',sans-serif; font-weight:700; font-size:1rem; color:#F8F9FB; border-top:1px solid rgba(249,115,22,0.15); padding-top:12px; margin-top:4px; }
    .co-summary-note { font-size:11px; color:#7A8EA8; text-align:center; font-family:'Syne',sans-serif; }

    @media(max-width:900px){
      .checkout-inner { padding:24px 20px !important; }
      .co-layout { grid-template-columns:1fr !important; }
      .co-summary { position:static !important; order:-1; }
      .co-form-row { grid-template-columns:1fr !important; }
      .addr-actions-row { grid-template-columns:1fr !important; }
      .location-card { align-items:stretch; flex-direction:column; }
    }
    select option { background:#0d1f3a; }
  `}</style>;
}
