// src/components/JsonLd.tsx
// JSON-LD structured data for Google local SEO

const SITE_URL = 'https://karurplywood.com'; // Update with your actual domain
const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919999999999';

export function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': `${SITE_URL}/#business`,
    name: 'Karur Plywood and Company',
    alternateName: 'Karur Plywood',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/showroom.jpg`,
    description: "Karur's most trusted wholesale and retail plywood, doors, laminates and hardware store. 25+ years of experience serving Karur, Trichy, Namakkal and nearby districts.",
    telephone: '+919999999999', // Update with real number
    email: 'info@karurplywood.com', // Update with real email
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Main Road',
      addressLocality: 'Karur',
      addressRegion: 'Tamil Nadu',
      postalCode: '639001',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 10.9601,   // Update with exact coordinates
      longitude: 78.0785,  // Update with exact coordinates
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '19:00',
      },
    ],
    priceRange: '₹₹',
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, UPI, Bank Transfer',
    areaServed: [
      { '@type': 'City', name: 'Karur' },
      { '@type': 'City', name: 'Trichy' },
      { '@type': 'City', name: 'Namakkal' },
      { '@type': 'City', name: 'Erode' },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Plywood, Doors, Laminates & Hardware',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'BWR Grade Plywood' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'MR Grade Plywood' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Flush Doors' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Decorative Laminates' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Hardware Fittings' } },
      ],
    },
    sameAs: [
      `https://wa.me/${WA}`,
      'https://www.facebook.com/karurplywood', // Update with real URLs
      'https://www.justdial.com',
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '120',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BlogPostSchema({ post }: {
  post: { title: string; slug: string; excerpt: string; cover_image: string; author: string; published_at: string; updated_at: string; }
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image || `${SITE_URL}/og-image.jpg`,
    author: {
      '@type': 'Organization',
      name: post.author || 'Karur Plywood Team',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Karur Plywood and Company',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    datePublished: post.published_at,
    dateModified: post.updated_at,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
