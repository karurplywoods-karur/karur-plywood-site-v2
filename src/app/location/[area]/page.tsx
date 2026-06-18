import { notFound } from 'next/navigation';
import { createBuildClient } from '@/lib/supabase/build';

export const dynamic = 'force-dynamic';

export default async function AreaPage({ params }: { params: { area: string } }) {
  const supabase = createBuildClient();

  const { data: area } = await supabase
    .from('seo_areas')
    .select('*')
    .eq('slug', params.area)
    .single();

  if (!area) return notFound();

  const { data: categories } = await supabase
    .from('seo_categories')
    .select('*')
    .order('id');

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Products Available in {area.display_name}</h1>
      <p className="text-lg text-gray-700 mb-8">
        {area.distance_km}km from Karur. Delivery within {area.delivery_time}.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((category: any) => (
          <a 
            key={category.slug} 
            href={`/location/${area.slug}/${category.slug}`}
            className="border rounded-lg p-4 hover:bg-gray-50 transition"
          >
            <h2 className="font-semibold text-lg text-blue-600">{category.display_name}</h2>
            <p className="text-sm text-gray-600">Starting at ₹{category.base_price}</p>
            <p className="text-sm text-gray-500">{category.parent_category}</p>
          </a>
        ))}
      </div>
    </main>
  );
}
