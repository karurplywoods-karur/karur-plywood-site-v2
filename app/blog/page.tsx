// src/app/blog/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Blog | Plywood & Hardware Buying Guides — Karur Plywood',
  description: "Expert buying guides, tips and product advice from Karur's most trusted plywood dealer.",
};

const WA   = process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999';
const PER  = 9;

const CAT_CHIP: Record<string, { bg: string; color: string }> = {
  'Buying Guide':    { bg:'rgba(249,115,22,0.15)',  color:'#F97316' },
  'Interior Design': { bg:'rgba(168,85,247,0.15)',  color:'#C084FC' },
  'Construction':    { bg:'rgba(59,130,246,0.15)',   color:'#93C5FD' },
  'Brand Comparison':{ bg:'rgba(232,184,32,0.15)',   color:'#FDE047' },
  'Tips & Advice':   { bg:'rgba(37,211,102,0.15)',   color:'#4ADE80' },
  'Pricing':         { bg:'rgba(248,113,113,0.15)',  color:'#FCA5A5' },
  'Local News':      { bg:'rgba(20,184,166,0.15)',   color:'#5EEAD4' },
};

const EMOJI: Record<string, string> = {
  'Buying Guide':'🪵','Interior Design':'🎨','Construction':'🏗️',
  'Brand Comparison':'🏆','Tips & Advice':'💡','Pricing':'💰','Local News':'📍',
};

function Placeholder({ category }: { category: string }) {
  const chip = CAT_CHIP[category] || CAT_CHIP['Buying Guide'];
  return (
    <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg,#0d1f3a,#19376D)', flexDirection:'column', gap:10 }}>
      <span style={{ fontSize:44 }}>{EMOJI[category] || '📝'}</span>
      <span style={{ fontSize:10, fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:'.2em',
        textTransform:'uppercase', background:chip.bg, color:chip.color, padding:'3px 10px', borderRadius:3 }}>
        {category}
      </span>
    </div>
  );
}

async function getPosts(page: number) {
  const from = (page - 1) * PER;
  const { data, count } = await supabase
    .from('blog_posts')
    .select('id,title,slug,excerpt,cover_image,category,tags,published_at,read_time,author', { count: 'exact' })
    .eq('published', true)
    .order('published_at', { ascending: false })
    .range(from, from + PER - 1);
  return { posts: data || [], total: count || 0 };
}

export default async function BlogPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Math.max(1, parseInt(searchParams.page || '1'));
  const { posts, total } = await getPosts(page);
  const totalPages = Math.ceil(total / PER);

  return (
    <>
      {/* Hero */}
      <section style={{ background:'linear-gradient(160deg,#0a1d3a,#070F1F)',
        borderBottom:'1px solid rgba(249,115,22,0.15)', padding:'calc(80px + 70px) 0 56px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 5rem' }} className="blog-pad">
          <div className="eyebrow">Knowledge Base</div>
          <h1 className="s-title">
            PLYWOOD &amp; HARDWARE<br/>
            <span style={{ color:'#F97316' }}>BUYING GUIDES</span>
          </h1>
          <p className="s-desc">
            Expert advice from Karur&apos;s most trusted plywood dealer.
            {total > 0 && <span style={{ color:'#F97316' }}> {total} articles</span>}
          </p>
        </div>
      </section>

      <section style={{ padding:'56px 0' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 5rem' }} className="blog-pad">

          {posts.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 0' }}>
              <div style={{ fontSize:48, marginBottom:16 }}>📝</div>
              <div className="s-title">COMING SOON</div>
              <p className="s-desc" style={{ margin:'0 auto 28px', textAlign:'center' }}>
                Expert guides coming soon. Ask us on WhatsApp.
              </p>
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener" className="btn-p">
                💬 Ask on WhatsApp
              </a>
            </div>
          ) : (
            <>
              {/* Featured — page 1 only */}
              {page === 1 && posts[0] && (
                <Link href={`/blog/${posts[0].slug}`} className="blog-featured">
                  <div className="blog-feat-img">
                    {posts[0].cover_image
                      ? <Image src={posts[0].cover_image} alt={posts[0].title} fill style={{ objectFit:'cover' }} />
                      : <Placeholder category={posts[0].category} />}
                  </div>
                  <div className="blog-feat-body">
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                      <span className="blog-chip" style={{
                        background: CAT_CHIP[posts[0].category]?.bg || 'rgba(249,115,22,0.15)',
                        color:      CAT_CHIP[posts[0].category]?.color || '#F97316',
                      }}>{posts[0].category}</span>
                      <span style={{ fontSize:11, color:'#F97316', fontFamily:"'Syne',sans-serif", fontWeight:700 }}>⭐ Featured</span>
                    </div>
                    <div className="blog-feat-title">{posts[0].title}</div>
                    <p className="blog-feat-exc">{posts[0].excerpt}</p>
                    <div className="blog-meta">
                      <span>✍️ {posts[0].author}</span>
                      <span>⏱ {posts[0].read_time} min</span>
                      {posts[0].published_at && (
                        <span>📅 {new Date(posts[0].published_at).toLocaleDateString('en-IN',
                          { day:'numeric', month:'short', year:'numeric' })}</span>
                      )}
                    </div>
                    <div className="blog-read-link">Read Article →</div>
                  </div>
                </Link>
              )}

              {/* Grid */}
              {(page === 1 ? posts.slice(1) : posts).length > 0 && (
                <div className="blog-grid">
                  {(page === 1 ? posts.slice(1) : posts).map(post => {
                    const chip = CAT_CHIP[post.category] || CAT_CHIP['Buying Guide'];
                    return (
                      <Link key={post.id} href={`/blog/${post.slug}`} className="blog-card">
                        <div className="blog-card-img">
                          {post.cover_image
                            ? <Image src={post.cover_image} alt={post.title} fill style={{ objectFit:'cover' }} />
                            : <Placeholder category={post.category} />}
                        </div>
                        <div className="blog-card-body">
                          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                            <span className="blog-chip" style={{ background:chip.bg, color:chip.color }}>
                              {post.category}
                            </span>
                            <span style={{ fontSize:11, color:'#7A8EA8' }}>{post.read_time} min</span>
                          </div>
                          <div className="blog-card-title">{post.title}</div>
                          <p className="blog-card-exc">{post.excerpt}</p>
                          <div className="blog-card-read">Read More →</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Pagination — auto-appears as posts grow */}
              {totalPages > 1 && (
                <div className="blog-pages">
                  {page > 1 && (
                    <Link href={`/blog?page=${page - 1}`} className="blog-page-btn">← Prev</Link>
                  )}
                  <div style={{ display:'flex', gap:6 }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                      <Link key={n} href={`/blog?page=${n}`}
                        className={`blog-page-num${n === page ? ' blog-page-num--active' : ''}`}>
                        {n}
                      </Link>
                    ))}
                  </div>
                  {page < totalPages && (
                    <Link href={`/blog?page=${page + 1}`} className="blog-page-btn">Next →</Link>
                  )}
                </div>
              )}
            </>
          )}

          {/* WA CTA */}
          <div className="blog-cta-banner">
            <div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.8rem',
                letterSpacing:'.05em', color:'#F8F9FB', marginBottom:6 }}>
                STILL HAVE QUESTIONS?
              </div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)' }}>
                Our experts in Karur reply on WhatsApp within minutes.
              </div>
            </div>
            <a href={`https://wa.me/${WA}?text=Hi%2C+I+have+a+question+about+plywood.`}
              target="_blank" rel="noopener" className="btn-wa">
              💬 Ask on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <style>{`
        .blog-pad{padding:0 5rem}
        .blog-featured{display:grid;grid-template-columns:1fr 1fr;background:rgba(25,55,109,0.35);border:1px solid rgba(249,115,22,0.18);border-radius:10px;overflow:hidden;text-decoration:none;margin-bottom:32px;transition:border-color .25s,transform .25s,box-shadow .25s}
        .blog-featured:hover{border-color:#F97316;transform:translateY(-3px);box-shadow:0 20px 50px rgba(0,0,0,.4)}
        .blog-feat-img{position:relative;min-height:260px}
        .blog-feat-body{padding:32px;display:flex;flex-direction:column;justify-content:center}
        .blog-feat-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(1.6rem,2.5vw,2rem);letter-spacing:.04em;color:#F8F9FB;line-height:1.05;margin-bottom:12px}
        .blog-feat-exc{font-size:13px;color:#7A8EA8;line-height:1.75;margin-bottom:18px;flex:1}
        .blog-meta{display:flex;gap:14px;font-size:11px;color:#7A8EA8;flex-wrap:wrap;margin-bottom:14px}
        .blog-read-link{font-size:12px;color:#F97316;font-family:'Syne',sans-serif;font-weight:700;letter-spacing:.1em;transition:letter-spacing .2s}
        .blog-featured:hover .blog-read-link{letter-spacing:.16em}
        .blog-chip{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;padding:3px 9px;border-radius:3px}
        .blog-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:24px}
        .blog-card{background:rgba(25,55,109,0.35);border:1px solid rgba(249,115,22,0.15);border-radius:10px;overflow:hidden;text-decoration:none;display:flex;flex-direction:column;transition:border-color .25s,transform .25s,box-shadow .25s}
        .blog-card:hover{border-color:#F97316;transform:translateY(-5px);box-shadow:0 16px 40px rgba(0,0,0,.4)}
        .blog-card-img{position:relative;height:170px}
        .blog-card-body{padding:16px 18px 20px;flex:1;display:flex;flex-direction:column}
        .blog-card-title{font-family:'Syne',sans-serif;font-size:.9rem;font-weight:700;color:#F8F9FB;margin-bottom:7px;line-height:1.35}
        .blog-card-exc{font-size:.75rem;color:#7A8EA8;line-height:1.65;flex:1;margin-bottom:12px}
        .blog-card-read{font-size:.72rem;color:#F97316;font-family:'Syne',sans-serif;font-weight:700;letter-spacing:.08em}
        .blog-pages{display:flex;align-items:center;justify-content:center;gap:12px;margin-top:40px;flex-wrap:wrap}
        .blog-page-btn{font-family:'Syne',sans-serif;font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#F97316;border:1px solid rgba(249,115,22,0.3);border-radius:4px;padding:8px 16px;text-decoration:none;transition:background .2s}
        .blog-page-btn:hover{background:rgba(249,115,22,0.1)}
        .blog-page-num{width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:.8rem;font-weight:700;border:1px solid rgba(255,255,255,0.1);border-radius:4px;text-decoration:none;color:#7A8EA8;transition:all .2s}
        .blog-page-num:hover{border-color:#F97316;color:#F97316}
        .blog-page-num--active{background:#F97316;border-color:#F97316;color:#0B2447}
        .blog-cta-banner{margin-top:56px;background:linear-gradient(135deg,#0d2b17,#0a1f10);border:1px solid rgba(37,211,102,0.2);border-radius:10px;padding:36px 44px;display:flex;align-items:center;justify-content:space-between;gap:28px;flex-wrap:wrap}
        @media(max-width:1024px){.blog-featured{grid-template-columns:1fr!important}.blog-grid{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:640px){.blog-pad{padding:0 1.2rem!important}.blog-grid{grid-template-columns:1fr!important}.blog-cta-banner{padding:24px 20px!important}}
      `}</style>
    </>
  );
}
