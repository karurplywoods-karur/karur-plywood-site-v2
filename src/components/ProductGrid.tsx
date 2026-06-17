import Image from 'next/image';

export default function ProductGrid({ products, area }: { products: any[]; area: any }) {
  if (!products.length) {
    return <p className="text-gray-500">No products available. Contact us for custom orders in {area.name}.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition">
          <div className="aspect-square bg-gray-100 relative">
            <Image
              src={product.image_url || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{product.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-lg font-bold text-green-700">₹{product.price}</span>
              <span className="text-sm text-gray-500">{product.thickness}</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Brand: {product.brand} | Size: {product.size}
            </div>
            <a
              href={`https://wa.me/91XXXXXXXXXX?text=Hi, I want to order ${product.name} for delivery in ${area.name}`}
              className="mt-3 block text-center bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700"
            >
              Enquire on WhatsApp
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
