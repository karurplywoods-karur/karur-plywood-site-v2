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

export default function ImageUploader({ value, onChange, folder = 'products', label = 'Image', hint }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder);

      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Upload failed.');
      onChange(data.url);
    } catch (e: any) {
      setError(e.message);
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

  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: '#9A8070', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
  };

  return (
    <div>
      <label style={lbl}>{label}</label>

      {/* Drop zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? '#C8884A' : 'rgba(200,136,74,0.25)'}`,
          borderRadius: 12, padding: '20px 16px',
          textAlign: 'center', cursor: uploading ? 'default' : 'pointer',
          background: dragOver ? 'rgba(200,136,74,0.06)' : 'rgba(200,136,74,0.02)',
          transition: 'all 0.2s', marginBottom: 10,
        }}
      >
        {uploading ? (
          <div>
            <div style={{ fontSize: 28, marginBottom: 6 }}>⏳</div>
            <div style={{ fontSize: 13, color: '#9A8070' }}>Uploading...</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 28, marginBottom: 6 }}>📁</div>
            <div style={{ fontSize: 13, color: '#C8B8A0', fontWeight: 500 }}>Click to upload or drag & drop</div>
            <div style={{ fontSize: 11, color: '#9A8070', marginTop: 4 }}>JPEG, PNG, WebP — Max 5MB</div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
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

      {hint && <div style={{ fontSize: 11, color: '#9A8070', marginTop: 6 }}>{hint}</div>}
      {error && <div style={{ fontSize: 12, color: '#F87171', marginTop: 6 }}>{error}</div>}

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

      <style>{`input[type="text"]:focus{border-color:#C8884A!important}`}</style>
    </div>
  );
}
