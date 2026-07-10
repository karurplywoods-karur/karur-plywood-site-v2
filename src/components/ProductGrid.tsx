import Image from 'next/image';

export default function ProductGrid({ area }: { area: any }) {
  const productCategories = [
    { name: 'Marine Plywood', slug: 'marine-plywood', price: 'â‚¹3,200', image: '/products/marine-plywood.jpg' },
    { name: 'Commercial Plywood', slug: 'commercial-plywood', price: 'â‚¹1,800', image: '/products/commercial-plywood.jpg' },
    { name: 'MDF Board', slug: 'mdf-board', price: 'â‚¹1,200', image: '/products/mdf-board.jpg' },
    { name: 'HDHMR Board', slug: 'hdhmr-board', price: 'â‚¹2,200', image: '/products/hdhmr-board.jpg' },
    { name: 'Block Board', slug: 'block-board', price: 'â‚¹2,400', image: '/products/block-board.jpg' },
    { name: 'Flush Doors', slug: 'flush-doors', price: 'â‚¹2,800', image: '/products/flush-doors.jpg' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {productCategories.map((product) => (
        <div key={product.slug} className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition">
          <div className="aspect-square bg-gray-100 relative">
            <Image src={product.image} alt={product.name} fill className="object-cover" />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-600 mt-1">Starting at {product.price}</p>
            <div className="mt-3 flex gap-2">
              <a href={`/products/${product.slug}`} className="flex-1 text-center bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700">View Details</a>
              <a href={`https://wa.me/91XXXXXXXXXX?text=Hi, I want to order ${product.name} for delivery in ${area.name}`} className="flex-1 text-center bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700">WhatsApp</a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

