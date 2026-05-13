// src/app/about/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
export const metadata: Metadata = { title: 'About Us | Karur Plywood & Company — 25+ Years of Trust', description: "Learn about Karur Plywood & Company — Karur's leading plywood dealer with 25+ years of experience. Family-owned, customer-first." };
const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999';
export default function AboutPage() {
  return (
    <>
      <section style={{ background:'linear-gradient(135deg,#1C140D,#161009)',borderBottom:'1px solid rgba(200,136,74,0.15)',padding:'80px 0' }}>
        <div style={{ maxWidth:1200,margin:'0 auto',padding:'0 48px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center' }} className="about-hero">
          <div>
            <div style={{ display:'inline-flex',alignItems:'center',gap:8,fontSize:11,fontWeight:600,letterSpacing:3,textTransform:'uppercase',color:'#C8884A',marginBottom:14 }}>
              <span style={{ width:24,height:1,background:'#C8884A',display:'inline-block' }}></span>Our Story
            </div>
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(40px,5vw,60px)',fontWeight:700,color:'#F0E8DC',lineHeight:1.1,marginBottom:20 }}>
              25+ Years of Building <span style={{ color:'#E0A86A' }}>Karur's Trust</span>
            </h1>
            <p style={{ fontSize:15,color:'#9A8070',lineHeight:1.85,marginBottom:14 }}>Karur Plywood and Company was founded with one simple belief — that quality building materials, sold at honest prices, can transform homes and livelihoods. Starting as a small retail shop in Karur, we have grown into one of the region's most trusted wholesale and retail suppliers.</p>
            <p style={{ fontSize:15,color:'#9A8070',lineHeight:1.85,marginBottom:14 }}>Today, we serve hundreds of contractors, carpenters, builders and homeowners across Karur, Trichy, Namakkal and the surrounding districts. Our experienced team helps every customer — from a first-time homebuilder to a seasoned contractor — choose exactly the right product.</p>
            <p style={{ fontSize:15,color:'#9A8070',lineHeight:1.85,marginBottom:32 }}>We believe in relationships, not just transactions. That's why our customers keep coming back, year after year.</p>
            <div style={{ display:'flex',gap:14,flexWrap:'wrap' }}>
              <a href={`https://wa.me/${WA}?text=Hi%2C+I+want+to+know+more+about+your+shop.`} target="_blank" rel="noopener" style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'13px 24px',borderRadius:8,background:'#25D366',color:'white',fontWeight:700,fontSize:14,textDecoration:'none' }}>💬 Chat With Us</a>
              <Link href="/products" style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'13px 24px',borderRadius:8,background:'transparent',color:'#F0E8DC',fontWeight:600,fontSize:14,textDecoration:'none',border:'1px solid rgba(200,136,74,0.3)' }}>View Our Products →</Link>
            </div>
          </div>
          <div style={{ background:'#1C140D',border:'1px solid rgba(200,136,74,0.15)',borderRadius:24,aspectRatio:'1',display:'flex',alignItems:'center',justifyContent:'center',fontSize:100,position:'relative',overflow:'hidden' }}>
            🪵
            <div style={{ position:'absolute',width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(200,136,74,0.12),transparent 70%)',bottom:-50,right:-50 }}/>
          </div>
        </div>
      </section>

      <section style={{ padding:'80px 0' }}>
        <div style={{ maxWidth:1200,margin:'0 auto',padding:'0 48px' }}>
          <div style={{ textAlign:'center',marginBottom:48 }}>
            <div style={{ display:'inline-flex',alignItems:'center',gap:8,fontSize:11,fontWeight:600,letterSpacing:3,textTransform:'uppercase',color:'#C8884A',marginBottom:12 }}>
              <span style={{ width:24,height:1,background:'#C8884A',display:'inline-block' }}></span>By the Numbers
            </div>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(32px,4vw,48px)',fontWeight:700,color:'#F0E8DC' }}>Trusted by <span style={{ color:'#E0A86A' }}>Hundreds</span></h2>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20 }} className="milestones">
            {[['25+','Years in Business'],['500+','Happy Customers'],['20+','Premium Brands'],['4','Product Categories']].map(([n,l]) => (
              <div key={l} style={{ textAlign:'center',background:'#1C140D',border:'1px solid rgba(200,136,74,0.15)',borderRadius:20,padding:'32px 20px' }} className="card-lift">
                <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:48,fontWeight:700,color:'#E0A86A',lineHeight:1,marginBottom:8 }}>{n}</div>
                <div style={{ fontSize:13,color:'#9A8070',fontWeight:500 }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop:72 }}>
            <div style={{ textAlign:'center',marginBottom:40 }}>
              <div style={{ display:'inline-flex',alignItems:'center',gap:8,fontSize:11,fontWeight:600,letterSpacing:3,textTransform:'uppercase',color:'#C8884A',marginBottom:12 }}>
                <span style={{ width:24,height:1,background:'#C8884A',display:'inline-block' }}></span>Our Values
              </div>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(28px,3.5vw,44px)',fontWeight:700,color:'#F0E8DC' }}>What We <span style={{ color:'#E0A86A' }}>Stand For</span></h2>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20 }} className="values-grid">
              {[['🎯','Quality First','We stock only ISI-marked, BIS-certified products from nationally trusted brands. No compromise.'],['🤝','Honest Pricing','Transparent pricing for both retail and wholesale. No hidden charges or inflated rates.'],['💡','Expert Guidance','Our team helps you pick the right product for your specific use case.'],['🌱','Community First','Proud to be a Karur-based business serving local builders, carpenters and families.']].map(([i,t,d]) => (
                <div key={t as string} style={{ background:'#1C140D',border:'1px solid rgba(200,136,74,0.15)',borderRadius:14,padding:24 }} className="card-lift">
                  <div style={{ fontSize:28,marginBottom:10 }}>{i}</div>
                  <div style={{ fontWeight:600,fontSize:15,color:'#F0E8DC',marginBottom:6 }}>{t}</div>
                  <div style={{ fontSize:13,color:'#9A8070',lineHeight:1.7 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media(max-width:1024px){.about-hero{grid-template-columns:1fr!important} .about-hero>div:last-child{display:none} .milestones{grid-template-columns:repeat(2,1fr)!important} .values-grid{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:640px){.milestones{grid-template-columns:1fr!important} .values-grid{grid-template-columns:1fr!important} div[style*="padding: 0 48px"]{padding:0 20px!important}}
      `}</style>
    </>
  );
}
