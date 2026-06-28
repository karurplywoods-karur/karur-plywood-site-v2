'use client';
// src/app/admin/categories/page.tsx
// Full category management — create, edit, delete, parent/sub tree,
// category image, icon, and SEO fields.

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/ImageUploader';

interface Category {
  id: number;
  name: string;
  slug: string;
  display_name: string;
  icon: string;
  description: string;
  parent_id: number | null;
  image_url: string;
  seo_title: string;
  seo_description: string;
  sort_order: number;
  is_active: boolean;
  base_price: number | null;
  price_unit: string;
}

const EMPTY: Partial<Category> = {
  name: '', slug: '', display_name: '', icon: '📦',
  description: '', parent_id: null, image_url: '',
  seo_title: '', seo_description: '',
  sort_order: 0, is_active: true, base_price: undefined, price_unit: 'per sheet',
};

const EMOJI_PRESETS = ['📦','🪵','🌊','🟫','⬜','🧱','🚪','🌿','✨','🔧','🏠','⚡','🎨','🛋️','🪑'];

function slugify(s: string) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editCat, setEditCat]       = useState<Category | null>(null);
  const [form, setForm]             = useState<Partial<Category>>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [msg, setMsg]               = useState<{ text: string; ok: boolean } | null>(null);

  const showMsg = (text: string, ok = true) => {
    setMsg({ text, ok }); setTimeout(() => setMsg(null), 3000);
  };

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/categories');
    if (res.status === 401) { router.push('/admin'); return; }
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openNew = (parentId?: number) => {
    setForm({ ...EMPTY, parent_id: parentId ?? null });
    setEditCat(null); setSlugTouched(false);
    setShowAdvanced(false); setShowForm(true);
  };

  const openEdit = (c: Category) => {
    setForm({ ...c });
    setEditCat(c); setSlugTouched(true);
    setShowAdvanced(!!(c.seo_title || c.seo_description || c.base_price));
    setShowForm(true);
  };

  const closeModal = () => { setShowForm(false); setEditCat(null); setForm(EMPTY); setShowEmojiPicker(false); };

  const handleNameChange = (v: string) => {
    if (!slugTouched) setForm(f => ({ ...f, name: v, slug: slugify(v), display_name: v }));
    else setForm(f => ({ ...f, name: v, display_name: v }));
  };

  const handleSave = async () => {
    if (!form.name?.trim()) { showMsg('Category name is required.', false); return; }
    setSaving(true);
    const payload = { ...form, slug: form.slug || slugify(form.name || '') };
    const res = editCat
      ? await fetch(`/api/categories/${editCat.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      : await fetch('/api/categories',               { method: 'POST',  headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) { showMsg(data.error || 'Error saving category.', false); }
    else { showMsg(editCat ? 'Category updated!' : 'Category created!'); closeModal(); fetchCategories(); }
    setSaving(false);
  };

  const handleDelete = async (c: Category) => {
    if (!confirm(`Delete "${c.name}"?`)) return;
    const res = await fetch(`/api/categories/${c.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) { showMsg('Category deleted.'); setCategories(prev => prev.filter(x => x.id !== c.id)); }
    else showMsg(data.error || 'Error deleting category.', false);
  };

  // Build parent→children tree for display
  const topLevel = categories.filter(c => !c.parent_id);
  const childrenOf = (id: number) => categories.filter(c => c.parent_id === id);

  const inp: React.CSSProperties = { width: '100%', background: '#0E0B08', border: '1px solid rgba(200,136,74,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#F0E8DC', fontFamily: 'Outfit,sans-serif', outline: 'none' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: '#9A8070', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 };
  const fg: React.CSSProperties = { marginBottom: 16 };

  function CategoryRow({ cat, depth = 0 }: { cat: Category; depth?: number }) {
    const children = childrenOf(cat.id);
    return (
      <>
        <tr style={{ borderTop: '1px solid rgba(200,136,74,0.08)' }}>
          <td style={{ padding: '12px 16px', paddingLeft: 16 + depth * 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {depth > 0 && <span style={{ color: '#9A8070', fontSize: 12 }}>└─</span>}
              {cat.image_url
                ? <img src={cat.image_url} alt={cat.name} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6 }} />
                : <span style={{ fontSize: 20 }}>{cat.icon || '📦'}</span>}
              <div>
                <div style={{ fontWeight: 600, color: '#F0E8DC' }}>{cat.name}</div>
                {cat.description && <div style={{ fontSize: 11, color: '#9A8070', marginTop: 1, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.description}</div>}
              </div>
            </div>
          </td>
          <td style={{ padding: '12px 16px', color: '#9A8070', fontFamily: 'monospace', fontSize: 12 }}>{cat.slug}</td>
          <td style={{ padding: '12px 16px', color: '#9A8070', fontSize: 12 }}>
            {cat.base_price ? `₹${cat.base_price.toLocaleString('en-IN')} ${cat.price_unit || ''}` : '—'}
          </td>
          <td style={{ padding: '12px 16px' }}>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: cat.is_active ? 'rgba(37,211,102,0.12)' : 'rgba(248,113,113,0.12)', color: cat.is_active ? '#25D366' : '#F87171' }}>
              {cat.is_active ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td style={{ padding: '12px 16px', textAlign: 'center', color: '#9A8070' }}>{cat.sort_order}</td>
          <td style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={() => openEdit(cat)} style={{ padding: '5px 10px', borderRadius: 6, background: 'rgba(200,136,74,0.1)', border: '1px solid rgba(200,136,74,0.2)', color: '#E0A86A', fontSize: 11, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>✏️ Edit</button>
              <button onClick={() => openNew(cat.id)} style={{ padding: '5px 10px', borderRadius: 6, background: 'rgba(200,136,74,0.06)', border: '1px solid rgba(200,136,74,0.15)', color: '#9A8070', fontSize: 11, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>+ Sub</button>
              <button onClick={() => handleDelete(cat)} style={{ padding: '5px 10px', borderRadius: 6, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', color: '#F87171', fontSize: 11, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>🗑️</button>
            </div>
          </td>
        </tr>
        {children.map(child => <CategoryRow key={child.id} cat={child} depth={depth + 1} />)}
      </>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0E0B08', color: '#F0E8DC', fontFamily: 'Outfit,sans-serif' }}>

      {/* Topbar */}
      <div style={{ background: '#1C140D', borderBottom: '1px solid rgba(200,136,74,0.15)', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => router.push('/admin/dashboard')} style={{ background: 'none', border: '1px solid rgba(200,136,74,0.2)', borderRadius: 8, color: '#9A8070', padding: '6px 12px', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontSize: 13 }}>
            ← Dashboard
          </button>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: 18, color: '#F0E8DC' }}>
            🏷️ Category Management
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {msg && (
            <div style={{ fontSize: 13, fontWeight: 600, color: msg.ok ? '#25D366' : '#F87171', background: msg.ok ? 'rgba(37,211,102,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${msg.ok ? 'rgba(37,211,102,0.2)' : 'rgba(248,113,113,0.2)'}`, borderRadius: 8, padding: '5px 14px' }}>
              {msg.text}
            </div>
          )}
          <button onClick={() => openNew()} style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#C8884A,#8B5E2A)', color: 'white', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
            + Add Category
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#9A8070' }}>⏳ Loading...</div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>🗂️</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: '#F0E8DC', marginBottom: 8 }}>No categories yet</div>
            <button onClick={() => openNew()} style={{ padding: '12px 28px', borderRadius: 8, background: 'linear-gradient(135deg,#C8884A,#8B5E2A)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
              + Add Category
            </button>
          </div>
        ) : (
          <div style={{ background: '#1C140D', border: '1px solid rgba(200,136,74,0.15)', borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'rgba(200,136,74,0.08)' }}>
                  {['Category', 'Slug', 'Base Price', 'Status', 'Sort', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9A8070', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topLevel.map(cat => <CategoryRow key={cat.id} cat={cat} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 20px', overflowY: 'auto' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#1C140D', borderRadius: 20, padding: 36, width: '100%', maxWidth: 580, border: '1px solid rgba(200,136,74,0.2)', marginBottom: 24 }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: '#F0E8DC' }}>
                {editCat ? 'Edit Category' : form.parent_id ? 'Add Sub-Category' : 'Add Category'}
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: '1px solid rgba(200,136,74,0.2)', borderRadius: 8, color: '#9A8070', padding: '5px 12px', cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>✕</button>
            </div>

            {/* Parent indicator */}
            {form.parent_id && (
              <div style={{ background: 'rgba(200,136,74,0.08)', border: '1px solid rgba(200,136,74,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#C8884A' }}>
                📁 Sub-category of: <strong>{categories.find(c => c.id === form.parent_id)?.name}</strong>
              </div>
            )}

            {/* Icon + Name row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12, ...fg, alignItems: 'flex-end' }}>
              <div>
                <label style={lbl}>Icon</label>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowEmojiPicker(v => !v)}
                    style={{ width: 52, height: 44, fontSize: 24, background: '#0E0B08', border: '1px solid rgba(200,136,74,0.2)', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {form.icon || '📦'}
                  </button>
                  {showEmojiPicker && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 10, background: '#1C140D', border: '1px solid rgba(200,136,74,0.2)', borderRadius: 10, padding: 10, display: 'flex', flexWrap: 'wrap', gap: 6, width: 220, marginTop: 4 }}>
                      {EMOJI_PRESETS.map(e => (
                        <button key={e} onClick={() => { setForm(f => ({ ...f, icon: e })); setShowEmojiPicker(false); }}
                          style={{ width: 36, height: 36, fontSize: 20, background: form.icon === e ? 'rgba(200,136,74,0.2)' : 'transparent', border: form.icon === e ? '1px solid #C8884A' : '1px solid transparent', borderRadius: 6, cursor: 'pointer' }}>
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label style={lbl}>Category Name *</label>
                <input style={inp} value={form.name || ''} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Marine Plywood" />
              </div>
            </div>

            {/* Slug */}
            <div style={fg}>
              <label style={lbl}>Slug</label>
              <input style={inp} value={form.slug || ''} onChange={e => { setSlugTouched(true); setForm(f => ({ ...f, slug: slugify(e.target.value) })); }} placeholder="marine-plywood" />
            </div>

            {/* Parent category */}
            <div style={fg}>
              <label style={lbl}>Parent Category</label>
              <select style={inp} value={form.parent_id ?? ''} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value ? Number(e.target.value) : null }))}>
                <option value="">— Top level (no parent) —</option>
                {categories.filter(c => !c.parent_id && c.id !== editCat?.id).map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div style={fg}>
              <label style={lbl}>Description</label>
              <textarea style={{ ...inp, resize: 'none' }} rows={2} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief category description..." />
            </div>

            {/* Category Image */}
            <div style={fg}>
              <ImageUploader
                value={form.image_url || ''}
                onChange={v => setForm(f => ({ ...f, image_url: v }))}
                folder="categories"
                label="Category Image"
                hint="Shown on category landing pages — recommended 800×600px"
              />
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
                    {form.is_active && <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 13, color: '#C8B8A0' }}>Active</span>
                </div>
              </div>
            </div>

            {/* Advanced */}
            <button onClick={() => setShowAdvanced(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#9A8070', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit,sans-serif', padding: '4px 0', marginBottom: showAdvanced ? 12 : 18, textTransform: 'uppercase', letterSpacing: 1 }}>
              <span style={{ display: 'inline-block', transform: showAdvanced ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}>▶</span>
              Pricing & SEO (optional)
            </button>

            {showAdvanced && (
              <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(200,136,74,0.1)', borderRadius: 8, padding: '14px 16px', marginBottom: 18 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, ...fg }}>
                  <div>
                    <label style={lbl}>Base Price (₹)</label>
                    <input style={inp} type="number" value={form.base_price ?? ''} onChange={e => setForm(f => ({ ...f, base_price: e.target.value ? Number(e.target.value) : undefined }))} placeholder="e.g. 3200" />
                  </div>
                  <div>
                    <label style={lbl}>Price Unit</label>
                    <input style={inp} value={form.price_unit || ''} onChange={e => setForm(f => ({ ...f, price_unit: e.target.value }))} placeholder="per sheet" />
                  </div>
                </div>
                <div style={fg}>
                  <label style={lbl}>SEO Title</label>
                  <input style={inp} value={form.seo_title || ''} onChange={e => setForm(f => ({ ...f, seo_title: e.target.value }))} placeholder="e.g. Marine Plywood in Karur | Karur Plywood" />
                </div>
                <div>
                  <label style={lbl}>SEO Description</label>
                  <textarea style={{ ...inp, resize: 'none' }} rows={2} value={form.seo_description || ''} onChange={e => setForm(f => ({ ...f, seo_description: e.target.value }))} placeholder="Meta description for category pages..." />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleSave} disabled={saving}
                style={{ flex: 1, padding: '13px 0', borderRadius: 8, background: saving ? '#5c4a2e' : 'linear-gradient(135deg,#C8884A,#8B5E2A)', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: saving ? 'default' : 'pointer', fontFamily: 'Outfit,sans-serif' }}>
                {saving ? '⏳ Saving...' : editCat ? '✓ Update Category' : '+ Create Category'}
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
