// src/app/blog/[slug]/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/db';
import { CONTACT } from '@/lib/contact';

const SITE_URL = 'https://www.karurplywood.co.in';
const WA = CONTACT.wa;

async function getPost(slug: string) {
  const { data } = await supabase.from('blog_posts').select('*').eq('slug', slug).eq('published', true).single();
  return data;
}
async function getRelated(category: string, currentSlug: string) {
  const { data } = await supabase.from('blog_posts').select('id,title,slug,excerpt,cover_image,category,read_time,published_at')
    .eq('published', true).eq('category', category).neq('slug', currentSlug).limit(4);
  return data || [];
}
async function getCategoryCounts() {
  const { data } = await supabase.from('blog_posts').select('category').eq('published', true);
  const counts: Record<string, number> = {};
  (data || []).forEach((p: any) => { if (p.category) counts[p.category] = (counts[p.category] || 0) + 1; });
  return counts;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: 'Post Not Found' };
  return {
    title: `${post.title} | Karur Plywood Blog`,
    description: post.excerpt,
    alternates: { canonical: `${SITE_URL}/blog/${params.slug}` },
    openGraph: { title: post.title, description: post.excerpt, url: `${SITE_URL}/blog/${params.slug}`, images: post.cover_image ? [post.cover_image] : [] },
  };
}

function renderMarkdown(text: string): string {
  return text
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/^\| (.+) \|$/gm, (_, row) => `<tr>${row.split(' | ').map((c: string) => `<td>${c.trim()}</td>`).join('')}</tr>`)
    .replace(/(<tr>[\s\S]*?<\/tr>\n?)+/g, (m) => `<table>${m}</table>`)
    .replace(/^---$/gm, '<hr>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/<\/p><p>(<[hul])/g, '$1')
    .replace(/(<\/[hul][^>]*>)<\/p><p>/g, '$1');
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const [related, categoryCounts] = await Promise.all([getRelated(post.category, post.slug), getCategoryCounts()]);
  const html = renderMarkdown(post.content);

  return (
    <div style={{ background: '#FAF8F5', paddingTop: 58 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 48px 60px' }} className="post-pad">

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9CA3AF', marginBottom: 18, flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Home</Link><span>›</span>
          <Link href="/blog" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Blog</Link><span>›</span>
          <Link href={`/blog?category=${post.category}`} style={{ color: '#9CA3AF', textDecoration: 'none' }}>{post.category}</Link><span>›</span>
          <span style={{ color: '#F07316', fontWeight: 600 }}>{post.title}</span>
        </div>

        <div className="post-layout">
          <article>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F07316', marginBottom: 12 }}>{post.category}</div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 700, color: '#0B2447', lineHeight: 1.2, marginBottom: 14 }}>{post.title}</h1>
            {post.excerpt && <p style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.7, marginBottom: 16 }}>{post.excerpt}</p>}
            <div style={{ display: 'flex', gap: 16, fontSize: 12.5, color: '#9CA3AF', marginBottom: 24, flexWrap: 'wrap', paddingBottom: 18, borderBottom: '1px solid #E5E1DC' }}>
              {post.published_at && <span>📅 {new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
              {post.read_time && <span>⏱ {post.read_time} min read</span>}
              {post.author && <span>✍️ {post.author}</span>}
            </div>

            {post.cover_image && (
              <div style={{ position: 'relative', height: 380, borderRadius: 12, overflow: 'hidden', marginBottom: 28 }}>
                <Image src={post.cover_image} alt={post.title} fill style={{ objectFit: 'cover' }} priority />
              </div>
            )}

            <div dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }} className="blog-content" />

            {post.tags?.length > 0 && (
              <div style={{ marginTop: 32, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {post.tags.map((t: string) => (
                  <span key={t} style={{ fontSize: 12, background: '#FFF4ED', border: '1px solid rgba(240,115,22,0.25)', borderRadius: 20, padding: '4px 12px', color: '#F07316', fontWeight: 600 }}>#{t}</span>
                ))}
              </div>
            )}

            {/* WA CTA */}
            <div style={{ marginTop: 32, background: '#0B2447', borderRadius: 12, padding: '24px 28px' }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>Still Have Questions?</div>
              <p style={{ fontSize: 13, color: '#93A3BC', marginBottom: 16 }}>Our experts in Karur reply on WhatsApp within minutes.</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a href={`https://wa.me/${WA}?text=Hi%2C+I+read+your+article+on+${encodeURIComponent(post.title)}+and+have+a+question.`} target="_blank" rel="noopener"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 6, background: '#25D366', color: 'white', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>💬 Ask on WhatsApp</a>
                <Link href="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 6, background: 'transparent', color: '#FF9A45', fontWeight: 700, fontSize: 13, textDecoration: 'none', border: '1px solid rgba(240,115,22,0.35)' }}>Browse Products →</Link>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside>
            <div className="post-sb-card" style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: '#0B2447', marginBottom: 12 }}>Categories</div>
              {Object.entries(categoryCounts).map(([c, n]) => (
                <Link key={c} href={`/blog?category=${c}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 13, color: c === post.category ? '#F07316' : '#4B5563', fontWeight: c === post.category ? 700 : 400, textDecoration: 'none', borderBottom: '1px solid #F1EEE9' }}>
                  <span>{c}</span><span>{n}</span>
                </Link>
              ))}
            </div>

            {related.length > 0 && (
              <div className="post-sb-card" style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: '#0B2447', marginBottom: 12 }}>Recent Posts</div>
                {related.map(r => (
                  <Link key={r.id} href={`/blog/${r.slug}`} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F1EEE9', textDecoration: 'none' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 6, overflow: 'hidden', background: '#F2EDE5', flexShrink: 0, position: 'relative' }}>
                      {r.cover_image ? <Image src={r.cover_image} alt={r.title} fill style={{ objectFit: 'cover' }} sizes="44px" /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📝</div>}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0B2447', lineHeight: 1.3 }}>{r.title}</div>
                      {r.published_at && <div style={{ fontSize: 10.5, color: '#9CA3AF', marginTop: 2 }}>{new Date(r.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="post-expert-card">
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: '#FFFFFF', marginBottom: 4 }}>Need Help Choosing?</div>
              <div style={{ fontSize: 12, color: '#93A3BC', marginBottom: 14 }}>Our experts are here to help you select the perfect products for your project.</div>
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener" className="post-expert-btn">Contact Our Experts →</a>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .blog-content h2{font-family:'Syne',sans-serif;font-size:1.35rem;font-weight:700;color:#0B2447;margin:32px 0 14px;line-height:1.25}
        .blog-content h3{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;color:#F07316;margin:24px 0 10px}
        .blog-content p{margin-bottom:16px;font-size:15px;line-height:1.85;color:#374151}
        .blog-content strong{color:#0B2447;font-weight:700}
        .blog-content em{font-style:italic;color:#4B5563}
        .blog-content ul{margin:14px 0 18px 22px;display:flex;flex-direction:column;gap:7px}
        .blog-content li{font-size:14px;color:#374151;line-height:1.7}
        .blog-content table{width:100%;border-collapse:collapse;margin:18px 0;font-size:13.5px}
        .blog-content td{padding:10px 14px;border-bottom:1px solid #E5E1DC;color:#374151;vertical-align:top}
        .blog-content tr:first-child td{background:#FAF8F5;color:#0B2447;font-weight:700}
        .blog-content hr{border:none;border-top:1px solid #E5E1DC;margin:28px 0}
        .post-layout { display: grid; grid-template-columns: 1fr 280px; gap: 24px; align-items: start; }
        .post-sb-card { background: #FFFFFF; border: 1px solid #E5E1DC; border-radius: 10px; padding: 18px; box-shadow: 0 1px 4px rgba(11,36,71,0.05); }
        .post-expert-card { background: #0B2447; border-radius: 10px; padding: 20px; }
        .post-expert-btn { display: inline-flex; align-items: center; padding: 10px 18px; background: #F07316; color: #FFFFFF; border-radius: 6px; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 12px; text-decoration: none; }
        @media(max-width:900px){ .post-layout { grid-template-columns: 1fr !important; } }
        @media(max-width:640px){ .post-pad { padding-left:16px !important; padding-right:16px !important; } }
      `}</style>
    </div>
  );
}
