// src/app/sitemap.ts
// Next.js 14 built-in sitemap — no package needed.
// Auto-generates /sitemap.xml including all blog posts & area pages.
import { MetadataRoute } from 'next';
import { supabase } from '@/lib/db';

const BASE = 'https://karurplywood.com';

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: BASE,                    lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
  { url: `${BASE}/products`,      lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
  { url: `${BASE}/quick-order`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE}/bom-quote`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE}/carpenters`,    lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
  { url: `${BASE}/architects`,    lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
  { url: `${BASE}/blog`,          lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
  { url: `${BASE}/about`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${BASE}/contact`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE}/location`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE}/areas`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  // Hyper-local pages — high priority for local SEO
  { url: `${BASE}/areas/karur`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
  { url: `${BASE}/areas/trichy`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
  { url: `${BASE}/areas/namakkal`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
  { url: `${BASE}/areas/erode`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE}/areas/salem`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE}/areas/dindigul`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Dynamic blog posts
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('published', true)
    .order('published_at', { ascending: false });

  const blogPages: MetadataRoute.Sitemap = (posts || []).map(p => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Dynamic architect portfolios
  const { data: architects } = await supabase
    .from('architects')
    .select('slug, created_at')
    .eq('verified', true);

  const archPages: MetadataRoute.Sitemap = (architects || []).map(a => ({
    url: `${BASE}/architects/${a.slug}`,
    lastModified: new Date(a.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...STATIC_PAGES, ...blogPages, ...archPages];
}
