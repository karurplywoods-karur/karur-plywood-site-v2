// src/app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/db';
import { LocalBusinessSchema } from '@/components/JsonLd';
import RecentlyViewed from '@/components/RecentlyViewed';
import { CONTACT } from '@/lib/contact';
import { getBrands } from '@/lib/products';

const WA = CONTACT.wa;
const PHONE = CONTACT.phone;
const PHONE_RAW = CONTACT.phoneRaw;

// Fetch featured project products (top 4 by sort_order)

// Fallback photos for categories that don't have a real image_url uploaded yet.
// Keeps the grid looking like a photo grid instead of showing raw icon glyphs.
const CATEGORY_FALLBACK_IMG: Record<string, string> = {
  'waterproof-plywood': '/images/cat-waterproof-plywood.jpg',
  'commercial-plywood': '/images/cat-commercial-plywood.jpg',
  'mdf-board': '/images/cat-mdf-board.jpg',
  'hdhmr-board': '/images/cat-hdhmr-board.jpg',
  'block-board': '/images/cat-block-board.jpg',
  'flush-door': '/images/cat-flush-door.jpg',
  'plywood': '/images/cat-plywood.jpg',
  'laminates': '/images/cat-laminates.jpg',
  'laminate': '/images/cat-laminate.jpg',
  'hardware': '/images/cat-hardware.jpg',
  'doors': '/images/cat-doors.jpg',
  'adhesives': '/images/cat-adhesives.jpg',
  'accessories': '/images/cat-accessories.jpg',
  'veneer': '/images/cat-veneer.jpg',
};

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
    .limit(6);
  return data || [];
}


// Fetch latest blog posts
async function getLatestPosts() {
  const { data } = await supabase
    .from('blog_posts')
    .select('id,title,slug,excerpt,cover_image,category,published_at,read_time')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(4);
  return data || [];
}

const FAQS = [
  { q: 'What brands of plywood do you stock?', a: 'We stock Century, Sharon, Unibind, Greenply and other top brands — all ISI-certified.' },
  { q: 'Do you offer wholesale pricing for contractors?', a: 'Yes! Contractors, builders and carpenters get special wholesale rates. WhatsApp us with your requirement for bulk pricing.' },
  { q: 'What areas do you deliver to?', a: 'We deliver across Karur, Trichy, Namakkal, Erode, Salem and Dindigul. Same-day dispatch for Karur orders above ₹5,000.' },
  { q: 'Can I visit your showroom?', a: `Absolutely. We're open ${CONTACT.hours} and closed on Sunday at ${CONTACT.address}.` },
];

export default async function HomePage() {
  const [products, reviews, categories, posts, brands] = await Promise.all([
    getFeaturedProducts(),
    getReviews(),
    getCategories(),
    getLatestPosts(),
    getBrands(),
  ]);

  const waUrl = `https://wa.me/${WA}?text=Hi%2C+I%27m+interested+in+plywood+for+my+project.+Can+you+help+with+pricing%3F`;

  return (
    <main>
      <LocalBusinessSchema />

      {/* ══════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════ */}
      <section className="hero-section">
        <div className="hero-overlay" />

        <div className="container hero-inner">
          <div className="hero-copy">
            <div className="eyebrow-pill">
              <span className="eyebrow-dot" />
              Karur&apos;s Most Trusted Since 1999
            </div>

            <h1 className="hero-h1">
              PREMIUM MATERIALS.<br />
              <span className="hero-h1-orange">BEAUTIFUL SPACES.</span>
            </h1>

            <p className="hero-sub">
              Plywood | Laminates | Hardware | Doors | Adhesives<br />
              For architects, interior designers &amp; builders. All major brands, wholesale &amp; retail prices.
            </p>

            <div className="hero-ctas">
              <Link href="/products" className="cta-solid">Explore Products</Link>
              <Link href="/bom-quote" className="cta-outline-light">Upload BOM</Link>
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
        </div>
      </section>

      {/* Feature strip */}
      <div className="stats-strip">
        <div className="container stats-strip-inner">
          {[
            { i: '🛡️', t: '100% Original Products', d: 'Sourced from trusted brands' },
            { i: '✓', t: 'Best Price Guarantee', d: 'Get the best price always' },
            { i: '🚚', t: 'Fast Delivery Across India', d: 'Quick & reliable delivery' },
            { i: '🔒', t: 'Secure Payments', d: '100% safe & secure' },
            { i: '🎧', t: 'Expert Support', d: 'We are here to help' },
          ].map(s => (
            <div key={s.t} className="stat-item">
              <span className="stat-item-icon">{s.i}</span>
              <div>
                <div className="stat-item-num" style={{ fontFamily: "'Syne',sans-serif", fontSize: '0.82rem', fontWeight: 700 }}>{s.t}</div>
                <div className="stat-item-lbl">{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          CATEGORIES
      ══════════════════════════════════════════ */}
      <section className="section section-dark">
        <div className="container">
          <div className="section-header-row">
            <h2 className="section-title-left">SHOP BY CATEGORY</h2>
            <Link href="/products" className="section-view-all">View All Categories →</Link>
          </div>

          <div className="cat-grid">
            {(categories.length > 0 ? categories : [
              { slug: 'plywood', name: 'Plywood', id: '1' },
              { slug: 'laminates', name: 'Laminates', id: '2' },
              { slug: 'hardware', name: 'Hardware', id: '3' },
              { slug: 'doors', name: 'Doors', id: '4' },
              { slug: 'adhesives', name: 'Adhesives', id: '5' },
              { slug: 'accessories', name: 'Accessories', id: '6' },
            ]).map((cat: any) => (
              <Link key={cat.id} href={`/category/${cat.slug}`} className="cat-card">
                <div className="cat-card-img">
                  <Image
                    src={cat.image_url || CATEGORY_FALLBACK_IMG[cat.slug] || '/images/cat-generic.jpg'}
                    alt={cat.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width:768px) 50vw, 16vw"
                  />
                  <span className="cat-arrow">↗</span>
                </div>
                <div className="cat-name">{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          POPULAR BRANDS
      ══════════════════════════════════════════ */}
      <section className="section section-mid" style={{ paddingTop: 56, paddingBottom: 56 }}>
        <div className="container">
          <div className="section-header-row">
            <h2 className="section-title-left">POPULAR BRANDS</h2>
            <Link href="/brands" className="section-view-all">View All Brands →</Link>
          </div>
          <div className="brand-row">
            {(brands.length > 0 ? brands : [
              { slug: 'centuryply', name: 'CenturyPly' }, { slug: 'greenlam', name: 'Greenlam' },
              { slug: 'hafele', name: 'Häfele' }, { slug: 'hettich', name: 'Hettich' },
              { slug: 'ebco', name: 'Ebco' }, { slug: 'sleek', name: 'Sleek' },
              { slug: 'fevicol', name: 'Fevicol' }, { slug: 'virgo', name: 'Virgo' },
            ]).map((b: any) => (
              <Link key={b.slug} href={`/brands/${b.slug}`} className="brand-chip">
                {b.logo_url
                  ? <Image src={b.logo_url} alt={b.name} fill style={{ objectFit: 'contain', padding: 14 }} sizes="150px" />
                  : <span>{b.name}</span>}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ABOUT US
      ══════════════════════════════════════════ */}
      <section className="section">
        <div className="container about-grid">
          <div>
            <div className="eyebrow" style={{ justifyContent: 'flex-start' }}>Trusted By Professionals. Chosen For Quality.</div>
            <h2 className="about-title">About Karur Plywood &amp; Company</h2>
            <p className="about-desc">
              For over 20 years, we have been providing premium quality plywood, laminates, hardware and more to thousands of happy customers.
              We believe in building long-term relationships through trust, quality products and reliable service.
            </p>
            <div className="about-stats">
              {[
                { n: '20+', l: 'Years of Trust' },
                { n: '10,000+', l: 'Happy Customers' },
                { n: '500+', l: 'Products' },
                { n: '25+', l: 'Top Brands' },
              ].map(s => (
                <div key={s.l} className="about-stat">
                  <div className="about-stat-num">{s.n}</div>
                  <div className="about-stat-lbl">{s.l}</div>
                </div>
              ))}
            </div>
            <Link href="/about" className="cta-solid-navy">Know More About Us →</Link>
          </div>
          <div className="about-img-wrap">
            <Image src="/images/about-showroom.jpg" alt="Karur Plywood showroom" fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 50vw" />
            <div className="about-badge">
              <span className="about-badge-icon">✓</span>
              <div>
                <div className="about-badge-num">20+</div>
                <div className="about-badge-lbl">Years of Trust</div>
              </div>
            </div>
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
              <div style={{ fontSize: 16, color: '#6B7280', marginBottom: 20 }}>Products are being added. Check back soon!</div>
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
              <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.8, marginBottom: 28 }}>
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
      <section className="why-band">
        <div className="container">
          <div className="section-header">
            <div className="eyebrow" style={{ color: '#F07316' }}>Why Choose Us</div>
          </div>

          <div className="why-grid-dark">
            {[
              { icon: '⇄', t: 'Wide Range', d: 'Extensive collection of premium products' },
              { icon: '🤝', t: 'Quality Assured', d: 'Only 100% original branded products' },
              { icon: '💼', t: 'Competitive Pricing', d: 'Best prices & exclusive offers for you' },
              { icon: '🎧', t: 'Expert Guidance', d: 'Get the right advice from our experts' },
              { icon: '🚚', t: 'Timely Delivery', d: 'Fast & safe delivery across India' },
            ].map(w => (
              <div key={w.t} className="why-dark-item">
                <div className="why-dark-icon">{w.icon}</div>
                <div className="why-dark-title">{w.t}</div>
                <div className="why-dark-desc">{w.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          GET INSPIRED (BLOG)
      ══════════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <div className="section-header-row">
            <h2 className="section-title-left">GET INSPIRED</h2>
            <Link href="/blog" className="section-view-all">View All Articles →</Link>
          </div>

          <div className="blog-grid">
            {(posts.length > 0 ? posts : [
              { id: 1, slug: '#', title: 'Marine Plywood vs BWP Plywood — Which One Should You Choose?', published_at: '2024-05-01', read_time: 5 },
              { id: 2, slug: '#', title: 'How to Choose the Right Laminates for Your Home', published_at: '2024-04-28', read_time: 4 },
              { id: 3, slug: '#', title: 'Top 5 Hardware Trends in 2024', published_at: '2024-04-25', read_time: 3 },
              { id: 4, slug: '#', title: 'Plywood Care Tips for Long Lasting Life', published_at: '2024-04-20', read_time: 4 },
            ]).map((p: any) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="blog-card">
                <div className="blog-card-img">
                  {p.cover_image ? (
                    <Image src={p.cover_image} alt={p.title} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 25vw" />
                  ) : (
                    <div className="blog-card-img-fallback">📰</div>
                  )}
                </div>
                <div className="blog-card-body">
                  <div className="blog-card-title">{p.title}</div>
                  <div className="blog-card-meta">
                    {new Date(p.published_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · {p.read_time || 4} min read
                  </div>
                </div>
              </Link>
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
            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.8, marginBottom: 28 }}>
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
            <div className="eyebrow" style={{ justifyContent: 'flex-start', color: '#FF9A45' }}>Have A Project In Mind?</div>
            <h2 className="cta-banner-title">UPLOAD YOUR BOM<br />&amp; GET THE BEST<br />QUOTE IN MINUTES.</h2>
            <p className="cta-banner-sub">Save time. Save money. Build better with us.</p>
            <div className="cta-banner-actions">
              <Link href="/bom-quote" className="cta-solid">📤 Upload BOM Now</Link>
              <a href={`tel:${PHONE_RAW}`} className="cta-outline-light">📞 {PHONE}</a>
            </div>
          </div>
          <div className="cta-banner-img">
            <Image src="/images/plywood-stack.jpg" alt="Stacked plywood sheets" fill style={{ objectFit: 'cover' }} sizes="(max-width:900px) 0px, 45vw" />
          </div>
        </div>
      </section>

      <style>{`
        /* ── LAYOUT ── */
        .container { max-width: 1200px; margin: 0 auto; padding: 0 48px; }
        .section { padding: 80px 0; }
        .section-dark { background: #F7F4F0; }
        .section-mid { background: #FAF8F5; border-top: 1px solid #E5E1DC; border-bottom: 1px solid #E5E1DC; }

        /* ── SECTION HEADER ── */
        .section-header { text-align: center; margin-bottom: 52px; }
        .eyebrow { font-family: 'Syne', sans-serif; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; color: #F07316; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .eyebrow::before, .eyebrow::after { content: ''; width: 20px; height: 1px; background: #F07316; }
        .section-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2rem, 4vw, 3rem); letter-spacing: 0.04em; color: #0B2447; line-height: 0.95; margin-bottom: 16px; }
        .section-desc { font-size: 14px; color: #6B7280; line-height: 1.8; max-width: 500px; margin: 0 auto; }

        /* ── HERO ── */
        .hero-section { position: relative; min-height: 620px; display: flex; align-items: center; padding-top: 58px; overflow: hidden;
          background: linear-gradient(160deg, #0a1d3a 0%, #070F1F 100%);
          background-image: linear-gradient(100deg, rgba(7,15,31,0.92) 0%, rgba(7,15,31,0.72) 42%, rgba(7,15,31,0.35) 75%, rgba(7,15,31,0.15) 100%), url('/images/hero-showroom.jpg');
          background-size: cover; background-position: center; }
        .hero-overlay { position: absolute; inset: 0; pointer-events: none; }
        .hero-inner { padding: 100px 0 76px; position: relative; z-index: 2; }
        .hero-copy { max-width: 620px; }
        .eyebrow-pill { display: inline-flex; align-items: center; gap: 8px; background: rgba(249,115,22,0.12); border: 1px solid rgba(249,115,22,0.3); border-radius: 100px; padding: 5px 16px; font-family: 'Syne', sans-serif; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #FF9A45; margin-bottom: 24px; }
        .eyebrow-dot { width: 6px; height: 6px; background: #F97316; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
        .hero-h1 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.6rem, 5.2vw, 4.4rem); letter-spacing: 0.03em; line-height: 1.02; color: #FFFFFF; margin-bottom: 22px; }
        .hero-h1-orange { color: #F07316; }
        .hero-sub { font-size: 15px; color: #E5E1DC; line-height: 1.85; max-width: 480px; margin-bottom: 32px; font-weight: 300; }
        .hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 32px; }
        .cta-solid { display: inline-flex; align-items: center; padding: 14px 28px; background: #F07316; color: #FFFFFF; border-radius: 6px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; transition: all 0.2s; }
        .cta-solid:hover { background: #D9640F; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(240,115,22,0.4); }
        .cta-outline-light { display: inline-flex; align-items: center; padding: 14px 28px; border: 1.5px solid rgba(255,255,255,0.55); color: #FFFFFF; border-radius: 6px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; transition: all 0.2s; }
        .cta-outline-light:hover { background: rgba(255,255,255,0.12); border-color: #FFFFFF; }
        .cta-wa { display: inline-flex; align-items: center; gap: 8px; padding: 13px 24px; background: #25D366; color: white; border-radius: 6px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; transition: background 0.2s, transform 0.2s, box-shadow 0.2s; white-space: nowrap; }
        .cta-wa:hover { background: #1fbc59; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,211,102,0.4); }
        .cta-outline { display: inline-flex; align-items: center; padding: 13px 24px; border: 1px solid rgba(240,115,22,0.4); color: #F07316; border-radius: 6px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; transition: all 0.2s; }
        .cta-outline:hover { background: rgba(240,115,22,0.08); border-color: #F07316; }
        .cta-outline-orange { display: inline-flex; align-items: center; padding: 12px 28px; border: 2px solid #F07316; color: #F07316; border-radius: 6px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; transition: all 0.2s; }
        .cta-outline-orange:hover { background: #F07316; color: #FFFFFF; }
        .hero-trust { display: flex; gap: 10px; flex-wrap: wrap; }
        .trust-chip { display: flex; align-items: center; gap: 6px; font-family: 'Syne', sans-serif; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #E5E1DC; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.16); border-radius: 3px; padding: 5px 10px; }
        .trust-check { color: #F07316; }

        /* Stats strip (below hero) */
        .stats-strip { background: #FFFFFF; border-bottom: 1px solid #E5E1DC; padding: 26px 0; }
        .stats-strip-inner { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .stat-item { display: flex; align-items: center; gap: 14px; }
        .stat-item-icon { font-size: 26px; flex-shrink: 0; }
        .stat-item-num { font-family: 'Bebas Neue', sans-serif; font-size: 1.7rem; letter-spacing: 0.03em; color: #0B2447; line-height: 1; }
        .stat-item-lbl { font-family: 'Syne', sans-serif; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.06em; color: #6B7280; margin-top: 3px; }

        /* ── SECTION HEADER (left-aligned row) ── */
        .section-header-row { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 28px; }
        .section-title-left { font-family: 'Bebas Neue', sans-serif; font-size: clamp(1.5rem, 2.6vw, 2rem); letter-spacing: 0.04em; color: #0B2447; }
        .section-view-all { font-family: 'Syne', sans-serif; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; color: #F07316; text-decoration: none; white-space: nowrap; }
        .section-view-all:hover { text-decoration: underline; }

        /* ── CATEGORIES (image tiles) ── */
        .cat-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; }
        .cat-card { display: block; text-decoration: none; }
        .cat-card-img { position: relative; aspect-ratio: 1/1; border-radius: 10px; overflow: hidden; background: #F2EDE5; margin-bottom: 10px; }
        .cat-card-img-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 34px; background: linear-gradient(135deg,#EDE6DB,#DCD0BE); }
        .cat-arrow { position: absolute; bottom: 8px; right: 8px; width: 24px; height: 24px; background: #F07316; color: #FFFFFF; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 13px; }
        .cat-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.82rem; color: #0B2447; }

        /* ── BRANDS ── */
        .brand-row { display: flex; gap: 14px; overflow-x: auto; padding: 4px 2px 10px; scroll-behavior: smooth; }
        .brand-chip { position: relative; flex: 0 0 150px; height: 74px; display: flex; align-items: center; justify-content: center; background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 8px; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.78rem; letter-spacing: 0.03em; text-transform: uppercase; color: #0B2447; text-align: center; text-decoration: none; transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
        .brand-chip:hover { transform: translateY(-4px) scale(1.04); box-shadow: 0 12px 24px rgba(11,36,71,0.12); border-color: rgba(240,115,22,0.4); }
        .brand-row::-webkit-scrollbar { height: 6px; }
        .brand-row::-webkit-scrollbar-thumb { background: rgba(240,115,22,0.25); border-radius: 3px; }

        /* ── ABOUT ── */
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
        .about-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(1.8rem, 3.4vw, 2.6rem); letter-spacing: 0.02em; color: #0B2447; line-height: 1.1; margin: 10px 0 16px; }
        .about-desc { font-size: 14px; color: #6B7280; line-height: 1.85; margin-bottom: 26px; max-width: 480px; }
        .about-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
        .about-stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 1.7rem; color: #0B2447; letter-spacing: 0.02em; }
        .about-stat-lbl { font-size: 0.68rem; color: #6B7280; font-family: 'Syne', sans-serif; font-weight: 600; margin-top: 2px; }
        .cta-solid-navy { display: inline-flex; align-items: center; padding: 13px 26px; background: #0B2447; color: #FFFFFF; border-radius: 6px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.76rem; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; transition: all 0.2s; }
        .cta-solid-navy:hover { background: #163363; transform: translateY(-2px); }
        .about-img-wrap { position: relative; aspect-ratio: 4/3.4; border-radius: 14px; overflow: hidden; background: #F2EDE5; }
        .about-badge { position: absolute; bottom: 18px; right: 18px; background: #0B2447; border-radius: 10px; padding: 12px 18px; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 30px rgba(11,36,71,0.35); }
        .about-badge-icon { width: 26px; height: 26px; border-radius: 50%; background: #F07316; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
        .about-badge-num { font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; color: #FFFFFF; line-height: 1; }
        .about-badge-lbl { font-size: 0.6rem; color: #C7D2E0; font-family: 'Syne', sans-serif; text-transform: uppercase; letter-spacing: 0.06em; }

        /* ── WHY CHOOSE US (dark band) ── */
        .why-band { background: #0B2447; padding: 64px 0; }
        .why-grid-dark { display: grid; grid-template-columns: repeat(5, 1fr); gap: 24px; text-align: center; }
        .why-dark-icon { width: 54px; height: 54px; margin: 0 auto 14px; border: 1.5px solid rgba(240,115,22,0.5); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #F07316; }
        .why-dark-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.85rem; color: #FFFFFF; margin-bottom: 6px; }
        .why-dark-desc { font-size: 0.72rem; color: #93A3BC; line-height: 1.6; }

        /* ── BLOG / GET INSPIRED ── */
        .blog-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
        .blog-card { display: block; text-decoration: none; background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; overflow: hidden; transition: all 0.25s; }
        .blog-card:hover { transform: translateY(-4px); box-shadow: 0 14px 30px rgba(11,36,71,0.1); border-color: rgba(240,115,22,0.3); }
        .blog-card-img { position: relative; aspect-ratio: 4/3; background: #F2EDE5; }
        .blog-card-img-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 32px; background: linear-gradient(135deg,#EDE6DB,#DCD0BE); }
        .blog-card-body { padding: 14px 16px 18px; }
        .blog-card-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.82rem; color: #0B2447; line-height: 1.4; margin-bottom: 8px; }
        .blog-card-meta { font-size: 0.68rem; color: #9CA3AF; }

        /* ── PRODUCTS ── */
        .prod-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
        .prod-card { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; transition: all 0.28s; box-shadow: 0 1px 4px rgba(11,36,71,0.05); }
        .prod-card:hover { border-color: rgba(240,115,22,0.4); transform: translateY(-5px); box-shadow: 0 16px 32px rgba(11,36,71,0.12); }
        .prod-img-wrap { position: relative; height: 180px; background: #F2EDE5; flex-shrink: 0; overflow: hidden; }
        .prod-img-placeholder { height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px; }
        .prod-cat-badge { position: absolute; top: 8px; left: 8px; background: #FFFFFF; border: 1px solid rgba(240,115,22,0.3); border-radius: 3px; padding: 2px 8px; font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #F07316; }
        .prod-body { padding: 16px 18px 18px; flex: 1; display: flex; flex-direction: column; }
        .prod-name { font-family: 'Syne', sans-serif; font-size: 0.88rem; font-weight: 700; color: #0B2447; line-height: 1.35; margin-bottom: 6px; }
        .prod-desc { font-size: 0.72rem; color: #6B7280; line-height: 1.6; flex: 1; margin-bottom: 10px; }
        .prod-price-row { display: flex; align-items: baseline; gap: 4px; margin-bottom: 12px; }
        .prod-price { font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem; color: #F07316; letter-spacing: 0.03em; }
        .prod-unit { font-size: 0.68rem; color: #6B7280; }
        .prod-wa-btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 0; border-radius: 5px; background: #25D366; color: white; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; transition: background 0.2s; }
        .prod-wa-btn:hover { background: #1fbc59; }
        .prod-empty { text-align: center; padding: 80px 0; }

        /* ── HOW TO ORDER ── */
        .how-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .how-modes { display: flex; flex-direction: column; gap: 12px; }
        .how-mode-card { display: flex; gap: 14px; align-items: flex-start; background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; padding: 18px; text-decoration: none; transition: all 0.25s; box-shadow: 0 1px 4px rgba(11,36,71,0.05); }
        .how-mode-card:hover { border-color: #F07316; transform: translateX(4px); }
        .how-mode-icon { font-size: 22px; flex-shrink: 0; width: 44px; height: 44px; background: #FFF4ED; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .how-mode-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.9rem; color: #0B2447; margin-bottom: 3px; }
        .how-mode-desc { font-size: 0.75rem; color: #6B7280; line-height: 1.6; }
        .how-steps { display: flex; flex-direction: column; gap: 0; }
        .how-step { display: flex; gap: 20px; align-items: flex-start; padding: 22px 0; border-bottom: 1px solid #E5E1DC; }
        .how-step:last-child { border-bottom: none; }
        .how-step-num { font-family: 'Bebas Neue', sans-serif; font-size: 2.5rem; letter-spacing: 0.04em; color: rgba(240,115,22,0.25); line-height: 1; flex-shrink: 0; width: 52px; }
        .how-step-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.92rem; color: #0B2447; margin-bottom: 4px; }
        .how-step-desc { font-size: 0.78rem; color: #6B7280; line-height: 1.65; }

        /* ── WHY CHOOSE US ── */
        .why-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .why-card { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; padding: 26px 22px; transition: all 0.25s; box-shadow: 0 1px 4px rgba(11,36,71,0.05); }
        .why-card:hover { border-color: rgba(240,115,22,0.35); box-shadow: 0 12px 28px rgba(11,36,71,0.1); }
        .why-icon { font-size: 28px; margin-bottom: 12px; }
        .why-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.92rem; color: #0B2447; margin-bottom: 8px; }
        .why-desc { font-size: 0.78rem; color: #6B7280; line-height: 1.7; }

        /* ── REVIEWS ── */
        .review-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .review-card { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; padding: 24px 22px; box-shadow: 0 1px 4px rgba(11,36,71,0.05); }
        .review-stars { color: #F07316; font-size: 16px; margin-bottom: 12px; }
        .review-msg { font-size: 13px; color: #374151; line-height: 1.75; font-style: italic; flex: 1; margin-bottom: 18px; }
        .review-author { display: flex; align-items: center; gap: 12px; }
        .review-avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #F07316, #FF9A45); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #FFFFFF; flex-shrink: 0; }
        .review-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.85rem; color: #0B2447; }
        .review-role { font-size: 0.72rem; color: #6B7280; margin-top: 2px; }

        /* ── FAQ ── */
        .faq-container { display: grid; grid-template-columns: 1fr 1.5fr; gap: 60px; align-items: start; }
        .faq-list { display: flex; flex-direction: column; gap: 10px; }
        .faq-item { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 8px; overflow: hidden; transition: border-color 0.2s; box-shadow: 0 1px 4px rgba(11,36,71,0.05); }
        .faq-item[open] { border-color: rgba(240,115,22,0.35); }
        .faq-q { padding: 16px 20px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.88rem; color: #0B2447; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; }
        .faq-q::after { content: '+'; color: #F07316; font-size: 18px; flex-shrink: 0; }
        .faq-item[open] .faq-q::after { content: '−'; }
        .faq-a { padding: 0 20px 16px; font-size: 13px; color: #6B7280; line-height: 1.75; }

        /* ── CTA BANNER ── */
        .cta-banner { position: relative; background: linear-gradient(135deg, #0a1d3a, #0d2545); border-top: 1px solid rgba(240,115,22,0.2); padding: 72px 0; overflow: hidden; }
        .cta-banner-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(240,115,22,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(240,115,22,0.05) 1px, transparent 1px); background-size: 60px 60px; pointer-events: none; }
        .cta-banner-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; position: relative; z-index: 2; }
        .cta-banner-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2rem, 3.6vw, 3rem); letter-spacing: 0.03em; color: #FFFFFF; line-height: 1.05; margin-bottom: 14px; }
        .cta-banner-sub { font-size: 14px; color: #A8BCCC; line-height: 1.8; margin-bottom: 24px; }
        .cta-banner-actions { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; }
        .cta-wa-lg { font-size: 0.88rem; padding: 15px 30px; }
        .cta-call-lg { display: inline-flex; align-items: center; padding: 14px 28px; background: rgba(240,115,22,0.1); border: 1px solid rgba(240,115,22,0.35); color: #F07316; border-radius: 6px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.85rem; letter-spacing: 0.06em; text-decoration: none; transition: all 0.2s; }
        .cta-call-lg:hover { background: rgba(240,115,22,0.18); }
        .cta-location-link { font-size: 0.75rem; font-family: 'Syne', sans-serif; font-weight: 700; letter-spacing: 0.08em; color: #A8BCCC; text-decoration: none; transition: color 0.2s; }
        .cta-location-link:hover { color: #F07316; }
        .cta-banner-img { position: relative; aspect-ratio: 16/10; border-radius: 14px; overflow: hidden; z-index: 2; }
        @media (max-width: 900px) { .cta-banner-img { display: none; } .cta-banner-inner { grid-template-columns: 1fr; } }

        /* ── RESPONSIVE ── */
        @media (max-width: 1100px) {
          .hero-inner { padding-top: 70px; }
          .stats-strip-inner { grid-template-columns: repeat(2, 1fr); }
          .cat-grid { grid-template-columns: repeat(3, 1fr); }
          .prod-grid { grid-template-columns: repeat(2, 1fr); }
          .why-grid { grid-template-columns: repeat(2, 1fr); }
          .why-grid-dark { grid-template-columns: repeat(3, 1fr); row-gap: 32px; }
          .blog-grid { grid-template-columns: repeat(2, 1fr); }
          .about-grid { grid-template-columns: 1fr; }
          .review-grid { grid-template-columns: 1fr; }
          .faq-container { grid-template-columns: 1fr; }
          .how-grid { grid-template-columns: 1fr; }
          .cta-banner-inner { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .container { padding: 0 20px; }
          .section { padding: 56px 0; }
          .cat-grid { grid-template-columns: repeat(2, 1fr); }
          .prod-grid { grid-template-columns: 1fr; }
          .why-grid { grid-template-columns: 1fr; }
          .why-grid-dark { grid-template-columns: 1fr 1fr; }
          .blog-grid { grid-template-columns: 1fr; }
          .about-stats { grid-template-columns: 1fr 1fr; }
          .hero-h1 { font-size: clamp(2.4rem, 10vw, 3.2rem); }
          .stats-strip-inner { grid-template-columns: 1fr; gap: 18px; }
        }
      `}</style>

      {/* Recently Viewed — shows for returning visitors who browsed products */}
      <RecentlyViewed />

    </main>
  );
}