// src/app/category/[slug]/page.tsx
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/db';
import { getBrands } from '@/lib/products';

const SITE_URL = 'https://www.karurplywood.co.in';

async function getCategoryBySlug(slug: string) {
  const { data } = await supabase.from('categories').select('*').eq('slug', slug).maybeSingle();
  return data;
}

async function getSubcategories(parentId: string | number) {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', parentId)
    .order('sort_order', { ascending: true });
  return data || [];
}

async function getProductCount(categoryId: string | number) {
  const { count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', categoryId)
    .eq('in_stock', true);
  return count || 0;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return { title: 'Category Not Found' };
  return {
    title: `${category.name} | Karur Plywood & Company`,
    description: category.description || `Browse our range of ${category.name} at Karur Plywood & Company. ISI certified, wholesale & retail pricing.`,
    alternates: { canonical: `${SITE_URL}/category/${params.slug}` },
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const [subcategories, brands] = await Promise.all([
    getSubcategories(category.id),
    getBrands(),
  ]);

  const subWithCounts = await Promise.all(
    subcategories.map(async (sub: any) => ({ ...sub, count: await getProductCount(sub.id) }))
  );

  return (
    <div style={{ background: '#FAF8F5', paddingTop: 58 }}>

      {/* ── Breadcrumb ── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E1DC', padding: '10px 0' }}>
        <div className="cat-pad" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>
          <div style={{ fontSize: 12, color: '#9CA3AF', display: 'flex', gap: 6 }}>
            <Link href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Home</Link><span>›</span>
            <Link href="/products" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Products</Link><span>›</span>
            <span style={{ color: '#F07316', fontWeight: 600 }}>{category.name}</span>
          </div>
        </div>
      </div>

      {/* ── Hero banner ── */}
      <section className="cat-hero">
        <div className="cat-hero-overlay" />
        <div className="cat-pad cat-hero-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>
          <div className="cat-hero-copy">
            <div className="cat-hero-eyebrow"><span className="cat-hero-eyebrow-line" />{category.name.toUpperCase()}</div>
            <h1 className="cat-hero-title">
              BUILT ON STRENGTH.<br />MADE TO LAST.
            </h1>
            <p className="cat-hero-sub">
              {category.description || `Premium quality ${category.name.toLowerCase()} for every application. Choose from a wide range of brands, grades & thicknesses.`}
            </p>
            <div className="cat-hero-highlights">
              {['100% Original Products', 'Wide Range Available', 'Trusted Brands', 'Best Price Guaranteed'].map(h => (
                <div key={h} className="cat-hero-highlight">
                  <span className="cat-hero-highlight-icon">✓</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="cat-hero-img">
            {category.image_url
              ? <Image src={category.image_url} alt={category.name} fill style={{ objectFit: 'cover' }} sizes="(max-width:900px) 0px, 50vw" />
              : <Image src="/images/plywood-stack.jpg" alt={category.name} fill style={{ objectFit: 'cover' }} sizes="(max-width:900px) 0px, 50vw" />}
          </div>
        </div>
      </section>

      {/* ── Subcategory grid ── */}
      {subWithCounts.length > 0 && (
        <section className="cat-pad" style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 48px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 className="cat-section-title">BROWSE {category.name.toUpperCase()} CATEGORIES</h2>
            <Link href={`/products?category=${category.slug}`} className="cat-view-all">View All {category.name} →</Link>
          </div>
          <div className="cat-sub-grid">
            {subWithCounts.map((sub: any) => (
              <Link key={sub.id} href={`/products?category=${sub.slug}`} className="cat-sub-card">
                <div className="cat-sub-img">
                  {sub.image_url
                    ? <Image src={sub.image_url} alt={sub.name} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 50vw, 20vw" />
                    : <div className="cat-sub-img-fallback">{sub.icon || '🪵'}</div>}
                </div>
                <div className="cat-sub-body">
                  <div className="cat-sub-name">{sub.name}</div>
                  <div className="cat-sub-meta">
                    <span>{sub.count}+ Products</span>
                    <span className="cat-sub-arrow">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Top brands ── */}
      {brands.length > 0 && (
        <section className="cat-pad" style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 48px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 className="cat-section-title">TOP {category.name.toUpperCase()} BRANDS</h2>
            <Link href="/brands" className="cat-view-all">View All Brands →</Link>
          </div>
          <div className="cat-brand-row">
            {brands.slice(0, 8).map(b => (
              <div key={b.slug} className="cat-brand-chip">{b.name}</div>
            ))}
          </div>
        </section>
      )}

      {/* ── Why choose (dark band) ── */}
      <section className="cat-why-band">
        <div className="cat-pad" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>
          <h2 className="cat-why-title">WHY CHOOSE OUR {category.name.toUpperCase()}?</h2>
          <div className="cat-why-grid">
            {[
              { icon: '🛡️', t: 'Premium Quality', d: 'Sourced from trusted brands only.' },
              { icon: '💧', t: 'BWP & Marine Options', d: 'Waterproof solutions for all needs.' },
              { icon: '🐛', t: 'Termite & Borer Resistant', d: 'Long lasting protection for your spaces.' },
              { icon: '🔩', t: 'High Screw Holding Capacity', d: 'Better grip for strong & durable furniture.' },
              { icon: '📚', t: 'Wide Range', d: 'Multiple grades, sizes & thicknesses.' },
              { icon: '🏅', t: 'Best Price Guaranteed', d: 'Get the best quality at the best price.' },
            ].map(w => (
              <div key={w.t} className="cat-why-item">
                <div className="cat-why-icon">{w.icon}</div>
                <div className="cat-why-t">{w.t}</div>
                <div className="cat-why-d">{w.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .cat-hero { position: relative; background: linear-gradient(160deg,#0a1d3a,#070F1F); overflow: hidden; }
        .cat-hero-overlay { position: absolute; inset: 0; background-image: linear-gradient(rgba(240,115,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(240,115,22,0.04) 1px, transparent 1px); background-size: 50px 50px; }
        .cat-hero-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; padding-top: 44px; padding-bottom: 44px; position: relative; z-index: 2; }
        .cat-hero-eyebrow { display: flex; align-items: center; gap: 10px; font-family: 'Inter',sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.16em; color: #F07316; margin-bottom: 14px; }
        .cat-hero-eyebrow-line { width: 22px; height: 2px; background: #F07316; }
        .cat-hero-title { font-family: 'Syne',sans-serif; font-size: clamp(1.8rem,3.6vw,2.8rem); letter-spacing: 0.02em; color: #FFFFFF; line-height: 1.05; margin-bottom: 14px; }
        .cat-hero-sub { font-size: 13.5px; color: #C7D2E0; line-height: 1.75; max-width: 460px; margin-bottom: 22px; }
        .cat-hero-highlights { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px; max-width: 420px; }
        .cat-hero-highlight { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #E5E1DC; font-family: 'Inter',sans-serif; font-weight: 600; }
        .cat-hero-highlight-icon { width: 22px; height: 22px; border: 1px solid rgba(240,115,22,0.5); border-radius: 5px; color: #F07316; display: flex; align-items: center; justify-content: center; font-size: 11px; flex-shrink: 0; }
        .cat-hero-img { position: relative; aspect-ratio: 16/10; border-radius: 12px; overflow: hidden; }
        @media(max-width:900px){ .cat-hero-inner { grid-template-columns: 1fr; } .cat-hero-img { display: none; } }

        .cat-section-title { font-family: 'Syne',sans-serif; font-size: clamp(1.3rem,2.2vw,1.7rem); letter-spacing: 0.03em; color: #0B2447; border-bottom: 2px solid #F07316; display: inline-block; padding-bottom: 2px; }
        .cat-view-all { font-family: 'Inter',sans-serif; font-size: 0.72rem; font-weight: 700; color: #F07316; text-decoration: none; white-space: nowrap; }
        .cat-view-all:hover { text-decoration: underline; }

        .cat-sub-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
        .cat-sub-card { display: block; background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; overflow: hidden; text-decoration: none; transition: all 0.2s; }
        .cat-sub-card:hover { transform: translateY(-3px); box-shadow: 0 14px 28px rgba(11,36,71,0.1); border-color: rgba(240,115,22,0.35); }
        .cat-sub-img { position: relative; aspect-ratio: 1/0.85; background: #F2EDE5; }
        .cat-sub-img-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 30px; background: linear-gradient(135deg,#EDE6DB,#DCD0BE); }
        .cat-sub-body { padding: 12px 14px 14px; }
        .cat-sub-name { font-family: 'Inter',sans-serif; font-weight: 700; font-size: 0.82rem; color: #0B2447; margin-bottom: 4px; }
        .cat-sub-meta { display: flex; justify-content: space-between; align-items: center; font-size: 0.68rem; color: #6B7280; }
        .cat-sub-arrow { color: #F07316; font-weight: 700; }

        .cat-brand-row { display: flex; gap: 14px; overflow-x: auto; padding: 4px 2px 10px; }
        .cat-brand-chip { flex: 0 0 150px; height: 74px; display: flex; align-items: center; justify-content: center; background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 8px; font-family: 'Inter',sans-serif; font-weight: 800; font-size: 0.78rem; letter-spacing: 0.03em; text-transform: uppercase; color: #0B2447; text-align: center; transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
        .cat-brand-chip:hover { transform: translateY(-4px) scale(1.04); box-shadow: 0 12px 24px rgba(11,36,71,0.12); border-color: rgba(240,115,22,0.4); }

        .cat-why-band { background: #0B2447; padding: 52px 0; }
        .cat-why-title { text-align: center; font-family: 'Inter',sans-serif; font-size: 0.95rem; font-weight: 700; letter-spacing: 0.1em; color: #FFFFFF; border-bottom: 2px solid #F07316; display: block; padding-bottom: 14px; margin: 0 auto 36px; width: max-content; }
        .cat-why-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 20px; text-align: center; }
        .cat-why-icon { width: 52px; height: 52px; margin: 0 auto 12px; border: 1.5px solid rgba(240,115,22,0.5); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #F07316; }
        .cat-why-t { font-family: 'Inter',sans-serif; font-weight: 700; font-size: 0.76rem; color: #FFFFFF; margin-bottom: 6px; }
        .cat-why-d { font-size: 0.68rem; color: #93A3BC; line-height: 1.5; }

        @media(max-width:1100px){ .cat-sub-grid { grid-template-columns: repeat(3,1fr); } .cat-why-grid { grid-template-columns: repeat(3,1fr); row-gap: 30px; } }
        @media(max-width:640px){ .cat-pad { padding-left:16px !important; padding-right:16px !important; } .cat-sub-grid { grid-template-columns: repeat(2,1fr); } .cat-why-grid { grid-template-columns: 1fr 1fr; } .cat-hero-highlights { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
