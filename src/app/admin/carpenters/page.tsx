'use client';
// src/app/admin/carpenters/page.tsx
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Carpenter {
  id: string; name: string; phone: string; area: string;
  speciality: string[]; experience: number; bio: string;
  photo_url: string; wa_number: string; verified: boolean;
  rating: number; review_count: number; created_at: string;
}

export default function AdminCarpentersPage() {
  const router = useRouter();
  const [carpenters, setCarpenters] = useState<Carpenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all'|'pending'|'verified'>('all');
  const [msg, setMsg] = useState<{text:string;ok:boolean}|null>(null);

  const showMsg = (text: string, ok = true) => {
    setMsg({text,ok}); setTimeout(()=>setMsg(null),3000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/carpenters?all=1');
    if (res.status === 401) { router.push('/admin'); return; }
    const data = await res.json();
    setCarpenters(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const toggle = async (id: string, verified: boolean) => {
    const res = await fetch(`/api/carpenters/${id}`, {
      method: 'PATCH',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ verified: !verified }),
    });
    if (res.ok) {
      showMsg(verified ? 'Carpenter unlisted.' : '✅ Carpenter verified & listed!');
      setCarpenters(c => c.map(x => x.id===id ? {...x, verified:!x.verified} : x));
    } else {
      showMsg('Error updating.', false);
    }
  };

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete ${name} from directory?`)) return;
    const res = await fetch(`/api/carpenters/${id}`, { method: 'DELETE' });
    if (res.ok) { showMsg('Deleted.'); setCarpenters(c => c.filter(x => x.id !== id)); }
    else showMsg('Error deleting.', false);
  };

  const filtered = carpenters.filter(c =>
    filter === 'all' ? true : filter === 'pending' ? !c.verified : c.verified
  );

  const inp: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(249,115,22,0.2)',
    borderRadius: 4, padding: '8px 12px',
    color: '#F8F9FB', fontFamily: "'DM Sans',sans-serif",
    fontSize: 13, outline: 'none', width: '100%',
  };

  return (
    <div style={{ minHeight:'100vh', background:'#070F1F', color:'#F8F9FB', fontFamily:"'DM Sans',sans-serif" }}>
      {/* Topbar */}
      <div style={{ background:'rgba(11,36,71,0.8)', borderBottom:'1px solid rgba(249,115,22,0.15)', padding:'0 28px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, backdropFilter:'blur(10px)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <button onClick={() => router.push('/admin/dashboard')}
            style={{ background:'none', border:'1px solid rgba(249,115,22,0.2)', borderRadius:4, color:'#7A8EA8', padding:'6px 12px', cursor:'pointer', fontFamily:"'Syne',sans-serif", fontSize:12, letterSpacing:'0.08em', textTransform:'uppercase' }}>
            ← Dashboard
          </button>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:'0.06em', color:'#F8F9FB' }}>
            🔨 Carpenter Directory
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {msg && (
            <div style={{ fontSize:13, fontWeight:600, padding:'5px 12px', borderRadius:4,
              background: msg.ok ? 'rgba(37,211,102,0.1)' : 'rgba(249,115,22,0.1)',
              color: msg.ok ? '#4ADE80' : '#F97316',
              border: `1px solid ${msg.ok ? 'rgba(37,211,102,0.2)' : 'rgba(249,115,22,0.2)'}`,
            }}>{msg.text}</div>
          )}
          <button onClick={fetchAll}
            style={{ background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', borderRadius:4, color:'#F97316', padding:'6px 14px', cursor:'pointer', fontFamily:"'Syne',sans-serif", fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase' }}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 28px' }}>
        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:28 }}>
          {[
            { label:'Total Applications', val: carpenters.length, color:'#F97316' },
            { label:'Verified & Listed',  val: carpenters.filter(c=>c.verified).length,  color:'#4ADE80' },
            { label:'Pending Verification',val:carpenters.filter(c=>!c.verified).length, color:'#FDE047' },
          ].map(s => (
            <div key={s.label} style={{ background:'rgba(25,55,109,0.35)', border:'1px solid rgba(249,115,22,0.15)', borderRadius:8, padding:'18px 20px' }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'2.5rem', letterSpacing:'0.04em', color:s.color, lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#7A8EA8', marginTop:6 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display:'flex', gap:6, marginBottom:20 }}>
          {(['all','pending','verified'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding:'7px 16px', borderRadius:3, border:'1px solid',
                borderColor: filter===f ? '#F97316' : 'rgba(255,255,255,0.12)',
                background: filter===f ? 'rgba(249,115,22,0.12)' : 'transparent',
                color: filter===f ? '#F97316' : '#7A8EA8',
                fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11,
                letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer',
              }}>
              {f === 'all' ? 'All' : f === 'pending' ? '⏳ Pending' : '✅ Verified'}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'#7A8EA8' }}>⏳ Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'#7A8EA8' }}>No carpenters in this filter.</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {filtered.map(c => (
              <div key={c.id} style={{
                background:'rgba(25,55,109,0.35)',
                border:`1px solid ${c.verified ? 'rgba(37,211,102,0.2)' : 'rgba(249,115,22,0.15)'}`,
                borderRadius:8, padding:'20px 22px',
                display:'grid', gridTemplateColumns:'1fr auto', gap:20, alignItems:'start',
              }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:6 }}>
                    <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:'#F8F9FB' }}>{c.name}</span>
                    <span style={{
                      fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:2,
                      fontFamily:"'Syne',sans-serif", letterSpacing:'0.12em', textTransform:'uppercase',
                      background: c.verified ? 'rgba(37,211,102,0.12)' : 'rgba(249,115,22,0.1)',
                      color: c.verified ? '#4ADE80' : '#F97316',
                    }}>
                      {c.verified ? '✓ Verified' : '⏳ Pending'}
                    </span>
                  </div>
                  <div style={{ display:'flex', gap:16, fontSize:13, color:'#7A8EA8', flexWrap:'wrap', marginBottom:c.bio ? 10 : 0 }}>
                    <span>📞 {c.phone}</span>
                    <span>📍 {c.area}</span>
                    <span>🔨 {c.experience} yrs</span>
                    {c.rating > 0 && <span>⭐ {c.rating}</span>}
                    <span style={{ fontSize:11, color:'#7A8EA8' }}>Applied: {new Date(c.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
                  </div>
                  {c.bio && <div style={{ fontSize:13, color:'#7A8EA8', lineHeight:1.65, marginBottom:8, maxWidth:560 }}>{c.bio}</div>}
                  {c.speciality?.length > 0 && (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {c.speciality.map(s => (
                        <span key={s} style={{ fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', background:'rgba(249,115,22,0.08)', border:'1px solid rgba(249,115,22,0.2)', color:'#F97316', padding:'2px 8px', borderRadius:2 }}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8, minWidth:140 }}>
                  <a href={`https://wa.me/${c.wa_number||c.phone.replace(/\D/g,'')}?text=Hi+${encodeURIComponent(c.name)}%2C+this+is+Karur+Plywood.+Regarding+your+application+to+join+our+carpenter+directory...`}
                    target="_blank" rel="noopener"
                    style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px 0', borderRadius:3, background:'#25D366', color:'white', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none' }}>
                    💬 WhatsApp
                  </a>
                  <button onClick={() => toggle(c.id, c.verified)}
                    style={{ padding:'8px 0', borderRadius:3, border:'none', cursor:'pointer', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase',
                      background: c.verified ? 'rgba(249,115,22,0.1)' : 'rgba(37,211,102,0.15)',
                      color: c.verified ? '#F97316' : '#4ADE80',
                    }}>
                    {c.verified ? '⏸ Unlist' : '✓ Verify & List'}
                  </button>
                  <button onClick={() => del(c.id, c.name)}
                    style={{ padding:'8px 0', background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.15)', borderRadius:3, color:'#F87171', fontSize:11, cursor:'pointer', fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
