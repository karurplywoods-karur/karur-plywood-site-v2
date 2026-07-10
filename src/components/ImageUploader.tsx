'use client';
// src/components/ImageUploader.tsx
import { useState, useRef } from 'react';
import Image from 'next/image';

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  hint?: string;
}

// ── WebP converter ────────────────────────────────────────────────────────────
// Converts any image file to WebP at ≤1200px wide, 85% quality, client-side
// using the Canvas API. Falls back to the original file if conversion fails.
const MAX_WIDTH  = 1200;
const MAX_HEIGHT = 1200;
const QUALITY    = 0.85;

async function toWebP(file: File): Promise<File> {
  return new Promise((resolve) => {
    // If already WebP and small enough, skip conversion
    if (file.type === 'image/webp' && file.size < 300_000) {
      resolve(file);
      return;
    }

    const img = document.createElement('img');
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate dimensions — maintain aspect ratio, cap at max
      let { width, height } = img;
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width  = Math.round(width  * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width  = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; } // fallback
          const webpFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, '') + '.webp',
            { type: 'image/webp' }
          );
          resolve(webpFile);
        },
        'image/webp',
        QUALITY
      );
    };

    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); }; // fallback
    img.src = url;
  });
}
// ─────────────────────────────────────────────────────────────────────────────

export default function ImageUploader({ value, onChange, folder = 'products', label = 'Image', hint }: Props) {
  const [uploading, setUploading]   = useState(false);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress]     = useState('');
  const [error, setError]           = useState('');
  const [dragOver, setDragOver]     = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setError('');

    // Step 1: Convert to WebP
    setConverting(true);
    setProgress('Converting to WebP…');
    let finalFile: File;
    try {
      finalFile = await toWebP(file);
      const savedKB = Math.round((file.size - finalFile.size) / 1024);
      if (savedKB > 0) {
        setProgress(`Converted ✓ — saved ${savedKB}KB → uploading…`);
      } else {
        setProgress('Uploading…');
      }
    } catch {
      finalFile = file; // fallback to original
      setProgress('Uploading…');
    }
    setConverting(false);

    // Step 2: Upload
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', finalFile);
      fd.append('folder', folder);

      const res  = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Upload failed.');
      onChange(data.url);
      setProgress('');
    } catch (e: any) {
      setError(e.message);
      setProgress('');
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (files: FileList | null) => {
    if (files?.[0]) upload(files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files);
  };

  const busy = uploading || converting;

  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: '#9A8070', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
  };

  return (
    <div>
      <label style={lbl}>{label}</label>

      {/* Drop zone */}
      <div
        onClick={() => !busy && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? '#C8884A' : 'rgba(200,136,74,0.25)'}`,
          borderRadius: 12, padding: '20px 16px',
          textAlign: 'center', cursor: busy ? 'default' : 'pointer',
          background: dragOver ? 'rgba(200,136,74,0.06)' : 'rgba(200,136,74,0.02)',
          transition: 'all 0.2s', marginBottom: 10,
        }}
      >
        {busy ? (
          <div>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{converting ? '🔄' : '⏳'}</div>
            <div style={{ fontSize: 13, color: '#C8884A', fontWeight: 600 }}>{progress}</div>
            {/* Progress bar */}
            <div style={{ marginTop: 10, height: 3, background: 'rgba(200,136,74,0.15)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                background: 'linear-gradient(90deg,#C8884A,#F97316)',
                width: uploading ? '100%' : '50%',
                transition: 'width 0.4s ease',
                animation: 'pulse-bar 1.2s ease-in-out infinite',
              }} />
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 28, marginBottom: 6 }}>📁</div>
            <div style={{ fontSize: 13, color: '#C8B8A0', fontWeight: 500 }}>Click to upload or drag & drop</div>
            <div style={{ fontSize: 11, color: '#9A8070', marginTop: 4 }}>
              JPEG · PNG · WebP — Auto-converted to WebP · Max 5MB
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files)}
      />

      {/* OR paste URL */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(200,136,74,0.12)' }} />
        <span style={{ fontSize: 11, color: '#9A8070' }}>or paste URL</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(200,136,74,0.12)' }} />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="https://..."
        style={{
          width: '100%', background: '#0E0B08',
          border: '1px solid rgba(200,136,74,0.2)', borderRadius: 8,
          padding: '10px 14px', fontSize: 13, color: '#F0E8DC',
          fontFamily: 'Outfit,sans-serif', outline: 'none',
        }}
      />

      {hint  && <div style={{ fontSize: 11, color: '#9A8070', marginTop: 6 }}>{hint}</div>}
      {error && <div style={{ fontSize: 12, color: '#F87171', marginTop: 6 }}>⚠️ {error}</div>}

      {/* Preview */}
      {value && (
        <div style={{ marginTop: 12, borderRadius: 10, overflow: 'hidden', position: 'relative', height: 140, border: '1px solid rgba(200,136,74,0.15)' }}>
          <Image src={value} alt="Preview" fill style={{ objectFit: 'cover' }}
            onError={e => (e.currentTarget.style.display = 'none')} />
          <button
            onClick={() => onChange('')}
            style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: 6, color: 'white', padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontFamily: 'Outfit,sans-serif' }}>
            ✕ Remove
          </button>
        </div>
      )}

      <style>{`
        input[type="text"]:focus { border-color: #C8884A !important; }
        @keyframes pulse-bar {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}


interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  hint?: string;
}
