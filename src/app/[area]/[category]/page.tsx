import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { generateUniqueIntro, generateFAQ, generateMeta } from '@/lib/content-generators';
import ProductGrid from '@/components/ProductGrid';
import FAQSection from '@/components/FAQSection';
import NearbyAreas from '@/components/NearbyAreas';
import Breadcrumb from '@/components/Breadcrumb';
import LocalBusinessSchema from '@/components/LocalBusinessSchema';
import ReviewSection from '@/components/ReviewSection';

export async function generateStaticParams() {
  const supabase = createClient();
  const { data: pages } = await supabase
    .from('area_category_pages')
    .select(`
      is_published,
      areas(slug),
      categories(slug)
    `)
    .eq('is_published', true);

  return pages?.map((p: any) => ({
    area: p.areas.slug,
    category: p.categories.slug,
  })) || [];
}

export async function generateMetadata({ params }: { params: { area: string; category: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: pageData } = await supabase
    .from('area_category_pages')
    .select('*, areas(*), categories(*)')
    .eq('areas.slug', params.area)
    .eq('categories.slug', params.category)
    .eq('is_published', true)
    .single();

  if (!pageData) return { title: 'Not Found' };

  const meta = pageData.meta_title && pageData.meta_description
    ? { title: pageData.meta_title, description: pageData.meta_description }
    : generateMeta(pageData.areas, pageData.categories);

  return {
    title: meta.title,
    description: meta.description,
    keywords: `${pageData.categories.name} ${pageData.areas.name}, ${pageData.categories.name} dealers ${pageData.areas.name}, ISI certified ${pageData.categories.name} ${pageData.areas.name}, ${pageData.categories.name} price ${pageData.areas.name}`,
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
      locale: 'en_IN',
    },
    alternates: {
      canonical: `https://karurplywood.co.in/${params.area}/${params.category}`,
    },
  };
}

export default async function AreaCategoryPage({ params }: { params: { area: string; category: string } }) {
  const supabase = createClient();

  const { data: pageData } = await supabase
    .from('area_category_pages')
    .select('*, areas(*), categories(*)')
    .eq('areas.slug', params.area)
    .eq('categories.slug', params.category)
    .eq('is_published', true)
    .single();

  if (!pageData) return notFound();

  const { areas: area, categories: category } = pageData;

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', category.id)
    .eq('is_active', true);

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('area_id', area.id)
    .limit(5);

  const intro = pageData.unique_intro || generateUniqueIntro(area, category);
  const faqs = pageData.faq_custom?.length ? pageData.faq_custom : generateFAQ(area, category);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <Breadcrumb items={[
        { name: 'Home', href: '/' },
        { name: area.name, href: `/${area.slug}` },
        { name: category.display_name, href: `/${area.slug}/${category.slug}` },
      ]} />

      <LocalBusinessSchema area={area} category={category} reviews={reviews} />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {category.display_name} in {area.display_name}
        </h1>
        <p className="text-lg text-gray-700 leading-relaxed">{intro}</p>
      </header>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">
          {category.display_name} Available in {area.name}
        </h2>
        <ProductGrid products={products || []} area={area} />
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
          <blockquote className="text-lg italic text-gray-800">
            "{pageData.local_testimonial}"
          </blockquote>
        </section>
      )}

      <ReviewSection reviews={reviews} area={area} />

      <FAQSection faqs={faqs} />

      <NearbyAreas currentArea={area} currentCategory={category} />

      <section className="mt-10 text-center bg-amber-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-3">
          Order {category.display_name} in {area.name}
        </h2>
        <p className="text-gray-700 mb-4">
          Call or WhatsApp us for {area.delivery_time} delivery to {area.display_name}.
        </p>
        <a
          href="https://wa.me/91XXXXXXXXXX"
          className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Order on WhatsApp
        </a>
      </section>
    </main>
  );
}
