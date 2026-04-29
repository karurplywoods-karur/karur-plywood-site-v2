'use client';
// src/app/admin/page.tsx  — Login page
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async () => {
    if (!pw.trim()) { setErr('Please enter the password.'); return; }
    setLoading(true); setErr('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      router.push('/admin/dashboard');
    } else {
      setErr('Incorrect password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh',background:'#0E0B08',display:'flex',alignItems:'center',justifyContent:'center',padding:24 }}>
      <div style={{ width:'100%',maxWidth:400 }}>
        {/* Logo */}
        <div style={{ textAlign:'center',marginBottom:40 }}>
          <div style={{ width:60,height:60,background:'linear-gradient(135deg,#C8884A,#8B5E2A)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,margin:'0 auto 16px' }}>🪵</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:'#F0E8DC' }}>Admin Dashboard</div>
          <div style={{ fontSize:13,color:'#9A8070',marginTop:4 }}>Karur Plywood &amp; Company</div>
        </div>

        <div style={{ background:'#1C140D',border:'1px solid rgba(200,136,74,0.15)',borderRadius:20,padding:36 }}>
          <div style={{ fontSize:14,fontWeight:600,color:'#9A8070',textTransform:'uppercase',letterSpacing:1,marginBottom:8 }}>Password</div>
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="Enter admin password"
            style={{ width:'100%',background:'#0E0B08',border:'1px solid rgba(200,136,74,0.2)',borderRadius:8,padding:'12px 16px',fontSize:15,color:'#F0E8DC',fontFamily:'Outfit,sans-serif',outline:'none',marginBottom:16 }}
          />
          {err && <div style={{ color:'#F87171',fontSize:13,marginBottom:12 }}>{err}</div>}
          <button onClick={login} disabled={loading}
            style={{ width:'100%',background:loading?'#5c4a2e':'linear-gradient(135deg,#C8884A,#8B5E2A)',color:'white',border:'none',borderRadius:8,padding:'13px 0',fontWeight:700,fontSize:15,cursor:loading?'default':'pointer',fontFamily:'Outfit,sans-serif' }}>
            {loading ? '⏳ Signing in...' : '🔐 Sign In'}
          </button>
          <div style={{ textAlign:'center',marginTop:20,fontSize:12,color:'#9A8070' }}>
            Default password: <code style={{ color:'#C8884A',background:'rgba(200,136,74,0.1)',padding:'2px 6px',borderRadius:4 }}>karurplywood2025</code>
          </div>
        </div>
        <div style={{ textAlign:'center',marginTop:20 }}>
          <a href="/" style={{ fontSize:13,color:'#9A8070',textDecoration:'none' }}>← Back to Website</a>
        </div>
      </div>
      <style>{`input:focus{border-color:#C8884A!important}`}</style>
    </div>
  );
}
