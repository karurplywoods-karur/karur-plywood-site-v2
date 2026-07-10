export default function Breadcrumb({ items }: { items: { name: string; href: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      "item": `https://www.karurplywood.co.in${item.href}`
    }))
  };

  return (
    <>
      <nav aria-label="breadcrumb" className="text-sm text-gray-500 mb-4">
        {items.map((item, i) => (
          <span key={i}>
            {i > 0 && <span className="mx-2">/</span>}
            {i === items.length - 1 ? (
              <span className="text-gray-900">{item.name}</span>
            ) : (
              <a href={item.href} className="hover:text-blue-600">{item.name}</a>
            )}
          </span>
        ))}
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}

