import { Metadata } from 'next';
import { createBuildClient } from '@/lib/supabase/build';
import Breadcrumb from '@/components/Breadcrumb';
import { BreadcrumbSchema } from '@/components/JsonLd';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Plywood & Hardware Delivery Locations Across Tamil Nadu | Karur Plywood',
    description: 'Karur Plywood & Company supplies wholesale plywood, laminates, doors, and hardware with direct job-site delivery across Karur and surrounding districts in Tamil Nadu. Find your area.',
    alternates: { canonical: 'https://www.karurplywood.co.in/location' },
    robots: { index: true, follow: true },
  };
}

export default async function LocationIndexPage() {
  const supabase = createBuildClient();

  const { data: areas } = await supabase
    .from('seo_areas')
    .select('*')
    .order('priority');

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Locations', href: '/location' },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 bg-white text-gray-900" suppressHydrationWarning>
      <Breadcrumb items={breadcrumbItems} />
      <BreadcrumbSchema items={breadcrumbItems.map((i) => ({ name: i.name, url: i.href }))} />

      <header className="mt-4 mb-8 border-b border-gray-100 pb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full w-fit uppercase tracking-wider mb-3">
          🏢 Authorized B2B Showroom Supply Depot
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
          Delivery Locations Across Tamil Nadu
        </h1>
        <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
          Karur Plywood & Company dispatches wholesale plywood, laminates, doors, and hardware direct to job sites and contractor depots throughout Karur district and beyond. Select your area below to see local pricing, delivery timelines, and available material categories.
        </div>
      </header>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Areas ({areas?.length || 0})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas?.map((area: any) => (
            <a
              key={area.slug}
              href={`/location/${area.slug}`}
              className="border border-gray-100 rounded-xl p-5 bg-slate-50/50 hover:border-amber-300 hover:bg-amber-50/40 transition block"
            >
              <h3 className="font-bold text-lg text-gray-900 mb-1">{area.display_name}</h3>
              <p className="text-sm text-gray-600">{area.distance_km ? `${area.distance_km}km from Karur` : 'Karur district'}</p>
              <p className="text-sm text-amber-700 font-medium mt-1">🚛 Delivery: {area.delivery_time || '1-2 days'}</p>
              <span className="text-blue-600 text-sm mt-3 inline-block font-semibold">View Materials & Pricing →</span>
            </a>
          ))}
        </div>
      </section>

      <section id="quote-form" className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-8 rounded-2xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Don't See Your Area Listed?</h2>
            <p className="text-gray-600 mb-4 text-sm">
              We deliver to many more locations on request. Reach out directly and we'll confirm delivery timelines and wholesale pricing for your site.
            </p>
            <a
              href="https://wa.me/919159666538"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition text-sm shadow-sm"
            >
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}