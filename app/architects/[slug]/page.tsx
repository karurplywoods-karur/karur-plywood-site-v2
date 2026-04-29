// src/app/architects/[slug]/page.tsx
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/db';

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999';

async function getArchitect(slug: string) {
  const { data } = await supabase
    .from('architects')
    .select('*, architect_projects(*)')
    .eq('slug', slug)
    .eq('verified', true)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const a = await getArchitect(params.slug);
  if (!a) return { title: 'Not Found' };
  return {
    title: `${a.name} — Architect Portfolio | Karur Plywood`,
    description: a.bio?.slice(0, 155) || `${a.name} is a verified architect partner of Karur Plywood & Company.`,
  };
}

const TYPE_LABEL: Record<string, string> = {
  residential: '🏠 Residential', commercial: '🏢 Commercial', interior: '🎨 Interior',
};

export default async function ArchitectPortfolioPage({ params }: { params: { slug: string } }) {
  const arch = await getArchitect(params.slug);
  if (!arch) notFound();

  const projects = (arch.architect_projects || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
  const waHire = encodeURIComponent(`Hi ${arch.name}, I found your portfolio on Karur Plywood & Company. I'd like to discuss my project. Can we talk?`);

  return (
    <>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(160deg,#0a1d3a,#070F1F)', borderBottom: '1px solid rgba(249,115,22,0.15)', padding: '80px 0 56px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 5rem' }} className="port-pad">
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#7A8EA8', marginBottom: 28 }}>
            <Link href="/" style={{ color: '#7A8EA8', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <Link href="/architects" style={{ color: '#7A8EA8', textDecoration: 'none' }}>Architects</Link>
            <span>›</span>
            <span style={{ color: '#F97316' }}>{arch.name}</span>
          </div>

          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(249,115,22,0.1)', border: '3px solid rgba(249,115,22,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
              {arch.photo_url
                ? <Image src={arch.photo_url} alt={arch.name} fill style={{ objectFit: 'cover' }} />
                : '🏛️'
              }
            </div>

            <div style={{ flex: 1 }}>
              {/* Badges */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <span style={{ fontSize: 10, fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'rgba(37,211,102,0.12)', color: '#4ADE80', border: '1px solid rgba(37,211,102,0.2)', padding: '3px 10px', borderRadius: 2 }}>✓ Verified Partner</span>
                {arch.featured && <span style={{ fontSize: 10, fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'rgba(249,115,22,0.15)', color: '#F97316', border: '1px solid rgba(249,115,22,0.3)', padding: '3px 10px', borderRadius: 2 }}>⭐ Featured</span>}
              </div>

              <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2rem,4vw,3.2rem)', letterSpacing: '0.04em', color: '#F8F9FB', lineHeight: 1, marginBottom: 6 }}>
                {arch.name}
              </h1>
              {arch.firm && <div style={{ fontSize: 14, color: '#F97316', fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '0.06em', marginBottom: 6 }}>{arch.firm}</div>}
              <div style={{ fontSize: 13, color: '#7A8EA8', marginBottom: 14 }}>📍 {arch.city} · {arch.years_exp}+ years experience</div>

              {arch.bio && <p style={{ fontSize: 14, color: '#A8BCCC', lineHeight: 1.8, maxWidth: 600, marginBottom: 20, fontWeight: 300 }}>{arch.bio}</p>}

              {/* Specialities */}
              {arch.specialities?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
                  {arch.specialities.map((s: string) => (
                    <span key={s} style={{ fontSize: 11, fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: '#F97316', padding: '3px 9px', borderRadius: 2 }}>{s}</span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {arch.wa_number && (
                  <a href={`https://wa.me/${arch.wa_number.replace(/\D/g,'')}?text=${waHire}`} target="_blank" rel="noopener" className="btn-wa">
                    💬 Hire on WhatsApp
                  </a>
                )}
                {arch.phone && (
                  <a href={`tel:${arch.phone}`} className="btn-s" style={{ display: 'inline-flex' }}>📞 Call Now</a>
                )}
                {arch.website && (
                  <a href={arch.website} target="_blank" rel="noopener" className="btn-s" style={{ display: 'inline-flex' }}>🌐 Website</a>
                )}
              </div>
            </div>

            {/* Stats panel */}
            <div style={{ background: 'rgba(25,55,109,0.4)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 8, padding: '20px 24px', minWidth: 140, textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '2.8rem', letterSpacing: '0.04em', color: '#F97316', lineHeight: 1 }}>{projects.length}</div>
              <div style={{ fontSize: 10, fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A8EA8', marginTop: 4 }}>Projects</div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section style={{ padding: '56px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 5rem' }} className="port-pad">
          {projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#7A8EA8' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏗️</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.8rem', letterSpacing: '0.05em', color: '#F8F9FB', marginBottom: 8 }}>PROJECTS COMING SOON</div>
              <p style={{ maxWidth: 360, margin: '0 auto' }}>Portfolio is being updated. Contact {arch.name} directly on WhatsApp.</p>
            </div>
          ) : (
            <>
              <div className="eyebrow">Portfolio</div>
              <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(1.8rem,3vw,2.8rem)', letterSpacing: '0.04em', color: '#F8F9FB', marginBottom: 32 }}>
                COMPLETED PROJECTS
              </h2>
              <div className="port-grid">
                {projects.map((p: any) => (
                  <div key={p.id} className="port-card">
                    {/* Cover image */}
                    <div className="port-card-img">
                      {p.cover_image ? (
                        <Image src={p.cover_image} alt={p.title} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 50vw" />
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, background: 'linear-gradient(135deg,#0d1f3a,#19376D)' }}>
                          {p.project_type === 'commercial' ? '🏢' : p.project_type === 'interior' ? '🎨' : '🏠'}
                        </div>
                      )}
                      {/* Type badge */}
                      <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(7,15,31,0.85)', backdropFilter: 'blur(6px)', border: '1px solid rgba(249,115,22,0.28)', borderRadius: 2, padding: '3px 10px', fontSize: 10, fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F97316' }}>
                        {TYPE_LABEL[p.project_type] || p.project_type}
                      </div>
                      {p.year && (
                        <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(7,15,31,0.85)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, padding: '3px 10px', fontSize: 10, fontFamily: "'Syne',sans-serif", fontWeight: 700, color: '#7A8EA8' }}>
                          {p.year}
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div style={{ padding: '18px 20px 20px' }}>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '1rem', fontWeight: 700, color: '#F8F9FB', marginBottom: 6, lineHeight: 1.3 }}>{p.title}</div>
                      {p.location && <div style={{ fontSize: 12, color: '#7A8EA8', marginBottom: 10 }}>📍 {p.location}</div>}
                      {p.description && <p style={{ fontSize: 13, color: '#7A8EA8', lineHeight: 1.65, marginBottom: 14 }}>{p.description}</p>}

                      {/* Materials used */}
                      {p.materials_used?.length > 0 && (
                        <div>
                          <div style={{ fontSize: 10, fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A8EA8', marginBottom: 8 }}>
                            Materials from Karur Plywood:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {p.materials_used.map((m: string) => (
                              <span key={m} style={{ fontSize: 11, fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '0.06em', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: '#F97316', padding: '3px 8px', borderRadius: 2 }}>{m}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Hire CTA */}
          <div style={{ marginTop: 56, background: 'linear-gradient(135deg,#0d1f3a,#19376D)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10, padding: '36px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.8rem', letterSpacing: '0.05em', color: '#F8F9FB', marginBottom: 6 }}>INTERESTED IN {arch.name.toUpperCase()}&apos;S WORK?</div>
              <p style={{ fontSize: 13, color: '#7A8EA8', lineHeight: 1.7 }}>
                All materials used in these projects are available at Karur Plywood &amp; Company. Get a quote for your project too.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flexShrink: 0 }}>
              {arch.wa_number && (
                <a href={`https://wa.me/${arch.wa_number.replace(/\D/g,'')}?text=${waHire}`} target="_blank" rel="noopener" className="btn-wa">💬 Hire {arch.name}</a>
              )}
              <a href={`https://wa.me/${WA}?text=Hi%2C+I+saw+${encodeURIComponent(arch.name)}'s+portfolio+on+your+site.+Can+you+help+me+get+similar+materials%3F`} target="_blank" rel="noopener" className="btn-p">
                🪵 Get Materials Quote
              </a>
            </div>
          </div>

          {/* Back link */}
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Link href="/architects" style={{ fontSize: 13, color: '#7A8EA8', fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '0.08em', textDecoration: 'none', transition: 'color 0.2s' }}>
              ← Back to All Architects
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .port-pad { padding: 0 5rem; }
        .port-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px; }
        .port-card { background: rgba(25,55,109,0.35); border: 1px solid rgba(249,115,22,0.15); border-radius: 10px; overflow: hidden; transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s; }
        .port-card:hover { border-color: #F97316; transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.4); }
        .port-card-img { position: relative; height: 260px; overflow: hidden; background: #0d1f3a; }
        @media(max-width:900px){ .port-grid{grid-template-columns:1fr!important} .port-pad{padding:0 1.5rem!important} }
      `}</style>
    </>
  );
}
