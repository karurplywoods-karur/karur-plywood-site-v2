'use client';
// src/app/admin/brands/page.tsx
// Full brand management â€” create, edit, delete, logo upload, SEO fields

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/ImageUploader';

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url: string;
  description: string;
  website: string;
  seo_title: string;
  seo_description: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

const EMPTY: Partial<Brand> = {
  name: '', slug: '', logo_url: '', description: '',
  website: '', seo_title: '', seo_description: '',
  sort_order: 0, is_active: true,
};

function slugify(s: string) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function BrandsPage() {
  const router = useRouter();
  const [brands, setBrands]     = useState<Brand[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [form, setForm]         = useState<Partial<Brand>>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState<{ text: string; ok: boolean } | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const showMsg = (text: string, ok = true) => {
    setMsg({ text, ok }); setTimeout(() => setMsg(null), 3000);
  };

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/brands');
    if (res.status === 401) { router.push('/admin'); return; }
    const data = await res.json();
    setBrands(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const openNew = () => {
    setForm(EMPTY); setEditBrand(null);
    setSlugTouched(false); setShowAdvanced(false); setShowForm(true);
  };

  const openEdit = (b: Brand) => {
    setForm({ ...b });
    setEditBrand(b); setSlugTouched(true);
    setShowAdvanced(!!(b.seo_title || b.seo_description || b.website));
    setShowForm(true);
  };

  const closeModal = () => { setShowForm(false); setEditBrand(null); setForm(EMPTY); };

  const handleNameChange = (v: string) => {
    setForm(f => ({ ...f, name: v }));
    if (!slugTouched) setForm(f => ({ ...f, name: v, slug: slugify(v) }));
  };

  const handleSave = async () => {
    if (!form.name?.trim()) { showMsg('Brand name is required.', false); return; }
    setSaving(true);
    const payload = { ...form, slug: form.slug || slugify(form.name || '') };
    const res = editBrand
      ? await fetch(`/api/brands/${editBrand.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      : await fetch('/api/brands',                  { method: 'POST',  headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) { showMsg(data.error || 'Error saving brand.', false); }
    else {
      showMsg(editBrand ? 'Brand updated!' : 'Brand created!');
      closeModal(); fetchBrands();
    }
    setSaving(false);
  };

  const handleDelete = async (b: Brand) => {
    if (!confirm(`Delete brand "${b.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/brands/${b.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) { showMsg('Brand deleted.'); setBrands(prev => prev.filter(x => x.id !== b.id)); }
    else showMsg(data.error || 'Error deleting brand.', false);
  };

  const inp: React.CSSProperties = {
    width: '100%', background: '#0E0B08', border: '1px solid rgba(200,136,74,0.2)',
    borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#F0E8DC',
    fontFamily: 'Outfit,sans-serif', outline: 'none',
  };
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600, color: '#9A8070',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
  };
  const fg: React.CSSProperties = { marginBottom: 16 };

  return (
    <div style={{ minHeight: '100vh', background: '#0E0B08', color: '#F0E8DC', fontFamily: 'Outfit,sans-serif' }}>

      {/* Topbar */}
      <div style={{ background: '#1C140D', borderBottom: '1px solid rgba(200,136,74,0.15)', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => router.push('/admin/dashboard')}
            style={{ background: 'none', border: '1px solid rgba(200,136,74,0.2)', borderRadius: 8, color: '#9A8070', padding: '6px 12px', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontSize: 13 }}>
            â† Dashboard
          </button>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: 18, color: '#F0E8DC' }}>
            ðŸ·ï¸ Brand Management
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {msg && (
            <div style={{ fontSize: 13, fontWeight: 600, color: msg.ok ? '#25D366' : '#F87171', background: msg.ok ? 'rgba(37,211,102,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${msg.ok ? 'rgba(37,211,102,0.2)' : 'rgba(248,113,113,0.2)'}`, borderRadius: 8, padding: '5px 14px' }}>
              {msg.text}
            </div>
          )}
          <button onClick={openNew}
            style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#C8884A,#8B5E2A)', color: 'white', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
            + Add Brand
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#9A8070' }}>â³ Loading...</div>
        ) : brands.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>ðŸ·ï¸</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: '#F0E8DC', marginBottom: 8 }}>No brands yet</div>
            <p style={{ color: '#9A8070', marginBottom: 24 }}>Add your first brand â€” Century, Greenply, Hettich etc.</p>
            <button onClick={openNew}
              style={{ padding: '12px 28px', borderRadius: 8, background: 'linear-gradient(135deg,#C8884A,#8B5E2A)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
              + Add Brand
            </button>
          </div>
        ) : (
          <div style={{ background: '#1C140D', border: '1px solid rgba(200,136,74,0.15)', borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'rgba(200,136,74,0.08)' }}>
                  {['Logo', 'Brand', 'Slug', 'Website', 'Status', 'Sort', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9A8070', textTransform: 'uppercase', letterSpacing: 1 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {brands.map((b, i) => (
                  <tr key={b.id} style={{ borderTop: '1px solid rgba(200,136,74,0.08)', background: i % 2 === 0 ? 'transparent' : 'rgba(200,136,74,0.02)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      {b.logo_url
                        ? <img src={b.logo_url} alt={b.name} style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 6, background: 'rgba(255,255,255,0.05)' }} />
                        : <div style={{ width: 40, height: 40, borderRadius: 6, background: 'rgba(200,136,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>ðŸ·ï¸</div>
                      }
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#F0E8DC' }}>{b.name}</div>
                      {b.description && <div style={{ fontSize: 11, color: '#9A8070', marginTop: 2, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.description}</div>}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#9A8070', fontFamily: 'monospace', fontSize: 12 }}>{b.slug}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {b.website
                        ? <a href={b.website} target="_blank" rel="noopener" style={{ color: '#C8884A', fontSize: 12, textDecoration: 'none' }}>â†— {b.website.replace(/^https?:\/\//, '')}</a>
                        : <span style={{ color: '#9A8070', fontSize: 12 }}>â€”</span>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: b.is_active ? 'rgba(37,211,102,0.12)' : 'rgba(248,113,113,0.12)', color: b.is_active ? '#25D366' : '#F87171' }}>
                        {b.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#9A8070', textAlign: 'center' }}>{b.sort_order}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openEdit(b)} style={{ padding: '6px 12px', borderRadius: 6, background: 'rgba(200,136,74,0.1)', border: '1px solid rgba(200,136,74,0.2)', color: '#E0A86A', fontSize: 12, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>âœï¸ Edit</button>
                        <button onClick={() => handleDelete(b)} style={{ padding: '6px 12px', borderRadius: 6, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', color: '#F87171', fontSize: 12, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>ðŸ—‘ï¸</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 20px', overflowY: 'auto' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#1C140D', borderRadius: 20, padding: 36, width: '100%', maxWidth: 560, border: '1px solid rgba(200,136,74,0.2)', marginBottom: 24 }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: '#F0E8DC' }}>
                {editBrand ? 'Edit Brand' : 'Add Brand'}
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: '1px solid rgba(200,136,74,0.2)', borderRadius: 8, color: '#9A8070', padding: '5px 12px', cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>âœ•</button>
            </div>

            {/* Logo */}
            <div style={fg}>
              <ImageUploader
                value={form.logo_url || ''}
                onChange={v => setForm(f => ({ ...f, logo_url: v }))}
                folder="brands"
                label="Brand Logo"
                hint="PNG or SVG with transparent background â€” recommended 200Ã—200px"
              />
            </div>

            {/* Name */}
            <div style={fg}>
              <label style={lbl}>Brand Name *</label>
              <input style={inp} value={form.name || ''} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Century Ply" />
            </div>

            {/* Slug */}
            <div style={fg}>
              <label style={lbl}>Slug</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#0E0B08', border: '1px solid rgba(200,136,74,0.2)', borderRadius: 8, overflow: 'hidden' }}>
                <span style={{ padding: '10px 12px', fontSize: 12, color: '#9A8070', borderRight: '1px solid rgba(200,136,74,0.15)', whiteSpace: 'nowrap' }}>brand/</span>
                <input style={{ ...inp, border: 'none', borderRadius: 0 }} value={form.slug || ''} onChange={e => { setSlugTouched(true); setForm(f => ({ ...f, slug: slugify(e.target.value) })); }} placeholder="century-ply" />
              </div>
            </div>

            {/* Description */}
            <div style={fg}>
              <label style={lbl}>Description</label>
              <textarea style={{ ...inp, resize: 'none' }} rows={2} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief brand description..." />
            </div>

            {/* Website */}
            <div style={fg}>
              <label style={lbl}>Website URL</label>
              <input style={inp} value={form.website || ''} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://centuryply.com" />
            </div>

            {/* Sort + Active */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, ...fg }}>
              <div>
                <label style={lbl}>Sort Order</label>
                <input style={inp} type="number" value={form.sort_order ?? 0} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, border: '2px solid', borderColor: form.is_active ? '#25D366' : 'rgba(200,136,74,0.3)', background: form.is_active ? '#25D366' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {form.is_active && <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>âœ“</span>}
                  </div>
                  <span style={{ fontSize: 13, color: '#C8B8A0' }}>Active</span>
                </div>
              </div>
            </div>

            {/* Advanced â€” SEO */}
            <button onClick={() => setShowAdvanced(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#9A8070', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit,sans-serif', padding: '4px 0', marginBottom: showAdvanced ? 12 : 18, textTransform: 'uppercase', letterSpacing: 1 }}>
              <span style={{ display: 'inline-block', transform: showAdvanced ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}>â–¶</span>
              SEO (optional)
            </button>

            {showAdvanced && (
              <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(200,136,74,0.1)', borderRadius: 8, padding: '14px 16px', marginBottom: 18 }}>
                <div style={fg}>
                  <label style={lbl}>SEO Title</label>
                  <input style={inp} value={form.seo_title || ''} onChange={e => setForm(f => ({ ...f, seo_title: e.target.value }))} placeholder="e.g. Century Ply Products | Karur Plywood" />
                </div>
                <div>
                  <label style={lbl}>SEO Description</label>
                  <textarea style={{ ...inp, resize: 'none' }} rows={2} value={form.seo_description || ''} onChange={e => setForm(f => ({ ...f, seo_description: e.target.value }))} placeholder="Meta description for brand pages..." />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleSave} disabled={saving}
                style={{ flex: 1, padding: '13px 0', borderRadius: 8, background: saving ? '#5c4a2e' : 'linear-gradient(135deg,#C8884A,#8B5E2A)', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: saving ? 'default' : 'pointer', fontFamily: 'Outfit,sans-serif' }}>
                {saving ? 'â³ Saving...' : editBrand ? 'âœ“ Update Brand' : '+ Create Brand'}
              </button>
              <button onClick={closeModal}
                style={{ padding: '13px 20px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(200,136,74,0.2)', color: '#9A8070', fontSize: 14, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        input:focus,select:focus,textarea:focus { border-color:#C8884A !important; }
        select option { background:#1C140D; }
      `}</style>
    </div>
  );
}

