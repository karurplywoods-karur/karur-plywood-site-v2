// src/app/inspiration/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/db';
import { CONTACT } from '@/lib/contact';

const SITE_URL = 'https://www.karurplywood.co.in';
const WA = CONTACT.wa;

export const metadata: Metadata = {
  title: 'Inspiration | Karur Plywood & Company',
  description: 'Browse real interior projects and get inspired for your own space, from Karur Plywood & Company.',
  alternates: { canonical: `${SITE_URL}/inspiration` },
};

const SPACE_TYPES = ['Modular Kitchen', 'Wardrobes', 'TV Units', 'Bedrooms', 'Living Room', 'False Ceiling', 'Office Spaces', 'Doors', 'Commercial'];
const FALLBACK_IMG: Record<string, string> = {
  'Modular Kitchen': '/images/inspiration-kitchen.jpg', 'Wardrobes': '/images/inspiration-wardrobe.jpg',
  'TV Units': '/images/inspiration-tvunit.jpg', 'Bedrooms': '/images/inspiration-bedroom.jpg',
  'Living Room': '/images/inspiration-living.jpg', 'False Ceiling': '/images/inspiration-falseceiling.jpg',
  'Office Spaces': '/images/inspiration-office.jpg', 'Doors': '/images/inspiration-doors.jpg',
};

async function getInspirations(space?: string) {
  let query = supabase.from('inspirations').select('*').eq('published', true).order('sort_order', { ascending: true });
  if (space && space !== 'all') query = query.eq('space_type', space);
  const { data, error } = await query;
  if (error) { console.error(error); return []; }
  return data || [];
}

export default async function InspirationPage({ searchParams }: { searchParams: { space?: string } }) {
  const space = searchParams.space || 'all';
  const items = await getInspirations(space);

  return (
    <div style={{ background: '#FAF8F5', paddingTop: 58, minHeight: '100vh' }}>

      {/* Hero */}
      <section className="insp-hero">
        <div className="insp-hero-overlay" />
        <Image src="/images/inspiration-hero.jpg" alt="Interior inspiration" fill style={{ objectFit: 'cover' }} priority />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px', position: 'relative', zIndex: 2 }} className="insp-pad">
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Home</Link> › <span style={{ color: '#FF9A45' }}>Inspiration</span>
          </div>
          <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(1.8rem,3.6vw,2.6rem)', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1, marginBottom: 14, maxWidth: 480 }}>
            Inspiration for Every Space
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', maxWidth: 440 }}>
            Explore real interior projects and get inspired to create your dream space with the right materials and finishes.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 48px 60px' }} className="insp-pad">

        {/* Space type tabs */}
        <div className="insp-tabs">
          <Link href="/inspiration" className={`insp-tab${space === 'all' ? ' insp-tab--active' : ''}`}>All Inspiration</Link>
          {SPACE_TYPES.map(s => (
            <Link key={s} href={`/inspiration?space=${encodeURIComponent(s)}`} className={`insp-tab${space === s ? ' insp-tab--active' : ''}`}>{s}</Link>
          ))}
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '70px 0', background: '#FFFFFF', border: '1px solid #E5E1DC', borderRadius: 12, marginTop: 20 }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🏠</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, color: '#0B2447', marginBottom: 8, fontSize: 17 }}>
              {space === 'all' ? 'Gallery coming soon' : `No ${space} projects yet`}
            </div>
            <p style={{ color: '#6B7280', marginBottom: 22, fontSize: 14, maxWidth: 420, margin: '0 auto 22px' }}>
              We&apos;re building out our project gallery. Want to see examples now, or discuss your own project?
            </p>
            <a href={`https://wa.me/${WA}?text=Hi%2C+I%27d+like+to+see+some+project+examples.`} target="_blank" rel="noopener" className="insp-btn-wa">💬 Ask on WhatsApp</a>
          </div>
        ) : (
          <div className="insp-grid">
            {items.map((it: any) => (
              <Link key={it.id} href={`/inspiration/${it.slug}`} className="insp-card">
                <div className="insp-card-img">
                  <Image src={it.cover_image || FALLBACK_IMG[it.space_type] || '/images/inspiration-living.jpg'} alt={it.title} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 25vw" />
                  <span className="insp-card-tag">{it.space_type}</span>
                </div>
                <div style={{ padding: '14px 16px 16px' }}>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13.5, color: '#0B2447', marginBottom: 8 }}>{it.title}</div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: '#9CA3AF' }}>
                    {it.items_used && <span>📦 {it.items_used} Items</span>}
                    {it.location && <span>📍 {it.location}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .insp-hero { position: relative; padding: 44px 0 40px; overflow: hidden; }
        .insp-hero-overlay { position: absolute; inset: 0; background: linear-gradient(100deg, rgba(11,36,71,0.88) 0%, rgba(11,36,71,0.55) 60%, rgba(11,36,71,0.2) 100%); z-index: 1; }
        .insp-tabs { display: flex; gap: 4px; overflow-x: auto; border-bottom: 1px solid #E5E1DC; margin-bottom: 24px; }
        .insp-tab { padding: 10px 14px; font-family: 'Inter',sans-serif; font-size: 0.72rem; font-weight: 700; color: #6B7280; text-decoration: none; white-space: nowrap; border-bottom: 2px solid transparent; }
        .insp-tab--active { color: #F07316; border-bottom-color: #F07316; }
        .insp-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
        .insp-card { display: block; background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; overflow: hidden; text-decoration: none; transition: all .2s; }
        .insp-card:hover { transform: translateY(-4px); box-shadow: 0 14px 30px rgba(11,36,71,0.1); border-color: rgba(240,115,22,0.35); }
        .insp-card-img { position: relative; aspect-ratio: 4/3; background: #F2EDE5; }
        .insp-card-tag { position: absolute; top: 10px; left: 10px; background: rgba(11,36,71,0.85); color: #FFFFFF; font-family: 'Inter',sans-serif; font-size: 9.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 3px 9px; border-radius: 3px; }
        .insp-btn-wa { display: inline-flex; align-items: center; padding: 11px 22px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; border-radius: 6px; font-family: 'Inter',sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; }
        @media(max-width:1100px){ .insp-grid { grid-template-columns: repeat(3,1fr); } }
        @media(max-width:768px){ .insp-grid { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:640px){ .insp-pad { padding-left:16px !important; padding-right:16px !important; } }
      `}</style>
    </div>
  );
}
