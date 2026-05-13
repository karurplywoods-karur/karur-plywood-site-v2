// src/app/architects/[slug]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999';

const TYPE_LABEL: Record<string, string> = {
  residential: '🏠 Residential',
  commercial:  '🏢 Commercial',
  interior:    '🎨 Interior',
};

interface Project {
  id: string; title: string; description: string; location: string;
  project_type: string; year: number; cover_image: string;
  images: string[]; materials_used: string[]; published: boolean; sort_order: number;
}
interface Architect {
  id: string; slug: string; name: string; firm: string; phone: string;
  wa_number: string; city: string; bio: string; photo_url: string;
  website: string; specialities: string[]; years_exp: number;
  featured: boolean; verified: boolean;
  architect_projects: Project[];
}

// ── Lightbox component ─────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }: {
  images: string[]; startIndex: number; onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % images.length);
      if (e.key === 'ArrowLeft')  setIdx(i => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length, onClose]);

  return (
    <div className="lb-overlay" onClick={onClose}>
      <div className="lb-box" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button className="lb-close" onClick={onClose}>✕</button>

        {/* Counter */}
        <div className="lb-counter">{idx + 1} / {images.length}</div>

        {/* Main image */}
        <div className="lb-main">
          <Image src={images[idx]} alt={`Photo ${idx + 1}`} fill style={{ objectFit: 'contain' }} />
        </div>

        {/* Prev / Next */}
        {images.length > 1 && (
          <>
            <button className="lb-prev" onClick={() => setIdx(i => (i - 1 + images.length) % images.length)}>‹</button>
            <button className="lb-next" onClick={() => setIdx(i => (i + 1) % images.length)}>›</button>
          </>
        )}

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="lb-thumbs">
            {images.map((img, i) => (
              <div key={i}
                className={`lb-thumb${i === idx ? ' lb-thumb--active' : ''}`}
                onClick={() => setIdx(i)}>
                <Image src={img} alt={`Thumb ${i + 1}`} fill style={{ objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Project card with photo gallery ───────────────────────────
function ProjectCard({ p, waHire }: { p: Project; waHire: string }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx,  setLightboxIdx]  = useState(0);

  // All photos: cover first, then extras
  const allPhotos = [
    ...(p.cover_image ? [p.cover_image] : []),
    ...(p.images || []).filter((img: string) => img && img !== p.cover_image),
  ];

  const openPhoto = (i: number) => { setLightboxIdx(i); setLightboxOpen(true); };

  return (
    <div className="port-card">
      {/* Cover image — click to open lightbox */}
      <div className="port-card-img" onClick={() => allPhotos.length > 0 && openPhoto(0)}
        style={{ cursor: allPhotos.length > 0 ? 'pointer' : 'default' }}>
        {p.cover_image ? (
          <Image src={p.cover_image} alt={p.title} fill
            style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 50vw" />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 56, background: 'linear-gradient(135deg,#0d1f3a,#19376D)' }}>
            {p.project_type === 'commercial' ? '🏢' : p.project_type === 'interior' ? '🎨' : '🏠'}
          </div>
        )}

        {/* Badges */}
        <div style={{ position: 'absolute', top: 12, left: 12,
          background: 'rgba(7,15,31,0.85)', backdropFilter: 'blur(6px)',
          border: '1px solid rgba(249,115,22,0.28)', borderRadius: 3,
          padding: '3px 10px', fontSize: 10, fontFamily: "'Syne',sans-serif",
          fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#F97316' }}>
          {TYPE_LABEL[p.project_type] || p.project_type}
        </div>

        {p.year && (
          <div style={{ position: 'absolute', top: 12, right: 12,
            background: 'rgba(7,15,31,0.85)', backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3,
            padding: '3px 10px', fontSize: 10, fontFamily: "'Syne',sans-serif",
            fontWeight: 700, color: '#7A8EA8' }}>
            {p.year}
          </div>
        )}

        {/* Photo count badge */}
        {allPhotos.length > 1 && (
          <div style={{ position: 'absolute', bottom: 12, right: 12,
            background: 'rgba(7,15,31,0.85)', backdropFilter: 'blur(6px)',
            border: '1px solid rgba(249,115,22,0.25)', borderRadius: 3,
            padding: '3px 10px', fontSize: 10, fontFamily: "'Syne',sans-serif",
            fontWeight: 700, color: '#F97316', display: 'flex', alignItems: 'center', gap: 5 }}>
            📷 {allPhotos.length} photos
          </div>
        )}

        {/* View overlay on hover */}
        {allPhotos.length > 0 && (
          <div className="port-card-overlay">
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: 'white' }}>
              View Gallery ↗
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail strip — extra photos */}
      {allPhotos.length > 1 && (
        <div className="port-thumb-strip">
          {allPhotos.map((img, i) => (
            <div key={i} className={`port-thumb${i === 0 ? ' port-thumb--active' : ''}`}
              onClick={() => openPhoto(i)}>
              <Image src={img} alt={`Photo ${i + 1}`} fill style={{ objectFit: 'cover' }} />
              {i === 3 && allPhotos.length > 4 && (
                <div className="port-thumb-more">+{allPhotos.length - 4}</div>
              )}
            </div>
          )).slice(0, 4)}
        </div>
      )}

      {/* Body */}
      <div style={{ padding: '18px 20px 20px' }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '1rem',
          color: '#F8F9FB', marginBottom: 6, lineHeight: 1.3 }}>{p.title}</div>
        {p.location && (
          <div style={{ fontSize: 12, color: '#7A8EA8', marginBottom: 10 }}>📍 {p.location}</div>
        )}
        {p.description && (
          <p style={{ fontSize: 13, color: '#7A8EA8', lineHeight: 1.65, marginBottom: 14 }}>{p.description}</p>
        )}

        {/* Materials */}
        {p.materials_used?.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontFamily: "'Syne',sans-serif", fontWeight: 700,
              letterSpacing: '.15em', textTransform: 'uppercase', color: '#7A8EA8', marginBottom: 8 }}>
              Materials from Karur Plywood:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {p.materials_used.map((m: string) => (
                <span key={m} style={{ fontSize: 11, fontFamily: "'Syne',sans-serif", fontWeight: 700,
                  letterSpacing: '.06em', background: 'rgba(249,115,22,0.08)',
                  border: '1px solid rgba(249,115,22,0.2)', color: '#F97316',
                  padding: '3px 8px', borderRadius: 3 }}>{m}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && allPhotos.length > 0 && (
        <Lightbox images={allPhotos} startIndex={lightboxIdx} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────
export default function ArchitectPortfolioPage() {
  const params  = useParams();
  const slug    = params?.slug as string;
  const [arch,   setArch]    = useState<Architect | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/architects/${slug}`)
      .then(r => r.json())
      .then(data => { setArch(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#070F1F', color: '#7A8EA8', fontSize: 14 }}>
      ⏳ Loading portfolio...
    </div>
  );

  if (!arch || arch.id === undefined) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#070F1F', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>🏛️</div>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '2rem', color: '#F8F9FB' }}>NOT FOUND</div>
      <Link href="/architects" className="btn-s">← Back to Architects</Link>
    </div>
  );

  const projects = (arch.architect_projects || [])
    .filter((p: Project) => p.published !== false)
    .sort((a: Project, b: Project) => (a.sort_order || 0) - (b.sort_order || 0));

  const waHire = encodeURIComponent(
    `Hi ${arch.name}, I found your portfolio on Karur Plywood & Company. I'd like to discuss my project.`
  );

  return (
    <>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(160deg,#0a1d3a,#070F1F)',
        borderBottom: '1px solid rgba(249,115,22,0.15)', padding: '80px 0 56px',
        paddingTop: 'calc(80px + 62px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 5rem' }} className="port-pad">

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 12, color: '#7A8EA8', marginBottom: 28 }}>
            <Link href="/" style={{ color: '#7A8EA8' }}>Home</Link>
            <span>›</span>
            <Link href="/architects" style={{ color: '#7A8EA8' }}>Architects</Link>
            <span>›</span>
            <span style={{ color: '#F97316' }}>{arch.name}</span>
          </div>

          <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ width: 90, height: 90, borderRadius: '50%',
              background: 'rgba(249,115,22,0.1)', border: '3px solid rgba(249,115,22,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 40, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
              {arch.photo_url
                ? <Image src={arch.photo_url} alt={arch.name} fill style={{ objectFit: 'cover' }} />
                : '🏛️'}
            </div>

            <div style={{ flex: 1 }}>
              {/* Badges */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                <span style={{ fontSize: 10, fontFamily: "'Syne',sans-serif", fontWeight: 700,
                  letterSpacing: '.12em', textTransform: 'uppercase',
                  background: 'rgba(37,211,102,0.12)', color: '#4ADE80',
                  border: '1px solid rgba(37,211,102,0.2)', padding: '3px 10px', borderRadius: 2 }}>
                  ✓ Verified Partner
                </span>
                {arch.featured && (
                  <span style={{ fontSize: 10, fontFamily: "'Syne',sans-serif", fontWeight: 700,
                    letterSpacing: '.12em', textTransform: 'uppercase',
                    background: 'rgba(249,115,22,0.15)', color: '#F97316',
                    border: '1px solid rgba(249,115,22,0.3)', padding: '3px 10px', borderRadius: 2 }}>
                    ⭐ Featured
                  </span>
                )}
              </div>

              <h1 style={{ fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 'clamp(2rem,4vw,3.2rem)', letterSpacing: '.04em',
                color: '#F8F9FB', lineHeight: 1, marginBottom: 6 }}>
                {arch.name}
              </h1>
              {arch.firm && (
                <div style={{ fontSize: 14, color: '#F97316', fontFamily: "'Syne',sans-serif",
                  fontWeight: 700, marginBottom: 6 }}>{arch.firm}</div>
              )}
              <div style={{ fontSize: 13, color: '#7A8EA8', marginBottom: 14 }}>
                📍 {arch.city} · {arch.years_exp}+ years experience
              </div>
              {arch.bio && (
                <p style={{ fontSize: 14, color: '#A8BCCC', lineHeight: 1.8,
                  maxWidth: 580, marginBottom: 18, fontWeight: 300 }}>{arch.bio}</p>
              )}

              {arch.specialities?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 22 }}>
                  {arch.specialities.map((s: string) => (
                    <span key={s} style={{ fontSize: 11, fontFamily: "'Syne',sans-serif",
                      fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
                      background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
                      color: '#F97316', padding: '3px 9px', borderRadius: 2 }}>{s}</span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {arch.wa_number && (
                  <a href={`https://wa.me/${arch.wa_number.replace(/\D/g,'')}?text=${waHire}`}
                    target="_blank" rel="noopener" className="btn-wa">💬 Hire on WhatsApp</a>
                )}
                {arch.phone && (
                  <a href={`tel:${arch.phone}`} className="btn-s">📞 Call</a>
                )}
                {arch.website && (
                  <a href={arch.website} target="_blank" rel="noopener" className="btn-s">🌐 Website</a>
                )}
              </div>
            </div>

            {/* Stats */}
            <div style={{ background: 'rgba(25,55,109,0.4)', border: '1px solid rgba(249,115,22,0.15)',
              borderRadius: 8, padding: '20px 28px', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '2.8rem',
                letterSpacing: '.04em', color: '#F97316', lineHeight: 1 }}>
                {projects.length}
              </div>
              <div style={{ fontSize: 10, fontFamily: "'Syne',sans-serif", fontWeight: 700,
                letterSpacing: '.15em', textTransform: 'uppercase', color: '#7A8EA8', marginTop: 4 }}>
                Projects
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects grid */}
      <section style={{ padding: '56px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 5rem' }} className="port-pad">
          {projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏗️</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.8rem',
                letterSpacing: '.05em', color: '#F8F9FB', marginBottom: 8 }}>
                PROJECTS COMING SOON
              </div>
              <p style={{ color: '#7A8EA8' }}>
                Contact {arch.name} directly on WhatsApp.
              </p>
            </div>
          ) : (
            <>
              <div className="eyebrow">Portfolio</div>
              <h2 style={{ fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 'clamp(1.8rem,3vw,2.8rem)', letterSpacing: '.04em',
                color: '#F8F9FB', marginBottom: 32 }}>
                COMPLETED PROJECTS
              </h2>
              <div className="port-grid">
                {projects.map((p: Project) => (
                  <ProjectCard key={p.id} p={p} waHire={waHire} />
                ))}
              </div>
            </>
          )}

          {/* Hire CTA */}
          <div style={{ marginTop: 56, background: 'linear-gradient(135deg,#0d1f3a,#19376D)',
            border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10, padding: '36px 48px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 28, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.8rem',
                letterSpacing: '.05em', color: '#F8F9FB', marginBottom: 6 }}>
                INTERESTED IN THIS WORK?
              </div>
              <p style={{ fontSize: 13, color: '#7A8EA8' }}>
                All materials in these projects are available at Karur Plywood &amp; Company.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flexShrink: 0 }}>
              {arch.wa_number && (
                <a href={`https://wa.me/${arch.wa_number.replace(/\D/g,'')}?text=${waHire}`}
                  target="_blank" rel="noopener" className="btn-wa">💬 Hire {arch.name}</a>
              )}
              <a href={`https://wa.me/${WA}?text=Hi%2C+I+saw+the+portfolio+on+your+site.+Can+I+get+a+materials+quote%3F`}
                target="_blank" rel="noopener" className="btn-p">🪵 Get Materials Quote</a>
            </div>
          </div>

          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Link href="/architects" style={{ fontSize: 13, color: '#7A8EA8',
              fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '.08em' }}>
              ← Back to All Architects
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .port-pad { padding: 0 5rem; }

        /* Project grid */
        .port-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 24px; }

        /* Project card */
        .port-card {
          background: rgba(25,55,109,0.35);
          border: 1px solid rgba(249,115,22,0.15);
          border-radius: 10px; overflow: hidden;
          transition: border-color .25s, transform .25s, box-shadow .25s;
        }
        .port-card:hover { border-color: #F97316; transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.4); }

        /* Cover image */
        .port-card-img { position: relative; height: 260px; overflow: hidden; background: #0d1f3a; }
        .port-card-overlay {
          position: absolute; inset: 0;
          background: rgba(7,15,31,0.55);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity .25s;
        }
        .port-card:hover .port-card-overlay { opacity: 1; }

        /* Thumbnail strip */
        .port-thumb-strip {
          display: flex; gap: 3px;
          height: 72px; background: #070F1F;
          border-top: 1px solid rgba(249,115,22,0.1);
        }
        .port-thumb {
          flex: 1; position: relative; overflow: hidden;
          cursor: pointer; opacity: 0.7; transition: opacity .2s;
        }
        .port-thumb:hover, .port-thumb--active { opacity: 1; }
        .port-thumb-more {
          position: absolute; inset: 0;
          background: rgba(7,15,31,0.75);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 14px; color: #F97316;
        }

        /* Lightbox */
        .lb-overlay {
          position: fixed; inset: 0; z-index: 10000;
          background: rgba(0,0,0,0.95);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .lb-box {
          position: relative; width: 100%; max-width: 900px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .lb-close {
          position: absolute; top: -44px; right: 0;
          background: none; border: 1px solid rgba(249,115,22,0.3);
          border-radius: 4px; color: #F97316; padding: 6px 14px;
          cursor: pointer; font-size: 14px; font-family: 'Syne',sans-serif;
          font-weight: 700; transition: background .15s;
        }
        .lb-close:hover { background: rgba(249,115,22,0.1); }
        .lb-counter {
          position: absolute; top: -44px; left: 0;
          font-family: 'Syne',sans-serif; font-size: 12px;
          font-weight: 700; color: #7A8EA8; letter-spacing: .1em;
          padding-top: 8px;
        }
        .lb-main {
          position: relative; height: 520px;
          border-radius: 8px; overflow: hidden;
          background: #0d1f3a;
        }
        .lb-prev, .lb-next {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: rgba(7,15,31,0.8); border: 1px solid rgba(249,115,22,0.25);
          border-radius: 4px; color: #F97316; padding: 0;
          width: 44px; height: 44px; cursor: pointer;
          font-size: 26px; font-weight: 300; line-height: 1;
          display: flex; align-items: center; justify-content: center;
          transition: background .15s; z-index: 2;
        }
        .lb-prev { left: 12px; }
        .lb-next { right: 12px; }
        .lb-prev:hover, .lb-next:hover { background: rgba(249,115,22,0.15); }
        .lb-thumbs {
          display: flex; gap: 8px; justify-content: center;
          flex-wrap: wrap;
        }
        .lb-thumb {
          width: 72px; height: 52px; position: relative;
          border-radius: 4px; overflow: hidden;
          cursor: pointer; opacity: 0.5;
          border: 2px solid transparent; transition: all .2s;
        }
        .lb-thumb:hover { opacity: 0.8; }
        .lb-thumb--active { opacity: 1; border-color: #F97316; }

        @media(max-width:900px){
          .port-grid { grid-template-columns: 1fr !important; }
          .port-pad  { padding: 0 1.5rem !important; }
          .lb-main   { height: 300px; }
        }
      `}</style>
    </>
  );
}
