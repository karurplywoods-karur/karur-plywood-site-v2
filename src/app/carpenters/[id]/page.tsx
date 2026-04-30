// src/app/carpenters/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999';

interface Project {
  id: string; title: string; description: string;
  location: string; year: number;
  cover_image: string; images: string[];
  materials_used: string[]; published: boolean;
}
interface Carpenter {
  id: string; name: string; phone: string; area: string;
  speciality: string[]; experience: number; bio: string;
  photo_url: string; wa_number: string; rating: number;
  review_count: number; verified: boolean;
  carpenter_projects?: Project[];
}

// ── Lightbox ───────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }: {
  images: string[]; startIndex: number; onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowRight')  setIdx(i => (i + 1) % images.length);
      if (e.key === 'ArrowLeft')   setIdx(i => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length, onClose]);

  return (
    <div className="lb-overlay" onClick={onClose}>
      <div className="lb-box" onClick={e => e.stopPropagation()}>
        <button className="lb-close" onClick={onClose}>✕ Close</button>
        <div className="lb-counter">{idx + 1} / {images.length}</div>
        <div className="lb-main">
          <Image src={images[idx]} alt={`Photo ${idx + 1}`} fill style={{ objectFit: 'contain' }} />
        </div>
        {images.length > 1 && (
          <>
            <button className="lb-prev" onClick={() => setIdx(i => (i - 1 + images.length) % images.length)}>‹</button>
            <button className="lb-next" onClick={() => setIdx(i => (i + 1) % images.length)}>›</button>
          </>
        )}
        {images.length > 1 && (
          <div className="lb-thumbs">
            {images.map((img, i) => (
              <div key={i} className={`lb-thumb${i === idx ? ' lb-thumb--active' : ''}`}
                onClick={() => setIdx(i)}>
                <Image src={img} alt="" fill style={{ objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Project card ───────────────────────────────────────────────
function ProjectCard({ p }: { p: Project }) {
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIdx,  setLbIdx]  = useState(0);

  const allPhotos = [
    ...(p.cover_image ? [p.cover_image] : []),
    ...(p.images || []).filter(img => img && img !== p.cover_image),
  ];

  const open = (i: number) => { setLbIdx(i); setLbOpen(true); };

  return (
    <div className="carp-proj-card">
      {/* Cover */}
      <div className="carp-proj-img" onClick={() => allPhotos.length > 0 && open(0)}
        style={{ cursor: allPhotos.length > 0 ? 'pointer' : 'default' }}>
        {p.cover_image
          ? <Image src={p.cover_image} alt={p.title} fill style={{ objectFit: 'cover' }} />
          : <div style={{ height: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 48, background: 'linear-gradient(135deg,#0d1f3a,#19376D)' }}>🔨</div>
        }
        {p.year && (
          <div style={{ position: 'absolute', top: 10, right: 10,
            background: 'rgba(7,15,31,0.85)', backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3,
            padding: '3px 10px', fontSize: 10, fontFamily: "'Syne',sans-serif",
            fontWeight: 700, color: '#7A8EA8' }}>{p.year}</div>
        )}
        {allPhotos.length > 1 && (
          <div style={{ position: 'absolute', bottom: 10, right: 10,
            background: 'rgba(7,15,31,0.85)', backdropFilter: 'blur(6px)',
            border: '1px solid rgba(249,115,22,0.25)', borderRadius: 3,
            padding: '3px 10px', fontSize: 10, fontFamily: "'Syne',sans-serif",
            fontWeight: 700, color: '#F97316' }}>
            📷 {allPhotos.length} photos
          </div>
        )}
        <div className="carp-proj-overlay">
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, color: 'white' }}>
            View Gallery ↗
          </span>
        </div>
      </div>

      {/* Thumbnail strip */}
      {allPhotos.length > 1 && (
        <div className="carp-thumb-strip">
          {allPhotos.slice(0, 4).map((img, i) => (
            <div key={i} className={`carp-thumb${i === 0 ? ' carp-thumb--active' : ''}`}
              onClick={() => open(i)}>
              <Image src={img} alt="" fill style={{ objectFit: 'cover' }} />
              {i === 3 && allPhotos.length > 4 && (
                <div className="carp-thumb-more">+{allPhotos.length - 4}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Body */}
      <div style={{ padding: '16px 18px 20px' }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700,
          fontSize: '0.95rem', color: '#F8F9FB', marginBottom: 5 }}>{p.title}</div>
        {p.location && (
          <div style={{ fontSize: 12, color: '#7A8EA8', marginBottom: 8 }}>📍 {p.location}</div>
        )}
        {p.description && (
          <p style={{ fontSize: 13, color: '#7A8EA8', lineHeight: 1.65, marginBottom: 12 }}>{p.description}</p>
        )}
        {p.materials_used?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {p.materials_used.map(m => (
              <span key={m} style={{ fontSize: 10, fontFamily: "'Syne',sans-serif", fontWeight: 700,
                background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
                color: '#F97316', padding: '2px 8px', borderRadius: 3, letterSpacing: '.06em' }}>{m}</span>
            ))}
          </div>
        )}
      </div>

      {lbOpen && allPhotos.length > 0 && (
        <Lightbox images={allPhotos} startIndex={lbIdx} onClose={() => setLbOpen(false)} />
      )}
    </div>
  );
}

// ── Star rating ────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} style={{ color: n <= Math.round(rating) ? '#F97316' : 'rgba(249,115,22,0.2)', fontSize: 14 }}>★</span>
      ))}
      <span style={{ fontSize: 12, color: '#7A8EA8', marginLeft: 4 }}>{rating.toFixed(1)}</span>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────
export default function CarpenterPortfolioPage() {
  const params = useParams();
  const id     = params?.id as string;
  const [carp,    setCarp]    = useState<Carpenter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/carpenters/${id}`)
      .then(r => r.json())
      .then(data => { setCarp(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#070F1F', color: '#7A8EA8' }}>
      ⏳ Loading portfolio...
    </div>
  );

  if (!carp) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#070F1F', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>🔨</div>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '2rem', color: '#F8F9FB' }}>NOT FOUND</div>
      <Link href="/carpenters" className="btn-s">← Back to Directory</Link>
    </div>
  );

  const waNum  = (carp.wa_number || carp.phone).replace(/\D/g, '');
  const waText = encodeURIComponent(
    `Hi ${carp.name}, I found your profile on Karur Plywood & Company. I need carpentry work. Can we talk?`
  );
  const projects = (carp.carpenter_projects || []).filter(p => p.published !== false);

  return (
    <>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(160deg,#0a1d3a,#070F1F)',
        borderBottom: '1px solid rgba(249,115,22,0.15)',
        padding: '80px 0 56px', paddingTop: 'calc(80px + 62px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 5rem' }} className="carp-port-pad">

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 12, color: '#7A8EA8', marginBottom: 28 }}>
            <Link href="/" style={{ color: '#7A8EA8' }}>Home</Link>
            <span>›</span>
            <Link href="/carpenters" style={{ color: '#7A8EA8' }}>Carpenters</Link>
            <span>›</span>
            <span style={{ color: '#F97316' }}>{carp.name}</span>
          </div>

          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ width: 88, height: 88, borderRadius: '50%',
              background: 'rgba(249,115,22,0.1)', border: '3px solid rgba(249,115,22,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 38, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
              {carp.photo_url
                ? <Image src={carp.photo_url} alt={carp.name} fill style={{ objectFit: 'cover' }} />
                : '🔨'}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                {carp.verified && (
                  <span style={{ fontSize: 10, fontFamily: "'Syne',sans-serif", fontWeight: 700,
                    letterSpacing: '.12em', textTransform: 'uppercase',
                    background: 'rgba(37,211,102,0.12)', color: '#4ADE80',
                    border: '1px solid rgba(37,211,102,0.2)', padding: '3px 10px', borderRadius: 2 }}>
                    ✓ Verified
                  </span>
                )}
              </div>

              <h1 style={{ fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 'clamp(2rem,4vw,3rem)', letterSpacing: '.04em',
                color: '#F8F9FB', lineHeight: 1, marginBottom: 8 }}>{carp.name}</h1>

              <div style={{ fontSize: 13, color: '#7A8EA8', marginBottom: 10 }}>
                📍 {carp.area} · {carp.experience}+ years experience
              </div>

              {carp.rating > 0 && (
                <div style={{ marginBottom: 12 }}><Stars rating={carp.rating} /></div>
              )}

              {carp.bio && (
                <p style={{ fontSize: 14, color: '#A8BCCC', lineHeight: 1.8,
                  maxWidth: 540, marginBottom: 18, fontWeight: 300 }}>{carp.bio}</p>
              )}

              {carp.speciality?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 22 }}>
                  {carp.speciality.map((s: string) => (
                    <span key={s} style={{ fontSize: 11, fontFamily: "'Syne',sans-serif",
                      fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
                      background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
                      color: '#F97316', padding: '3px 9px', borderRadius: 2 }}>{s}</span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a href={`https://wa.me/${waNum}?text=${waText}`}
                  target="_blank" rel="noopener" className="btn-wa">💬 Hire on WhatsApp</a>
                <a href={`tel:${carp.phone}`} className="btn-s">📞 Call Now</a>
              </div>
            </div>

            {/* Stats */}
            {projects.length > 0 && (
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
            )}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section style={{ padding: '56px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 5rem' }} className="carp-port-pad">
          {projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔨</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.8rem',
                color: '#F8F9FB', letterSpacing: '.05em', marginBottom: 8 }}>
                PROJECTS COMING SOON
              </div>
              <p style={{ color: '#7A8EA8' }}>Contact {carp.name} directly to see their work.</p>
            </div>
          ) : (
            <>
              <div className="eyebrow">Work Portfolio</div>
              <h2 style={{ fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 'clamp(1.8rem,3vw,2.8rem)', letterSpacing: '.04em',
                color: '#F8F9FB', marginBottom: 32 }}>
                COMPLETED WORK
              </h2>
              <div className="carp-proj-grid">
                {projects.map(p => <ProjectCard key={p.id} p={p} />)}
              </div>
            </>
          )}

          {/* CTA */}
          <div style={{ marginTop: 52, background: 'linear-gradient(135deg,#0d1f3a,#19376D)',
            border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10, padding: '32px 44px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.6rem',
                letterSpacing: '.05em', color: '#F8F9FB', marginBottom: 6 }}>
                NEED A SKILLED CARPENTER?
              </div>
              <p style={{ fontSize: 13, color: '#7A8EA8' }}>
                {carp.name} uses quality materials from Karur Plywood &amp; Company.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flexShrink: 0 }}>
              <a href={`https://wa.me/${waNum}?text=${waText}`}
                target="_blank" rel="noopener" className="btn-wa">💬 Hire {carp.name}</a>
              <a href={`https://wa.me/${WA}?text=Hi%2C+can+you+recommend+a+carpenter+from+your+directory%3F`}
                target="_blank" rel="noopener" className="btn-s">Ask Karur Plywood</a>
            </div>
          </div>

          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <Link href="/carpenters" style={{ fontSize: 13, color: '#7A8EA8',
              fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '.08em' }}>
              ← Back to Carpenter Directory
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .carp-port-pad { padding: 0 5rem; }
        .carp-proj-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px; }

        .carp-proj-card {
          background: rgba(25,55,109,0.35);
          border: 1px solid rgba(249,115,22,0.15);
          border-radius: 10px; overflow: hidden;
          transition: border-color .25s, transform .25s, box-shadow .25s;
        }
        .carp-proj-card:hover { border-color: #F97316; transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.4); }

        .carp-proj-img { position: relative; height: 240px; overflow: hidden; background: #0d1f3a; }
        .carp-proj-overlay {
          position: absolute; inset: 0; background: rgba(7,15,31,0.55);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity .25s;
        }
        .carp-proj-card:hover .carp-proj-overlay { opacity: 1; }

        .carp-thumb-strip { display: flex; gap: 3px; height: 68px; background: #070F1F; border-top: 1px solid rgba(249,115,22,0.1); }
        .carp-thumb { flex: 1; position: relative; overflow: hidden; cursor: pointer; opacity: 0.65; transition: opacity .2s; }
        .carp-thumb:hover, .carp-thumb--active { opacity: 1; }
        .carp-thumb-more { position: absolute; inset: 0; background: rgba(7,15,31,0.75); display: flex; align-items: center; justify-content: center; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 13px; color: #F97316; }

        /* Shared lightbox styles */
        .lb-overlay { position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,0.95); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .lb-box { position: relative; width: 100%; max-width: 900px; display: flex; flex-direction: column; gap: 12px; }
        .lb-close { position: absolute; top: -44px; right: 0; background: none; border: 1px solid rgba(249,115,22,0.3); border-radius: 4px; color: #F97316; padding: 6px 14px; cursor: pointer; font-size: 13px; font-family: 'Syne',sans-serif; font-weight: 700; }
        .lb-close:hover { background: rgba(249,115,22,0.1); }
        .lb-counter { position: absolute; top: -44px; left: 0; font-family: 'Syne',sans-serif; font-size: 12px; font-weight: 700; color: #7A8EA8; letter-spacing: .1em; padding-top: 8px; }
        .lb-main { position: relative; height: 520px; border-radius: 8px; overflow: hidden; background: #0d1f3a; }
        .lb-prev, .lb-next { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(7,15,31,0.8); border: 1px solid rgba(249,115,22,0.25); border-radius: 4px; color: #F97316; width: 44px; height: 44px; cursor: pointer; font-size: 26px; display: flex; align-items: center; justify-content: center; z-index: 2; transition: background .15s; }
        .lb-prev { left: 12px; }
        .lb-next { right: 12px; }
        .lb-prev:hover, .lb-next:hover { background: rgba(249,115,22,0.15); }
        .lb-thumbs { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
        .lb-thumb { width: 72px; height: 52px; position: relative; border-radius: 4px; overflow: hidden; cursor: pointer; opacity: 0.5; border: 2px solid transparent; transition: all .2s; }
        .lb-thumb:hover { opacity: 0.8; }
        .lb-thumb--active { opacity: 1; border-color: #F97316; }

        @media(max-width:900px){
          .carp-proj-grid { grid-template-columns: 1fr !important; }
          .carp-port-pad  { padding: 0 1.5rem !important; }
          .lb-main        { height: 280px; }
        }
      `}</style>
    </>
  );
}
