import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createBuildClient } from '@/lib/supabase/build';
import Breadcrumb from '@/components/Breadcrumb';
import { BreadcrumbSchema } from '@/components/JsonLd';
import LocalBusinessSchema from '@/components/LocalBusinessSchema';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ area: string }>;
}

function formatSlugText(text: string): string {
  if (!text) return '';
  return text.split('-').join(' ');
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  try {
    const { area } = await props.params;
    const supabase = createBuildClient();
    const { data: areaData } = await supabase
      .from('seo_areas')
      .select('display_name, distance_km, delivery_time')
      .ilike('slug', area)
      .maybeSingle();

    if (!areaData) {
      return { title: 'Coming Soon | Karur Plywood', robots: { index: false, follow: false } };
    }

    const areaName = areaData.display_name || formatSlugText(area);

    return {
      title: `Plywood, Laminates & Hardware Dealer in ${areaName} | Karur Plywood`,
      description: `Wholesale plywood, laminates, doors, and hardware supply in ${areaName}. Direct job-site delivery within ${areaData.delivery_time || '1-2 days'}, GST invoicing, and trade pricing for contractors and carpenters.`,
      alternates: { canonical: `https://www.karurplywood.co.in/location/${area}` },
      robots: { index: true, follow: true },
    };
  } catch {
    return { title: ' ' };
  }
}

export default async function AreaPage(props: PageProps) {
  try {
    const { area } = await props.params;
    const supabase = createBuildClient();

    const { data: areaData } = await supabase
      .from('seo_areas')
      .select('*')
      .ilike('slug', area)
      .maybeSingle();

    if (!areaData) return notFound();

    const { data: categories } = await supabase
      .from('seo_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    const areaName = areaData.display_name || formatSlugText(area);
    const subLocalities = Array.isArray(areaData.neighborhoods) ? areaData.neighborhoods : [];

    const breadcrumbItems = [
      { name: 'Home', href: '/' },
      { name: 'Locations', href: '/location' },
      { name: areaName, href: `/location/${area}` },
    ];

    const adaptedAreaObject = {
      name: areaName,
      pincode: areaData.pincode || '639001',
      lat: areaData.latitude ?? areaData.lat ?? 10.9601,
      lng: areaData.longitude ?? areaData.lng ?? 78.0785,
      slug: area,
    };

    return (
      <main className="max-w-6xl mx-auto px-4 py-6 bg-white text-gray-900" suppressHydrationWarning>
        <Breadcrumb items={breadcrumbItems} />
        <BreadcrumbSchema items={breadcrumbItems.map((i) => ({ name: i.name, url: i.href }))} />
        <LocalBusinessSchema area={adaptedAreaObject} category={{ display_name: 'Plywood & Hardware', slug: 'plywood' }} reviews={[]} />

        <header className="mt-4 mb-8 border-b border-gray-100 pb-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full w-fit uppercase tracking-wider mb-3">
            🏢 Authorized B2B Showroom Supply Depot
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
            Plywood & Hardware Supply in {areaName}
          </h1>
          <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
            Karur Plywood & Company delivers wholesale plywood, laminates, doors, and hardware direct to job sites in {areaName}
            {areaData.distance_km ? `, ${areaData.distance_km}km from our Karur showroom` : ''}. Typical delivery window: {areaData.delivery_time || '1-2 days'}.
          </div>
        </header>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Materials Available in {areaName} ({categories?.length || 0})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories?.map((category: any) => (
              <a
                key={category.slug}
                href={`/location/${area}/${category.slug}`}
                className="border border-gray-100 rounded-xl p-5 bg-slate-50/50 hover:border-amber-300 hover:bg-amber-50/40 transition block"
              >
                <h3 className="font-bold text-lg text-blue-700 mb-1">{category.display_name}</h3>
                {category.base_price ? (
                  <p className="text-sm text-emerald-800 font-semibold">Starting at ₹{category.base_price} {category.price_unit || 'per sheet'}</p>
                ) : null}
                {category.parent_category ? <p className="text-sm text-gray-500">{category.parent_category}</p> : null}
                <span className="text-blue-600 text-sm mt-3 inline-block font-semibold">View Pricing & Details →</span>
              </a>
            ))}
          </div>
        </section>

        {subLocalities.length > 0 && (
          <section className="mb-10 bg-blue-50/40 border border-blue-100 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delivery Zones Within {areaName}</h2>
            <div className="flex flex-wrap gap-2 mt-3">
              {subLocalities.map((loc: string, i: number) => (
                <span key={i} className="bg-white border border-blue-200/60 px-2.5 py-1 rounded text-xs font-medium text-gray-700">{loc}</span>
              ))}
            </div>
          </section>
        )}

        <section id="quote-form" className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-8 rounded-2xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Get Wholesale Pricing for {areaName}</h2>
              <p className="text-gray-600 mb-4 text-sm">
                Connect directly with the Karur Plywood & Company order desk for current rates and direct site delivery scheduling.
              </p>
              <a
                href="https://wa.me/919159666538"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition text-sm shadow-sm"
              >
                Request Quote via WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    );
  } catch (error) {
    console.error('Render safety fallback caught exception:', error);
    return notFound();
  }
}