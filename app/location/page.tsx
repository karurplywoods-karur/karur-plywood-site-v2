import { CONTACT } from '@/lib/contact';
// src/app/location/page.tsx
import { Metadata } from 'next';
export const metadata: Metadata = { title: 'Location | Find Karur Plywood & Company in Karur, Tamil Nadu', description: 'Visit Karur Plywood & Company. Get directions, address, working hours. Serving Karur, Trichy, Namakkal & Erode.' };
const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999';
const GMAPS = process.env.NEXT_PUBLIC_GMAPS_EMBED_URL || '';
const AREAS = ['Karur','Trichy','Namakkal','Erode','Dindigul','Salem','Coimbatore'];
const HOURS = [['Monday','9:00 AM – 7:00 PM'],['Tuesday','9:00 AM – 7:00 PM'],['Wednesday','9:00 AM – 7:00 PM'],['Thursday','9:00 AM – 7:00 PM'],['Friday','9:00 AM – 7:00 PM'],['Saturday','9:00 AM – 7:00 PM'],['Sunday','Closed']];

export default function LocationPage() {
  return (
    <>
      <section style={{ background:'linear-gradient(135deg,#1C140D,#161009)',borderBottom:'1px solid rgba(200,136,74,0.15)',padding:'70px 0',textAlign:'center' }}>
        <div style={{ maxWidth:700,margin:'0 auto',padding:'0 24px' }}>
          <div style={{ display:'inline-flex',alignItems:'center',gap:8,fontSize:11,fontWeight:600,letterSpacing:3,textTransform:'uppercase',color:'#C8884A',marginBottom:14 }}>
            <span style={{ width:24,height:1,background:'#C8884A',display:'inline-block' }}></span>Find Our Showroom
          </div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(36px,5vw,56px)',fontWeight:700,color:'#F0E8DC',lineHeight:1.1,marginBottom:14 }}>
            We Are in <span style={{ color:'#E0A86A' }}>Karur, Tamil Nadu</span>
          </h1>
          <p style={{ fontSize:16,color:'#9A8070',marginBottom:28 }}>Serving Karur, Trichy, Namakkal, Erode and surrounding districts. Call before visiting or just walk in!</p>
          <div style={{ display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap' }}>
            <a href="https://maps.google.com/?q=Karur+Plywood+Company+Karur+Tamil+Nadu" target="_blank" rel="noopener"
              style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'13px 24px',borderRadius:8,background:'linear-gradient(135deg,#C8884A,#8B5E2A)',color:'white',fontWeight:700,fontSize:14,textDecoration:'none' }}>
              🗺️ Get Directions
            </a>
            <a href={`https://wa.me/${WA}?text=Hi%2C+I%27d+like+to+visit+your+showroom.+What+are+your+working+hours%3F`} target="_blank" rel="noopener"
              style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'13px 24px',borderRadius:8,background:'#25D366',color:'white',fontWeight:700,fontSize:14,textDecoration:'none' }}>
              💬 Chat Before Visiting
            </a>
          </div>
        </div>
      </section>

      <section style={{ padding:'72px 0' }}>
        <div style={{ maxWidth:1200,margin:'0 auto',padding:'0 48px' }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 340px',gap:32,alignItems:'start' }} className="loc-grid">
            {/* Map */}
            <div style={{ background:'#1C140D',border:'1px solid rgba(200,136,74,0.15)',borderRadius:20,overflow:'hidden',height:480 }}>
              {GMAPS ? (
                <iframe src={GMAPS} width="100%" height="480" style={{ border:0,display:'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
              ) : (
                <div style={{ height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,position:'relative' }}>
                  <div style={{ position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(200,136,74,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(200,136,74,0.04) 1px,transparent 1px)',backgroundSize:'40px 40px' }}/>
                  <div style={{ fontSize:56,position:'relative' }}>📍</div>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:'#F0E8DC',position:'relative',textAlign:'center' }}>Karur Plywood &amp; Company</div>
                  <div style={{ fontSize:14,color:'#9A8070',position:'relative',textAlign:'center' }}>Main Road, Karur, Tamil Nadu 639 001</div>
                  <a href="https://maps.google.com/?q=Karur+Tamil+Nadu" target="_blank" rel="noopener"
                    style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'12px 22px',borderRadius:8,background:'linear-gradient(135deg,#C8884A,#8B5E2A)',color:'white',fontWeight:700,fontSize:13,textDecoration:'none',position:'relative' }}>
                    🗺️ Open Google Maps
                  </a>
                  <div style={{ position:'absolute',bottom:16,right:16,fontSize:11,color:'#9A8070',background:'rgba(200,136,74,0.1)',borderRadius:6,padding:'4px 10px' }}>
                    Add NEXT_PUBLIC_GMAPS_EMBED_URL in .env.local
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
              <div style={{ background:'#1C140D',border:'1px solid rgba(200,136,74,0.15)',borderRadius:14,padding:24 }}>
                <div style={{ fontWeight:700,fontSize:14,color:'#F0E8DC',marginBottom:12 }}>📍 Address</div>
                <div style={{ fontSize:13,color:'#9A8070',lineHeight:1.9 }}>Karur Plywood and Company<br/>Main Road, Karur<br/>Tamil Nadu – 639 001<br/>India</div>
              </div>
              <div style={{ background:'#1C140D',border:'1px solid rgba(200,136,74,0.15)',borderRadius:14,padding:24 }}>
                <div style={{ fontWeight:700,fontSize:14,color:'#F0E8DC',marginBottom:14 }}>⏰ Business Hours</div>
                {HOURS.map(([day,time]) => (
                  <div key={day} style={{ display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(200,136,74,0.08)',fontSize:13 }}>
                    <span style={{ color:'#9A8070' }}>{day}</span>
                    <span style={{ color: day==='Sunday' ? '#9A8070' : '#C8B8A0', fontWeight: day==='Sunday'?400:500, opacity: day==='Sunday'?0.5:1 }}>{time}</span>
                  </div>
                ))}
              </div>
              <div style={{ background:'#1C140D',border:'1px solid rgba(200,136,74,0.15)',borderRadius:14,padding:24 }}>
                <div style={{ fontWeight:700,fontSize:14,color:'#F0E8DC',marginBottom:12 }}>📞 Contact</div>
                <div style={{ fontSize:13,color:'#9A8070',lineHeight:2 }}>
                  Phone: <strong style={{ color:'#F0E8DC' }}>{CONTACT.phone}</strong><br/>
                  WhatsApp: <strong style={{ color:'#25D366' }}>{CONTACT.phone}</strong><br/>
                  Email: info@karurplywood.com
                </div>
              </div>
              <div style={{ background:'#1C140D',border:'1px solid rgba(200,136,74,0.15)',borderRadius:14,padding:24 }}>
                <div style={{ fontWeight:700,fontSize:14,color:'#F0E8DC',marginBottom:12 }}>🗺️ Areas We Serve</div>
                <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
                  {AREAS.map(a => <span key={a} style={{ background:'rgba(200,136,74,0.08)',border:'1px solid rgba(200,136,74,0.15)',borderRadius:20,padding:'4px 12px',fontSize:12,color:'#C8884A',fontWeight:500 }}>{a}</span>)}
                </div>
              </div>
              <a href={`https://wa.me/${WA}?text=Hi%2C+I%27d+like+to+visit+your+showroom.`} target="_blank" rel="noopener"
                style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'13px 0',borderRadius:10,background:'#25D366',color:'white',fontWeight:700,fontSize:14,textDecoration:'none' }}>
                💬 Chat Before Visiting
              </a>
            </div>
          </div>
        </div>
      </section>
      <style>{`@media(max-width:900px){.loc-grid{grid-template-columns:1fr!important} div[style*="padding: 0 48px"]{padding:0 20px!important}}`}</style>
    </>
  );
}
