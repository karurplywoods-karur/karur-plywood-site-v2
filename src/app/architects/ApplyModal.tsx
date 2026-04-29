'use client';
// src/app/architects/ApplyModal.tsx
import { useState } from 'react';

const SPECIALITIES = ['Residential','Commercial','Interior Design','Modular Kitchens','Landscape','Hospitality'];
const inp: React.CSSProperties = { width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(249,115,22,0.18)', borderRadius:3, padding:'10px 14px', color:'#F8F9FB', fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:'none' };
const lbl: React.CSSProperties = { display:'block', fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#7A8EA8', marginBottom:6 };

export default function ArchitectApplyModal() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name:'', firm_name:'', phone:'', email:'', area:'Karur', specialities:[] as string[], experience:'', bio:'', wa_number:'', website:'', instagram:'' });
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggleSpec = (s: string) => setForm(f => ({ ...f, specialities: f.specialities.includes(s) ? f.specialities.filter(x=>x!==s) : [...f.specialities,s] }));

  const submit = async () => {
    if (!form.name || !form.phone) { setError('Name and phone are required.'); return; }
    setLoading(true); setError('');
    const res = await fetch('/api/architects', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setError(data.error||'Error.'); setLoading(false); return; }
    setDone(true); setLoading(false);
  };

  return (
    <>
      <button className="btn-p" onClick={()=>setOpen(true)} style={{ border:'none', cursor:'pointer' }}>
        🏛️ Join as Architect
      </button>

      {open && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:9000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }} onClick={()=>setOpen(false)}>
          <div style={{ background:'#0d1f3a', border:'1px solid rgba(249,115,22,0.2)', borderRadius:10, padding:36, width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
            {done ? (
              <div style={{ textAlign:'center', padding:'28px 0' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'2rem', letterSpacing:'0.05em', color:'#F8F9FB', marginBottom:8 }}>APPLICATION RECEIVED!</div>
                <p style={{ color:'#7A8EA8', fontSize:14, lineHeight:1.7, marginBottom:20 }}>We&apos;ll review your portfolio and contact you within 24 hours to set up your listing.</p>
                <button onClick={()=>{setOpen(false);setDone(false);}} className="btn-p" style={{border:'none',cursor:'pointer'}}>Close</button>
              </div>
            ) : (
              <>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.6rem', letterSpacing:'0.05em', color:'#F8F9FB' }}>JOIN AS AN ARCHITECT</div>
                  <button onClick={()=>setOpen(false)} style={{ background:'none', border:'1px solid rgba(249,115,22,0.2)', borderRadius:4, color:'#7A8EA8', padding:'4px 10px', cursor:'pointer', fontFamily:"'Syne',sans-serif", fontSize:12 }}>✕</button>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                  <div><label style={lbl}>Full Name *</label><input style={inp} value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Ar. Ramesh Iyer" /></div>
                  <div><label style={lbl}>Firm / Studio Name</label><input style={inp} value={form.firm_name} onChange={e=>set('firm_name',e.target.value)} placeholder="Iyer Design Studio" /></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                  <div><label style={lbl}>Phone *</label><input style={inp} value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+91 98765 43210" /></div>
                  <div><label style={lbl}>Email</label><input style={inp} type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@example.com" /></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                  <div><label style={lbl}>Area / City</label><select style={inp} value={form.area} onChange={e=>set('area',e.target.value)}><option>Karur</option><option>Trichy</option><option>Namakkal</option><option>Erode</option><option>Salem</option></select></div>
                  <div><label style={lbl}>Years Experience</label><input style={inp} type="number" min="1" value={form.experience} onChange={e=>set('experience',e.target.value)} placeholder="10" /></div>
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={lbl}>Specialities</label>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {SPECIALITIES.map(s => (
                      <button key={s} type="button" onClick={()=>toggleSpec(s)}
                        style={{ padding:'6px 14px', borderRadius:2, border:'1px solid', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer',
                          borderColor: form.specialities.includes(s) ? '#F97316' : 'rgba(255,255,255,0.12)',
                          background: form.specialities.includes(s) ? 'rgba(249,115,22,0.12)' : 'transparent',
                          color: form.specialities.includes(s) ? '#F97316' : '#7A8EA8',
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom:14 }}><label style={lbl}>Website (optional)</label><input style={inp} value={form.website} onChange={e=>set('website',e.target.value)} placeholder="https://yourwebsite.com" /></div>
                <div style={{ marginBottom:14 }}><label style={lbl}>Instagram Handle (optional)</label><input style={inp} value={form.instagram} onChange={e=>set('instagram',e.target.value)} placeholder="@yourhandle" /></div>
                <div style={{ marginBottom:20 }}><label style={lbl}>About You / Bio</label><textarea style={{...inp,resize:'none'} as React.CSSProperties} rows={3} value={form.bio} onChange={e=>set('bio',e.target.value)} placeholder="Tell homeowners about your design style and notable projects..." /></div>
                {error && <div style={{ color:'#FCA5A5', fontSize:13, marginBottom:12 }}>{error}</div>}
                <button onClick={submit} disabled={loading} className="btn-p" style={{ width:'100%', border:'none', cursor:'pointer', justifyContent:'center' }}>
                  {loading ? '⏳ Submitting...' : '✓ Submit Application'}
                </button>
                <p style={{ fontSize:12, color:'#7A8EA8', textAlign:'center', marginTop:10 }}>Free listing. We&apos;ll call you to verify and set up your portfolio.</p>
              </>
            )}
            <style>{`input:focus,select:focus,textarea:focus{border-color:#F97316!important} select option{background:#0d1f3a}`}</style>
          </div>
        </div>
      )}
    </>
  );
}
