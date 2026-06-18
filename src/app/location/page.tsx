import { createBuildClient } from '@/lib/supabase/build';

export const dynamic = 'force-dynamic';

export default async function LocationIndexPage() {
  const supabase = createBuildClient();

  const { data: areas } = await supabase
    .from('seo_areas')
    .select('*')
    .order('priority');

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Delivery Locations - Karur Plywood</h1>
      <p className="text-lg text-gray-700 mb-8">
        We deliver plywood, laminates, hardware, and doors across Tamil Nadu. 
        Select your location to see available products and pricing.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {areas?.map((area: any) => (
          <div key={area.slug} className="border rounded-lg p-4 hover:bg-gray-50">
            <h2 className="font-semibold text-lg">{area.display_name}</h2>
            <p className="text-sm text-gray-600">{area.distance_km}km from Karur</p>
            <p className="text-sm text-gray-500">Delivery: {area.delivery_time}</p>
            <a href={`/location/${area.slug}`} className="text-blue-600 text-sm mt-2 inline-block">
              View Products →
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}
