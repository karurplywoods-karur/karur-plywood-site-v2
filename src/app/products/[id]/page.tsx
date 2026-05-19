// src/app/products/[id]/page.tsx
// KEY FIX: This page was blank — now shows full product detail + linked products
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/db';
import ProductAddToCart from '@/components/ProductAddToCart';

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999';

// ── Fetch single product ────────────────────────────────────────
async function getProduct(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id,name,slug,icon)')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

// ── Fetch related products (same category, exclude current) ────
async function getRelated(categoryId: string | null, currentId: string) {
  if (!categoryId) return [];
  const { data } = await supabase
    .from('products')
    .select('*, categories(id,name,slug,icon)')
    .eq('category_id', categoryId)
    .eq('in_stock', true)
    .neq('id', currentId)
    .order('sort_order', { ascending: true })
    .limit(4);
  return data || [];
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const p = await getProduct(params.id);
  if (!p) return { title: 'Product Not Found' };
  return {
    title: `${p.name} | Karur Plywood & Company`,
    description: p.description || `Buy ${p.name} at best price in Karur. WhatsApp for instant quote.`,
    openGraph: { images: p.image_url ? [p.image_url] : [] },
  };
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  const related = await getRelated(product.category_id, product.id);

  const discount = product.mrp && product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : null;

  return (
    <>
      {/* Breadcrumb */}
      <div style={{ background: '#070F1F', borderBottom: '1px solid rgba(249,115,22,0.1)', padding: '12px 0', marginTop: 58 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }} className="pd-pad">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#7A8EA8' }}>
            <Link href="/" style={{ color: '#7A8EA8', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <Link href="/products" style={{ color: '#7A8EA8', textDecoration: 'none' }}>Products</Link>
            {product.categories && (
              <>
                <span>›</span>
                <Link href={`/products?category=${product.categories.slug}`} style={{ color: '#7A8EA8', textDecoration: 'none' }}>
                  {product.categories.icon} {product.categories.name}
                </Link>
              </>
            )}
            <span>›</span>
            <span style={{ color: '#F97316' }}>{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Product Section */}
      <section style={{ background: '#070F1F', padding: '48px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }} className="pd-pad">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'start' }} className="pd-grid">

            {/* LEFT — Image */}
            <div>
              <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(249,115,22,0.18)', background: 'rgba(25,55,109,0.4)', aspectRatio: '4/3' }}>
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width:768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>
                    {product.categories?.icon || '📦'}
                  </div>
                )}

                {/* Discount badge on image */}
                {discount && discount > 0 && (
                  <div style={{ position: 'absolute', top: 16, left: 16, background: '#25D366', color: 'white', borderRadius: 6, padding: '6px 14px', fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.2rem', letterSpacing: '.05em', boxShadow: '0 4px 16px rgba(37,211,102,0.4)' }}>
                    {discount}% OFF
                  </div>
                )}

                {/* Stock indicator */}
                <div style={{ position: 'absolute', top: 16, right: 16, background: product.in_stock ? 'rgba(37,211,102,0.15)' : 'rgba(248,113,113,0.15)', border: `1px solid ${product.in_stock ? 'rgba(37,211,102,0.4)' : 'rgba(248,113,113,0.4)'}`, borderRadius: 4, padding: '4px 10px', fontSize: 11, fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: product.in_stock ? '#4ADE80' : '#F87171', backdropFilter: 'blur(8px)' }}>
                  {product.in_stock ? '✓ In Stock' : 'Out of Stock'}
                </div>
              </div>

              {/* Category tag below image */}
              {product.categories && (
                <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                  <Link href={`/products?category=${product.categories.slug}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 4, padding: '5px 14px', fontSize: 12, fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#F97316', textDecoration: 'none' }}>
                    {product.categories.icon} {product.categories.name}
                  </Link>
                  <span style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(25,55,109,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '5px 14px', fontSize: 12, fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#7A8EA8' }}>
                    {product.type === 'quick' ? '⚡ Quick Order' : '🏠 Project Supply'}
                  </span>
                </div>
              )}
            </div>

            {/* RIGHT — Details */}
            <div>
              <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2rem,3.5vw,3rem)', letterSpacing: '.04em', color: '#F8F9FB', lineHeight: 1, marginBottom: 16 }}>
                {product.name}
              </h1>

              {/* Price Block */}
              <div style={{ background: 'rgba(25,55,109,0.4)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10, padding: '20px 22px', marginBottom: 24 }}>
                {product.mrp && product.mrp > (product.price || 0) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 15, color: '#7A8EA8', textDecoration: 'line-through' }}>
                      MRP ₹{product.mrp.toLocaleString('en-IN')}
                    </span>
                    {discount && (
                      <span style={{ fontSize: 12, fontFamily: "'Syne',sans-serif", fontWeight: 700, background: 'rgba(37,211,102,0.15)', color: '#4ADE80', border: '1px solid rgba(37,211,102,0.25)', borderRadius: 3, padding: '2px 8px', letterSpacing: '.06em' }}>
                        SAVE {discount}%
                      </span>
                    )}
                  </div>
                )}
                {product.price ? (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '2.8rem', color: '#F97316', letterSpacing: '.03em', lineHeight: 1 }}>
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    {product.unit && (
                      <span style={{ fontSize: 14, color: '#7A8EA8', fontFamily: "'Syne',sans-serif" }}>
                        / {product.unit}
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.6rem', color: '#F97316', letterSpacing: '.04em' }}>
                    CONTACT FOR PRICE
                  </div>
                )}
                {product.mrp && product.price && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#4ADE80' }}>
                    You save ₹{(product.mrp - product.price).toLocaleString('en-IN')} on this order
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11, fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#7A8EA8', marginBottom: 8 }}>
                    About this product
                  </div>
                  <p style={{ fontSize: 15, color: '#A8BCCC', lineHeight: 1.85, fontWeight: 300 }}>
                    {product.description}
                  </p>
                </div>
              )}

              {/* Quick facts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
                {[
                  { label: 'Category', value: product.categories?.name || 'General' },
                  { label: 'Availability', value: product.in_stock ? 'In Stock' : 'Out of Stock' },
                  { label: 'Order Type', value: product.type === 'quick' ? 'Quick Order' : 'Project Supply' },
                  { label: 'Location', value: 'Karur, Tamil Nadu' },
                ].map(f => (
                  <div key={f.label} style={{ background: 'rgba(11,36,71,0.5)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 6, padding: '10px 14px' }}>
                    <div style={{ fontSize: 10, fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#7A8EA8', marginBottom: 3 }}>{f.label}</div>
                    <div style={{ fontSize: 13, color: '#F8F9FB', fontWeight: 500 }}>{f.value}</div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <ProductAddToCart product={product} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <a href={`tel:${process.env.NEXT_PUBLIC_PHONE_RAW || '919999999999'}`}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 0', borderRadius: 8, background: 'transparent', border: '1px solid rgba(249,115,22,0.3)', color: '#F97316', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
                    📞 Call Now
                  </a>
                  <Link href="/products"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 0', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#7A8EA8', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
                    ← All Products
                  </Link>
                </div>
              </div>

              {/* Trust strip */}
              <div style={{ marginTop: 24, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                {['✅ ISI Certified', '🚚 Karur Delivery', '💬 WhatsApp Support', '🏪 Showroom Available'].map(t => (
                  <span key={t} style={{ fontSize: 11, color: '#7A8EA8', fontFamily: "'Syne',sans-serif", fontWeight: 600, letterSpacing: '.06em' }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RELATED / LINKED PRODUCTS ── */}
      {related.length > 0 && (
        <section style={{ padding: '56px 0', background: 'rgba(11,36,71,0.3)', borderTop: '1px solid rgba(249,115,22,0.1)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }} className="pd-pad">
            <div className="eyebrow">From the Same Category</div>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(1.8rem,3vw,2.6rem)', letterSpacing: '.04em', color: '#F8F9FB', marginBottom: 32 }}>
              YOU MAY ALSO NEED
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }} className="pd-related-grid">
              {related.map((rp: any) => {
                const rDiscount = rp.mrp && rp.price ? Math.round(((rp.mrp - rp.price) / rp.mrp) * 100) : null;
                return (
                  <div key={rp.id} className="pd-related-card">
                    {/* Image */}
                    <Link href={`/products/${rp.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                      <div style={{ position: 'relative', height: 160, background: 'rgba(11,36,71,0.5)', overflow: 'hidden' }}>
                        {rp.image_url ? (
                          <Image src={rp.image_url} alt={rp.name} fill style={{ objectFit: 'cover', transition: 'transform 0.4s' }} className="pd-rel-img" sizes="25vw" />
                        ) : (
                          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                            {rp.categories?.icon || '📦'}
                          </div>
                        )}
                        {rDiscount && rDiscount > 0 && (
                          <div style={{ position: 'absolute', top: 8, left: 8, background: '#25D366', color: 'white', borderRadius: 3, padding: '2px 8px', fontSize: 10, fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>
                            {rDiscount}% OFF
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Body */}
                    <div style={{ padding: '14px 16px 16px' }}>
                      <Link href={`/products/${rp.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '.88rem', color: '#F8F9FB', marginBottom: 6, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {rp.name}
                        </div>
                      </Link>
                      {/* Price */}
                      <div style={{ marginBottom: 10 }}>
                        {rp.mrp && rp.mrp > (rp.price || 0) && (
                          <div style={{ fontSize: 11, color: '#7A8EA8', textDecoration: 'line-through', marginBottom: 1 }}>
                            ₹{rp.mrp.toLocaleString('en-IN')}
                          </div>
                        )}
                        {rp.price ? (
                          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.4rem', color: '#F97316', letterSpacing: '.03em', lineHeight: 1 }}>
                            ₹{rp.price.toLocaleString('en-IN')}
                            {rp.unit && <span style={{ fontSize: 11, color: '#7A8EA8', fontFamily: "'DM Sans',sans-serif", fontWeight: 400, marginLeft: 4 }}>{rp.unit}</span>}
                          </div>
                        ) : (
                          <div style={{ fontSize: 12, color: '#F97316', fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>ASK FOR PRICE</div>
                        )}
                      </div>
                      <ProductAddToCart product={rp} layout="compact" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View all in category */}
            {product.categories && (
              <div style={{ textAlign: 'center', marginTop: 36 }}>
                <Link href={`/products?category=${product.categories.slug}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 6, border: '1px solid rgba(249,115,22,0.3)', color: '#F97316', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none', transition: 'all 0.2s' }}
                  className="pd-viewall-btn">
                  View All {product.categories.name} →
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Bottom CTA Banner */}
      <section style={{ padding: '48px 0', background: 'linear-gradient(135deg,#0d1f3a,#19376D)', borderTop: '1px solid rgba(249,115,22,0.15)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }} className="pd-pad">
          <div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.8rem', letterSpacing: '.05em', color: '#F8F9FB', marginBottom: 6 }}>
              NEED BULK PRICING?
            </div>
            <p style={{ fontSize: 14, color: '#7A8EA8' }}>
              Contractors and builders get special wholesale rates. WhatsApp your full requirement list.
            </p>
          </div>
          <a href={`https://wa.me/${WA}?text=Hi%2C+I+need+bulk+pricing+for+${encodeURIComponent(product.name)}.+Can+you+help%3F`}
            target="_blank" rel="noopener"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 8, background: '#F97316', color: '#0B2447', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '0.78rem', letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none', flexShrink: 0 }}>
            💬 Get Bulk Quote on WhatsApp
          </a>
        </div>
      </section>

      <style>{`
        .pd-pad { padding: 0 48px; }
        .pd-wa-btn:hover { background: #1fbc59 !important; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(37,211,102,0.45); }
        .pd-viewall-btn:hover { background: rgba(249,115,22,0.08); }

        /* Related product cards */
        .pd-related-card {
          background: rgba(25,55,109,0.35);
          border: 1px solid rgba(249,115,22,0.15);
          border-radius: 10px; overflow: hidden;
          transition: transform .25s, border-color .25s, box-shadow .25s;
          display: flex; flex-direction: column;
        }
        .pd-related-card:hover {
          border-color: #F97316;
          transform: translateY(-5px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.4);
        }
        .pd-related-card:hover .pd-rel-img { transform: scale(1.06); }

        @media(max-width:1024px){
          .pd-grid { grid-template-columns: 1fr !important; }
          .pd-related-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media(max-width:640px){
          .pd-pad { padding: 0 20px !important; }
          .pd-related-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
