import { MetadataRoute } from 'next';
import { createBuildClient } from '@/lib/supabase/build';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://karurplywood.co.in';
  const supabase = createBuildClient();

  const { data: pages } = await supabase
    .from('seo_area_category_pages')
    .select('seo_areas(slug), seo_categories(slug), updated_at')
    .eq('is_published', true);

  const dynamicPages = pages?.map((p: any) => ({
    url: `${baseUrl}/location/${p.seo_areas.slug}/${p.seo_categories.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    priority: p.seo_areas.slug === 'karur' ? 0.9 : 0.7,
    changeFrequency: 'weekly' as const,
  })) || [];

  return [
    { url: baseUrl, lastModified: new Date(), priority: 1.0, changeFrequency: 'daily' },
    { url: `${baseUrl}/products`, lastModified: new Date(), priority: 0.9, changeFrequency: 'weekly' },
    ...dynamicPages,
  ];
}
