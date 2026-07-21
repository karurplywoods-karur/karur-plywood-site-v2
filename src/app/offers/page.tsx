// src/app/offers/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/db';
import { CONTACT } from '@/lib/contact';

const SITE_URL = 'https://www.karurplywood.co.in';
const WA = CONTACT.wa;

export const metadata: Metadata = {
  title: 'Offers & Deals | Karur Plywood & Company',
  description: 'Current offers, discounts and coupon codes at Karur Plywood & Company.',
  alternates: { canonical: `${SITE_URL}/offers` },
};

async function getActiveCoupons() {
  const { data } = await supabase
    .from('coupons')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  const now = new Date();
  return (data || []).filter((c: any) => !c.expires_at || new Date(c.expires_at) > now);
}

function formatDiscount(c: any) {
  return c.discount_type === 'percent'
    ? `${c.discount_value}% OFF${c.max_discount ? ` (up to ₹${c.max_discount.toLocaleString('en-IN')})` : ''}`
    : `₹${c.discount_value.toLocaleString('en-IN')} OFF`;
}

export default async function OffersPage() {
  const coupons = await getActiveCoupons();

  return (
    <div style={{ background: '#FAF8F5', paddingTop: 58, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 48px 60px' }} className="off-pad">
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 14 }}>
          <Link href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Home</Link> › <span style={{ color: '#F07316', fontWeight: 600 }}>Offers</span>
        </div>

        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(1.6rem,3vw,2.1rem)', fontWeight: 700, color: '#0B2447', margin: '0 0 6px' }}>Offers & Deals</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>Current discount codes and offers at Karur Plywood & Company. Shop more, save more!</p>

        {coupons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '70px 0', background: '#FFFFFF', border: '1px solid #E5E1DC', borderRadius: 12 }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🎁</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: '#0B2447', marginBottom: 8, fontSize: 17 }}>No active offers right now</div>
            <p style={{ color: '#6B7280', marginBottom: 22, fontSize: 14 }}>Check back soon, or ask us on WhatsApp — we sometimes have offers for bulk/contractor orders that aren&apos;t listed here.</p>
            <a href={`https://wa.me/${WA}?text=Hi%2C+do+you+have+any+current+offers%3F`} target="_blank" rel="noopener" className="off-btn-wa">💬 Ask About Offers</a>
          </div>
        ) : (
          <div className="off-grid">
            {coupons.map((c: any) => (
              <div key={c.id} className="off-card">
                <div className="off-card-badge">{c.discount_type === 'percent' ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: '#0B2447', letterSpacing: '.04em', marginBottom: 6 }}>{c.code}</div>
                {c.description && <div style={{ fontSize: 12.5, color: '#4B5563', marginBottom: 10 }}>{c.description}</div>}
                <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>{formatDiscount(c)}</div>
                {c.min_order_value ? <div style={{ fontSize: 11.5, color: '#9CA3AF' }}>Min. order ₹{c.min_order_value.toLocaleString('en-IN')}</div> : null}
                {c.expires_at && <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 4 }}>Valid till {new Date(c.expires_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>}
                <Link href="/products" className="off-shop-btn">Shop Now →</Link>
              </div>
            ))}
          </div>
        )}

        <div className="off-info-strip">
          {['100% Genuine Products', 'Best Price Guaranteed', 'Secure Payments', 'Easy Returns'].map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#4B5563' }}><span style={{ color: '#16a34a' }}>✓</span>{t}</div>
          ))}
        </div>
      </div>

      <style>{`
        .off-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .off-card { position: relative; background: #FFFFFF; border: 1.5px dashed rgba(240,115,22,0.4); border-radius: 12px; padding: 22px 20px; }
        .off-card-badge { display: inline-block; background: #F07316; color: #FFFFFF; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 11px; letter-spacing: .04em; padding: 4px 12px; border-radius: 20px; margin-bottom: 12px; }
        .off-shop-btn { display: inline-flex; margin-top: 14px; padding: 9px 18px; background: #0B2447; color: #FFFFFF; border-radius: 6px; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 12px; text-decoration: none; }
        .off-btn-wa { display: inline-flex; align-items: center; padding: 11px 22px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; border-radius: 6px; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; }
        .off-info-strip { display: flex; gap: 24px; flex-wrap: wrap; background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; padding: 18px 22px; margin-top: 32px; }
        @media(max-width:900px){ .off-grid { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:640px){ .off-pad { padding-left:16px !important; padding-right:16px !important; } .off-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
