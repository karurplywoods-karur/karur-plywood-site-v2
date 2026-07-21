// src/app/solutions/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { CONTACT } from '@/lib/contact';

const SITE_URL = 'https://www.karurplywood.co.in';
const WA = CONTACT.wa;

export const metadata: Metadata = {
  title: 'Solutions | Karur Plywood & Company',
  description: 'End-to-end material solutions for kitchens, wardrobes, offices, commercial spaces and more from Karur Plywood & Company.',
  alternates: { canonical: `${SITE_URL}/solutions` },
};

const SOLUTIONS = [
  { key: 'modular-kitchen', icon: '🍽️', t: 'Modular Kitchen', d: 'Complete kitchen solutions with premium plywood, hardware & accessories.', img: '/images/solutions-modular-kitchen.jpg', href: '/products?category=plywood' },
  { key: 'wardrobe-storage', icon: '🚪', t: 'Wardrobe & Storage', d: 'Smart storage solutions with elegant finishes and space optimization.', img: '/images/solutions-wardrobe-storage.jpg', href: '/products?category=plywood' },
  { key: 'tv-units-living', icon: '📺', t: 'TV Units & Living Room', d: 'Stylish TV units and living room furniture for modern homes.', img: '/images/solutions-tv-units-living.jpg', href: '/products?category=laminates' },
  { key: 'bedroom-solutions', icon: '🛏️', t: 'Bedroom Solutions', d: 'Complete bedroom furniture and storage solutions for your comfort.', img: '/images/solutions-bedroom-solutions.jpg', href: '/products?category=plywood' },
  { key: 'office-workspaces', icon: '🖥️', t: 'Office & Workspaces', d: 'Functional and aesthetic solutions for productive work environments.', img: '/images/solutions-office-workspaces.jpg', href: '/products?category=hardware' },
  { key: 'commercial-spaces', icon: '🏢', t: 'Commercial Spaces', d: 'Durable and reliable materials for offices, shops and commercial projects.', img: '/images/solutions-commercial-spaces.jpg', href: '/products' },
  { key: 'bus-body-builders', icon: '🚌', t: 'Bus Body Builders', d: 'Specialized materials for bus body building and interiors.', img: '/images/solutions-bus-body-builders.jpg', href: '/products?category=plywood' },
  { key: 'renovation-projects', icon: '🛠️', t: 'Renovation Projects', d: 'Upgrade and remodel with the best materials and expert support.', img: '/images/solutions-renovation-projects.jpg', href: '/bom-quote' },
];

export default function SolutionsPage() {
  return (
    <div style={{ background: '#FAF8F5', paddingTop: 58, minHeight: '100vh' }}>

      {/* Hero */}
      <section className="sol-hero">
        <div className="sol-hero-overlay" />
        <Image src="/images/solutions-hero.jpg" alt="Interior solutions" fill style={{ objectFit: 'cover' }} priority />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px', position: 'relative', zIndex: 2 }} className="sol-pad">
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Home</Link> › <span style={{ color: '#FF9A45' }}>Solutions</span>
          </div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(1.8rem,3.6vw,2.6rem)', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1, marginBottom: 14, maxWidth: 500 }}>
            Complete Solutions For Every Space
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', maxWidth: 460, marginBottom: 24 }}>
            From homes to commercial spaces, we provide end-to-end material solutions to bring your vision to life.
          </p>
          <div className="sol-highlights">
            {['End-to-End Solutions', 'Premium Materials', 'Expert Guidance', 'Timely Delivery'].map(h => (
              <div key={h} className="sol-highlight"><span>✓</span>{h}</div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 48px 60px' }} className="sol-pad">
        <div className="sol-layout">
          <div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: '1.3rem', fontWeight: 700, color: '#0B2447', marginBottom: 20 }}>Explore Solutions</h2>
            <div className="sol-grid">
              {SOLUTIONS.map(s => (
                <Link key={s.key} href={s.href} className="sol-card">
                  <div className="sol-card-img">
                    <Image src={s.img} alt={s.t} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 25vw" />
                    <span className="sol-card-icon">{s.icon}</span>
                  </div>
                  <div style={{ padding: '14px 16px 18px' }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: '#0B2447', marginBottom: 6 }}>{s.t}</div>
                    <div style={{ fontSize: 12.5, color: '#6B7280', lineHeight: 1.5, marginBottom: 10 }}>{s.d}</div>
                    <span style={{ fontSize: 12, color: '#F07316', fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>Explore →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside>
            <div className="sol-sb-card" style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: '#0B2447', marginBottom: 12 }}>Why Choose Our Solutions?</div>
              {['Wide range of premium materials', 'Customized solutions for every need', 'Expert advice and consultation', 'Competitive pricing', 'Reliable delivery across Tamil Nadu'].map(t => (
                <div key={t} style={{ display: 'flex', gap: 8, fontSize: 12.5, color: '#4B5563', marginBottom: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: '#16a34a', flexShrink: 0 }}>✓</span>{t}
                </div>
              ))}
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener" className="sol-btn-outline" style={{ marginTop: 8 }}>🎧 Talk to Our Expert</a>
            </div>

            <div className="sol-custom-card" style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: '#0B2447', marginBottom: 6 }}>Need a Custom Solution?</div>
              <div style={{ fontSize: 12.5, color: '#4B5563', marginBottom: 12 }}>Share your requirements and our experts will help you with the best solution.</div>
              <a href={`https://wa.me/${WA}?text=Hi%2C+I%27d+like+a+custom+solution+consultation.`} target="_blank" rel="noopener" className="sol-btn-primary">💬 Get a Free Consultation →</a>
            </div>

            <div className="sol-bom-card">
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: '#0B2447', marginBottom: 6 }}>Have a Project in Mind?</div>
              <div style={{ fontSize: 12.5, color: '#4B5563', marginBottom: 12 }}>Upload your project details and we&apos;ll suggest the right materials for you.</div>
              <Link href="/bom-quote" className="sol-btn-outline">📤 Upload Project Details →</Link>
            </div>
          </aside>
        </div>

        {/* Stats strip */}
        <div className="sol-stats">
          {[
            ['5000+', 'Happy Customers'],
            ['40+', 'Trusted Brands'],
            ['10000+', 'Products'],
            ['25+', 'Years of Excellence'],
          ].map(([n, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.6rem', color: '#0B2447' }}>{n}</div>
              <div style={{ fontSize: 11.5, color: '#6B7280' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .sol-hero { position: relative; padding: 44px 0 40px; overflow: hidden; }
        .sol-hero-overlay { position: absolute; inset: 0; background: linear-gradient(100deg, rgba(11,36,71,0.88) 0%, rgba(11,36,71,0.6) 55%, rgba(11,36,71,0.25) 100%); z-index: 1; }
        .sol-highlights { display: flex; gap: 20px; flex-wrap: wrap; }
        .sol-highlight { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #FFFFFF; font-family: 'Syne',sans-serif; font-weight: 600; }
        .sol-highlight span { color: #FF9A45; }
        .sol-layout { display: grid; grid-template-columns: 1fr 280px; gap: 24px; align-items: start; }
        .sol-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .sol-card { display: block; background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; overflow: hidden; text-decoration: none; transition: all .2s; }
        .sol-card:hover { transform: translateY(-4px); box-shadow: 0 14px 30px rgba(11,36,71,0.1); border-color: rgba(240,115,22,0.35); }
        .sol-card-img { position: relative; aspect-ratio: 4/3; background: #F2EDE5; }
        .sol-card-icon { position: absolute; bottom: -14px; left: 14px; width: 34px; height: 34px; background: #F07316; color: #FFFFFF; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        .sol-sb-card, .sol-custom-card, .sol-bom-card { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; padding: 18px; box-shadow: 0 1px 4px rgba(11,36,71,0.05); }
        .sol-custom-card { background: #f0fdf4; border-color: #bbf7d0; }
        .sol-bom-card { background: #FFF4ED; border-color: rgba(240,115,22,0.25); }
        .sol-btn-primary { display: inline-flex; align-items: center; padding: 9px 16px; background: #16a34a; color: #FFFFFF; border-radius: 6px; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 12px; text-decoration: none; }
        .sol-btn-outline { display: inline-flex; align-items: center; padding: 9px 16px; border: 1px solid #E5E1DC; color: #0B2447; border-radius: 6px; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 12px; text-decoration: none; background: #FFFFFF; }
        .sol-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; padding: 20px; margin-top: 36px; }
        @media(max-width:1100px){ .sol-grid { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:900px){ .sol-layout { grid-template-columns: 1fr !important; } }
        @media(max-width:640px){ .sol-pad { padding-left:16px !important; padding-right:16px !important; } .sol-grid { grid-template-columns: 1fr !important; } .sol-stats { grid-template-columns: 1fr 1fr; } }
      `}</style>
    </div>
  );
}
