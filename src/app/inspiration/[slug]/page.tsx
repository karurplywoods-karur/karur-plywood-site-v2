// src/app/inspiration/[slug]/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/db';
import { CONTACT } from '@/lib/contact';

const SITE_URL = 'https://www.karurplywood.co.in';
const WA = CONTACT.wa;

async function getInspiration(slug: string) {
  const { data } = await supabase.from('inspirations').select('*').eq('slug', slug).eq('published', true).maybeSingle();
  return data;
}
async function getSimilar(spaceType: string, currentSlug: string) {
  const { data } = await supabase.from('inspirations').select('id,title,slug,cover_image,items_used').eq('published', true).eq('space_type', spaceType).neq('slug', currentSlug).limit(4);
  return data || [];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const item = await getInspiration(params.slug);
  if (!item) return { title: 'Not Found' };
  return {
    title: `${item.title} | Karur Plywood & Company`,
    description: item.description || item.title,
    alternates: { canonical: `${SITE_URL}/inspiration/${params.slug}` },
  };
}

export default async function InspirationDetailPage({ params }: { params: { slug: string } }) {
  const item = await getInspiration(params.slug);
  if (!item) notFound();

  const similar = await getSimilar(item.space_type, item.slug);
  const gallery: string[] = [item.cover_image, ...(item.gallery_images || [])].filter(Boolean);
  const materials: { type: string; name: string }[] = Array.isArray(item.materials_used) ? item.materials_used : [];

  return (
    <div style={{ background: '#FAF8F5', paddingTop: 58, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 48px 60px' }} className="isd-pad">
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>
          <Link href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Home</Link> › <Link href="/inspiration" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Inspiration</Link> › <span style={{ color: '#F07316', fontWeight: 600 }}>{item.title}</span>
        </div>

        <div className="isd-top">
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F07316', marginBottom: 10 }}>{item.space_type}</div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(1.4rem,2.8vw,1.9rem)', fontWeight: 700, color: '#0B2447', lineHeight: 1.2, marginBottom: 12 }}>{item.title}</h1>
            {item.description && <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.75, marginBottom: 18 }}>{item.description}</p>}
            <div className="isd-meta-grid">
              {item.space_type && <div><div className="isd-label">Space Type</div><div className="isd-val">{item.space_type}</div></div>}
              {item.style && <div><div className="isd-label">Style</div><div className="isd-val">{item.style}</div></div>}
              {item.area_sqft && <div><div className="isd-label">Area</div><div className="isd-val">{item.area_sqft} sq.ft</div></div>}
              {item.items_used && <div><div className="isd-label">Items Used</div><div className="isd-val">{item.items_used} Items</div></div>}
              {item.location && <div><div className="isd-label">Location</div><div className="isd-val">{item.location}</div></div>}
              {item.completed_on && <div><div className="isd-label">Completed</div><div className="isd-val">{new Date(item.completed_on).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div></div>}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
              <a href={`https://wa.me/${WA}?text=${encodeURIComponent(`Hi, I'd like a quote for something similar to "${item.title}"`)}`} target="_blank" rel="noopener" className="isd-btn-primary">Get This Look →</a>
              <Link href="/bom-quote" className="isd-btn-outline">Save Inspiration</Link>
            </div>
          </div>
        </div>

        {/* Gallery */}
        {gallery.length > 0 && (
          <div className="isd-gallery-main">
            <Image src={gallery[0]} alt={item.title} fill style={{ objectFit: 'cover' }} priority />
          </div>
        )}
        {gallery.length > 1 && (
          <div className="isd-gallery-strip">
            {gallery.slice(1).map((src, i) => (
              <div key={i} className="isd-gallery-thumb"><Image src={src} alt={`${item.title} ${i + 2}`} fill style={{ objectFit: 'cover' }} sizes="140px" /></div>
            ))}
          </div>
        )}

        <div className="isd-layout">
          <div>
            {materials.length > 0 && (
              <div className="isd-card" style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: '#0B2447', marginBottom: 14 }}>Materials Used</div>
                <div className="isd-materials-grid">
                  {materials.map((m, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ aspectRatio: '1/1', borderRadius: 8, background: '#F2EDE5', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🪵</div>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: '#0B2447' }}>{m.type}</div>
                      <div style={{ fontSize: 10.5, color: '#6B7280' }}>{m.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {item.color_palette?.length > 0 && (
              <div className="isd-card">
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: '#0B2447', marginBottom: 12 }}>Color Palette</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {item.color_palette.map((c: string, i: number) => (
                    <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: c, border: '1px solid #E5E1DC' }} title={c} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside>
            <div className="isd-cta-card">
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: '#0B2447', marginBottom: 6 }}>Work With Our Experts</div>
              <div style={{ fontSize: 12.5, color: '#4B5563', marginBottom: 14 }}>Get a customized design and quote for your dream space.</div>
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener" className="isd-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Request a Quote →</a>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#0B2447', marginBottom: 16 }}>Similar Inspirations</h2>
            <div className="isd-related-grid">
              {similar.map((s: any) => (
                <Link key={s.id} href={`/inspiration/${s.slug}`} className="insp-card-like">
                  <div style={{ position: 'relative', aspectRatio: '4/3', background: '#F2EDE5' }}>
                    {s.cover_image && <Image src={s.cover_image} alt={s.title} fill style={{ objectFit: 'cover' }} sizes="240px" />}
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12.5, color: '#0B2447' }}>{s.title}</div>
                    {s.items_used && <div style={{ fontSize: 11, color: '#9CA3AF' }}>{s.items_used} Items Used</div>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .isd-top { margin-bottom: 20px; max-width: 640px; }
        .isd-meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px 20px; }
        .isd-label { font-size: 10px; color: #9CA3AF; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 2px; }
        .isd-val { font-size: 13px; color: #0B2447; font-weight: 700; font-family: 'Syne',sans-serif; }
        .isd-btn-primary { display: inline-flex; align-items: center; padding: 11px 22px; background: #F07316; color: #FFFFFF; border-radius: 6px; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 12.5px; text-decoration: none; }
        .isd-btn-outline { display: inline-flex; align-items: center; padding: 11px 22px; border: 1px solid #E5E1DC; background: #FFFFFF; color: #0B2447; border-radius: 6px; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 12.5px; text-decoration: none; }
        .isd-gallery-main { position: relative; width: 100%; aspect-ratio: 16/7; border-radius: 12px; overflow: hidden; margin-bottom: 10px; background: #F2EDE5; }
        .isd-gallery-strip { display: flex; gap: 8px; overflow-x: auto; margin-bottom: 24px; }
        .isd-gallery-thumb { position: relative; width: 140px; height: 100px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: #F2EDE5; }
        .isd-layout { display: grid; grid-template-columns: 1fr 280px; gap: 20px; align-items: start; }
        .isd-card { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; padding: 20px; box-shadow: 0 1px 4px rgba(11,36,71,0.05); }
        .isd-materials-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; }
        .isd-cta-card { background: #FFF4ED; border: 1px solid rgba(240,115,22,0.25); border-radius: 10px; padding: 20px; }
        .isd-related-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .insp-card-like { display: block; background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; overflow: hidden; text-decoration: none; }
        .insp-card-like:hover { border-color: rgba(240,115,22,0.35); }
        @media(max-width:900px){ .isd-layout { grid-template-columns: 1fr !important; } .isd-materials-grid { grid-template-columns: repeat(3,1fr); } .isd-related-grid { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:640px){ .isd-pad { padding-left:16px !important; padding-right:16px !important; } .isd-meta-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>
    </div>
  );
}
