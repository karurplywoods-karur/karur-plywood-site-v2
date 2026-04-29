// src/app/areas/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Areas We Serve | Karur Plywood & Company',
  description: 'Karur Plywood delivers quality plywood, doors, laminates and hardware to Karur, Trichy, Namakkal, Erode, Salem and Dindigul.',
};

const CITIES = [
  { slug:'karur',    name:'Karur',    dist:'In city',  desc:'Walk-in showroom + same-day delivery',   emoji:'🏪' },
  { slug:'trichy',   name:'Trichy',   dist:'~50 km',   desc:'Delivery within 24 hours, bulk orders',  emoji:'🏛️' },
  { slug:'namakkal', name:'Namakkal', dist:'~45 km',   desc:'Wholesale supply for builders',          emoji:'🏗️' },
  { slug:'erode',    name:'Erode',    dist:'~75 km',   desc:'Bulk contractor orders, 1-2 day delivery',emoji:'🔩' },
  { slug:'salem',    name:'Salem',    dist:'~80 km',   desc:'Retail and wholesale, reliable delivery', emoji:'🪵' },
  { slug:'dindigul', name:'Dindigul', dist:'~90 km',   desc:'On-demand delivery, WhatsApp ordering',   emoji:'🚚' },
];

export default function AreasPage() {
  return (
    <>
      <section style={{ background:'linear-gradient(160deg,#0a1d3a,#070F1F)', borderBottom:'1px solid rgba(249,115,22,0.15)', padding:'80px 0 60px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 5rem' }} className="areas-pad">
          <div className="eyebrow">Service Areas</div>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(2.8rem,5vw,4.5rem)', letterSpacing:'0.04em', color:'#F8F9FB', lineHeight:0.95, marginBottom:'1rem' }}>
            WE DELIVER ACROSS<br/><span style={{ color:'#F97316' }}>TAMIL NADU</span>
          </h1>
          <p className="s-desc">Select your city below to see delivery details, pricing and what we supply to your area.</p>
        </div>
      </section>

      <section style={{ padding:'56px 0' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 5rem' }} className="areas-pad">
          <div className="areas-grid">
            {CITIES.map(c => (
              <Link key={c.slug} href={`/areas/${c.slug}`} className="area-card">
                <div style={{ fontSize:36, marginBottom:12 }}>{c.emoji}</div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.6rem', letterSpacing:'0.04em', color:'#F8F9FB', marginBottom:4 }}>{c.name}</div>
                <div style={{ fontSize:12, color:'#F97316', fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.1em', marginBottom:8 }}>{c.dist} from Karur</div>
                <div style={{ fontSize:13, color:'#7A8EA8', lineHeight:1.6 }}>{c.desc}</div>
                <div style={{ marginTop:16, fontSize:12, color:'#F97316', fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.08em' }}>View Details →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .areas-pad { padding: 0 5rem; }
        .areas-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .area-card { background: rgba(25,55,109,0.35); border: 1px solid rgba(249,115,22,0.15); border-radius: 10px; padding: 28px 24px; text-decoration: none; display: block; transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s; }
        .area-card:hover { border-color: #F97316; transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.4); }
        @media(max-width:900px){ .areas-grid{grid-template-columns:repeat(2,1fr)!important} }
        @media(max-width:560px){ .areas-grid{grid-template-columns:1fr!important} .areas-pad{padding:0 1.5rem!important} }
      `}</style>
    </>
  );
}
