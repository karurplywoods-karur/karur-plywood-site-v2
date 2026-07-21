// src/app/blog/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/db';
import { CONTACT } from '@/lib/contact';

const SITE_URL = 'https://www.karurplywood.co.in';

export const metadata: Metadata = {
  title: 'Blog | Plywood & Hardware Buying Guides — Karur Plywood',
  description: "Expert buying guides, tips and product advice from Karur's most trusted plywood dealer.",
  alternates: { canonical: `${SITE_URL}/blog` },
};

const WA  = CONTACT.wa;
const PER = 9;

async function getPosts(page: number, category?: string, sort?: string) {
  const from = (page - 1) * PER;
  let query = supabase
    .from('blog_posts')
    .select('id,title,slug,excerpt,cover_image,category,published_at,read_time,author', { count: 'exact' })
    .eq('published', true);
  if (category && category !== 'all') query = query.eq('category', category);
  query = query.order('published_at', { ascending: sort === 'oldest' }).range(from, from + PER - 1);
  const { data, count } = await query;
  return { posts: data || [], total: count || 0 };
}

async function getCategoryCounts() {
  const { data } = await supabase.from('blog_posts').select('category').eq('published', true);
  const counts: Record<string, number> = {};
  (data || []).forEach((p: any) => { if (p.category) counts[p.category] = (counts[p.category] || 0) + 1; });
  return counts;
}

async function getRecentPosts() {
  const { data } = await supabase.from('blog_posts').select('id,title,slug,cover_image,published_at').eq('published', true).order('published_at', { ascending: false }).limit(4);
  return data || [];
}

export default async function BlogPage({ searchParams }: { searchParams: { page?: string; category?: string; sort?: string } }) {
  const page = Math.max(1, parseInt(searchParams.page || '1'));
  const category = searchParams.category || 'all';
  const sort = searchParams.sort || 'latest';

  const [{ posts, total }, categoryCounts, recent] = await Promise.all([
    getPosts(page, category, sort),
    getCategoryCounts(),
    getRecentPosts(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PER));
  const totalAll = Object.values(categoryCounts).reduce((s, c) => s + c, 0);

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const merged = { page: String(page), category, sort, ...overrides };
    const params = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => { if (v && v !== 'all' && !(k === 'page' && v === '1')) params.set(k, v); });
    const qs = params.toString();
    return `/blog${qs ? `?${qs}` : ''}`;
  };

  return (
    <div style={{ background: '#FAF8F5', paddingTop: 58, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 48px 60px' }} className="blog-pad">

        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 14 }}>
          <Link href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Home</Link> › <span style={{ color: '#F07316', fontWeight: 600 }}>Blog</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(1.6rem,3vw,2.1rem)', fontWeight: 700, color: '#0B2447', margin: '0 0 6px' }}>Karur Plywood Blog</h1>
            <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Expert tips, product insights and ideas to help you build better.</p>
          </div>
          <a href={`https://wa.me/${WA}?text=Hi%2C+I+have+a+question+about+plywood.`} target="_blank" rel="noopener" className="blog-ask-card">
            <span style={{ fontSize: 20 }}>💬</span>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: '#0B2447' }}>Have a question?</div>
              <div style={{ fontSize: 11.5, color: '#6B7280' }}>Ask our experts on WhatsApp</div>
            </div>
          </a>
        </div>

        <div className="blog-layout">
          <div>
            {/* Category tabs */}
            <div className="blog-tabs">
              <Link href={buildHref({ category: undefined, page: '1' })} className={`blog-tab${category === 'all' ? ' blog-tab--active' : ''}`}>All Posts</Link>
              {Object.keys(categoryCounts).map(c => (
                <Link key={c} href={buildHref({ category: c, page: '1' })} className={`blog-tab${category === c ? ' blog-tab--active' : ''}`}>{c}</Link>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <span style={{ fontSize: 12.5, color: '#6B7280' }}>{total} article{total === 1 ? '' : 's'}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 12, color: '#6B7280', fontFamily: "'Syne',sans-serif" }}>Sort by:</label>
                <Link href={buildHref({ sort: sort === 'latest' ? 'oldest' : 'latest' })} className="blog-sort-btn">{sort === 'latest' ? 'Latest' : 'Oldest'} ⇅</Link>
              </div>
            </div>

            {posts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: '#0B2447', marginBottom: 8, fontSize: 18 }}>Coming soon</div>
                <p style={{ color: '#6B7280', marginBottom: 24 }}>Expert guides coming soon. Ask us on WhatsApp in the meantime.</p>
                <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener" className="blog-ask-btn">💬 Ask on WhatsApp</a>
              </div>
            ) : (
              <div className="blog-grid">
                {posts.map(post => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="blog-card">
                    <div className="blog-card-img">
                      {post.cover_image
                        ? <Image src={post.cover_image} alt={post.title} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 33vw" />
                        : <div className="blog-card-img-fallback">📝</div>}
                    </div>
                    <div className="blog-card-body">
                      <div className="blog-card-cat">{post.category}</div>
                      <div className="blog-card-title">{post.title}</div>
                      {post.excerpt && <p className="blog-card-exc">{post.excerpt}</p>}
                      <div className="blog-card-meta">
                        {post.published_at && <span>{new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                        {post.read_time && <span>· {post.read_time} min read</span>}
                      </div>
                      <div className="blog-card-read">Read More →</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="blog-pages">
                {page > 1 && <Link href={buildHref({ page: String(page - 1) })} className="blog-page-btn">← Prev</Link>}
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 6).map(n => (
                  <Link key={n} href={buildHref({ page: String(n) })} className={`blog-page-num${n === page ? ' blog-page-num--active' : ''}`}>{n}</Link>
                ))}
                {page < totalPages && <Link href={buildHref({ page: String(page + 1) })} className="blog-page-btn">Next →</Link>}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            <div className="blog-sb-card" style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: '#0B2447', marginBottom: 12 }}>Categories</div>
              <Link href="/blog" style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 13, color: category === 'all' ? '#F07316' : '#4B5563', textDecoration: 'none', fontWeight: category === 'all' ? 700 : 400, borderBottom: '1px solid #F1EEE9' }}>
                <span>All Categories</span><span>{totalAll}</span>
              </Link>
              {Object.entries(categoryCounts).map(([c, n]) => (
                <Link key={c} href={buildHref({ category: c, page: '1' })} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 13, color: category === c ? '#F07316' : '#4B5563', textDecoration: 'none', fontWeight: category === c ? 700 : 400, borderBottom: '1px solid #F1EEE9' }}>
                  <span>{c}</span><span>{n}</span>
                </Link>
              ))}
            </div>

            {recent.length > 0 && (
              <div className="blog-sb-card" style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: '#0B2447', marginBottom: 12 }}>Recent Posts</div>
                {recent.map((p: any) => (
                  <Link key={p.id} href={`/blog/${p.slug}`} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F1EEE9', textDecoration: 'none' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 6, overflow: 'hidden', background: '#F2EDE5', flexShrink: 0, position: 'relative' }}>
                      {p.cover_image ? <Image src={p.cover_image} alt={p.title} fill style={{ objectFit: 'cover' }} sizes="44px" /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📝</div>}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0B2447', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{p.title}</div>
                      {p.published_at && <div style={{ fontSize: 10.5, color: '#9CA3AF', marginTop: 2 }}>{new Date(p.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="blog-expert-card">
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: '#FFFFFF', marginBottom: 4 }}>Need Expert Advice?</div>
              <div style={{ fontSize: 12, color: '#93A3BC', marginBottom: 14 }}>Our experts are here to help you choose the right materials.</div>
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener" className="blog-expert-btn">Contact Our Experts →</a>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .blog-ask-card { display: flex; gap: 10px; align-items: center; background: #FFF4ED; border: 1px solid rgba(240,115,22,0.25); border-radius: 10px; padding: 12px 18px; text-decoration: none; }
        .blog-layout { display: grid; grid-template-columns: 1fr 280px; gap: 24px; align-items: start; }
        .blog-tabs { display: flex; gap: 4px; overflow-x: auto; border-bottom: 1px solid #E5E1DC; margin-bottom: 18px; }
        .blog-tab { padding: 10px 14px; font-family: 'Syne',sans-serif; font-size: 0.72rem; font-weight: 700; color: #6B7280; text-decoration: none; white-space: nowrap; border-bottom: 2px solid transparent; }
        .blog-tab--active { color: #F07316; border-bottom-color: #F07316; }
        .blog-sort-btn { font-size: 12px; color: #0B2447; border: 1px solid #E5E1DC; border-radius: 6px; padding: 6px 12px; text-decoration: none; background: #FFFFFF; }
        .blog-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .blog-card { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; overflow: hidden; text-decoration: none; display: flex; flex-direction: column; transition: all .2s; }
        .blog-card:hover { border-color: rgba(240,115,22,0.4); transform: translateY(-4px); box-shadow: 0 14px 30px rgba(11,36,71,0.1); }
        .blog-card-img { position: relative; height: 170px; background: #F2EDE5; }
        .blog-card-img-fallback { height: 100%; display: flex; align-items: center; justify-content: center; font-size: 36px; background: linear-gradient(135deg,#EDE6DB,#DCD0BE); }
        .blog-card-body { padding: 16px 18px 20px; flex: 1; display: flex; flex-direction: column; }
        .blog-card-cat { font-family: 'Syne',sans-serif; font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #F07316; margin-bottom: 8px; }
        .blog-card-title { font-family: 'Syne',sans-serif; font-size: .92rem; font-weight: 700; color: #0B2447; margin-bottom: 8px; line-height: 1.35; }
        .blog-card-exc { font-size: .78rem; color: #6B7280; line-height: 1.6; flex: 1; margin-bottom: 10px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .blog-card-meta { font-size: .68rem; color: #9CA3AF; margin-bottom: 10px; }
        .blog-card-read { font-size: .72rem; color: #F07316; font-family: 'Syne',sans-serif; font-weight: 700; letter-spacing: .06em; }
        .blog-pages { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 36px; flex-wrap: wrap; }
        .blog-page-btn { font-family: 'Syne',sans-serif; font-size: .7rem; font-weight: 700; color: #0B2447; border: 1px solid #E5E1DC; border-radius: 6px; padding: 8px 14px; text-decoration: none; }
        .blog-page-btn:hover { border-color: #F07316; color: #F07316; }
        .blog-page-num { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-family: 'Syne',sans-serif; font-size: .78rem; font-weight: 700; border: 1px solid #E5E1DC; border-radius: 6px; text-decoration: none; color: #6B7280; }
        .blog-page-num--active { background: #F07316; border-color: #F07316; color: #FFFFFF; }
        .blog-sb-card { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; padding: 18px; box-shadow: 0 1px 4px rgba(11,36,71,0.05); }
        .blog-expert-card { background: #0B2447; border-radius: 10px; padding: 20px; }
        .blog-expert-btn { display: inline-flex; align-items: center; padding: 10px 18px; background: #F07316; color: #FFFFFF; border-radius: 6px; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 12px; text-decoration: none; }
        .blog-ask-btn { display: inline-flex; align-items: center; padding: 11px 22px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; border-radius: 6px; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; }
        @media(max-width:1000px){ .blog-layout { grid-template-columns: 1fr !important; } .blog-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media(max-width:640px){ .blog-pad { padding-left:16px !important; padding-right:16px !important; } .blog-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
