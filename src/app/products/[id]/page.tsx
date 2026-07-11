// src/app/products/[id]/page.tsx
// KEY FIX: This page was blank — now shows full product detail + linked products
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/db';
import { PRODUCT_SELECT } from '@/lib/products';
import ProductAddToCart from '@/components/ProductAddToCart';
import ProductPurchasePanel from '@/components/product/ProductPurchasePanel';
import ProductReviews from '@/components/ProductReviews';
import ProductImagePlaceholder from '@/components/ProductImagePlaceholder';
import ProductImageGallery from '@/components/ProductImageGallery';
import WishlistButton from '@/components/WishlistButton';
import { CONTACT } from '@/lib/contact';

const SITE_URL = 'https://www.karurplywood.co.in';
const WA = CONTACT.wa;

// ── Fetch single product ────────────────────────────────────────
async function getProduct(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
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
    .select(PRODUCT_SELECT)
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

  const discount = product.mrp && product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : null;

  // Product JSON-LD
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.name,
    image: product.image_url ? [product.image_url] : [],
    sku: `KPC-${product.id}`,
    brand: { '@type': 'Brand', name: (product as any).brands?.name || 'Karur Plywood & Company' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.price || 0,
      availability: product.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Karur Plywood & Company', url: SITE_URL },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />

      <div style={{ background: 'var(--bg-body)', paddingTop: 58 }}>

        {/* ── BREADCRUMB ── */}
        <div style={{ background: 'var(--bg-white)', borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }} className="pd-pad">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-meta)', flexWrap: 'wrap' }}>
              <Link href="/" style={{ color: 'var(--text-meta)', textDecoration: 'none' }}>Home</Link>
              <span>›</span>
              <Link href="/products" style={{ color: 'var(--text-meta)', textDecoration: 'none' }}>Products</Link>
              {product.categories && (<><span>›</span>
                <Link href={`/products?category=${product.categories.slug}`} style={{ color: 'var(--text-meta)', textDecoration: 'none' }}>{product.categories.name}</Link>
              </>)}
              <span>›</span>
              <span style={{ color: 'var(--orange)', fontWeight: 600 }}>{product.name}</span>
            </div>
          </div>
        </div>

        {/* ── MAIN PRODUCT ── */}
        <section style={{ background: 'var(--bg-white)', borderBottom: '1px solid var(--border)', padding: '40px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }} className="pd-pad">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }} className="pd-grid">

              {/* LEFT — Gallery */}
              <div>
                <ProductImageGallery
                  images={[product.image_url, ...((product as any).image_urls || [])].filter(Boolean)}
                  productName={product.name}
                  categoryName={product.categories?.name}
                  categoryIcon={product.categories?.icon}
                  brandName={(product as any).brands?.name}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  {product.in_stock !== false
                    ? <span style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: 'var(--f-ui)', letterSpacing: '.08em' }}>✓ In Stock</span>
                    : <span style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: 'var(--f-ui)', letterSpacing: '.08em' }}>Out of Stock</span>}
                  {discount && discount > 0 && <span style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: 'var(--orange)', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: 'var(--f-ui)' }}>{discount}% OFF</span>}
                  {product.categories && (
                    <Link href={`/products?category=${product.categories.slug}`} style={{ background: 'var(--orange-light)', border: '1px solid rgba(249,115,22,0.2)', color: 'var(--orange)', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: 'var(--f-ui)', textDecoration: 'none' }}>
                      {product.categories.icon} {product.categories.name}
                    </Link>
                  )}
                </div>
              </div>

              {/* RIGHT — Details */}
              <div>
                <h1 style={{ fontFamily: 'var(--f-ui)', fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, color: 'var(--text-h)', lineHeight: 1.2, marginBottom: 16 }}>{product.name}</h1>

                {/* Price */}
                <div style={{ background: 'var(--bg-cream)', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '18px 20px', marginBottom: 24 }}>
                  {product.mrp && product.mrp > (product.price || 0) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, color: 'var(--text-meta)', textDecoration: 'line-through' }}>₹{product.mrp.toLocaleString('en-IN')}</span>
                      {discount && <span style={{ fontSize: 11, fontFamily: 'var(--f-ui)', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 3, padding: '1px 8px' }}>Save {discount}%</span>}
                    </div>
                  )}
                  {product.price ? (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--f-display)', fontSize: '2.8rem', color: 'var(--orange)', letterSpacing: '.03em', lineHeight: 1 }}>₹{product.price.toLocaleString('en-IN')}</span>
                      {product.unit && <span style={{ fontSize: 14, color: 'var(--text-meta)' }}>/ {product.unit}</span>}
                    </div>
                  ) : <div style={{ fontFamily: 'var(--f-ui)', fontWeight: 700, color: 'var(--orange)', fontSize: '1.2rem' }}>Contact for price</div>}
                  {product.mrp && product.price && product.mrp > product.price && (
                    <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginTop: 6 }}>You save ₹{(product.mrp - product.price).toLocaleString('en-IN')}</div>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 11, fontFamily: 'var(--f-ui)', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text-meta)', marginBottom: 8 }}>About this product</div>
                    <p style={{ fontSize: 14, color: 'var(--text-body)', lineHeight: 1.85 }}>{product.description}</p>
                  </div>
                )}

                {/* Quick facts */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
                  {[
                    { label: 'Category', value: product.categories?.name || 'General' },
                    { label: 'Availability', value: product.in_stock ? '✓ In Stock' : 'Out of Stock' },
                    { label: 'Supply Type', value: product.type === 'quick' ? '⚡ Quick' : '🏠 Project' },
                    { label: 'Location', value: 'Karur, TN' },
                  ].map(f => (
                    <div key={f.label} style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '10px 14px' }}>
                      <div style={{ fontSize: 10, fontFamily: 'var(--f-ui)', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-meta)', marginBottom: 3 }}>{f.label}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-h)', fontWeight: 600 }}>{f.value}</div>
                    </div>
                  ))}
                </div>

                <ProductPurchasePanel product={product} />

                {/* Wishlist + Share */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <WishlistButton product={product} size="md" />
                    <span style={{ fontSize: 13, color: 'var(--text-meta)' }}>Save to Wishlist</span>
                  </div>
                  <a href={`https://wa.me/?text=${encodeURIComponent(`Check this: ${product.name}${product.price ? ` at ₹${product.price.toLocaleString('en-IN')}` : ''} — ${CONTACT.siteUrl}/products/${product.id}`)}`}
                    target="_blank" rel="noopener"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 'var(--r)', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontFamily: 'var(--f-ui)', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
                    💬 Share
                  </a>
                </div>

                {/* Trust strip */}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  {['✅ ISI Certified', '🚚 Fast Delivery', '🏪 Showroom', '📄 GST Invoice'].map(t => (
                    <span key={t} style={{ fontSize: 11, color: 'var(--text-meta)', fontFamily: 'var(--f-ui)', fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── RELATED ── */}
        {related.length > 0 && (
          <section style={{ padding: '48px 0', background: 'var(--bg-cream)', borderTop: '1px solid var(--border)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }} className="pd-pad">
              <div className="eyebrow">More from this Category</div>
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.8rem,3vw,2.4rem)', letterSpacing: '.04em', color: 'var(--text-h)', marginBottom: 28 }}>YOU MAY ALSO NEED</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }} className="pd-related-grid">
                {related.map((rp: any) => {
                  const rDiscount = rp.mrp && rp.price ? Math.round(((rp.mrp - rp.price) / rp.mrp) * 100) : null;
                  return (
                    <div key={rp.id} className="pc-card">
                      <Link href={`/products/${rp.id}`} style={{ display:'block', textDecoration:'none', position:'relative', height:160, overflow:'hidden', background:'var(--bg-cream)', flexShrink:0 }}>
                        {rp.image_url
                          ? <Image src={rp.image_url} alt={rp.name} fill style={{ objectFit:'cover' }} sizes="25vw" />
                          : <ProductImagePlaceholder name={rp.name} categoryName={rp.categories?.name} categoryIcon={rp.categories?.icon} brandName={rp.brands?.name} size="card" />}
                        {rDiscount && rDiscount > 0 && <div style={{ position:'absolute', top:8, left:8, background:'#16a34a', color:'#fff', borderRadius:3, padding:'2px 7px', fontSize:10, fontWeight:700 }}>{rDiscount}% OFF</div>}
                      </Link>
                      <div style={{ padding:'12px 14px' }}>
                        <Link href={`/products/${rp.id}`} style={{ textDecoration:'none', fontFamily:'var(--f-ui)', fontWeight:700, fontSize:'.84rem', color:'var(--text-h)', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const, overflow:'hidden', marginBottom:6, lineHeight:1.3 }}>{rp.name}</Link>
                        {rp.price
                          ? <div style={{ fontFamily:'var(--f-display)', fontSize:'1.3rem', color:'var(--orange)', letterSpacing:'.03em', marginBottom:8 }}>₹{rp.price.toLocaleString('en-IN')}{rp.unit && <span style={{ fontSize:11, color:'var(--text-meta)', fontFamily:'var(--f-body)', fontWeight:400, marginLeft:4 }}>{rp.unit}</span>}</div>
                          : <div style={{ fontSize:12, color:'var(--orange)', fontWeight:700, marginBottom:8 }}>Ask for price</div>}
                        <ProductAddToCart product={rp} layout="compact" />
                      </div>
                    </div>
                  );
                })}
              </div>
              {product.categories && (
                <div style={{ textAlign:'center', marginTop:28 }}>
                  <Link href={`/products?category=${product.categories.slug}`} className="btn-s">View All {product.categories.name} →</Link>
                </div>
              )}
            </div>
          </section>
        )}

        <ProductReviews productName={product.name} />

        {/* ── BULK CTA ── */}
        <section style={{ padding:'48px 0', background:'var(--navy)', borderTop:'3px solid var(--orange)' }}>
          <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 48px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:24, flexWrap:'wrap' }} className="pd-pad">
            <div>
              <div style={{ fontFamily:'var(--f-display)', fontSize:'clamp(1.5rem,3vw,2rem)', color:'#fff', letterSpacing:'.04em', marginBottom:8 }}>NEED BULK PRICING?</div>
              <p style={{ fontSize:13, color:'var(--text-muted-d)', fontWeight:300 }}>Contractors and builders get special wholesale rates. GST invoice included.</p>
            </div>
            <a href={`https://wa.me/${WA}?text=Hi%2C+I+need+bulk+pricing+for+${encodeURIComponent(product.name)}.`} target="_blank" rel="noopener" className="btn-wa">💬 Get Bulk Quote</a>
          </div>
        </section>
      </div>

      <style>{`
        .pd-pad { padding-left:48px; padding-right:48px; }
        @media(max-width:1024px){ .pd-grid { grid-template-columns:1fr !important; } .pd-related-grid { grid-template-columns:repeat(2,1fr) !important; } }
        @media(max-width:640px){ .pd-pad { padding-left:16px !important; padding-right:16px !important; } }
        @media(max-width:400px){ .pd-related-grid { grid-template-columns:1fr !important; } }
      `}</style>
    </>
  );
}