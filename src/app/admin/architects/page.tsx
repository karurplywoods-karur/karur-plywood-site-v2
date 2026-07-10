'use client';
// src/app/admin/architects/page.tsx
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Project { id:string; title:string; description:string; location:string; project_type:string; year:number; cover_image:string; materials_used:string[]; published:boolean; }
interface Architect { id:string; slug:string; name:string; firm:string; phone:string; email:string; wa_number:string; city:string; bio:string; photo_url:string; website:string; specialities:string[]; years_exp:number; featured:boolean; verified:boolean; architect_projects?:Project[]; }

const EMPTY_ARCH: Partial<Architect> = { name:'', slug:'', firm:'', phone:'', email:'', wa_number:'', city:'Karur', bio:'', photo_url:'', website:'', specialities:[], years_exp:1, featured:false, verified:false };
const EMPTY_PROJ: Partial<Project>  = { title:'', description:'', location:'', project_type:'residential', year:new Date().getFullYear(), cover_image:'', materials_used:[], published:true };

function slugify(s:string){ return s.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/-+/g,'-'); }

const S = {
  page: { minHeight:'100vh', background:'#070F1F', color:'#F8F9FB', fontFamily:"'DM Sans',sans-serif" },
  topbar: { background:'rgba(11,36,71,0.8)', borderBottom:'1px solid rgba(249,115,22,0.15)', padding:'0 28px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky' as const, top:0, zIndex:100, backdropFilter:'blur(10px)' },
  inp: { width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(249,115,22,0.18)', borderRadius:4, padding:'9px 13px', fontSize:13, color:'#F8F9FB', fontFamily:"'DM Sans',sans-serif", outline:'none' },
  lbl: { display:'block' as const, fontSize:10, fontFamily:"'Syne',sans-serif", fontWeight:700 as const, letterSpacing:'.15em', textTransform:'uppercase' as const, color:'#7A8EA8', marginBottom:5 },
  fg: { marginBottom:14 },
  card: { background:'rgba(25,55,109,0.35)', border:'1px solid rgba(249,115,22,0.15)', borderRadius:8, padding:'18px 20px' },
};

export default function AdminArchitectsPage() {
  const router = useRouter();
  const [architects, setArchitects] = useState<Architect[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list'|'edit'|'projects'>('list');
  const [editing, setEditing] = useState<Architect|null>(null);
  const [form, setForm] = useState<Partial<Architect>>(EMPTY_ARCH);
  const [projForm, setProjForm] = useState<Partial<Project>>(EMPTY_PROJ);
  const [specInput, setSpecInput] = useState('');
  const [matInput, setMatInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{text:string;ok:boolean}|null>(null);
  const [selectedArch, setSelectedArch] = useState<Architect|null>(null);
  const [editingProj, setEditingProj] = useState<Project|null>(null);

  const ok = (text:string) => { setMsg({text,ok:true}); setTimeout(()=>setMsg(null),3000); };
  const err = (text:string) => { setMsg({text,ok:false}); setTimeout(()=>setMsg(null),4000); };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/architects?all=1');
    if (res.status===401) { router.push('/admin'); return; }
    const data = await res.json();
    setArchitects(Array.isArray(data)?data:[]);
    setLoading(false);
  }, [router]);

  useEffect(()=>{ fetchAll(); },[fetchAll]);

  const openNew = () => { setForm(EMPTY_ARCH); setEditing(null); setSpecInput(''); setView('edit'); };
  const openEdit = async (a:Architect) => {
    const res = await fetch(`/api/architects/${a.id}`);
    const full = await res.json();
    setForm(full); setEditing(full);
    setSpecInput((full.specialities||[]).join(', '));
    setView('edit');
  };

  const set = (k:string,v:any) => setForm(f=>({...f,[k]:v}));
  const setP = (k:string,v:any) => setProjForm(f=>({...f,[k]:v}));

  const save = async () => {
    if (!form.name?.trim()) { err('Name is required.'); return; }
    setSaving(true);
    const payload = { ...form, slug: form.slug||slugify(form.name!), specialities: specInput.split(',').map(s=>s.trim()).filter(Boolean), years_exp: Number(form.years_exp)||1 };
    const url  = editing ? `/api/architects/${editing.id}` : '/api/architects';
    const method = editing ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) { err(data.error||'Save failed.'); setSaving(false); return; }
    ok(editing?'Architect updated!':'Architect created!');
    setSaving(false); fetchAll(); setView('list');
  };

  const toggle = async (a:Architect, field:'verified'|'featured') => {
    await fetch(`/api/architects/${a.id}`,{ method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({[field]:!a[field]}) });
    ok('Updated!'); fetchAll();
  };

  const del = async (id:string) => {
    if(!confirm('Delete this architect and all their projects?')) return;
    await fetch(`/api/architects/${id}`,{method:'DELETE'});
    ok('Deleted.'); fetchAll();
  };

  const openProjects = async (a:Architect) => {
    const res = await fetch(`/api/architects/${a.id}`);
    const full = await res.json();
    setSelectedArch(full); setEditingProj(null);
    setProjForm(EMPTY_PROJ); setMatInput(''); setView('projects');
  };

  const saveProject = async () => {
    if (!projForm.title?.trim()) { err('Project title required.'); return; }
    setSaving(true);
    const payload = { ...projForm, architect_id:selectedArch!.id, materials_used:matInput.split(',').map(s=>s.trim()).filter(Boolean), year:Number(projForm.year)||2024 };
    const url    = editingProj ? `/api/architect-projects/${editingProj.id}` : '/api/architect-projects';
    const method = editingProj ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
    if (!res.ok) { const d=await res.json(); err(d.error||'Save failed.'); setSaving(false); return; }
    ok(editingProj?'Project updated!':'Project added!');
    setSaving(false); setProjForm(EMPTY_PROJ); setMatInput(''); setEditingProj(null);
    // Refresh
    const r2 = await fetch(`/api/architects/${selectedArch!.id}`);
    setSelectedArch(await r2.json());
  };

  const editProj = (p:Project) => { setEditingProj(p); setProjForm(p); setMatInput((p.materials_used||[]).join(', ')); };
  const delProj  = async (id:string) => {
    if(!confirm('Delete this project?')) return;
    await fetch(`/api/architect-projects/${id}`,{method:'DELETE'});
    ok('Project deleted.');
    const r = await fetch(`/api/architects/${selectedArch!.id}`);
    setSelectedArch(await r.json());
  };

  const btnRow: React.CSSProperties = { display:'flex', gap:8, alignItems:'center' };
  const secBtn = (label:string,onClick:()=>void,col='#F97316') => (
    <button onClick={onClick} style={{ padding:'7px 14px', borderRadius:4, border:`1px solid ${col}40`, background:`${col}12`, color:col, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11, letterSpacing:'.1em', textTransform:'uppercase', cursor:'pointer' }}>{label}</button>
  );

  return (
    <div style={S.page}>
      {/* Topbar */}
      <div style={S.topbar}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <button onClick={()=>{ if(view!=='list') setView('list'); else router.push('/admin/dashboard'); }}
            style={{ background:'none', border:'1px solid rgba(249,115,22,0.2)', borderRadius:4, color:'#7A8EA8', padding:'5px 11px', cursor:'pointer', fontFamily:"'Syne',sans-serif", fontSize:11, letterSpacing:'.08em', textTransform:'uppercase' }}>
            ← {view==='list'?'Dashboard':'Back'}
          </button>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:'.06em', color:'#F8F9FB' }}>
            🏛️ Architect Partners {view==='projects'&&selectedArch&&`— ${selectedArch.name}`}
          </div>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          {msg&&<div style={{ fontSize:12, padding:'5px 12px', borderRadius:4, background:msg.ok?'rgba(37,211,102,0.1)':'rgba(249,115,22,0.1)', color:msg.ok?'#4ADE80':'#F97316', border:`1px solid ${msg.ok?'rgba(37,211,102,0.2)':'rgba(249,115,22,0.2)'}` }}>{msg.text}</div>}
          {view==='list'&&<button onClick={openNew} style={{ background:'#F97316', color:'#0B2447', border:'none', borderRadius:4, padding:'7px 18px', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:12, letterSpacing:'.1em', textTransform:'uppercase', cursor:'pointer' }}>+ New Architect</button>}
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 28px' }}>

        {/* ── LIST ── */}
        {view==='list'&&(
          loading ? <div style={{ textAlign:'center',padding:'60px 0',color:'#7A8EA8' }}>⏳ Loading...</div>
          : architects.length===0 ? (
            <div style={{ textAlign:'center',padding:'80px 0' }}>
              <div style={{ fontSize:48,marginBottom:12 }}>🏛️</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'2rem',letterSpacing:'.05em',color:'#F8F9FB',marginBottom:8 }}>NO ARCHITECTS YET</div>
              <p style={{ color:'#7A8EA8',marginBottom:20 }}>Add your first architect partner to showcase their portfolio.</p>
              <button onClick={openNew} className="btn-p" style={{ border:'none',cursor:'pointer' }}>+ Add First Architect</button>
            </div>
          ) : (
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              {architects.map(a=>(
                <div key={a.id} style={{ ...S.card, display:'grid', gridTemplateColumns:'1fr auto', gap:16, alignItems:'center' }}>
                  <div>
                    <div style={{ display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:4 }}>
                      <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,color:'#F8F9FB' }}>{a.name}</span>
                      {a.firm&&<span style={{ fontSize:12,color:'#F97316' }}>{a.firm}</span>}
                      {a.verified&&<span style={{ fontSize:9,fontFamily:"'Syne',sans-serif",fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',background:'rgba(37,211,102,0.12)',color:'#4ADE80',border:'1px solid rgba(37,211,102,0.2)',padding:'2px 8px',borderRadius:3 }}>✓ Live</span>}
                      {a.featured&&<span style={{ fontSize:9,fontFamily:"'Syne',sans-serif",fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',background:'rgba(249,115,22,0.12)',color:'#F97316',border:'1px solid rgba(249,115,22,0.2)',padding:'2px 8px',borderRadius:3 }}>⭐ Featured</span>}
                    </div>
                    <div style={{ fontSize:12,color:'#7A8EA8' }}>📍 {a.city} · /architects/{a.slug} · {a.years_exp} yrs exp</div>
                  </div>
                  <div style={btnRow}>
                    {secBtn('Projects',()=>openProjects(a),'#93C5FD')}
                    {secBtn('Edit',()=>openEdit(a))}
                    {secBtn(a.verified?'Unlist':'✓ List',()=>toggle(a,'verified'),a.verified?'#FCA5A5':'#4ADE80')}
                    {secBtn(a.featured?'Unfeature':'★ Feature',()=>toggle(a,'featured'),'#FDE047')}
                    {secBtn('🗑️',()=>del(a.id),'#FCA5A5')}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── EDIT ARCHITECT ── */}
        {view==='edit'&&(
          <div style={{ maxWidth:680 }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.8rem',letterSpacing:'.05em',color:'#F8F9FB',marginBottom:24 }}>
              {editing?'EDIT ARCHITECT':'NEW ARCHITECT PARTNER'}
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14 }}>
              <div style={S.fg}><label style={S.lbl}>Full Name *</label><input style={S.inp} value={form.name||''} onChange={e=>{set('name',e.target.value);if(!editing)set('slug',slugify(e.target.value));}} placeholder="Arjun Designs" /></div>
              <div style={S.fg}><label style={S.lbl}>URL Slug *</label><input style={S.inp} value={form.slug||''} onChange={e=>set('slug',slugify(e.target.value))} placeholder="arjun-designs" /></div>
            </div>
            <div style={{ ...S.fg }}><label style={S.lbl}>Firm / Studio Name</label><input style={S.inp} value={form.firm||''} onChange={e=>set('firm',e.target.value)} placeholder="Arjun Interiors & Architecture" /></div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14 }}>
              <div><label style={S.lbl}>Phone</label><input style={S.inp} value={form.phone||''} onChange={e=>set('phone',e.target.value)} placeholder="+91 98765 43210" /></div>
              <div><label style={S.lbl}>WhatsApp Number</label><input style={S.inp} value={form.wa_number||''} onChange={e=>set('wa_number',e.target.value)} placeholder="9876543210" /></div>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14 }}>
              <div><label style={S.lbl}>Email</label><input style={S.inp} value={form.email||''} onChange={e=>set('email',e.target.value)} placeholder="hello@arjundesigns.in" /></div>
              <div><label style={S.lbl}>City</label><select style={S.inp} value={form.city||'Karur'} onChange={e=>set('city',e.target.value)}>{['Karur','Trichy','Namakkal','Erode','Salem','Chennai'].map(c=><option key={c}>{c}</option>)}</select></div>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14 }}>
              <div><label style={S.lbl}>Years Experience</label><input style={S.inp} type="number" min={1} value={form.years_exp||1} onChange={e=>set('years_exp',e.target.value)} /></div>
              <div><label style={S.lbl}>Website URL</label><input style={S.inp} value={form.website||''} onChange={e=>set('website',e.target.value)} placeholder="https://arjundesigns.in" /></div>
            </div>
            <div style={S.fg}><label style={S.lbl}>Profile Photo URL</label><input style={S.inp} value={form.photo_url||''} onChange={e=>set('photo_url',e.target.value)} placeholder="https://..." /></div>
            <div style={S.fg}><label style={S.lbl}>Specialities (comma separated)</label><input style={S.inp} value={specInput} onChange={e=>setSpecInput(e.target.value)} placeholder="residential, interior design, modular kitchens" /></div>
            <div style={S.fg}><label style={S.lbl}>Bio / Description</label><textarea style={{ ...S.inp,resize:'none' } as React.CSSProperties} rows={4} value={form.bio||''} onChange={e=>set('bio',e.target.value)} placeholder="Describe the architect's experience, style and specialisation..." /></div>
            <div style={{ display:'flex',gap:14,marginBottom:28 }}>
              <label style={{ display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,color:'#F8F9FB' }}><input type="checkbox" checked={form.verified||false} onChange={e=>set('verified',e.target.checked)} style={{ width:'auto',accentColor:'#F97316' }} /> Show publicly (verified)</label>
              <label style={{ display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,color:'#F8F9FB' }}><input type="checkbox" checked={form.featured||false} onChange={e=>set('featured',e.target.checked)} style={{ width:'auto',accentColor:'#F97316' }} /> Featured (appears first)</label>
            </div>
            <div style={{ display:'flex',gap:10 }}>
              <button onClick={save} disabled={saving} className="btn-p" style={{ border:'none',cursor:'pointer',opacity:saving?.6:1 }}>{saving?'⏳ Saving...':editing?'✓ Save Changes':'✓ Create Architect'}</button>
              <button onClick={()=>setView('list')} className="btn-s" style={{ cursor:'pointer' }}>Cancel</button>
            </div>
            <style>{`input:focus,select:focus,textarea:focus{border-color:#F97316!important} select option{background:#0d1f3a}`}</style>
          </div>
        )}

        {/* ── PROJECTS MANAGER ── */}
        {view==='projects'&&selectedArch&&(
          <div>
            {/* Project form */}
            <div style={{ ...S.card, marginBottom:28 }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.4rem',letterSpacing:'.05em',color:'#F8F9FB',marginBottom:20 }}>
                {editingProj?'EDIT PROJECT':'ADD NEW PROJECT'}
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14 }}>
                <div><label style={S.lbl}>Project Title *</label><input style={S.inp} value={projForm.title||''} onChange={e=>setP('title',e.target.value)} placeholder="3BHK Villa Interior — Karur" /></div>
                <div><label style={S.lbl}>Location</label><input style={S.inp} value={projForm.location||''} onChange={e=>setP('location',e.target.value)} placeholder="Karur, Tamil Nadu" /></div>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14,marginBottom:14 }}>
                <div><label style={S.lbl}>Project Type</label>
                  <select style={S.inp} value={projForm.project_type||'residential'} onChange={e=>setP('project_type',e.target.value)}>
                    {['residential','commercial','interior'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div><label style={S.lbl}>Year</label><input style={S.inp} type="number" min={2000} max={2030} value={projForm.year||2024} onChange={e=>setP('year',e.target.value)} /></div>
                <div style={{ display:'flex',alignItems:'flex-end',paddingBottom:1 }}>
                  <label style={{ display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,color:'#F8F9FB' }}>
                    <input type="checkbox" checked={projForm.published!==false} onChange={e=>setP('published',e.target.checked)} style={{ width:'auto',accentColor:'#F97316' }} /> Published
                  </label>
                </div>
              </div>
              <div style={S.fg}><label style={S.lbl}>Cover Image URL</label><input style={S.inp} value={projForm.cover_image||''} onChange={e=>setP('cover_image',e.target.value)} placeholder="https://..." /></div>
              <div style={S.fg}><label style={S.lbl}>Materials Used (comma separated — from Karur Plywood)</label><input style={S.inp} value={matInput} onChange={e=>setMatInput(e.target.value)} placeholder="BWR Plywood 18mm, Merino Laminates, Flush Doors" /></div>
              <div style={S.fg}><label style={S.lbl}>Project Description</label><textarea style={{ ...S.inp,resize:'none' } as React.CSSProperties} rows={3} value={projForm.description||''} onChange={e=>setP('description',e.target.value)} placeholder="Describe the project scope, design approach and outcome..." /></div>
              <div style={{ display:'flex',gap:10 }}>
                <button onClick={saveProject} disabled={saving} className="btn-p" style={{ border:'none',cursor:'pointer' }}>{saving?'⏳...':editingProj?'✓ Update Project':'+ Add Project'}</button>
                {editingProj&&<button onClick={()=>{setEditingProj(null);setProjForm(EMPTY_PROJ);setMatInput('');}} className="btn-s" style={{ cursor:'pointer' }}>Cancel</button>}
              </div>
            </div>

            {/* Existing projects */}
            <div style={{ fontFamily:"'Syne',sans-serif",fontSize:'.68rem',fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',color:'#7A8EA8',marginBottom:14 }}>
              {selectedArch.architect_projects?.length||0} Project{(selectedArch.architect_projects?.length||0)!==1?'s':''}
            </div>
            {(selectedArch.architect_projects||[]).length===0 ? (
              <div style={{ textAlign:'center',padding:'40px',color:'#7A8EA8',border:'1px dashed rgba(249,115,22,0.2)',borderRadius:8 }}>No projects yet. Add the first one above.</div>
            ) : (
              <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                {(selectedArch.architect_projects||[]).map((p:Project)=>(
                  <div key={p.id} style={{ ...S.card, display:'grid', gridTemplateColumns:'1fr auto', gap:14, alignItems:'center' }}>
                    <div>
                      <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,color:'#F8F9FB',marginBottom:4 }}>{p.title}</div>
                      <div style={{ fontSize:12,color:'#7A8EA8' }}>{p.project_type} · {p.location} · {p.year} {!p.published&&'· 🚫 Draft'}</div>
                      {p.materials_used?.length>0&&<div style={{ fontSize:11,color:'#F97316',marginTop:4 }}>{p.materials_used.join(' · ')}</div>}
                    </div>
                    <div style={btnRow}>
                      {secBtn('Edit',()=>editProj(p))}
                      {secBtn('🗑️',()=>delProj(p.id),'#FCA5A5')}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <style>{`input:focus,select:focus,textarea:focus{border-color:#F97316!important} select option{background:#0d1f3a}`}</style>
          </div>
        )}
      </div>
    </div>
  );
}
