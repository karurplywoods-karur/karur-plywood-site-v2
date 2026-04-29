// src/app/blog/[slug]/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/db';

const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999';

async function getPost(slug: string) {
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();
  return data;
}

async function getRelated(category: string, currentSlug: string) {
  const { data } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, category, read_time')
    .eq('published', true)
    .eq('category', category)
    .neq('slug', currentSlug)
    .limit(3);
  return data || [];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: 'Post Not Found' };
  return {
    title: `${post.title} | Karur Plywood Blog`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: post.cover_image ? [post.cover_image] : [] },
  };
}

// Simple markdown-to-HTML converter (ES2017-compatible, no s flag)
function renderMarkdown(text: string): string {
  return text
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/^\| (.+) \|$/gm, (_, row) => {
      const cells = row.split(' | ').map((c: string) => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    })
    .replace(/(<tr>[\s\S]*?<\/tr>\n?)+/g, (m) => `<table>${m}</table>`)
    .replace(/^---$/gm, '<hr>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/<\/p><p>(<[hul])/g, '$1')
    .replace(/(<\/[hul][^>]*>)<\/p><p>/g, '$1');
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const related = await getRelated(post.category, post.slug);
  const html = renderMarkdown(post.content);

  return (
    <>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg,#1C140D,#0E0B08)', borderBottom: '1px solid rgba(200,136,74,0.12)', padding: '48px 0 0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 48px 48px' }} className="post-pad">
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#9A8070', marginBottom: 24 }}>
            <Link href="/" style={{ color: '#9A8070', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <Link href="/blog" style={{ color: '#9A8070', textDecoration: 'none' }}>Blog</Link>
            <span>›</span>
            <span style={{ color: '#C8B8A0' }}>{post.category}</span>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: 'rgba(200,136,74,0.12)', color: '#C8884A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            {post.category}
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 700, color: '#F0E8DC', lineHeight: 1.15, marginBottom: 20 }}>
            {post.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 13, color: '#9A8070', marginBottom: 28, flexWrap: 'wrap' }}>
            <span>✍️ {post.author}</span>
            <span>⏱ {post.read_time} min read</span>
            {post.published_at && <span>📅 {new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
          </div>
          {post.excerpt && (
            <p style={{ fontSize: 17, color: '#C8B8A0', lineHeight: 1.8, fontStyle: 'italic', borderLeft: '3px solid #C8884A', paddingLeft: 20 }}>{post.excerpt}</p>
          )}
        </div>
      </section>

      {/* Cover image */}
      {post.cover_image && (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 48px' }} className="post-pad">
          <div style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', height: 380, marginTop: 32 }}>
            <Image src={post.cover_image} alt={post.title} fill style={{ objectFit: 'cover' }} />
          </div>
        </div>
      )}

      {/* Content */}
      <article style={{ maxWidth: 800, margin: '0 auto', padding: '48px 48px' }} className="post-pad">
        <div
          dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }}
          style={{ fontSize: 16, color: '#C8B8A0', lineHeight: 1.9 }}
          className="blog-content"
        />

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div style={{ marginTop: 40, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {post.tags.map((t: string) => (
              <span key={t} style={{ fontSize: 12, background: 'rgba(200,136,74,0.1)', border: '1px solid rgba(200,136,74,0.2)', borderRadius: 20, padding: '4px 12px', color: '#C8884A', fontWeight: 500 }}>#{t}</span>
            ))}
          </div>
        )}

        {/* WA CTA in post */}
        <div style={{ marginTop: 48, background: 'linear-gradient(135deg,#0D2B17,#091810)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: 16, padding: '28px 32px' }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 700, color: '#F0E8DC', marginBottom: 8 }}>Still Have Questions?</div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 20 }}>Our experts in Karur can help you choose the right products for your project. We reply on WhatsApp within minutes.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href={`https://wa.me/${WA}?text=Hi%2C+I+read+your+article+on+${encodeURIComponent(post.title)}+and+have+a+question.`} target="_blank" rel="noopener"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 8, background: '#25D366', color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              💬 Ask on WhatsApp
            </a>
            <Link href="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 8, background: 'transparent', color: '#E0A86A', fontWeight: 600, fontSize: 14, textDecoration: 'none', border: '1px solid rgba(200,136,74,0.3)' }}>
              Browse Products →
            </Link>
          </div>
        </div>
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section style={{ background: '#161009', borderTop: '1px solid rgba(200,136,74,0.1)', padding: '56px 0' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 48px' }} className="post-pad">
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: '#F0E8DC', marginBottom: 24 }}>
              Related <span style={{ color: '#E0A86A' }}>Articles</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {related.map(r => (
                <Link key={r.id} href={`/blog/${r.slug}`}
                  style={{ background: '#1C140D', border: '1px solid rgba(200,136,74,0.15)', borderRadius: 12, padding: '18px 20px', textDecoration: 'none', display: 'block', transition: 'all 0.2s' }}
                  className="rel-card">
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: '#F0E8DC', marginBottom: 4 }}>{r.title}</div>
                  <div style={{ fontSize: 13, color: '#9A8070' }}>{r.excerpt}</div>
                  <div style={{ fontSize: 12, color: '#C8884A', fontWeight: 600, marginTop: 8 }}>Read Article →</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <style>{`
        .blog-content h2{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:700;color:#F0E8DC;margin:36px 0 14px;line-height:1.2}
        .blog-content h3{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:#E0A86A;margin:28px 0 12px}
        .blog-content p{margin-bottom:18px;font-size:16px;line-height:1.9;color:#C8B8A0}
        .blog-content strong{color:#F0E8DC;font-weight:700}
        .blog-content em{font-style:italic;color:#C8B8A0}
        .blog-content ul{margin:16px 0 20px 24px;display:flex;flex-direction:column;gap:8px}
        .blog-content li{font-size:15px;color:#C8B8A0;line-height:1.7}
        .blog-content table{width:100%;border-collapse:collapse;margin:20px 0;font-size:14px}
        .blog-content td{padding:10px 14px;border-bottom:1px solid rgba(200,136,74,0.12);color:#C8B8A0;vertical-align:top}
        .blog-content tr:first-child td{background:rgba(200,136,74,0.08);color:#E0A86A;font-weight:600}
        .blog-content hr{border:none;border-top:1px solid rgba(200,136,74,0.15);margin:32px 0}
        .rel-card:hover{border-color:rgba(200,136,74,0.35)!important;transform:translateX(4px)}
        @media(max-width:640px){.post-pad{padding:32px 20px!important}}
      `}</style>
    </>
  );
}
