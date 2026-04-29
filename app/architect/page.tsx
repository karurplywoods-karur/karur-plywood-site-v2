// src/app/architect/page.tsx
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Architect Portfolio | Karur Plywood & Company',
  description: 'Browse completed residential and commercial design projects by our partner architect. Quality interiors using materials from Karur Plywood.',
};

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999';

async function getData() {
  const [{ data: profile }, { data: projects }] = await Promise.all([
    supabase.from('architect_profile').select('*').eq('active', true).maybeSingle(),
    supabase.from('architect_projects').select('*').order('sort_order', { ascending: true }),
  ]);
  return { profile, projects: projects || [] };
}

const TYPE_COLOR: Record<string, string> = {
  Residential: '#F97316',
  Commercial:  '#3B82F6',
  Interior:    '#A855F7',
};

export default async function ArchitectPage() {
  const { profile, projects } = await getData();
  const arch = profile as any;
  const projs = projects as any[];

  const featured = projs.filter(p => p.featured);
  const rest     = projs.filter(p => !p.featured);

  const consultWA = arch?.wa_number
    ? `https://wa.me/${arch.wa_number}?text=${encodeURIComponent(`Hi ${arch?.name}, I saw your portfolio on Karur Plywood's website and would like to discuss a project.`)}`
    : `https://wa.me/${WA}?text=${encodeURIComponent('Hi, I saw the architect portfolio on your website and would like to consult.')}`;

  return (
    <>
      {/* Hero */}
      <section style={{ background:'linear-gradient(160deg,#0a1d3a,#070F1F)', borderBottom:'1px solid rgba(249,115,22,0.15)', padding:'90px 0 60px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(249,115,22,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.03) 1px,transparent 1px)', backgroundSize:'60px 60px', pointerEvents:'none' }}/>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 5rem', position:'relative', zIndex:2 }} className="arch-pad">

          {arch ? (
            <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:60, alignItems:'center' }} className="arch-hero-grid">
              <div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.3)', borderRadius:2, padding:'4px 16px', fontSize:10, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#F97316', marginBottom:20 }}>
                  Partner Architect · Karur Plywood &amp; Company
                </div>
                <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(2.8rem,5vw,4.5rem)', letterSpacing:'0.04em', color:'#F8F9FB', lineHeight:0.95, marginBottom:10 }}>
                  {arch.name.toUpperCase()}
                </h1>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:'1rem', color:'#F97316', letterSpacing:'0.08em', marginBottom:20 }}>
                  {arch.title}
                </div>
                <p style={{ fontSize:15, color:'#7A8EA8', lineHeight:1.85, maxWidth:540, marginBottom:28, fontWeight:300 }}>{arch.bio}</p>

                {/* Specialities */}
                {arch.specialities?.length > 0 && (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:28 }}>
                    {arch.specialities.map((s: string) => (
                      <span key={s} style={{ fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', background:'rgba(249,115,22,0.08)', border:'1px solid rgba(249,115,22,0.2)', color:'#F97316', padding:'4px 12px', borderRadius:2 }}>{s}</span>
                    ))}
                  </div>
                )}

                <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                  <a href={consultWA} target="_blank" rel="noopener" className="btn-p">💬 Book a Consultation</a>
                  {arch.phone && <a href={`tel:${arch.phone}`} className="btn-s">📞 {arch.phone}</a>}
                </div>
              </div>

              {/* Architect photo + stats */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
                <div style={{ width:180, height:180, borderRadius:'50%', overflow:'hidden', border:'3px solid rgba(249,115,22,0.4)', background:'rgba(25,55,109,0.5)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {arch.photo_url
                    ? <img src={arch.photo_url} alt={arch.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <span style={{ fontSize:64 }}>🏛️</span>
                  }
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, width:200 }}>
                  <div style={{ background:'rgba(25,55,109,0.5)', border:'1px solid rgba(249,115,22,0.15)', borderRadius:6, padding:'14px 12px', textAlign:'center' }}>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.8rem', color:'#F97316', lineHeight:1 }}>{arch.experience}+</div>
                    <div style={{ fontSize:10, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#7A8EA8', marginTop:4 }}>Years</div>
                  </div>
                  <div style={{ background:'rgba(25,55,109,0.5)', border:'1px solid rgba(249,115,22,0.15)', borderRadius:6, padding:'14px 12px', textAlign:'center' }}>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.8rem', color:'#F97316', lineHeight:1 }}>{arch.projects_done}+</div>
                    <div style={{ fontSize:10, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#7A8EA8', marginTop:4 }}>Projects</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign:'center' }}>
              <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'3rem', letterSpacing:'0.04em', color:'#F8F9FB' }}>ARCHITECT PORTFOLIO</h1>
              <p style={{ color:'#7A8EA8', marginTop:12 }}>Portfolio coming soon. Contact us for consultations.</p>
            </div>
          )}
        </div>
      </section>

      {/* Awards */}
      {arch?.awards?.length > 0 && (
        <div style={{ background:'rgba(249,115,22,0.04)', borderBottom:'1px solid rgba(249,115,22,0.1)', padding:'18px 0' }}>
          <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 5rem', display:'flex', gap:32, alignItems:'center', flexWrap:'wrap' }} className="arch-pad">
            <span style={{ fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#F97316', flexShrink:0 }}>🏆 Awards</span>
            {arch.awards.map((a: string) => (
              <span key={a} style={{ fontSize:13, color:'#A8BCCC' }}>· {a}</span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      <section style={{ padding:'64px 0', background:'#070F1F' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 5rem' }} className="arch-pad">
          <div className="eyebrow">Project Portfolio</div>
          <h2 className="s-title" style={{ marginBottom:'3rem' }}>COMPLETED PROJECTS</h2>

          {projs.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'#7A8EA8' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🏛️</div>
              <p>Projects will be added soon. Check back shortly.</p>
            </div>
          ) : (
            <>
              {/* Featured projects — large cards */}
              {featured.length > 0 && (
                <div style={{ display:'flex', flexDirection:'column', gap:20, marginBottom:32 }}>
                  {featured.map((p: any) => (
                    <div key={p.id} className="arch-project-featured">
                      <div className="arch-project-img">
                        {p.cover_image
                          ? <Image src={p.cover_image} alt={p.title} fill style={{ objectFit:'cover' }} sizes="(max-width:768px) 100vw, 50vw" />
                          : <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:80, background:'rgba(25,55,109,0.5)' }}>🏛️</div>
                        }
                        <div className="arch-project-overlay" />
                      </div>
                      <div className="arch-project-info">
                        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, flexWrap:'wrap' }}>
                          <span style={{ fontSize:10, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', background:`${TYPE_COLOR[p.project_type] || '#F97316'}20`, color:TYPE_COLOR[p.project_type] || '#F97316', padding:'3px 10px', borderRadius:2 }}>{p.project_type}</span>
                          <span style={{ fontSize:11, color:'#7A8EA8' }}>⭐ Featured</span>
                          {p.year && <span style={{ fontSize:11, color:'#7A8EA8' }}>📅 {p.year}</span>}
                        </div>
                        <h3 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(1.6rem,2.5vw,2.2rem)', letterSpacing:'0.04em', color:'#F8F9FB', lineHeight:1.05, marginBottom:10 }}>{p.title}</h3>
                        <div style={{ fontSize:13, color:'#7A8EA8', marginBottom:12 }}>📍 {p.location}{p.area_sqft ? ` · ${p.area_sqft.toLocaleString()} sq.ft` : ''}{p.budget_range ? ` · ${p.budget_range}` : ''}</div>
                        <p style={{ fontSize:14, color:'#7A8EA8', lineHeight:1.75, marginBottom:16, fontWeight:300 }}>{p.description}</p>
                        {p.tags?.length > 0 && (
                          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:20 }}>
                            {p.tags.map((t: string) => (
                              <span key={t} style={{ fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', background:'rgba(249,115,22,0.08)', border:'1px solid rgba(249,115,22,0.2)', color:'#F97316', padding:'3px 9px', borderRadius:2 }}>{t}</span>
                            ))}
                          </div>
                        )}
                        <a href={consultWA} target="_blank" rel="noopener" className="btn-wa" style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
                          💬 Enquire About This Project
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Rest — 3 column grid */}
              {rest.length > 0 && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }} className="arch-grid">
                  {rest.map((p: any) => (
                    <div key={p.id} className="arch-card">
                      <div style={{ position:'relative', height:200, overflow:'hidden' }}>
                        {p.cover_image
                          ? <Image src={p.cover_image} alt={p.title} fill style={{ objectFit:'cover', transition:'transform 0.4s' }} className="arch-card-img" sizes="(max-width:768px) 100vw, 33vw" />
                          : <div style={{ height:'100%', background:'rgba(25,55,109,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:56 }}>🏛️</div>
                        }
                      </div>
                      <div style={{ padding:'18px 20px 22px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                          <span style={{ fontSize:10, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', background:`${TYPE_COLOR[p.project_type] || '#F97316'}18`, color:TYPE_COLOR[p.project_type] || '#F97316', padding:'2px 8px', borderRadius:2 }}>{p.project_type}</span>
                          {p.year && <span style={{ fontSize:11, color:'#7A8EA8' }}>{p.year}</span>}
                        </div>
                        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'0.92rem', color:'#F8F9FB', marginBottom:6, lineHeight:1.3 }}>{p.title}</div>
                        <div style={{ fontSize:12, color:'#7A8EA8', marginBottom:10 }}>📍 {p.location}</div>
                        <p style={{ fontSize:12, color:'#7A8EA8', lineHeight:1.65, marginBottom:12 }}>{p.description.slice(0,120)}...</p>
                        <a href={consultWA} target="_blank" rel="noopener" style={{ fontSize:12, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.08em', color:'#F97316', textDecoration:'none' }}>
                          Enquire About This →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Consultation CTA */}
          <div style={{ marginTop:56, background:'linear-gradient(135deg,#0d1f3a,#19376D)', border:'1px solid rgba(249,115,22,0.2)', borderRadius:10, padding:'40px 48px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:32, flexWrap:'wrap' }}>
            <div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.8rem', letterSpacing:'0.05em', color:'#F8F9FB', marginBottom:6 }}>
                WANT A SIMILAR PROJECT?
              </div>
              <p style={{ fontSize:14, color:'#7A8EA8' }}>
                Book a free consultation with {arch?.name || 'our partner architect'}. All materials sourced from Karur Plywood.
              </p>
            </div>
            <a href={consultWA} target="_blank" rel="noopener" className="btn-p" style={{ flexShrink:0 }}>
              💬 Book Free Consultation
            </a>
          </div>
        </div>
      </section>

      <style>{`
        .arch-pad { padding: 0 5rem; }
        .arch-hero-grid { grid-template-columns: 1fr auto; }
        .arch-project-featured {
          display: grid; grid-template-columns: 1fr 1fr;
          background: rgba(25,55,109,0.35);
          border: 1px solid rgba(249,115,22,0.18);
          border-radius: 10px; overflow: hidden;
          transition: border-color 0.25s;
        }
        .arch-project-featured:hover { border-color: #F97316; }
        .arch-project-img { position: relative; min-height: 280px; }
        .arch-project-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 60%, rgba(7,15,31,0.4));
          pointer-events: none;
        }
        .arch-project-info { padding: 36px; display: flex; flex-direction: column; justify-content: center; }
        .arch-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
        .arch-card {
          background: rgba(25,55,109,0.35);
          border: 1px solid rgba(249,115,22,0.15);
          border-radius: 10px; overflow: hidden;
          transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
        }
        .arch-card:hover { border-color: #F97316; transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.4); }
        .arch-card:hover .arch-card-img { transform: scale(1.05); }
        @media(max-width:1024px){
          .arch-hero-grid { grid-template-columns: 1fr !important; }
          .arch-hero-grid > div:last-child { display: none !important; }
          .arch-project-featured { grid-template-columns: 1fr !important; }
          .arch-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media(max-width:640px){
          .arch-pad { padding: 0 1.5rem !important; }
          .arch-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
