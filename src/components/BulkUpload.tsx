'use client';
// src/components/BulkUpload.tsx
import { useState, useRef } from 'react';

interface Props {
  onSuccess: () => void;
}

interface UploadResult {
  success?: boolean;
  inserted?: number;
  skipped?: number;
  row_errors?: string[];
  error?: string;
}

export default function BulkUpload({ onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!f.name.endsWith('.csv')) { setResult({ error: 'Only .csv files allowed.' }); return; }
    setFile(f);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/products/bulk', { method: 'POST', body: fd });
      const data: UploadResult = await res.json();
      setResult(data);
      if (data.success) { setFile(null); onSuccess(); }
    } catch {
      setResult({ error: 'Network error. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    window.open('/api/products/bulk', '_blank');
  };

  const inp: React.CSSProperties = {
    fontFamily: "'Syne',sans-serif",
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  };

  return (
    <div style={{ background: 'rgba(11,36,71,0.4)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 10, padding: 28 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: '0.06em', color: 'var(--white)', marginBottom: 4 }}>
            Bulk Product Upload
          </div>
          <div style={{ fontSize: 12, color: 'var(--grey)' }}>Upload a CSV file to add multiple products at once.</div>
        </div>
        <button onClick={downloadTemplate}
          style={{ ...inp, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 4, background: 'transparent', border: '1px solid rgba(249,115,22,0.3)', color: 'var(--orange)', cursor: 'pointer' }}>
          ↓ Download CSV Template
        </button>
      </div>

      {/* CSV format guide */}
      <div style={{ background: 'rgba(7,15,31,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '14px 16px', marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: 'var(--orange)', fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          Required CSV Columns
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--grey)', lineHeight: 1.8 }}>
          <span style={{ color: 'var(--orange)' }}>name</span> · 
          <span style={{ color: 'var(--orange)' }}> type</span> (project/quick) · 
          <span style={{ color: 'var(--grey-light)' }}> category_name</span> · 
          <span style={{ color: 'var(--grey-light)' }}> description</span> · 
          <span style={{ color: 'var(--grey-light)' }}> price</span> · 
          <span style={{ color: 'var(--grey-light)' }}> unit</span> · 
          <span style={{ color: 'var(--grey-light)' }}> image_url</span> · 
          <span style={{ color: 'var(--grey-light)' }}> in_stock</span> (true/false)
        </div>
        <div style={{ fontSize: 11, color: 'var(--grey)', marginTop: 8 }}>
          Orange = required · Grey = optional · category_name must match exactly (e.g. "Plywood", "Hardware")
        </div>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        style={{
          border: `2px dashed ${dragOver ? 'var(--orange)' : 'rgba(249,115,22,0.25)'}`,
          borderRadius: 8,
          padding: '28px 20px',
          textAlign: 'center',
          cursor: uploading ? 'default' : 'pointer',
          background: dragOver ? 'rgba(249,115,22,0.06)' : 'rgba(249,115,22,0.02)',
          transition: 'all 0.2s',
          marginBottom: 16,
        }}
      >
        {uploading ? (
          <div>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
            <div style={{ fontSize: 13, color: 'var(--grey)' }}>Uploading and processing...</div>
          </div>
        ) : file ? (
          <div>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: 'var(--white)', fontSize: 14, marginBottom: 4 }}>{file.name}</div>
            <div style={{ fontSize: 12, color: 'var(--grey)' }}>{(file.size / 1024).toFixed(1)} KB · Click to change</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📁</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: 'var(--grey-light)', fontSize: 13, marginBottom: 4 }}>
              Click to select or drag &amp; drop your CSV file
            </div>
            <div style={{ fontSize: 11, color: 'var(--grey)' }}>Max 2MB · .csv only</div>
          </div>
        )}
      </div>

      <input ref={inputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] || null)} />

      {/* Upload button */}
      {file && !uploading && (
        <button onClick={handleUpload}
          style={{ ...inp, width: '100%', padding: '12px 0', borderRadius: 4, background: 'var(--orange)', color: 'var(--navy)', border: 'none', cursor: 'pointer', fontSize: '0.82rem', marginBottom: 12 }}>
          ↑ Upload &amp; Import Products
        </button>
      )}

      {/* Result */}
      {result && (
        <div style={{
          borderRadius: 8, padding: '16px 18px',
          background: result.success ? 'rgba(37,211,102,0.08)' : 'rgba(249,115,22,0.08)',
          border: `1px solid ${result.success ? 'rgba(37,211,102,0.2)' : 'rgba(249,115,22,0.2)'}`,
        }}>
          {result.success ? (
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: '#4ADE80', fontSize: 14, marginBottom: 6 }}>
                ✅ Import successful!
              </div>
              <div style={{ fontSize: 13, color: 'var(--grey)' }}>
                <strong style={{ color: 'var(--white)' }}>{result.inserted}</strong> products added.
                {result.skipped ? <> · <strong style={{ color: 'var(--orange)' }}>{result.skipped}</strong> rows skipped.</> : null}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: 'var(--orange)', fontSize: 14, marginBottom: 6 }}>
                ⚠️ {result.error || 'Import failed'}
              </div>
            </div>
          )}
          {result.row_errors && result.row_errors.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--grey)', fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
                Skipped Rows:
              </div>
              <div style={{ maxHeight: 120, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {result.row_errors.map((e, i) => (
                  <div key={i} style={{ fontSize: 11, color: '#FCA5A5', fontFamily: 'monospace' }}>· {e}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
