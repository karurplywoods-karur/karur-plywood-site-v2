'use client';
// src/app/admin/product-images/page.tsx
// For products added via CSV bulk import without images — upload and attach
// a primary image (image_url) plus optional extra gallery images (image_urls)
// per product, independently of when the product was created.
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: number | string;
  name: string;
  image_url: string | null;
  image_urls: string[] | null;
  categories?: { name: string };
}

export default function AdminProductImagesPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'missing' | 'all'>('missing');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const galleryInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const showMsg = (text: string, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3000); };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/products?all=1');
    if (res.status === 401) { router.push('/admin'); return; }
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'products');
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      showMsg(`❌ ${d.error || 'Upload failed'}`, false);
      return null;
    }
    const data = await res.json();
    return data.url;
  };

  const handlePrimaryUpload = async (product: Product, file: File) => {
    setUploadingId(String(product.id));
    const url = await uploadFile(file);
    if (url) {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: url }),
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, image_url: url } : p));
        showMsg('✅ Image attached');
      } else {
        showMsg('❌ Could not save image to product', false);
      }
    }
    setUploadingId(null);
  };

  const handleGalleryUpload = async (product: Product, file: File) => {
    setUploadingId(String(product.id));
    const url = await uploadFile(file);
    if (url) {
      const nextGallery = [...(product.image_urls || []), url];
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_urls: nextGallery }),
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, image_urls: nextGallery } : p));
        showMsg('✅ Added to gallery');
      } else {
        showMsg('❌ Could not save gallery image', false);
      }
    }
    setUploadingId(null);
  };

  const removeGalleryImage = async (product: Product, url: string) => {
    const nextGallery = (product.image_urls || []).filter(u => u !== url);
    setUploadingId(String(product.id));
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_urls: nextGallery }),
    });
    setUploadingId(null);
    if (res.ok) {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, image_urls: nextGallery } : p));
      showMsg('✅ Removed');
    } else {
      showMsg('❌ Could not remove image', false);
    }
  };

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (filter === 'missing' && p.image_url) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, filter, search]);

  const missingCount = useMemo(() => products.filter(p => !p.image_url).length, [products]);

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
            🖼️ Product Images
          </div>
        </div>
        {msg && (
          <div style={{ fontSize:12, padding:'5px 12px', borderRadius:4, background:msg.ok ? 'rgba(37,211,102,0.1)':'rgba(248,113,113,0.1)', color:msg.ok ? '#4ADE80':'#F87171', border:`1px solid ${msg.ok ? 'rgba(37,211,102,0.25)':'rgba(248,113,113,0.25)'}` }}>
            {msg.text}
          </div>
        )}
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px' }}>

        <div style={{ background:'rgba(25,55,109,0.25)', border:'1px solid rgba(249,115,22,0.12)', borderRadius:8, padding:'14px 18px', marginBottom:20, fontSize:12.5, color:'#B8C4D9', lineHeight:1.6 }}>
          Products imported via CSV without an image show up here as <strong style={{ color:'#F97316' }}>missing</strong>.
          Upload a primary image any time — the product goes live with it immediately, no need to re-import.
          You can also add extra gallery photos per product.
        </div>

        <div style={{ display:'flex', gap:16, marginBottom:20 }}>
          <div style={{ background:'rgba(25,55,109,0.35)', border:'1px solid rgba(249,115,22,0.12)', borderRadius:8, padding:'14px 20px' }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.6rem', color:'#F97316' }}>{missingCount}</div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.15em', textTransform:'uppercase', color:'#7A8EA8', marginTop:4 }}>Missing Images</div>
          </div>
          <div style={{ background:'rgba(25,55,109,0.35)', border:'1px solid rgba(249,115,22,0.12)', borderRadius:8, padding:'14px 20px' }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.6rem', color:'#4ADE80' }}>{products.length - missingCount}</div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.15em', textTransform:'uppercase', color:'#7A8EA8', marginTop:4 }}>Have Images</div>
          </div>
        </div>

        <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
          <input placeholder="🔍 Search products…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inp, flex:1, minWidth:220, padding:'9px 12px' }} />
          {(['missing', 'all'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:'7px 14px', borderRadius:3, border:'1px solid', fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:11, letterSpacing:'.08em', textTransform:'uppercase', cursor:'pointer',
                borderColor: filter===f ? '#F97316' : 'rgba(255,255,255,0.1)',
                background:  filter===f ? 'rgba(249,115,22,0.12)' : 'transparent',
                color:       filter===f ? '#F97316' : '#7A8EA8' }}>
              {f === 'missing' ? 'Missing Only' : 'All Products'}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'#7A8EA8' }}>⏳ Loading products...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'#7A8EA8' }}>
            {filter === 'missing' ? '🎉 Every product has an image!' : 'No products match.'}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {filtered.map(product => {
              const isUploading = uploadingId === String(product.id);
              return (
                <div key={product.id} style={{ background:'rgba(25,55,109,0.25)', border:'1px solid rgba(249,115,22,0.1)', borderRadius:8, padding:'14px 16px' }}>
                  <div style={{ display:'flex', gap:14, alignItems:'center' }} className="pi-row">

                    {/* Primary image thumbnail / upload */}
                    <div
                      onClick={() => !isUploading && fileInputRefs.current[product.id]?.click()}
                      style={{ width:64, height:64, borderRadius:6, flexShrink:0, cursor:'pointer', overflow:'hidden',
                        background: product.image_url ? `url(${product.image_url}) center/cover` : 'rgba(255,255,255,0.05)',
                        border: product.image_url ? '1px solid rgba(255,255,255,0.1)' : '1.5px dashed rgba(249,115,22,0.4)',
                        display:'flex', alignItems:'center', justifyContent:'center' }}
                      title="Click to upload/replace primary image"
                    >
                      {!product.image_url && <span style={{ fontSize:20 }}>📷</span>}
                    </div>
                    <input ref={el => { fileInputRefs.current[product.id] = el; }} type="file" accept="image/*" style={{ display:'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handlePrimaryUpload(product, f); e.target.value = ''; }} />

                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{product.name}</div>
                      <div style={{ fontSize:11, color:'#7A8EA8' }}>{product.categories?.name || '—'}</div>
                      {(product.image_urls?.length ?? 0) > 0 && (
                        <div style={{ display:'flex', gap:6, marginTop:6, flexWrap:'wrap' }}>
                          {product.image_urls!.map(url => (
                            <div key={url} style={{ position:'relative', width:32, height:32 }}>
                              <div style={{ width:'100%', height:'100%', borderRadius:4, background:`url(${url}) center/cover`, border:'1px solid rgba(255,255,255,0.15)' }} />
                              <button onClick={() => removeGalleryImage(product, url)} disabled={isUploading}
                                style={{ position:'absolute', top:-5, right:-5, width:15, height:15, borderRadius:'50%', background:'#EF4444', border:'none', color:'#fff', fontSize:9, cursor:'pointer', lineHeight:'15px', padding:0 }}>✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display:'flex', flexDirection:'column', gap:6, flexShrink:0 }}>
                      <button onClick={() => fileInputRefs.current[product.id]?.click()} disabled={isUploading}
                        style={{ background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.25)', borderRadius:4, color:'#F97316', padding:'6px 12px', fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
                        {isUploading ? '⏳ Uploading...' : product.image_url ? '↻ Replace' : '+ Upload'}
                      </button>
                      <button onClick={() => galleryInputRefs.current[product.id]?.click()} disabled={isUploading}
                        style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.15)', borderRadius:4, color:'#7A8EA8', padding:'6px 12px', fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
                        + Gallery
                      </button>
                      <input ref={el => { galleryInputRefs.current[product.id] = el; }} type="file" accept="image/*" style={{ display:'none' }}
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleGalleryUpload(product, f); e.target.value = ''; }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx global>{`
        @media(max-width:600px){
          .pi-row { flex-wrap:wrap; }
        }
      `}</style>
    </div>
  );
}
