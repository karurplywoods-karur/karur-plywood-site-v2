'use client';
// src/app/auth/register/page.tsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/auth-client';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '', confirm: '',
    account_type: '', business_type: '', agree: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agree) { setError('Please agree to the Terms of Service and Privacy Policy.'); return; }
    if (!form.account_type) { setError('Please select an account type.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name, phone: form.phone },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) { setError(error.message); setLoading(false); return; }

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await fetch('/api/customer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: form.full_name, phone: form.phone, account_type: form.account_type, business_type: form.business_type || null }),
      });
      router.push('/account');
      router.refresh();
    } else {
      setDone(true);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } });
  };

  if (done) return (
    <div style={{ minHeight: '100vh', background: '#FAF8F5', paddingTop: 58, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
      <div style={{ maxWidth: 440, width: '100%', background: '#FFFFFF', border: '1px solid #E5E1DC', borderRadius: 14, padding: '40px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
        <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: '1.3rem', fontWeight: 700, color: '#0B2447', marginBottom: 10 }}>Check your email</h2>
        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>We sent a confirmation link to <strong style={{ color: '#F07316' }}>{form.email}</strong>. Click it to activate your account.</p>
        <Link href="/auth/login" style={{ display: 'block', marginTop: 20, padding: '13px 0', background: '#F07316', color: '#FFFFFF', borderRadius: 6, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>Back to Login</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F5', paddingTop: 58 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 48px 60px' }} className="reg-pad">
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 20 }}>
          <Link href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Home</Link> › <span style={{ color: '#F07316', fontWeight: 600 }}>Register</span>
        </div>

        <div className="reg-layout">
          {/* Left copy */}
          <div>
            <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(1.5rem,2.8vw,2rem)', fontWeight: 700, color: '#0B2447', marginBottom: 12 }}>Create Your Karur Plywood Account</h1>
            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, marginBottom: 28, maxWidth: 340 }}>Join thousands of professionals who trust us for their material needs.</p>
            {[
              { icon: '🏷️', t: 'Exclusive Benefits', d: 'Access special pricing, offers and member-only deals' },
              { icon: '💼', t: 'Faster Ordering', d: 'Save time with quick reorders and order history' },
              { icon: '🚚', t: 'Track Everything', d: 'Real-time order tracking and updates' },
              { icon: '🛡️', t: 'Priority Support', d: 'Get dedicated support from our expert team' },
            ].map(b => (
              <div key={b.t} style={{ display: 'flex', gap: 14, marginBottom: 22 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: '#FFF4ED', border: '1px solid rgba(240,115,22,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{b.icon}</div>
                <div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, color: '#0B2447', marginBottom: 2 }}>{b.t}</div>
                  <div style={{ fontSize: 12.5, color: '#6B7280', lineHeight: 1.5 }}>{b.d}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="reg-card">
            <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: '1.3rem', fontWeight: 700, color: '#0B2447', marginBottom: 4 }}>Register</h2>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 22 }}>Fill in your details to create your account</p>
            {error && <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="reg-grid">
                <div><label className="reg-lbl">Full Name *</label><input className="reg-inp" required value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Enter your full name" /></div>
                <div><label className="reg-lbl">Mobile Number *</label><input className="reg-inp" required type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Enter mobile number" /></div>
              </div>
              <div style={{ marginBottom: 14 }}><label className="reg-lbl">Email Address *</label><input className="reg-inp" required type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="Enter your email address" /></div>
              <div className="reg-grid">
                <div><label className="reg-lbl">Password *</label><input className="reg-inp" required type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Create a password" /></div>
                <div><label className="reg-lbl">Confirm Password *</label><input className="reg-inp" required type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} placeholder="Confirm your password" /></div>
              </div>
              <div className="reg-grid">
                <div>
                  <label className="reg-lbl">Account Type *</label>
                  <select className="reg-inp" required value={form.account_type} onChange={e => set('account_type', e.target.value)}>
                    <option value="">Select account type</option>
                    <option value="individual">Individual / Homeowner</option>
                    <option value="contractor">Contractor / Carpenter</option>
                    <option value="business">Business / Dealer</option>
                  </select>
                </div>
                <div>
                  <label className="reg-lbl">Business Type (Optional)</label>
                  <select className="reg-inp" value={form.business_type} onChange={e => set('business_type', e.target.value)}>
                    <option value="">Select your business type (optional)</option>
                    <option value="carpenter">Carpenter</option>
                    <option value="interior_designer">Interior Designer</option>
                    <option value="architect">Architect</option>
                    <option value="contractor">Contractor</option>
                    <option value="retailer">Retailer</option>
                  </select>
                </div>
              </div>
              <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12.5, color: '#4B5563', marginBottom: 20, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.agree} onChange={e => set('agree', e.target.checked)} style={{ marginTop: 2 }} />
                I agree to the <Link href="/terms-and-conditions" style={{ color: '#F07316' }}>Terms of Service</Link> and <Link href="/privacy-policy" style={{ color: '#F07316' }}>Privacy Policy</Link>
              </label>
              <button type="submit" disabled={loading} className="reg-submit-btn">{loading ? '⏳ Creating account...' : 'Create Account'}</button>
            </form>

            <div style={{ textAlign: 'center', fontSize: 12.5, color: '#9CA3AF', margin: '18px 0' }}>Already have an account?</div>
            <Link href="/auth/login" style={{ display: 'block', textAlign: 'center', padding: '12px 0', border: '1px solid #E5E1DC', borderRadius: 6, color: '#0B2447', fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>Sign In to Your Account</Link>
          </div>

          {/* Right — why register */}
          <aside className="reg-why-card">
            <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, color: '#0B2447', marginBottom: 16 }}>Why Register With Us?</div>
            {[
              { icon: '💰', t: 'Best Prices Guaranteed', d: 'Get the best market prices on all products' },
              { icon: '📦', t: 'Wide Product Range', d: '10,000+ products from trusted brands' },
              { icon: '🛡️', t: 'Secure Payments', d: 'Multiple safe payment options' },
              { icon: '🚚', t: 'Pan India Delivery', d: 'Fast delivery across South India' },
              { icon: '↺', t: 'Easy Returns', d: 'Hassle-free returns and refunds' },
            ].map(w => (
              <div key={w.t} style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                <span style={{ fontSize: 18 }}>{w.icon}</span>
                <div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 12.5, color: '#0B2447' }}>{w.t}</div>
                  <div style={{ fontSize: 11.5, color: '#6B7280' }}>{w.d}</div>
                </div>
              </div>
            ))}
          </aside>
        </div>
      </div>

      <style>{`
        .reg-layout { display: grid; grid-template-columns: 280px 1fr 260px; gap: 28px; align-items: start; }
        .reg-card { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 14px; padding: 32px; box-shadow: 0 1px 4px rgba(11,36,71,0.05); }
        .reg-why-card { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 14px; padding: 24px; }
        .reg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .reg-lbl { display: block; font-family: 'Inter',sans-serif; font-size: .68rem; font-weight: 700; color: #0B2447; margin-bottom: 6px; }
        .reg-inp { width: 100%; padding: 11px 13px; border: 1px solid #E5E1DC; border-radius: 6px; font-size: 14px; color: #0B2447; background: #FAF8F5; outline: none; box-sizing: border-box; }
        .reg-inp:focus { border-color: #F07316; background: #FFFFFF; }
        .reg-submit-btn { width: 100%; padding: 13px 0; background: #F07316; color: #FFFFFF; border: none; border-radius: 6px; font-family: 'Inter',sans-serif; font-weight: 700; font-size: .82rem; letter-spacing: .04em; cursor: pointer; }
        .reg-submit-btn:hover:not(:disabled) { background: #D9640F; }
        .reg-submit-btn:disabled { opacity: .6; cursor: not-allowed; }
        @media(max-width:1100px){ .reg-layout { grid-template-columns: 1fr; } .reg-layout > div:first-child { display: none; } }
        @media(max-width:640px){ .reg-pad { padding-left:16px !important; padding-right:16px !important; } .reg-grid { grid-template-columns: 1fr; } .reg-card { padding: 22px; } }
      `}</style>
    </div>
  );
}
