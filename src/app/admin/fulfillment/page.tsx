'use client';
// src/app/admin/fulfillment/page.tsx
// Manage which products go through the Reserve Order flow (DISTRIBUTOR /
// SPECIAL_ORDER = verification before payment) vs plain Buy Now (READY_STOCK),
// and maintain the distributor list used for availability-verification routing.
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: number | string;
  name: string;
  image_url?: string;
  categories?: { name: string };
  fulfillment_type: 'READY_STOCK' | 'DISTRIBUTOR' | 'SPECIAL_ORDER';
  verification_required: boolean;
  preferred_distributor_id: string | null;
  in_stock?: boolean;
}

interface Distributor {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  is_own_warehouse: boolean;
  is_active: boolean;
}

const FULFILLMENT_OPTIONS: { value: Product['fulfillment_type']; label: string; color: string; desc: string }[] = [
  { value: 'READY_STOCK', label: 'Ready Stock', color: '#4ADE80', desc: 'Buy Now — no verification, own inventory' },
  { value: 'DISTRIBUTOR', label: 'Distributor', color: '#F97316', desc: 'Reserve Order — verify with distributor before payment' },
  { value: 'SPECIAL_ORDER', label: 'Special Order', color: '#A855F7', desc: 'Reserve Order — made/sourced to order' },
];

export default function AdminFulfillmentPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | Product['fulfillment_type']>('all');
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [showDistributorForm, setShowDistributorForm] = useState(false);
  const [newDist, setNewDist] = useState({ name: '', contact_person: '', phone: '' });

  const showMsg = (text: string, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3000); };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [pRes, dRes] = await Promise.all([
      fetch('/api/products?all=1'),
      fetch('/api/distributors'),
    ]);
    if (pRes.status === 401 || dRes.status === 401) { router.push('/admin'); return; }
    const p = await pRes.json();
    const d = await dRes.json();
    setProducts(Array.isArray(p) ? p : []);
    setDistributors(Array.isArray(d) ? d : []);
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateProduct = async (id: Product['id'], payload: Partial<Product>) => {
    setSaving(String(id));
    const res = await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(null);
    if (res.ok) {
      const updated = await res.json();
      setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updated } : p)));
      showMsg('✅ Saved');
    } else {
      showMsg('❌ Update failed', false);
    }
  };

  const addDistributor = async () => {
    if (!newDist.name.trim()) return;
    const res = await fetch('/api/distributors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDist),
    });
    if (res.ok) {
      const d = await res.json();
      setDistributors(prev => [...prev, d]);
      setNewDist({ name: '', contact_person: '', phone: '' });
      setShowDistributorForm(false);
      showMsg('✅ Distributor added');
    } else {
      showMsg('❌ Could not add distributor', false);
    }
  };

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (typeFilter !== 'all' && p.fulfillment_type !== typeFilter) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, typeFilter, search]);

  const counts = useMemo(() => ({
    all: products.length,
    READY_STOCK: products.filter(p => p.fulfillment_type === 'READY_STOCK').length,
    DISTRIBUTOR: products.filter(p => p.fulfillment_type === 'DISTRIBUTOR').length,
    SPECIAL_ORDER: products.filter(p => p.fulfillment_type === 'SPECIAL_ORDER').length,
  }), [products]);

  const inp: React.CSSProperties = {
    background:'rgba(255,255,255,0.05)', border:'1px solid rgba(249,115,22,0.2)',
    borderRadius:4, padding:'7px 10px', color:'#F8F9FB',
    fontFamily:"'Inter',sans-serif", fontSize:12, outline:'none',
  };

  return (
    <div style={{ minHeight:'100vh', background:'#070F1F', color:'#F8F9FB', fontFamily:"'Inter',sans-serif" }}>

      {/* Topbar */}
      <div style={{ background:'rgba(11,36,71,0.9)', borderBottom:'1px solid rgba(249,115,22,0.15)', padding:'0 28px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, backdropFilter:'blur(10px)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <button onClick={() => router.push('/admin/dashboard')}
            style={{ background:'none', border:'1px solid rgba(249,115,22,0.2)', borderRadius:4, color:'#7A8EA8', padding:'5px 11px', cursor:'pointer', fontFamily:"'Inter',sans-serif", fontSize:11, letterSpacing:'.08em', textTransform:'uppercase' }}>
            ← Dashboard
          </button>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, letterSpacing:'.06em' }}>
            🚚 Distributor Fulfillment
          </div>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          {msg && (
            <div style={{ fontSize:12, padding:'5px 12px', borderRadius:4, background:msg.ok ? 'rgba(37,211,102,0.1)':'rgba(248,113,113,0.1)', color:msg.ok ? '#4ADE80':'#F87171', border:`1px solid ${msg.ok ? 'rgba(37,211,102,0.25)':'rgba(248,113,113,0.25)'}` }}>
              {msg.text}
            </div>
          )}
          <button onClick={fetchAll} style={{ background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', borderRadius:4, color:'#F97316', padding:'6px 14px', cursor:'pointer', fontFamily:"'Inter',sans-serif", fontSize:11, letterSpacing:'.12em', textTransform:'uppercase' }}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'28px' }}>

        {/* Explainer */}
        <div style={{ background:'rgba(25,55,109,0.25)', border:'1px solid rgba(249,115,22,0.12)', borderRadius:8, padding:'14px 18px', marginBottom:20, fontSize:12.5, color:'#B8C4D9', lineHeight:1.6 }}>
          Products default to <strong style={{ color:'#4ADE80' }}>Ready Stock</strong> (instant Buy Now, no verification).
          Tag a product <strong style={{ color:'#F97316' }}>Distributor</strong> or <strong style={{ color:'#A855F7' }}>Special Order</strong> to route it through
          the Reserve Order flow instead — the customer reserves, you verify availability, then a payment link is sent. Only change this for items you don't hold in your own stock.
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }} className="fulfillment-stats">
          {[
            { key:'all', label:'Total Products', color:'#F97316' },
            { key:'READY_STOCK', label:'Ready Stock', color:'#4ADE80' },
            { key:'DISTRIBUTOR', label:'Distributor', color:'#F97316' },
            { key:'SPECIAL_ORDER', label:'Special Order', color:'#A855F7' },
          ].map(s => (
            <div key={s.key} style={{ background:'rgba(25,55,109,0.35)', border:'1px solid rgba(249,115,22,0.12)', borderRadius:8, padding:'16px 18px' }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.8rem', letterSpacing:'.04em', color:s.color, lineHeight:1 }}>{(counts as any)[s.key]}</div>
              <div style={{ fontSize:10, fontFamily:"'Inter',sans-serif", fontWeight:700, letterSpacing:'.15em', textTransform:'uppercase', color:'#7A8EA8', marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Distributors panel */}
        <div style={{ background:'rgba(25,55,109,0.25)', border:'1px solid rgba(249,115,22,0.12)', borderRadius:8, padding:'16px 18px', marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:700, letterSpacing:'.15em', textTransform:'uppercase', color:'#F97316' }}>Distributors</div>
            <button onClick={() => setShowDistributorForm(v => !v)}
              style={{ background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', borderRadius:4, color:'#F97316', padding:'5px 12px', cursor:'pointer', fontSize:11, fontWeight:700 }}>
              {showDistributorForm ? '✕ Cancel' : '+ Add Distributor'}
            </button>
          </div>

          {showDistributorForm && (
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14, padding:'12px', background:'rgba(7,15,31,0.4)', borderRadius:6 }}>
              <input style={inp} placeholder="Distributor name*" value={newDist.name} onChange={e => setNewDist(d => ({ ...d, name: e.target.value }))} />
              <input style={inp} placeholder="Contact person" value={newDist.contact_person} onChange={e => setNewDist(d => ({ ...d, contact_person: e.target.value }))} />
              <input style={inp} placeholder="Phone" value={newDist.phone} onChange={e => setNewDist(d => ({ ...d, phone: e.target.value }))} />
              <button onClick={addDistributor} style={{ background:'#F97316', border:'none', borderRadius:4, color:'#070F1F', padding:'7px 16px', fontWeight:700, fontSize:12, cursor:'pointer' }}>Save</button>
            </div>
          )}

          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {distributors.map(d => (
              <div key={d.id} style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(7,15,31,0.4)', border:'1px solid rgba(249,115,22,0.1)', borderRadius:6, padding:'8px 14px' }}>
                <span style={{ fontSize:16 }}>{d.is_own_warehouse ? '🏬' : '🚚'}</span>
                <div>
                  <div style={{ fontSize:12.5, fontWeight:700 }}>{d.name}</div>
                  {(d.contact_person || d.phone) && (
                    <div style={{ fontSize:11, color:'#7A8EA8' }}>{[d.contact_person, d.phone].filter(Boolean).join(' · ')}</div>
                  )}
                </div>
              </div>
            ))}
            {distributors.length === 0 && <div style={{ fontSize:12, color:'#7A8EA8' }}>No distributors yet — your own warehouse is created automatically by the schema migration.</div>}
          </div>
        </div>

        {/* Search + filter */}
        <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
          <input placeholder="🔍 Search products…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inp, flex:1, minWidth:220, padding:'9px 12px' }} />
          {(['all', ...FULFILLMENT_OPTIONS.map(o => o.value)] as const).map(f => (
            <button key={f} onClick={() => setTypeFilter(f)}
              style={{ padding:'7px 14px', borderRadius:3, border:'1px solid', fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:11, letterSpacing:'.08em', textTransform:'uppercase', cursor:'pointer',
                borderColor: typeFilter===f ? '#F97316' : 'rgba(255,255,255,0.1)',
                background:  typeFilter===f ? 'rgba(249,115,22,0.12)' : 'transparent',
                color:       typeFilter===f ? '#F97316' : '#7A8EA8' }}>
              {f === 'all' ? 'All' : FULFILLMENT_OPTIONS.find(o => o.value === f)?.label}
            </button>
          ))}
        </div>

        {/* Product list */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'#7A8EA8' }}>⏳ Loading products...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'#7A8EA8' }}>No products match.</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {filtered.map(product => {
              const opt = FULFILLMENT_OPTIONS.find(o => o.value === product.fulfillment_type) || FULFILLMENT_OPTIONS[0];
              return (
                <div key={product.id} style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:16, alignItems:'center', background:'rgba(25,55,109,0.25)', border:'1px solid rgba(249,115,22,0.1)', borderRadius:8, padding:'12px 16px' }} className="fulfillment-row">
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#F8F9FB', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{product.name}</div>
                    <div style={{ fontSize:11, color:'#7A8EA8' }}>{product.categories?.name || '—'}</div>
                  </div>

                  <select
                    value={product.fulfillment_type}
                    disabled={saving === String(product.id)}
                    onChange={e => updateProduct(product.id, { fulfillment_type: e.target.value as Product['fulfillment_type'] })}
                    style={{ ...inp, minWidth:150, borderColor: `${opt.color}55`, color: opt.color, fontWeight:700 }}
                  >
                    {FULFILLMENT_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ color:'#0B2447' }}>{o.label}</option>)}
                  </select>

                  <select
                    value={product.preferred_distributor_id || ''}
                    disabled={saving === String(product.id) || product.fulfillment_type === 'READY_STOCK'}
                    onChange={e => updateProduct(product.id, { preferred_distributor_id: e.target.value || null })}
                    style={{ ...inp, minWidth:170, opacity: product.fulfillment_type === 'READY_STOCK' ? 0.4 : 1 }}
                  >
                    <option value="" style={{ color:'#0B2447' }}>No preferred distributor</option>
                    {distributors.filter(d => !d.is_own_warehouse).map(d => (
                      <option key={d.id} value={d.id} style={{ color:'#0B2447' }}>{d.name}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx global>{`
        @media(max-width:900px){
          .fulfillment-stats { grid-template-columns:repeat(2,1fr) !important; }
          .fulfillment-row { grid-template-columns:1fr !important; }
        }
      `}</style>
    </div>
  );
}
