// src/app/architects/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/db';
import ArchitectApplyModal from './ApplyModal';

export const metadata: Metadata = {
  title: 'Architect Directory | Verified Architects in Karur — Karur Plywood',
  description: 'Find verified architects and interior designers in Karur, Trichy and nearby areas. All architects use quality materials from Karur Plywood.',
};

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999';

async function getArchitects() {
  const { data } = await supabase
    .from('architects')
    .select('id, name, slug, firm_name, area, photo_url, cover_url, specialities, experience, bio, brands_used, featured')
    .eq('verified', true)
    .order('featured', { ascending: false });
  return data || [];
}

export default async function ArchitectsPage() {
  const architects = await getArchitects();

  return (
    <>
      {/* Hero */}
      <section style={{ background:'linear-gradient(160deg,#0a1d3a,#070F1F)', borderBottom:'1px solid rgba(249,115,22,0.15)', padding:'80px 0 60px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 5rem' }} className="arch-pad">
          <div className="eyebrow">Partner Architects</div>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(2.8rem,5vw,4.5rem)', letterSpacing:'0.04em', color:'#F8F9FB', lineHeight:0.95, marginBottom:'1rem' }}>
            VERIFIED ARCHITECTS &amp;<br/><span style={{ color:'#F97316' }}>INTERIOR DESIGNERS</span>
          </h1>
          <p className="s-desc" style={{ maxWidth:520, marginBottom:'2rem' }}>
            Trusted professionals who design beautiful spaces using quality materials from Karur Plywood. Browse portfolios and connect directly.
          </p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <a href={`https://wa.me/${WA}?text=Hi%2C+I+need+an+architect+recommendation+in+Karur.`} target="_blank" rel="noopener" className="btn-wa">
              💬 Get a Recommendation
            </a>
            <ArchitectApplyModal />
          </div>
        </div>
      </section>

      <section style={{ padding:'56px 0 80px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 5rem' }} className="arch-pad">

          {architects.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 0' }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🏛️</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'2rem', letterSpacing:'0.05em', color:'#F8F9FB', marginBottom:8 }}>COMING SOON</div>
              <p style={{ color:'#7A8EA8', marginBottom:24 }}>We&apos;re onboarding verified architects. Check back soon!</p>
            </div>
          ) : (
            <div className="arch-grid">
              {architects.map((a: any) => (
                <Link key={a.id} href={`/architects/${a.slug}`} className="arch-card">
                  {/* Cover */}
                  <div className="arch-cover">
                    {a.cover_url
                      ? <img src={a.cover_url} alt={a.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:56, background:'linear-gradient(135deg,#0d1f3a,#19376D)' }}>🏛️</div>
                    }
                    {a.featured && <div className="arch-featured-badge">⭐ Featured</div>}
                  </div>

                  {/* Profile */}
                  <div className="arch-body">
                    <div className="arch-profile-row">
                      <div className="arch-avatar">
                        {a.photo_url
                          ? <img src={a.photo_url} alt={a.name} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
                          : <span style={{ fontSize:24 }}>👤</span>
                        }
                      </div>
                      <div>
                        <div className="arch-name">{a.name}</div>
                        {a.firm_name && <div className="arch-firm">{a.firm_name}</div>}
                        <div className="arch-meta">📍 {a.area} · {a.experience}+ yrs</div>
                      </div>
                    </div>

                    {a.bio && <p className="arch-bio">{a.bio.slice(0, 120)}...</p>}

                    {a.specialities?.length > 0 && (
                      <div className="arch-tags">
                        {a.specialities.slice(0,3).map((s: string) => (
                          <span key={s} className="arch-tag">{s}</span>
                        ))}
                      </div>
                    )}

                    {a.brands_used?.length > 0 && (
                      <div style={{ fontSize:11, color:'#7A8EA8', marginTop:10 }}>
                        Uses: {a.brands_used.slice(0,3).join(' · ')}
                      </div>
                    )}

                    <div className="arch-view-link">View Portfolio →</div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Join CTA */}
          <div style={{ marginTop:56, background:'linear-gradient(135deg,#0d1f3a,#19376D)', border:'1px solid rgba(249,115,22,0.2)', borderRadius:10, padding:'40px 48px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:32, flexWrap:'wrap' }}>
            <div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.8rem', letterSpacing:'0.05em', color:'#F8F9FB', marginBottom:6 }}>ARE YOU AN ARCHITECT OR INTERIOR DESIGNER?</div>
              <p style={{ color:'#7A8EA8', fontSize:14, maxWidth:480 }}>Showcase your portfolio to homeowners in Karur. Free listing for architects who use Karur Plywood materials.</p>
            </div>
            <ArchitectApplyModal />
          </div>
        </div>
      </section>

      <style>{`
        .arch-pad { padding: 0 5rem; }
        .arch-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }
        .arch-card { background: rgba(25,55,109,0.35); border: 1px solid rgba(249,115,22,0.15); border-radius: 10px; overflow: hidden; text-decoration: none; display: flex; flex-direction: column; transition: all 0.25s; }
        .arch-card:hover { border-color: #F97316; transform: translateY(-5px); box-shadow: 0 20px 50px rgba(0,0,0,0.4); }
        .arch-cover { position: relative; height: 180px; overflow: hidden; }
        .arch-featured-badge { position: absolute; top: 10px; right: 10px; background: #F97316; color: #0B2447; font-family: 'Syne',sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 3px 10px; border-radius: 2px; }
        .arch-body { padding: 18px 20px 22px; flex: 1; display: flex; flex-direction: column; }
        .arch-profile-row { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
        .arch-avatar { width: 48px; height: 48px; border-radius: 50%; background: rgba(249,115,22,0.1); border: 2px solid rgba(249,115,22,0.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
        .arch-name { font-family: 'Syne',sans-serif; font-weight: 700; font-size: 1rem; color: #F8F9FB; line-height: 1.2; }
        .arch-firm { font-size: 0.75rem; color: #F97316; margin-top: 2px; }
        .arch-meta { font-size: 0.72rem; color: #7A8EA8; margin-top: 3px; }
        .arch-bio { font-size: 0.78rem; color: #7A8EA8; line-height: 1.65; margin-bottom: 12px; flex: 1; }
        .arch-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
        .arch-tag { font-size: 0.65rem; font-family: 'Syne',sans-serif; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.2); color: #F97316; padding: 3px 9px; border-radius: 2px; }
        .arch-view-link { font-size: 0.75rem; font-family: 'Syne',sans-serif; font-weight: 700; color: #F97316; letter-spacing: 0.08em; margin-top: 12px; transition: letter-spacing 0.2s; }
        .arch-card:hover .arch-view-link { letter-spacing: 0.14em; }
        @media(max-width:1024px){ .arch-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media(max-width:640px){ .arch-pad { padding: 0 1.5rem !important; } .arch-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}
