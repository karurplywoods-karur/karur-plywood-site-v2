// src/app/brands/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getBrands, getBrandProductCount } from '@/lib/products';

const SITE_URL = 'https://www.karurplywood.co.in';

export const metadata: Metadata = {
  title: 'All Brands | Karur Plywood & Company',
  description: 'Browse all the trusted plywood, laminate, and hardware brands we stock at Karur Plywood & Company.',
  alternates: { canonical: `${SITE_URL}/brands` },
};

export default async function BrandsPage() {
  const brands = await getBrands();
  const withCounts = await Promise.all(brands.map(async b => ({ ...b, count: await getBrandProductCount(b.id) })));

  return (
    <div style={{ background: '#FAF8F5', paddingTop: 58, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 48px 60px' }} className="brands-pad">
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 14 }}>
          <Link href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Home</Link> › <span style={{ color: '#F07316', fontWeight: 600 }}>Brands</span>
        </div>

        <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(1.6rem,3vw,2.1rem)', fontWeight: 700, color: '#0B2447', margin: '0 0 6px' }}>Top Brands. Trusted Quality.</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>We partner with India&apos;s most trusted brands to bring you premium materials and hardware for every project.</p>

        {withCounts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#6B7280' }}>No brands added yet.</div>
        ) : (
          <div className="brand-grid">
            {withCounts.map(b => (
              <Link key={b.slug} href={`/brands/${b.slug}`} className="brand-tile">
                <div className="brand-tile-logo">
                  {b.logo_url
                    ? <Image src={b.logo_url} alt={b.name} fill style={{ objectFit: 'contain', padding: 16 }} sizes="200px" />
                    : <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 18, color: '#0B2447' }}>{b.name}</span>}
                </div>
                <div style={{ padding: '12px 16px 16px' }}>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, color: '#0B2447', marginBottom: 2 }}>{b.name}</div>
                  <div style={{ fontSize: 12, color: '#F07316', fontWeight: 600 }}>{b.count}+ Products</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .brand-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
        .brand-tile { display: block; background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; overflow: hidden; text-decoration: none; transition: all .2s; }
        .brand-tile:hover { transform: translateY(-3px); box-shadow: 0 14px 28px rgba(11,36,71,0.1); border-color: rgba(240,115,22,0.35); }
        .brand-tile-logo { position: relative; aspect-ratio: 16/10; background: #FFFFFF; border-bottom: 1px solid #F1EEE9; display: flex; align-items: center; justify-content: center; }
        @media(max-width:1000px){ .brand-grid { grid-template-columns: repeat(3,1fr); } }
        @media(max-width:640px){ .brands-pad { padding-left:16px !important; padding-right:16px !important; } .brand-grid { grid-template-columns: repeat(2,1fr); } }
      `}</style>
    </div>
  );
}
