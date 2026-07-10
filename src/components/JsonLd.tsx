// src/components/JsonLd.tsx
import React from 'react';
// 1. Import the default component from its standalone file
import StandaloneLocalBusinessSchema from './LocalBusinessSchema';

const SITE_URL = 'https://www.karurplywood.co.in';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

// 2. Export LocalBusinessSchema here as well to fix the error in src/app/page.tsx!
export function LocalBusinessSchema(props: any) {
  // Provide fallback parameters so it never crashes if called without props (like in page.tsx)
  const defaultArea = {
    name: 'Karur',
    pincode: '639001',
    lat: 10.9601,
    lng: 78.0785,
    slug: 'karur'
  };

  const defaultCategory = {
    display_name: 'Plywood & Hardware',
    slug: 'plywood'
  };

  return (
    <StandaloneLocalBusinessSchema 
      area={props.area || defaultArea} 
      category={props.category || defaultCategory} 
      reviews={props.reviews || []} 
    />
  );
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQSchema({ faqs }: { faqs: FAQItem[] }) {
  if (!faqs || faqs.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map((faq) => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
