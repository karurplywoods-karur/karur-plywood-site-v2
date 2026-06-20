import React from 'react';

interface AreaProps {
  name: string;
  pincode: string;
  lat: number;
  lng: number;
  slug: string;
}

interface CategoryProps {
  display_name: string;
  slug: string;
}

interface LocalBusinessSchemaProps {
  area: AreaProps;
  category: CategoryProps;
  reviews?: any[];
}

export default function LocalBusinessSchema({ area, category, reviews = [] }: LocalBusinessSchemaProps) {
  // Safe validation check to prevent aggregate rating reductions from breaking the render pipeline
  const totalReviews = Array.isArray(reviews) ? reviews.length : 0;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviews).toFixed(1) 
    : '5.0';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `https://karurplywood.co.in/#local-business-${area.slug}`,
    'name': 'Karur Plywood & Company',
    'image': 'https://karurplywood.co.in/logo.png',
    'telephone': '+919159666538',
    'url': 'https://karurplywood.co.in',
    'priceRange': '$$',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Main Road Showroom Depot',
      'addressLocality': area.name,
      'addressRegion': 'Tamil Nadu',
      'postalCode': area.pincode,
      'addressCountry': 'IN'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': area.lat,
      'longitude': area.lng
    },
    'description': `Authorized trade distribution channel supplying premium wholesale ${category.display_name} options across ${area.name} and surrounding contractor zones.`,
    ...(totalReviews > 0 && {
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': averageRating,
        'reviewCount': totalReviews
      }
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}