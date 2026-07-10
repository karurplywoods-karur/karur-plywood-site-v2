import { createBuildClient } from '@/lib/supabase/build';

export default async function NearbyAreas({ currentArea, currentCategory }: any) {
  const supabase = createBuildClient();

  const { data: nearbyAreas } = await supabase
    .from('seo_areas')
    .select('slug, name, display_name, distance_km')
    .neq('id', currentArea.id)
    .or(`district.eq.${currentArea.district},and(distance_km.gte.${currentArea.distance_km - 20},distance_km.lte.${currentArea.distance_km + 20})`)
    .order('distance_km')
    .limit(6);

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">Also Available Nearby</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {nearbyAreas?.map((area: any) => (
          <a key={area.slug} href={`/location/${area.slug}/${currentCategory.slug}`} className="block p-4 border rounded-lg hover:bg-gray-50 transition">
            <span className="font-medium text-blue-600">{currentCategory.display_name} in {area.display_name}</span>
            <span className="block text-sm text-gray-500">{area.distance_km}km from Karur</span>
          </a>
        ))}
      </div>
    </section>
  );
}

