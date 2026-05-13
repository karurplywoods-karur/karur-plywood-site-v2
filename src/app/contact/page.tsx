// src/app/contact/page.tsx — FIXED: clickable phone/email, real address
import { Metadata } from 'next';
import EnquiryForm from '@/components/EnquiryForm';
import { CONTACT } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Contact Us | Karur Plywood & Company — Call or WhatsApp',
  description: 'Contact Karur Plywood & Company. Call +91 91566 66538, WhatsApp, or visit our showroom at Covai Main Road, Reddipalayam, Karur. Get a free quote today.',
};

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919159666538';

const HOURS = [
  ['Monday', '9:30 AM – 7:30 PM'],
  ['Tuesday', '9:30 AM – 7:30 PM'],
  ['Wednesday', '9:30 AM – 7:30 PM'],
  ['Thursday', '9:30 AM – 7:30 PM'],
  ['Friday', '9:30 AM – 7:30 PM'],
  ['Saturday', '9:30 AM – 7:30 PM'],
  ['Sunday', 'Closed'],
];

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg,#0a1d3a,#070F1F)',
        borderBottom: '1px solid rgba(249,115,22,0.15)',
        padding: 'calc(58px + 64px) 0 56px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:11, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#F97316', marginBottom:16, fontFamily:"'Syne',sans-serif" }}>
            <span style={{ width:20, height:1, background:'#F97316', display:'inline-block' }}/>
            Get In Touch
            <span style={{ width:20, height:1, background:'#F97316', display:'inline-block' }}/>
          </div>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(3rem,6vw,5rem)', letterSpacing:'0.04em', color:'#F8F9FB', lineHeight:0.95, marginBottom:16 }}>
            CONTACT <span style={{ color:'#F97316' }}>US</span>
          </h1>
          <p style={{ fontSize:15, color:'#7A8EA8', lineHeight:1.8, fontWeight:300 }}>
            We&apos;re here to help. Reach us on WhatsApp, phone, or visit our showroom in Karur.
          </p>
        </div>
      </section>

      <section style={{ padding:'72px 0' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 48px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'start' }} className="contact-grid">

          {/* Left: contact details */}
          <div>
            {/* WhatsApp — primary CTA */}
            <a
              href={`https://wa.me/${WA}?text=Hi%2C+I+need+help+with+a+product+enquiry.`}
              target="_blank" rel="noopener"
              style={{ display:'flex', alignItems:'center', gap:14, background:'linear-gradient(135deg,rgba(13,43,23,0.9),rgba(9,24,16,0.9))', border:'1px solid rgba(37,211,102,0.25)', borderRadius:12, padding:'18px 20px', marginBottom:16, textDecoration:'none', transition:'all 0.2s' }}
              className="wa-hover-card"
            >
              <div style={{ width:50, height:50, background:'#25D366', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:24 }}>💬</div>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:'#F8F9FB', marginBottom:3 }}>WhatsApp — Fastest Response</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.6 }}>Send your requirements and get a reply within minutes</div>
              </div>
            </a>

            <a
              href={`https://wa.me/${WA}?text=Hi%2C+I+need+help+with+a+product+enquiry.`}
              target="_blank" rel="noopener"
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'13px 0', borderRadius:8, background:'#25D366', color:'white', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, letterSpacing:'0.08em', textTransform:'uppercase', textDecoration:'none', marginBottom:32, transition:'background 0.2s' }}
            >
              💬 Open WhatsApp Chat
            </a>

            <div style={{ display:'flex', flexDirection:'column', gap:22 }}>
              {/* Phone — FIXED: real number + clickable */}
              <div style={{ display:'flex', gap:18, alignItems:'flex-start' }}>
                <div style={{ width:48, height:48, background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>📞</div>
                <div>
                  <div style={{ fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#7A8EA8', marginBottom:4 }}>Phone</div>
                  {/* FIXED: real number, clickable tel: link */}
                  <a href={`tel:${CONTACT.phoneRaw}`} style={{ fontSize:17, color:'#F8F9FB', fontWeight:600, textDecoration:'none', fontFamily:"'Syne',sans-serif", display:'block', marginBottom:2, transition:'color 0.2s' }} className="contact-link">
                    {CONTACT.phone}
                  </a>
                  <div style={{ fontSize:12, color:'#7A8EA8' }}>Tap to call directly</div>
                </div>
              </div>

              {/* Address — FIXED: real address */}
              <div style={{ display:'flex', gap:18, alignItems:'flex-start' }}>
                <div style={{ width:48, height:48, background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>📍</div>
                <div>
                  <div style={{ fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#7A8EA8', marginBottom:4 }}>Address</div>
                  <div style={{ fontSize:15, color:'#F8F9FB', fontWeight:500, lineHeight:1.6 }}>
                    Covai Main Road, Reddipalayam<br />
                    Karur, Tamil Nadu – 639 008
                  </div>
                  <a
                    href="https://maps.google.com/?q=Karur+Plywood+Company+Karur+Tamil+Nadu"
                    target="_blank" rel="noopener"
                    style={{ fontSize:12, color:'#F97316', fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.06em', textDecoration:'none', display:'inline-block', marginTop:6 }}
                  >
                    🗺️ Get Directions →
                  </a>
                </div>
              </div>

              {/* Email — FIXED: real email + clickable */}
              <div style={{ display:'flex', gap:18, alignItems:'flex-start' }}>
                <div style={{ width:48, height:48, background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>✉️</div>
                <div>
                  <div style={{ fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#7A8EA8', marginBottom:4 }}>Email</div>
                  {/* FIXED: real email, clickable mailto: link */}
                  <a href={`mailto:${CONTACT.email}`} style={{ fontSize:15, color:'#F8F9FB', fontWeight:500, textDecoration:'none', transition:'color 0.2s' }} className="contact-link">
                    {CONTACT.email}
                  </a>
                  <div style={{ fontSize:12, color:'#7A8EA8', marginTop:2 }}>We reply within a few hours</div>
                </div>
              </div>

              {/* Hours */}
              <div style={{ display:'flex', gap:18, alignItems:'flex-start' }}>
                <div style={{ width:48, height:48, background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>⏰</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#7A8EA8', marginBottom:10 }}>Business Hours</div>
                  <div style={{ background:'rgba(25,55,109,0.3)', border:'1px solid rgba(249,115,22,0.1)', borderRadius:8, overflow:'hidden' }}>
                    {HOURS.map(([day, time]) => (
                      <div key={day} style={{ display:'flex', justifyContent:'space-between', padding:'8px 14px', borderBottom:'1px solid rgba(249,115,22,0.06)', fontSize:13 }}>
                        <span style={{ color:'#7A8EA8' }}>{day}</span>
                        <span style={{
                          color: day === 'Sunday' ? '#7A8EA8' : '#F8F9FB',
                          fontWeight: day === 'Sunday' ? 400 : 500,
                          opacity: day === 'Sunday' ? 0.5 : 1,
                          fontFamily: day !== 'Sunday' ? "'Syne',sans-serif" : 'inherit',
                        }}>{time}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize:12, color:'#7A8EA8', marginTop:8 }}>
                    💡 For urgent orders after hours, <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener" style={{ color:'#25D366', textDecoration:'none' }}>WhatsApp us anytime</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: enquiry form */}
          <div style={{ background:'rgba(25,55,109,0.25)', border:'1px solid rgba(249,115,22,0.15)', borderRadius:20, padding:36 }}>
            <EnquiryForm />
          </div>
        </div>
      </section>

      {/* Map section */}
      <section style={{ padding:'0 0 72px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 48px' }} className="contact-map-pad">
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'0.62rem', letterSpacing:'0.22em', textTransform:'uppercase', color:'#F97316', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ width:20, height:1, background:'#F97316' }}/>
            Visit Our Store
          </div>
          <div style={{ background:'rgba(25,55,109,0.25)', border:'1px solid rgba(249,115,22,0.15)', borderRadius:16, overflow:'hidden', height:360 }}>
            {process.env.NEXT_PUBLIC_GMAPS_EMBED_URL ? (
              <iframe
                src={process.env.NEXT_PUBLIC_GMAPS_EMBED_URL}
                width="100%" height="360"
                style={{ border:0, display:'block' }}
                allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, background:'linear-gradient(135deg,#0d1f3a,#19376D)', position:'relative' }}>
                <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(249,115,22,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.04) 1px,transparent 1px)', backgroundSize:'40px 40px' }}/>
                <div style={{ fontSize:52, position:'relative' }}>📍</div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:'0.04em', color:'#F8F9FB', position:'relative', textAlign:'center' }}>Karur Plywood &amp; Company</div>
                <div style={{ fontSize:14, color:'#7A8EA8', position:'relative', textAlign:'center' }}>Covai Main Road, Reddipalayam, Karur – 639 008</div>
                <a
                  href="https://maps.google.com/?q=Karur+Plywood+Company+Covai+Main+Road+Reddipalayam+Karur"
                  target="_blank" rel="noopener"
                  style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 22px', borderRadius:6, background:'#F97316', color:'#0B2447', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, letterSpacing:'0.08em', textTransform:'uppercase', textDecoration:'none', position:'relative' }}>
                  🗺️ Open Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      <style>{`
        .contact-link:hover { color: #F97316 !important; }
        .wa-hover-card:hover { border-color: rgba(37,211,102,0.45) !important; transform: translateY(-2px); }
        @media(max-width:900px){
          .contact-grid { grid-template-columns: 1fr !important; }
          .contact-grid > div, .contact-map-pad { padding: 0 20px !important; }
        }
      `}</style>
    </>
  );
}
