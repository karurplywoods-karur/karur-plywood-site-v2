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
      title: pageData.title || `Wholesale ${formatSlugText(category)} Dealer in ${formatSlugText(area)} | Karur Plywood`,
      description: pageData.meta_description || `Looking for a trusted ${formatSlugText(category)} dealer in ${formatSlugText(area)}? Get direct wholesale pricing, commercial grading, and fast job-site delivery.`,
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

    // 1. Fetch primary target page data
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

    // 2. Fetch rich localized context from tables safely
    const { data: areaData } = await supabase.from('seo_areas').select('*').ilike('slug', area).maybeSingle();
    const { data: categoryData } = await supabase.from('seo_categories').select('*').ilike('slug', category).maybeSingle();

    // 3. Automated Programmatic Mesh Linking (Fallbacks if explicit internal_links are empty)
    // Horizontal link building (Same area, alternative trade materials)
    const { data: horizontalCategories } = await supabase.from('seo_categories').select('display_name, slug').neq('slug', category).limit(5);
    // Vertical link building (Same product category, alternative nearby distribution areas)
    const { data: verticalAreas } = await supabase.from('seo_areas').select('display_name, slug').neq('slug', area).limit(5);

    const isPending = pageData.status === 'pending_review';
    const areaName = areaData?.display_name || formatSlugText(area);
    const categoryName = categoryData?.display_name || formatSlugText(category);

    // Parse dynamic user-defined local sub-neighborhoods safely from database if present
    const rawNeighborhoods = areaData?.neighborhoods || ['Vengamedu', 'Thanthonimalai', 'Pasupathipalayam', 'Sengunthapuram', 'Chinna Andankovil'];
    const subLocalities = Array.isArray(rawNeighborhoods) ? rawNeighborhoods : [];

    // Parse dynamic database JSON configurations safely
    let faqs: any[] = [];
    try {
      if (pageData.faq_content) {
        faqs = typeof pageData.faq_content === 'string' ? JSON.parse(pageData.faq_content) : pageData.faq_content;
      }
    } catch { faqs = []; }
    if (!Array.isArray(faqs)) faqs = [];

    // Construct robust localized coordinates and parameters for injection
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

    const breadcrumbItems = [
      { name: 'Home', href: '/' },
      { name: 'Locations', href: '/location' },
      { name: areaName, href: `/location/${area}` },
      { name: categoryName, href: `/location/${area}/${category}` },
    ];

    const schemaBreadcrumbItems = breadcrumbItems.map(item => ({
      name: item.name,
      url: item.href
    }));

    return (
      <main className="max-w-6xl mx-auto px-4 py-6 bg-white text-gray-900" suppressHydrationWarning>
        {isPending && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6 text-sm">
            ⚠️ Trade Verification: This location page content is currently under live preview.
          </div>
        )}

        {/* Structured Schema Integrations */}
        <Breadcrumb items={breadcrumbItems} />
        <BreadcrumbSchema items={schemaBreadcrumbItems} />
        <LocalBusinessSchema area={adaptedAreaObject} category={adaptedCategoryObject} reviews={[]} />

        {/* 1. Transactional Hero Header Design */}
        <header className="mt-4 mb-8 border-b border-gray-100 pb-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full w-fit uppercase tracking-wider mb-3">
            🏢 Authorized B2B Showroom Supply Depot
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
            {pageData.h1 || `${categoryName} Dealer in ${areaName}`}
          </h1>
          <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
            {pageData.intro || `Get factory-direct pricing on premium ${categoryName} in ${areaName}. Sourced directly for carpenters, interior contractors, and commercial developers needing absolute thickness calibration and certified grade materials.`}
          </div>
        </header>

        {/* 2. E-E-A-T Trade Trust & Logistics Matrix Banner */}
        <section className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-100 rounded-xl p-5 bg-slate-50/50">
            <span className="text-xl">🛡️</span>
            <h3 className="font-bold text-gray-900 mt-2 mb-1">Showroom Authority</h3>
            <p className="text-sm text-gray-600">Supplying the region via Karur Plywood & Company with over 25 years of commercial wholesaling history.</p>
          </div>
          <div className="border border-gray-100 rounded-xl p-5 bg-slate-50/50">
            <span className="text-xl">🚛</span>
            <h3 className="font-bold text-gray-900 mt-2 mb-1">Direct Site Delivery</h3>
            <p className="text-sm text-gray-600">Located {areaData?.distance_km || '0'}km from main hub. Direct material unloading arranged in {areaData?.delivery_time || 'immediate transit timeline'}.</p>
          </div>
          <div className="border border-gray-100 rounded-xl p-5 bg-slate-50/50">
            <span className="text-xl">🧾</span>
            <h3 className="font-bold text-gray-900 mt-2 mb-1">B2B Trade Accounts</h3>
            <p className="text-sm text-gray-600">100% compliant GST tax invoice provision available to pass full Input Tax Credit (ITC) directly to contractors.</p>
          </div>
        </section>

        {/* 3. Commercial Specifications & Thickness Matrix (Solves Search Intent) */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Commercial Procurement Specifications</h2>
          <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm bg-white">
              <thead className="bg-gray-50 font-semibold text-gray-700 text-left">
                <tr>
                  <th className="px-4 py-3">Material Variable</th>
                  <th className="px-4 py-3">Standard Inventory Configurations & Calibration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-600">
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900 bg-gray-50/30">Available Thicknesses</td>
                  <td className="px-4 py-3">4mm · 6mm · 9mm · 12mm · 16mm · 19mm (Full Calibrated Sheet Options)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900 bg-gray-50/30">Grading Standards</td>
                  <td className="px-4 py-3">IS:710 Certified Boiling Water Proof (BWP) & IS:303 Commercial Grade Selections</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900 bg-gray-50/30">Core Composition Options</td>
                  <td className="px-4 py-3">Premium Gurjan Hardwood Layering, Selected Alternate Hardwood, Eco Mat Combinations</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900 bg-gray-50/30">Target Trade Profiles</td>
                  <td className="px-4 py-3">Architectural Contractors, Modular Kitchen Builders, Local Independent Carpenters</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Product Insights Block */}
        {pageData.product_explanation && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">About Premium {categoryName} Properties</h2>
            <div className="prose max-w-none text-gray-700 bg-gray-50 border border-gray-100 rounded-xl p-6">{pageData.product_explanation}</div>
          </section>
        )}

        {/* 5. Hyper-Local Geographic Context (Injects explicit nearby service area references) */}
        <section className="mb-10 bg-blue-50/60 border border-blue-100 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Project Logistics & Site Coverage across {areaName}</h2>
          <div className="prose max-w-none text-gray-700 mb-4">
            {pageData.localized_content || `We provide high-capacity material transit pipelines for wholesale quantities of ${categoryName} right to your operational site or woodwork shop.`}
          </div>
          {subLocalities.length > 0 && (
            <div className="mt-4 pt-4 border-t border-blue-100 text-sm text-gray-700">
              <span className="font-bold text-gray-900 block mb-2">📍 Hyper-Local Active Contractor Delivery Zones:</span>
              <div className="flex flex-wrap gap-2">
                {subLocalities.map((loc, i) => (
                  <span key={i} className="bg-white border border-blue-200/60 px-2.5 py-1 rounded text-xs font-medium">
                    {loc} Distribution Hub
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 6. Dynamic FAQ Section */}
        {faqs.length > 0 && (
          <section className="mb-10 border-t border-gray-100 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <FAQSection faqs={faqs} />
            <FAQSchema faqs={faqs.map(f => ({ question: f.question || f.q, answer: f.answer || f.a }))} />
          </section>
        )}

        {/* 7. Fully Automated Interlinked Mesh Matrix (Eliminates the "thin doorway page" foot-printing index trap) */}
        <section className="mb-10 border-t border-gray-100 pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Explore Local Wholesale Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-5 rounded-xl border border-gray-100">
            {/* Horizontal Network Section */}
            <div>
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Other Materials in {areaName}</h4>
              <div className="flex flex-wrap gap-2">
                {horizontalCategories && horizontalCategories.map((c, i) => (
                  <a key={i} href={`/location/${area}/${c.slug}`} className="bg-white border border-gray-200 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:border-blue-400 transition">
                    {c.display_name} in {areaName}
                  </a>
                ))}
              </div>
            </div>
            {/* Vertical Network Section */}
            <div>
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Adjacent Regional Supply Points</h4>
              <div className="flex flex-wrap gap-2">
                {verticalAreas && verticalAreas.map((a, i) => (
                  <a key={i} href={`/location/${a.slug}/${category}`} className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:border-gray-400 transition">
                    {categoryName} in {a.display_name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 8. Conversion Hero Footer */}
        <section className="text-center bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-8 rounded-2xl shadow-sm">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Get Direct Wholesale Pricing</h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-6 text-sm md:text-base">
            Connect directly with the Karur Plywood & Company order desk via WhatsApp. Get precise item calculation estimates, verify commercial brand availability, or schedule bulk transit logistics tracking.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="https://wa.me/919159666538" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-sm hover:shadow text-sm">
              💬 Message Wholesale Desk on WhatsApp
            </a>
            <div className="text-xs text-gray-500 font-medium">
              📍 Main Showroom Depot: Karur, Tamil Nadu, India
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