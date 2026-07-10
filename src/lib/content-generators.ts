const introTemplates = [
  (area: any, category: any) =>
    `${category.display_name} suppliers in ${area.display_name} — just ${area.distance_km}km from Karur. ` +
    `We deliver ${area.delivery_time} to ${area.name} for ${area.famous_for} businesses. ` +
    `ISI-certified ${category.display_name} starting at ₹${category.base_price}. ` +
    `Serving ${area.nearby_subareas?.slice(0, 2).join(" and ")} too.`,

  (area: any, category: any) =>
    `Need ${category.display_name} in ${area.display_name}? ` +
    `Karur Plywood delivers to ${area.name} ${area.delivery_time}. ` +
    `Popular for ${area.local_use_cases?.[0]} and ${area.local_use_cases?.[1]}. ` +
    `${area.local_landmark} area covered. Call for ${area.name} pricing.`,

  (area: any, category: any) =>
    `${area.display_name} ${category.display_name} — delivered from Karur. ` +
    `${area.distance_km}km away, ${area.delivery_time} delivery. ` +
    `Used in ${area.famous_for}. Near ${area.transport_hub}. ` +
    `Brands: ${category.brands?.slice(0, 3).join(", ")}.`,

  (area: any, category: any) =>
    `Buy ${category.display_name} in ${area.name}, ${area.district} district. ` +
    `We supply contractors near ${area.local_landmark} and ${area.nearby_subareas?.[0]}. ` +
    `${category.key_benefits}. Order now for ${area.delivery_time} delivery.`,

  (area: any, category: any) =>
    `${area.name}'s ${area.famous_for} industry relies on quality ${category.display_name}. ` +
    `We deliver from Karur to ${area.display_name} ${area.delivery_time}. ` +
    `Perfect for ${area.local_use_cases?.slice(0, 2).join(" and ")}. ` +
    `Free delivery above ₹5,000 in ${area.name}.`,
];

export function generateUniqueIntro(area: any, category: any): string {
  const seed = area.id + category.id;
  const index = seed % introTemplates.length;
  return introTemplates[index](area, category);
}

export function generateFAQ(area: any, category: any): any[] {
  const priceUnit = category.price_unit || 'per sheet';

  return [
    {
      question: `Do you deliver ${category.display_name} to ${area.display_name}?`,
      answer: `Yes, we deliver ${category.display_name} to ${area.name} ${area.delivery_time}. We also cover nearby areas including ${area.nearby_subareas?.slice(0, 3).join(", ")}. Delivery charges are minimal for ${area.distance_km}km distance from Karur. Free delivery for orders above ₹5,000.`
    },
    {
      question: `What is the ${category.display_name} price in ${area.name}?`,
      answer: `${category.display_name} price in ${area.name} starts at ₹${category.base_price} ${priceUnit}. Being ${area.distance_km}km from Karur, transport cost is minimal. Bulk orders for ${area.famous_for} businesses get special rates.`
    },
    {
      question: `Is ${category.display_name} suitable for ${area.famous_for}?`,
      answer: `Yes, ${category.display_name} is widely used in ${area.name}'s ${area.famous_for} sector for ${area.local_use_cases?.slice(0, 2).join(" and ")}. Its ${category.key_benefits} makes it ideal for these applications. We have supplied to many ${area.famous_for} businesses in ${area.name}.`
    },
    {
      question: `How far is ${area.name} from your Karur store?`,
      answer: `${area.name} is approximately ${area.distance_km}km from our Karur store. We arrange delivery via ${area.transport_hub} for convenient transport. Most ${area.name} customers receive delivery within ${area.delivery_time}.`
    },
    {
      question: `Which ${category.display_name} brand is best for ${area.local_use_cases?.[0]}?`,
      answer: `For ${area.local_use_cases?.[0]} in ${area.name}, we recommend ${category.brands?.[0]} ${category.display_name}. It offers the best balance of ${category.key_benefits} at competitive prices. ${category.brands?.[1]} is also popular among ${area.name} contractors.`
    },
    {
      question: `What ${category.parent_category} products do you stock in ${area.name}?`,
      answer: `We stock a wide range of ${category.parent_category} products in ${area.name} including ${category.display_name}. Our inventory includes multiple brands, sizes, and specifications to meet your project requirements. Contact us for the latest availability.`
    }
  ];
}

export function generateMeta(area: any, category: any) {
  return {
    title: `${category.display_name} in ${area.display_name} | ${area.distance_km}km from Karur | ISI Certified`,
    description: `${category.display_name} delivered to ${area.name} ${area.delivery_time}. ${area.distance_km}km from Karur. For ${area.famous_for}. Brands: ${category.brands?.slice(0, 3).join(", ")}. Free delivery above ₹5,000. Call now!`
  };
}

export function generateH1(area: any, category: any): string {
  const templates = [
    `${category.display_name} Suppliers in ${area.display_name}`,
    `Buy ${category.display_name} in ${area.name} — ISI Certified`,
    `${area.display_name} ${category.display_name} — Best Price Guaranteed`,
    `${category.display_name} Dealers in ${area.name} | Karur Plywood`,
    `ISI Certified ${category.display_name} in ${area.display_name}`,
  ];
  const seed = area.id + category.id;
  return templates[seed % templates.length];
}
