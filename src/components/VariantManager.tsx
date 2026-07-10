'use client';
// src/components/VariantManager.tsx
// Inline variant manager embedded inside the Admin product form modal.
// Shows a table of existing variants + a row form to add/edit one.

import { useState, useEffect, useCallback } from 'react';
import type { ProductVariant } from '@/lib/types';

interface Props {
  productId: string;
  // Called after any mutation so parent can refresh if needed
  onChange?: () => void;
}

const STOCK_OPTIONS = [
  { value: 'in_stock',      label: 'âœ… In Stock' },
  { value: 'low_stock',     label: 'ðŸŸ¡ Low Stock' },
  { value: 'out_of_stock',  label: 'âŒ Out of Stock' },
  { value: 'made_to_order', label: 'ðŸ›  Made to Order' },
];

const EMPTY_VARIANT = {
  thickness: '', size: '', grade: '', finish: '',
  color: '', pack_size: '',
  price: '', mrp: '',
  stock_status: 'in_stock' as ProductVariant['stock_status'],
  stock_quantity: '',
  is_default: false,
  sort_order: '',
};

type FormState = typeof EMPTY_VARIANT;

// â”€â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const inp: React.CSSProperties = {
  background: '#0E0B08',
  border: '1px solid rgba(200,136,74,0.2)',
  borderRadius: 6,
  padding: '7px 10px',
  fontSize: 12,
  color: '#F0E8DC',
  fontFamily: 'Outfit,sans-serif',
  outline: 'none',
  width: '100%',
};
const lbl: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  color: '#9A8070',
  textTransform: 'uppercase',
  letterSpacing: 1,
  marginBottom: 4,
  display: 'block',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      {children}
    </div>
  );
}

// â”€â”€â”€ component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function VariantManager({ productId, onChange }: Props) {
  const [variants, setVariants]       = useState<ProductVariant[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [editId, setEditId]           = useState<string | null>(null);
  const [form, setForm]               = useState<FormState>(EMPTY_VARIANT);
  const [saving, setSaving]           = useState(false);
  const [msg, setMsg]                 = useState<{ text: string; ok: boolean } | null>(null);

  const notify = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  };

  const fetchVariants = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/products/${productId}/variants`);
    const data = await res.json();
    setVariants(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [productId]);

  useEffect(() => { fetchVariants(); }, [fetchVariants]);

  const openAdd = () => {
    setForm(EMPTY_VARIANT);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (v: ProductVariant) => {
    setForm({
      thickness:      v.thickness      || '',
      size:           v.size           || '',
      grade:          v.grade          || '',
      finish:         v.finish         || '',
      color:          v.color          || '',
      pack_size:      v.pack_size      || '',
      price:          v.price          != null ? String(v.price)          : '',
      mrp:            v.mrp            != null ? String(v.mrp)            : '',
      stock_status:   v.stock_status,
      stock_quantity: v.stock_quantity != null ? String(v.stock_quantity) : '',
      is_default:     v.is_default,
      sort_order:     v.sort_order     != null ? String(v.sort_order)     : '',
    });
    setEditId(v.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this variant?')) return;
    const res = await fetch(`/api/products/${productId}/variants/${id}`, { method: 'DELETE' });
    if (res.ok) {
      notify('Variant deleted.');
      setVariants(v => v.filter(x => x.id !== id));
      onChange?.();
    } else {
      notify('Error deleting variant.', false);
    }
  };

  const handleSetDefault = async (id: string) => {
    const res = await fetch(`/api/products/${productId}/variants/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_default: true }),
    });
    if (res.ok) {
      notify('Default variant updated.');
      fetchVariants();
      onChange?.();
    } else {
      notify('Error updating default.', false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      price:          form.price          !== '' ? Number(form.price)          : null,
      mrp:            form.mrp            !== '' ? Number(form.mrp)            : null,
      stock_quantity: form.stock_quantity !== '' ? Number(form.stock_quantity) : 0,
      sort_order:     form.sort_order     !== '' ? Number(form.sort_order)     : 0,
    };

    const url = editId
      ? `/api/products/${productId}/variants/${editId}`
      : `/api/products/${productId}/variants`;
    const method = editId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      notify(data.error || 'Error saving variant.', false);
    } else {
      notify(editId ? 'Variant updated!' : 'Variant added!');
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_VARIANT);
      fetchVariants();
      onChange?.();
    }
    setSaving(false);
  };

  const f = (k: keyof FormState, v: unknown) =>
    setForm(prev => ({ ...prev, [k]: v }));

  // â”€â”€ discount preview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const discountPreview = (() => {
    const p = parseFloat(form.price);
    const m = parseFloat(form.mrp);
    if (!isNaN(p) && !isNaN(m) && m > p) {
      const pct = Math.round(((m - p) / m) * 100);
      return `âœ… ${pct}% off â€” saves â‚¹${(m - p).toLocaleString('en-IN')}`;
    }
    return null;
  })();

  return (
    <div style={{
      background: 'rgba(200,136,74,0.04)',
      border: '1px solid rgba(200,136,74,0.15)',
      borderRadius: 12,
      padding: 20,
      marginTop: 8,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#C8884A', textTransform: 'uppercase', letterSpacing: 1 }}>
            ðŸ“ Product Variants
          </div>
          <div style={{ fontSize: 11, color: '#9A8070', marginTop: 2 }}>
            Different sizes, grades, or finishes with individual pricing
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {msg && (
            <div style={{
              fontSize: 12, fontWeight: 600,
              color: msg.ok ? '#4ADE80' : '#F87171',
              background: msg.ok ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
              border: `1px solid ${msg.ok ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
              borderRadius: 6, padding: '4px 10px',
            }}>
              {msg.text}
            </div>
          )}
          {!showForm && (
            <button onClick={openAdd} style={{
              padding: '7px 14px', borderRadius: 6,
              background: 'rgba(200,136,74,0.15)',
              border: '1px solid rgba(200,136,74,0.3)',
              color: '#E0A86A', fontSize: 12,
              fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Outfit,sans-serif',
            }}>
              + Add Variant
            </button>
          )}
        </div>
      </div>

      {/* Existing variants table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '16px 0', color: '#9A8070', fontSize: 12 }}>
          Loading variants...
        </div>
      ) : variants.length === 0 && !showForm ? (
        <div style={{
          textAlign: 'center', padding: '20px 0',
          color: '#9A8070', fontSize: 12,
          borderTop: '1px dashed rgba(200,136,74,0.15)',
        }}>
          No variants yet. Add a variant to offer different sizes, grades, or prices.
        </div>
      ) : variants.length > 0 && (
        <div style={{ overflowX: 'auto', marginBottom: showForm ? 16 : 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(200,136,74,0.12)' }}>
                {['Thickness', 'Size', 'Grade', 'Finish/Color', 'MRP / Price', 'Stock', 'Default', ''].map(h => (
                  <th key={h} style={{
                    padding: '6px 10px', textAlign: 'left',
                    fontSize: 10, fontWeight: 700,
                    color: '#9A8070', textTransform: 'uppercase',
                    letterSpacing: 0.8, whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {variants.map((v, i) => {
                const discount = v.mrp && v.price && v.mrp > v.price
                  ? Math.round(((v.mrp - v.price) / v.mrp) * 100)
                  : null;
                return (
                  <tr key={v.id} style={{
                    borderBottom: '1px solid rgba(200,136,74,0.07)',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(200,136,74,0.02)',
                  }}>
                    <td style={{ padding: '8px 10px', color: '#F0E8DC', fontWeight: 600 }}>
                      {v.thickness || 'â€”'}
                    </td>
                    <td style={{ padding: '8px 10px', color: '#C8B8A0' }}>
                      {v.size || 'â€”'}
                    </td>
                    <td style={{ padding: '8px 10px', color: '#C8B8A0' }}>
                      {v.grade || 'â€”'}
                    </td>
                    <td style={{ padding: '8px 10px', color: '#C8B8A0' }}>
                      {[v.finish, v.color].filter(Boolean).join(' / ') || 'â€”'}
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      {v.mrp && (
                        <div style={{ fontSize: 10, color: '#9A8070', textDecoration: 'line-through' }}>
                          â‚¹{v.mrp.toLocaleString('en-IN')}
                        </div>
                      )}
                      <div style={{ color: '#E0A86A', fontWeight: 600 }}>
                        {v.price ? `â‚¹${v.price.toLocaleString('en-IN')}` : 'â€”'}
                      </div>
                      {discount && (
                        <div style={{ fontSize: 10, color: '#4ADE80' }}>{discount}% off</div>
                      )}
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600,
                        padding: '2px 8px', borderRadius: 10,
                        background: v.stock_status === 'in_stock'
                          ? 'rgba(37,211,102,0.12)'
                          : v.stock_status === 'low_stock'
                            ? 'rgba(232,184,32,0.12)'
                            : 'rgba(248,113,113,0.12)',
                        color: v.stock_status === 'in_stock'
                          ? '#25D366'
                          : v.stock_status === 'low_stock'
                            ? '#E8B820'
                            : '#F87171',
                      }}>
                        {STOCK_OPTIONS.find(s => s.value === v.stock_status)?.label || v.stock_status}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      {v.is_default ? (
                        <span style={{ fontSize: 11, color: '#C8884A', fontWeight: 600 }}>â˜… Default</span>
                      ) : (
                        <button onClick={() => handleSetDefault(v.id)} style={{
                          fontSize: 10, padding: '3px 8px', borderRadius: 4,
                          background: 'transparent',
                          border: '1px solid rgba(200,136,74,0.2)',
                          color: '#9A8070', cursor: 'pointer',
                          fontFamily: 'Outfit,sans-serif',
                        }}>
                          Set default
                        </button>
                      )}
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(v)} style={{
                          padding: '4px 9px', borderRadius: 5,
                          background: 'rgba(200,136,74,0.1)',
                          border: '1px solid rgba(200,136,74,0.2)',
                          color: '#E0A86A', fontSize: 11,
                          cursor: 'pointer', fontFamily: 'Outfit,sans-serif',
                        }}>âœï¸</button>
                        <button onClick={() => handleDelete(v.id)} style={{
                          padding: '4px 9px', borderRadius: 5,
                          background: 'rgba(248,113,113,0.08)',
                          border: '1px solid rgba(248,113,113,0.15)',
                          color: '#F87171', fontSize: 11,
                          cursor: 'pointer', fontFamily: 'Outfit,sans-serif',
                        }}>ðŸ—‘ï¸</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit variant form */}
      {showForm && (
        <div style={{
          borderTop: variants.length > 0 ? '1px solid rgba(200,136,74,0.12)' : undefined,
          paddingTop: variants.length > 0 ? 16 : 0,
          marginTop: variants.length > 0 ? 4 : 0,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#C8884A', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
            {editId ? 'âœï¸ Edit Variant' : '+ New Variant'}
          </div>

          {/* Row 1 â€” dimensions & grade */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 10 }}>
            <Field label="Thickness">
              <input style={inp} value={form.thickness}
                onChange={e => f('thickness', e.target.value)}
                placeholder="e.g. 18mm" />
            </Field>
            <Field label="Sheet Size">
              <input style={inp} value={form.size}
                onChange={e => f('size', e.target.value)}
                placeholder="e.g. 8Ã—4 ft" />
            </Field>
            <Field label="Grade">
              <input style={inp} value={form.grade}
                onChange={e => f('grade', e.target.value)}
                placeholder="e.g. BWR, MR, Marine" />
            </Field>
          </div>

          {/* Row 2 â€” finish, color, pack */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 10 }}>
            <Field label="Finish">
              <input style={inp} value={form.finish}
                onChange={e => f('finish', e.target.value)}
                placeholder="e.g. Glossy, Matt" />
            </Field>
            <Field label="Color / Design">
              <input style={inp} value={form.color}
                onChange={e => f('color', e.target.value)}
                placeholder="e.g. Walnut, White" />
            </Field>
            <Field label="Pack Size">
              <input style={inp} value={form.pack_size}
                onChange={e => f('pack_size', e.target.value)}
                placeholder="e.g. 1 sheet, Bundle of 5" />
            </Field>
          </div>

          {/* Row 3 â€” pricing */}
          <div style={{
            background: 'rgba(200,136,74,0.06)',
            border: '1px solid rgba(200,136,74,0.12)',
            borderRadius: 8, padding: '12px 14px', marginBottom: 10,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#C8884A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              ðŸ’° Variant Pricing
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <Field label="MRP (â‚¹) â€” crossed out">
                <input style={inp} type="number" value={form.mrp}
                  onChange={e => f('mrp', e.target.value)}
                  placeholder="e.g. 3500" />
              </Field>
              <Field label="Our Price (â‚¹)">
                <input style={{ ...inp, borderColor: 'rgba(200,136,74,0.35)' }} type="number" value={form.price}
                  onChange={e => f('price', e.target.value)}
                  placeholder="e.g. 2800" />
              </Field>
              <Field label="Sort Order">
                <input style={inp} type="number" value={form.sort_order}
                  onChange={e => f('sort_order', e.target.value)}
                  placeholder="0" />
              </Field>
            </div>
            {discountPreview && (
              <div style={{ marginTop: 8, fontSize: 11, color: '#4ADE80' }}>{discountPreview}</div>
            )}
          </div>

          {/* Row 4 â€” stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
            <Field label="Stock Status">
              <select style={{ ...inp, cursor: 'pointer' }} value={form.stock_status}
                onChange={e => f('stock_status', e.target.value as ProductVariant['stock_status'])}>
                {STOCK_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Qty in Stock">
              <input style={inp} type="number" value={form.stock_quantity}
                onChange={e => f('stock_quantity', e.target.value)}
                placeholder="0" />
            </Field>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
                onClick={() => f('is_default', !form.is_default)}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: 3,
                  border: '2px solid',
                  borderColor: form.is_default ? '#C8884A' : 'rgba(200,136,74,0.3)',
                  background: form.is_default ? '#C8884A' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {form.is_default && <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>âœ“</span>}
                </div>
                <span style={{ fontSize: 12, color: '#C8B8A0', fontWeight: 500 }}>Set as default</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleSave} disabled={saving} style={{
              flex: 1, padding: '10px 0', borderRadius: 7,
              background: saving ? '#5c4a2e' : 'linear-gradient(135deg,#C8884A,#8B5E2A)',
              color: 'white', border: 'none',
              fontWeight: 700, fontSize: 13,
              cursor: saving ? 'default' : 'pointer',
              fontFamily: 'Outfit,sans-serif',
            }}>
              {saving ? 'â³ Saving...' : editId ? 'âœ“ Update Variant' : '+ Save Variant'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_VARIANT); }} style={{
              padding: '10px 16px', borderRadius: 7,
              background: 'transparent',
              border: '1px solid rgba(200,136,74,0.2)',
              color: '#9A8070', fontSize: 13,
              cursor: 'pointer', fontFamily: 'Outfit,sans-serif',
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <style>{`
        input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }
        select option { background: #1C140D; }
      `}</style>
    </div>
  );
}

