'use client';
// src/app/carpenters/[id]/page.tsx
// Added: review submission form at bottom of public profile page
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919159666538';

interface Project {
  id: string; title: string; description: string;
  location: string; year: number;
  cover_image: string; images: string[];
  materials_used: string[]; published: boolean;
}
interface Review {
  id: number; name: string; role: string; rating: number; message: string; approved: boolean; created_at: string;
}
interface Carpenter {
  id: string; name: string; phone: string; area: string;
  speciality: string[]; experience: number; bio: string;
  photo_url: string; wa_number: string; rating: number;
  review_count: number; verified: boolean;
  carpenter_projects?: Project[];
}

// ── Lightbox ──────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIndex);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % images.length);
      if (e.key === 'ArrowLeft')  setIdx(i => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length, onClose]);

  return (
    <div className="lb-overlay" onClick={onClose}>
      <div className="lb-box" onClick={e => e.stopPropagation()}>
        <button className="lb-close" onClick={onClose}>✕ Close</button>
        <div className="lb-counter">{idx + 1} / {images.length}</div>
        <div className="lb-main"><Image src={images[idx]} alt={`Photo ${idx + 1}`} fill style={{ objectFit: 'contain' }} /></div>
        {images.length > 1 && (
          <>
            <button className="lb-prev" onClick={() => setIdx(i => (i - 1 + images.length) % images.length)}>‹</button>
            <button className="lb-next" onClick={() => setIdx(i => (i + 1) % images.length)}>›</button>
          </>
        )}
        {images.length > 1 && (
          <div className="lb-thumbs">
            {images.map((img, i) => (
              <div key={i} className={`lb-thumb${i === idx ? ' lb-thumb--active' : ''}`} onClick={() => setIdx(i)}>
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
      <div className="carp-proj-img" onClick={() => allPhotos.length > 0 && open(0)} style={{ cursor: allPhotos.length > 0 ? 'pointer' : 'default' }}>
        {p.cover_image
          ? <Image src={p.cover_image} alt={p.title} fill style={{ objectFit: 'cover' }} />
          : <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48, background:'linear-gradient(135deg,#FFFFFF,#19376D)' }}>🔨</div>
        }
        {p.year && (
          <div style={{ position:'absolute', top:10, right:10, background:'#FAF8F5', backdropFilter:'blur(6px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:3, padding:'3px 10px', fontSize:10, fontFamily:"'Inter',sans-serif", fontWeight:700, color:'#6B7280' }}>{p.year}</div>
        )}
        {allPhotos.length > 1 && (
          <div style={{ position:'absolute', bottom:10, right:10, background:'#FAF8F5', backdropFilter:'blur(6px)', border:'1px solid rgba(240,115,22,0.25)', borderRadius:3, padding:'3px 10px', fontSize:10, fontFamily:"'Inter',sans-serif", fontWeight:700, color:'#F07316' }}>
            📷 {allPhotos.length} photos
          </div>
        )}
        <div className="carp-proj-overlay"><span style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:12, color:'white' }}>View Gallery ↗</span></div>
      </div>
      {allPhotos.length > 1 && (
        <div className="carp-thumb-strip">
          {allPhotos.slice(0, 4).map((img, i) => (
            <div key={i} className={`carp-thumb${i === 0 ? ' carp-thumb--active' : ''}`} onClick={() => open(i)}>
              <Image src={img} alt="" fill style={{ objectFit: 'cover' }} />
              {i === 3 && allPhotos.length > 4 && <div className="carp-thumb-more">+{allPhotos.length - 4}</div>}
            </div>
          ))}
        </div>
      )}
      <div style={{ padding:'16px 18px 20px' }}>
        <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:'0.95rem', color:'#0B2447', marginBottom:5 }}>{p.title}</div>
        {p.location && <div style={{ fontSize:12, color:'#6B7280', marginBottom:8 }}>📍 {p.location}</div>}
        {p.description && <p style={{ fontSize:13, color:'#6B7280', lineHeight:1.65, marginBottom:12 }}>{p.description}</p>}
        {p.materials_used?.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
            {p.materials_used.map(m => (
              <span key={m} style={{ fontSize:10, fontFamily:"'Inter',sans-serif", fontWeight:700, background:'#FFF4ED', border:'1px solid rgba(240,115,22,0.2)', color:'#F07316', padding:'2px 8px', borderRadius:3, letterSpacing:'.06em' }}>{m}</span>
            ))}
          </div>
        )}
      </div>
      {lbOpen && allPhotos.length > 0 && <Lightbox images={allPhotos} startIndex={lbIdx} onClose={() => setLbOpen(false)} />}
    </div>
  );
}

// ── Star rating ────────────────────────────────────────────────
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:3 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} style={{ color: n <= Math.round(rating) ? '#F07316' : 'rgba(240,115,22,0.2)', fontSize:size }}>★</span>
      ))}
      <span style={{ fontSize:12, color:'#6B7280', marginLeft:4 }}>{rating.toFixed(1)}</span>
    </div>
  );
}

// ── Interactive star picker ────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display:'flex', gap:4 }}>
      {[1,2,3,4,5].map(n => (
        <button
          key={n} type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          style={{ background:'none', border:'none', cursor:'pointer', fontSize:28, color: n <= (hover || value) ? '#F07316' : 'rgba(240,115,22,0.2)', transition:'color 0.1s', padding:'0 2px', lineHeight:1 }}
          aria-label={`${n} star${n !== 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ── Review submission form ─────────────────────────────────────
function ReviewForm({ carpenterId, carpenterName }: { carpenterId: string; carpenterName: string }) {
  const [form, setForm] = useState({ name: '', role: '', rating: 0, message: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim())    { setError('Please enter your name.'); return; }
    if (form.rating === 0)    { setError('Please select a star rating.'); return; }
    if (!form.message.trim()) { setError('Please write a short review.'); return; }
    setError(''); setLoading(true);
    try {
      // We reuse the existing /api/reviews endpoint — same table, approved: false by default
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Include carpenter_id in the role field as context for admin
        body: JSON.stringify({
          name: form.name.trim(),
          role: form.role.trim() || `Customer of ${carpenterName}`,
          rating: form.rating,
          message: form.message.trim(),
          // Tag it so admin knows which carpenter this is for
          carpenter_id: carpenterId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setDone(true);
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(240,115,22,0.18)', borderRadius: 6,
    padding: '10px 14px', fontSize: 14, color: '#0B2447',
    fontFamily: "'Inter', sans-serif", outline: 'none',
    transition: 'border-color 0.2s',
  };

  if (done) return (
    <div style={{ textAlign:'center', padding:'32px 0' }}>
      <div style={{ fontSize:44, marginBottom:12 }}>🙏</div>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.8rem', letterSpacing:'0.05em', color:'#0B2447', marginBottom:8 }}>THANK YOU!</div>
      <p style={{ color:'#6B7280', fontSize:14, lineHeight:1.7 }}>
        Your review has been submitted and will appear after a quick verification.
      </p>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <label style={{ display:'block', fontSize:11, fontFamily:"'Inter',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#6B7280', marginBottom:8 }}>
          Your Rating *
        </label>
        <StarPicker value={form.rating} onChange={v => set('rating', v)} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }} className="review-form-grid">
        <div>
          <label style={{ display:'block', fontSize:11, fontFamily:"'Inter',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#6B7280', marginBottom:6 }}>Your Name *</label>
          <input style={inp} placeholder="Rajan Kumar" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div>
          <label style={{ display:'block', fontSize:11, fontFamily:"'Inter',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#6B7280', marginBottom:6 }}>Your Role / City</label>
          <input style={inp} placeholder="e.g. Homeowner, Karur" value={form.role} onChange={e => set('role', e.target.value)} />
        </div>
      </div>

      <div style={{ marginBottom:18 }}>
        <label style={{ display:'block', fontSize:11, fontFamily:"'Inter',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#6B7280', marginBottom:6 }}>Your Review *</label>
        <textarea
          style={{ ...inp, resize:'none' } as React.CSSProperties}
          rows={4}
          placeholder={`How was your experience working with ${carpenterName}? Quality, timeliness, communication...`}
          value={form.message}
          onChange={e => set('message', e.target.value)}
        />
      </div>

      {error && <div style={{ color:'#FCA5A5', fontSize:13, marginBottom:12 }}>{error}</div>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ width:'100%', padding:'12px 0', borderRadius:6, background: loading ? 'rgba(240,115,22,0.4)' : '#F07316', color:'#0B2447', border:'none', fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:13, letterSpacing:'0.1em', textTransform:'uppercase', cursor: loading ? 'default' : 'pointer', transition:'background 0.2s' }}
      >
        {loading ? '⏳ Submitting...' : '⭐ Submit Review'}
      </button>

      <p style={{ fontSize:12, color:'#6B7280', textAlign:'center', marginTop:10 }}>
        Reviews appear after a quick verification by our team.
      </p>
      <style>{`input:focus,textarea:focus{border-color:#F07316!important}`}</style>
    </div>
  );
}

// ── Review display card ────────────────────────────────────────
function ReviewCard({ r }: { r: Review }) {
  return (
    <div style={{ background:'#FFFFFF', border:'1px solid #FFF4ED', borderRadius:10, padding:'18px 20px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:8 }}>
        {[1,2,3,4,5].map(n => (
          <span key={n} style={{ color: n <= r.rating ? '#F07316' : 'rgba(240,115,22,0.2)', fontSize:14 }}>★</span>
        ))}
      </div>
      <p style={{ fontSize:13, color:'#A8BCCC', lineHeight:1.75, fontStyle:'italic', marginBottom:14 }}>
        &ldquo;{r.message}&rdquo;
      </p>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#F07316,#FF9A45)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:13, color:'#0B2447', flexShrink:0 }}>
          {r.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:13, color:'#0B2447' }}>{r.name}</div>
          {r.role && <div style={{ fontSize:11, color:'#6B7280' }}>{r.role}</div>}
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────
export default function CarpenterPortfolioPage() {
  const params = useParams();
  const id     = params?.id as string;
  const [carp,    setCarp]    = useState<Carpenter | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/carpenters/${id}`).then(r => r.json()),
      // Fetch approved reviews — we filter by carpenter_id on the client
      // (the reviews table stores all reviews; we match by context in role field)
      fetch(`/api/carpenters/${id}/reviews`).then(r => r.ok ? r.json() : []).catch(() => []),
    ])
    .then(([carpData, reviewData]) => {
      setCarp(carpData?.id ? carpData : null);
      setReviews(Array.isArray(reviewData) ? reviewData : []);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#FAF8F5', color:'#6B7280' }}>
      ⏳ Loading portfolio...
    </div>
  );

  if (!carp) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#FAF8F5', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:48 }}>🔨</div>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'2rem', color:'#0B2447' }}>NOT FOUND</div>
      <Link href="/carpenters" style={{ fontSize:13, color:'#F07316', fontFamily:"'Inter',sans-serif", fontWeight:700 }}>← Back to Directory</Link>
    </div>
  );

  const waNum  = (carp.wa_number || carp.phone).replace(/\D/g, '');
  const waText = encodeURIComponent(`Hi ${carp.name}, I found your profile on Karur Plywood & Company. I need carpentry work. Can we talk?`);
  const projects = (carp.carpenter_projects || []).filter(p => p.published !== false);

  // Average rating from fetched reviews (override DB value if we have fresh data)
  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : carp.rating;

  return (
    <>
      {/* Hero */}
      <section style={{ background:'linear-gradient(160deg,#0B2447,#FAF8F5)', borderBottom:'1px solid rgba(240,115,22,0.15)', padding:'80px 0 56px', paddingTop:'calc(58px + 80px)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 5rem' }} className="carp-port-pad">
          <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#6B7280', marginBottom:24 }}>
            <Link href="/" style={{ color:'#6B7280', textDecoration:'none' }}>Home</Link>
            <span>›</span>
            <Link href="/carpenters" style={{ color:'#6B7280', textDecoration:'none' }}>Carpenters</Link>
            <span>›</span>
            <span style={{ color:'#F07316' }}>{carp.name}</span>
          </div>

          <div style={{ display:'flex', gap:24, alignItems:'flex-start', flexWrap:'wrap' }}>
            <div style={{ width:88, height:88, borderRadius:'50%', background:'#FFF4ED', border:'3px solid rgba(240,115,22,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:38, overflow:'hidden', position:'relative', flexShrink:0 }}>
              {carp.photo_url ? <Image src={carp.photo_url} alt={carp.name} fill style={{ objectFit:'cover' }} /> : '🔨'}
            </div>

            <div style={{ flex:1 }}>
              <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap' }}>
                {carp.verified && (
                  <span style={{ fontSize:10, fontFamily:"'Inter',sans-serif", fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', background:'rgba(37,211,102,0.12)', color:'#4ADE80', border:'1px solid rgba(37,211,102,0.2)', padding:'3px 10px', borderRadius:2 }}>✓ Verified</span>
                )}
              </div>
              <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(2rem,4vw,3rem)', letterSpacing:'.04em', color:'#0B2447', lineHeight:1, marginBottom:8 }}>{carp.name}</h1>
              <div style={{ fontSize:13, color:'#6B7280', marginBottom:10 }}>📍 {carp.area} · {carp.experience}+ years experience</div>
              {avgRating > 0 && (
                <div style={{ marginBottom:12, display:'flex', alignItems:'center', gap:10 }}>
                  <Stars rating={avgRating} />
                  {reviews.length > 0 && <span style={{ fontSize:12, color:'#6B7280' }}>({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>}
                </div>
              )}
              {carp.bio && <p style={{ fontSize:14, color:'#A8BCCC', lineHeight:1.8, maxWidth:540, marginBottom:18, fontWeight:300 }}>{carp.bio}</p>}
              {carp.speciality?.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:22 }}>
                  {carp.speciality.map((s: string) => (
                    <span key={s} style={{ fontSize:11, fontFamily:"'Inter',sans-serif", fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', background:'#FFF4ED', border:'1px solid rgba(240,115,22,0.2)', color:'#F07316', padding:'3px 9px', borderRadius:2 }}>{s}</span>
                  ))}
                </div>
              )}
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                <a href={`https://wa.me/${waNum}?text=${waText}`} target="_blank" rel="noopener" className="btn-wa">💬 Hire on WhatsApp</a>
                <a href={`tel:${carp.phone.replace(/\D/g,'')}`} className="btn-s">📞 Call Now</a>
              </div>
            </div>

            {projects.length > 0 && (
              <div style={{ background:'#FFFFFF', border:'1px solid rgba(240,115,22,0.15)', borderRadius:8, padding:'20px 28px', textAlign:'center', flexShrink:0 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'2.8rem', letterSpacing:'.04em', color:'#F07316', lineHeight:1 }}>{projects.length}</div>
                <div style={{ fontSize:10, fontFamily:"'Inter',sans-serif", fontWeight:700, letterSpacing:'.15em', textTransform:'uppercase', color:'#6B7280', marginTop:4 }}>Projects</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section style={{ padding:'56px 0' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 5rem' }} className="carp-port-pad">
          {projects.length > 0 && (
            <>
              <div className="eyebrow">Work Portfolio</div>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(1.8rem,3vw,2.8rem)', letterSpacing:'.04em', color:'#0B2447', marginBottom:32 }}>COMPLETED WORK</h2>
              <div className="carp-proj-grid">
                {projects.map(p => <ProjectCard key={p.id} p={p} />)}
              </div>
            </>
          )}

          {/* ── REVIEWS SECTION ── */}
          <div style={{ marginTop:projects.length > 0 ? 64 : 0 }}>
            <div className="eyebrow">Customer Reviews</div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(1.8rem,3vw,2.8rem)', letterSpacing:'.04em', color:'#0B2447', marginBottom:32 }}>
              REVIEWS FOR {carp.name.toUpperCase()}
            </h2>

            {/* Review grid + form side by side */}
            <div className="reviews-layout">

              {/* Left: existing reviews */}
              <div>
                {reviews.length === 0 ? (
                  <div style={{ padding:'32px 24px', background:'#FFFFFF', border:'1px solid #FFF4ED', borderRadius:10, textAlign:'center', marginBottom:0 }}>
                    <div style={{ fontSize:36, marginBottom:10 }}>⭐</div>
                    <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:14, color:'#0B2447', marginBottom:6 }}>No reviews yet</div>
                    <p style={{ fontSize:13, color:'#6B7280' }}>Be the first to share your experience!</p>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    {reviews.map(r => <ReviewCard key={r.id} r={r} />)}
                  </div>
                )}
              </div>

              {/* Right: write a review */}
              <div style={{ background:'#FFFFFF', border:'1px solid rgba(240,115,22,0.15)', borderRadius:12, padding:'28px 24px' }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.5rem', letterSpacing:'.05em', color:'#0B2447', marginBottom:6 }}>WRITE A REVIEW</div>
                <p style={{ fontSize:13, color:'#6B7280', marginBottom:22, lineHeight:1.6 }}>
                  Worked with {carp.name}? Share your experience to help other homeowners.
                </p>
                <ReviewForm carpenterId={carp.id} carpenterName={carp.name} />
              </div>
            </div>
          </div>

          {/* CTA */}
          <div style={{ marginTop:52, background:'linear-gradient(135deg,#FFFFFF,#19376D)', border:'1px solid rgba(240,115,22,0.2)', borderRadius:10, padding:'32px 44px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:24, flexWrap:'wrap' }}>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.6rem', letterSpacing:'.05em', color:'#0B2447', marginBottom:6 }}>NEED A SKILLED CARPENTER?</div>
              <p style={{ fontSize:13, color:'#6B7280' }}>{carp.name} uses quality materials from Karur Plywood &amp; Company.</p>
            </div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap', flexShrink:0 }}>
              <a href={`https://wa.me/${waNum}?text=${waText}`} target="_blank" rel="noopener" className="btn-wa">💬 Hire {carp.name}</a>
              <a href={`https://wa.me/${WA}?text=Hi%2C+can+you+recommend+a+carpenter+from+your+directory%3F`} target="_blank" rel="noopener" className="btn-s">Ask Karur Plywood</a>
            </div>
          </div>

          <div style={{ marginTop:28, textAlign:'center' }}>
            <Link href="/carpenters" style={{ fontSize:13, color:'#6B7280', fontFamily:"'Inter',sans-serif", fontWeight:700, letterSpacing:'.08em' }}>
              ← Back to Carpenter Directory
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .carp-port-pad { padding: 0 5rem; }
        .eyebrow { font-family:'Inter',sans-serif; font-size:.65rem; font-weight:700; letter-spacing:.25em; text-transform:uppercase; color:#F07316; display:flex; align-items:center; gap:.6rem; margin-bottom:.75rem; }
        .eyebrow::before { content:''; width:20px; height:2px; background:#F07316; flex-shrink:0; }

        .carp-proj-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:20px; }

        /* Reviews layout: 2 columns on desktop */
        .reviews-layout { display:grid; grid-template-columns:1fr 1fr; gap:24px; align-items:start; }

        .carp-proj-card { background:#FFFFFF; border:1px solid rgba(240,115,22,0.15); border-radius:10px; overflow:hidden; transition:border-color .25s,transform .25s,box-shadow .25s; }
        .carp-proj-card:hover { border-color:#F07316; transform:translateY(-4px); box-shadow:0 16px 40px rgba(11,36,71,0.12); }
        .carp-proj-img { position:relative; height:240px; overflow:hidden; background:#FFFFFF; }
        .carp-proj-overlay { position:absolute; inset:0; background:#FAF8F5; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .25s; }
        .carp-proj-card:hover .carp-proj-overlay { opacity:1; }
        .carp-thumb-strip { display:flex; gap:3px; height:68px; background:#FAF8F5; border-top:1px solid #FFF4ED; }
        .carp-thumb { flex:1; position:relative; overflow:hidden; cursor:pointer; opacity:0.65; transition:opacity .2s; }
        .carp-thumb:hover, .carp-thumb--active { opacity:1; }
        .carp-thumb-more { position:absolute; inset:0; background:#FAF8F5; display:flex; align-items:center; justify-content:center; font-family:'Inter',sans-serif; font-weight:700; font-size:13px; color:#F07316; }

        /* Lightbox */
        .lb-overlay { position:fixed; inset:0; z-index:10000; background:rgba(0,0,0,0.95); display:flex; align-items:center; justify-content:center; padding:20px; }
        .lb-box { position:relative; width:100%; max-width:900px; display:flex; flex-direction:column; gap:12px; }
        .lb-close { position:absolute; top:-44px; right:0; background:none; border:1px solid rgba(240,115,22,0.3); border-radius:4px; color:#F07316; padding:6px 14px; cursor:pointer; font-size:13px; font-family:'Inter',sans-serif; font-weight:700; }
        .lb-counter { position:absolute; top:-44px; left:0; font-family:'Inter',sans-serif; font-size:12px; font-weight:700; color:#6B7280; letter-spacing:.1em; padding-top:8px; }
        .lb-main { position:relative; height:520px; border-radius:8px; overflow:hidden; background:#FFFFFF; }
        .lb-prev, .lb-next { position:absolute; top:50%; transform:translateY(-50%); background:#FAF8F5; border:1px solid rgba(240,115,22,0.25); border-radius:4px; color:#F07316; width:44px; height:44px; cursor:pointer; font-size:26px; display:flex; align-items:center; justify-content:center; z-index:2; }
        .lb-prev { left:12px; } .lb-next { right:12px; }
        .lb-thumbs { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; }
        .lb-thumb { width:72px; height:52px; position:relative; border-radius:4px; overflow:hidden; cursor:pointer; opacity:0.5; border:2px solid transparent; transition:all .2s; }
        .lb-thumb:hover { opacity:0.8; }
        .lb-thumb--active { opacity:1; border-color:#F07316; }

        @media(max-width:900px){
          .carp-proj-grid   { grid-template-columns:1fr !important; }
          .reviews-layout   { grid-template-columns:1fr !important; }
          .carp-port-pad    { padding:0 1.5rem !important; }
          .lb-main          { height:280px; }
          .review-form-grid { grid-template-columns:1fr !important; }
        }
      `}</style>
    </>
  );
}
