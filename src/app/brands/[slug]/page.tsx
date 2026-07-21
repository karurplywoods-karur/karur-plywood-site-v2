// src/app/brands/[slug]/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getBrandBySlug, getProjectProducts } from '@/lib/products';
import ProductCard from '@/components/ProductCard';

const SITE_URL = 'https://www.karurplywood.co.in';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const brand = await getBrandBySlug(params.slug);
  if (!brand) return { title: 'Brand Not Found' };
  return {
    title: `${brand.name} | Karur Plywood & Company`,
    description: brand.seo_description || brand.description || `Shop ${brand.name} products at Karur Plywood & Company.`,
    alternates: { canonical: `${SITE_URL}/brands/${params.slug}` },
  };
}

export default async function BrandDetailPage({ params }: { params: { slug: string } }) {
  const brand = await getBrandBySlug(params.slug);
  if (!brand) notFound();

  const products = await getProjectProducts(undefined, undefined, { brandSlugs: [params.slug] });

  return (
    <div style={{ background: '#FAF8F5', paddingTop: 58, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 48px 60px' }} className="bd-pad">
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 20 }}>
          <Link href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Home</Link> › <Link href="/brands" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Brands</Link> › <span style={{ color: '#F07316', fontWeight: 600 }}>{brand.name}</span>
        </div>

        {/* Header */}
        <div className="bd-header">
          <div className="bd-logo-wrap">
            {brand.logo_url
              ? <Image src={brand.logo_url} alt={brand.name} fill style={{ objectFit: 'contain', padding: 20 }} sizes="220px" />
              : <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: '#0B2447' }}>{brand.name}</span>}
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(1.5rem,2.8vw,2rem)', fontWeight: 700, color: '#0B2447', margin: '0 0 10px' }}>{brand.name}</h1>
            <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.75, maxWidth: 640, margin: '0 0 14px' }}>
              {brand.description || `Explore ${brand.name}'s range of products, stocked and sold at Karur Plywood & Company.`}
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontFamily: "'Syne',sans-serif", fontWeight: 700, color: '#F07316' }}>{products.length}+ Products Available</span>
              {brand.website && (
                <a href={brand.website} target="_blank" rel="noopener" style={{ fontSize: 12.5, color: '#6B7280', textDecoration: 'none' }}>↗ {brand.website.replace(/^https?:\/\//, '')}</a>
              )}
            </div>
          </div>
        </div>

        {/* Products */}
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#0B2447', margin: '32px 0 16px' }}>
          {brand.name} Products
        </h2>
        {products.length > 0 ? (
          <div className="bd-grid">
            {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#6B7280' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
            No products listed for this brand yet. <a href="https://wa.me/919159666538" target="_blank" rel="noopener" style={{ color: '#16a34a' }}>Ask us on WhatsApp</a> — we may still stock it.
          </div>
        )}
      </div>

      <style>{`
        .bd-header { display: flex; gap: 28px; align-items: center; background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 14px; padding: 28px; flex-wrap: wrap; }
        .bd-logo-wrap { position: relative; width: 220px; height: 140px; background: #FAF8F5; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .bd-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
        @media(max-width:900px){ .bd-grid { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:640px){ .bd-pad { padding-left:16px !important; padding-right:16px !important; } .bd-header { flex-direction: column; text-align: center; } .bd-logo-wrap { width: 100%; } }
      `}</style>
    </div>
  );
}
