// src/app/carpenters/[id]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/db';

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999';

async function getCarpenter(id: string) {
  const { data } = await supabase
    .from('carpenters')
    .select('*')
    .eq('id', id)
    .eq('verified', true)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const c = await getCarpenter(params.id) as any;
  if (!c) return { title: 'Carpenter Not Found' };
  return {
    title: `${c.name} — Verified Carpenter in ${c.area} | Karur Plywood`,
    description: `${c.name} is a verified carpenter in ${c.area} with ${c.experience}+ years experience. Specialises in ${c.speciality?.join(', ')}. Contact via WhatsApp.`,
  };
}

export default async function CarpenterProfilePage({ params }: { params: { id: string } }) {
  const c = await getCarpenter(params.id) as any;
  if (!c) notFound();

  const waNum   = c.wa_number || c.phone.replace(/\D/g, '');
  const waText  = encodeURIComponent(`Hi ${c.name}, I got your contact from Karur Plywood & Company directory. I need carpentry work done. Can we discuss the details?`);
  const waHref  = `https://wa.me/${waNum}?text=${waText}`;

  // Materials recommendation WA link
  const materialWA = `https://wa.me/${WA}?text=${encodeURIComponent(`Hi, I am planning to hire ${c.name} for carpentry work. Can you recommend the right plywood and materials for the project?`)}`;

  return (
    <>
      <section style={{ background:'linear-gradient(160deg,#0a1d3a,#070F1F)', borderBottom:'1px solid rgba(249,115,22,0.15)', padding:'90px 0 60px' }}>
        <div style={{ maxWidth:900, margin:'0 auto', padding:'0 5rem' }} className="prof-pad">
          {/* Breadcrumb */}
          <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#7A8EA8', marginBottom:28 }}>
            <Link href="/" style={{ color:'#7A8EA8', textDecoration:'none' }}>Home</Link>
            <span>›</span>
            <Link href="/carpenters" style={{ color:'#7A8EA8', textDecoration:'none' }}>Carpenters</Link>
            <span>›</span>
            <span style={{ color:'#F97316' }}>{c.name}</span>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:32, alignItems:'flex-start' }} className="prof-hero">
            {/* Avatar */}
            <div style={{ width:120, height:120, borderRadius:'50%', overflow:'hidden', border:'3px solid rgba(249,115,22,0.4)', background:'rgba(25,55,109,0.5)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              {c.photo_url
                ? <img src={c.photo_url} alt={c.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : <span style={{ fontSize:48 }}>🔨</span>
              }
            </div>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:8 }}>
                <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(2rem,4vw,3rem)', letterSpacing:'0.04em', color:'#F8F9FB', lineHeight:1 }}>{c.name.toUpperCase()}</h1>
                <span style={{ fontSize:10, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', background:'rgba(37,211,102,0.12)', color:'#4ADE80', border:'1px solid rgba(37,211,102,0.2)', padding:'3px 10px', borderRadius:2 }}>
                  ✓ Verified
                </span>
              </div>
              <div style={{ fontSize:14, color:'#7A8EA8', marginBottom:12 }}>
                📍 {c.area} · 🔨 {c.experience}+ years experience
                {c.rating > 0 && <> · ⭐ {c.rating} rating</>}
              </div>
              {c.bio && <p style={{ fontSize:15, color:'#A8BCCC', lineHeight:1.8, marginBottom:20, fontWeight:300 }}>{c.bio}</p>}
              {c.speciality?.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:24 }}>
                  {c.speciality.map((s: string) => (
                    <span key={s} style={{ fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', background:'rgba(249,115,22,0.08)', border:'1px solid rgba(249,115,22,0.2)', color:'#F97316', padding:'4px 12px', borderRadius:2 }}>{s}</span>
                  ))}
                </div>
              )}
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                <a href={waHref} target="_blank" rel="noopener" className="btn-p">💬 Chat on WhatsApp</a>
                <a href={`tel:${c.phone}`} className="btn-s">📞 {c.phone}</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding:'56px 0', background:'#070F1F' }}>
        <div style={{ maxWidth:900, margin:'0 auto', padding:'0 5rem' }} className="prof-pad">

          {/* Info cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:40 }} className="prof-stats">
            {[
              { icon:'📍', label:'Location', val:c.area },
              { icon:'🔨', label:'Experience', val:`${c.experience}+ Years` },
              { icon:'⭐', label:'Rating', val:c.rating > 0 ? `${c.rating}/5` : 'New Listing' },
            ].map(s => (
              <div key={s.label} style={{ background:'rgba(25,55,109,0.35)', border:'1px solid rgba(249,115,22,0.15)', borderRadius:8, padding:'1.2rem 1.5rem' }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.4rem', letterSpacing:'0.04em', color:'#F97316', lineHeight:1, marginBottom:4 }}>{s.val}</div>
                <div style={{ fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#7A8EA8' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Materials section — links to Karur Plywood */}
          <div style={{ background:'rgba(249,115,22,0.05)', border:'1px solid rgba(249,115,22,0.18)', borderRadius:10, padding:'28px 32px', marginBottom:40 }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.3rem', letterSpacing:'0.05em', color:'#F8F9FB', marginBottom:8 }}>
              🪵 MATERIALS FROM KARUR PLYWOOD
            </div>
            <p style={{ fontSize:14, color:'#7A8EA8', lineHeight:1.75, marginBottom:18 }}>
              {c.name} sources quality plywood, laminates and hardware from Karur Plywood &amp; Company for all projects. You can order materials directly and have them delivered to your site, or ask us to coordinate with {c.name.split(' ')[0]}.
            </p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <Link href="/products" className="btn-p" style={{ display:'inline-flex', alignItems:'center' }}>Browse Products →</Link>
              <a href={materialWA} target="_blank" rel="noopener" className="btn-wa" style={{ display:'inline-flex', alignItems:'center', gap:8 }}>💬 Get Material Recommendation</a>
            </div>
          </div>

          {/* Contact card */}
          <div style={{ background:'rgba(25,55,109,0.35)', border:'1px solid rgba(249,115,22,0.15)', borderRadius:10, padding:'28px 32px' }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.4rem', letterSpacing:'0.05em', color:'#F8F9FB', marginBottom:20 }}>
              CONTACT {c.name.split(' ')[0].toUpperCase()}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:24 }}>
              <div style={{ display:'flex', gap:12 }}>
                <div style={{ width:40, height:40, background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>📞</div>
                <div>
                  <div style={{ fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#7A8EA8', marginBottom:2 }}>Phone</div>
                  <a href={`tel:${c.phone}`} style={{ fontSize:15, fontWeight:600, color:'#F8F9FB', textDecoration:'none' }}>{c.phone}</a>
                </div>
              </div>
              <div style={{ display:'flex', gap:12 }}>
                <div style={{ width:40, height:40, background:'rgba(37,211,102,0.1)', border:'1px solid rgba(37,211,102,0.2)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>💬</div>
                <div>
                  <div style={{ fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#7A8EA8', marginBottom:2 }}>WhatsApp</div>
                  <a href={waHref} target="_blank" rel="noopener" style={{ fontSize:15, fontWeight:600, color:'#25D366', textDecoration:'none' }}>{c.wa_number || c.phone}</a>
                </div>
              </div>
            </div>
            <a href={waHref} target="_blank" rel="noopener" className="btn-wa" style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              💬 Send WhatsApp Message to {c.name.split(' ')[0]}
            </a>
          </div>

          <div style={{ marginTop:28, textAlign:'center' }}>
            <Link href="/carpenters" style={{ fontSize:13, color:'#7A8EA8', fontFamily:"'Syne',sans-serif", fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>
              ← Back to All Carpenters
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .prof-pad { padding: 0 5rem; }
        .prof-hero { grid-template-columns: auto 1fr; }
        @media(max-width:768px){
          .prof-pad { padding: 0 1.5rem !important; }
          .prof-hero { grid-template-columns: 1fr !important; }
          .prof-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
