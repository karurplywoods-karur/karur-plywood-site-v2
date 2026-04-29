// src/app/areas/[city]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CONTACT } from '@/lib/contact';
import Link from 'next/link';

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999';

// All supported cities with SEO data
const CITIES: Record<string, {
  name: string; state: string; distance: string;
  tagline: string; description: string;
  keywords: string[]; landmarks: string[];
  stats: { label: string; value: string }[];
}> = {
  'karur': {
    name: 'Karur', state: 'Tamil Nadu', distance: '0 km',
    tagline: 'Karur\'s Most Trusted Plywood & Hardware Store',
    description: 'Karur Plywood and Company is located in the heart of Karur. Walk into our showroom and browse the widest selection of plywood, doors, laminates and hardware in the district. Same-day delivery available within Karur city.',
    keywords: ['plywood shop Karur','plywood dealer Karur','hardware store Karur','doors laminates Karur','BWR plywood Karur','plywood price Karur'],
    landmarks: ['Near Karur Bus Stand', 'Main Road', 'Central Karur'],
    stats: [{ label:'Distance', value:'In Karur' },{ label:'Delivery', value:'Same Day' },{ label:'Experience', value:'25+ Years' },{ label:'Products', value:'500+' }],
  },
  'trichy': {
    name: 'Trichy', state: 'Tamil Nadu', distance: '50 km',
    tagline: 'Premium Plywood & Hardware Delivery to Trichy',
    description: 'Serving customers in Trichy (Tiruchirappalli) with quality plywood, doors, laminates and hardware. We deliver bulk and retail orders to Trichy within 24 hours. Get the same quality you expect from Karur\'s most trusted dealer — delivered to your site.',
    keywords: ['plywood supplier Trichy','plywood delivery Trichy','hardware Trichy','BWR plywood Trichy','laminates Trichy','doors Trichy'],
    landmarks: ['Srirangam', 'Ariyamangalam', 'Thillai Nagar', 'K K Nagar', 'Woraiyur'],
    stats: [{ label:'Distance', value:'~50 km' },{ label:'Delivery', value:'Within 24 hrs' },{ label:'Min Order', value:'₹5,000' },{ label:'Brands', value:'20+' }],
  },
  'namakkal': {
    name: 'Namakkal', state: 'Tamil Nadu', distance: '45 km',
    tagline: 'Quality Plywood & Laminates for Namakkal Builders',
    description: 'Namakkal builders, contractors and carpenters trust Karur Plywood for consistent quality. We supply BWR and MR grade plywood, decorative laminates, flush doors and hardware to Namakkal on a regular basis. Wholesale pricing for bulk orders.',
    keywords: ['plywood supplier Namakkal','hardware Namakkal','laminates Namakkal','BWR plywood Namakkal','flush doors Namakkal','plywood price Namakkal'],
    landmarks: ['Namakkal Town', 'Rasipuram', 'Tiruchengode', 'Kumarapalayam'],
    stats: [{ label:'Distance', value:'~45 km' },{ label:'Delivery', value:'Within 24 hrs' },{ label:'Wholesale', value:'Available' },{ label:'Experience', value:'25+ Years' }],
  },
  'erode': {
    name: 'Erode', state: 'Tamil Nadu', distance: '75 km',
    tagline: 'Plywood & Hardware Supply to Erode — Wholesale Rates',
    description: 'Karur Plywood supplies quality plywood, doors and hardware to Erode contractors and builders. Competitive wholesale pricing, ISI-certified products and reliable delivery. WhatsApp us your requirement and we\'ll arrange delivery.',
    keywords: ['plywood supplier Erode','hardware store Erode','BWR plywood Erode','doors Erode','laminates Erode','plywood delivery Erode'],
    landmarks: ['Erode Town', 'Bhavani', 'Gobichettipalayam', 'Perundurai'],
    stats: [{ label:'Distance', value:'~75 km' },{ label:'Delivery', value:'1-2 Days' },{ label:'Wholesale', value:'Available' },{ label:'Min Order', value:'₹10,000' }],
  },
  'salem': {
    name: 'Salem', state: 'Tamil Nadu', distance: '80 km',
    tagline: 'Premium Plywood Delivery to Salem from Karur',
    description: 'We supply quality plywood, laminates and doors to Salem customers. Whether you\'re a homeowner, contractor or interior designer in Salem, Karur Plywood offers the best quality at fair prices with reliable delivery.',
    keywords: ['plywood supplier Salem','laminates Salem','hardware Salem','BWR plywood Salem','doors Salem','plywood dealer Salem Tamil Nadu'],
    landmarks: ['Salem Town', 'Fairlands', 'Attur', 'Mettur', 'Omalur'],
    stats: [{ label:'Distance', value:'~80 km' },{ label:'Delivery', value:'1-2 Days' },{ label:'Products', value:'500+' },{ label:'Brands', value:'20+' }],
  },
  'dindigul': {
    name: 'Dindigul', state: 'Tamil Nadu', distance: '90 km',
    tagline: 'Plywood & Hardware Supply to Dindigul',
    description: 'Karur Plywood serves Dindigul customers with wholesale and retail supply of plywood, doors, laminates and hardware. Contact us on WhatsApp with your requirements for a quick quote and delivery arrangement.',
    keywords: ['plywood supplier Dindigul','hardware Dindigul','BWR plywood Dindigul','doors Dindigul','laminates Dindigul'],
    landmarks: ['Dindigul Town', 'Palani', 'Natham', 'Oddanchatram'],
    stats: [{ label:'Distance', value:'~90 km' },{ label:'Delivery', value:'1-2 Days' },{ label:'Wholesale', value:'Available' },{ label:'Min Order', value:'₹10,000' }],
  },
};

export async function generateStaticParams() {
  return Object.keys(CITIES).map(city => ({ city }));
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const city = CITIES[params.city.toLowerCase()];
  if (!city) return { title: 'Not Found' };
  return {
    title: `Plywood Dealer in ${city.name}, Tamil Nadu | Karur Plywood & Company`,
    description: `Buy quality plywood, doors, laminates and hardware in ${city.name}. ISI certified. Wholesale & retail. ${city.description.slice(0, 120)}...`,
    keywords: city.keywords,
    openGraph: {
      title: `${city.tagline} | Karur Plywood`,
      description: city.description,
    },
    alternates: {
      canonical: `https://karurplywood.com/areas/${params.city}`,
    },
  };
}

const PRODUCTS = [
  { name:'Plywood', desc:'BWR, MR, Commercial & Marine grades', emoji:'🪵', link:'/products?category=plywood' },
  { name:'Doors', desc:'Flush, Moulded, Panel & PVC doors', emoji:'🚪', link:'/products?category=doors' },
  { name:'Laminates', desc:'100+ designs — gloss, matt, wood texture', emoji:'🎨', link:'/products?category=laminates' },
  { name:'Hardware', desc:'Hinges, handles, locks, drawer channels', emoji:'🔩', link:'/products?category=hardware' },
];

export default function CityLandingPage({ params }: { params: { city: string } }) {
  const cityKey = params.city.toLowerCase();
  const city = CITIES[cityKey];
  if (!city) notFound();

  const waText = encodeURIComponent(`Hi, I'm from ${city.name} and need plywood and hardware. Can you help with delivery?`);

  return (
    <>
      {/* Hero */}
      <section style={{ minHeight:'60vh', display:'flex', alignItems:'center', background:'linear-gradient(160deg,#0a1d3a 0%,#070F1F 100%)', borderBottom:'1px solid rgba(249,115,22,0.15)', padding:'100px 0 60px', position:'relative', overflow:'hidden' }}>
        {/* Grid lines */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(249,115,22,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.04) 1px,transparent 1px)', backgroundSize:'60px 60px', pointerEvents:'none' }}/>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 5rem', position:'relative', zIndex:2 }} className="city-pad">
          {/* Breadcrumb */}
          <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#7A8EA8', marginBottom:24 }}>
            <Link href="/" style={{ color:'#7A8EA8', textDecoration:'none' }}>Home</Link>
            <span>›</span>
            <Link href="/location" style={{ color:'#7A8EA8', textDecoration:'none' }}>Areas</Link>
            <span>›</span>
            <span style={{ color:'#F97316' }}>{city.name}</span>
          </div>

          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.3)', borderRadius:100, padding:'4px 16px', fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'#F97316', marginBottom:24 }}>
            <span style={{ width:6, height:6, background:'#F97316', borderRadius:'50%', animation:'blink 1.4s infinite', display:'inline-block' }}/>
            Serving {city.name}, {city.state}
          </div>

          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(2.8rem,5.5vw,5rem)', letterSpacing:'0.03em', color:'#F8F9FB', lineHeight:0.95, marginBottom:'1.2rem' }}>
            PLYWOOD &amp; HARDWARE<br/>
            <span style={{ color:'#F97316' }}>IN {city.name.toUpperCase()}</span>
          </h1>
          <p style={{ fontSize:'1rem', color:'#7A8EA8', lineHeight:1.75, maxWidth:520, marginBottom:'2.5rem', fontWeight:300 }}>
            {city.description}
          </p>

          <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:'3rem' }}>
            <a href={`https://wa.me/${WA}?text=${waText}`} target="_blank" rel="noopener" className="btn-p">
              💬 Get Quote for {city.name}
            </a>
            <a href={`tel:${CONTACT.phoneRaw}`} className="btn-s">📞 Call Now</a>
          </div>

          {/* Stats row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0, border:'1px solid rgba(249,115,22,0.15)', borderRadius:8, overflow:'hidden' }} className="city-stats">
            {city.stats.map((s, i) => (
              <div key={i} style={{ padding:'1.2rem 1.5rem', borderRight: i < city.stats.length - 1 ? '1px solid rgba(249,115,22,0.15)' : 'none', background:'rgba(25,55,109,0.25)' }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.8rem', letterSpacing:'0.04em', color:'#F97316', lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:'0.68rem', fontFamily:"'Syne',sans-serif", fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'#7A8EA8', marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products we supply */}
      <section style={{ padding:'64px 0', background:'#070F1F' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 5rem' }} className="city-pad">
          <div className="eyebrow">Products Available in {city.name}</div>
          <h2 className="s-title" style={{ marginBottom:'2.5rem' }}>WHAT WE SUPPLY TO {city.name.toUpperCase()}</h2>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:48 }} className="city-prod-grid">
            {PRODUCTS.map(p => (
              <Link key={p.name} href={p.link} style={{ background:'rgba(25,55,109,0.35)', border:'1px solid rgba(249,115,22,0.15)', borderRadius:8, padding:'1.5rem 1.25rem', textDecoration:'none', display:'block', transition:'border-color 0.25s,transform 0.25s' }} className="city-prod-card">
                <div style={{ fontSize:36, marginBottom:12 }}>{p.emoji}</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'0.95rem', color:'#F8F9FB', marginBottom:6 }}>{p.name}</div>
                <div style={{ fontSize:'0.75rem', color:'#7A8EA8', lineHeight:1.6 }}>{p.desc}</div>
              </Link>
            ))}
          </div>

          {/* Landmarks served */}
          <div style={{ background:'rgba(25,55,109,0.25)', border:'1px solid rgba(249,115,22,0.12)', borderRadius:8, padding:'1.5rem 2rem', marginBottom:48 }}>
            <div style={{ fontSize:'0.68rem', fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#F97316', marginBottom:12 }}>
              Areas in {city.name} We Serve
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {city.landmarks.map(l => (
                <span key={l} style={{ background:'rgba(249,115,22,0.08)', border:'1px solid rgba(249,115,22,0.2)', borderRadius:2, padding:'4px 12px', fontSize:'0.75rem', fontFamily:"'Syne',sans-serif", fontWeight:600, color:'#F97316', letterSpacing:'0.06em' }}>{l}</span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }} className="city-cta-grid">
            <div style={{ background:'linear-gradient(135deg,#0D2B17,#091810)', border:'1px solid rgba(37,211,102,0.2)', borderRadius:8, padding:'2rem' }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.5rem', letterSpacing:'0.05em', color:'#F8F9FB', marginBottom:8 }}>ORDER ON WHATSAPP</div>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.55)', lineHeight:1.7, marginBottom:16 }}>
                Send us your material list. We&apos;ll quote, confirm and arrange delivery to {city.name}.
              </p>
              <a href={`https://wa.me/${WA}?text=${waText}`} target="_blank" rel="noopener" className="btn-wa">💬 Chat on WhatsApp</a>
            </div>
            <div style={{ background:'rgba(25,55,109,0.35)', border:'1px solid rgba(249,115,22,0.15)', borderRadius:8, padding:'2rem' }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.5rem', letterSpacing:'0.05em', color:'#F8F9FB', marginBottom:8 }}>VISIT OUR SHOWROOM</div>
              <p style={{ fontSize:13, color:'#7A8EA8', lineHeight:1.7, marginBottom:16 }}>
                We&apos;re located in Karur ({city.distance} from {city.name}). See and touch the products before buying.
              </p>
              <Link href="/location" className="btn-s" style={{ display:'inline-flex' }}>📍 Get Directions</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Nearby cities */}
      <section style={{ padding:'48px 0', background:'rgba(11,36,71,0.3)', borderTop:'1px solid rgba(249,115,22,0.1)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 5rem' }} className="city-pad">
          <div style={{ fontSize:'0.68rem', fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#7A8EA8', marginBottom:16 }}>Also serving nearby areas</div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {Object.entries(CITIES)
              .filter(([key]) => key !== cityKey)
              .map(([key, c]) => (
                <Link key={key} href={`/areas/${key}`}
                  style={{ fontSize:'0.78rem', fontFamily:"'Syne',sans-serif", fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'#7A8EA8', border:'1px solid rgba(255,255,255,0.1)', borderRadius:2, padding:'6px 14px', textDecoration:'none', transition:'color 0.2s,border-color 0.2s' }}
                  className="city-nearby-link">
                  {c.name}
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* JSON-LD for local area */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Karur Plywood and Company',
        description: city.description,
        url: `https://karurplywood.com/areas/${cityKey}`,
        areaServed: { '@type': 'City', name: city.name, containedIn: { '@type': 'State', name: 'Tamil Nadu' } },
        telephone: CONTACT.phoneRaw,
        address: { '@type': 'PostalAddress', addressLocality: 'Karur', addressRegion: 'Tamil Nadu', addressCountry: 'IN' },
      })}} />

      <style>{`
        .city-pad { padding: 0 5rem; }
        .city-prod-card:hover { border-color: #F97316 !important; transform: translateY(-3px); }
        .city-nearby-link:hover { color: #F97316 !important; border-color: rgba(249,115,22,0.3) !important; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.15} }
        @media(max-width:1024px){
          .city-stats { grid-template-columns: repeat(2,1fr) !important; }
          .city-prod-grid { grid-template-columns: repeat(2,1fr) !important; }
          .city-cta-grid { grid-template-columns: 1fr !important; }
        }
        @media(max-width:640px){
          .city-pad { padding: 0 1.5rem !important; }
          .city-stats { grid-template-columns: repeat(2,1fr) !important; }
          .city-prod-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
