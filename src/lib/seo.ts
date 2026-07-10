export const SEO_PAGE_TYPES = {
  LOCATION: 'location',
  CATEGORY: 'category',
  BRAND: 'brand',
  PRODUCT_LOCATION: 'product_location',
  BRAND_LOCATION: 'brand_location',
  BLOG: 'blog',
} as const;

export type SeoPageType = typeof SEO_PAGE_TYPES[keyof typeof SEO_PAGE_TYPES];

export function productLocationSlug(categorySlug: string, areaSlug: string) {
  return `${categorySlug}-in-${areaSlug}`;
}

export function productLocationPath(areaSlug: string, categorySlug: string) {
  return `/location/${areaSlug}/${categorySlug}`;
}

