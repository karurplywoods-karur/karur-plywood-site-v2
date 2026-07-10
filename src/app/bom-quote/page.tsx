// src/app/bom-quote/page.tsx
import { Metadata } from 'next';
import BOMUploader from '@/components/BOMUploader';

export const metadata: Metadata = {
  title: 'Upload Your BOM for a Quote | Karur Plywood & Company',
  description: 'Upload your Bill of Materials or handwritten material list. We\'ll send you a complete quote on WhatsApp within minutes.',
};

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919159666538';

const HOW_IT_WORKS = [
  { step:'01', icon:'📸', title:'Upload Your Material List', desc:'Take a photo of your handwritten material list, or upload any image/PDF of your BOM.' },
  { step:'02', icon:'📝', title:'Add Your Details', desc:'Enter your name, phone number and delivery location.' },
  { step:'03', icon:'💬', title:'Submit for Quote', desc:'Your material list and details are securely submitted to our team.' },
  { step:'04', icon:'⚡', title:'Receive Quote on WhatsApp', desc:'We review your list and send pricing within 10–30 minutes.' },
];

export default function BOMPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background:'linear-gradient(160deg,#0a1d3a,#070F1F)', borderBottom:'1px solid rgba(249,115,22,0.15)', padding:'80px 0 60px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 5rem' }} className="bom-pad">
          <div className="eyebrow">Bill of Materials</div>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(2.8rem,5vw,4.5rem)', letterSpacing:'0.04em', color:'#F8F9FB', lineHeight:0.95, marginBottom:'1rem' }}>
            UPLOAD YOUR LIST.<br/>
            <span style={{ color:'#F97316' }}>GET A QUOTE IN MINUTES.</span>
          </h1>
          <p className="s-desc" style={{ maxWidth:500 }}>
            Have a handwritten material list or a contractor&apos;s BOM? Just snap a photo and send it. No typing. No forms. Just WhatsApp.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding:'56px 0', background:'#070F1F' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 5rem' }} className="bom-pad">
          <div className="eyebrow">How It Works</div>
          <h2 className="s-title" style={{ marginBottom:'3rem' }}>4 STEPS TO YOUR QUOTE</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20, marginBottom:64 }} className="bom-steps">
            {HOW_IT_WORKS.map(s => (
              <div key={s.step} style={{ position:'relative' }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'3rem', letterSpacing:'0.05em', color:'rgba(249,115,22,0.45)', lineHeight:1, marginBottom:8 }}>{s.step}</div>
                <div style={{ fontSize:30, marginBottom:18, minHeight:40, display:'flex', alignItems:'center'}}>{s.icon}</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'1rem', color:'#F8F9FB', marginBottom:10, lineHeight:1.35, minHeight:52 }}>{s.title}</div>
                <div style={{ fontSize:'0.82rem', color:'#7A8EA8', lineHeight:1.75 }}>{s.desc}</div>
              </div>
            ))}
          </div>

          {/* The BOM uploader */}
          <div style={{ maxWidth:620, margin:'0 auto' }}>
            <BOMUploader />
          </div>
        </div>
      </section>

      {/* Who is this for */}
      <section style={{ padding:'48px 0', background:'rgba(11,36,71,0.3)', borderTop:'1px solid rgba(249,115,22,0.1)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 5rem' }} className="bom-pad">
          <h2 className="s-title" style={{ marginBottom:'2rem' }}>WHO IS THIS FOR?</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }} className="bom-who-grid">
            {[
              { icon:'🏗️', who:'Contractors & Builders', desc:'Building multiple homes? Upload your full material schedule and get bulk pricing instantly.' },
              { icon:'🔨', who:'Carpenters', desc:'Have a client order? Send us the list and we\'ll quote all materials together with delivery.' },
              { icon:'🏠', who:'Homeowners', desc:'Received a material list from your architect? Upload it and compare our pricing in one shot.' },
            ].map(w => (
              <div key={w.who} style={{ background:'rgba(25,55,109,0.35)', border:'1px solid rgba(249,115,22,0.15)', borderRadius:8, padding:'1.5rem' }}>
                <div style={{ fontSize:32, marginBottom:12 }}>{w.icon}</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'0.9rem', color:'#F8F9FB', marginBottom:8 }}>{w.who}</div>
                <div style={{ fontSize:'0.78rem', color:'#7A8EA8', lineHeight:1.65 }}>{w.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .bom-pad { padding: 0 5rem; }
        @media(max-width:1024px){ .bom-steps{grid-template-columns:repeat(2,1fr)!important} .bom-who-grid{grid-template-columns:1fr!important} }
        @media(max-width:640px){ .bom-pad{padding:0 1.5rem!important} .bom-steps{grid-template-columns:1fr!important} }
      `}</style>
    </>
  );
}
