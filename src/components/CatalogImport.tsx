'use client';
// src/components/CatalogImport.tsx
// Replaces BulkUpload.tsx â€” three-tab CSV importer with preview,
// validation, progress tracking, and rollback support.

import { useState, useRef, useCallback } from 'react';

type BatchType = 'products' | 'variants' | 'images';
type RowStatus = 'valid' | 'duplicate' | 'error';

interface PreviewRow {
  row: number;
  status: RowStatus;
  errors: string[];
  warnings: string[];
  preview: Record<string, string | number | null>;
}

interface PreviewResult {
  batch_id: string;
  total: number;
  valid: number;
  errors: number;
  duplicates: number;
  rows: PreviewRow[];
}

const TABS: { type: BatchType; label: string; desc: string }[] = [
  { type: 'products', label: 'ðŸ“¦ Products',  desc: 'name, type, category, brand, price, mrp' },
  { type: 'variants', label: 'ðŸ“ Variants',  desc: 'product_slug, thickness, size, grade, price' },
  { type: 'images',   label: 'ðŸ–¼ Images',    desc: 'product_slug, image_url, sort_order' },
];

const STATUS_STYLE: Record<RowStatus, { bg: string; color: string; label: string }> = {
  valid:     { bg: 'rgba(37,211,102,0.1)',  color: '#25D366', label: 'âœ… Valid'     },
  duplicate: { bg: 'rgba(232,184,32,0.1)',  color: '#E8B820', label: 'âš ï¸ Duplicate' },
  error:     { bg: 'rgba(248,113,113,0.1)', color: '#F87171', label: 'âŒ Error'     },
};

export default function CatalogImport({ onSuccess }: { onSuccess?: () => void }) {
  const [activeTab, setActiveTab]       = useState<BatchType>('products');
  const [file, setFile]                 = useState<File | null>(null);
  const [dragging, setDragging]         = useState(false);
  const [previewing, setPreviewing]     = useState(false);
  const [importing, setImporting]       = useState(false);
  const [preview, setPreview]           = useState<PreviewResult | null>(null);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [error, setError]               = useState('');
  const [progress, setProgress]         = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null); setPreview(null); setImportResult(null);
    setError(''); setProgress(0);
  };

  const handleTabChange = (t: BatchType) => { setActiveTab(t); reset(); };

  const handleFile = (f: File) => {
    if (!f.name.endsWith('.csv')) { setError('Please upload a .csv file.'); return; }
    setFile(f); setPreview(null); setImportResult(null); setError('');
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handlePreview = async () => {
    if (!file) return;
    setPreviewing(true); setError('');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', activeTab);
    try {
      const res = await fetch('/api/import/preview', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Preview failed.'); return; }
      setPreview(data);
    } catch { setError('Network error during preview.'); }
    finally { setPreviewing(false); }
  };

  const handleImport = async () => {
    if (!preview?.batch_id) return;
    setImporting(true); setError(''); setProgress(0);

    // Simulate progress during the import
    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 3, 90));
    }, 150);

    try {
      const res = await fetch('/api/import/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_id: preview.batch_id, skip_errors: true }),
      });
      const data = await res.json();
      clearInterval(progressInterval);
      setProgress(100);
      if (!res.ok) { setError(data.error || 'Import failed.'); return; }
      setImportResult(data);
      onSuccess?.();
    } catch { setError('Network error during import.'); }
    finally { clearInterval(progressInterval); setImporting(false); }
  };

  const handleRollback = async () => {
    if (!importResult?.batch_id || !confirm('This will delete all rows imported in this batch. Are you sure?')) return;
    const res = await fetch('/api/import/execute', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch_id: importResult.batch_id }),
    });
    const data = await res.json();
    if (res.ok) { alert(`Rolled back ${data.deleted} rows.`); reset(); }
    else setError(data.error || 'Rollback failed.');
  };

  const downloadTemplate = () => {
    window.open(`/api/import/templates?type=${activeTab}`, '_blank');
  };

  // â”€â”€ Styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const s = {
    wrap:    { fontFamily: 'Outfit, sans-serif', color: '#F0E8DC' },
    tabBar:  { display: 'flex', gap: 4, marginBottom: 24, background: '#1C140D', border: '1px solid rgba(200,136,74,0.15)', borderRadius: 12, padding: 5, width: 'fit-content' },
    tab:     (active: boolean): React.CSSProperties => ({ padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13, background: active ? 'linear-gradient(135deg,#C8884A,#8B5E2A)' : 'transparent', color: active ? 'white' : '#9A8070', transition: 'all .2s' }),
    card:    { background: '#1C140D', border: '1px solid rgba(200,136,74,0.15)', borderRadius: 14, padding: 24, marginBottom: 16 },
    drop:    (dragging: boolean): React.CSSProperties => ({ border: `2px dashed ${dragging ? '#C8884A' : 'rgba(200,136,74,0.3)'}`, borderRadius: 10, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'rgba(200,136,74,0.06)' : 'transparent', transition: 'all .2s' }),
    btn:     (color: string): React.CSSProperties => ({ padding: '10px 22px', borderRadius: 8, border: 'none', background: color, color: 'white', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer' }),
    label:   { fontSize: 11, fontWeight: 700, color: '#9A8070', textTransform: 'uppercase' as const, letterSpacing: 1 },
  };

  const currentTab = TABS.find(t => t.type === activeTab)!;

  return (
    <div style={s.wrap}>

      {/* Tab bar */}
      <div style={s.tabBar}>
        {TABS.map(t => (
          <button key={t.type} onClick={() => handleTabChange(t.type)} style={s.tab(activeTab === t.type)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Template download + instructions */}
      <div style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#F0E8DC', marginBottom: 3 }}>
            {currentTab.label} CSV
          </div>
          <div style={{ fontSize: 12, color: '#9A8070' }}>
            Required columns: <span style={{ color: '#C8884A' }}>{currentTab.desc}</span>
          </div>
        </div>
        <button onClick={downloadTemplate} style={{ ...s.btn('rgba(200,136,74,0.15)'), color: '#E0A86A', border: '1px solid rgba(200,136,74,0.3)' }}>
          â¬‡ï¸ Download Template
        </button>
      </div>

      {/* Drop zone */}
      {!preview && !importResult && (
        <div style={s.card}>
          <div
            style={s.drop(dragging)}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>ðŸ“„</div>
            <div style={{ fontWeight: 600, color: '#C8B8A0', marginBottom: 4 }}>
              {file ? file.name : 'Drop your CSV here or click to browse'}
            </div>
            <div style={{ fontSize: 12, color: '#9A8070' }}>CSV files only Â· Max 1000 rows</div>
            {file && (
              <div style={{ marginTop: 10, fontSize: 12, color: '#25D366' }}>
                âœ… {file.name} ({(file.size / 1024).toFixed(1)} KB) â€” ready to preview
              </div>
            )}
            <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>

          {error && (
            <div style={{ marginTop: 12, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#F87171' }}>
              {error}
            </div>
          )}

          {file && (
            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <button onClick={handlePreview} disabled={previewing} style={s.btn(previewing ? '#5c4a2e' : 'linear-gradient(135deg,#C8884A,#8B5E2A)')}>
                {previewing ? 'â³ Validating...' : 'ðŸ” Preview & Validate'}
              </button>
              <button onClick={reset} style={{ ...s.btn('transparent'), border: '1px solid rgba(200,136,74,0.2)', color: '#9A8070' }}>
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Preview table */}
      {preview && !importResult && (
        <div style={s.card}>
          {/* Summary bar */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 13, color: '#9A8070' }}>Total: <strong style={{ color: '#F0E8DC' }}>{preview.total}</strong></div>
            <div style={{ fontSize: 13, color: '#25D366' }}>âœ… Valid: <strong>{preview.valid}</strong></div>
            {preview.duplicates > 0 && <div style={{ fontSize: 13, color: '#E8B820' }}>âš ï¸ Duplicates: <strong>{preview.duplicates}</strong></div>}
            {preview.errors > 0 && <div style={{ fontSize: 13, color: '#F87171' }}>âŒ Errors: <strong>{preview.errors}</strong></div>}
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto', marginBottom: 20 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(200,136,74,0.15)' }}>
                  {['Row', 'Status', ...Object.keys(preview.rows[0]?.preview || {}).slice(0, 5), 'Warnings'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#9A8070', textTransform: 'uppercase', letterSpacing: 0.8, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((r, i) => {
                  const st = STATUS_STYLE[r.status];
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(200,136,74,0.06)', background: i % 2 === 0 ? 'transparent' : 'rgba(200,136,74,0.02)' }}>
                      <td style={{ padding: '7px 12px', color: '#9A8070', fontSize: 11 }}>{r.row}</td>
                      <td style={{ padding: '7px 12px' }}>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                        {r.errors.length > 0 && (
                          <div style={{ fontSize: 10, color: '#F87171', marginTop: 2 }}>{r.errors.join(' Â· ')}</div>
                        )}
                      </td>
                      {Object.values(r.preview).slice(0, 5).map((v, vi) => (
                        <td key={vi} style={{ padding: '7px 12px', color: '#C8B8A0', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {String(v ?? 'â€”')}
                        </td>
                      ))}
                      <td style={{ padding: '7px 12px', color: '#E8B820', fontSize: 11 }}>
                        {r.warnings.join(' Â· ') || 'â€”'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {error && (
            <div style={{ marginBottom: 14, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#F87171' }}>
              {error}
            </div>
          )}

          {/* Progress bar during import */}
          {importing && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#9A8070', marginBottom: 6 }}>Importing... {progress}%</div>
              <div style={{ background: 'rgba(200,136,74,0.1)', borderRadius: 10, height: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg,#C8884A,#E0A86A)', borderRadius: 10, width: `${progress}%`, transition: 'width .2s' }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleImport}
              disabled={importing || preview.valid === 0}
              style={s.btn(importing || preview.valid === 0 ? '#5c4a2e' : '#25D366')}
            >
              {importing ? 'â³ Importing...' : `â¬†ï¸ Import ${preview.valid} Valid Row${preview.valid !== 1 ? 's' : ''}`}
            </button>
            <button onClick={reset} style={{ ...s.btn('transparent'), border: '1px solid rgba(200,136,74,0.2)', color: '#9A8070' }}>
              â† Back
            </button>
          </div>
          {preview.errors > 0 && (
            <div style={{ marginTop: 10, fontSize: 12, color: '#9A8070' }}>
              â„¹ï¸ {preview.errors} error row{preview.errors !== 1 ? 's' : ''} will be skipped automatically.
            </div>
          )}
        </div>
      )}

      {/* Import result */}
      {importResult && (
        <div style={s.card}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>
            {importResult.inserted > 0 ? 'ðŸŽ‰' : 'âš ï¸'}
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: '#F0E8DC', marginBottom: 6 }}>
            Import Complete
          </div>
          <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 14, color: '#25D366' }}>âœ… Inserted: <strong>{importResult.inserted}</strong></div>
            {importResult.skipped > 0 && <div style={{ fontSize: 14, color: '#E8B820' }}>âš ï¸ Skipped: <strong>{importResult.skipped}</strong></div>}
          </div>

          {importResult.errors?.length > 0 && (
            <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#F87171', marginBottom: 8 }}>Skipped rows:</div>
              {importResult.errors.map((e: any, i: number) => (
                <div key={i} style={{ fontSize: 12, color: '#FCA5A5', marginBottom: 3 }}>
                  Row {e.row}: {e.error}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={reset} style={s.btn('linear-gradient(135deg,#C8884A,#8B5E2A)')}>
              Import More
            </button>
            <button onClick={handleRollback} style={{ ...s.btn('rgba(248,113,113,0.1)'), color: '#F87171', border: '1px solid rgba(248,113,113,0.2)' }}>
              â†© Rollback This Import
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

