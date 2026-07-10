import { MetadataRoute } from 'next';
import { createBuildClient } from '@/lib/supabase/build';
import { SEO_PAGE_TYPES } from '@/lib/seo';

export const dynamic = 'force-dynamic';

// Static city pages â€” kept in sync manually with src/app/areas/[city]/page.tsx,
// since that page uses a hardcoded CITIES record rather than a DB table.
const STATIC_CITY_SLUGS = ['karur', 'trichy', 'namakkal', 'erode', 'salem', 'dindigul'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.karurplywood.co.in';
  const supabase = createBuildClient();

  const [
    { data: pages },
    { data: blogPosts },
    { data: products },
    { data: architects },
    { data: carpenters },
  ] = await Promise.all([
    supabase
      .from('seo_pages')
      .select('full_path, updated_at, seo_areas(slug), seo_categories(slug)')
      .eq('page_type', SEO_PAGE_TYPES.PRODUCT_LOCATION)
      .eq('is_published', true)
      .eq('status', 'published'),
    supabase.from('blog_posts').select('slug, updated_at').eq('published', true),
    supabase.from('products').select('id, updated_at').eq('in_stock', true),
    supabase.from('architects').select('slug, updated_at').eq('verified', true),
    supabase.from('carpenters').select('id, updated_at').eq('verified', true),
  ]);

  const dynamicPages = pages?.map((p: any) => ({
    url: `${baseUrl}${p.full_path || `/location/${p.seo_areas?.slug}/${p.seo_categories?.slug}`}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    priority: p.seo_areas?.slug === 'karur' ? 0.9 : 0.7,
    changeFrequency: 'weekly' as const,
  })) || [];

  const blogPages = blogPosts?.map((post: any) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
    priority: 0.6,
    changeFrequency: 'monthly' as const,
  })) || [];

  const productPages = products?.map((product: any) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    priority: 0.7,
    changeFrequency: 'weekly' as const,
  })) || [];

  const architectPages = architects?.map((architect: any) => ({
    url: `${baseUrl}/architects/${architect.slug}`,
    lastModified: architect.updated_at ? new Date(architect.updated_at) : new Date(),
    priority: 0.5,
    changeFrequency: 'monthly' as const,
  })) || [];

  const carpenterPages = carpenters?.map((carpenter: any) => ({
    url: `${baseUrl}/carpenters/${carpenter.id}`,
    lastModified: carpenter.updated_at ? new Date(carpenter.updated_at) : new Date(),
    priority: 0.5,
    changeFrequency: 'monthly' as const,
  })) || [];

  const cityPages = STATIC_CITY_SLUGS.map((slug) => ({
    url: `${baseUrl}/areas/${slug}`,
    lastModified: new Date(),
    priority: slug === 'karur' ? 0.8 : 0.6,
    changeFrequency: 'monthly' as const,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), priority: 1.0, changeFrequency: 'daily' },
    { url: `${baseUrl}/products`,  lastModified: new Date(), priority: 0.9, changeFrequency: 'weekly'  },
    { url: `${baseUrl}/location`,  lastModified: new Date(), priority: 0.8, changeFrequency: 'weekly'  },
    { url: `${baseUrl}/blog`,      lastModified: new Date(), priority: 0.7, changeFrequency: 'weekly'  },
    { url: `${baseUrl}/carpenters`,lastModified: new Date(), priority: 0.7, changeFrequency: 'weekly'  },
    { url: `${baseUrl}/architects`,lastModified: new Date(), priority: 0.7, changeFrequency: 'weekly'  },
    { url: `${baseUrl}/areas`,     lastModified: new Date(), priority: 0.6, changeFrequency: 'monthly' },
    // Legal & policy pages
    { url: `${baseUrl}/orders/track`,        lastModified: new Date(), priority: 0.5, changeFrequency: 'yearly' },
    { url: `${baseUrl}/privacy-policy`,      lastModified: new Date(), priority: 0.3, changeFrequency: 'yearly' },
    { url: `${baseUrl}/terms-and-conditions`,lastModified: new Date(), priority: 0.3, changeFrequency: 'yearly' },
    { url: `${baseUrl}/shipping-returns`,    lastModified: new Date(), priority: 0.3, changeFrequency: 'yearly' },
    { url: `${baseUrl}/refund-policy`,       lastModified: new Date(), priority: 0.3, changeFrequency: 'yearly' },
    { url: `${baseUrl}/cancellation-policy`, lastModified: new Date(), priority: 0.3, changeFrequency: 'yearly' },
    { url: `${baseUrl}/warranty-policy`,     lastModified: new Date(), priority: 0.4, changeFrequency: 'yearly' },
    { url: `${baseUrl}/cookie-policy`,       lastModified: new Date(), priority: 0.2, changeFrequency: 'yearly' },
    { url: `${baseUrl}/disclaimer`,          lastModified: new Date(), priority: 0.2, changeFrequency: 'yearly' },
    { url: `${baseUrl}/payment-policy`,      lastModified: new Date(), priority: 0.3, changeFrequency: 'yearly' },
    ...dynamicPages,
    ...blogPages,
    ...productPages,
    ...architectPages,
    ...carpenterPages,
    ...cityPages,
  ];
}
