'use client';
// src/components/BOMUploader.tsx
// Customer uploads BOM image → saved to Supabase → admin handles quote from dashboard
import { useState, useRef, useCallback } from 'react';

type Step = 'idle' | 'preview' | 'details' | 'submitting' | 'done' | 'error';

interface Details { name: string; phone: string; location: string; notes: string; }

export default function BOMUploader() {
  const [step,      setStep]      = useState<Step>('idle');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageURL,  setImageURL]  = useState<string>('');
  const [details,   setDetails]   = useState<Details>({ name: '', phone: '', location: '', notes: '' });
  const [dragOver,  setDragOver]  = useState(false);
  const [errMsg,    setErrMsg]    = useState('');
  const inputRef  = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setErrMsg('Please upload an image file.'); return; }
    if (file.size > 10 * 1024 * 1024)   { setErrMsg('Image too large. Max 10 MB.'); return; }
    setErrMsg('');
    setImageFile(file);
    setImageURL(URL.createObjectURL(file));
    setStep('preview');
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files[0] || null);
  };

  const handleSubmit = async () => {
    if (!details.name.trim() || !details.phone.trim()) {
      setErrMsg('Name and phone number are required.');
      return;
    }
    if (!imageFile) return;
    setErrMsg('');
    setStep('submitting');

    try {
      const fd = new FormData();
      fd.append('name',     details.name.trim());
      fd.append('phone',    details.phone.trim());
      fd.append('location', details.location.trim());
      fd.append('notes',    details.notes.trim());
      fd.append('image',    imageFile);

      const res  = await fetch('/api/bom', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) {
        setErrMsg(data.error || 'Something went wrong. Please try again.');
        setStep('details');
        return;
      }
      setStep('done');
    } catch {
      setErrMsg('Network error. Please check your connection and try again.');
      setStep('details');
    }
  };

  const reset = () => {
    setStep('idle');
    setImageFile(null);
    setImageURL('');
    setDetails({ name: '', phone: '', location: '', notes: '' });
    setErrMsg('');
  };

  const set = (k: keyof Details, v: string) => setDetails(d => ({ ...d, [k]: v }));

  const inp: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(249,115,22,0.18)',
    borderRadius: 3,
    padding: '10px 14px',
    color: '#F8F9FB',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
  };
  const lbl: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#7A8EA8',
    marginBottom: 6,
  };

  return (
    <div className="bom-wrap">

      {/* ── IDLE ── */}
      {step === 'idle' && (
        <div>
          <div className="bom-header">
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', letterSpacing: '0.05em', color: '#F8F9FB', marginBottom: 6 }}>
              UPLOAD YOUR MATERIAL LIST
            </div>
            <p style={{ fontSize: 13, color: '#7A8EA8', lineHeight: 1.7, maxWidth: 400, margin: '0 auto' }}>
              Snap a photo of your handwritten list or upload any BOM image. We&apos;ll review it and send your quote on WhatsApp within 10–30 minutes.
            </p>
          </div>

          {/* Drop zone */}
          <div
            className={`bom-drop${dragOver ? ' bom-drop--over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <div style={{ fontSize: 40, marginBottom: 10 }}>📁</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: '#A8BCCC', marginBottom: 4 }}>
              Drag &amp; drop your material list here
            </div>
            <div style={{ fontSize: 12, color: '#7A8EA8' }}>JPG, PNG, WebP · Max 10 MB</div>
          </div>

          {errMsg && <div style={{ color: '#FCA5A5', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{errMsg}</div>}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="bom-pick-btn" onClick={() => inputRef.current?.click()}>
              🖼️ Choose from Gallery
            </button>
            <button className="bom-pick-btn bom-pick-btn--orange" onClick={() => cameraRef.current?.click()}>
              📷 Take Photo Now
            </button>
          </div>

          <input ref={inputRef}  type="file" accept="image/*"              style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] || null)} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] || null)} />

          <div style={{ marginTop: 24, padding: '14px 16px', background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 6, fontSize: 12, color: '#7A8EA8', lineHeight: 1.7, textAlign: 'center' }}>
            💡 <strong style={{ color: '#F8F9FB' }}>How it works:</strong> Upload photo → Enter your details → We call/WhatsApp you with a quote in minutes.
          </div>
        </div>
      )}

      {/* ── PREVIEW ── */}
      {step === 'preview' && imageURL && (
        <div>
          <div className="bom-step-label">Step 1 of 2 — Check your image</div>
          <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 16, border: '1px solid rgba(249,115,22,0.2)', position: 'relative', maxHeight: 340 }}>
            <img src={imageURL} alt="BOM preview" style={{ width: '100%', maxHeight: 340, objectFit: 'contain', display: 'block', background: '#0d1f3a' }} />
          </div>
          <p style={{ fontSize: 13, color: '#7A8EA8', marginBottom: 16 }}>
            Make sure your material list is clearly visible and readable. If blurry, take a new photo.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="bom-action-btn bom-action-btn--outline" onClick={reset}>↩ Change Image</button>
            <button className="bom-action-btn bom-action-btn--primary" onClick={() => setStep('details')}>Looks Good →</button>
          </div>
        </div>
      )}

      {/* ── DETAILS ── */}
      {step === 'details' && (
        <div>
          <div className="bom-step-label">Step 2 of 2 — Your contact details</div>

          {/* Image thumb */}
          {imageURL && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 6, padding: '10px 14px', marginBottom: 22 }}>
              <img src={imageURL} alt="thumb" style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 4, border: '1px solid rgba(249,115,22,0.2)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F8F9FB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{imageFile?.name}</div>
                <div style={{ fontSize: 11, color: '#4ADE80' }}>✅ Image ready to upload</div>
              </div>
              <button onClick={reset} style={{ background: 'none', border: 'none', color: '#7A8EA8', cursor: 'pointer', fontSize: 18, flexShrink: 0 }}>✕</button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={lbl}>Your Name *</label>
              <input style={inp} value={details.name} onChange={e => set('name', e.target.value)} placeholder="Rajan Kumar" />
            </div>
            <div>
              <label style={lbl}>Phone Number *</label>
              <input style={inp} type="tel" value={details.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Delivery Location</label>
            <input style={inp} value={details.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Karur, Trichy, Namakkal..." />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>Additional Notes (optional)</label>
            <textarea
              style={{ ...inp, resize: 'none' } as React.CSSProperties}
              rows={2}
              value={details.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="e.g. Need delivery by next week, Budget ₹50,000, need ISI certified..."
            />
          </div>

          {errMsg && (
            <div style={{ color: '#FCA5A5', fontSize: 13, marginBottom: 14, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 6, padding: '10px 14px' }}>
              ⚠️ {errMsg}
            </div>
          )}

          <div style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.15)', borderRadius: 6, padding: '12px 14px', marginBottom: 20, fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
            🔒 Your details are stored securely. We&apos;ll only use them to contact you with your quote.
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="bom-action-btn bom-action-btn--outline" onClick={() => setStep('preview')}>← Back</button>
            <button
              className="bom-action-btn bom-action-btn--submit"
              onClick={handleSubmit}
              disabled={!details.name.trim() || !details.phone.trim()}
            >
              📨 Submit for Quote
            </button>
          </div>
        </div>
      )}

      {/* ── SUBMITTING ── */}
      {step === 'submitting' && (
        <div style={{ textAlign: 'center', padding: '48px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: 'bomSpin 1s linear infinite', display: 'inline-block' }}>⏳</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: '#F8F9FB', marginBottom: 6 }}>
            Uploading your material list...
          </div>
          <div style={{ fontSize: 13, color: '#7A8EA8' }}>Please don&apos;t close this page.</div>
        </div>
      )}

      {/* ── DONE ── */}
      {step === 'done' && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '0.05em', color: '#F8F9FB', marginBottom: 10 }}>
            REQUEST RECEIVED!
          </div>
          <p style={{ color: '#7A8EA8', fontSize: 15, lineHeight: 1.8, marginBottom: 6 }}>
            We&apos;ve received your material list.
          </p>
          <p style={{ color: '#4ADE80', fontSize: 14, fontWeight: 600, marginBottom: 24 }}>
            📲 Our team will send your quote on WhatsApp within 10–30 minutes.
          </p>
          <div style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.18)', borderRadius: 8, padding: '16px 20px', marginBottom: 28, fontSize: 13, color: '#7A8EA8', lineHeight: 1.7 }}>
            <strong style={{ color: '#F8F9FB' }}>What happens next?</strong><br/>
            Our team reviews your list → Checks current stock and pricing → Sends you a complete quote on WhatsApp with product details and delivery timeline.
          </div>
          <button className="bom-action-btn bom-action-btn--outline" onClick={reset} style={{ margin: '0 auto' }}>
            📋 Submit Another List
          </button>
        </div>
      )}

      <style>{`
        .bom-wrap {
          padding: 32px;
          background: rgba(25,55,109,0.35);
          border: 1px solid rgba(249,115,22,0.2);
          border-radius: 10px;
        }
        .bom-header { text-align: center; margin-bottom: 24px; }
        .bom-step-label {
          font-family: 'Syne', sans-serif; font-size: 0.68rem;
          font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
          color: #F97316; margin-bottom: 16px;
        }
        .bom-drop {
          border: 2px dashed rgba(249,115,22,0.3);
          border-radius: 8px; padding: 32px 20px;
          text-align: center; cursor: pointer;
          background: rgba(249,115,22,0.02);
          transition: all 0.2s; margin-bottom: 16px;
        }
        .bom-drop:hover, .bom-drop--over {
          border-color: #F97316;
          background: rgba(249,115,22,0.06);
        }
        .bom-pick-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 20px; border-radius: 3px;
          border: 1px solid rgba(255,255,255,0.15);
          background: transparent; color: #A8BCCC;
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 0.75rem; letter-spacing: 0.08em;
          text-transform: uppercase; cursor: pointer; transition: all 0.2s;
        }
        .bom-pick-btn:hover { border-color: #F97316; color: #F97316; }
        .bom-pick-btn--orange {
          background: rgba(249,115,22,0.1);
          border-color: rgba(249,115,22,0.3); color: #F97316;
        }
        .bom-pick-btn--orange:hover { background: rgba(249,115,22,0.2); }
        .bom-action-btn {
          padding: 12px 20px; border-radius: 3px; cursor: pointer;
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase;
          transition: all 0.2s; border: none; display: inline-block;
        }
        .bom-action-btn--outline {
          background: transparent;
          border: 1px solid rgba(249,115,22,0.3); color: #F97316;
        }
        .bom-action-btn--outline:hover { background: rgba(249,115,22,0.08); }
        .bom-action-btn--primary { background: #F97316; color: #0B2447; flex: 1; }
        .bom-action-btn--primary:hover { background: #FF9A45; }
        .bom-action-btn--submit {
          background: #F97316; color: #0B2447; flex: 1;
        }
        .bom-action-btn--submit:hover { background: #FF9A45; transform: translateY(-1px); }
        .bom-action-btn--submit:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
        @keyframes bomSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input:focus, textarea:focus { border-color: #F97316 !important; }
        @media(max-width:600px){ .bom-wrap { padding: 20px; } }
      `}</style>
    </div>
  );
}
