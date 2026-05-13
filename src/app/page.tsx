// src/app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/db';
import { LocalBusinessSchema } from '@/components/JsonLd';

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919159666538';
const PHONE = process.env.NEXT_PUBLIC_PHONE || '+91 91566 66538';
const PHONE_RAW = process.env.NEXT_PUBLIC_PHONE_RAW || '919156666538';

// Fetch featured project products (top 4 by sort_order)
async function getFeaturedProducts() {
  const { data } = await supabase
    .from('products')
    .select('*, categories(id,name,slug,icon)')
    .eq('type', 'project')
    .eq('in_stock', true)
    .order('sort_order', { ascending: true })
    .limit(4);
  return data || [];
}

// Fetch approved reviews
async function getReviews() {
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(3);
  return data || [];
}

// Fetch categories
async function getCategories() {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .limit(4);
  return data || [];
}

const BRANDS = ['Century', 'Sharon', 'Unibind', 'Greenply', 'Hettich', 'Fevicol'];

const FAQS = [
  { q: 'What brands of plywood do you stock?', a: 'We stock Century, Sharon, Unibind, Greenply and other top brands — all ISI-certified.' },
  { q: 'Do you offer wholesale pricing for contractors?', a: 'Yes! Contractors, builders and carpenters get special wholesale rates. WhatsApp us with your requirement for bulk pricing.' },
  { q: 'What areas do you deliver to?', a: 'We deliver across Karur, Trichy, Namakkal, Erode, Salem and Dindigul. Same-day dispatch for Karur orders above ₹5,000.' },
  { q: 'Can I visit your showroom?', a: 'Absolutely. We\'re open Mon–Sat 9 AM to 7 PM at Covai Main Road, Reddipalayam, Karur – 639 008.' },
];

export default async function HomePage() {
  const [products, reviews, categories] = await Promise.all([
    getFeaturedProducts(),
    getReviews(),
    getCategories(),
  ]);

  const waUrl = `https://wa.me/${WA}?text=Hi%2C+I%27m+interested+in+plywood+for+my+project.+Can+you+help+with+pricing%3F`;

  return (
    <main>
      <LocalBusinessSchema />

      {/* ══════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════ */}
      <section className="hero-section">
        <div className="hero-bg-grid" />
        <div className="hero-orange-glow" />

        <div className="container hero-inner">
          {/* Left: Copy */}
          <div className="hero-copy">
            <div className="eyebrow-pill">
              <span className="eyebrow-dot" />
              Karur&apos;s Most Trusted Since 1999
            </div>

            <h1 className="hero-h1">
              PREMIUM<br />
              <span className="hero-h1-orange">PLYWOOD &amp;</span><br />
              HARDWARE
            </h1>

            <p className="hero-sub">
              Century, Sharon, Unibind &amp; Greenply — all major brands at the best prices in Karur.
              Wholesale &amp; retail. ISI certified. Free delivery on orders above ₹5,000.
            </p>

            <div className="hero-ctas">
              <a href={waUrl} target="_blank" rel="noopener" className="cta-wa">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Get Best Price
              </a>
              <Link href="/products" className="cta-outline">
                View Products →
              </Link>
            </div>

            {/* Trust badges */}
            <div className="hero-trust">
              {['ISI Certified', 'Free Del. ₹5K+', 'Same-Day Dispatch', 'GST Billing'].map(t => (
                <div key={t} className="trust-chip">
                  <span className="trust-check">✓</span> {t}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Stats panel */}
          <div className="hero-stats-panel">
            <div className="hero-stats-inner">
              {[
                { n: '25+', l: 'Years Experience' },
                { n: '500+', l: 'Happy Customers' },
                { n: '50+', l: 'Product Varieties' },
                { n: '6', l: 'Premium Brands' },
              ].map(s => (
                <div key={s.l} className="stat-box">
                  <div className="stat-num">{s.n}</div>
                  <div className="stat-lbl">{s.l}</div>
                </div>
              ))}
            </div>
            <div className="hero-contact-card">
              <div className="hero-contact-label">📞 Call Us Now</div>
              <a href={`tel:${PHONE_RAW}`} className="hero-contact-phone">{PHONE}</a>
              <div className="hero-contact-hours">Mon – Sat · 9 AM – 7 PM</div>
            </div>
          </div>
        </div>

        {/* Brand strip */}
        <div className="brand-strip">
          <div className="brand-strip-inner">
            <span className="brand-strip-label">AUTHORIZED DEALER</span>
            {BRANDS.map(b => (
              <span key={b} className="brand-name">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CATEGORIES
      ══════════════════════════════════════════ */}
      <section className="section section-dark">
        <div className="container">
          <div className="section-header">
            <div className="eyebrow">Our Products</div>
            <h2 className="section-title">EXPLORE OUR RANGE</h2>
            <p className="section-desc">From ISI-grade plywood to premium laminates — everything a builder needs, all under one roof.</p>
          </div>

          <div className="cat-grid">
            {(categories.length > 0 ? categories : [
              { slug: 'plywood', name: 'Plywood', icon: '🪵', id: '1' },
              { slug: 'laminates', name: 'Laminates', icon: '🎨', id: '2' },
              { slug: 'hardware', name: 'Hardware', icon: '🔩', id: '3' },
              { slug: 'doors', name: 'Doors', icon: '🚪', id: '4' },
            ]).map((cat: any) => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`} className="cat-card">
                <div className="cat-icon-wrap">
                  <span className="cat-emoji">{cat.icon}</span>
                </div>
                <div className="cat-info">
                  <div className="cat-name">{cat.name}</div>
                  <div className="cat-cta">Browse Range →</div>
                </div>
                <div className="cat-arrow">↗</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════════ */}
      <section className="section section-mid">
        <div className="container">
          <div className="section-header">
            <div className="eyebrow">Popular Products</div>
            <h2 className="section-title">BEST SELLING</h2>
          </div>

          {products.length > 0 ? (
            <div className="prod-grid">
              {products.map((p: any) => (
                <div key={p.id} className="prod-card">
                  <div className="prod-img-wrap">
                    {p.image_url ? (
                      <Image src={p.image_url} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 25vw" />
                    ) : (
                      <div className="prod-img-placeholder">{p.categories?.icon || '📦'}</div>
                    )}
                    {p.categories && (
                      <div className="prod-cat-badge">{p.categories.icon} {p.categories.name}</div>
                    )}
                  </div>
                  <div className="prod-body">
                    <div className="prod-name">{p.name}</div>
                    {p.price && (
                      <div className="prod-price-row">
                        <span className="prod-price">₹{p.price.toLocaleString('en-IN')}</span>
                        {p.unit && <span className="prod-unit">/{p.unit}</span>}
                      </div>
                    )}
                    <a
                      href={`https://wa.me/${WA}?text=Hi%2C+I+am+interested+in+${encodeURIComponent(p.name)}.+Can+you+help+me+with+pricing%3F`}
                      target="_blank" rel="noopener"
                      className="prod-wa-btn"
                    >
                      💬 Enquire on WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="prod-empty">
              <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
              <div style={{ fontSize: 16, color: '#7A8EA8', marginBottom: 20 }}>Products are being added. Check back soon!</div>
              <a href={waUrl} target="_blank" rel="noopener" className="cta-wa" style={{ display: 'inline-flex' }}>
                💬 Ask About Products
              </a>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link href="/products" className="cta-outline-orange">View All Products →</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW TO ORDER
      ══════════════════════════════════════════ */}
      <section className="section section-dark">
        <div className="container">
          <div className="how-grid">
            <div className="how-copy">
              <div className="eyebrow">Simple Process</div>
              <h2 className="section-title" style={{ marginBottom: '1rem' }}>HOW TO ORDER</h2>
              <p style={{ fontSize: 14, color: '#7A8EA8', lineHeight: 1.8, marginBottom: 28 }}>
                Getting your plywood and hardware has never been easier. Two ways to order — both take less than 2 minutes.
              </p>
              <div className="how-modes">
                <Link href="/quick-order" className="how-mode-card">
                  <div className="how-mode-icon">⚡</div>
                  <div>
                    <div className="how-mode-title">Quick Order</div>
                    <div className="how-mode-desc">Add fast-moving items to cart and order directly on WhatsApp</div>
                  </div>
                </Link>
                <Link href="/bom-quote" className="how-mode-card">
                  <div className="how-mode-icon">📋</div>
                  <div>
                    <div className="how-mode-title">Upload BOM</div>
                    <div className="how-mode-desc">Have a list? Snap a photo and get a quote in minutes</div>
                  </div>
                </Link>
              </div>
            </div>

            <div className="how-steps">
              {[
                { n: '01', t: 'Browse & Select', d: 'Choose from our 50+ products or send us your complete material list.' },
                { n: '02', t: 'WhatsApp Quote', d: 'We confirm availability and send you the best price instantly.' },
                { n: '03', t: 'Pay & Deliver', d: 'Pay via UPI or cash. Free delivery in Karur above ₹5,000.' },
              ].map(s => (
                <div key={s.n} className="how-step">
                  <div className="how-step-num">{s.n}</div>
                  <div>
                    <div className="how-step-title">{s.t}</div>
                    <div className="how-step-desc">{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WHY CHOOSE US
      ══════════════════════════════════════════ */}
      <section className="section section-mid">
        <div className="container">
          <div className="section-header">
            <div className="eyebrow">Why Us</div>
            <h2 className="section-title">BUILT ON TRUST</h2>
          </div>

          <div className="why-grid">
            {[
              { icon: '🏅', t: 'ISI Certified Stock', d: 'Every product we sell is BIS/ISI certified. No spurious or uncertified material — ever.' },
              { icon: '💰', t: 'Best Price in Karur', d: 'Our buying power means you get wholesale rates whether you\'re buying 1 sheet or 1,000.' },
              { icon: '🚚', t: 'Same-Day Delivery', d: 'Free delivery within Karur for orders above ₹5,000. Delivered to your site.' },
              { icon: '🧑‍💼', t: 'Expert Guidance', d: '25+ years of experience. We help you pick the right grade and brand for your specific use.' },
              { icon: '🔖', t: 'GST Billing', d: 'Full GST invoices for contractors and businesses. All transactions transparent.' },
              { icon: '📞', t: 'Always Reachable', d: 'WhatsApp or call — we respond fast. No waiting on hold or automated systems.' },
            ].map(w => (
              <div key={w.t} className="why-card">
                <div className="why-icon">{w.icon}</div>
                <div className="why-title">{w.t}</div>
                <div className="why-desc">{w.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="section section-dark">
        <div className="container">
          <div className="section-header">
            <div className="eyebrow">Customer Reviews</div>
            <h2 className="section-title">WHAT CUSTOMERS SAY</h2>
          </div>

          <div className="review-grid">
            {(reviews.length > 0 ? reviews : [
              { id: 1, name: 'Ramesh Kumar', role: 'Contractor, Karur', rating: 5, message: 'Best plywood shop in Karur. Prices are competitive and quality is top notch. I use them for all my projects.' },
              { id: 2, name: 'Lakshmi Designs', role: 'Interior Designer, Trichy', rating: 5, message: 'Fast delivery and genuine ISI products. My clients are always happy with the quality from Karur Plywood.' },
              { id: 3, name: 'Karthik Homes', role: 'Builder, Namakkal', rating: 5, message: 'Bulk pricing is excellent. They have everything in stock and dispatch on the same day.' },
            ]).map((r: any) => (
              <div key={r.id} className="review-card">
                <div className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                <p className="review-msg">&ldquo;{r.message}&rdquo;</p>
                <div className="review-author">
                  <div className="review-avatar">{r.name.charAt(0)}</div>
                  <div>
                    <div className="review-name">{r.name}</div>
                    {r.role && <div className="review-role">{r.role}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════ */}
      <section className="section section-mid">
        <div className="container faq-container">
          <div>
            <div className="eyebrow">FAQ</div>
            <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>COMMON QUESTIONS</h2>
            <p style={{ fontSize: 14, color: '#7A8EA8', lineHeight: 1.8, marginBottom: 28 }}>
              Have more questions? WhatsApp us and we&apos;ll answer within minutes.
            </p>
            <a href={waUrl} target="_blank" rel="noopener" className="cta-wa" style={{ display: 'inline-flex' }}>
              💬 Ask on WhatsApp
            </a>
          </div>

          <div className="faq-list">
            {FAQS.map(f => (
              <details key={f.q} className="faq-item">
                <summary className="faq-q">{f.q}</summary>
                <div className="faq-a">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA BANNER
      ══════════════════════════════════════════ */}
      <section className="cta-banner">
        <div className="cta-banner-grid" />
        <div className="container cta-banner-inner">
          <div>
            <div className="eyebrow" style={{ color: 'rgba(249,115,22,0.7)' }}>Get Started Today</div>
            <h2 className="cta-banner-title">GET THE BEST PRICE<br />IN KARUR TODAY</h2>
            <p className="cta-banner-sub">Tell us what you need — we respond in minutes.</p>
          </div>
          <div className="cta-banner-actions">
            <a href={waUrl} target="_blank" rel="noopener" className="cta-wa cta-wa-lg">
              💬 WhatsApp Us Now
            </a>
            <a href={`tel:${PHONE_RAW}`} className="cta-call-lg">
              📞 {PHONE}
            </a>
            <Link href="/location" className="cta-location-link">
              📍 Visit Our Karur Showroom →
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        /* ── LAYOUT ── */
        .container { max-width: 1200px; margin: 0 auto; padding: 0 48px; }
        .section { padding: 80px 0; }
        .section-dark { background: #070F1F; }
        .section-mid { background: rgba(11,36,71,0.3); border-top: 1px solid rgba(249,115,22,0.08); }

        /* ── SECTION HEADER ── */
        .section-header { text-align: center; margin-bottom: 52px; }
        .eyebrow { font-family: 'Syne', sans-serif; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; color: #F97316; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .eyebrow::before, .eyebrow::after { content: ''; width: 20px; height: 1px; background: #F97316; }
        .section-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2rem, 4vw, 3rem); letter-spacing: 0.04em; color: #F8F9FB; line-height: 0.95; margin-bottom: 16px; }
        .section-desc { font-size: 14px; color: #7A8EA8; line-height: 1.8; max-width: 500px; margin: 0 auto; }

        /* ── HERO ── */
        .hero-section { position: relative; min-height: 100vh; display: flex; flex-direction: column; background: linear-gradient(160deg, #0a1d3a 0%, #070F1F 100%); border-bottom: 1px solid rgba(249,115,22,0.15); padding-top: 58px; overflow: hidden; }
        .hero-bg-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px); background-size: 60px 60px; pointer-events: none; }
        .hero-orange-glow { position: absolute; top: -200px; right: -200px; width: 600px; height: 600px; background: radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%); pointer-events: none; }
        .hero-inner { flex: 1; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 60px; align-items: center; padding-top: 80px; padding-bottom: 80px; }
        .hero-copy { position: relative; z-index: 2; }
        .eyebrow-pill { display: inline-flex; align-items: center; gap: 8px; background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.25); border-radius: 100px; padding: 5px 16px; font-family: 'Syne', sans-serif; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #F97316; margin-bottom: 24px; }
        .eyebrow-dot { width: 6px; height: 6px; background: #F97316; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
        .hero-h1 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(3.5rem, 7vw, 6rem); letter-spacing: 0.04em; line-height: 0.9; color: #F8F9FB; margin-bottom: 24px; }
        .hero-h1-orange { color: #F97316; }
        .hero-sub { font-size: 14px; color: #7A8EA8; line-height: 1.85; max-width: 480px; margin-bottom: 32px; font-weight: 300; }
        .hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 36px; }
        .cta-wa { display: inline-flex; align-items: center; gap: 8px; padding: 13px 24px; background: #25D366; color: white; border-radius: 6px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; transition: background 0.2s, transform 0.2s, box-shadow 0.2s; white-space: nowrap; }
        .cta-wa:hover { background: #1fbc59; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,211,102,0.4); }
        .cta-outline { display: inline-flex; align-items: center; padding: 13px 24px; border: 1px solid rgba(249,115,22,0.4); color: #F97316; border-radius: 6px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; transition: all 0.2s; }
        .cta-outline:hover { background: rgba(249,115,22,0.1); border-color: #F97316; }
        .cta-outline-orange { display: inline-flex; align-items: center; padding: 12px 28px; border: 2px solid #F97316; color: #F97316; border-radius: 6px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; transition: all 0.2s; }
        .cta-outline-orange:hover { background: #F97316; color: #0B2447; }
        .hero-trust { display: flex; gap: 10px; flex-wrap: wrap; }
        .trust-chip { display: flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #7A8EA8; background: rgba(249,115,22,0.06); border: 1px solid rgba(249,115,22,0.14); border-radius: 3px; padding: 5px 10px; }
        .trust-check { color: #F97316; }

        /* Hero stats panel */
        .hero-stats-panel { position: relative; z-index: 2; }
        .hero-stats-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
        .stat-box { background: rgba(25,55,109,0.4); border: 1px solid rgba(249,115,22,0.15); border-radius: 10px; padding: 22px 18px; text-align: center; }
        .stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 2.4rem; letter-spacing: 0.04em; color: #F97316; line-height: 1; }
        .stat-lbl { font-family: 'Syne', sans-serif; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #7A8EA8; margin-top: 5px; }
        .hero-contact-card { background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.2); border-radius: 10px; padding: 18px 20px; text-align: center; }
        .hero-contact-label { font-family: 'Syne', sans-serif; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #7A8EA8; margin-bottom: 8px; }
        .hero-contact-phone { display: block; font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem; letter-spacing: 0.06em; color: #F8F9FB; text-decoration: none; transition: color 0.2s; margin-bottom: 4px; }
        .hero-contact-phone:hover { color: #F97316; }
        .hero-contact-hours { font-size: 11px; color: #7A8EA8; }

        /* Brand strip */
        .brand-strip { border-top: 1px solid rgba(249,115,22,0.1); background: rgba(7,15,31,0.6); padding: 16px 0; }
        .brand-strip-inner { max-width: 1200px; margin: 0 auto; padding: 0 48px; display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
        .brand-strip-label { font-family: 'Syne', sans-serif; font-size: 0.58rem; font-weight: 700; letter-spacing: 0.24em; text-transform: uppercase; color: #F97316; white-space: nowrap; }
        .brand-name { font-family: 'Syne', sans-serif; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #7A8EA8; padding: 4px 12px; border-left: 1px solid rgba(249,115,22,0.15); }

        /* ── CATEGORIES ── */
        .cat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .cat-card { display: flex; flex-direction: column; gap: 16px; background: rgba(25,55,109,0.35); border: 1px solid rgba(249,115,22,0.15); border-radius: 12px; padding: 28px 22px; text-decoration: none; transition: all 0.25s; position: relative; overflow: hidden; }
        .cat-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(249,115,22,0.0), rgba(249,115,22,0.06)); opacity: 0; transition: opacity 0.25s; }
        .cat-card:hover { border-color: #F97316; transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.4); }
        .cat-card:hover::before { opacity: 1; }
        .cat-icon-wrap { width: 52px; height: 52px; background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .cat-emoji { font-size: 24px; }
        .cat-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1rem; color: #F8F9FB; margin-bottom: 4px; }
        .cat-cta { font-size: 0.72rem; color: #F97316; font-family: 'Syne', sans-serif; font-weight: 700; letter-spacing: 0.08em; }
        .cat-arrow { position: absolute; top: 20px; right: 20px; font-size: 18px; color: rgba(249,115,22,0.3); transition: color 0.25s; }
        .cat-card:hover .cat-arrow { color: #F97316; }

        /* ── PRODUCTS ── */
        .prod-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
        .prod-card { background: rgba(25,55,109,0.35); border: 1px solid rgba(249,115,22,0.12); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; transition: all 0.28s; }
        .prod-card:hover { border-color: rgba(249,115,22,0.4); transform: translateY(-5px); box-shadow: 0 16px 40px rgba(0,0,0,0.4); }
        .prod-img-wrap { position: relative; height: 180px; background: rgba(11,36,71,0.6); flex-shrink: 0; overflow: hidden; }
        .prod-img-placeholder { height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px; }
        .prod-cat-badge { position: absolute; top: 8px; left: 8px; background: rgba(7,15,31,0.85); border: 1px solid rgba(249,115,22,0.3); border-radius: 3px; padding: 2px 8px; font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #F97316; }
        .prod-body { padding: 16px 18px 18px; flex: 1; display: flex; flex-direction: column; }
        .prod-name { font-family: 'Syne', sans-serif; font-size: 0.88rem; font-weight: 700; color: #F8F9FB; line-height: 1.35; margin-bottom: 6px; }
        .prod-desc { font-size: 0.72rem; color: #7A8EA8; line-height: 1.6; flex: 1; margin-bottom: 10px; }
        .prod-price-row { display: flex; align-items: baseline; gap: 4px; margin-bottom: 12px; }
        .prod-price { font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem; color: #F97316; letter-spacing: 0.03em; }
        .prod-unit { font-size: 0.68rem; color: #7A8EA8; }
        .prod-wa-btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 0; border-radius: 5px; background: #25D366; color: white; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; transition: background 0.2s; }
        .prod-wa-btn:hover { background: #1fbc59; }
        .prod-empty { text-align: center; padding: 80px 0; }

        /* ── HOW TO ORDER ── */
        .how-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .how-modes { display: flex; flex-direction: column; gap: 12px; }
        .how-mode-card { display: flex; gap: 14px; align-items: flex-start; background: rgba(25,55,109,0.35); border: 1px solid rgba(249,115,22,0.14); border-radius: 10px; padding: 18px; text-decoration: none; transition: all 0.25s; }
        .how-mode-card:hover { border-color: #F97316; transform: translateX(4px); }
        .how-mode-icon { font-size: 22px; flex-shrink: 0; width: 44px; height: 44px; background: rgba(249,115,22,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .how-mode-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.9rem; color: #F8F9FB; margin-bottom: 3px; }
        .how-mode-desc { font-size: 0.75rem; color: #7A8EA8; line-height: 1.6; }
        .how-steps { display: flex; flex-direction: column; gap: 0; }
        .how-step { display: flex; gap: 20px; align-items: flex-start; padding: 22px 0; border-bottom: 1px solid rgba(249,115,22,0.08); }
        .how-step:last-child { border-bottom: none; }
        .how-step-num { font-family: 'Bebas Neue', sans-serif; font-size: 2.5rem; letter-spacing: 0.04em; color: rgba(249,115,22,0.18); line-height: 1; flex-shrink: 0; width: 52px; }
        .how-step-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.92rem; color: #F8F9FB; margin-bottom: 4px; }
        .how-step-desc { font-size: 0.78rem; color: #7A8EA8; line-height: 1.65; }

        /* ── WHY CHOOSE US ── */
        .why-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .why-card { background: rgba(25,55,109,0.25); border: 1px solid rgba(249,115,22,0.1); border-radius: 10px; padding: 26px 22px; transition: all 0.25s; }
        .why-card:hover { border-color: rgba(249,115,22,0.3); background: rgba(25,55,109,0.4); }
        .why-icon { font-size: 28px; margin-bottom: 12px; }
        .why-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.92rem; color: #F8F9FB; margin-bottom: 8px; }
        .why-desc { font-size: 0.78rem; color: #7A8EA8; line-height: 1.7; }

        /* ── REVIEWS ── */
        .review-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .review-card { background: rgba(25,55,109,0.35); border: 1px solid rgba(249,115,22,0.12); border-radius: 10px; padding: 24px 22px; }
        .review-stars { color: #F97316; font-size: 16px; margin-bottom: 12px; }
        .review-msg { font-size: 13px; color: #A8BCCC; line-height: 1.75; font-style: italic; flex: 1; margin-bottom: 18px; }
        .review-author { display: flex; align-items: center; gap: 12px; }
        .review-avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #F97316, #FF9A45); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #0B2447; flex-shrink: 0; }
        .review-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.85rem; color: #F8F9FB; }
        .review-role { font-size: 0.72rem; color: #7A8EA8; margin-top: 2px; }

        /* ── FAQ ── */
        .faq-container { display: grid; grid-template-columns: 1fr 1.5fr; gap: 60px; align-items: start; }
        .faq-list { display: flex; flex-direction: column; gap: 10px; }
        .faq-item { background: rgba(25,55,109,0.25); border: 1px solid rgba(249,115,22,0.12); border-radius: 8px; overflow: hidden; transition: border-color 0.2s; }
        .faq-item[open] { border-color: rgba(249,115,22,0.3); }
        .faq-q { padding: 16px 20px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.88rem; color: #F8F9FB; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; }
        .faq-q::after { content: '+'; color: #F97316; font-size: 18px; flex-shrink: 0; }
        .faq-item[open] .faq-q::after { content: '−'; }
        .faq-a { padding: 0 20px 16px; font-size: 13px; color: #7A8EA8; line-height: 1.75; }

        /* ── CTA BANNER ── */
        .cta-banner { position: relative; background: linear-gradient(135deg, #0a1d3a, #0d2545); border-top: 1px solid rgba(249,115,22,0.2); padding: 80px 0; overflow: hidden; }
        .cta-banner-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(249,115,22,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.05) 1px, transparent 1px); background-size: 60px 60px; pointer-events: none; }
        .cta-banner-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; position: relative; z-index: 2; }
        .cta-banner-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.5rem, 4vw, 3.8rem); letter-spacing: 0.04em; color: #F8F9FB; line-height: 0.95; margin-bottom: 14px; }
        .cta-banner-sub { font-size: 14px; color: #7A8EA8; line-height: 1.8; }
        .cta-banner-actions { display: flex; flex-direction: column; gap: 14px; align-items: flex-start; }
        .cta-wa-lg { font-size: 0.88rem; padding: 15px 30px; }
        .cta-call-lg { display: inline-flex; align-items: center; padding: 14px 28px; background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.35); color: #F97316; border-radius: 6px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.85rem; letter-spacing: 0.06em; text-decoration: none; transition: all 0.2s; }
        .cta-call-lg:hover { background: rgba(249,115,22,0.18); }
        .cta-location-link { font-size: 0.75rem; font-family: 'Syne', sans-serif; font-weight: 700; letter-spacing: 0.08em; color: #7A8EA8; text-decoration: none; transition: color 0.2s; }
        .cta-location-link:hover { color: #F97316; }

        /* ── RESPONSIVE ── */
        @media (max-width: 1100px) {
          .hero-inner { grid-template-columns: 1fr; gap: 40px; padding-top: 60px; }
          .hero-stats-panel { display: none; }
          .cat-grid { grid-template-columns: repeat(2, 1fr); }
          .prod-grid { grid-template-columns: repeat(2, 1fr); }
          .why-grid { grid-template-columns: repeat(2, 1fr); }
          .review-grid { grid-template-columns: 1fr; }
          .faq-container { grid-template-columns: 1fr; }
          .how-grid { grid-template-columns: 1fr; }
          .cta-banner-inner { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .container { padding: 0 20px; }
          .section { padding: 56px 0; }
          .cat-grid { grid-template-columns: 1fr 1fr; }
          .prod-grid { grid-template-columns: 1fr; }
          .why-grid { grid-template-columns: 1fr; }
          .hero-h1 { font-size: clamp(3rem, 12vw, 4.5rem); }
          .brand-strip-inner { padding: 0 20px; gap: 12px; }
          .brand-name { font-size: 0.62rem; }
        }
      `}</style>
    </main>
  );
}
