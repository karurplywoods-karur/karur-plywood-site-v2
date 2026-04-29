// src/app/products/page.tsx — Dynamic products from Supabase
import { Metadata } from 'next';
import { getProjectProducts, getCategories } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Products | Plywood, Doors, Laminates & Hardware in Karur',
  description: 'Buy premium plywood, doors, laminates and hardware at best prices in Karur. ISI certified. Wholesale & retail. WhatsApp for quick pricing.',
};

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999';

export default async function ProductsPage({ searchParams }: { searchParams: { category?: string } }) {
  const [products, categories] = await Promise.all([
    getProjectProducts(searchParams.category),
    getCategories(),
  ]);

  const activeCategory = searchParams.category || 'all';

  return (
    <>
      {/* Hero */}
      <section style={{ background:'linear-gradient(135deg,#1C140D,#161009)',borderBottom:'1px solid rgba(200,136,74,0.15)',padding:'64px 0' }}>
        <div style={{ maxWidth:1200,margin:'0 auto',padding:'0 48px' }}>
          <div style={{ display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:20 }}>
            <div>
              <div style={{ display:'inline-flex',alignItems:'center',gap:8,fontSize:11,fontWeight:600,letterSpacing:3,textTransform:'uppercase',color:'#C8884A',marginBottom:12 }}>
                <span style={{ width:20,height:1,background:'#C8884A',display:'inline-block' }}/>Project Products
              </div>
              <h1 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(36px,5vw,58px)',fontWeight:700,color:'#F0E8DC',lineHeight:1.1,marginBottom:10 }}>
                Premium <span style={{ color:'#E0A86A' }}>Building Materials</span>
              </h1>
              <p style={{ fontSize:15,color:'#9A8070',maxWidth:500 }}>ISI Certified · All Major Brands · Wholesale &amp; Retail · Karur's Widest Selection</p>
            </div>
            <div style={{ display:'flex',gap:12,flexWrap:'wrap' }}>
              <a href={`https://wa.me/${WA}?text=Hi%2C+I+need+a+price+list+for+your+products.`} target="_blank" rel="noopener"
                style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'12px 22px',borderRadius:8,background:'#25D366',color:'white',fontWeight:700,fontSize:14,textDecoration:'none' }}>
                💬 Get Price List
              </a>
              <Link href="/quick-order"
                style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'12px 22px',borderRadius:8,background:'rgba(37,211,102,0.1)',color:'#25D366',fontWeight:600,fontSize:14,textDecoration:'none',border:'1px solid rgba(37,211,102,0.25)' }}>
                ⚡ Quick Order
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth:1200,margin:'0 auto',padding:'48px 48px' }} className="page-pad">

        {/* Category filter tabs */}
        <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:40 }}>
          <Link href="/products"
            style={{ padding:'8px 18px',borderRadius:20,border:'1px solid',fontSize:13,fontWeight:600,textDecoration:'none',transition:'all 0.2s',
              borderColor: activeCategory==='all' ? '#C8884A' : 'rgba(200,136,74,0.2)',
              background: activeCategory==='all' ? 'rgba(200,136,74,0.15)' : 'transparent',
              color: activeCategory==='all' ? '#E0A86A' : '#9A8070' }}>
            🏷️ All Products {activeCategory==='all' && `(${products.length})`}
          </Link>
          {categories.map(cat => (
            <Link key={cat.id} href={`/products?category=${cat.slug}`}
              style={{ padding:'8px 18px',borderRadius:20,border:'1px solid',fontSize:13,fontWeight:600,textDecoration:'none',transition:'all 0.2s',
                borderColor: activeCategory===cat.slug ? '#C8884A' : 'rgba(200,136,74,0.2)',
                background: activeCategory===cat.slug ? 'rgba(200,136,74,0.15)' : 'transparent',
                color: activeCategory===cat.slug ? '#E0A86A' : '#9A8070' }}>
              {cat.icon} {cat.name}
            </Link>
          ))}
        </div>

        {/* Product grid */}
        {products.length === 0 ? (
          <div style={{ textAlign:'center',padding:'80px 0' }}>
            <div style={{ fontSize:48,marginBottom:16 }}>📦</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:700,color:'#F0E8DC',marginBottom:8 }}>No products found</div>
            <p style={{ color:'#9A8070',marginBottom:24 }}>Check back soon or ask us on WhatsApp.</p>
            <a href={`https://wa.me/${WA}?text=Hi%2C+do+you+have+products+in+this+category%3F`} target="_blank" rel="noopener"
              style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'12px 24px',borderRadius:8,background:'#25D366',color:'white',fontWeight:700,fontSize:14,textDecoration:'none' }}>
              💬 Ask on WhatsApp
            </a>
          </div>
        ) : (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20 }} className="prod-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} mode="project" />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {products.length > 0 && (
          <div style={{ marginTop:64,background:'linear-gradient(135deg,#0D2B17,#091810)',border:'1px solid rgba(37,211,102,0.2)',borderRadius:20,padding:'40px 48px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:32,flexWrap:'wrap' }}>
            <div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:'#F0E8DC',marginBottom:6 }}>Need a Bulk Quote?</div>
              <div style={{ fontSize:14,color:'rgba(255,255,255,0.5)' }}>Send your list and we'll give you the best wholesale rate.</div>
            </div>
            <a href={`https://wa.me/${WA}?text=Hi%2C+I+need+a+bulk+quote+for+plywood+and+materials.`} target="_blank" rel="noopener"
              style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'13px 28px',borderRadius:8,background:'#25D366',color:'white',fontWeight:700,fontSize:14,textDecoration:'none',flexShrink:0 }}>
              💬 Get Bulk Quote on WhatsApp
            </a>
          </div>
        )}
      </div>

      <style>{`
        @media(max-width:1024px){.prod-grid{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:640px){.prod-grid{grid-template-columns:1fr!important}.page-pad{padding:32px 20px!important}}
      `}</style>
    </>
  );
}
