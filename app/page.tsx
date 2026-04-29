// src/app/page.tsx  — Redesigned Homepage
import { Metadata } from 'next';
import Link from 'next/link';
import { getCategories } from '@/lib/products';
import { supabase } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Karur Plywood & Company | Best Plywood & Hardware Store in Karur',
  description: "Karur's trusted plywood & hardware store. Full home projects to urgent quick orders. 25+ years · 500+ customers · All top brands.",
};

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999';
const GMAPS = process.env.NEXT_PUBLIC_GMAPS_EMBED_URL || '';

async function getApprovedReviews() {
  const { data } = await supabase.from('reviews').select('*').eq('approved', true).order('created_at', { ascending: false }).limit(3);
  return data || [];
}

export default async function HomePage() {
  const [categories, reviews] = await Promise.all([getCategories(), getApprovedReviews()]);
  const inner: React.CSSProperties = { maxWidth: 1200, margin: '0 auto', padding: '0 48px' };

  return (
    <>
      {/* ── HERO ── */}
      <section style={{ minHeight:'calc(100vh - 70px)',display:'flex',alignItems:'center',position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse 70% 80% at 65% 50%,rgba(200,136,74,0.07) 0%,transparent 70%),radial-gradient(ellipse 40% 50% at 10% 80%,rgba(139,94,42,0.05) 0%,transparent 60%)' }}/>
        <div style={{ position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(200,136,74,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(200,136,74,0.03) 1px,transparent 1px)',backgroundSize:'60px 60px' }}/>
        <div style={{ ...inner,position:'relative',zIndex:2,paddingTop:80,paddingBottom:80,width:'100%' }}>
          <div style={{ display:'inline-flex',alignItems:'center',gap:10,background:'rgba(200,136,74,0.1)',border:'1px solid rgba(200,136,74,0.3)',borderRadius:30,padding:'6px 18px',fontSize:12,color:'#E0A86A',fontWeight:500,marginBottom:28 }}>
            <span style={{ width:6,height:6,background:'#25D366',borderRadius:'50%',display:'inline-block',animation:'hpulse 1.5s infinite' }}/>
            Karur's Trusted Plywood &amp; Hardware Store
          </div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(44px,5.5vw,78px)',fontWeight:700,color:'#F0E8DC',lineHeight:1.05,marginBottom:16,maxWidth:800 }}>
            From Full Home Projects<br/>
            <span style={{ fontStyle:'italic',fontWeight:400,color:'#E0A86A' }}>to Urgent Material Needs.</span>
          </h1>
          <p style={{ fontSize:17,color:'#9A8070',marginBottom:44,maxWidth:520,lineHeight:1.8 }}>
            Wholesale &amp; retail plywood, doors, laminates and hardware. Serving Karur and nearby districts for 25+ years.
          </p>
          <div style={{ display:'flex',gap:16,flexWrap:'wrap',marginBottom:56 }}>
            <Link href="/products" style={{ display:'flex',flexDirection:'column',alignItems:'flex-start',padding:'20px 28px',borderRadius:14,textDecoration:'none',background:'linear-gradient(135deg,#C8884A,#8B5E2A)',boxShadow:'0 8px 32px rgba(200,136,74,0.3)',minWidth:210 }} className="cta-lift">
              <span style={{ fontSize:24,marginBottom:6 }}>🏠</span>
              <span style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,color:'white',lineHeight:1.2 }}>Start Your Project</span>
              <span style={{ fontSize:12,color:'rgba(255,255,255,0.7)',marginTop:4 }}>Plywood · Doors · Laminates</span>
            </Link>
            <Link href="/quick-order" style={{ display:'flex',flexDirection:'column',alignItems:'flex-start',padding:'20px 28px',borderRadius:14,textDecoration:'none',background:'linear-gradient(135deg,#0D2B17,#091810)',border:'1px solid rgba(37,211,102,0.3)',boxShadow:'0 8px 32px rgba(37,211,102,0.1)',minWidth:210 }} className="cta-lift">
              <span style={{ fontSize:24,marginBottom:6 }}>⚡</span>
              <span style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,color:'white',lineHeight:1.2 }}>Quick Order</span>
              <span style={{ fontSize:12,color:'rgba(255,255,255,0.55)',marginTop:4 }}>Screws · Hinges · Fevicol · Tools</span>
            </Link>
          </div>
          <div style={{ display:'flex',gap:40,paddingTop:32,borderTop:'1px solid rgba(200,136,74,0.12)',flexWrap:'wrap' }}>
            {[['25+','Years of Trust'],['500+','Customers Served'],['20+','Top Brands'],['2','Ways to Order']].map(([n,l]) => (
              <div key={l}><div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:700,color:'#E0A86A',lineHeight:1 }}>{n}</div><div style={{ fontSize:12,color:'#9A8070',marginTop:4,fontWeight:500 }}>{l}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ background:'#1C140D',borderTop:'1px solid rgba(200,136,74,0.12)',borderBottom:'1px solid rgba(200,136,74,0.12)',padding:'22px 0' }}>
        <div style={{ ...inner,display:'flex',gap:24,flexWrap:'wrap',justifyContent:'space-between',alignItems:'center' }}>
          {[['✅','ISI Certified','Genuine Products'],['🚚','Same-Day Delivery','Within Karur'],['💰','Wholesale Rates','For Contractors'],['📞','Expert Advice','25+ Yrs Experience']].map(([i,n,l]) => (
            <div key={n as string} style={{ display:'flex',alignItems:'center',gap:12 }}>
              <div style={{ width:38,height:38,background:'rgba(200,136,74,0.1)',border:'1px solid rgba(200,136,74,0.15)',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17 }}>{i}</div>
              <div><div style={{ fontWeight:700,fontSize:13,color:'#F0E8DC' }}>{n}</div><div style={{ fontSize:11,color:'#9A8070' }}>{l}</div></div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TWO MODES ── */}
      <section style={{ padding:'88px 0' }}>
        <div style={inner}>
          <div style={{ display:'inline-flex',alignItems:'center',gap:8,fontSize:11,fontWeight:600,letterSpacing:3,textTransform:'uppercase',color:'#C8884A',marginBottom:14 }}>
            <span style={{ width:20,height:1,background:'#C8884A',display:'inline-block' }}/>How It Works
          </div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(32px,4vw,50px)',fontWeight:700,color:'#F0E8DC',marginBottom:40 }}>
            Two Ways to <span style={{ color:'#E0A86A' }}>Shop With Us</span>
          </h2>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:24 }} className="two-col">
            <div style={{ background:'linear-gradient(135deg,#1C140D,#241A10)',border:'1px solid rgba(200,136,74,0.2)',borderRadius:20,padding:36 }}>
              <div style={{ fontSize:40,marginBottom:16 }}>🏠</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:700,color:'#E0A86A',marginBottom:8 }}>Project Purchase</div>
              <p style={{ fontSize:14,color:'#9A8070',lineHeight:1.8,marginBottom:24 }}>Building a home, renovating interiors, or buying in bulk? Browse our full catalogue and get wholesale pricing on WhatsApp.</p>
              <div style={{ display:'flex',flexDirection:'column',gap:10,marginBottom:28 }}>
                {['Plywood — BWR, MR, Marine, Commercial','Doors — Flush, Moulded, PVC','Laminates — 100+ designs','Expert consultation included'].map(item=>(
                  <div key={item} style={{ display:'flex',alignItems:'center',gap:10,fontSize:13,color:'#C8B8A0' }}><span style={{ color:'#C8884A' }}>✓</span>{item}</div>
                ))}
              </div>
              <Link href="/products" style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'12px 24px',borderRadius:8,background:'linear-gradient(135deg,#C8884A,#8B5E2A)',color:'white',fontWeight:700,fontSize:14,textDecoration:'none' }}>Browse Products →</Link>
            </div>
            <div style={{ background:'linear-gradient(135deg,#0D1C10,#091410)',border:'1px solid rgba(37,211,102,0.2)',borderRadius:20,padding:36 }}>
              <div style={{ fontSize:40,marginBottom:16 }}>⚡</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:700,color:'#25D366',marginBottom:8 }}>Quick Order</div>
              <p style={{ fontSize:14,color:'#9A8070',lineHeight:1.8,marginBottom:24 }}>Need screws, hinges, or Fevicol urgently? Add items to cart and send the order on WhatsApp — fast delivery guaranteed.</p>
              <div style={{ display:'flex',flexDirection:'column',gap:10,marginBottom:28 }}>
                {['Fevicol & adhesives','Screws & fasteners','Hinges & handles','Drawer channels & tools'].map(item=>(
                  <div key={item} style={{ display:'flex',alignItems:'center',gap:10,fontSize:13,color:'#C8B8A0' }}><span style={{ color:'#25D366' }}>✓</span>{item}</div>
                ))}
              </div>
              <Link href="/quick-order" style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'12px 24px',borderRadius:8,background:'#25D366',color:'white',fontWeight:700,fontSize:14,textDecoration:'none' }}>Quick Order Now →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section style={{ padding:'72px 0',background:'#161009' }}>
        <div style={inner}>
          <div style={{ display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:36,flexWrap:'wrap',gap:12 }}>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(28px,3.5vw,44px)',fontWeight:700,color:'#F0E8DC' }}>What We <span style={{ color:'#E0A86A' }}>Stock</span></h2>
            <Link href="/products" style={{ color:'#E0A86A',fontWeight:600,fontSize:14,textDecoration:'none',border:'1px solid rgba(200,136,74,0.3)',padding:'9px 18px',borderRadius:8 }}>View All →</Link>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14 }} className="cat-grid">
            {categories.map(cat=>(
              <Link key={cat.id} href={`/products?category=${cat.slug}`}
                style={{ background:'#1C140D',border:'1px solid rgba(200,136,74,0.15)',borderRadius:14,padding:'22px 18px',textDecoration:'none',display:'block',textAlign:'center' }} className="cat-card">
                <div style={{ fontSize:34,marginBottom:10 }}>{cat.icon}</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontWeight:700,color:'#F0E8DC' }}>{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WA BANNER ── */}
      <section style={{ padding:'48px 0' }}>
        <div style={inner}>
          <div style={{ background:'linear-gradient(135deg,#0D2B17,#0A1F10)',border:'1px solid rgba(37,211,102,0.2)',borderRadius:24,padding:'52px 60px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:40,position:'relative',overflow:'hidden',flexWrap:'wrap' }}>
            <div style={{ position:'absolute',top:-60,right:-60,width:300,height:300,background:'radial-gradient(circle,rgba(37,211,102,0.07),transparent 70%)',pointerEvents:'none' }}/>
            <div style={{ fontSize:56,flexShrink:0 }}>💬</div>
            <div style={{ flex:1,minWidth:200 }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(22px,3vw,34px)',fontWeight:700,color:'#F0E8DC',marginBottom:8 }}>Get Expert Advice Instantly</div>
              <div style={{ fontSize:15,color:'rgba(255,255,255,0.5)' }}>Not sure what to buy? Our team replies within minutes.</div>
            </div>
            <div style={{ display:'flex',gap:12,flexWrap:'wrap',flexShrink:0 }}>
              <a href={`https://wa.me/${WA}?text=Hi%2C+I+need+expert+advice+on+plywood+and+hardware.`} target="_blank" rel="noopener"
                style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'13px 24px',borderRadius:8,background:'#25D366',color:'white',fontWeight:700,fontSize:14,textDecoration:'none' }}>💬 Chat on WhatsApp</a>
              <a href="tel:+919999999999"
                style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'13px 24px',borderRadius:8,background:'transparent',color:'white',fontWeight:600,fontSize:14,textDecoration:'none',border:'1px solid rgba(255,255,255,0.2)' }}>📞 Call Now</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      {reviews.length > 0 && (
        <section style={{ padding:'72px 0',background:'#161009' }}>
          <div style={inner}>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(28px,3.5vw,44px)',fontWeight:700,color:'#F0E8DC',marginBottom:36 }}>What Our <span style={{ color:'#E0A86A' }}>Customers Say</span></h2>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20 }} className="rev-grid">
              {reviews.map((r:any)=>(
                <div key={r.id} style={{ background:'#1C140D',border:'1px solid rgba(200,136,74,0.15)',borderRadius:18,padding:28 }}>
                  <div style={{ color:'#E8B820',fontSize:14,letterSpacing:2,marginBottom:10 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
                  <div style={{ fontSize:14,color:'#C8B8A0',lineHeight:1.8,fontStyle:'italic',marginBottom:18 }}>"{r.message}"</div>
                  <div style={{ fontWeight:700,fontSize:14,color:'#F0E8DC' }}>{r.name}</div>
                  {r.role&&<div style={{ fontSize:12,color:'#9A8070',marginTop:2 }}>{r.role}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── LOCATION ── */}
      <section style={{ padding:'88px 0' }}>
        <div style={inner}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(28px,3.5vw,44px)',fontWeight:700,color:'#F0E8DC',marginBottom:36 }}>Visit Our <span style={{ color:'#E0A86A' }}>Karur Showroom</span></h2>
          <div style={{ background:'#1C140D',border:'1px solid rgba(200,136,74,0.15)',borderRadius:20,overflow:'hidden',display:'grid',gridTemplateColumns:'1fr 300px' }} className="map-grid">
            {GMAPS
              ? <iframe src={GMAPS} width="100%" height="320" style={{ border:0,display:'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
              : <div style={{ height:320,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,background:'#161009',position:'relative' }}>
                  <div style={{ position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(200,136,74,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(200,136,74,0.04) 1px,transparent 1px)',backgroundSize:'28px 28px' }}/>
                  <span style={{ fontSize:36,position:'relative' }}>📍</span>
                  <span style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:700,color:'#F0E8DC',position:'relative' }}>Karur Plywood &amp; Company</span>
                  <a href="https://maps.google.com/?q=Karur" target="_blank" rel="noopener" style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'9px 18px',borderRadius:8,background:'linear-gradient(135deg,#C8884A,#8B5E2A)',color:'white',fontWeight:700,fontSize:12,textDecoration:'none',position:'relative' }}>🗺️ Open Google Maps</a>
                </div>
            }
            <div style={{ padding:'28px 24px',display:'flex',flexDirection:'column',gap:16,borderLeft:'1px solid rgba(200,136,74,0.12)' }}>
              {[['📍','Address','Main Road, Karur\nTamil Nadu - 639 001'],['📞','Phone','+91 99999 99999'],['⏰','Hours','Mon–Sat: 9 AM – 7 PM']].map(([icon,label,value])=>(
                <div key={label as string} style={{ display:'flex',gap:10 }}>
                  <div style={{ width:32,height:32,background:'rgba(200,136,74,0.1)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0 }}>{icon}</div>
                  <div><div style={{ fontSize:10,color:'#9A8070',textTransform:'uppercase',letterSpacing:1,fontWeight:600,marginBottom:2 }}>{label}</div><div style={{ fontSize:13,color:'#C8B8A0',lineHeight:1.6 }}>{(value as string).split('\n').map((l,i,a)=><span key={i}>{l}{i<a.length-1&&<br/>}</span>)}</div></div>
                </div>
              ))}
              <a href={`https://wa.me/${WA}?text=Hi%2C+I%27d+like+to+visit+your+showroom.`} target="_blank" rel="noopener"
                style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'11px 0',borderRadius:8,background:'#25D366',color:'white',fontWeight:700,fontSize:13,textDecoration:'none',marginTop:4 }}>
                💬 Chat Before Visiting
              </a>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes hpulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .cta-lift:hover{transform:translateY(-4px)!important;box-shadow:0 16px 48px rgba(200,136,74,0.35)!important}
        .cat-card:hover{border-color:rgba(200,136,74,0.4)!important;transform:translateY(-3px)!important;transition:all 0.2s}
        @media(max-width:1024px){.two-col{grid-template-columns:1fr!important}.cat-grid{grid-template-columns:repeat(3,1fr)!important}.rev-grid{grid-template-columns:1fr!important}.map-grid{grid-template-columns:1fr!important}}
        @media(max-width:640px){.cat-grid{grid-template-columns:repeat(2,1fr)!important} div[style*="padding: 0 48px"]{padding:0 20px!important}}
      `}</style>
    </>
  );
}
