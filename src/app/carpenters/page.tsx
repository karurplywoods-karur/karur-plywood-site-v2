'use client';
// src/app/carpenters/page.tsx — FIXED: infinite loading, timeout, error state
import { useState, useEffect } from 'react';
import Link from 'next/link';

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919159666538';

interface Carpenter {
  id: string; name: string; phone: string; area: string;
  speciality: string[]; experience: number; bio: string;
  photo_url: string; wa_number: string; rating: number; review_count: number;
}

const AREAS = ['All Areas', 'Karur', 'Trichy', 'Namakkal', 'Erode', 'Salem'];
const SPECIALITIES = ['All', 'wardrobes', 'kitchen cabinets', 'doors', 'furniture', 'commercial fit-out'];

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} style={{ fontSize: 13, color: n <= Math.round(rating) ? '#F07316' : 'rgba(249,115,22,0.2)' }}>★</span>
      ))}
      <span style={{ fontSize: 12, color: '#6B7280', marginLeft: 4 }}>{rating.toFixed(1)}</span>
    </div>
  );
}

function CarpenterCard({ c }: { c: Carpenter }) {
  const waNum = (c.wa_number || c.phone).replace(/\D/g, '');
  const waText = encodeURIComponent(`Hi ${c.name}, I got your contact from Karur Plywood & Company. I need carpentry work done. Can we discuss?`);
  return (
    <div className="carp-card">
      <div className="carp-avatar">
        {c.photo_url
          ? <img src={c.photo_url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 28 }}>🔨</span>
        }
      </div>
      <div className="carp-body">
        <div className="carp-header">
          <div>
            <div className="carp-name">{c.name}</div>
            <div className="carp-area">📍 {c.area} · {c.experience}+ yrs experience</div>
          </div>
          <div className="carp-verified-badge">✓ Verified</div>
        </div>

        <StarRating rating={c.rating} />

        {c.bio && <p className="carp-bio">{c.bio}</p>}

        {c.speciality?.length > 0 && (
          <div className="carp-tags">
            {c.speciality.map(s => (
              <span key={s} className="carp-tag">{s}</span>
            ))}
          </div>
        )}

        <div className="carp-actions">
          <Link href={`/carpenters/${c.id}`} className="carp-profile-btn">View Profile →</Link>
          <a href={`https://wa.me/${waNum}?text=${waText}`} target="_blank" rel="noopener" className="carp-wa-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Chat on WhatsApp
          </a>
          <a href={`tel:${c.phone.replace(/\D/g,'')}`} className="carp-call-btn">📞 Call</a>
        </div>
      </div>
    </div>
  );
}

function ApplyForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name:'', phone:'', area:'Karur', speciality:'', experience:'', bio:'', wa_number:'' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.area) { setError('Name, phone and area are required.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/carpenters', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, speciality: form.speciality.split(',').map(s => s.trim()).filter(Boolean), experience: parseInt(form.experience) || 1 }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error submitting.'); }
      else { setDone(true); }
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const inp: React.CSSProperties = { width:'100%', background:'#FFFFFF', border:'1px solid #E5E1DC', borderRadius:3, padding:'10px 14px', color:'#0B2447', fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:'none' };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(11,36,71,0.55)', zIndex:9000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }} onClick={onClose}>
      <div style={{ background:'#FFFFFF', border:'1px solid #E5E1DC', borderRadius:10, padding:36, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
        {done ? (
          <div style={{ textAlign:'center', padding:'28px 0' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'2rem', letterSpacing:'0.05em', color:'#0B2447', marginBottom:8 }}>APPLICATION RECEIVED!</div>
            <p style={{ color:'#6B7280', fontSize:14, lineHeight:1.7, marginBottom:20 }}>We&apos;ll verify your details and add you to the directory within 24 hours.</p>
            <button onClick={onClose} style={{ padding:'10px 24px', background:'#F07316', color:'#0B2447', border:'none', borderRadius:4, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer' }}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.6rem', letterSpacing:'0.05em', color:'#0B2447' }}>JOIN AS A CARPENTER</div>
              <button onClick={onClose} style={{ background:'none', border:'1px solid rgba(249,115,22,0.2)', borderRadius:4, color:'#6B7280', padding:'4px 10px', cursor:'pointer', fontFamily:"'Syne',sans-serif", fontSize:12 }}>✕ Close</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
              <div><label style={{ display:'block', fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#6B7280', marginBottom:6 }}>Full Name *</label><input style={inp} value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Rajan Kumar" /></div>
              <div><label style={{ display:'block', fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#6B7280', marginBottom:6 }}>Phone *</label><input style={inp} value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+91 98765 43210" /></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
              <div>
                <label style={{ display:'block', fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#6B7280', marginBottom:6 }}>Area / City *</label>
                <select style={{ ...inp, cursor:'pointer' }} value={form.area} onChange={e=>set('area',e.target.value)}>
                  {['Karur','Trichy','Namakkal','Erode','Salem','Dindigul'].map(a=><option key={a}>{a}</option>)}
                </select>
              </div>
              <div><label style={{ display:'block', fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#6B7280', marginBottom:6 }}>Years Experience</label><input style={inp} type="number" min="1" value={form.experience} onChange={e=>set('experience',e.target.value)} placeholder="8" /></div>
            </div>
            <div style={{ marginBottom:14 }}><label style={{ display:'block', fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#6B7280', marginBottom:6 }}>Specialities (comma separated)</label><input style={inp} value={form.speciality} onChange={e=>set('speciality',e.target.value)} placeholder="wardrobes, kitchen cabinets, doors" /></div>
            <div style={{ marginBottom:14 }}><label style={{ display:'block', fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#6B7280', marginBottom:6 }}>WhatsApp Number (if different)</label><input style={inp} value={form.wa_number} onChange={e=>set('wa_number',e.target.value)} placeholder="+91 98765 43210" /></div>
            <div style={{ marginBottom:20 }}><label style={{ display:'block', fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#6B7280', marginBottom:6 }}>Short Bio</label><textarea style={{ ...inp, resize:'none' } as React.CSSProperties} rows={3} value={form.bio} onChange={e=>set('bio',e.target.value)} placeholder="Tell homeowners about your work and experience..." /></div>
            {error && <div style={{ color:'#FCA5A5', fontSize:13, marginBottom:12 }}>{error}</div>}
            <button onClick={handleSubmit} disabled={loading}
              style={{ width:'100%', padding:'12px 0', borderRadius:4, background: loading ? 'rgba(249,115,22,0.4)' : '#F07316', color:'#0B2447', border:'none', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, letterSpacing:'0.1em', textTransform:'uppercase', cursor: loading ? 'default' : 'pointer' }}>
              {loading ? '⏳ Submitting...' : '✓ Submit Application'}
            </button>
            <p style={{ fontSize:12, color:'#6B7280', textAlign:'center', marginTop:10 }}>We&apos;ll verify and call you within 24 hours before listing.</p>
          </>
        )}
        <style>{`input:focus,select:focus,textarea:focus{border-color:#F07316!important} select option{background:#FFFFFF}`}</style>
      </div>
    </div>
  );
}

export default function CarpentersPage() {
  const [carpenters, setCarpenters] = useState<Carpenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [areaFilter, setAreaFilter] = useState('All Areas');
  const [specFilter, setSpecFilter] = useState('All');
  const [showApply, setShowApply] = useState(false);

  useEffect(() => {
    const area = areaFilter === 'All Areas' ? '' : areaFilter;
    const controller = new AbortController();
    // 8-second timeout — prevents infinite spinner
    const timer = setTimeout(() => controller.abort(), 8000);

    setLoading(true);
    setFetchError(false);

    fetch(`/api/carpenters${area ? `?area=${encodeURIComponent(area)}` : ''}`, {
      signal: controller.signal,
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        clearTimeout(timer);
        setCarpenters(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        clearTimeout(timer);
        if (err.name === 'AbortError') {
          console.warn('Carpenter fetch timed out');
        } else {
          console.error('Carpenter fetch error:', err);
          setFetchError(true);
        }
        setCarpenters([]);
        setLoading(false);
      });

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [areaFilter]);

  const filtered = specFilter === 'All'
    ? carpenters
    : carpenters.filter(c => c.speciality?.some(s => s.toLowerCase().includes(specFilter.toLowerCase())));

  const waRecommend = `https://wa.me/${WA}?text=${encodeURIComponent(`Hi, I need a carpenter in ${areaFilter === 'All Areas' ? 'Karur' : areaFilter}${specFilter !== 'All' ? ` for ${specFilter}` : ''}. Can you recommend someone?`)}`;

  return (
    <>
      {/* Hero */}
      <section style={{ background:'linear-gradient(160deg,#0a1d3a,#070F1F)', borderBottom:'1px solid rgba(240,115,22,0.15)', padding:'80px 0 60px', paddingTop:'calc(58px + 80px)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 5rem' }} className="carp-pad">
          <div className="eyebrow">Pro Directory</div>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(2.8rem,5vw,4.5rem)', letterSpacing:'0.04em', color:'#0B2447', lineHeight:0.95, marginBottom:'1rem' }}>
            VERIFIED CARPENTERS<br/><span style={{ color:'#F07316' }}>IN KARUR &amp; NEARBY</span>
          </h1>
          <p style={{ fontSize:14, color:'#6B7280', lineHeight:1.8, maxWidth:540, marginBottom:'2rem', fontWeight:300 }}>
            Find skilled carpenters who use quality materials from Karur Plywood. Every carpenter is personally verified by our team.
          </p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <button className="btn-p" onClick={() => setShowApply(true)} style={{ border:'none', cursor:'pointer' }}>🔨 Join as a Carpenter</button>
            <a href={waRecommend} target="_blank" rel="noopener" className="btn-wa">💬 Ask for a Recommendation</a>
          </div>
        </div>
      </section>

      <section style={{ padding:'48px 0 80px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 5rem' }} className="carp-pad">

          {/* Filters */}
          <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:36, alignItems:'flex-start' }}>
            <div>
              <div style={{ fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#6B7280', marginBottom:8 }}>Filter by Area</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {AREAS.map(a => (
                  <button key={a} onClick={() => setAreaFilter(a)} className={`fbtn${areaFilter===a?' active':''}`}>{a}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#6B7280', marginBottom:8 }}>Filter by Speciality</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {SPECIALITIES.map(s => (
                  <button key={s} onClick={() => setSpecFilter(s)} className={`fbtn${specFilter===s?' active':''}`} style={{ textTransform:'capitalize' }}>{s}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ background:'#FFFFFF', border:'1px solid #E5E1DC', borderRadius:10, padding:'22px', height:120, animation:'shimmer 1.5s ease-in-out infinite', opacity: 0.6 }} />
              ))}
              <style>{`@keyframes shimmer{0%,100%{opacity:0.4}50%{opacity:0.7}}`}</style>
            </div>
          )}

          {/* Error state */}
          {!loading && fetchError && (
            <div style={{ textAlign:'center', padding:'60px 0' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.6rem', letterSpacing:'0.05em', color:'#0B2447', marginBottom:8 }}>UNABLE TO LOAD</div>
              <p style={{ color:'#6B7280', marginBottom:24 }}>There was a problem loading the directory. Please try again or ask us on WhatsApp.</p>
              <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
                <button onClick={() => setAreaFilter(areaFilter)} className="btn-s" style={{ cursor:'pointer' }}>🔄 Try Again</button>
                <a href={waRecommend} target="_blank" rel="noopener" className="btn-wa">💬 Ask on WhatsApp</a>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !fetchError && filtered.length === 0 && (
            <div style={{ textAlign:'center', padding:'60px 0' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🔨</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.8rem', letterSpacing:'0.05em', color:'#0B2447', marginBottom:8 }}>
                {carpenters.length === 0 ? 'COMING SOON' : 'NO MATCH FOUND'}
              </div>
              <p style={{ color:'#6B7280', marginBottom:24 }}>
                {carpenters.length === 0
                  ? 'We\'re onboarding verified carpenters. Ask us on WhatsApp for a personal recommendation.'
                  : 'Try a different filter or ask us directly.'}
              </p>
              <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
                <a href={waRecommend} target="_blank" rel="noopener" className="btn-wa">💬 Ask on WhatsApp</a>
                <button onClick={() => setShowApply(true)} className="btn-s" style={{ cursor:'pointer' }}>🔨 Join as Carpenter</button>
              </div>
            </div>
          )}

          {/* Results */}
          {!loading && !fetchError && filtered.length > 0 && (
            <>
              <div style={{ fontSize:13, color:'#6B7280', marginBottom:20 }}>
                Showing <strong style={{ color:'#0B2447' }}>{filtered.length}</strong> verified carpenter{filtered.length !== 1 ? 's' : ''}{areaFilter !== 'All Areas' ? ` in ${areaFilter}` : ''}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {filtered.map(c => <CarpenterCard key={c.id} c={c} />)}
              </div>
            </>
          )}

          {/* Join CTA */}
          <div style={{ marginTop:56, background:'#0B2447', border:'1px solid rgba(240,115,22,0.2)', borderRadius:10, padding:'40px 48px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:32, flexWrap:'wrap' }}>
            <div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.8rem', letterSpacing:'0.05em', color:'#0B2447', marginBottom:6 }}>ARE YOU A CARPENTER?</div>
              <p style={{ color:'#6B7280', fontSize:14 }}>Join our verified directory. Get discovered by homeowners — free listing.</p>
            </div>
            <button className="btn-p" onClick={() => setShowApply(true)} style={{ border:'none', cursor:'pointer', flexShrink:0 }}>🔨 Apply Now — It&apos;s Free</button>
          </div>
        </div>
      </section>

      {showApply && <ApplyForm onClose={() => setShowApply(false)} />}

      <style>{`
        .carp-pad { padding: 0 5rem; }
        .eyebrow { font-family:'Syne',sans-serif; font-size:.65rem; font-weight:700; letter-spacing:.25em; text-transform:uppercase; color:#F07316; display:flex; align-items:center; gap:.6rem; margin-bottom:.75rem; }
        .eyebrow::before { content:''; width:20px; height:2px; background:#F07316; flex-shrink:0; }
        @media(max-width:768px){ .carp-pad { padding: 0 1.5rem !important; } }
        @media(max-width:640px){ .carp-card { flex-direction: column !important; } .carp-avatar { width: 48px !important; height: 48px !important; } }
      `}</style>
    </>
  );
}
