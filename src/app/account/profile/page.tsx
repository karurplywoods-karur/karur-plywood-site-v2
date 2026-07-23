'use client';
// src/app/account/profile/page.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/auth-client';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [form,    setForm]    = useState({ full_name: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState<{ text: string; ok: boolean } | null>(null);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth/login'); return; }
      fetch('/api/customer').then(r => r.json()).then(data => {
        setForm({ full_name: data.full_name || '', phone: data.phone || '' });
        setLoading(false);
      });
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/customer', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setMsg(res.ok
      ? { text: '✅ Profile updated successfully.', ok: true }
      : { text: '❌ Failed to update. Please try again.', ok: false });
    setTimeout(() => setMsg(null), 3000);
  };

  const handlePasswordReset = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email) return;
    await supabase.auth.resetPasswordForEmail(session.user.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setMsg({ text: '📧 Password reset email sent. Check your inbox.', ok: true });
    setTimeout(() => setMsg(null), 4000);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070F1F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7A8EA8' }}>
      ⏳ Loading...
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#070F1F', padding: '80px 0 60px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 48px' }} className="profile-pad">

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, fontSize: 12, color: '#7A8EA8', fontFamily: "'Inter',sans-serif" }}>
          <Link href="/account" style={{ color: '#7A8EA8', textDecoration: 'none' }}>← My Account</Link>
          <span>›</span>
          <span style={{ color: '#F8F9FB', fontWeight: 700 }}>Edit Profile</span>
        </div>

        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: '2rem', letterSpacing: '.05em', color: '#F8F9FB', marginBottom: 24 }}>
          EDIT PROFILE
        </h1>

        {msg && (
          <div style={{ padding: '12px 16px', borderRadius: 6, marginBottom: 20, fontSize: 13, background: msg.ok ? 'rgba(37,211,102,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${msg.ok ? 'rgba(37,211,102,0.3)' : 'rgba(248,113,113,0.3)'}`, color: msg.ok ? '#4ADE80' : '#FCA5A5' }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ background: 'rgba(25,55,109,0.25)', border: '1px solid rgba(249,115,22,0.12)', borderRadius: 10, padding: '24px' }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '.65rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#F97316', marginBottom: 18 }}>
              Personal Information
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontFamily: "'Inter',sans-serif", fontSize: '.6rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#7A8EA8', marginBottom: 6 }}>
                  Full Name
                </label>
                <input
                  className="profile-inp"
                  value={form.full_name}
                  onChange={e => set('full_name', e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: "'Inter',sans-serif", fontSize: '.6rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#7A8EA8', marginBottom: 6 }}>
                  Phone Number
                </label>
                <input
                  className="profile-inp"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving}
            style={{ padding: '13px 0', background: '#F97316', color: '#0B2447', border: 'none', borderRadius: 6, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: '.82rem', letterSpacing: '.1em', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? '⏳ Saving...' : '✓ Save Changes'}
          </button>
        </form>

        {/* Password reset */}
        <div style={{ background: 'rgba(25,55,109,0.2)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 10, padding: '20px 24px', marginTop: 20 }}>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '.65rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#F97316', marginBottom: 8 }}>
            Password
          </div>
          <p style={{ fontSize: 13, color: '#7A8EA8', marginBottom: 14, lineHeight: 1.6 }}>
            We'll send a reset link to your registered email address.
          </p>
          <button onClick={handlePasswordReset}
            style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 6, color: '#F97316', fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: '.72rem', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Send Password Reset Email
          </button>
        </div>

      </div>
      <style>{`
        .profile-pad { padding: 32px 48px; }
        .profile-inp { width: 100%; background: rgba(7,15,31,0.6); border: 1px solid rgba(249,115,22,0.15); border-radius: 6px; padding: 10px 13px; font-size: 14px; color: #F8F9FB; font-family: 'Inter',sans-serif; outline: none; transition: border-color .2s; }
        .profile-inp:focus { border-color: #F97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }
        .profile-inp::placeholder { color: #7A8EA8; }
        @media(max-width:640px){ .profile-pad { padding: 20px !important; } }
      `}</style>
    </div>
  );
}
