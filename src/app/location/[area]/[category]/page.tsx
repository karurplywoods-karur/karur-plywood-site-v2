import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createBuildClient } from '@/lib/supabase/build';
import { generateUniqueIntro, generateFAQ, generateMeta, generateH1 } from '@/lib/content-generators';
import ProductGrid from '@/components/ProductGrid';
import FAQSection from '@/components/FAQSection';
import NearbyAreas from '@/components/NearbyAreas';
import Breadcrumb from '@/components/Breadcrumb';
import LocalBusinessSchema from '@/components/LocalBusinessSchema';
import ReviewSection from '@/components/ReviewSection';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: { area: string; category: string } }): Promise<Metadata> {
  try {
    const supabase = createBuildClient();

    // Step 1: Get area and category IDs by slug (reliable query)
    const [{ data: areaRow }, { data: categoryRow }] = await Promise.all([
      supabase.from('seo_areas').select('id, name, display_name, slug').eq('slug', params.area).single(),
      supabase.from('seo_categories').select('id, name, display_name, slug').eq('slug', params.category).single(),
    ]);

    if (!areaRow || !categoryRow) {
      return { title: 'Page Not Found | Karur Plywood', description: 'The page you are looking for does not exist.' };
    }

    // Step 2: Get the page using IDs
    const { data: pageData } = await supabase
      .from('seo_area_category_pages')
      .select('*, seo_areas(*), seo_categories(*)')
      .eq('area_id', areaRow.id)
      .eq('category_id', categoryRow.id)
      .eq('is_published', true)
      .single();

    if (!pageData) {
      return { title: 'Page Not Found | Karur Plywood', description: 'The page you are looking for does not exist.' };
    }

    const meta = pageData.meta_title && pageData.meta_description
      ? { title: pageData.meta_title, description: pageData.meta_description }
      : generateMeta(pageData.seo_areas, pageData.seo_categories);

    return {
      title: meta.title,
      description: meta.description,
      keywords: `${pageData.seo_categories.name} ${pageData.seo_areas.name}, ${pageData.seo_categories.name} dealers ${pageData.seo_areas.name}, ISI certified ${pageData.seo_categories.name} ${pageData.seo_areas.name}, ${pageData.seo_categories.name} price ${pageData.seo_areas.name}`,
      openGraph: { title: meta.title, description: meta.description, type: 'website', locale: 'en_IN' },
      alternates: { canonical: `https://karurplywood.co.in/location/${params.area}/${params.category}` },
    };
  } catch (error) {
    console.error('Metadata error:', error);
    return { title: 'Karur Plywood & Company', description: 'ISI certified plywood suppliers in Karur and surrounding areas.' };
  }
}

export default async function AreaCategoryPage({ params }: { params: { area: string; category: string } }) {
  try {
    const supabase = createBuildClient();

    // Step 1: Get area and category by slug (reliable query)
    const [{ data: areaRow }, { data: categoryRow }] = await Promise.all([
      supabase.from('seo_areas').select('*').eq('slug', params.area).single(),
      supabase.from('seo_categories').select('*').eq('slug', params.category).single(),
    ]);

    if (!areaRow || !categoryRow) {
      console.log('Area or category not found:', { area: params.area, category: params.category });
      return notFound();
    }

    // Step 2: Get the page using IDs
    const { data: pageData } = await supabase
      .from('seo_area_category_pages')
      .select('*, seo_areas(*), seo_categories(*)')
      .eq('area_id', areaRow.id)
      .eq('category_id', categoryRow.id)
      .eq('is_published', true)
      .single();

    if (!pageData) {
      console.log('Page not found for area/category:', { areaId: areaRow.id, categoryId: categoryRow.id, areaSlug: params.area, categorySlug: params.category });
      return notFound();
    }

    const { seo_areas: area, seo_categories: category } = pageData;

    const { data: reviews } = await supabase
      .from('seo_reviews')
      .select('*')
      .eq('area_id', area.id)
      .eq('category_id', category.id)
      .limit(5);

    const intro = pageData.unique_intro || generateUniqueIntro(area, category);
    const faqs = pageData.faq_custom?.length ? pageData.faq_custom : generateFAQ(area, category);
    const h1 = pageData.h1 || generateH1(area, category);

    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumb items={[
          { name: 'Home', href: '/' },
          { name: 'Locations', href: '/location' },
          { name: area.name, href: `/location/${area.slug}` },
          { name: category.display_name, href: `/location/${area.slug}/${category.slug}` },
        ]} />

        <LocalBusinessSchema area={area} category={category} reviews={reviews} />

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{h1}</h1>
          <p className="text-lg text-gray-700 leading-relaxed">{intro}</p>
        </header>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">{category.display_name} Available in {area.name}</h2>
          <ProductGrid area={area} />
        </section>

        <section className="mb-10 bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Delivery Information</h2>
          <p className="text-gray-700">
            We deliver {category.display_name} to {area.name}
            {pageData.delivery_note || ` within ${area.delivery_time}`}.
            Free delivery for orders above ₹5,000 within {area.name} city limits.
            Surrounding areas: {area.nearby_subareas?.slice(0, 4).join(', ')}.
          </p>
        </section>

        {pageData.local_testimonial && (
          <section className="mb-10 bg-green-50 p-6 rounded-lg">
            <blockquote className="text-lg italic text-gray-800">&ldquo;{pageData.local_testimonial}&rdquo;</blockquote>
          </section>
        )}

        <ReviewSection reviews={reviews} area={area} />
        <FAQSection faqs={faqs} />
        <NearbyAreas currentArea={area} currentCategory={category} />

        <section className="mt-10 text-center bg-amber-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-3">Order {category.display_name} in {area.name}</h2>
          <p className="text-gray-700 mb-4">Call or WhatsApp us for {area.delivery_time} delivery to {area.display_name}.</p>
          <a href="https://wa.me/91XXXXXXXXXX" className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition">Order on WhatsApp</a>
        </section>
      </main>
    );
  } catch (error) {
    console.error('Error loading page:', error);
    return notFound();
  }
}