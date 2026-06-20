import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createBuildClient } from '@/lib/supabase/build';
import Breadcrumb from '@/components/Breadcrumb';
import FAQSection from '@/components/FAQSection';
import LocalBusinessSchema from '@/components/LocalBusinessSchema';
import { JsonLd } from '@/components/JsonLd';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ area: string; category: string }> }): Promise<Metadata> {
  const { area, category } = await params;
  const supabase = createBuildClient();

  try {
    const { data: pageData } = await supabase
      .from('seo_pages')
      .select('title, meta_description, status, is_published')
      .ilike('slug', `${category}-in-${area}`)
      .maybeSingle();

    if (!pageData || pageData.status === 'draft') {
      return { 
        title: 'Coming Soon | Karur Plywood', 
        description: 'This page is being prepared with unique content. Check back soon.',
        robots: { index: false, follow: false },
      };
    }

    return {
      title: pageData.title || `${category} in ${area}`,
      description: pageData.meta_description || `Buy ${category} in ${area}.`,
      alternates: { canonical: `https://karurplywood.co.in/location/${area}/${category}` },
      robots: pageData.is_published ? { index: true, follow: true } : { index: false, follow: false },
    };
  } catch {
    return {
      title: 'Karur Plywood & Company',
      description: 'ISI certified plywood suppliers in Karur and surrounding areas.',
    };
  }
}

export default async function AreaCategoryPage({ params }: { params: Promise<{ area: string; category: string }> }) {
  const { area, category } = await params;
  const supabase = createBuildClient();

  try {
    // 1. Fetch page data purely based on the unique slug match (removes strict page_type requirement)
    const { data: pageData, error: pageError } = await supabase
      .from('seo_pages')
      .select('*')
      .ilike('slug', `${category}-in-${area}`)
      .maybeSingle();

    if (pageError) console.error('Supabase query log:', pageError);

    // Fallback if no matching entry or if it is a draft
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
            Content status: {pageData?.status || 'draft'}
          </div>
          <div className="mt-8">
            <a href="https://wa.me/919159666538" 
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold">
              Order on WhatsApp
            </a>
          </div>
        </main>
      );
    }

    // 2. Fetch standalone auxiliary data contexts safely
    const { data: areaData } = await supabase.from('seo_areas').select('*').ilike('slug', area).maybeSingle();
    const { data: categoryData } = await supabase.from('seo_categories').select('*').ilike('slug', category).maybeSingle();

    const isPending = pageData.status === 'pending_review';
    const faqs = pageData.faq_content || [];
    const links = pageData.internal_links || [];

    // Safe human-readable clean texts if tables lack an exact lookup link
    const areaName = areaData?.display_name || area.replace(/-/g, ' ');
    const categoryName = categoryData?.display_name || category.replace(/-/g, ' ');

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
          { name: areaName, url: `/location/${areaData?.slug || area}` },
          { name: categoryName, url: `/location/${areaData?.slug || area}/${categoryData?.slug || category}` },
        ]} />

        <JsonLd type="breadcrumb" items={[
          { name: 'Home', url: '/' },
          { name: 'Locations', url: '/location' },
          { name: areaName, url: `/location/${areaData?.slug || area}` },
          { name: categoryName, url: `/location/${areaData?.slug || area}/${categoryData?.slug || category}` },
        ]} />

        {areaData && categoryData && <LocalBusinessSchema area={areaData} category={categoryData} />}

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {pageData.h1 || `${categoryName} in ${areaName}`}
          </h1>
        </header>

        <section className="mb-10">
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            {pageData.intro}
          </div>
        </section>

        {pageData.product_explanation && (
          <section className="mb-10 bg-gray-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About {categoryName}</h2>
            <div className="prose max-w-none text-gray-700">
              {pageData.product_explanation}
            </div>
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
              {links.map((link: any, i: number) => (
                <a key={i} href={link.url} className="bg-white border border-gray-200 text-blue-600 px-4 py-2 rounded-lg text-sm">
                  {link.text}
                </a>
              ))}
            </div>
          </section>
        )}

        {faqs.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <FAQSection faqs={faqs} />
            <JsonLd type="faq" faqs={faqs} />
          </section>
        )}

        <section className="text-center bg-amber-50 p-8 rounded-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Order {categoryName} in {areaName}</h2>
          <p className="text-gray-700 mb-4">Call or WhatsApp us for {areaData?.delivery_time || 'prompt'} delivery.</p>
          <a href="https://wa.me/919159666538" className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold">
            Order on WhatsApp
          </a>
        </section>
      </main>
    );
  } catch (error) {
    console.error('Crash safely bypassed:', error);
    return notFound();
  }
}