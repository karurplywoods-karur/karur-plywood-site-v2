import { CONTACT } from '@/lib/contact';
// src/app/contact/page.tsx
import { Metadata } from 'next';
import EnquiryForm from '@/components/EnquiryForm';
export const metadata: Metadata = { title: 'Contact Us | Karur Plywood & Company', description: 'Contact Karur Plywood & Company. WhatsApp, phone, email or visit our showroom. Get a free quote today.' };
const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999';
export default function ContactPage() {
  return (
    <>
      <section style={{ background:'linear-gradient(135deg,#1C140D,#161009)',borderBottom:'1px solid rgba(200,136,74,0.15)',padding:'70px 0',textAlign:'center' }}>
        <div style={{ maxWidth:600,margin:'0 auto',padding:'0 24px' }}>
          <div style={{ display:'inline-flex',alignItems:'center',gap:8,fontSize:11,fontWeight:600,letterSpacing:3,textTransform:'uppercase',color:'#C8884A',marginBottom:14 }}>
            <span style={{ width:24,height:1,background:'#C8884A',display:'inline-block' }}></span>Get In Touch
          </div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(40px,5vw,58px)',fontWeight:700,color:'#F0E8DC',lineHeight:1.1,marginBottom:12 }}>Contact <span style={{ color:'#E0A86A' }}>Us</span></h1>
          <p style={{ fontSize:16,color:'#9A8070' }}>We're here to help. Reach us on WhatsApp, phone, or visit our showroom in Karur.</p>
        </div>
      </section>

      <section style={{ padding:'80px 0' }}>
        <div style={{ maxWidth:1100,margin:'0 auto',padding:'0 48px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'start' }} className="contact-grid">
          <div>
            {/* WA card */}
            <a href={`https://wa.me/${WA}?text=Hi%2C+I+need+help+with+a+product+enquiry.`} target="_blank" rel="noopener"
              style={{ display:'flex',alignItems:'center',gap:12,background:'linear-gradient(135deg,#0D2B17,#091810)',border:'1px solid rgba(37,211,102,0.2)',borderRadius:16,padding:'18px 20px',marginBottom:20,textDecoration:'none' }}>
              <span style={{ fontSize:32 }}>💬</span>
              <div>
                <div style={{ fontWeight:700,fontSize:15,color:'#F0E8DC' }}>WhatsApp — Fastest Response</div>
                <div style={{ fontSize:12,color:'rgba(255,255,255,0.45)' }}>Send requirements and get a reply in minutes</div>
              </div>
            </a>
            <a href={`https://wa.me/${WA}?text=Hi%2C+I+need+help+with+a+product+enquiry.`} target="_blank" rel="noopener"
              style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8,width:'100%',padding:'13px 0',borderRadius:8,background:'#25D366',color:'white',fontWeight:700,fontSize:15,textDecoration:'none',marginBottom:32 }}>
              💬 Open WhatsApp Chat
            </a>

            {[['📞','Phone',CONTACT.phone,'Mon–Sat, 9 AM – 7 PM'],['📍','Address','Main Road, Karur, Tamil Nadu – 639 001','Near Main Bus Stand'],['⏰','Business Hours','Monday – Saturday: 9:00 AM – 7:00 PM','Sunday: Closed'],['📧','Email','info@karurplywood.com','']].map(([icon,label,value,sub]) => (
              <div key={label as string} style={{ display:'flex',gap:20,marginBottom:28 }}>
                <div style={{ width:52,height:52,background:'linear-gradient(135deg,rgba(200,136,74,0.15),rgba(139,94,42,0.08))',border:'1px solid rgba(200,136,74,0.3)',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0 }}>{icon}</div>
                <div>
                  <div style={{ fontSize:11,color:'#9A8070',textTransform:'uppercase',letterSpacing:1.5,fontWeight:600,marginBottom:4 }}>{label}</div>
                  <div style={{ fontSize:16,color:'#F0E8DC',fontWeight:500,lineHeight:1.5 }}>{value}</div>
                  {sub && <div style={{ fontSize:13,color:'#9A8070',marginTop:2 }}>{sub}</div>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:'#1C140D',border:'1px solid rgba(200,136,74,0.15)',borderRadius:24,padding:40 }}>
            <EnquiryForm />
          </div>
        </div>
      </section>
      <style>{`@media(max-width:900px){.contact-grid{grid-template-columns:1fr!important} div[style*="padding: 0 48px"]{padding:0 20px!important}}`}</style>
    </>
  );
}
