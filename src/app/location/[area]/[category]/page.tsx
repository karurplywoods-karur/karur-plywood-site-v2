import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createBuildClient } from '@/lib/supabase/build';
import Breadcrumb from '@/components/Breadcrumb';
import FAQSection from '@/components/FAQSection';
import LocalBusinessSchema from '@/components/LocalBusinessSchema';
import { JsonLd } from '@/components/JsonLd';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AreaCategoryPage({ params }: { params: Promise<{ area: string; category: string }> }) {
  const { area, category } = await params;
  const supabase = createBuildClient();

  try {
    // 1. Fetch the primary page data cleanly without enforcing database joins
    const { data: pageData } = await supabase
      .from('seo_pages')
      .select('*')
      .eq('page_type', 'location_category')
      .ilike('slug', `${category}-in-${area}`)
      .single();

    if (!pageData || pageData.status === 'draft' || !pageData.intro) {
      return (
        <main className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 capitalize">
            {category.replace(/-/g, ' ')} in {area.replace(/-/g, ' ')}
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            This page is being prepared with unique, high-quality content.
          </p>
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 px-4 py-2 rounded-full text-sm">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
            Content in {pageData?.status || 'draft'} — check back soon
          </div>
          <div className="mt-8">
            <a href="https://wa.me/919159666538" 
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition">
              Order on WhatsApp
            </a>
          </div>
        </main>
      );
    }

    // 2. Fetch associated area details safely in parallel
    const { data: areaData } = await supabase
      .from('seo_areas')
      .select('*')
      .ilike('slug', area)
      .maybeSingle();

    // 3. Fetch associated category details safely in parallel
    const { data: categoryData } = await supabase
      .from('seo_categories')
      .select('*')
      .ilike('slug', category)
      .maybeSingle();

    const isPending = pageData.status === 'pending_review';
    const faqs = pageData.faq_content || [];
    const links = pageData.internal_links || [];

    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        {isPending && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6 text-sm">
            ⚠️ This page content is under review. Some details may be updated.
          </div>
        )}

        <Breadcrumb items={[
          { name: 'Home', url: '/' },
          { name: 'Locations', url: '/location' },
          { name: areaData?.display_name || area, url: `/location/${areaData?.slug || area}` },
          { name: categoryData?.display_name || category, url: `/location/${areaData?.slug || area}/${categoryData?.slug || category}` },
        ]} />

        <JsonLd type="breadcrumb" items={[
          { name: 'Home', url: '/' },
          { name: 'Locations', url: '/location' },
          { name: areaData?.display_name || area, url: `/location/${areaData?.slug || area}` },
          { name: categoryData?.display_name || category, url: `/location/${areaData?.slug || area}/${categoryData?.slug || category}` },
        ]} />

        {areaData && categoryData && <LocalBusinessSchema area={areaData} category={categoryData} />}

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {pageData.h1}
          </h1>
        </header>

        <section className="mb-10">
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            {pageData.intro}
          </div>
        </section>

        {pageData.product_explanation && (
          <section className="mb-10 bg-gray-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              About {categoryData?.display_name || category}
            </h2>
            <div className="prose max-w-none text-gray-700">
              {pageData.product_explanation}
            </div>
          </section>
        )}

        {pageData.localized_content && (
          <section className="mb-10 bg-blue-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {categoryData?.display_name || category} in {areaData?.display_name || area}
            </h2>
            <div className="prose max-w-none text-gray-700">
              {pageData.localized_content}
            </div>
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
              {links.map((link: any, i: number) => (
                <a key={i} href={link.url} 
                  className="bg-white border border-gray-200 text-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition">
                  {link.text}
                </a>
              ))}
            </div>
          </section>
        )}

        {faqs.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <FAQSection faqs={faqs} />
            <JsonLd type="faq" faqs={faqs} />
          </section>
        )}

        <section className="text-center bg-amber-50 p-8 rounded-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Order {categoryData?.display_name || category} in {areaData?.display_name || area}
          </h2>
          <p className="text-gray-700 mb-4">
            Call or WhatsApp us for {areaData?.delivery_time || 'prompt'} delivery.
          </p>
          <a href="https://wa.me/919159666538" 
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition">
            Order on WhatsApp
          </a>
        </section>

        <footer className="mt-10 pt-6 border-t text-xs text-gray-400 text-center">
          {pageData.ai_generated_at && <span>AI-generated content · </span>}
          {pageData.content_version && <span>Version {pageData.content_version} · </span>}
          {pageData.word_count && <span>{pageData.word_count} words</span>}
        </footer>
      </main>
    );
  } catch (error) {
    console.error('Page error:', error);
    return notFound();
  }
}