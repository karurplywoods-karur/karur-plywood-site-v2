// src/app/page.tsx — KPC homepage (redesign)
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/db';
import { LocalBusinessSchema } from '@/components/JsonLd';
import HomeProductCard from '@/components/home/HomeProductCard';
import { getBrands, getCategories, getProjectProducts } from '@/lib/products';

export const revalidate = 300;

// Photos for categories that have no image_url uploaded yet (existing files in /public/images).
const CATEGORY_FALLBACK_IMG: Record<string, string> = {
  'waterproof-plywood': '/images/cat-waterproof-plywood.jpg',
  'commercial-plywood': '/images/cat-commercial-plywood.jpg',
  'mdf-board': '/images/cat-mdf-board.jpg',
  'hdhmr-board': '/images/cat-hdhmr-board.jpg',
  'block-board': '/images/cat-block-board.jpg',
  'flush-door': '/images/cat-flush-door.jpg',
  plywood: '/images/cat-plywood.jpg',
  laminates: '/images/cat-laminates.jpg',
  laminate: '/images/cat-laminate.jpg',
  hardware: '/images/cat-hardware.jpg',
  doors: '/images/cat-doors.jpg',
  adhesives: '/images/cat-adhesives.jpg',
  accessories: '/images/cat-accessories.jpg',
  veneer: '/images/cat-veneer.jpg',
};

// Active, unexpired coupons — same source/rules as /offers. Empty → section is not rendered.
async function getActiveOffers() {
  const { data } = await supabase.from('coupons').select('*').eq('is_active', true).order('created_at', { ascending: false });
  const now = new Date();
  return (data || []).filter((c: any) => !c.expires_at || new Date(c.expires_at) > now);
}

const BENEFITS = [
  { icon: '🚚', t: 'Local Delivery', d: 'Delivery within 30 km of Karur, subject to serviceability.' },
  { icon: '✓', t: 'Genuine Brands', d: 'Sourced from trusted, established brands.' },
  { icon: '💬', t: 'Product Guidance', d: 'Get help choosing the right material.' },
  { icon: '🔒', t: 'Secure Payments', d: 'Pay securely online at checkout.' },
];

const STEPS = [
  { n: '1', t: 'Browse & Select', d: 'Find the products you need.' },
  { n: '2', t: 'Enter PIN Code', d: 'Check delivery to your location.' },
  { n: '3', t: 'Review & Pay', d: 'Confirm your cart and pay securely.' },
  { n: '4', t: 'Get Your Order', d: 'Receive your order at your address.' },
];

export default async function HomePage() {
  const [allProducts, categories, brands, offers] = await Promise.all([
    getProjectProducts(),
    getCategories(),
    getBrands(),
    getActiveOffers(),
  ]);
  const products = allProducts.slice(0, 8);
  const cats = categories.slice(0, 8);

  const heroTiles = ['plywood', 'laminates', 'mdf-board', 'hardware'].map(slug => ({
    slug,
    src: categories.find(c => c.slug === slug)?.image_url || CATEGORY_FALLBACK_IMG[slug],
  }));

  return (
    <div className="hp">
      <LocalBusinessSchema />

      {/* 2 — HERO */}
      <section className="hp-hero">
        <div className="hp-wrap hp-hero-in">
          <div className="hp-hero-copy">
            <h1>Everything Your Home Needs. In One Place.</h1>
            <p>Explore plywood, laminates, boards, hardware and interior materials from trusted brands.</p>
            <div className="hp-hero-cta">
              <Link href="/products" className="hp-btn hp-btn-solid">SHOP PRODUCTS</Link>
              <Link href="#categories" className="hp-btn hp-btn-outline">EXPLORE CATEGORIES</Link>
            </div>
            <div className="hp-hero-note">🚚 Local delivery within 30 km of Karur, subject to product and PIN-code serviceability.</div>
          </div>
          <div className="hp-hero-tiles" aria-hidden="true">
            {heroTiles.filter(t => t.src).map(t => (
              <div key={t.slug} className="hp-hero-tile">
                <Image src={t.src as string} alt="" fill sizes="(max-width:900px) 45vw, 22vw" style={{ objectFit: 'cover' }} priority />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 — SHOP BY CATEGORY */}
      {cats.length > 0 && (
        <section id="categories" className="hp-sec">
          <div className="hp-wrap">
            <div className="hp-sec-head">
              <h2>Shop by Category</h2>
              <Link href="/products" className="hp-link">View all products →</Link>
            </div>
            <div className="hp-cat-grid">
              {cats.map((c: any) => (
                <Link key={c.id} href={`/category/${c.slug}`} className="hp-cat">
                  <div className="hp-cat-img">
                    <Image src={c.image_url || CATEGORY_FALLBACK_IMG[c.slug] || '/images/cat-generic.jpg'} alt={c.name} fill sizes="(max-width:640px) 50vw, (max-width:1100px) 25vw, 12vw" style={{ objectFit: 'cover' }} />
                  </div>
                  <div className="hp-cat-name">{c.name}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4 — FEATURED PRODUCTS */}
      {products.length > 0 && (
        <section className="hp-sec hp-sec-alt">
          <div className="hp-wrap">
            <div className="hp-sec-head">
              <h2>Featured Products</h2>
              <Link href="/products" className="hp-link">View all →</Link>
            </div>
            <div className="hp-prod-grid">
              {products.map(p => <HomeProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* 5 — SHOP BY BRAND */}
      {brands.length > 0 && (
        <section className="hp-sec">
          <div className="hp-wrap">
            <div className="hp-sec-head">
              <h2>Shop by Brand</h2>
              <Link href="/brands" className="hp-link">All brands →</Link>
            </div>
            <div className="hp-brand-row">
              {brands.map(b => (
                <Link key={b.slug} href={`/brands/${b.slug}`} className="hp-brand" aria-label={b.name}>
                  {b.logo_url
                    ? <Image src={b.logo_url} alt={b.name} fill sizes="150px" style={{ objectFit: 'contain', padding: 14 }} />
                    : <span>{b.name}</span>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6 — SPECIAL OFFERS (only genuine, active coupons) */}
      {offers.length > 0 && (
        <section className="hp-sec hp-sec-tight">
          <div className="hp-wrap">
            <div className="hp-offer">
              <div>
                <div className="hp-offer-eyebrow">Special Offers</div>
                <h2>
                  {offers[0].discount_type === 'percent'
                    ? `${offers[0].discount_value}% OFF`
                    : `₹${Number(offers[0].discount_value).toLocaleString('en-IN')} OFF`}
                  {' '}with code <span className="hp-offer-code">{offers[0].code}</span>
                </h2>
                {offers[0].description && <p>{offers[0].description}</p>}
                {offers[0].min_order_value ? <p className="hp-offer-min">Minimum order ₹{Number(offers[0].min_order_value).toLocaleString('en-IN')}</p> : null}
              </div>
              <Link href="/offers" className="hp-btn hp-btn-solid">{offers.length > 1 ? `VIEW ALL ${offers.length} OFFERS` : 'VIEW OFFER'}</Link>
            </div>
          </div>
        </section>
      )}

      {/* 7 — WHY CHOOSE KPC */}
      <section className="hp-sec hp-sec-alt">
        <div className="hp-wrap">
          <div className="hp-sec-head hp-center"><h2>Why Choose KPC</h2></div>
          <div className="hp-why-grid">
            {BENEFITS.map(b => (
              <div key={b.t} className="hp-why">
                <div className="hp-why-icon">{b.icon}</div>
                <div className="hp-why-t">{b.t}</div>
                <div className="hp-why-d">{b.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8 — HOW TO ORDER */}
      <section className="hp-sec">
        <div className="hp-wrap">
          <div className="hp-sec-head hp-center"><h2>How to Order</h2></div>
          <ol className="hp-steps">
            {STEPS.map(s => (
              <li key={s.n} className="hp-step">
                <span className="hp-step-n">{s.n}</span>
                <div className="hp-step-t">{s.t}</div>
                <div className="hp-step-d">{s.d}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 9 — PROJECT QUOTATION */}
      <section className="hp-quote">
        <div className="hp-wrap hp-quote-in">
          <div>
            <h2>Planning a Complete Interior?</h2>
            <p>Share your material list or project requirements to receive a project quotation.</p>
          </div>
          <Link href="/bom-quote" className="hp-btn hp-btn-solid">REQUEST A PROJECT QUOTE</Link>
        </div>
      </section>

      {/* 10 — Footer is rendered globally by layout.tsx and is unchanged. */}

      <style>{`
        .hp { background:#fff; color:#1f2937; padding-top:58px; }
        .hp-wrap { max-width:1200px; margin:0 auto; padding:0 24px; }
        .hp-sec { padding:56px 0; }
        .hp-sec-tight { padding:32px 0; }
        .hp-sec-alt { background:#FAF8F5; border-top:1px solid #E5E1DC; border-bottom:1px solid #E5E1DC; }
        .hp-sec-head { display:flex; align-items:baseline; justify-content:space-between; margin-bottom:24px; gap:12px; }
        .hp-sec-head h2 { font-family:'Syne','Inter',sans-serif; font-size:clamp(1.4rem,2.4vw,1.9rem); color:#0B2447; margin:0; }
        .hp-center { justify-content:center; text-align:center; }
        .hp-link { font:700 .78rem 'Inter',sans-serif; color:#F07316; text-decoration:none; white-space:nowrap; }
        .hp-link:hover { text-decoration:underline; }
        .hp-btn { display:inline-flex; align-items:center; justify-content:center; padding:14px 26px; border-radius:6px; font:700 .8rem 'Inter',sans-serif; letter-spacing:.06em; text-decoration:none; transition:background .2s,color .2s; }
        .hp-btn-solid { background:#F07316; color:#fff; border:1.5px solid #F07316; }
        .hp-btn-solid:hover { background:#D9640F; border-color:#D9640F; }
        .hp-btn-outline { background:#fff; color:#0B2447; border:1.5px solid #0B2447; }
        .hp-btn-outline:hover { background:#0B2447; color:#fff; }


        .hp-hero { background:#FAF8F5; border-bottom:1px solid #E5E1DC; }
        .hp-hero-in { display:grid; grid-template-columns:1.1fr 1fr; gap:40px; align-items:center; padding-top:48px; padding-bottom:48px; }
        .hp-hero-copy h1 { font-family:'Syne','Inter',sans-serif; font-size:clamp(2rem,4.4vw,3.4rem); line-height:1.08; color:#0B2447; margin:0 0 16px; }
        .hp-hero-copy p { font-size:1.02rem; line-height:1.7; color:#4B5563; max-width:480px; margin:0 0 24px; }
        .hp-hero-cta { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:20px; }
        .hp-hero-note { font-size:.8rem; color:#4B5563; }
        .hp-hero-tiles { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .hp-hero-tile { position:relative; aspect-ratio:1/1; border-radius:12px; overflow:hidden; background:#F2EDE5; border:1px solid #E5E1DC; }

        .hp-cat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
        .hp-cat { text-decoration:none; background:#fff; border:1px solid #E5E1DC; border-radius:12px; overflow:hidden; transition:border-color .2s; }
        .hp-cat:hover { border-color:#F07316; }
        .hp-cat-img { position:relative; aspect-ratio:4/3; background:#F2EDE5; }
        .hp-cat-name { padding:12px 14px; font:700 .88rem 'Inter',sans-serif; color:#0B2447; }

        .hp-prod-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
        .hp-pcard { background:#fff; border:1px solid #E5E1DC; border-radius:12px; overflow:hidden; display:flex; flex-direction:column; }
        .hp-pcard-img { position:relative; display:block; aspect-ratio:1/1; background:#F2EDE5; }
        .hp-pcard-noimg { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:44px; }
        .hp-pcard-off { position:absolute; top:8px; left:8px; background:#16a34a; color:#fff; font:700 .66rem 'Inter',sans-serif; padding:3px 8px; border-radius:4px; }
        .hp-pcard-body { padding:14px; display:flex; flex-direction:column; gap:4px; flex:1; }
        .hp-pcard-brand { font:700 .66rem 'Inter',sans-serif; letter-spacing:.08em; text-transform:uppercase; color:#6B7280; }
        .hp-pcard-name { font:700 .9rem/1.35 'Inter',sans-serif; color:#0B2447; text-decoration:none; }
        .hp-pcard-spec { font-size:.75rem; color:#6B7280; }
        .hp-pcard-price { display:flex; align-items:baseline; gap:6px; flex-wrap:wrap; margin-top:4px; }
        .hp-pcard-sell { font:700 1.2rem 'Space Grotesk','Inter',sans-serif; color:#0B2447; }
        .hp-pcard-unit { font-size:.72rem; color:#6B7280; }
        .hp-pcard-mrp { font-size:.78rem; color:#9CA3AF; text-decoration:line-through; }
        .hp-pcard-enq { font-size:.8rem; color:#6B7280; font-style:italic; margin-top:4px; }
        .hp-pcard-stock { font:700 .68rem 'Inter',sans-serif; }
        .hp-pcard-stock.in { color:#16a34a; } .hp-pcard-stock.out { color:#dc2626; }
        .hp-pcard-btn { margin-top:auto; padding:10px 0; border:0; border-radius:6px; background:#F07316; color:#fff; font:700 .78rem 'Inter',sans-serif; cursor:pointer; }
        .hp-pcard-btn:hover:not(:disabled) { background:#D9640F; }
        .hp-pcard-btn:disabled { background:#D1D5DB; cursor:not-allowed; }
        .hp-pcard-qty { margin-top:auto; display:flex; align-items:center; justify-content:space-between; border:1.5px solid #F07316; border-radius:6px; }
        .hp-pcard-qty button { width:40px; height:36px; border:0; background:transparent; color:#F07316; font-size:1.1rem; font-weight:700; cursor:pointer; }
        .hp-pcard-qty span { font:700 .9rem 'Inter',sans-serif; }

        .hp-brand-row { display:flex; gap:14px; overflow-x:auto; padding:2px 2px 10px; }
        .hp-brand { position:relative; flex:0 0 150px; height:76px; display:flex; align-items:center; justify-content:center; background:#fff; border:1px solid #E5E1DC; border-radius:10px; text-decoration:none; font:700 .82rem 'Inter',sans-serif; color:#0B2447; }
        .hp-brand:hover { border-color:#F07316; }

        .hp-offer { display:flex; align-items:center; justify-content:space-between; gap:24px; background:#0B2447; color:#fff; border-radius:14px; padding:32px 36px; }
        .hp-offer h2 { font-family:'Syne','Inter',sans-serif; font-size:clamp(1.3rem,2.6vw,2rem); margin:4px 0 8px; color:#fff; }
        .hp-offer p { margin:0; color:#C7D2E0; font-size:.9rem; }
        .hp-offer-min { margin-top:4px !important; font-size:.78rem !important; }
        .hp-offer-eyebrow { font:700 .68rem 'Inter',sans-serif; letter-spacing:.2em; text-transform:uppercase; color:#FF9A45; }
        .hp-offer-code { background:rgba(255,255,255,.12); border:1px dashed rgba(255,255,255,.5); padding:2px 10px; border-radius:6px; letter-spacing:.06em; }

        .hp-why-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
        .hp-why { text-align:center; padding:8px 12px; }
        .hp-why-icon { width:52px; height:52px; margin:0 auto 12px; display:flex; align-items:center; justify-content:center; font-size:22px; color:#F07316; background:#FFF4ED; border-radius:50%; }
        .hp-why-t { font:700 .92rem 'Inter',sans-serif; color:#0B2447; margin-bottom:4px; }
        .hp-why-d { font-size:.8rem; color:#6B7280; line-height:1.6; }

        .hp-steps { list-style:none; margin:0; padding:0; display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
        .hp-step { text-align:center; padding:0 8px; }
        .hp-step-n { width:40px; height:40px; margin:0 auto 10px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:#0B2447; color:#fff; font:700 1rem 'Inter',sans-serif; }
        .hp-step-t { font:700 .92rem 'Inter',sans-serif; color:#0B2447; margin-bottom:4px; }
        .hp-step-d { font-size:.8rem; color:#6B7280; line-height:1.6; }

        .hp-quote { background:#FFF4ED; border-top:1px solid #F5D9C3; border-bottom:1px solid #F5D9C3; padding:48px 0; }
        .hp-quote-in { display:flex; align-items:center; justify-content:space-between; gap:24px; }
        .hp-quote h2 { font-family:'Syne','Inter',sans-serif; font-size:clamp(1.4rem,2.6vw,2rem); color:#0B2447; margin:0 0 8px; }
        .hp-quote p { margin:0; color:#4B5563; font-size:.95rem; }

        @media (max-width:1100px) {
          .hp-hero-in { grid-template-columns:1fr; }
          .hp-cat-grid, .hp-prod-grid { grid-template-columns:repeat(3,1fr); }
        }
        @media (max-width:800px) {
          .hp-cat-grid, .hp-prod-grid { grid-template-columns:repeat(2,1fr); }
          .hp-why-grid { grid-template-columns:1fr 1fr; }
          .hp-steps { grid-template-columns:1fr; gap:18px; }
          .hp-offer, .hp-quote-in { flex-direction:column; align-items:flex-start; }
        }
        @media (max-width:640px) {
          .hp-wrap { padding:0 16px; }
          .hp-sec { padding:40px 0; }
          .hp-hero-in { padding-top:28px; padding-bottom:28px; gap:24px; }
          .hp-hero-cta .hp-btn, .hp-offer .hp-btn, .hp-quote .hp-btn { width:100%; }
          .hp-offer { padding:24px 20px; }
        }
      `}</style>
    </div>
  );
}
