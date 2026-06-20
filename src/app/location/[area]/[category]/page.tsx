import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createBuildClient } from '@/lib/supabase/build';
import Breadcrumb from '@/components/Breadcrumb';
import FAQSection from '@/components/FAQSection';
import LocalBusinessSchema from '@/components/LocalBusinessSchema';
import { BreadcrumbSchema, FAQSchema } from '@/components/JsonLd';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ area: string; category: string }>;
}

function formatSlugText(text: string): string {
  if (!text) return '';
  return text.split('-').join(' ');
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  try {
    const resolvedParams = await props.params;
    if (!resolvedParams?.area || !resolvedParams?.category) {
      return { title: 'Karur Plywood & Company' };
    }

    const { area, category } = resolvedParams;
    const supabase = createBuildClient();

    const { data: pageData } = await supabase
      .from('seo_pages')
      .select('title, meta_description, status, is_published')
      .ilike('slug', `${category}-in-${area}`)
      .maybeSingle();

    if (!pageData || pageData.status === 'draft') {
      return { 
        title: 'Coming Soon | Karur Plywood',
        robots: { index: false, follow: false },
      };
    }

    return {
      title: pageData.title || `${formatSlugText(category)} in ${formatSlugText(area)}`,
      description: pageData.meta_description || `Buy premium ${formatSlugText(category)} in ${formatSlugText(area)}.`,
      alternates: { canonical: `https://karurplywood.co.in/location/${area}/${category}` },
      robots: pageData.is_published ? { index: true, follow: true } : { index: false, follow: false },
    };
  } catch {
    return { title: 'Karur Plywood & Company' };
  }
}

export default async function AreaCategoryPage(props: PageProps) {
  try {
    const resolvedParams = await props.params;
    if (!resolvedParams?.area || !resolvedParams?.category) {
      return notFound();
    }

    const { area, category } = resolvedParams;
    const supabase = createBuildClient();

    // 1. Fetch primary target data
    const { data: pageData, error: pageError } = await supabase
      .from('seo_pages')
      .select('id, slug, status, h1, title, meta_description, intro, product_explanation, localized_content, faq_content, internal_links, is_published')
      .ilike('slug', `${category}-in-${area}`)
      .maybeSingle();

    if (pageError || !pageData || pageData.status === 'draft') {
      return (
        <main className="max-w-6xl mx-auto px-4 py-16 text-center" suppressHydrationWarning>
          <h1 className="text-3xl font-bold text-gray-900 mb-4 capitalize">
            {formatSlugText(category)} in {formatSlugText(area)}
          </h1>
          <p className="text-lg text-gray-600 mb-6">This page content is currently processing.</p>
        </main>
      );
    }

    // 2. Fetch auxiliary context rows safely
    const { data: areaData } = await supabase.from('seo_areas').select('*').ilike('slug', area).maybeSingle();
    const { data: categoryData } = await supabase.from('seo_categories').select('*').ilike('slug', category).maybeSingle();

    const isPending = pageData.status === 'pending_review';
    const areaName = areaData?.display_name || formatSlugText(area);
    const categoryName = categoryData?.display_name || formatSlugText(category);

    // 3. Safe Arrays Extraction
    let faqs: any[] = [];
    try {
      if (pageData.faq_content) {
        faqs = typeof pageData.faq_content === 'string' ? JSON.parse(pageData.faq_content) : pageData.faq_content;
      }
    } catch { faqs = []; }
    if (!Array.isArray(faqs)) faqs = [];

    let links: any[] = [];
    try {
      if (pageData.internal_links) {
        links = typeof pageData.internal_links === 'string' ? JSON.parse(pageData.internal_links) : pageData.internal_links;
      }
    } catch { links = []; }
    if (!Array.isArray(links)) links = [];

    // 4. Align items exactly to Breadcrumb expectations ({ name, href })
    const breadcrumbItems = [
      { name: 'Home', href: '/' },
      { name: 'Locations', href: '/location' },
      { name: areaName, href: `/location/${area}` },
      { name: categoryName, href: `/location/${area}/${category}` },
    ];

    // Align parameters for BreadcrumbSchema ({ name, url })
    const schemaBreadcrumbItems = breadcrumbItems.map(item => ({
      name: item.name,
      url: item.href
    }));

    // Safe adaptation for LocalBusinessSchema components fields
    const adaptedAreaObject = {
      name: areaName,
      pincode: areaData?.pincode || '639001',
      lat: areaData?.latitude || 10.9601,
      lng: areaData?.longitude || 78.0785,
      slug: area
    };

    const adaptedCategoryObject = {
      display_name: categoryName,
      slug: category
    };

    return (
      <main className="max-w-6xl mx-auto px-4 py-8 bg-white text-gray-900" suppressHydrationWarning>
        {isPending && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6 text-sm">
            ⚠️ This page content is under review.
          </div>
        )}

        {/* Validated visual and JSON-LD layout components */}
        <Breadcrumb items={breadcrumbItems} />
        <BreadcrumbSchema items={schemaBreadcrumbItems} />
        <LocalBusinessSchema area={adaptedAreaObject} category={adaptedCategoryObject} />

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {pageData.h1 || `${categoryName} in ${areaName}`}
          </h1>
        </header>

        <section className="mb-10">
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            {pageData.intro || `Premium quality ${categoryName} options built to last across ${areaName}.`}
          </div>
        </section>

        {pageData.product_explanation && (
          <section className="mb-10 bg-gray-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About {categoryName}</h2>
            <div className="prose max-w-none text-gray-700">{pageData.product_explanation}</div>
          </section>
        )}

        {pageData.localized_content && (
          <section className="mb-10 bg-blue-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{categoryName} in {areaName}</h2>
            <div className="prose max-w-none text-gray-700">{pageData.localized_content}</div>
            {areaData && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <span>📍</span>
                <span>{areaData.distance_km}km from Karur · Delivery: {areaData.delivery_time}</span>
              </div>
            )}
          </section>
        )}

        {links.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Related Pages</h2>
            <div className="flex flex-wrap gap-3">
              {links.map((link: any, i: number) => {
                if (!link || !link.url) return null;
                return (
                  <a key={i} href={link.url} className="bg-white border border-gray-200 text-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition">
                    {link.text || 'View Page'}
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {faqs.length > 0 && (
          <section className="mb-10">
            <FAQSection faqs={faqs} />
            <FAQSchema faqs={faqs.map(f => ({ question: f.question || f.q, answer: f.answer || f.a }))} />
          </section>
        )}

        <section className="text-center bg-amber-50 p-8 rounded-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Order {categoryName} in {areaName}</h2>
          <p className="text-gray-700 mb-4">Call or WhatsApp us for direct wholesale deals and delivery tracking.</p>
          <a href="https://wa.me/919159666538" className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition">
            Order on WhatsApp
          </a>
        </section>
      </main>
    );
  } catch (error) {
    console.error('Render fallback safety caught:', error);
    return notFound();
  }
}