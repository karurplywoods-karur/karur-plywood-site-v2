'use client';
// src/app/admin/dashboard/page.tsx
// KEY FIX: Added MRP (crossed-out price) field to product add/edit form
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/ImageUploader';
import CatalogImport from '@/components/CatalogImport';
import VariantManager from '@/components/VariantManager';

function ImageUploaderInline({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  return <ImageUploader value={value} onChange={onChange} folder="products" label="Product Image" hint="Upload a photo or paste an image URL" />;
}

type Tab = 'products' | 'import' | 'enquiries' | 'reviews' | 'coupons';

interface Product {
  id: string;
  name: string;
  category_id: string | null;
  description: string;
  image_url: string;
  image_urls: string[];
  type: string;
  price: number | null;
  mrp: number | null;          // â† NEW
  unit: string;
  in_stock: boolean;
  categories?: { name: string; icon: string };
}
interface Category { id: string; name: string; slug: string; icon: string; }
interface Enquiry  { id: number; name: string; phone: string; location: string; product: string; message: string; status: string; created_at: string; }
interface Review   { id: number; name: string; role: string; rating: number; message: string; approved: boolean; created_at: string; }

const EMPTY_PRODUCT = {
  name: '', category_id: '', description: '',
  image_url: '', type: 'project', image_urls: [],
  price: '', mrp: '',             // â† NEW
  unit: '', in_stock: true,
};

const STATUS_COLORS: Record<string, string> = {
  new: '#25D366', contacted: '#E8B820', converted: '#C8884A', closed: '#9A8070',
};

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('products');
  const [products, setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [reviews, setReviews]     = useState<Review[]>([]);
  const [orderCounts, setOrderCounts] = useState<{ total: number; pending: number }>({ total: 0, pending: 0 });
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm]           = useState<any>(EMPTY_PRODUCT);
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState<{ text: string; ok: boolean } | null>(null);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const showMsg = (text: string, ok = true) => {
    setMsg({ text, ok }); setTimeout(() => setMsg(null), 3000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes, eRes, rRes, oRes] = await Promise.all([
        fetch('/api/products?all=1'), fetch('/api/categories'),
        fetch('/api/enquiries'),      fetch('/api/reviews?all=1'),
        fetch('/api/orders/admin'),
      ]);
      if (pRes.status === 401) { router.push('/admin'); return; }
      const [p, c, e, r, o] = await Promise.all([
        pRes.json(), cRes.json(), eRes.json(), rRes.json(), oRes.ok ? oRes.json() : [],
      ]);
      setProducts(Array.isArray(p) ? p : []);
      setCategories(Array.isArray(c) ? c : []);
      setEnquiries(Array.isArray(e) ? e : []);
      setReviews(Array.isArray(r) ? r : []);
      const orders = Array.isArray(o) ? o : [];
      setOrderCounts({
        total: orders.length,
        pending: orders.filter((ord: any) => ord.status === 'pending').length,
      });
    } catch { router.push('/admin'); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openNew = () => {
    setForm(EMPTY_PRODUCT); setEditProduct(null); setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name, category_id: p.category_id || '',
      description: p.description, image_url: p.image_url, image_urls: (p as any).image_urls || [],
      type: p.type,
      price: p.price || '',
      mrp: p.mrp || '',          // â† NEW
      unit: p.unit, in_stock: p.in_stock,
    });
    setEditProduct(p); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { showMsg('Product name is required.', false); return; }
    setSaving(true);
    const parsedPrice = form.price === '' || form.price === null || form.price === undefined
      ? null
      : Number(form.price);
    const parsedMrp = form.mrp === '' || form.mrp === null || form.mrp === undefined
      ? null
      : Number(form.mrp);

    if (parsedPrice !== null && !Number.isFinite(parsedPrice)) { showMsg('Enter a valid sale price.', false); setSaving(false); return; }
    if (parsedMrp !== null && !Number.isFinite(parsedMrp)) { showMsg('Enter a valid MRP.', false); setSaving(false); return; }

    const payload = {
      ...form,
      price: parsedPrice,
      mrp:   parsedMrp,
      category_id: form.category_id || null,
    };
    try {
      const res = editProduct
        ? await fetch(`/api/products/${editProduct.id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/products', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
      const data = await res.json();
      if (!res.ok) {
        showMsg(data.hint || data.error || 'Error saving product.', false);
      } else {
        setProducts(prev => editProduct
          ? prev.map(p => p.id === data.id ? data : p)
          : [data, ...prev]
        );
        showMsg(editProduct ? 'Product updated!' : 'Product added!');
        setShowForm(false);
        setEditProduct(null);
        setForm(EMPTY_PRODUCT);
      }
    } catch { showMsg('Network error.', false); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) { showMsg('Product deleted.'); setProducts(p => p.filter(x => x.id !== id)); }
    else showMsg('Error deleting product.', false);
  };

  const updateEnquiryStatus = async (id: number, status: string) => {
    await fetch(`/api/enquiries/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setEnquiries(e => e.map(x => x.id === id ? { ...x, status } : x));
  };
  const deleteEnquiry = async (id: number) => {
    if (!confirm('Delete this enquiry?')) return;
    await fetch(`/api/enquiries/${id}`, { method: 'DELETE' });
    setEnquiries(e => e.filter(x => x.id !== id));
  };
  const toggleReview = async (id: number, approved: boolean) => {
    await fetch(`/api/reviews/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: !approved }),
    });
    setReviews(r => r.map(x => x.id === id ? { ...x, approved: !x.approved } : x));
  };
  const deleteReview = async (id: number) => {
    if (!confirm('Delete this review?')) return;
    await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    setReviews(r => r.filter(x => x.id !== id));
  };
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }); router.push('/admin');
  };

  const inp: React.CSSProperties = {
    width: '100%', background: '#0E0B08',
    border: '1px solid rgba(200,136,74,0.2)', borderRadius: 8,
    padding: '10px 14px', fontSize: 14, color: '#F0E8DC',
    fontFamily: 'Outfit,sans-serif', outline: 'none',
  };
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: '#9A8070', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
  };
  const fg: React.CSSProperties = { marginBottom: 16 };

  const tabBtn = (t: Tab, label: string) => (
    <button onClick={() => setTab(t)} style={{
      padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
      fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13,
      background: tab === t ? 'linear-gradient(135deg,#C8884A,#8B5E2A)' : 'transparent',
      color: tab === t ? 'white' : '#9A8070', transition: 'all 0.2s',
    }}>
      {label}
    </button>
  );

  const filteredEnquiries = enquiries.filter(e => {
    const ms  = statusFilter === 'all' || e.status === statusFilter;
    const ms2 = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.phone.includes(search);
    return ms && ms2;
  });

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0E0B08', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>â³</div>
        <div style={{ color: '#9A8070' }}>Loading...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0E0B08', color: '#F0E8DC', fontFamily: 'Outfit,sans-serif' }}>

      {/* Topbar */}
      <div style={{ background: '#1C140D', borderBottom: '1px solid rgba(200,136,74,0.15)', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#C8884A,#8B5E2A)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>ðŸªµ</div>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Admin Dashboard</div>
            <div style={{ fontSize: 10, color: '#9A8070' }}>Karur Plywood &amp; Company</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {msg && (
            <div style={{ fontSize: 13, fontWeight: 600, color: msg.ok ? '#25D366' : '#F87171', background: msg.ok ? 'rgba(37,211,102,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${msg.ok ? 'rgba(37,211,102,0.2)' : 'rgba(248,113,113,0.2)'}`, borderRadius: 8, padding: '6px 14px' }}>
              {msg.text}
            </div>
          )}
          <a href="/" target="_blank" style={{ fontSize: 13, color: '#9A8070', textDecoration: 'none', padding: '6px 12px', border: '1px solid rgba(200,136,74,0.2)', borderRadius: 7 }}>ðŸŒ Site</a>
          <button onClick={logout} style={{ fontSize: 13, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171', borderRadius: 7, padding: '6px 12px', cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 28px' }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14, marginBottom: 28 }} className="stats-grid">
          <a href="/admin/orders" style={{
            background: orderCounts.pending > 0 ? 'rgba(249,115,22,0.12)' : '#1C140D',
            border: orderCounts.pending > 0 ? '1px solid rgba(249,115,22,0.5)' : '1px solid rgba(200,136,74,0.15)',
            borderRadius: 14, padding: '20px 22px', textDecoration: 'none', display: 'block', position: 'relative',
          }}>
            {orderCounts.pending > 0 && (
              <div style={{ position: 'absolute', top: 14, right: 14, background: '#F97316', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '2px 8px' }}>
                {orderCounts.pending} new
              </div>
            )}
            <div style={{ fontSize: 24, marginBottom: 8 }}>ðŸ§¾</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 700, color: '#E0A86A', lineHeight: 1 }}>{orderCounts.total}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#F0E8DC', marginTop: 4 }}>Orders</div>
            <div style={{ fontSize: 11, color: '#9A8070', marginTop: 2 }}>{orderCounts.pending} pending â†’</div>
          </a>

          {/* Low stock alert card */}
          {(() => {
            const outOfStock = products.filter(p => !p.in_stock);
            return (
              <div style={{
                background: outOfStock.length > 0 ? 'rgba(239,68,68,0.08)' : '#1C140D',
                border: outOfStock.length > 0 ? '1px solid rgba(239,68,68,0.35)' : '1px solid rgba(200,136,74,0.15)',
                borderRadius: 14, padding: '20px 22px', position: 'relative',
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>ðŸ“¦</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 700, color: outOfStock.length > 0 ? '#F87171' : '#E0A86A', lineHeight: 1 }}>{outOfStock.length}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F0E8DC', marginTop: 4 }}>Out of Stock</div>
                {outOfStock.length > 0 ? (
                  <div style={{ fontSize: 11, color: '#F87171', marginTop: 4, lineHeight: 1.5 }}>
                    {outOfStock.slice(0, 2).map(p => p.name).join(', ')}{outOfStock.length > 2 ? ` +${outOfStock.length - 2} more` : ''}
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: '#9A8070', marginTop: 2 }}>All products in stock âœ“</div>
                )}
              </div>
            );
          })()}
          {[
            { icon: 'ðŸ“¦', num: products.length, label: 'Products', sub: `${products.filter(p => p.type === 'project').length} project Â· ${products.filter(p => p.type === 'quick').length} quick` },
            { icon: 'ðŸ“‹', num: enquiries.length, label: 'Enquiries', sub: `${enquiries.filter(e => e.status === 'new').length} new` },
            { icon: 'â­', num: reviews.length, label: 'Reviews', sub: `${reviews.filter(r => r.approved).length} published` },
            { icon: 'ðŸ·ï¸', num: categories.length, label: 'Categories', sub: 'Product categories' },
          ].map(s => (
            <div key={s.label} style={{ background: '#1C140D', border: '1px solid rgba(200,136,74,0.15)', borderRadius: 14, padding: '20px 22px' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 700, color: '#E0A86A', lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#F0E8DC', marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: '#9A8070', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#1C140D', border: '1px solid rgba(200,136,74,0.15)', borderRadius: 12, padding: 5, width: 'fit-content', flexWrap: 'wrap' }}>
          {tabBtn('products', `ðŸ“¦ Products (${products.length})`)}
          {tabBtn('import', 'ðŸ“¥ Import CSV')}
          {tabBtn('enquiries', `ðŸ“‹ Enquiries (${enquiries.filter(e => e.status === 'new').length} new)`)}
          {tabBtn('reviews', `â­ Reviews (${reviews.filter(r => !r.approved).length} pending)`)}
          {tabBtn('coupons', 'ðŸŽŸï¸ Coupons')}
          <a href="/admin/orders" style={{ padding: '9px 20px', borderRadius: 8, fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 13, background: orderCounts.pending > 0 ? 'rgba(249,115,22,0.15)' : 'transparent', color: orderCounts.pending > 0 ? '#F97316' : '#9A8070', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>ðŸ§¾ Orders{orderCounts.pending > 0 ? ` (${orderCounts.pending})` : ''} â†—</a>
          <a href="/admin/brands"     style={{ padding: '9px 20px', borderRadius: 8, fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13, background: 'transparent', color: '#9A8070', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>ðŸ·ï¸ Brands â†—</a>
          <a href="/admin/categories" style={{ padding: '9px 20px', borderRadius: 8, fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13, background: 'transparent', color: '#9A8070', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>ðŸ—‚ï¸ Categories â†—</a>
          <a href="/admin/blog"       style={{ padding: '9px 20px', borderRadius: 8, fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13, background: 'transparent', color: '#9A8070', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>ðŸ“ Blog CMS â†—</a>
          <a href="/admin/architects" style={{ padding: '9px 20px', borderRadius: 8, fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13, background: 'transparent', color: '#9A8070', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>ðŸ›ï¸ Architects â†—</a>
          <a href="/admin/carpenters" style={{ padding: '9px 20px', borderRadius: 8, fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13, background: 'transparent', color: '#9A8070', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>ðŸ”¨ Carpenters â†—</a>
        </div>

        {/* â”€â”€ BULK UPLOAD TAB â”€â”€ */}
        {tab === 'import' && <CatalogImport onSuccess={() => { fetchAll(); setTab('products'); }} />}

        {/* â”€â”€ PRODUCTS TAB â”€â”€ */}
        {tab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 700, color: '#F0E8DC' }}>Product Management</div>
              <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#C8884A,#8B5E2A)', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
                + Add Product
              </button>
            </div>
            <div style={{ background: '#1C140D', border: '1px solid rgba(200,136,74,0.15)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'rgba(200,136,74,0.08)' }}>
                      {['Product', 'Category', 'Type', 'MRP / Price', 'Stock', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9A8070', textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 && (
                      <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#9A8070' }}>No products yet. Click "Add Product" to get started.</td></tr>
                    )}
                    {products.map((p, i) => (
                      <tr key={p.id} style={{ borderTop: '1px solid rgba(200,136,74,0.08)', background: i % 2 === 0 ? 'transparent' : 'rgba(200,136,74,0.02)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600, color: '#F0E8DC', marginBottom: 2 }}>{p.name}</div>
                          {p.description && <div style={{ fontSize: 11, color: '#9A8070', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</div>}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#C8B8A0' }}>{p.categories ? `${p.categories.icon} ${p.categories.name}` : 'â€”'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: p.type === 'quick' ? 'rgba(37,211,102,0.12)' : 'rgba(200,136,74,0.12)', color: p.type === 'quick' ? '#25D366' : '#E0A86A' }}>
                            {p.type === 'quick' ? 'âš¡ Quick' : 'ðŸ  Project'}
                          </span>
                        </td>
                        {/* â”€â”€ MRP / PRICE COLUMN â”€â”€ */}
                        <td style={{ padding: '12px 16px' }}>
                          {p.mrp && (
                            <div style={{ fontSize: 11, color: '#9A8070', textDecoration: 'line-through', marginBottom: 2 }}>
                              â‚¹{p.mrp.toLocaleString('en-IN')} MRP
                            </div>
                          )}
                          <div style={{ color: '#E0A86A', fontWeight: 600 }}>
                            {p.price ? `â‚¹${p.price.toLocaleString('en-IN')}` : 'â€”'}
                            {p.unit && <span style={{ fontSize: 11, color: '#9A8070', fontWeight: 400 }}> {p.unit}</span>}
                          </div>
                          {p.mrp && p.price && (
                            <div style={{ fontSize: 10, color: '#4ADE80', marginTop: 2 }}>
                              {Math.round(((p.mrp - p.price) / p.mrp) * 100)}% off
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: p.in_stock ? 'rgba(37,211,102,0.12)' : 'rgba(248,113,113,0.12)', color: p.in_stock ? '#25D366' : '#F87171' }}>
                            {p.in_stock ? 'In Stock' : 'Out'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => openEdit(p)} style={{ padding: '6px 12px', borderRadius: 6, background: 'rgba(200,136,74,0.1)', border: '1px solid rgba(200,136,74,0.2)', color: '#E0A86A', fontSize: 12, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>âœï¸ Edit</button>
                            <button onClick={() => handleDelete(p.id, p.name)} style={{ padding: '6px 12px', borderRadius: 6, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', color: '#F87171', fontSize: 12, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>ðŸ—‘ï¸</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* â”€â”€ ENQUIRIES TAB â”€â”€ */}
        {tab === 'enquiries' && (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ðŸ” Search name or phone..."
                style={{ ...inp, flex: 1, minWidth: 200 }} />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                style={{ ...inp, width: 'auto', cursor: 'pointer' }}>
                <option value="all">All Statuses</option>
                <option value="new">ðŸŸ¢ New</option>
                <option value="contacted">ðŸŸ¡ Contacted</option>
                <option value="converted">ðŸŸ  Converted</option>
                <option value="closed">âš« Closed</option>
              </select>
            </div>
            {filteredEnquiries.length === 0 && <div style={{ textAlign: 'center', padding: '60px 0', color: '#9A8070' }}>No enquiries found.</div>}
            {filteredEnquiries.map(e => (
              <div key={e.id} style={{ background: '#1C140D', border: '1px solid rgba(200,136,74,0.15)', borderRadius: 14, padding: '20px 22px', marginBottom: 12, display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }} className="enq-card">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 700, color: '#F0E8DC' }}>{e.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: `${STATUS_COLORS[e.status]}20`, color: STATUS_COLORS[e.status], textTransform: 'uppercase', letterSpacing: 0.5 }}>{e.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 13, color: '#9A8070', marginBottom: e.message ? 8 : 0 }}>
                    <span>ðŸ“ž {e.phone}</span>
                    {e.location && <span>ðŸ“ {e.location}</span>}
                    {e.product && <span style={{ color: '#C8884A' }}>ðŸ“¦ {e.product}</span>}
                    <span>ðŸ• {new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  {e.message && <div style={{ fontSize: 13, color: '#9A8070', fontStyle: 'italic', lineHeight: 1.6 }}>"{e.message}"</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 140 }}>
                  <a href={`https://wa.me/${e.phone.replace(/\D/g, '')}?text=Hi+${encodeURIComponent(e.name)}%2C+this+is+Karur+Plywood.+Regarding+your+enquiry...`}
                    target="_blank" rel="noopener"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px 0', borderRadius: 7, background: '#25D366', color: 'white', fontWeight: 600, fontSize: 12, textDecoration: 'none' }}>
                    ðŸ’¬ Reply
                  </a>
                  {e.status === 'converted' && (
                    <button onClick={async () => {
                      const res = await fetch('/api/admin/review-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enquiry_id: e.id }) });
                      const d = await res.json();
                      if (d.wa_url) { window.open(d.wa_url, '_blank'); showMsg('â­ Review request WA opened!'); }
                      else showMsg(d.error || 'Error sending.', false);
                    }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px 0', borderRadius: 7, background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.25)', color: '#FDE047', fontSize: 11, cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontWeight: 600 }}>
                      â­ Request Review
                    </button>
                  )}
                  <select value={e.status} onChange={ev => updateEnquiryStatus(e.id, ev.target.value)}
                    style={{ ...inp, fontSize: 12, padding: '7px 10px', cursor: 'pointer' }}>
                    <option value="new">ðŸŸ¢ New</option>
                    <option value="contacted">ðŸŸ¡ Contacted</option>
                    <option value="converted">ðŸŸ  Converted</option>
                    <option value="closed">âš« Closed</option>
                  </select>
                  <button onClick={() => deleteEnquiry(e.id)} style={{ padding: '7px 0', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 7, color: '#F87171', fontSize: 12, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>ðŸ—‘ï¸ Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* â”€â”€ REVIEWS TAB â”€â”€ */}
        {tab === 'reviews' && (
          <div>
            <div style={{ fontSize: 13, color: '#9A8070', marginBottom: 20 }}>{reviews.filter(r => !r.approved).length} pending Â· {reviews.filter(r => r.approved).length} published</div>
            {reviews.length === 0 && <div style={{ textAlign: 'center', padding: '60px 0', color: '#9A8070' }}>No reviews yet.</div>}
            {reviews.map(r => (
              <div key={r.id} style={{ background: '#1C140D', border: `1px solid ${r.approved ? 'rgba(200,136,74,0.15)' : 'rgba(248,113,113,0.15)'}`, borderRadius: 14, padding: '20px 22px', marginBottom: 12, display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: '#F0E8DC' }}>{r.name}</span>
                    {r.role && <span style={{ fontSize: 12, color: '#9A8070' }}>{r.role}</span>}
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: r.approved ? 'rgba(37,211,102,0.12)' : 'rgba(248,113,113,0.12)', color: r.approved ? '#25D366' : '#F87171' }}>
                      {r.approved ? 'âœ“ Published' : 'â³ Pending'}
                    </span>
                  </div>
                  <div style={{ color: '#E8B820', fontSize: 14, marginBottom: 6 }}>{'â˜…'.repeat(r.rating)}{'â˜†'.repeat(5 - r.rating)}</div>
                  <div style={{ fontSize: 13, color: '#9A8070', lineHeight: 1.7, fontStyle: 'italic' }}>"{r.message}"</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 110 }}>
                  <button onClick={() => toggleReview(r.id, r.approved)} style={{ padding: '8px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 12, background: r.approved ? 'rgba(248,113,113,0.1)' : 'rgba(37,211,102,0.15)', color: r.approved ? '#F87171' : '#25D366' }}>
                    {r.approved ? 'Unpublish' : 'âœ“ Approve'}
                  </button>
                  <button onClick={() => deleteReview(r.id)} style={{ padding: '8px 12px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 7, color: '#F87171', fontSize: 12, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>ðŸ—‘ï¸ Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* â”€â”€ COUPONS TAB â”€â”€ */}
        {tab === 'coupons' && (
          <CouponsPanel />
        )}
      </div>

      {/* â”€â”€ PRODUCT FORM MODAL â”€â”€ */}
      {showForm && (
        <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#1C140D', borderRadius: 20, padding: 36, width: '100%', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto', border: '1px solid rgba(200,136,74,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 700, color: '#F0E8DC' }}>
                {editProduct ? 'Edit Product' : 'Add Product'}
              </div>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: '1px solid rgba(200,136,74,0.2)', borderRadius: 8, color: '#9A8070', padding: '5px 12px', cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>âœ•</button>
            </div>

            {/* Name */}
            <div style={fg}>
              <label style={lbl}>Product Name *</label>
              <input style={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. BWR Grade Plywood 18mm" />
            </div>

            {/* Type + Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, ...fg }}>
              <div>
                <label style={lbl}>Type *</label>
                <select style={inp} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="project">ðŸ  Project</option>
                  <option value="quick">âš¡ Quick Order</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Category</label>
                <select style={inp} value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
            </div>

            {/* Description */}
            <div style={fg}>
              <label style={lbl}>Description</label>
              <textarea style={{ ...inp, resize: 'none' }} rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short product description..." />
            </div>

            {/* Image */}
            <div style={fg}>
              <ImageUploaderInline value={form.image_url} onChange={(url: string) => setForm({ ...form, image_url: url })} />

              {/* Additional images */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, color: '#9A8070', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Additional Images (up to 4)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[0, 1, 2, 3].map(i => (
                    <ImageUploader
                      key={i}
                      value={(form.image_urls || [])[i] || ''}
                      onChange={(url: string) => {
                        const arr = [...(form.image_urls || [])];
                        arr[i] = url;
                        setForm({ ...form, image_urls: arr.filter(Boolean) });
                      }}
                      folder="products"
                      label={`Image ${i + 2}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* â”€â”€ MRP + SELLING PRICE â”€â”€ KEY FIX */}
            <div style={{ background: 'rgba(200,136,74,0.06)', border: '1px solid rgba(200,136,74,0.15)', borderRadius: 10, padding: '16px 16px 4px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#C8884A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                ðŸ’° Pricing
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ ...lbl, color: '#9A8070' }}>MRP (â‚¹) <span style={{ color: '#9A8070', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>â€” crossed out</span></label>
                  <input style={inp} type="number" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} placeholder="e.g. 3500" />
                </div>
                <div>
                  <label style={{ ...lbl, color: '#E0A86A' }}>Our Price (â‚¹) *</label>
                  <input style={{ ...inp, borderColor: 'rgba(200,136,74,0.4)' }} type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="e.g. 2800" />
                </div>
                <div>
                  <label style={lbl}>Unit</label>
                  <input style={inp} value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="per sheet" />
                </div>
              </div>
              {/* Live discount preview */}
              {form.mrp && form.price && parseFloat(form.mrp) > parseFloat(form.price) && (
                <div style={{ fontSize: 12, color: '#4ADE80', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  âœ… Customer saves â‚¹{(parseFloat(form.mrp) - parseFloat(form.price)).toLocaleString('en-IN')} ({Math.round(((parseFloat(form.mrp) - parseFloat(form.price)) / parseFloat(form.mrp)) * 100)}% off MRP)
                </div>
              )}
            </div>

            {/* In Stock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '14px 16px', background: 'rgba(200,136,74,0.06)', borderRadius: 10, border: '1px solid rgba(200,136,74,0.12)', cursor: 'pointer' }}
              onClick={() => setForm({ ...form, in_stock: !form.in_stock })}>
              <div style={{ width: 20, height: 20, borderRadius: 4, border: '2px solid', borderColor: form.in_stock ? '#25D366' : 'rgba(200,136,74,0.3)', background: form.in_stock ? '#25D366' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                {form.in_stock && <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>âœ“</span>}
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#C8B8A0' }}>Product is in stock</span>
            </div>

            {/* â”€â”€ VARIANTS â€” only available after product is created â”€â”€ */}
            {editProduct ? (
              <div style={{ marginBottom: 24 }}>
                <VariantManager productId={String(editProduct.id)} onChange={fetchAll} />
              </div>
            ) : (
              <div style={{
                marginBottom: 24, padding: '12px 16px',
                background: 'rgba(200,136,74,0.04)',
                border: '1px dashed rgba(200,136,74,0.2)',
                borderRadius: 10, fontSize: 12, color: '#9A8070', textAlign: 'center',
              }}>
                ðŸ“ <strong style={{ color: '#C8884A' }}>Variants</strong> (thickness, size, grade, price per variant) can be added after the product is saved. Save this product first, then click âœï¸ Edit to manage variants.
              </div>
            )}

            {/* Save */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '13px 0', borderRadius: 8, background: saving ? '#5c4a2e' : 'linear-gradient(135deg,#C8884A,#8B5E2A)', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: saving ? 'default' : 'pointer', fontFamily: 'Outfit,sans-serif' }}>
                {saving ? 'â³ Saving...' : editProduct ? 'âœ“ Update Product' : '+ Add Product'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ padding: '13px 20px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(200,136,74,0.2)', color: '#9A8070', fontSize: 14, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        input:focus,select:focus,textarea:focus{border-color:#C8884A!important}
        select option{background:#1C140D}
        @media(max-width:768px){.stats-grid{grid-template-columns:repeat(2,1fr)!important} div[style*="padding: 28px 28px"]{padding:20px!important} .enq-card{grid-template-columns:1fr!important}}
        @media(max-width:480px){.stats-grid{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  );
}

// â”€â”€ CouponsPanel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CouponsPanel() {
  const [coupons,  setCoupons]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [form, setForm] = useState({
    code: '', description: '', discount_type: 'percent',
    discount_value: '', min_order_value: '', max_discount: '',
    usage_limit: '', expires_at: '',
  });

  const fetchCoupons = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/coupons');
    if (res.ok) setCoupons(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSave = async () => {
    if (!form.code || !form.discount_value) return;
    setSaving(true);
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code:            form.code.toUpperCase().trim(),
        description:     form.description,
        discount_type:   form.discount_type,
        discount_value:  parseFloat(form.discount_value),
        min_order_value: form.min_order_value ? parseFloat(form.min_order_value) : 0,
        max_discount:    form.max_discount    ? parseFloat(form.max_discount)    : null,
        usage_limit:     form.usage_limit     ? parseInt(form.usage_limit)       : null,
        expires_at:      form.expires_at      ? new Date(form.expires_at).toISOString() : null,
      }),
    });
    if (res.ok) { setShowForm(false); setForm({ code:'',description:'',discount_type:'percent',discount_value:'',min_order_value:'',max_discount:'',usage_limit:'',expires_at:'' }); fetchCoupons(); }
    setSaving(false);
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch('/api/admin/coupons', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, is_active: !active }) });
    fetchCoupons();
  };

  const s: React.CSSProperties = { background: '#0E0B08', border: '1px solid rgba(200,136,74,0.2)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#F0E8DC', fontFamily: 'Outfit,sans-serif', width: '100%', outline: 'none', boxSizing: 'border-box' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#9A8070' }}>{coupons.filter(c => c.is_active).length} active Â· {coupons.length} total</div>
        <button onClick={() => setShowForm(true)} style={{ padding: '9px 18px', borderRadius: 8, background: 'linear-gradient(135deg,#C8884A,#8B5E2A)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12 }}>+ New Coupon</button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#9A8070' }}>Loadingâ€¦</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {coupons.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#9A8070' }}>No coupons yet. Create your first one.</div>}
          {coupons.map(c => (
            <div key={c.id} style={{ background: '#1C140D', border: `1px solid ${c.is_active ? 'rgba(200,136,74,0.15)' : 'rgba(100,100,100,0.15)'}`, borderRadius: 14, padding: '16px 20px', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 16, alignItems: 'center', opacity: c.is_active ? 1 : 0.5 }}>
              <div style={{ background: 'rgba(249,115,22,0.1)', border: '1px dashed rgba(249,115,22,0.3)', borderRadius: 8, padding: '8px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#F97316', fontSize: 15, letterSpacing: 2 }}>{c.code}</div>
              <div>
                <div style={{ fontSize: 13, color: '#F0E8DC', fontWeight: 600 }}>{c.description || 'â€”'}</div>
                <div style={{ fontSize: 12, color: '#9A8070', marginTop: 3 }}>
                  {c.discount_type === 'percent' ? `${c.discount_value}% off` : `â‚¹${c.discount_value} off`}
                  {c.min_order_value > 0 ? ` Â· Min â‚¹${c.min_order_value}` : ''}
                  {c.max_discount ? ` Â· Cap â‚¹${c.max_discount}` : ''}
                  {c.usage_limit ? ` Â· ${c.used_count}/${c.usage_limit} used` : ` Â· ${c.used_count} used`}
                  {c.expires_at ? ` Â· Expires ${new Date(c.expires_at).toLocaleDateString('en-IN')}` : ''}
                </div>
              </div>
              <button onClick={() => toggleActive(c.id, c.is_active)} style={{ padding: '7px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontSize: 12, fontWeight: 600, background: c.is_active ? 'rgba(248,113,113,0.1)' : 'rgba(37,211,102,0.1)', color: c.is_active ? '#F87171' : '#25D366' }}>
                {c.is_active ? 'Disable' : 'Enable'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* New coupon form */}
      {showForm && (
        <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#1C140D', borderRadius: 16, padding: 28, width: '100%', maxWidth: 500, border: '1px solid rgba(200,136,74,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#F0E8DC', marginBottom: 20 }}>ðŸŽŸï¸ New Coupon</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div><label style={{ fontSize: 10, color: '#9A8070', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Code *</label><input style={s} value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="WELCOME10" /></div>
              <div><label style={{ fontSize: 10, color: '#9A8070', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Type *</label>
                <select style={s} value={form.discount_type} onChange={e => setForm({...form, discount_type: e.target.value})}>
                  <option value="percent">Percentage (%)</option>
                  <option value="flat">Flat (â‚¹)</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}><label style={{ fontSize: 10, color: '#9A8070', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Description (internal label)</label><input style={s} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="10% off first order" /></div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div><label style={{ fontSize: 10, color: '#9A8070', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Value *</label><input style={s} type="number" value={form.discount_value} onChange={e => setForm({...form, discount_value: e.target.value})} placeholder={form.discount_type === 'percent' ? '10' : '200'} /></div>
              <div><label style={{ fontSize: 10, color: '#9A8070', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Min Order (â‚¹)</label><input style={s} type="number" value={form.min_order_value} onChange={e => setForm({...form, min_order_value: e.target.value})} placeholder="500" /></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div><label style={{ fontSize: 10, color: '#9A8070', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Max Discount (â‚¹)</label><input style={s} type="number" value={form.max_discount} onChange={e => setForm({...form, max_discount: e.target.value})} placeholder="Optional" /></div>
              <div><label style={{ fontSize: 10, color: '#9A8070', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Usage Limit</label><input style={s} type="number" value={form.usage_limit} onChange={e => setForm({...form, usage_limit: e.target.value})} placeholder="Unlimited" /></div>
            </div>

            <div style={{ marginBottom: 20 }}><label style={{ fontSize: 10, color: '#9A8070', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Expiry Date (optional)</label><input style={s} type="date" value={form.expires_at} onChange={e => setForm({...form, expires_at: e.target.value})} /></div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={() => setShowForm(false)} style={{ padding: 12, borderRadius: 8, background: 'transparent', border: '1px solid rgba(200,136,74,0.2)', color: '#9A8070', cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: 12, borderRadius: 8, background: saving ? '#5c4a2e' : 'linear-gradient(135deg,#C8884A,#8B5E2A)', border: 'none', color: '#fff', cursor: saving ? 'default' : 'pointer', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12 }}>
                {saving ? 'Savingâ€¦' : '+ Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
