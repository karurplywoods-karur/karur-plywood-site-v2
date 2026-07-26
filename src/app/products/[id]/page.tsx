// src/app/products/[id]/page.tsx
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/db';
import { PRODUCT_SELECT } from '@/lib/products';
import { getProductBadge } from '@/lib/badges';
import ProductCard from '@/components/ProductCard';
import ProductPurchasePanel from '@/components/product/ProductPurchasePanel';
import ProductTabs from '@/components/product/ProductTabs';
import ProductReviews from '@/components/ProductReviews';
import ProductImageGallery from '@/components/ProductImageGallery';
import WishlistButton from '@/components/WishlistButton';
import { CONTACT } from '@/lib/contact';

const SITE_URL = 'https://www.karurplywood.co.in';

async function getProduct(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

async function getRelated(categoryId: string | null, currentId: string) {
  if (!categoryId) return [];
  const { data } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('category_id', categoryId)
    .eq('in_stock', true)
    .neq('id', currentId)
    .order('sort_order', { ascending: true })
    .limit(5);
  return data || [];
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const p = await getProduct(params.id);
  if (!p) return { title: 'Product Not Found' };
  return {
    title: `${p.name} | Karur Plywood & Company`,
    description: p.description || `Buy ${p.name} at best price in Karur. WhatsApp for instant quote.`,
    alternates: { canonical: `${SITE_URL}/products/${params.id}` },
    openGraph: {
      title: `${p.name} | Karur Plywood & Company`,
      description: p.description || `Buy ${p.name} at best price in Karur.`,
      url: `${SITE_URL}/products/${params.id}`,
      images: p.image_url ? [p.image_url] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  const related = await getRelated(product.category_id, product.id);
  const badge = getProductBadge(product as any);
  const brandName = (product as any).brands?.name;

  const discount = product.mrp && product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : null;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.name,
    image: product.image_url ? [product.image_url] : [],
    sku: `KPC-${product.id}`,
    brand: { '@type': 'Brand', name: brandName || 'Karur Plywood & Company' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.price || 0,
      availability: product.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Karur Plywood & Company', url: SITE_URL },
    },
  };

  // Split description into sentences to use as a feature checklist (best-effort, no fabrication)
  const descSentences = (product.description || '')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 3);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />

      <div style={{ background: '#FAF8F5', paddingTop: 58 }}>

        {/* ── BREADCRUMB ── */}
        <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E1DC', padding: '10px 0' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }} className="pd-pad">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9CA3AF', flexWrap: 'wrap' }}>
              <Link href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Home</Link>
              <span>›</span>
              <Link href="/products" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Products</Link>
              {product.categories && (<><span>›</span>
                <Link href={`/products?category=${product.categories.slug}`} style={{ color: '#9CA3AF', textDecoration: 'none' }}>{product.categories.name}</Link>
              </>)}
              {brandName && (<><span>›</span><span style={{ color: '#9CA3AF' }}>{brandName}</span></>)}
              <span>›</span>
              <span style={{ color: '#F07316', fontWeight: 600 }}>{product.name}</span>
            </div>
          </div>
        </div>

        {/* ── MAIN PRODUCT: gallery | info | delivery ── */}
        <section style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E1DC', padding: '32px 0' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }} className="pd-pad">
            <div className="pd-grid">

              {/* Gallery */}
              <div style={{ position: 'relative' }}>
                {badge && (
                  <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 3, background: 'rgba(11,36,71,0.92)', color: '#FFFFFF', fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 3 }}>
                    {badge.emoji} {badge.label}
                  </div>
                )}
                <ProductImageGallery
                  images={[product.image_url, ...((product as any).image_urls || [])].filter(Boolean)}
                  productName={product.name}
                  categoryName={product.categories?.name}
                  categoryIcon={product.categories?.icon}
                  brandName={brandName}
                />
              </div>

              {/* Info */}
              <div>
                <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(1.3rem,2.4vw,1.7rem)', fontWeight: 700, color: '#0B2447', lineHeight: 1.25, marginBottom: 6 }}>
                  {product.name}
                </h1>
                {brandName && (
                  <Link href={`/products?brand=${(product as any).brands?.slug || ''}`} style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: '#F07316', textDecoration: 'none' }}>
                    {brandName}
                  </Link>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, marginBottom: 18 }}>
                  {(product.fulfillment_type === 'DISTRIBUTOR' || product.fulfillment_type === 'SPECIAL_ORDER' || product.verification_required)
                    ? <span style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#F07316', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: "'Inter',sans-serif", letterSpacing: '.06em' }}>✓ Usually Available — Verified Before Delivery</span>
                    : product.in_stock !== false
                    ? <span style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: "'Inter',sans-serif", letterSpacing: '.06em' }}>✓ In Stock</span>
                    : <span style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: "'Inter',sans-serif", letterSpacing: '.06em' }}>Out of Stock</span>}
                  {discount && discount > 0 && <span style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#F07316', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>{discount}% OFF</span>}
                </div>

                {descSentences.length > 0 && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 22px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {descSentences.slice(0, 5).map((s, i) => (
                      <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13.5, color: '#4B5563', lineHeight: 1.5 }}>
                        <span style={{ color: '#F07316', flexShrink: 0 }}>◈</span>{s}
                      </li>
                    ))}
                  </ul>
                )}

                <ProductPurchasePanel product={product as any} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, paddingTop: 16, borderTop: '1px solid #E5E1DC', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <WishlistButton product={product as any} size="md" />
                    <span style={{ fontSize: 13, color: '#6B7280' }}>Save to Wishlist</span>
                  </div>
                  <a href={`https://wa.me/?text=${encodeURIComponent(`Check this: ${product.name}${product.price ? ` at ₹${product.price.toLocaleString('en-IN')}` : ''} — ${CONTACT.siteUrl}/products/${product.id}`)}`}
                    target="_blank" rel="noopener"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
                    💬 Share
                  </a>
                </div>
              </div>

              {/* Delivery sidebar */}
              <aside className="pd-delivery">
                <div className="pd-delivery-block">
                  <div className="pd-delivery-title">📦 Delivery</div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 8 }}>Check delivery time</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input placeholder="Enter Pincode" className="pd-pincode-input" />
                    <button className="pd-pincode-btn">Check</button>
                  </div>
                </div>
                {[
                  { i: '🚚', t: 'Free Delivery', d: 'On orders above ₹10,000' },
                  { i: '🔒', t: 'Secure Payments', d: '100% safe & secure' },
                  { i: '↺', t: 'Easy Returns', d: '7 days easy returns' },
                  { i: '📄', t: 'GST Invoice', d: 'Billing with GST' },
                ].map(f => (
                  <div key={f.t} className="pd-delivery-block pd-delivery-row">
                    <span className="pd-delivery-icon">{f.i}</span>
                    <div>
                      <div className="pd-delivery-t">{f.t}</div>
                      <div className="pd-delivery-d">{f.d}</div>
                    </div>
                  </div>
                ))}
              </aside>
            </div>
          </div>
        </section>

        {/* ── FEATURE STRIP ── */}
        <div className="pd-feature-strip">
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }} className="pd-pad pd-feature-inner">
            {[
              { i: '🛡️', t: '100% Original Products', d: 'Sourced from trusted brands' },
              { i: '✓', t: 'Best Price Guarantee', d: 'Get the best price always' },
              { i: '🚚', t: 'Fast Delivery Across India', d: 'Quick & reliable delivery' },
              { i: '🎧', t: 'Expert Support', d: 'We are here to help' },
            ].map(f => (
              <div key={f.t} className="pd-feature-item">
                <span className="pd-feature-icon">{f.i}</span>
                <div>
                  <div className="pd-feature-t">{f.t}</div>
                  <div className="pd-feature-d">{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TABS ── */}
        <section style={{ padding: '40px 0', background: '#FAF8F5' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }} className="pd-pad">
            <ProductTabs
              tabs={[
                {
                  key: 'description', label: 'Description', content: (
                    <div className="pd-desc-grid">
                      <div>
                        <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#0B2447', marginBottom: 14 }}>Product Description</h3>
                        <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.85, marginBottom: 26 }}>
                          {product.description || `${product.name} is available at Karur Plywood & Company. Contact us for detailed specifications and bulk pricing.`}
                        </p>

                        {descSentences.length > 0 && (
                          <>
                            <h4 style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.95rem', fontWeight: 700, color: '#0B2447', marginBottom: 12 }}>Features</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {descSentences.slice(0, 6).map((s, i) => (
                                <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13.5, color: '#374151' }}>
                                  <span style={{ color: '#16a34a' }}>✓</span>{s}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}

                        <h4 style={{ fontFamily: "'Inter',sans-serif", fontSize: '0.95rem', fontWeight: 700, color: '#0B2447', marginBottom: 14 }}>Ideal For</h4>
                        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
                          {['🍽️ Kitchen', '🛁 Bathroom', '🪑 Furniture', '🏠 Interior Work', '🏢 Commercial'].map(item => {
                            const [icon, ...rest] = item.split(' ');
                            return (
                              <div key={item} style={{ textAlign: 'center', width: 72 }}>
                                <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                                <div style={{ fontSize: 11, color: '#6B7280', fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>{rest.join(' ')}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="pd-desc-img">
                        <Image src="/images/about-showroom.jpg" alt={product.name} fill style={{ objectFit: 'cover' }} sizes="(max-width:900px) 0px, 40vw" />
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'specifications', label: 'Specifications', content: (
                    <div style={{ maxWidth: 640 }}>
                      {[
                        ['Category', product.categories?.name || '—'],
                        ['Brand', brandName || '—'],
                        ['Unit', product.unit || '—'],
                        ['Supply Type', product.type === 'quick' ? 'Quick' : 'Project'],
                        ['Availability', (product.fulfillment_type === 'DISTRIBUTOR' || product.fulfillment_type === 'SPECIAL_ORDER' || product.verification_required) ? 'Usually Available (Verified Before Delivery)' : (product.in_stock ? 'In Stock' : 'Out of Stock')],
                      ].map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #E5E1DC', fontSize: 13.5 }}>
                          <span style={{ color: '#6B7280' }}>{k}</span>
                          <span style={{ color: '#0B2447', fontWeight: 600 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  ),
                },
                {
                  key: 'applications', label: 'Applications', content: (
                    <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.85, maxWidth: 640 }}>
                      Commonly used across residential and commercial interior work — kitchens, wardrobes, furniture and general carpentry.
                      Speak to our team on WhatsApp for guidance on the right product for your specific project.
                    </p>
                  ),
                },
                {
                  key: 'reviews', label: 'Reviews', content: <ProductReviews productName={product.name} />,
                },
                {
                  key: 'faq', label: 'FAQ', content: (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 640 }}>
                      {[
                        ['Do you offer delivery for this product?', 'Yes, we deliver across Karur and nearby areas. Free delivery on orders above ₹10,000.'],
                        ['Can I get a bulk quote?', 'Yes — WhatsApp us or click Buy Now for a wholesale/contractor quote on bulk orders.'],
                        ['Is GST invoice available?', 'Yes, GST invoices are provided for all orders on request.'],
                      ].map(([q, a]) => (
                        <details key={q} style={{ background: '#FFFFFF', border: '1px solid #E5E1DC', borderRadius: 8, padding: '12px 16px' }}>
                          <summary style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13.5, color: '#0B2447', cursor: 'pointer' }}>{q}</summary>
                          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 8, lineHeight: 1.6 }}>{a}</p>
                        </details>
                      ))}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </section>

        {/* ── YOU MAY ALSO LIKE ── */}
        {related.length > 0 && (
          <section style={{ padding: '40px 0', background: '#FFFFFF', borderTop: '1px solid #E5E1DC' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }} className="pd-pad">
              <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: '1.2rem', fontWeight: 700, color: '#0B2447', marginBottom: 20 }}>You May Also Like</h2>
              <div className="pd-related-grid">
                {related.map((rp: any) => <ProductCard key={rp.id} product={rp} />)}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA BANNER ── */}
        <section style={{ padding: '32px 0', background: '#0B2447' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }} className="pd-pad">
            <div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#FF9A45', marginBottom: 6 }}>Have a project in mind?</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(1.1rem,2vw,1.4rem)', fontWeight: 700, color: '#FFFFFF' }}>Upload your BOM and get the best quote in minutes.</div>
            </div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
              {['Best Prices Guaranteed', 'Accurate Estimation', 'Quick Response', 'Save Time & Money'].map(t => (
                <span key={t} style={{ fontSize: 12, color: '#C7D2E0', fontFamily: "'Inter',sans-serif", fontWeight: 600, whiteSpace: 'nowrap' }}>◈ {t}</span>
              ))}
              <Link href="/bom-quote" style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 24px', background: '#F07316', color: '#FFFFFF', borderRadius: 6, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                📤 Upload BOM Now
              </Link>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .pd-pad { padding-left:48px; padding-right:48px; }
        .pd-grid { display: grid; grid-template-columns: 1fr 1fr 260px; gap: 40px; align-items: start; }
        .pd-delivery-block { background: #FAF8F5; border: 1px solid #E5E1DC; border-radius: 10px; padding: 16px; margin-bottom: 12px; }
        .pd-delivery-title { font-family: 'Inter',sans-serif; font-size: 0.78rem; font-weight: 700; color: #0B2447; margin-bottom: 8px; }
        .pd-pincode-input { flex: 1; min-width: 0; padding: 8px 10px; border: 1px solid #E5E1DC; border-radius: 6px; font-size: 12px; background: #FFFFFF; }
        .pd-pincode-btn { padding: 8px 14px; background: #0B2447; color: #FFFFFF; border: none; border-radius: 6px; font-family: 'Inter',sans-serif; font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .pd-delivery-row { display: flex; gap: 12px; align-items: flex-start; }
        .pd-delivery-icon { font-size: 20px; flex-shrink: 0; }
        .pd-delivery-t { font-family: 'Inter',sans-serif; font-size: 0.76rem; font-weight: 700; color: #0B2447; margin-bottom: 2px; }
        .pd-delivery-d { font-size: 0.68rem; color: #6B7280; }

        .pd-feature-strip { background: #FAF8F5; border-top: 1px solid #E5E1DC; border-bottom: 1px solid #E5E1DC; padding: 22px 0; }
        .pd-feature-inner { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .pd-feature-item { display: flex; align-items: center; gap: 12px; }
        .pd-feature-icon { font-size: 22px; flex-shrink: 0; }
        .pd-feature-t { font-family: 'Inter',sans-serif; font-size: 0.76rem; font-weight: 700; color: #0B2447; }
        .pd-feature-d { font-size: 0.66rem; color: #6B7280; margin-top: 2px; }

        .pd-desc-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 40px; align-items: start; }
        .pd-desc-img { position: relative; aspect-ratio: 4/3.2; border-radius: 12px; overflow: hidden; background: #F2EDE5; }

        .pd-related-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }

        @media(max-width:1150px){ .pd-grid { grid-template-columns: 1fr 1fr !important; } .pd-delivery { grid-column: span 2; display: flex !important; gap: 12px; flex-wrap: wrap; } .pd-delivery-block { flex: 1; min-width: 180px; } }
        @media(max-width:900px){ .pd-desc-grid { grid-template-columns: 1fr !important; } .pd-desc-img { display: none; } .pd-related-grid { grid-template-columns: repeat(3,1fr) !important; } .pd-feature-inner { grid-template-columns: repeat(2,1fr) !important; } }
        @media(max-width:768px){ .pd-grid { grid-template-columns: 1fr !important; } .pd-delivery { display: grid !important; grid-template-columns: 1fr 1fr !important; } }
        @media(max-width:640px){ .pd-pad { padding-left:16px !important; padding-right:16px !important; } .pd-related-grid { grid-template-columns: repeat(2,1fr) !important; } }
      `}</style>
    </>
  );
}
