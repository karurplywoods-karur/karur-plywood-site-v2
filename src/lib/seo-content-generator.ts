// src/lib/seo-content-generator.ts
// Generates unique AI content for each location+category combination
// Uses Groq API with structured prompts for maximum uniqueness

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

interface AreaData {
  id: number;
  slug: string;
  display_name: string;
  name: string;
  distance_km: number;
  delivery_time: string;
  nearby_subareas: string[];
}

interface CategoryData {
  id: number;
  slug: string;
  display_name: string;
  name: string;
  base_price: number;
  parent_category: string;
}

interface GeneratedContent {
  seo_title: string;
  seo_description: string;
  h1: string;
  intro: string;
  product_explanation: string;
  localized_content: string;
  faq_content: { q: string; a: string }[];
  internal_links: { text: string; url: string }[];
  word_count: number;
}

// Unique context for each area to avoid template-spun content
const AREA_CONTEXTS: Record<string, string> = {
  karur: 'Karur is a major textile and logistics hub in Tamil Nadu. The city has a booming construction industry with many apartment complexes and independent homes being built. Local builders prefer ISI-certified materials.',
  kulithalai: 'Kulithalai is a temple town known for the Kadambar Koil. The area has traditional homes and small commercial establishments. Residents value durability and traditional craftsmanship.',
  pugalur: 'Pugalur is an industrial area with TNPL (Tamil Nadu Newsprint and Papers Limited) nearby. Many employees build homes here. The area has both modern and traditional housing.',
  aravakurichi: 'Aravakurichi is primarily agricultural with mango orchards and coconut farms. Farmhouses and rural homes need weather-resistant materials. Budget-conscious buyers dominate.',
  paramathi: 'Paramathi is a small town with growing commercial activity. New shops and small offices are opening. Local contractors need reliable suppliers with quick delivery.',
  thanthonimalai: 'Thanthonimalai is a suburb close to Karur city. Many families commute to Karur for work. Home renovations and interior upgrades are common.',
  vengamedu: 'Vengamedu is a residential neighborhood near Karur. Many middle-class families live here. Kitchen renovations and modular kitchen setups are popular.',
  gandhigramam: 'Gandhigramam is a well-established residential area in Karur. Older homes are being renovated with modern interiors. Quality materials are preferred over cheap alternatives.',
  pasupathipalayam: 'Pasupathipalayam is a mixed residential-commercial area. Small businesses and shops need display fixtures and storage solutions.',
  sengunthapuram: 'Sengunthapuram is a growing residential area with new constructions. First-time homeowners need guidance on material selection.',
  chinnandankovil: 'Chinnandankovil is a rural area with agricultural background. Farmhouses and cattle sheds need durable materials. Cost is a major factor.',
  velayuthampalayam: 'Velayuthampalayam is a small village with traditional Tamil homes. Joint families build large homes with multiple rooms.',
  mayanur: 'Mayanur is known for the Mayanur Barrage and agricultural activity. Riverside properties need moisture-resistant materials.',
};

// Unique product angles for each category
const CATEGORY_ANGLES: Record<string, string> = {
  plywood: 'Plywood is the foundation of all furniture. In Tamil Nadu's humid climate, BWR grade is essential for kitchens and bathrooms. MR grade works for bedrooms and living rooms.',
  doors: 'Doors are the first impression of any home. WPC doors are gaining popularity for bathrooms due to 100% waterproofing. Membrane doors offer wood-like aesthetics at lower cost.',
  laminates: 'Laminates define the visual appeal of interiors. High-gloss laminates make small kitchens look spacious. Matte finishes hide fingerprints in high-traffic areas.',
  hardware: 'Hardware determines the functionality and longevity of furniture. Soft-close hinges prevent door slamming. Telescopic channels must support 30kg+ for kitchen drawers.',
  'hettich-hinges': 'Hettich is the gold standard for kitchen hardware. Their Sensys hinges have integrated soft-close technology. German engineering ensures 80,000+ cycle life.',
  'ebco-hinges': 'Ebco offers the best value-for-money hardware in India. Their telescopic channels are rated for 45kg load. Popular among budget-conscious contractors.',
  'centuryply-plywood': 'CenturyPly is India's largest plywood brand. Club Prime comes with lifetime warranty. Sainik is the budget-friendly option for rental properties.',
  'greenply-laminates': 'Greenply laminates offer 1000+ designs. Their anti-bacterial range is ideal for hospitals and clinics. High-gloss series is perfect for modern kitchens.',
};

function buildPrompt(area: AreaData, category: CategoryData): string {
  const areaContext = AREA_CONTEXTS[area.slug] || `${area.display_name} is located ${area.distance_km}km from Karur.`;
  const categoryAngle = CATEGORY_ANGLES[category.slug] || `${category.display_name} is essential for quality interiors.`;

  const nearby = area.nearby_subareas?.slice(0, 3).join(', ') || area.display_name;

  return `You are a senior SEO content writer for Karur Plywood & Company, a 25+ year old plywood and hardware dealer in Karur, Tamil Nadu.

TASK: Write completely unique, high-quality SEO content for a page targeting "${category.display_name} in ${area.display_name}".

=== LOCAL CONTEXT ===
${areaContext}
Delivery time to ${area.display_name}: ${area.delivery_time}.
Nearby areas served: ${nearby}.

=== PRODUCT CONTEXT ===
${categoryAngle}
Base price range: ₹${category.base_price} per unit.
Parent category: ${category.parent_category}.

=== CONTENT REQUIREMENTS ===
1. SEO Title: 60-70 chars, include "${area.display_name}" and "${category.display_name}", compelling
2. Meta Description: 150-160 chars, include benefits, urgency, location
3. H1: Natural, includes location and product, not keyword-stuffed
4. Introduction: 200-250 words. Hook the reader. Mention local context. Include delivery info. Mention brands (CenturyPly, Greenply, Hettich, Ebco where relevant).
5. Product Explanation: 150-200 words. Explain what the product is, why it matters, how to choose the right variant for ${area.display_name}'s climate/needs.
6. Localized Content: 150-200 words. Specific to ${area.display_name}. Mention local landmarks, common home types, typical projects, why locals choose Karur Plywood.
7. FAQs: 5 questions. Each must be genuinely useful, not generic. Include location-specific questions.
8. Internal Links: 5 links to related pages on the site.

=== CRITICAL RULES ===
- NO template language. Every sentence must be unique.
- NO "Welcome to our website" or "We are the best" fluff.
- Use specific details about ${area.display_name}.
- Write like a knowledgeable local expert, not a corporate brochure.
- Include practical advice (e.g., "For ${area.display_name}'s humid summers, choose BWR grade").
- Mention real delivery times and distances.

Return ONLY valid JSON. No markdown, no explanations.

{
  "seo_title": "...",
  "seo_description": "...",
  "h1": "...",
  "intro": "...",
  "product_explanation": "...",
  "localized_content": "...",
  "faq_content": [
    {"q": "...", "a": "..."}
  ],
  "internal_links": [
    {"text": "...", "url": "..."}
  ]
}`;
}

export async function generateUniqueContent(
  area: AreaData,
  category: CategoryData
): Promise<GeneratedContent> {
  const prompt = buildPrompt(area, category);

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.75,
      max_tokens: 3500,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${err}`);
  }

  const data = await res.json();
  const raw = JSON.parse(data.choices[0].message.content);

  const wordCount = 
    (raw.intro || '').split(/\s+/).length +
    (raw.product_explanation || '').split(/\s+/).length +
    (raw.localized_content || '').split(/\s+/).length;

  return {
    seo_title: raw.seo_title?.slice(0, 80) || `${category.display_name} in ${area.display_name}`,
    seo_description: raw.seo_description?.slice(0, 160) || `Buy ${category.display_name} in ${area.display_name}.`,
    h1: raw.h1 || `${category.display_name} in ${area.display_name}`,
    intro: raw.intro || '',
    product_explanation: raw.product_explanation || '',
    localized_content: raw.localized_content || '',
    faq_content: raw.faq_content || [],
    internal_links: raw.internal_links || [],
    word_count: wordCount,
  };
}

// Batch generator with rate limiting
export async function generateBatch(
  items: { area: AreaData; category: CategoryData }[],
  onProgress?: (done: number, total: number, current: string) => void
): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < items.length; i++) {
    const { area, category } = items[i];
    const label = `${area.slug}/${category.slug}`;

    onProgress?.(i, items.length, label);

    try {
      const content = await generateUniqueContent(area, category);

      // Save to Supabase via API call
      const saveRes = await fetch('/api/admin/save-seo-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area_id: area.id,
          category_id: category.id,
          content,
        }),
      });

      if (!saveRes.ok) throw new Error('Save failed');
      success++;
    } catch (err: any) {
      failed++;
      errors.push(`${label}: ${err.message}`);
    }

    // Rate limit: 20 req/min on Groq free tier
    if (i < items.length - 1) {
      await new Promise(r => setTimeout(r, 3500));
    }
  }

  return { success, failed, errors };
}
