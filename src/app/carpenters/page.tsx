// src/app/carpenters/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999';

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
        <span key={n} style={{ fontSize: 13, color: n <= Math.round(rating) ? '#F97316' : 'rgba(249,115,22,0.2)' }}>★</span>
      ))}
      <span style={{ fontSize: 12, color: '#7A8EA8', marginLeft: 4 }}>{rating.toFixed(1)} ({rating > 0 ? 'verified' : 'new'})</span>
    </div>
  );
}

function CarpenterCard({ c }: { c: Carpenter }) {
  const waNum = c.wa_number || c.phone.replace(/\D/g, '');
  const waText = encodeURIComponent(`Hi ${c.name}, I got your contact from Karur Plywood & Company. I need carpentry work done. Can we discuss?`);
  return (
    <div className="carp-card">
      {/* Avatar */}
      <div className="carp-avatar">
        {c.photo_url
          ? <img src={c.photo_url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 32 }}>🔨</span>
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
          <a href={`/carpenters/${c.id}`} className="carp-profile-btn">View Profile →</a>
          <a href={`https://wa.me/${waNum}?text=${waText}`} target="_blank" rel="noopener" className="carp-wa-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Chat on WhatsApp
          </a>
          <a href={`tel:${c.phone}`} className="carp-call-btn">📞 Call</a>
        </div>
      </div>
      <style>{`
        .carp-profile-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:transparent;border:1px solid rgba(249,115,22,0.3);color:#F97316;border-radius:3px;font-family:'Syne',sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;transition:background 0.2s;}
        .carp-profile-btn:hover{background:rgba(249,115,22,0.08);}
        .carp-card{display:flex;gap:18px;background:rgba(25,55,109,0.35);border:1px solid rgba(249,115,22,0.15);border-radius:10px;padding:22px;transition:border-color 0.25s,transform 0.25s,box-shadow 0.25s;}
        .carp-card:hover{border-color:#F97316;transform:translateY(-3px);box-shadow:0 16px 40px rgba(0,0,0,0.4);}
        .carp-avatar{width:64px;height:64px;border-radius:50%;background:rgba(249,115,22,0.1);border:2px solid rgba(249,115,22,0.3);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;}
        .carp-body{flex:1;min-width:0;}
        .carp-header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:8px;}
        .carp-name{font-family:'Syne',sans-serif;font-size:1.05rem;font-weight:700;color:#F8F9FB;margin-bottom:3px;}
        .carp-area{font-size:0.75rem;color:#7A8EA8;letter-spacing:0.04em;}
        .carp-verified-badge{font-family:'Syne',sans-serif;font-size:0.62rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;background:rgba(37,211,102,0.12);color:#4ADE80;border:1px solid rgba(37,211,102,0.2);padding:3px 10px;border-radius:2px;white-space:nowrap;flex-shrink:0;}
        .carp-bio{font-size:0.8rem;color:#7A8EA8;line-height:1.65;margin:10px 0;font-weight:300;}
        .carp-tags{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0;}
        .carp-tag{font-size:0.65rem;font-family:'Syne',sans-serif;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.2);color:#F97316;padding:3px 9px;border-radius:2px;}
        .carp-actions{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;}
        .carp-wa-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;background:#25D366;color:white;border-radius:3px;font-family:'Syne',sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;transition:background 0.2s;}
        .carp-wa-btn:hover{background:#1fbc59;}
        .carp-call-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border:1px solid rgba(249,115,22,0.3);color:#F97316;border-radius:3px;font-family:'Syne',sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;transition:border-color 0.2s,background 0.2s;}
        .carp-call-btn:hover{background:rgba(249,115,22,0.08);border-color:#F97316;}
      `}</style>
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
    const res = await fetch('/api/carpenters', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, speciality: form.speciality.split(',').map(s => s.trim()).filter(Boolean), experience: parseInt(form.experience) || 1 }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Error submitting.'); setLoading(false); return; }
    setDone(true); setLoading(false);
  };

  const inp: React.CSSProperties = { width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:3, padding:'10px 14px', color:'#F8F9FB', fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:'none' };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:9000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }} onClick={onClose}>
      <div style={{ background:'#0d1f3a', border:'1px solid rgba(249,115,22,0.2)', borderRadius:10, padding:36, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
        {done ? (
          <div style={{ textAlign:'center', padding:'24px 0' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.8rem', letterSpacing:'0.05em', color:'#F8F9FB', marginBottom:8 }}>APPLICATION RECEIVED!</div>
            <p style={{ color:'#7A8EA8', fontSize:14, lineHeight:1.7, marginBottom:20 }}>We&apos;ll verify your details and add you to the directory within 24 hours. We&apos;ll call you to confirm.</p>
            <button onClick={onClose} className="btn-p">Close</button>
          </div>
        ) : (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.6rem', letterSpacing:'0.05em', color:'#F8F9FB' }}>JOIN AS A CARPENTER</div>
              <button onClick={onClose} style={{ background:'none', border:'1px solid rgba(249,115,22,0.2)', borderRadius:4, color:'#7A8EA8', padding:'4px 10px', cursor:'pointer', fontFamily:"'Syne',sans-serif", fontSize:12 }}>✕ Close</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
              <div><label style={{ display:'block', fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#7A8EA8', marginBottom:6 }}>Full Name *</label><input style={inp} value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Rajan Kumar" /></div>
              <div><label style={{ display:'block', fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#7A8EA8', marginBottom:6 }}>Phone *</label><input style={inp} value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+91 98765 43210" /></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
              <div><label style={{ display:'block', fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#7A8EA8', marginBottom:6 }}>Area / City *</label>
                <select style={{ ...inp, cursor:'pointer' }} value={form.area} onChange={e=>set('area',e.target.value)}>
                  {['Karur','Trichy','Namakkal','Erode','Salem','Dindigul'].map(a=><option key={a}>{a}</option>)}
                </select>
              </div>
              <div><label style={{ display:'block', fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#7A8EA8', marginBottom:6 }}>Years Experience</label><input style={inp} type="number" min="1" value={form.experience} onChange={e=>set('experience',e.target.value)} placeholder="8" /></div>
            </div>
            <div style={{ marginBottom:14 }}><label style={{ display:'block', fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#7A8EA8', marginBottom:6 }}>Specialities (comma separated)</label><input style={inp} value={form.speciality} onChange={e=>set('speciality',e.target.value)} placeholder="wardrobes, kitchen cabinets, doors" /></div>
            <div style={{ marginBottom:14 }}><label style={{ display:'block', fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#7A8EA8', marginBottom:6 }}>WhatsApp Number (if different)</label><input style={inp} value={form.wa_number} onChange={e=>set('wa_number',e.target.value)} placeholder="+91 98765 43210" /></div>
            <div style={{ marginBottom:20 }}><label style={{ display:'block', fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#7A8EA8', marginBottom:6 }}>Short Bio</label><textarea style={{ ...inp, resize:'none' } as React.CSSProperties} rows={3} value={form.bio} onChange={e=>set('bio',e.target.value)} placeholder="Tell homeowners about your work and experience..." /></div>
            {error && <div style={{ color:'#FCA5A5', fontSize:13, marginBottom:12 }}>{error}</div>}
            <button onClick={handleSubmit} disabled={loading} className="btn-p" style={{ width:'100%', justifyContent:'center', border:'none', cursor:'pointer' }}>
              {loading ? '⏳ Submitting...' : '✓ Submit Application'}
            </button>
            <p style={{ fontSize:12, color:'#7A8EA8', textAlign:'center', marginTop:10 }}>We&apos;ll verify and call you within 24 hours before listing.</p>
          </>
        )}
        <style>{`input:focus,select:focus,textarea:focus{border-color:#F97316!important} select option{background:#0d1f3a}`}</style>
      </div>
    </div>
  );
}

export default function CarpentersPage() {
  const [carpenters, setCarpenters] = useState<Carpenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [areaFilter, setAreaFilter] = useState('All Areas');
  const [specFilter, setSpecFilter] = useState('All');
  const [showApply, setShowApply] = useState(false);

  useEffect(() => {
    const area = areaFilter === 'All Areas' ? '' : areaFilter;
    fetch(`/api/carpenters${area ? `?area=${area}` : ''}`)
      .then(r => r.json())
      .then(data => { setCarpenters(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [areaFilter]);

  const filtered = specFilter === 'All'
    ? carpenters
    : carpenters.filter(c => c.speciality?.some(s => s.toLowerCase().includes(specFilter.toLowerCase())));

  return (
    <>
      {/* Hero */}
      <section style={{ background:'linear-gradient(160deg,#0a1d3a,#0d2545)', borderBottom:'1px solid rgba(249,115,22,0.15)', padding:'80px 0 60px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 5rem' }} className="carp-pad">
          <div className="eyebrow">Pro Directory</div>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(2.8rem,5vw,4.5rem)', letterSpacing:'0.04em', color:'#F8F9FB', lineHeight:0.95, marginBottom:'1rem' }}>
            VERIFIED CARPENTERS<br/><span style={{ color:'#F97316' }}>IN KARUR &amp; NEARBY</span>
          </h1>
          <p className="s-desc" style={{ maxWidth:540, marginBottom:'2rem' }}>
            Find skilled carpenters who use quality materials from Karur Plywood. Every carpenter is personally verified by our team.
          </p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <button className="btn-p" onClick={() => setShowApply(true)}>🔨 Join as a Carpenter</button>
            <a href={`https://wa.me/${WA}?text=Hi%2C+I+need+a+skilled+carpenter+in+Karur.+Can+you+recommend+one%3F`} target="_blank" rel="noopener" className="btn-wa">💬 Ask us for a Recommendation</a>
          </div>
        </div>
      </section>

      <section style={{ padding:'48px 0 80px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 5rem' }} className="carp-pad">

          {/* Filters */}
          <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:36, alignItems:'flex-start' }}>
            <div>
              <div style={{ fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#7A8EA8', marginBottom:8 }}>Filter by Area</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {AREAS.map(a => (
                  <button key={a} onClick={() => setAreaFilter(a)} className={`fbtn${areaFilter===a?' active':''}`}>{a}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#7A8EA8', marginBottom:8 }}>Filter by Speciality</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {SPECIALITIES.map(s => (
                  <button key={s} onClick={() => setSpecFilter(s)} className={`fbtn${specFilter===s?' active':''}`} style={{ textTransform:'capitalize' }}>{s}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'#7A8EA8' }}>
              <div style={{ fontSize:36, marginBottom:12 }}>⏳</div>
              Loading carpenters...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🔨</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.8rem', letterSpacing:'0.05em', color:'#F8F9FB', marginBottom:8 }}>NO CARPENTERS FOUND</div>
              <p style={{ color:'#7A8EA8', marginBottom:24 }}>Try a different filter or ask us directly on WhatsApp.</p>
              <a href={`https://wa.me/${WA}?text=Hi%2C+I+need+a+carpenter.+Can+you+help%3F`} target="_blank" rel="noopener" className="btn-wa">💬 Ask on WhatsApp</a>
            </div>
          ) : (
            <>
              <div style={{ fontSize:13, color:'#7A8EA8', marginBottom:20 }}>
                Showing <strong style={{ color:'#F8F9FB' }}>{filtered.length}</strong> verified carpenter{filtered.length !== 1 ? 's' : ''} {areaFilter !== 'All Areas' ? `in ${areaFilter}` : 'across all areas'}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {filtered.map(c => <CarpenterCard key={c.id} c={c} />)}
              </div>
            </>
          )}

          {/* Join CTA */}
          <div style={{ marginTop:56, background:'linear-gradient(135deg,#0d1f3a,#19376D)', border:'1px solid rgba(249,115,22,0.2)', borderRadius:10, padding:'40px 48px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:32, flexWrap:'wrap' }}>
            <div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.8rem', letterSpacing:'0.05em', color:'#F8F9FB', marginBottom:6 }}>ARE YOU A CARPENTER?</div>
              <p style={{ color:'#7A8EA8', fontSize:14 }}>Join our verified directory. Get discovered by homeowners in Karur and nearby areas — free listing.</p>
            </div>
            <button className="btn-p" onClick={() => setShowApply(true)} style={{ border:'none', cursor:'pointer', flexShrink:0 }}>🔨 Apply Now — It&apos;s Free</button>
          </div>
        </div>
      </section>

      {showApply && <ApplyForm onClose={() => setShowApply(false)} />}

      <style>{`
        .carp-pad { padding: 0 5rem; }
        @media(max-width:768px){ .carp-pad { padding: 0 1.5rem !important; } }
        .carp-card { flex-direction: row; }
        @media(max-width:640px){ .carp-card { flex-direction: column !important; } .carp-avatar { width: 48px !important; height: 48px !important; } }
      `}</style>
    </>
  );
}
