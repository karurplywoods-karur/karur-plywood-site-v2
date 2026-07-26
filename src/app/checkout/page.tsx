'use client';
// src/app/checkout/page.tsx
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/auth-client';
import { useCart } from '@/lib/CartContext';
import { trackPurchase } from '@/lib/analytics';
import { CONTACT } from '@/lib/contact';
import ProductCard from '@/components/ProductCard';

interface Address {
  id: string; label: string; full_name: string; phone: string;
  line1: string; line2: string; city: string; state: string;
  pincode: string; google_map_link: string; latitude: number | null;
  longitude: number | null; is_default: boolean;
}

const STEPS = ['Shipping Address', 'Shipping Method', 'Payment', 'Review & Confirm'];
const SHIPPING_METHODS = [
  { key: 'standard', label: 'Standard Delivery', sub: '3-5 Business Days', cost: 0, icon: '🚚' },
  { key: 'express',  label: 'Express Delivery',  sub: '1-2 Business Days', cost: 299, icon: '⚡' },
  { key: 'pickup',   label: 'Store Pickup',      sub: 'Same Day',          cost: 0, icon: '🏬' },
] as const;

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

const PAY_DISPLAY_TO_METHOD: Record<string, 'cod' | 'razorpay'> = {
  upi: 'razorpay', card: 'razorpay', netbanking: 'razorpay', cod: 'cod',
};

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
  const [payDisplay, setPayDisplay] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'pickup'>('standard');
  const [notes,      setNotes]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [locating,   setLocating]   = useState(false);
  const [locationMsg,setLocationMsg]= useState('');
  const [orderDone,  setOrderDone]  = useState<{ order_id: string; order_number: string; wa_url: string } | null>(null);
  const [fullOrder,  setFullOrder]  = useState<any>(null);
  const [related,    setRelated]    = useState<any[]>([]);
  const [couponCode,    setCouponCode]    = useState('');
  const [couponResult,  setCouponResult]  = useState<{ discount_amount: number; description: string; coupon_code: string } | null>(null);
  const [couponError,   setCouponError]   = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

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
    if (step < 3) setStep(s => s + 1);
    else await handlePlaceOrder();
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError(''); setCouponLoading(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), cart_total: total }),
      });
      const data = await res.json();
      if (!res.ok) { setCouponError(data.error || 'Invalid coupon.'); return; }
      setCouponResult({ discount_amount: data.discount_amount, description: data.description, coupon_code: data.coupon_code });
    } catch { setCouponError('Could not apply coupon. Try again.'); }
    finally { setCouponLoading(false); }
  };

  const removeCoupon = () => { setCouponResult(null); setCouponCode(''); setCouponError(''); };

  const shippingCost = SHIPPING_METHODS.find(m => m.key === shippingMethod)?.cost || 0;
  const grandTotal = (couponResult ? total - couponResult.discount_amount : total) + shippingCost;
  const orderTotalDisplay = fullOrder?.total ?? grandTotal;

  // Any item sourced from a distributor / special order must go through the
  // Reserve Order flow — verification before payment, never Buy Now.
  const cartNeedsReserve = items.some(i =>
    i.product.fulfillment_type === 'DISTRIBUTOR' || i.product.fulfillment_type === 'SPECIAL_ORDER' || i.product.verification_required
  );

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

    const endpoint = cartNeedsReserve ? '/api/orders/reserve' : '/api/checkout';
    const body = cartNeedsReserve
      ? { address: addr, items: orderItems, notes }
      : { address: addr, items: orderItems, payment_method: payment, shipping_method: shippingMethod, shipping_cost: shippingCost, notes, coupon_code: couponResult?.coupon_code || null };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Order failed. Please try again.'); setLoading(false); return; }

    clear();
    setOrderDone({ order_id: data.order_id, order_number: data.order_number, wa_url: data.wa_url });
    setLoading(false);
    fetch(`/api/orders/${data.order_id}`).then(r => r.json()).then(o => !o.error && setFullOrder(o));
    fetch('/api/products?limit=5').then(r => r.json()).then(p => setRelated(Array.isArray(p) ? p.slice(0, 5) : []));

    // Fire GA4 purchase event only for real, paid-or-COD-confirmed orders.
    // A reservation isn't a completed purchase yet — no payment has been
    // taken — so it's tracked separately (not as a conversion) to keep GA4
    // revenue numbers accurate.
    if (!cartNeedsReserve) {
      trackPurchase({
        order_number: data.order_number,
        value: grandTotal,
        payment_method: payment,
        items: items.map((i) => ({
          product_id: i.product.id,
          product_name: i.product.name,
          category: i.product.categories?.name,
          price: cartItemPrice(i),
          quantity: i.quantity,
        })),
      });
    }

    // Open WhatsApp for owner notification
    if (data.wa_url) {
      setTimeout(() => window.open(data.wa_url, '_blank'), 800);
    }
  };

  // ── ORDER SUCCESS ──
  if (orderDone) return (
    <div style={{ minHeight: '100vh', background: '#FAF8F5', paddingTop: 58 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 48px 60px' }} className="os-pad">

        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>
          <Link href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Home</Link> › <span style={{ color: '#9CA3AF' }}>Checkout</span> › <span style={{ color: '#F07316', fontWeight: 600 }}>Order Success</span>
        </div>

        {/* Hero banner */}
        <div className="os-hero">
          <div className="os-hero-icon">{cartNeedsReserve ? '🙏' : '✅'}</div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(1.4rem,2.6vw,1.8rem)', fontWeight: 700, color: '#0B2447', margin: '0 0 6px' }}>
              {cartNeedsReserve ? 'Thank You For Reserving!' : 'Thank You!'}
            </h1>
            <div style={{ fontSize: 15, color: cartNeedsReserve ? '#F07316' : '#16a34a', fontWeight: 700, marginBottom: 6 }}>
              {cartNeedsReserve ? "We're Verifying Availability" : 'Your Order Has Been Placed Successfully'}
            </div>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
              {cartNeedsReserve
                ? "You'll receive confirmation within 15 minutes during business hours. No payment has been taken yet — we'll send a secure payment link only after confirming stock."
                : "Your order has been received and is being processed. We've sent the order details to your email and WhatsApp."}
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
              <Link href="/products" className="os-btn-primary">Continue Shopping →</Link>
              <Link href={`/account/orders/${orderDone.order_id}`} className="os-btn-outline">📦 Track Your Order</Link>
            </div>
          </div>
          <div className="os-hero-confirm">
            <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, color: cartNeedsReserve ? '#F07316' : '#16a34a', fontSize: 13, marginBottom: 10 }}>
              {cartNeedsReserve ? 'Reservation Received!' : 'Order Confirmed!'}
            </div>
            <div className="os-label">Order ID</div>
            <div className="os-val" style={{ marginBottom: 8 }}>{orderDone.order_number}</div>
            {fullOrder && (
              <>
                <div className="os-label">Order Date</div>
                <div className="os-val" style={{ marginBottom: 8, fontWeight: 600 }}>{new Date(fullOrder.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                <div className="os-label">{cartNeedsReserve ? 'Payment' : 'Payment Method'}</div>
                <div className="os-val" style={{ fontWeight: 600 }}>
                  {cartNeedsReserve ? 'Requested after confirmation' : (fullOrder.payment_method === 'cod' ? 'Cash on Delivery' : 'Paid Online')}
                </div>
              </>
            )}
            <div style={{ fontSize: 11, color: '#16a34a', marginTop: 12, display: 'flex', gap: 6, alignItems: 'center' }}>🔒 Secured with 256-bit encryption</div>
          </div>
        </div>

        <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#0B2447', margin: '28px 0 16px' }}>Order Summary</h2>

        <div className="os-grid">
          <div>
            <div className="os-card" style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 18 }}>
              <div><div className="os-label">Estimated Delivery</div><div className="os-val">{fullOrder?.estimated_delivery || '3-5 business days'}</div><div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, marginTop: 2 }}>Standard Delivery</div></div>
              {fullOrder && (
                <div>
                  <div className="os-label">Delivery Address</div>
                  <div style={{ fontSize: 12.5, color: '#374151' }}>{fullOrder.delivery_name}<br />{fullOrder.delivery_line1}<br />{fullOrder.delivery_city} — {fullOrder.delivery_pincode}<br />📞 {fullOrder.delivery_phone}</div>
                </div>
              )}
              <div><div className="os-label">Total Amount</div><div className="os-val" style={{ color: '#F07316', fontSize: 20 }}>₹{orderTotalDisplay.toLocaleString('en-IN')}</div></div>
            </div>

            {fullOrder && (
              <div className="os-card" style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, color: '#0B2447', marginBottom: 14 }}>Order Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, fontSize: 13 }}>
                  <div><span style={{ color: '#9CA3AF' }}>Order ID: </span><span style={{ fontWeight: 700, color: '#0B2447' }}>{fullOrder.order_number}</span></div>
                  <div><span style={{ color: '#9CA3AF' }}>Payment Status: </span><span style={{ fontWeight: 700, color: fullOrder.payment_status === 'paid' ? '#16a34a' : '#F07316' }}>{fullOrder.payment_status === 'paid' ? 'Paid' : 'Pending'}</span></div>
                  <div><span style={{ color: '#9CA3AF' }}>Shipping Method: </span><span style={{ fontWeight: 700, color: '#0B2447' }}>Standard Delivery</span></div>
                </div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 12 }}>A confirmation email has been sent to your registered email address.</div>
              </div>
            )}

            {/* What happens next */}
            <div className="os-card">
              <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, color: '#0B2447', marginBottom: 18 }}>What Happens Next?</div>
              <div className="os-next-grid">
                {[
                  { icon: '✓', t: 'Order Confirmed', d: "We've received your order" },
                  { icon: '📦', t: 'Processing', d: "We're preparing your order" },
                  { icon: '🚚', t: 'Shipped', d: 'Your order is on the way' },
                  { icon: '🏠', t: 'Delivered', d: 'Enjoy your purchase!' },
                ].map((s, i) => (
                  <div key={s.t} className="os-next-item">
                    <div className="os-next-icon" style={{ opacity: i === 0 ? 1 : 0.5 }}>{s.icon}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 12.5, color: '#0B2447' }}>{s.t}</div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>{s.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — items */}
          <aside>
            <div className="os-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, color: '#0B2447' }}>Order Items {fullOrder ? `(${fullOrder.order_items?.length || 0})` : ''}</div>
                <Link href={`/account/orders/${orderDone.order_id}`} style={{ fontSize: 11.5, color: '#F07316', fontWeight: 700, textDecoration: 'none' }}>Edit Cart</Link>
              </div>
              {fullOrder ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                    {fullOrder.order_items?.map((item: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 12.5, color: '#0B2447', fontWeight: 600 }}>{item.product_name}</div>
                          {item.variant_label && <div style={{ fontSize: 11, color: '#9CA3AF' }}>{item.variant_label}</div>}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0B2447', whiteSpace: 'nowrap' }}>₹{item.line_total?.toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: '1px solid #E5E1DC', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280' }}><span>Subtotal ({fullOrder.order_items?.length || 0} Items)</span><span>₹{fullOrder.subtotal?.toLocaleString('en-IN')}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280' }}><span>Shipping</span><span style={{ color: fullOrder.delivery_charge ? '#0B2447' : '#16a34a' }}>{fullOrder.delivery_charge ? `₹${fullOrder.delivery_charge}` : 'Free'}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280' }}><span>GST (18%)</span><span>Included</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 15, color: '#0B2447', borderTop: '1px solid #E5E1DC', paddingTop: 8 }}><span>Total Amount</span><span>₹{fullOrder.total?.toLocaleString('en-IN')}</span></div>
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: '#9CA3AF' }}>Loading items…</div>
              )}
            </div>
          </aside>
        </div>

        {/* You may also like */}
        {related.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#0B2447', marginBottom: 16 }}>You May Also Like</h2>
            <div className="os-related-grid">
              {related.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .os-hero { display: flex; gap: 24px; align-items: flex-start; background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 14px; padding: 28px; flex-wrap: wrap; }
        .os-hero-icon { width: 56px; height: 56px; border-radius: 50%; background: #f0fdf4; border: 1px solid #bbf7d0; display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0; }
        .os-btn-primary { display: inline-flex; align-items: center; padding: 11px 22px; background: #F07316; color: #FFFFFF; border-radius: 6px; font-family: 'Inter',sans-serif; font-weight: 700; font-size: 12.5px; text-decoration: none; }
        .os-btn-outline { display: inline-flex; align-items: center; gap: 6px; padding: 11px 22px; border: 1px solid #E5E1DC; border-radius: 6px; color: #0B2447; font-family: 'Inter',sans-serif; font-weight: 700; font-size: 12.5px; text-decoration: none; }
        .os-hero-confirm { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 18px 20px; min-width: 220px; }
        .os-label { font-size: 10.5px; color: #9CA3AF; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 2px; }
        .os-val { font-size: 15px; color: #0B2447; font-weight: 700; font-family: 'Inter',sans-serif; }
        .os-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; align-items: start; }
        .os-card { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; padding: 20px; box-shadow: 0 1px 4px rgba(11,36,71,0.05); }
        .os-next-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; text-align: center; }
        .os-next-icon { width: 40px; height: 40px; border-radius: 50%; background: #FFF4ED; display: flex; align-items: center; justify-content: center; font-size: 18px; margin: 0 auto 8px; }
        .os-related-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 16px; }
        @media(max-width:900px){ .os-grid { grid-template-columns: 1fr !important; } .os-next-grid { grid-template-columns: 1fr 1fr !important; row-gap: 20px; } .os-related-grid { grid-template-columns: repeat(3,1fr) !important; } }
        @media(max-width:640px){ .os-pad { padding-left: 16px !important; padding-right: 16px !important; } .os-related-grid { grid-template-columns: repeat(2,1fr) !important; } }
      `}</style>
    </div>
  );

  // ── EMPTY CART ──
  if (count === 0 && !orderDone) return (
    <div className="checkout-page">
      <div className="checkout-empty">
        <div style={{ fontSize: 52, marginBottom: 16 }}>🛒</div>
        <h2 className="co-section-title">Your cart is empty</h2>
        <p style={{ color: '#6B7280', marginBottom: 24 }}>Add some products before checking out.</p>
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

            {/* STEP 1 — SHIPPING METHOD */}
            {step === 1 && (
              <div className="co-section">
                <div className="co-section-title">Shipping Method</div>
                <div className="payment-options">
                  {SHIPPING_METHODS.map(m => (
                    <div key={m.key} onClick={() => setShippingMethod(m.key)}
                      className={`payment-card${shippingMethod === m.key ? ' payment-card--selected' : ''}`}>
                      <div className="payment-radio"><div className={`addr-radio-dot${shippingMethod === m.key ? ' active' : ''}`} /></div>
                      <div className="payment-icon">{m.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div className="payment-name">{m.label}</div>
                        <div className="payment-sub">{m.sub}{m.key === 'standard' ? ' · Free delivery on orders above ₹10,000' : m.key === 'pickup' ? ' · Collect from our Karur store' : ' · Faster delivery to your location'}</div>
                      </div>
                      <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, color: m.cost ? '#0B2447' : '#16a34a' }}>
                        {m.cost ? `₹${m.cost}` : 'FREE'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2 — PAYMENT */}
            {step === 2 && (
              <div className="co-section">
                {cartNeedsReserve ? (
                  <>
                    <div className="co-section-title">Payment</div>
                    <div className="reserve-note">
                      <p><strong>No payment needed yet.</strong></p>
                      <p>
                        Your cart includes item(s) we source from a distributor. We'll verify availability
                        first (usually within 15 minutes during business hours) and only send you a secure
                        payment link once your order is confirmed.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="co-section-title">Payment Method</div>
                    <div className="payment-options">
                      {[
                        { key: 'upi', icon: '📱', name: 'UPI / QR Code', sub: 'Pay instantly using any UPI app' },
                        { key: 'card', icon: '💳', name: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay accepted' },
                        { key: 'netbanking', icon: '🏦', name: 'Net Banking', sub: 'All major banks supported' },
                        { key: 'cod', icon: '💵', name: 'Cash on Delivery (COD)', sub: 'Available for orders below ₹50,000' },
                      ].map(opt => (
                        <div key={opt.key} onClick={() => { setPayDisplay(opt.key as any); setPayment(PAY_DISPLAY_TO_METHOD[opt.key]); }}
                          className={`payment-card${payDisplay === opt.key ? ' payment-card--selected' : ''}`}>
                          <div className="payment-radio"><div className={`addr-radio-dot${payDisplay === opt.key ? ' active' : ''}`} /></div>
                          <div className="payment-icon">{opt.icon}</div>
                          <div>
                            <div className="payment-name">{opt.name}</div>
                            <div className="payment-sub">{opt.sub}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <div className="co-field" style={{ marginTop: 20 }}>
                  <label className="co-label">Order Notes (optional)</label>
                  <textarea className="co-inp" rows={3} style={{ resize: 'none' }}
                    placeholder="e.g. Please call before delivery. Need items by Tuesday."
                    value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
              </div>
            )}

            {/* STEP 3 — REVIEW */}
            {step === 3 && (
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

                {/* Shipping method summary */}
                <div className="review-block">
                  <div className="review-block-label">Shipping Method</div>
                  <div className="review-payment">
                    {SHIPPING_METHODS.find(m => m.key === shippingMethod)?.icon} {SHIPPING_METHODS.find(m => m.key === shippingMethod)?.label}
                  </div>
                  <button onClick={() => setStep(1)} className="review-edit-btn">Edit</button>
                </div>

                {/* Payment summary */}
                <div className="review-block">
                  <div className="review-block-label">Payment</div>
                  <div className="review-payment">
                    {payDisplay === 'cod' ? '💵 Cash on Delivery' : payDisplay === 'upi' ? '📱 UPI / QR Code' : payDisplay === 'card' ? '💳 Credit / Debit Card' : '🏦 Net Banking'}
                  </div>
                  <button onClick={() => setStep(2)} className="review-edit-btn">Edit</button>
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
                    <div style={{ fontSize: 13, color: '#6B7280', fontStyle: 'italic' }}>{notes}</div>
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
                  step === 0 ? 'Continue to Shipping →' :
                  step === 1 ? 'Continue to Payment →' :
                  step === 2 ? 'Continue to Review →' :
                  cartNeedsReserve ? '✓ Reserve Order' : '✓ Place Order'}
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

              {/* Coupon / promo code */}
              {!couponResult ? (
                <div style={{ margin: '10px 0' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={couponCode}
                      onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                      onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                      placeholder="Promo code"
                      style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E5E1DC', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#0B2447', fontFamily: 'Inter,sans-serif', outline: 'none' }}
                    />
                    <button onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()}
                      style={{ padding: '8px 16px', borderRadius: 8, background: '#FFF4ED', border: '1px solid rgba(240,115,22,0.3)', color: '#F07316', fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {couponLoading ? '…' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <div style={{ fontSize: 11, color: '#F87171', marginTop: 5 }}>⚠️ {couponError}</div>}
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 8, padding: '8px 12px', margin: '8px 0' }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#4ADE80', fontWeight: 700 }}>🎉 {couponResult.coupon_code} applied!</div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>{couponResult.description}</div>
                  </div>
                  <button onClick={removeCoupon} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 16 }}>✕</button>
                </div>
              )}

              {couponResult && (
                <div className="co-summary-row" style={{ color: '#4ADE80' }}>
                  <span>Discount ({couponResult.coupon_code})</span>
                  <span>−₹{couponResult.discount_amount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="co-summary-row">
                <span>Shipping ({SHIPPING_METHODS.find(m => m.key === shippingMethod)?.label})</span>
                <span style={{ color: shippingCost ? '#0B2447' : '#16a34a' }}>{shippingCost ? `₹${shippingCost}` : 'Free'}</span>
              </div>
              <div className="co-summary-row">
                <span>GST (18%)</span>
                <span style={{ color: '#6B7280' }}>Included</span>
              </div>
              <div className="co-summary-total">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="co-summary-note">
              🔒 Secure checkout · Delivery confirmed by our team
            </div>

            <div className="co-help-card">
              <div>
                <div className="co-help-title">Need help with your order?</div>
                <div className="co-help-sub">Our team is here to assist you</div>
                <a href={`tel:${CONTACT.phoneRaw}`} className="co-help-link">📞 {CONTACT.phone}</a>
                <a href={`mailto:${CONTACT.email}`} className="co-help-link">✉️ {CONTACT.email}</a>
              </div>
              <div className="co-help-avatar">K</div>
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
    .checkout-page { min-height:100vh; background:#F7F4F0; padding: 80px 0 60px; }
    .checkout-inner { max-width:1100px; margin:0 auto; padding:32px 48px; }
    .checkout-success { max-width:500px; margin:80px auto; text-align:center; background:#FFFFFF; border:1px solid #E5E1DC; border-radius:14px; padding:48px 36px; box-shadow:0 4px 20px rgba(11,36,71,0.06); }
    .checkout-empty { max-width:400px; margin:100px auto; text-align:center; }
    .success-icon { font-size:56px; margin-bottom:16px; }
    .success-title { font-family:'Syne',sans-serif; font-size:2rem; letter-spacing:.05em; color:#0B2447; margin-bottom:8px; }
    .success-order-num { font-family:'Space Grotesk',sans-serif; font-size:1.6rem; color:#F07316; margin-bottom:14px; }
    .success-msg { font-size:14px; color:#6B7280; line-height:1.7; margin-bottom:28px; }
    .success-actions { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-bottom:20px; }
    .success-btn-primary { padding:12px 24px; background:#F07316; color:#FFFFFF; border-radius:6px; font-family:'Inter',sans-serif; font-weight:700; font-size:.78rem; letter-spacing:.1em; text-transform:uppercase; text-decoration:none; }
    .success-btn-secondary { padding:12px 24px; border:1px solid rgba(240,115,22,0.35); color:#F07316; border-radius:6px; font-family:'Inter',sans-serif; font-weight:700; font-size:.78rem; letter-spacing:.1em; text-transform:uppercase; text-decoration:none; }
    .success-wa-note { font-size:12px; color:#166534; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:10px 14px; }

    .co-steps { display:flex; align-items:center; justify-content:center; margin-bottom:36px; gap:0; }
    .co-step { display:flex; align-items:center; gap:8px; }
    .co-step-num { width:28px; height:28px; border-radius:50%; background:#F2EDE5; border:1px solid #E5E1DC; display:flex; align-items:center; justify-content:center; font-family:'Inter',sans-serif; font-size:11px; font-weight:700; color:#6B7280; }
    .co-step--active .co-step-num { background:#F07316; border-color:#F07316; color:#FFFFFF; }
    .co-step--done .co-step-num { background:#dcfce7; border-color:#16a34a; color:#16a34a; }
    .co-step-label { font-family:'Inter',sans-serif; font-size:.68rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#6B7280; }
    .co-step--active .co-step-label { color:#0B2447; }
    .co-step--done .co-step-label { color:#16a34a; }
    .co-step-line { width:40px; height:1px; background:#E5E1DC; margin:0 12px; }

    .co-layout { display:grid; grid-template-columns:1fr 340px; gap:28px; align-items:start; }
    .co-section { background:#FFFFFF; border:1px solid #E5E1DC; border-radius:10px; padding:24px; margin-bottom:16px; box-shadow:0 1px 4px rgba(11,36,71,0.05); }
    .co-section-title { font-family:'Inter',sans-serif; font-size:.75rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:#F07316; margin-bottom:18px; }
    .co-form { display:flex; flex-direction:column; gap:14px; }
    .co-form-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .co-field { display:flex; flex-direction:column; gap:5px; }
    .co-label { font-family:'Inter',sans-serif; font-size:.6rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#6B7280; }
    .co-inp { background:#FAF8F5; border:1px solid #E5E1DC; border-radius:6px; padding:10px 13px; font-size:14px; color:#0B2447; font-family:'Inter',sans-serif; outline:none; transition:border-color .2s; width:100%; }
    .co-inp:focus { border-color:#F07316; background:#FFFFFF; }
    .co-inp::placeholder { color:#9CA3AF; }
    .co-back-link { background:none; border:none; color:#F07316; font-size:12px; font-family:'Inter',sans-serif; cursor:pointer; margin-bottom:12px; padding:0; }
    .co-info { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:10px 14px; font-size:13px; color:#166534; }
    .map-preview-link, .review-map-link { display:inline-flex; align-items:center; width:max-content; color:#16a34a; font-family:'Inter',sans-serif; font-size:.68rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; text-decoration:none; }
    .map-preview-link:hover, .review-map-link:hover { color:#15803d; text-decoration:underline; }

    .addr-list { display:flex; flex-direction:column; gap:10px; }
    .addr-empty-box { background:#FAF8F5; border:1px dashed #D1CBC2; border-radius:8px; padding:22px; text-align:center; }
    .addr-empty-title { font-family:'Inter',sans-serif; font-size:.78rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#0B2447; margin-bottom:8px; }
    .addr-empty-box p { font-size:13px; color:#6B7280; line-height:1.6; }
    .addr-actions-row { display:grid; grid-template-columns:1fr auto; gap:10px; align-items:stretch; }
    .addr-card { display:flex; gap:14px; align-items:flex-start; padding:16px; border:1px solid #E5E1DC; border-radius:8px; cursor:pointer; transition:border-color .2s; background:#FFFFFF; }
    .addr-card--selected { border-color:#F07316; background:#FFF9F4; }
    .addr-radio { width:18px; height:18px; border-radius:50%; border:2px solid rgba(240,115,22,0.35); display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:2px; }
    .addr-radio-dot { width:8px; height:8px; border-radius:50%; background:transparent; transition:background .15s; }
    .addr-radio-dot.active { background:#F07316; }
    .addr-info { flex:1; }
    .addr-label-row { display:flex; gap:6px; margin-bottom:4px; }
    .addr-label-badge { font-family:'Inter',sans-serif; font-size:9px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; background:#FFF4ED; color:#F07316; border:1px solid rgba(240,115,22,0.25); padding:2px 7px; border-radius:2px; }
    .addr-default-badge { font-family:'Inter',sans-serif; font-size:9px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; padding:2px 7px; border-radius:2px; }
    .addr-name { font-weight:700; color:#0B2447; font-size:14px; margin-bottom:3px; }
    .addr-text { font-size:13px; color:#6B7280; line-height:1.6; margin-bottom:3px; }
    .addr-phone { font-size:12px; color:#6B7280; }
    .addr-add-btn { padding:10px 0; background:transparent; border:1px dashed rgba(240,115,22,0.35); border-radius:6px; color:#F07316; font-family:'Inter',sans-serif; font-size:.7rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; width:100%; transition:all .2s; }
    .addr-add-btn:hover { background:#FFF4ED; border-style:solid; }
    .addr-manage-link { display:flex; align-items:center; justify-content:center; padding:10px 16px; border:1px solid #E5E1DC; border-radius:6px; color:#6B7280; font-family:'Inter',sans-serif; font-size:.68rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; text-decoration:none; white-space:nowrap; }
    .addr-manage-link:hover { border-color:#F07316; color:#F07316; }

    .location-card { display:flex; align-items:center; justify-content:space-between; gap:16px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:14px 16px; }
    .location-title { font-family:'Inter',sans-serif; font-size:.72rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#16a34a; margin-bottom:4px; }
    .location-card p { font-size:12px; color:#4B5563; line-height:1.5; }
    .location-btn { flex-shrink:0; padding:9px 14px; border:none; border-radius:6px; background:#25D366; color:white; font-family:'Inter',sans-serif; font-size:.68rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; cursor:pointer; }
    .location-btn:disabled { opacity:.65; cursor:not-allowed; }

    .payment-options { display:flex; flex-direction:column; gap:10px; }
    .payment-card { display:flex; gap:14px; align-items:center; padding:16px; border:1px solid #E5E1DC; border-radius:8px; cursor:pointer; transition:border-color .2s; background:#FFFFFF; }
    .payment-card--selected { border-color:#F07316; background:#FFF9F4; }
    .payment-radio { width:18px; height:18px; border-radius:50%; border:2px solid rgba(240,115,22,0.35); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .payment-icon { font-size:24px; flex-shrink:0; }
    .payment-name { font-family:'Inter',sans-serif; font-size:.82rem; font-weight:700; color:#0B2447; margin-bottom:3px; }
    .payment-sub { font-size:12px; color:#6B7280; line-height:1.5; }

    .review-block { background:#FAF8F5; border:1px solid #E5E1DC; border-radius:6px; padding:14px 16px; margin-bottom:10px; position:relative; }
    .review-block-label { font-family:'Inter',sans-serif; font-size:.6rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:#F07316; margin-bottom:8px; }
    .review-addr { font-size:13px; color:#374151; line-height:1.75; }
    .review-payment { font-size:14px; color:#0B2447; }
    .review-edit-btn { position:absolute; top:12px; right:12px; background:none; border:1px solid rgba(240,115,22,0.3); border-radius:4px; color:#F07316; font-size:11px; font-family:'Inter',sans-serif; font-weight:700; padding:4px 10px; cursor:pointer; }
    .review-item { display:flex; align-items:center; padding:7px 0; border-bottom:1px solid #F1EEE9; font-size:13px; }
    .review-item:last-child { border-bottom:none; }
    .review-item-name { flex:1; color:#374151; }
    .review-item-variant, .co-summary-item-variant { display:block; margin-top:2px; font-size:11px; color:#6B7280; font-family:'Inter',sans-serif; font-weight:500; }
    .review-item-qty { color:#6B7280; margin-right:12px; font-size:12px; }
    .review-item-price { color:#F07316; font-weight:700; font-family:'Inter',sans-serif; min-width:80px; text-align:right; }

    .co-error { background:#fef2f2; border:1px solid #fecaca; border-radius:6px; padding:10px 14px; font-size:13px; color:#dc2626; margin-bottom:14px; }
    .co-nav { display:flex; gap:12px; }
    .co-btn-back { padding:12px 20px; background:transparent; border:1px solid #E5E1DC; border-radius:6px; color:#6B7280; font-family:'Inter',sans-serif; font-size:.72rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; transition:all .2s; }
    .co-btn-back:hover { border-color:#F07316; color:#F07316; }
    .co-btn-primary { flex:1; padding:13px 0; background:#F07316; color:#FFFFFF; border:none; border-radius:6px; font-family:'Inter',sans-serif; font-weight:700; font-size:.82rem; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; transition:all .2s; text-decoration:none; text-align:center; display:block; }
    .co-btn-primary:hover:not(:disabled) { background:#D9640F; transform:translateY(-1px); }
    .co-btn-primary:disabled { opacity:.6; cursor:not-allowed; }
    .reserve-note { background:#FAF8F5; border:1.5px solid #E5E1DC; border-radius:10px; padding:14px 16px; }
    .reserve-note p { margin:0 0 8px; font-family:'Inter',sans-serif; font-size:.85rem; color:#374151; line-height:1.5; }
    .reserve-note p:last-child { margin-bottom:0; }
    .reserve-note strong { color:#0B2447; }

    .co-summary { background:#FFFFFF; border:1px solid #E5E1DC; border-radius:10px; padding:22px; position:sticky; top:80px; box-shadow:0 1px 4px rgba(11,36,71,0.05); }
    .co-summary-title { font-family:'Inter',sans-serif; font-size:.72rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:#F07316; margin-bottom:16px; }
    .co-summary-items { display:flex; flex-direction:column; gap:8px; margin-bottom:16px; }
    .co-summary-item { display:flex; justify-content:space-between; align-items:flex-start; gap:8px; }
    .co-summary-item-name { font-size:13px; color:#374151; flex:1; line-height:1.4; }
    .co-summary-item-qty { font-size:12px; color:#6B7280; }
    .co-summary-item-price { font-size:13px; font-weight:700; color:#0B2447; white-space:nowrap; }
    .co-summary-totals { border-top:1px solid #E5E1DC; padding-top:14px; display:flex; flex-direction:column; gap:8px; margin-bottom:14px; }
    .co-summary-row { display:flex; justify-content:space-between; font-size:13px; color:#6B7280; }
    .co-summary-total { display:flex; justify-content:space-between; font-family:'Inter',sans-serif; font-weight:700; font-size:1rem; color:#0B2447; border-top:1px solid #E5E1DC; padding-top:12px; margin-top:4px; }
    .co-summary-note { font-size:11px; color:#9CA3AF; text-align:center; font-family:'Inter',sans-serif; }
    .co-help-card { margin-top:16px; background:#0B2447; border-radius:10px; padding:18px; display:flex; align-items:center; justify-content:space-between; gap:14px; }
    .co-help-title { font-family:'Inter',sans-serif; font-size:.8rem; font-weight:700; color:#FFFFFF; margin-bottom:3px; }
    .co-help-sub { font-size:11px; color:#93A3BC; margin-bottom:10px; }
    .co-help-link { display:block; font-size:12px; color:#FF9A45; text-decoration:none; margin-bottom:4px; }
    .co-help-link:hover { text-decoration:underline; }
    .co-help-avatar { width:44px; height:44px; border-radius:50%; background:#F07316; color:#FFFFFF; display:flex; align-items:center; justify-content:center; font-family:'Inter',sans-serif; font-weight:800; font-size:16px; flex-shrink:0; border:2px solid rgba(240,115,22,0.4); }

    @media(max-width:900px){
      .checkout-inner { padding:24px 20px !important; }
      .co-layout { grid-template-columns:1fr !important; }
      .co-summary { position:static !important; order:-1; }
      .co-form-row { grid-template-columns:1fr !important; }
      .addr-actions-row { grid-template-columns:1fr !important; }
      .location-card { align-items:stretch; flex-direction:column; }
    }
    select option { background:#FFFFFF; color:#0B2447; }
  `}</style>;
}