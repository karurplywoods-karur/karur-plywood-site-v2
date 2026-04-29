'use client';
// src/app/admin/dashboard/page.tsx
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/ImageUploader';
import BulkUpload from '@/components/BulkUpload';

// Thin wrapper to avoid prop drilling
function ImageUploaderInline({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  return <ImageUploader value={value} onChange={onChange} folder="products" label="Product Image" hint="Upload a photo or paste an image URL" />;
}

type Tab = 'products' | 'bulk' | 'enquiries' | 'reviews';
interface Product { id:string; name:string; category_id:string|null; description:string; image_url:string; type:string; price:number|null; unit:string; in_stock:boolean; categories?:{name:string;icon:string}; }
interface Category { id:string; name:string; slug:string; icon:string; }
interface Enquiry { id:number; name:string; phone:string; location:string; product:string; message:string; status:string; created_at:string; }
interface Review { id:number; name:string; role:string; rating:number; message:string; approved:boolean; created_at:string; }

const EMPTY_PRODUCT = { name:'', category_id:'', description:'', image_url:'', type:'project', price:'', unit:'', in_stock:true };
const STATUS_COLORS: Record<string,string> = { new:'#25D366',contacted:'#E8B820',converted:'#C8884A',closed:'#9A8070' };

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<any>(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{text:string;ok:boolean}|null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const showMsg = (text:string, ok=true) => { setMsg({text,ok}); setTimeout(()=>setMsg(null),3000); };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes, eRes, rRes] = await Promise.all([
        fetch('/api/products?all=1'), fetch('/api/categories'),
        fetch('/api/enquiries'), fetch('/api/reviews?all=1'),
      ]);
      if (pRes.status===401) { router.push('/admin'); return; }
      const [p,c,e,r] = await Promise.all([pRes.json(),cRes.json(),eRes.json(),rRes.json()]);
      setProducts(Array.isArray(p)?p:[]);
      setCategories(Array.isArray(c)?c:[]);
      setEnquiries(Array.isArray(e)?e:[]);
      setReviews(Array.isArray(r)?r:[]);
    } catch { router.push('/admin'); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openNew = () => { setForm(EMPTY_PRODUCT); setEditProduct(null); setShowForm(true); };
  const openEdit = (p: Product) => { setForm({ name:p.name, category_id:p.category_id||'', description:p.description, image_url:p.image_url, type:p.type, price:p.price||'', unit:p.unit, in_stock:p.in_stock }); setEditProduct(p); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { showMsg('Product name is required.', false); return; }
    setSaving(true);
    const payload = { ...form, price: form.price ? parseFloat(form.price) : null, category_id: form.category_id || null };
    try {
      const res = editProduct
        ? await fetch(`/api/products/${editProduct.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
        : await fetch('/api/products', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      if (!res.ok) { const d = await res.json(); showMsg(d.error||'Error saving product.', false); }
      else { showMsg(editProduct ? 'Product updated!' : 'Product added!'); setShowForm(false); fetchAll(); }
    } catch { showMsg('Network error.', false); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const res = await fetch(`/api/products/${id}`, { method:'DELETE' });
    if (res.ok) { showMsg('Product deleted.'); setProducts(p=>p.filter(x=>x.id!==id)); }
    else showMsg('Error deleting product.', false);
  };

  const updateEnquiryStatus = async (id:number, status:string) => {
    await fetch(`/api/enquiries/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status}) });
    setEnquiries(e=>e.map(x=>x.id===id?{...x,status}:x));
  };
  const deleteEnquiry = async (id:number) => {
    if (!confirm('Delete this enquiry?')) return;
    await fetch(`/api/enquiries/${id}`, { method:'DELETE' });
    setEnquiries(e=>e.filter(x=>x.id!==id));
  };
  const toggleReview = async (id:number, approved:boolean) => {
    await fetch(`/api/reviews/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({approved:!approved}) });
    setReviews(r=>r.map(x=>x.id===id?{...x,approved:!x.approved}:x));
  };
  const deleteReview = async (id:number) => {
    if (!confirm('Delete this review?')) return;
    await fetch(`/api/reviews/${id}`, { method:'DELETE' });
    setReviews(r=>r.filter(x=>x.id!==id));
  };
  const logout = async () => { await fetch('/api/auth/logout',{method:'POST'}); router.push('/admin'); };

  const inp: React.CSSProperties = { width:'100%',background:'#0E0B08',border:'1px solid rgba(200,136,74,0.2)',borderRadius:8,padding:'10px 14px',fontSize:14,color:'#F0E8DC',fontFamily:'Outfit,sans-serif',outline:'none' };
  const lbl: React.CSSProperties = { display:'block',fontSize:11,fontWeight:600,color:'#9A8070',textTransform:'uppercase',letterSpacing:1,marginBottom:6 };
  const fg: React.CSSProperties = { marginBottom:16 };
  const tabBtn = (t:Tab,label:string) => (
    <button onClick={()=>setTab(t)} style={{ padding:'9px 20px',borderRadius:8,border:'none',cursor:'pointer',fontFamily:'Outfit,sans-serif',fontWeight:600,fontSize:13,
      background:tab===t?'linear-gradient(135deg,#C8884A,#8B5E2A)':'transparent', color:tab===t?'white':'#9A8070', transition:'all 0.2s' }}>
      {label}
    </button>
  );

  const filteredEnquiries = enquiries.filter(e=>{
    const ms = statusFilter==='all'||e.status===statusFilter;
    const ms2 = !search||e.name.toLowerCase().includes(search.toLowerCase())||e.phone.includes(search);
    return ms&&ms2;
  });

  if (loading) return (
    <div style={{ minHeight:'100vh',background:'#0E0B08',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}><div style={{ fontSize:40,marginBottom:12 }}>⏳</div><div style={{ color:'#9A8070' }}>Loading...</div></div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh',background:'#0E0B08',color:'#F0E8DC',fontFamily:'Outfit,sans-serif' }}>

      {/* Topbar */}
      <div style={{ background:'#1C140D',borderBottom:'1px solid rgba(200,136,74,0.15)',padding:'0 28px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100 }}>
        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
          <div style={{ width:32,height:32,background:'linear-gradient(135deg,#C8884A,#8B5E2A)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15 }}>🪵</div>
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif",fontWeight:700,fontSize:15,lineHeight:1.2 }}>Admin Dashboard</div>
            <div style={{ fontSize:10,color:'#9A8070' }}>Karur Plywood &amp; Company</div>
          </div>
        </div>
        <div style={{ display:'flex',gap:10,alignItems:'center' }}>
          {msg && <div style={{ fontSize:13,fontWeight:600,color:msg.ok?'#25D366':'#F87171',background:msg.ok?'rgba(37,211,102,0.1)':'rgba(248,113,113,0.1)',border:`1px solid ${msg.ok?'rgba(37,211,102,0.2)':'rgba(248,113,113,0.2)'}`,borderRadius:8,padding:'6px 14px' }}>{msg.text}</div>}
          <a href="/" target="_blank" style={{ fontSize:13,color:'#9A8070',textDecoration:'none',padding:'6px 12px',border:'1px solid rgba(200,136,74,0.2)',borderRadius:7 }}>🌐 Site</a>
          <button onClick={logout} style={{ fontSize:13,background:'rgba(248,113,113,0.1)',border:'1px solid rgba(248,113,113,0.2)',color:'#F87171',borderRadius:7,padding:'6px 12px',cursor:'pointer',fontFamily:'Outfit,sans-serif' }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth:1200,margin:'0 auto',padding:'28px 28px' }}>

        {/* Stats row */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:28 }} className="stats-grid">
          {[
            {icon:'📦',num:products.length,label:'Products',sub:`${products.filter(p=>p.type==='project').length} project · ${products.filter(p=>p.type==='quick').length} quick`},
            {icon:'📋',num:enquiries.length,label:'Enquiries',sub:`${enquiries.filter(e=>e.status==='new').length} new`},
            {icon:'⭐',num:reviews.length,label:'Reviews',sub:`${reviews.filter(r=>r.approved).length} published`},
            {icon:'🏷️',num:categories.length,label:'Categories',sub:'Product categories'},
          ].map(s=>(
            <div key={s.label} style={{ background:'#1C140D',border:'1px solid rgba(200,136,74,0.15)',borderRadius:14,padding:'20px 22px' }}>
              <div style={{ fontSize:24,marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:700,color:'#E0A86A',lineHeight:1 }}>{s.num}</div>
              <div style={{ fontSize:13,fontWeight:600,color:'#F0E8DC',marginTop:4 }}>{s.label}</div>
              <div style={{ fontSize:11,color:'#9A8070',marginTop:2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div style={{ display:'flex',gap:4,marginBottom:24,background:'#1C140D',border:'1px solid rgba(200,136,74,0.15)',borderRadius:12,padding:5,width:'fit-content',flexWrap:'wrap' }}>
          {tabBtn('products',`📦 Products (${products.length})`)}
          {tabBtn('bulk','⬆️ Bulk Upload')}
          {tabBtn('enquiries',`📋 Enquiries (${enquiries.filter(e=>e.status==='new').length} new)`)}
          {tabBtn('reviews',`⭐ Reviews (${reviews.filter(r=>!r.approved).length} pending)`)}
          <a href="/admin/blog" style={{ padding:'9px 20px',borderRadius:8,fontFamily:'Outfit,sans-serif',fontWeight:600,fontSize:13,background:'transparent',color:'#9A8070',textDecoration:'none',display:'flex',alignItems:'center' }}>
            📝 Blog CMS ↗
          </a>
          <a href="/admin/architects" style={{ padding:'9px 20px',borderRadius:8,fontFamily:'Outfit,sans-serif',fontWeight:600,fontSize:13,background:'transparent',color:'#9A8070',textDecoration:'none',display:'flex',alignItems:'center' }}>
            🏛️ Architects ↗
          </a>
          <a href="/admin/carpenters" style={{ padding:'9px 20px',borderRadius:8,fontFamily:'Outfit,sans-serif',fontWeight:600,fontSize:13,background:'transparent',color:'#9A8070',textDecoration:'none',display:'flex',alignItems:'center' }}>
            🔨 Carpenters ↗
          </a>
        </div>

        {/* ── BULK UPLOAD TAB ── */}
        {tab==='bulk' && (
          <BulkUpload onSuccess={() => { fetchAll(); setTab('products'); }} />
        )}

        {/* ── PRODUCTS TAB ── */}
        {tab==='products' && (
          <div>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:12 }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:700,color:'#F0E8DC' }}>Product Management</div>
              <button onClick={openNew}
                style={{ display:'flex',alignItems:'center',gap:8,padding:'10px 20px',borderRadius:8,background:'linear-gradient(135deg,#C8884A,#8B5E2A)',color:'white',border:'none',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'Outfit,sans-serif' }}>
                + Add Product
              </button>
            </div>

            {/* Product table */}
            <div style={{ background:'#1C140D',border:'1px solid rgba(200,136,74,0.15)',borderRadius:16,overflow:'hidden' }}>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%',borderCollapse:'collapse',fontSize:13 }}>
                  <thead>
                    <tr style={{ background:'rgba(200,136,74,0.08)' }}>
                      {['Product','Category','Type','Price','Stock','Actions'].map(h=>(
                        <th key={h} style={{ padding:'12px 16px',textAlign:'left',fontSize:11,fontWeight:700,color:'#9A8070',textTransform:'uppercase',letterSpacing:1,whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.length===0 && (
                      <tr><td colSpan={6} style={{ padding:'40px',textAlign:'center',color:'#9A8070' }}>No products yet. Click "Add Product" to get started.</td></tr>
                    )}
                    {products.map((p,i)=>(
                      <tr key={p.id} style={{ borderTop:'1px solid rgba(200,136,74,0.08)',background:i%2===0?'transparent':'rgba(200,136,74,0.02)' }}>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ fontWeight:600,color:'#F0E8DC',marginBottom:2 }}>{p.name}</div>
                          {p.description&&<div style={{ fontSize:11,color:'#9A8070',maxWidth:240,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{p.description}</div>}
                        </td>
                        <td style={{ padding:'12px 16px',color:'#C8B8A0' }}>{p.categories?`${p.categories.icon} ${p.categories.name}`:'—'}</td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{ fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:20,
                            background:p.type==='quick'?'rgba(37,211,102,0.12)':'rgba(200,136,74,0.12)',
                            color:p.type==='quick'?'#25D366':'#E0A86A' }}>
                            {p.type==='quick'?'⚡ Quick':'🏠 Project'}
                          </span>
                        </td>
                        <td style={{ padding:'12px 16px',color:'#E0A86A',fontWeight:600 }}>
                          {p.price?`₹${p.price.toLocaleString('en-IN')}`:'—'}
                          {p.unit&&<span style={{ fontSize:11,color:'#9A8070',fontWeight:400 }}> {p.unit}</span>}
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{ fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:20,background:p.in_stock?'rgba(37,211,102,0.12)':'rgba(248,113,113,0.12)',color:p.in_stock?'#25D366':'#F87171' }}>
                            {p.in_stock?'In Stock':'Out'}
                          </span>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ display:'flex',gap:8 }}>
                            <button onClick={()=>openEdit(p)} style={{ padding:'6px 12px',borderRadius:6,background:'rgba(200,136,74,0.1)',border:'1px solid rgba(200,136,74,0.2)',color:'#E0A86A',fontSize:12,cursor:'pointer',fontFamily:'Outfit,sans-serif' }}>✏️ Edit</button>
                            <button onClick={()=>handleDelete(p.id,p.name)} style={{ padding:'6px 12px',borderRadius:6,background:'rgba(248,113,113,0.08)',border:'1px solid rgba(248,113,113,0.15)',color:'#F87171',fontSize:12,cursor:'pointer',fontFamily:'Outfit,sans-serif' }}>🗑️</button>
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

        {/* ── ENQUIRIES TAB ── */}
        {tab==='enquiries' && (
          <div>
            <div style={{ display:'flex',gap:12,marginBottom:20,flexWrap:'wrap' }}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search name or phone..."
                style={{ ...inp,flex:1,minWidth:200 }}/>
              <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
                style={{ ...inp,width:'auto',cursor:'pointer' }}>
                <option value="all">All Statuses</option>
                <option value="new">🟢 New</option>
                <option value="contacted">🟡 Contacted</option>
                <option value="converted">🟠 Converted</option>
                <option value="closed">⚫ Closed</option>
              </select>
            </div>
            {filteredEnquiries.length===0&&<div style={{ textAlign:'center',padding:'60px 0',color:'#9A8070' }}>No enquiries found.</div>}
            {filteredEnquiries.map(e=>(
              <div key={e.id} style={{ background:'#1C140D',border:'1px solid rgba(200,136,74,0.15)',borderRadius:14,padding:'20px 22px',marginBottom:12,display:'grid',gridTemplateColumns:'1fr auto',gap:16,alignItems:'start' }} className="enq-card">
                <div>
                  <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:6,flexWrap:'wrap' }}>
                    <span style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontWeight:700,color:'#F0E8DC' }}>{e.name}</span>
                    <span style={{ fontSize:10,fontWeight:600,padding:'3px 9px',borderRadius:20,background:`${STATUS_COLORS[e.status]}20`,color:STATUS_COLORS[e.status],textTransform:'uppercase',letterSpacing:0.5 }}>{e.status}</span>
                  </div>
                  <div style={{ display:'flex',gap:18,flexWrap:'wrap',fontSize:13,color:'#9A8070',marginBottom:e.message?8:0 }}>
                    <span>📞 {e.phone}</span>
                    {e.location&&<span>📍 {e.location}</span>}
                    {e.product&&<span style={{ color:'#C8884A' }}>📦 {e.product}</span>}
                    <span>🕐 {new Date(e.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
                  </div>
                  {e.message&&<div style={{ fontSize:13,color:'#9A8070',fontStyle:'italic',lineHeight:1.6 }}>"{e.message}"</div>}
                </div>
                <div style={{ display:'flex',flexDirection:'column',gap:8,minWidth:140 }}>
                  <a href={`https://wa.me/${e.phone.replace(/\D/g,'')}?text=Hi+${encodeURIComponent(e.name)}%2C+this+is+Karur+Plywood.+Regarding+your+enquiry...`}
                    target="_blank" rel="noopener"
                    style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'7px 0',borderRadius:7,background:'#25D366',color:'white',fontWeight:600,fontSize:12,textDecoration:'none' }}>
                    💬 Reply
                  </a>
                  {e.status==='converted'&&(
                    <button onClick={async()=>{
                      const res=await fetch('/api/admin/review-request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({enquiry_id:e.id})});
                      const d=await res.json();
                      if(d.wa_url){window.open(d.wa_url,'_blank');showMsg('⭐ Review request WA opened!');}
                      else showMsg(d.error||'Error sending.',false);
                    }}
                      style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'7px 0',borderRadius:7,background:'rgba(250,204,21,0.1)',border:'1px solid rgba(250,204,21,0.25)',color:'#FDE047',fontSize:11,cursor:'pointer',fontFamily:'Outfit,sans-serif',fontWeight:600 }}>
                      ⭐ Request Review
                    </button>
                  )}
                  <select value={e.status} onChange={ev=>updateEnquiryStatus(e.id,ev.target.value)}
                    style={{ ...inp,fontSize:12,padding:'7px 10px',cursor:'pointer' }}>
                    <option value="new">🟢 New</option>
                    <option value="contacted">🟡 Contacted</option>
                    <option value="converted">🟠 Converted</option>
                    <option value="closed">⚫ Closed</option>
                  </select>
                  <button onClick={()=>deleteEnquiry(e.id)} style={{ padding:'7px 0',background:'rgba(248,113,113,0.08)',border:'1px solid rgba(248,113,113,0.15)',borderRadius:7,color:'#F87171',fontSize:12,cursor:'pointer',fontFamily:'Outfit,sans-serif' }}>🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── REVIEWS TAB ── */}
        {tab==='reviews' && (
          <div>
            <div style={{ fontSize:13,color:'#9A8070',marginBottom:20 }}>{reviews.filter(r=>!r.approved).length} pending · {reviews.filter(r=>r.approved).length} published</div>
            {reviews.length===0&&<div style={{ textAlign:'center',padding:'60px 0',color:'#9A8070' }}>No reviews yet.</div>}
            {reviews.map(r=>(
              <div key={r.id} style={{ background:'#1C140D',border:`1px solid ${r.approved?'rgba(200,136,74,0.15)':'rgba(248,113,113,0.15)'}`,borderRadius:14,padding:'20px 22px',marginBottom:12,display:'grid',gridTemplateColumns:'1fr auto',gap:16,alignItems:'start' }}>
                <div>
                  <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:6,flexWrap:'wrap' }}>
                    <span style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontWeight:700,color:'#F0E8DC' }}>{r.name}</span>
                    {r.role&&<span style={{ fontSize:12,color:'#9A8070' }}>{r.role}</span>}
                    <span style={{ fontSize:10,fontWeight:600,padding:'3px 9px',borderRadius:20,background:r.approved?'rgba(37,211,102,0.12)':'rgba(248,113,113,0.12)',color:r.approved?'#25D366':'#F87171' }}>
                      {r.approved?'✓ Published':'⏳ Pending'}
                    </span>
                  </div>
                  <div style={{ color:'#E8B820',fontSize:14,marginBottom:6 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
                  <div style={{ fontSize:13,color:'#9A8070',lineHeight:1.7,fontStyle:'italic' }}>"{r.message}"</div>
                </div>
                <div style={{ display:'flex',flexDirection:'column',gap:8,minWidth:110 }}>
                  <button onClick={()=>toggleReview(r.id,r.approved)}
                    style={{ padding:'8px 12px',borderRadius:7,border:'none',cursor:'pointer',fontFamily:'Outfit,sans-serif',fontWeight:600,fontSize:12,
                      background:r.approved?'rgba(248,113,113,0.1)':'rgba(37,211,102,0.15)',color:r.approved?'#F87171':'#25D366' }}>
                    {r.approved?'Unpublish':'✓ Approve'}
                  </button>
                  <button onClick={()=>deleteReview(r.id)} style={{ padding:'8px 12px',background:'rgba(248,113,113,0.08)',border:'1px solid rgba(248,113,113,0.15)',borderRadius:7,color:'#F87171',fontSize:12,cursor:'pointer',fontFamily:'Outfit,sans-serif' }}>🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── PRODUCT FORM MODAL ── */}
      {showForm && (
        <div onClick={()=>setShowForm(false)} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:'#1C140D',borderRadius:20,padding:36,width:'100%',maxWidth:540,maxHeight:'90vh',overflowY:'auto',border:'1px solid rgba(200,136,74,0.2)' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24 }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:700,color:'#F0E8DC' }}>{editProduct?'Edit Product':'Add Product'}</div>
              <button onClick={()=>setShowForm(false)} style={{ background:'none',border:'1px solid rgba(200,136,74,0.2)',borderRadius:8,color:'#9A8070',padding:'5px 12px',cursor:'pointer',fontFamily:'Outfit,sans-serif' }}>✕</button>
            </div>

            <div style={fg}><label style={lbl}>Product Name *</label><input style={inp} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. BWR Grade Plywood 18mm"/></div>

            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,...fg }}>
              <div>
                <label style={lbl}>Type *</label>
                <select style={inp} value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                  <option value="project">🏠 Project</option>
                  <option value="quick">⚡ Quick Order</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Category</label>
                <select style={inp} value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}>
                  <option value="">Select category</option>
                  {categories.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
            </div>

            <div style={fg}><label style={lbl}>Description</label><textarea style={{...inp,resize:'none'}} rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Short product description..."/></div>

            <div style={fg}>
              <ImageUploaderInline value={form.image_url} onChange={(url:string)=>setForm({...form,image_url:url})} />
            </div>

            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,...fg }}>
              <div><label style={lbl}>Price (₹)</label><input style={inp} type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="0.00"/></div>
              <div><label style={lbl}>Unit</label><input style={inp} value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} placeholder="per sheet, per kg..."/></div>
            </div>

            <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:24,padding:'14px 16px',background:'rgba(200,136,74,0.06)',borderRadius:10,border:'1px solid rgba(200,136,74,0.12)',cursor:'pointer' }}
              onClick={()=>setForm({...form,in_stock:!form.in_stock})}>
              <div style={{ width:20,height:20,borderRadius:4,border:'2px solid',borderColor:form.in_stock?'#25D366':'rgba(200,136,74,0.3)',background:form.in_stock?'#25D366':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.15s' }}>
                {form.in_stock&&<span style={{ color:'white',fontSize:12,fontWeight:700 }}>✓</span>}
              </div>
              <span style={{ fontSize:14,fontWeight:500,color:'#C8B8A0' }}>Product is in stock</span>
            </div>

            <div style={{ display:'flex',gap:12 }}>
              <button onClick={handleSave} disabled={saving}
                style={{ flex:1,padding:'13px 0',borderRadius:8,background:saving?'#5c4a2e':'linear-gradient(135deg,#C8884A,#8B5E2A)',color:'white',border:'none',fontWeight:700,fontSize:14,cursor:saving?'default':'pointer',fontFamily:'Outfit,sans-serif' }}>
                {saving?'⏳ Saving...':editProduct?'✓ Update Product':'+ Add Product'}
              </button>
              <button onClick={()=>setShowForm(false)} style={{ padding:'13px 20px',borderRadius:8,background:'transparent',border:'1px solid rgba(200,136,74,0.2)',color:'#9A8070',fontSize:14,cursor:'pointer',fontFamily:'Outfit,sans-serif' }}>Cancel</button>
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
