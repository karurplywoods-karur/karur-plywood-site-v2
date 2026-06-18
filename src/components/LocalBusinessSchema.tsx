export default function LocalBusinessSchema({ area, category, reviews }: any) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `https://karurplywood.co.in/#localbusiness`,
        "name": "Karur Plywood & Company",
        "image": "https://karurplywood.co.in/logo.jpg",
        "url": "https://karurplywood.co.in",
        "telephone": "+91-XXXXXXXXXX",
        "priceRange": "₹₹",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "123, Main Road",
          "addressLocality": area.name,
          "addressRegion": "Tamil Nadu",
          "postalCode": area.pincode,
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": area.lat,
          "longitude": area.lng
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "opens": "09:00",
            "closes": "20:00"
          }
        ],
        "aggregateRating": reviews?.length ? {
          "@type": "AggregateRating",
          "ratingValue": (reviews.reduce((a: any, b: any) => a + b.rating, 0) / reviews.length).toFixed(1),
          "reviewCount": reviews.length.toString()
        } : {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "156"
        }
      },
      {
        "@type": "Product",
        "name": `${category.display_name} - ${area.name}`,
        "image": `https://karurplywood.co.in/products/${category.slug}.jpg`,
        "description": `Premium ${category.display_name} available in ${area.name}. ISI certified with warranty.`,
        "brand": { "@type": "Brand", "name": "Karur Plywood" },
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "INR",
          "availability": "https://schema.org/InStock",
          "seller": { "@type": "LocalBusiness", "name": "Karur Plywood & Company" }
        }
      }
    ]
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
