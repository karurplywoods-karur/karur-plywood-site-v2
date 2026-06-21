import { MetadataRoute } from 'next';
import { createBuildClient } from '@/lib/supabase/build';
import { SEO_PAGE_TYPES } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://karurplywood.co.in';
  const supabase = createBuildClient();

  const { data: pages } = await supabase
    .from('seo_pages')
    .select('full_path, updated_at, seo_areas(slug), seo_categories(slug)')
    .eq('page_type', SEO_PAGE_TYPES.PRODUCT_LOCATION)
    .eq('is_published', true)
    .eq('status', 'published');

  const dynamicPages = pages?.map((p: any) => ({
    url: `${baseUrl}${p.full_path || `/location/${p.seo_areas?.slug}/${p.seo_categories?.slug}`}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    priority: p.seo_areas?.slug === 'karur' ? 0.9 : 0.7,
    changeFrequency: 'weekly' as const,
  })) || [];

  return [
    { url: baseUrl, lastModified: new Date(), priority: 1.0, changeFrequency: 'daily' },
    { url: `${baseUrl}/products`, lastModified: new Date(), priority: 0.9, changeFrequency: 'weekly' },
    { url: `${baseUrl}/location`, lastModified: new Date(), priority: 0.8, changeFrequency: 'weekly' },
    ...dynamicPages,
  ];
}
