'use client';
// src/app/admin/blog/page.tsx
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/ImageUploader';

interface Post {
  id: string; title: string; slug: string; excerpt: string; content: string;
  cover_image: string; category: string; tags: string[]; published: boolean;
  published_at: string | null; read_time: number; author: string;
  created_at: string; updated_at: string;
}

const EMPTY: Partial<Post> = {
  title: '', slug: '', excerpt: '', content: '', cover_image: '',
  category: 'Buying Guide', tags: [], published: false,
  author: 'Karur Plywood Team', read_time: 5,
};

const CATEGORIES = ['Buying Guide', 'Interior Design', 'Construction', 'Brand Comparison', 'Tips & Advice', 'Pricing', 'Local News'];

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [form, setForm] = useState<Partial<Post>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [preview, setPreview] = useState(false);
  const [tagsInput, setTagsInput] = useState('');

  const showMsg = (text: string, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3000); };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/blog?all=1');
    if (res.status === 401) { router.push('/admin'); return; }
    const data = await res.json();
    setPosts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const openNew = () => {
    setForm(EMPTY); setEditPost(null);
    setTagsInput(''); setView('edit'); setPreview(false);
  };

  const openEdit = async (p: Post) => {
    const res = await fetch(`/api/blog/${p.id}`);
    const full = await res.json();
    setForm(full); setEditPost(full);
    setTagsInput((full.tags || []).join(', '));
    setView('edit'); setPreview(false);
  };

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleTitleChange = (v: string) => {
    set('title', v);
    if (!editPost) set('slug', slugify(v));
  };

  const handleSave = async (publishNow?: boolean) => {
    if (!form.title?.trim()) { showMsg('Title is required.', false); return; }
    if (!form.content?.trim()) { showMsg('Content is required.', false); return; }

    setSaving(true);
    const payload = {
      ...form,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      published: publishNow !== undefined ? publishNow : form.published,
    };

    try {
      const res = editPost
        ? await fetch(`/api/blog/${editPost.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch('/api/blog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

      const data = await res.json();
      if (!res.ok) { showMsg(data.error || 'Error saving post.', false); }
      else {
        showMsg(publishNow ? '🎉 Post published!' : editPost ? 'Post updated!' : 'Post saved as draft!');
        await fetchPosts();
        setView('list');
      }
    } catch { showMsg('Network error.', false); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
    if (res.ok) { showMsg('Post deleted.'); setPosts(p => p.filter(x => x.id !== id)); }
    else showMsg('Error deleting post.', false);
  };

  const togglePublish = async (p: Post) => {
    const res = await fetch(`/api/blog/${p.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !p.published }),
    });
    if (res.ok) { showMsg(p.published ? 'Post unpublished.' : '🎉 Post published!'); fetchPosts(); }
    else showMsg('Error updating post.', false);
  };

  const inp: React.CSSProperties = { width: '100%', background: '#0E0B08', border: '1px solid rgba(200,136,74,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#F0E8DC', fontFamily: 'Outfit,sans-serif', outline: 'none' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: '#9A8070', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 };
  const fg: React.CSSProperties = { marginBottom: 18 };

  return (
    <div style={{ minHeight: '100vh', background: '#0E0B08', color: '#F0E8DC', fontFamily: 'Outfit,sans-serif' }}>

      {/* Topbar */}
      <div style={{ background: '#1C140D', borderBottom: '1px solid rgba(200,136,74,0.15)', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => { if (view === 'edit') setView('list'); else router.push('/admin/dashboard'); }}
            style={{ background: 'none', border: '1px solid rgba(200,136,74,0.2)', borderRadius: 8, color: '#9A8070', padding: '6px 12px', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontSize: 13 }}>
            ← {view === 'edit' ? 'Back to Posts' : 'Dashboard'}
          </button>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: 18, color: '#F0E8DC' }}>
            📝 Blog CMS {view === 'edit' && <span style={{ fontSize: 14, color: '#9A8070', fontFamily: 'Outfit,sans-serif', fontWeight: 400 }}> — {editPost ? 'Edit Post' : 'New Post'}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {msg && <div style={{ fontSize: 13, fontWeight: 600, color: msg.ok ? '#25D366' : '#F87171', background: msg.ok ? 'rgba(37,211,102,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${msg.ok ? 'rgba(37,211,102,0.2)' : 'rgba(248,113,113,0.2)'}`, borderRadius: 8, padding: '5px 12px' }}>{msg.text}</div>}
          {view === 'list' && (
            <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, background: 'linear-gradient(135deg,#C8884A,#8B5E2A)', color: 'white', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
              + New Post
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: view === 'edit' ? 860 : 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* ── LIST VIEW ── */}
        {view === 'list' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: '#F0E8DC' }}>Blog Posts</div>
                <div style={{ fontSize: 13, color: '#9A8070', marginTop: 2 }}>{posts.filter(p => p.published).length} published · {posts.filter(p => !p.published).length} drafts</div>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#9A8070' }}>⏳ Loading posts...</div>
            ) : posts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 700, color: '#F0E8DC', marginBottom: 8 }}>No posts yet</div>
                <p style={{ color: '#9A8070', marginBottom: 24 }}>Create your first blog post to start driving SEO traffic.</p>
                <button onClick={openNew} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 8, background: 'linear-gradient(135deg,#C8884A,#8B5E2A)', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
                  + Write First Post
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {posts.map(p => (
                  <div key={p.id} style={{ background: '#1C140D', border: `1px solid ${p.published ? 'rgba(200,136,74,0.15)' : 'rgba(200,136,74,0.08)'}`, borderRadius: 14, padding: '18px 22px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: '#F0E8DC' }}>{p.title}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: p.published ? 'rgba(37,211,102,0.12)' : 'rgba(200,136,74,0.1)', color: p.published ? '#25D366' : '#9A8070', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {p.published ? '✓ Published' : '✏️ Draft'}
                        </span>
                        <span style={{ fontSize: 11, color: '#9A8070', background: 'rgba(200,136,74,0.07)', padding: '2px 8px', borderRadius: 10 }}>{p.category}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#9A8070', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <span>🔗 /blog/{p.slug}</span>
                        <span>⏱ {p.read_time} min read</span>
                        <span>📅 {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        {p.published && <a href={`/blog/${p.slug}`} target="_blank" rel="noopener" style={{ color: '#C8884A', textDecoration: 'none' }}>↗ View live</a>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button onClick={() => togglePublish(p)} style={{ padding: '7px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 12, background: p.published ? 'rgba(248,113,113,0.1)' : 'rgba(37,211,102,0.15)', color: p.published ? '#F87171' : '#25D366' }}>
                        {p.published ? 'Unpublish' : '▶ Publish'}
                      </button>
                      <button onClick={() => openEdit(p)} style={{ padding: '7px 14px', borderRadius: 7, background: 'rgba(200,136,74,0.1)', border: '1px solid rgba(200,136,74,0.2)', color: '#E0A86A', fontSize: 12, cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontWeight: 600 }}>✏️ Edit</button>
                      <button onClick={() => handleDelete(p.id, p.title)} style={{ padding: '7px 12px', borderRadius: 7, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', color: '#F87171', fontSize: 12, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── EDIT VIEW ── */}
        {view === 'edit' && (
          <div>
            {/* Preview toggle */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              <button onClick={() => setPreview(false)} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid', borderColor: !preview ? '#C8884A' : 'rgba(200,136,74,0.2)', background: !preview ? 'rgba(200,136,74,0.12)' : 'transparent', color: !preview ? '#E0A86A' : '#9A8070', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>✏️ Edit</button>
              <button onClick={() => setPreview(true)} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid', borderColor: preview ? '#C8884A' : 'rgba(200,136,74,0.2)', background: preview ? 'rgba(200,136,74,0.12)' : 'transparent', color: preview ? '#E0A86A' : '#9A8070', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>👁 Preview</button>
            </div>

            {preview ? (
              /* Preview mode */
              <div style={{ background: '#1C140D', border: '1px solid rgba(200,136,74,0.15)', borderRadius: 16, padding: 40 }}>
                {form.cover_image && <div style={{ borderRadius: 12, overflow: 'hidden', height: 280, position: 'relative', marginBottom: 28 }}><img src={form.cover_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                <div style={{ fontSize: 12, color: '#C8884A', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>{form.category}</div>
                <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 40, fontWeight: 700, color: '#F0E8DC', lineHeight: 1.2, marginBottom: 16 }}>{form.title || 'Post Title'}</h1>
                <div style={{ fontSize: 14, color: '#9A8070', marginBottom: 28 }}>{form.author} · {form.read_time} min read</div>
                {form.excerpt && <p style={{ fontSize: 16, color: '#C8B8A0', lineHeight: 1.8, marginBottom: 28, fontStyle: 'italic', borderLeft: '3px solid #C8884A', paddingLeft: 20 }}>{form.excerpt}</p>}
                <div style={{ fontSize: 15, color: '#C8B8A0', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{form.content}</div>
              </div>
            ) : (
              /* Edit form */
              <div>
                <div style={fg}>
                  <label style={lbl}>Post Title *</label>
                  <input style={inp} value={form.title || ''} onChange={e => handleTitleChange(e.target.value)} placeholder="e.g. BWR vs MR Plywood — Which One Should You Choose?" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, ...fg }}>
                  <div>
                    <label style={lbl}>URL Slug *</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#0E0B08', border: '1px solid rgba(200,136,74,0.2)', borderRadius: 8, overflow: 'hidden' }}>
                      <span style={{ padding: '10px 12px', fontSize: 12, color: '#9A8070', borderRight: '1px solid rgba(200,136,74,0.15)', whiteSpace: 'nowrap' }}>/blog/</span>
                      <input style={{ ...inp, border: 'none', borderRadius: 0 }} value={form.slug || ''} onChange={e => set('slug', slugify(e.target.value))} placeholder="bwr-vs-mr-plywood" />
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>Category</label>
                    <select style={inp} value={form.category || 'Buying Guide'} onChange={e => set('category', e.target.value)}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, ...fg }}>
                  <div>
                    <label style={lbl}>Author</label>
                    <input style={inp} value={form.author || ''} onChange={e => set('author', e.target.value)} placeholder="Karur Plywood Team" />
                  </div>
                  <div>
                    <label style={lbl}>Read Time (minutes)</label>
                    <input style={inp} type="number" min={1} max={60} value={form.read_time || 5} onChange={e => set('read_time', parseInt(e.target.value))} />
                  </div>
                </div>

                <div style={fg}>
                  <label style={lbl}>Short Excerpt (shown in blog listing)</label>
                  <textarea style={{ ...inp, resize: 'none' }} rows={2} value={form.excerpt || ''} onChange={e => set('excerpt', e.target.value)} placeholder="A 1-2 sentence summary shown on the blog listing page..." />
                </div>

                <div style={fg}>
                  <ImageUploader value={form.cover_image || ''} onChange={v => set('cover_image', v)} folder="blog" label="Cover Image" hint="Recommended: 1200×630px" />
                </div>

                <div style={fg}>
                  <label style={lbl}>Post Content *</label>
                  <div style={{ fontSize: 11, color: '#9A8070', marginBottom: 8 }}>Supports Markdown: ## Heading, **bold**, *italic*, - list item, | table |</div>
                  <textarea
                    style={{ ...inp, resize: 'vertical', minHeight: 340, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.7 }}
                    value={form.content || ''}
                    onChange={e => set('content', e.target.value)}
                    placeholder={`## Introduction\n\nWrite your post content here...\n\n## Section 2\n\nMore content...\n\n**Pro tip:** Add a WhatsApp CTA at the end:\n\n*Have questions? Chat with us on WhatsApp and our team will help you choose the right product.*`}
                  />
                </div>

                <div style={fg}>
                  <label style={lbl}>Tags (comma separated)</label>
                  <input style={inp} value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="plywood, buying guide, BWR, MR" />
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingTop: 8 }}>
                  <button onClick={() => handleSave(false)} disabled={saving}
                    style={{ flex: 1, minWidth: 140, padding: '13px 0', borderRadius: 8, background: saving ? '#2a2218' : 'rgba(200,136,74,0.1)', border: '1px solid rgba(200,136,74,0.25)', color: '#E0A86A', fontWeight: 700, fontSize: 14, cursor: saving ? 'default' : 'pointer', fontFamily: 'Outfit,sans-serif' }}>
                    {saving ? '⏳...' : '💾 Save Draft'}
                  </button>
                  <button onClick={() => handleSave(true)} disabled={saving}
                    style={{ flex: 2, minWidth: 200, padding: '13px 0', borderRadius: 8, background: saving ? '#1a5c2e' : '#25D366', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: saving ? 'default' : 'pointer', fontFamily: 'Outfit,sans-serif' }}>
                    {saving ? '⏳ Publishing...' : '🚀 Publish Post'}
                  </button>
                  <button onClick={() => setView('list')} disabled={saving}
                    style={{ padding: '13px 20px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(200,136,74,0.15)', color: '#9A8070', fontSize: 14, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`input:focus,select:focus,textarea:focus{border-color:#C8884A!important} select option{background:#1C140D}`}</style>
    </div>
  );
}
