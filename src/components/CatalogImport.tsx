'use client';
// src/components/CatalogImport.tsx
// One-sheet catalog import: products + variants in a single CSV.
// Flow: choose file → Preview & Validate (nothing saved) → Import → optional Undo.

import { useState, useRef, useCallback, useEffect } from 'react';

type RowStatus = 'valid' | 'duplicate' | 'error';

interface PreviewRow {
  row: number; status: RowStatus; errors: string[]; warnings: string[];
  product: string; category: string; brand: string; variant: string;
  price: number | null; mrp: number | null; action: string;
}
interface PreviewResult {
  total: number; valid: number; duplicates: number; errors: number;
  new_products: number; existing_products: number; new_categories: string[]; new_brands: string[]; rows: PreviewRow[];
}
interface ImportResult {
  success: boolean; products_created: number; products_updated: number;
  variants_created: number; skipped: number; created_categories?: number; created_brands?: number;
  errors: { row: number | string; error: string }[];
  rollback: { product_ids: any[]; variant_ids: any[]; category_ids: any[]; brand_ids: any[] };
}

const STATUS_STYLE: Record<RowStatus, { bg: string; color: string; label: string }> = {
  valid:     { bg: 'rgba(37,211,102,0.1)',  color: '#25D366', label: '✅ Ready'     },
  duplicate: { bg: 'rgba(232,184,32,0.1)',  color: '#E8B820', label: '⚠️ Skipped'   },
  error:     { bg: 'rgba(248,113,113,0.1)', color: '#F87171', label: '❌ Error'     },
};

const inr = (n: number | null) => (n === null ? '—' : '₹' + n.toLocaleString('en-IN'));

export default function CatalogImport({ onSuccess }: { onSuccess?: () => void }) {
  const [file, setFile]               = useState<File | null>(null);
  const [dragging, setDragging]       = useState(false);
  const [previewing, setPreviewing]   = useState(false);
  const [importing, setImporting]     = useState(false);
  const [preview, setPreview]         = useState<PreviewResult | null>(null);
  const [result, setResult]           = useState<ImportResult | null>(null);
  const [error, setError]             = useState('');
  const [cats, setCats]               = useState<string[]>([]);
  const [brands, setBrands]           = useState<string[]>([]);
  const [createMissing, setCreateMissing] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/import/preview')
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d) { setCats(d.categories || []); setBrands(d.brands || []); } })
      .catch(() => {});
  }, []);

  const reset = () => { setFile(null); setPreview(null); setResult(null); setError(''); };

  const handleFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith('.csv')) { setError('Please choose a .csv file (in Excel: Save As → CSV).'); return; }
    setFile(f); setPreview(null); setResult(null); setError('');
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  // Reads the real error message from the server instead of a generic "network error"
  const post = async (url: string) => {
    const fd = new FormData();
    fd.append('file', file as File);
    fd.append('create_missing', createMissing ? '1' : '0');
    const res = await fetch(url, { method: 'POST', body: fd });
    let data: any = null;
    try { data = await res.json(); } catch { /* non-JSON response */ }
    if (!res.ok) throw new Error(data?.error || `Server error (${res.status}). Check the Vercel function logs.`);
    return data;
  };

  const handlePreview = async () => {
    if (!file) return;
    setPreviewing(true); setError('');
    try { setPreview(await post('/api/import/preview')); }
    catch (e: any) { setError(e.message || 'Preview failed.'); }
    finally { setPreviewing(false); }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true); setError('');
    try {
      const data: ImportResult = await post('/api/import/execute');
      setResult(data);
      if (data.variants_created > 0) onSuccess?.();
      fetch('/api/import/preview').then(r => (r.ok ? r.json() : null)).then(d => { if (d) { setCats(d.categories || []); setBrands(d.brands || []); } }).catch(() => {});
    } catch (e: any) { setError(e.message || 'Import failed.'); }
    finally { setImporting(false); }
  };

  const handleUndo = async () => {
    if (!result || !confirm('Delete everything created by this import?')) return;
    const res = await fetch('/api/import/execute', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.rollback),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) { alert('Import undone.'); reset(); onSuccess?.(); }
    else setError(data.error || 'Undo failed.');
  };

  const s = {
    card: { background: '#1C140D', border: '1px solid rgba(200,136,74,0.15)', borderRadius: 14, padding: 24, marginBottom: 16 } as React.CSSProperties,
    drop: (d: boolean): React.CSSProperties => ({ border: `2px dashed ${d ? '#C8884A' : 'rgba(200,136,74,0.3)'}`, borderRadius: 10, padding: '36px 20px', textAlign: 'center', cursor: 'pointer', background: d ? 'rgba(200,136,74,0.06)' : 'transparent', transition: 'all .2s' }),
    btn: (bg: string): React.CSSProperties => ({ padding: '10px 22px', borderRadius: 8, border: 'none', background: bg, color: 'white', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer' }),
    ghost: { padding: '10px 22px', borderRadius: 8, border: '1px solid rgba(200,136,74,0.2)', background: 'transparent', color: '#9A8070', fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13, cursor: 'pointer' } as React.CSSProperties,
    err: { marginTop: 12, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#F87171' } as React.CSSProperties,
    chip: { display: 'inline-block', fontSize: 11, padding: '2px 9px', margin: '2px 4px 2px 0', borderRadius: 10, background: 'rgba(200,136,74,0.12)', color: '#E0A86A' } as React.CSSProperties,
    th: { padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#9A8070', textTransform: 'uppercase', letterSpacing: 0.8, whiteSpace: 'nowrap' } as React.CSSProperties,
    td: { padding: '7px 12px', color: '#C8B8A0', fontSize: 12, whiteSpace: 'nowrap' } as React.CSSProperties,
  };

  return (
    <div style={{ fontFamily: 'Outfit, sans-serif', color: '#F0E8DC' }}>

      {/* Instructions + template */}
      <div style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ flex: '1 1 380px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>📦 Products + Variants — one CSV</div>
          <div style={{ fontSize: 12, color: '#9A8070', lineHeight: 1.7 }}>
            One row = one variant (thickness / size / grade…). Rows with the <b style={{ color: '#E0A86A' }}>same product_name</b> become
            one product with many variants. If the product already exists, new variants are added to it.
            Required columns: <span style={{ color: '#C8884A' }}>product_name, category, price</span>.
          </div>
          {cats.length > 0 && (
            <div style={{ marginTop: 10, fontSize: 11, color: '#9A8070' }}>
              Your categories (type exactly): {cats.map(c => <span key={c} style={s.chip}>{c}</span>)}
            </div>
          )}
          {brands.length > 0 && (
            <div style={{ marginTop: 4, fontSize: 11, color: '#9A8070' }}>
              Your brands (optional): {brands.map(b => <span key={b} style={s.chip}>{b}</span>)}
            </div>
          )}
        </div>
        <a href="/api/import/templates" style={{ ...s.btn('rgba(200,136,74,0.15)'), color: '#E0A86A', border: '1px solid rgba(200,136,74,0.3)', textDecoration: 'none' }}>
          ⬇️ Download Template
        </a>
      </div>

      {/* Step 1: choose file */}
      {!preview && !result && (
        <div style={s.card}>
          <div style={s.drop(dragging)}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📄</div>
            <div style={{ fontWeight: 600, color: '#C8B8A0', marginBottom: 4 }}>{file ? file.name : 'Drop your CSV here or click to browse'}</div>
            <div style={{ fontSize: 12, color: '#9A8070' }}>CSV only · up to 500 rows</div>
            {file && <div style={{ marginTop: 10, fontSize: 12, color: '#25D366' }}>✅ {file.name} ({(file.size / 1024).toFixed(1)} KB) — ready to preview</div>}
            <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 13, color: '#C8B8A0', cursor: 'pointer' }}>
            <input type="checkbox" checked={createMissing} onChange={e => setCreateMissing(e.target.checked)} />
            Create categories &amp; brands that don&apos;t exist yet (shown in the preview before anything is saved)
          </label>
          {error && <div style={s.err}>{error}</div>}
          {file && (
            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <button onClick={handlePreview} disabled={previewing} style={s.btn(previewing ? '#5c4a2e' : 'linear-gradient(135deg,#C8884A,#8B5E2A)')}>
                {previewing ? '⏳ Validating...' : '🔍 Preview & Validate'}
              </button>
              <button onClick={reset} style={s.ghost}>Clear</button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: preview */}
      {preview && !result && (
        <div style={s.card}>
          <div style={{ display: 'flex', gap: 18, marginBottom: 18, flexWrap: 'wrap', fontSize: 13 }}>
            <div style={{ color: '#9A8070' }}>Rows: <b style={{ color: '#F0E8DC' }}>{preview.total}</b></div>
            <div style={{ color: '#25D366' }}>✅ Ready: <b>{preview.valid}</b></div>
            {preview.duplicates > 0 && <div style={{ color: '#E8B820' }}>⚠️ Skipped: <b>{preview.duplicates}</b></div>}
            {preview.errors > 0 && <div style={{ color: '#F87171' }}>❌ Errors: <b>{preview.errors}</b></div>}
            <div style={{ color: '#9A8070' }}>→ <b style={{ color: '#E0A86A' }}>{preview.new_products}</b> new product(s), <b style={{ color: '#E0A86A' }}>{preview.existing_products}</b> existing</div>
          </div>

          {(preview.new_categories.length > 0 || preview.new_brands.length > 0) && (
            <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: 'rgba(200,136,74,0.08)', border: '1px solid rgba(200,136,74,0.25)', fontSize: 12, color: '#E0A86A' }}>
              🆕 Will be created on import —
              {preview.new_categories.length > 0 && <> categories: {preview.new_categories.map(c => <span key={c} style={s.chip}>{c}</span>)}</>}
              {preview.new_brands.length > 0 && <> brands: {preview.new_brands.map(b => <span key={b} style={s.chip}>{b}</span>)}</>}
              <div style={{ color: '#9A8070', marginTop: 4 }}>Check the spelling — a typo would create a new category. Not right? Click Back and fix your sheet.</div>
            </div>
          )}

          <div style={{ overflowX: 'auto', marginBottom: 18 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(200,136,74,0.15)' }}>
                  {['Row', 'Status', 'Product', 'Category', 'Variant', 'Price', 'MRP', 'Action', 'Notes'].map(h => <th key={h} style={s.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map(r => {
                  const st = STATUS_STYLE[r.status];
                  const notes = [...r.errors, ...r.warnings].join(' · ');
                  return (
                    <tr key={r.row} style={{ borderBottom: '1px solid rgba(200,136,74,0.06)' }}>
                      <td style={{ ...s.td, color: '#9A8070' }}>{r.row}</td>
                      <td style={s.td}><span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: st.bg, color: st.color }}>{st.label}</span></td>
                      <td style={{ ...s.td, color: '#F0E8DC' }}>{r.product || '—'}</td>
                      <td style={s.td}>{r.category || '—'}</td>
                      <td style={s.td}>{r.variant}</td>
                      <td style={s.td}>{inr(r.price)}</td>
                      <td style={s.td}>{inr(r.mrp)}</td>
                      <td style={s.td}>{r.action || '—'}</td>
                      <td style={{ ...s.td, whiteSpace: 'normal', minWidth: 220, color: r.errors.length ? '#F87171' : '#E8B820' }}>{notes || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {error && <div style={{ ...s.err, marginTop: 0, marginBottom: 14 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={handleImport} disabled={importing || preview.valid === 0}
              style={s.btn(importing || preview.valid === 0 ? '#5c4a2e' : '#25D366')}>
              {importing ? '⏳ Importing...' : `⬆️ Import ${preview.valid} Row${preview.valid !== 1 ? 's' : ''}`}
            </button>
            <button onClick={reset} style={s.ghost}>← Back</button>
          </div>
          {(preview.errors > 0 || preview.duplicates > 0) && (
            <div style={{ marginTop: 10, fontSize: 12, color: '#9A8070' }}>
              ℹ️ Error and skipped rows are not imported. Fix them in your sheet and upload again — rows already imported are detected and skipped, so re-uploading is safe.
            </div>
          )}
        </div>
      )}

      {/* Step 3: result */}
      {result && (
        <div style={s.card}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>{result.variants_created > 0 ? '🎉' : '⚠️'}</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
            {result.variants_created > 0 ? 'Import Complete' : 'Nothing was imported'}
          </div>
          <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap', fontSize: 14 }}>
            <div style={{ color: '#25D366' }}>✅ New products: <b>{result.products_created}</b></div>
            {result.products_updated > 0 && <div style={{ color: '#25D366' }}>➕ Existing products extended: <b>{result.products_updated}</b></div>}
            <div style={{ color: '#25D366' }}>📐 Variants added: <b>{result.variants_created}</b></div>
            {(result.created_categories || 0) > 0 && <div style={{ color: '#25D366' }}>🗂 New categories: <b>{result.created_categories}</b></div>}
            {(result.created_brands || 0) > 0 && <div style={{ color: '#25D366' }}>🏷 New brands: <b>{result.created_brands}</b></div>}
            {result.skipped > 0 && <div style={{ color: '#E8B820' }}>⚠️ Rows skipped: <b>{result.skipped}</b></div>}
          </div>
          {result.errors.length > 0 && (
            <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#F87171', marginBottom: 8 }}>Database errors:</div>
              {result.errors.map((e, i) => <div key={i} style={{ fontSize: 12, color: '#FCA5A5', marginBottom: 3 }}>Row {e.row}: {e.error}</div>)}
            </div>
          )}
          {error && <div style={{ ...s.err, marginTop: 0, marginBottom: 14 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={reset} style={s.btn('linear-gradient(135deg,#C8884A,#8B5E2A)')}>Import More</button>
            {result.variants_created > 0 && (
              <button onClick={handleUndo} style={{ ...s.btn('rgba(248,113,113,0.1)'), color: '#F87171', border: '1px solid rgba(248,113,113,0.2)' }}>↩ Undo This Import</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
