// src/app/api/admin/generate-seo-content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createBuildClient } from '@/lib/supabase/build';
import { supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const AREA_CONTEXTS: Record<string, string> = {
  karur: 'Karur is a major textile and logistics hub. Booming construction industry with apartments and independent homes.',
  kulithalai: 'Kulithalai is a temple town with traditional homes. Residents value durability and craftsmanship.',
  pugalur: 'Pugalur has TNPL nearby. Many employees build homes. Mix of modern and traditional housing.',
  aravakurichi: 'Agricultural area with mango orchards. Farmhouses need weather-resistant materials. Budget buyers.',
  paramathi: 'Small town with growing commercial activity. New shops and offices opening.',
  thanthonimalai: 'Suburb close to Karur. Families commute. Home renovations common.',
  vengamedu: 'Residential neighborhood. Middle-class families. Kitchen renovations popular.',
  gandhigramam: 'Well-established area. Older homes being renovated. Quality preferred over cheap.',
  pasupathipalayam: 'Mixed residential-commercial. Small businesses need fixtures.',
  sengunthapuram: 'Growing residential area. First-time homeowners need guidance.',
  chinnandankovil: 'Rural area. Farmhouses and cattle sheds. Cost is major factor.',
  velayuthampalayam: 'Village with traditional Tamil homes. Joint families build large homes.',
  mayanur: 'Known for Mayanur Barrage. Riverside properties need moisture-resistant materials.',
};

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { area_id, category_id } = await req.json();

    if (!area_id || !category_id) {
      return NextResponse.json({ error: 'area_id and category_id required' }, { status: 400 });
    }

    const supabase = createBuildClient();

    const [{ data: area, error: areaErr }, { data: category, error: catErr }] = await Promise.all([
      supabase.from('seo_areas').select('*').eq('id', area_id).single(),
      supabase.from('seo_categories').select('*').eq('id', category_id).single(),
    ]);

    if (areaErr || catErr) {
      return NextResponse.json({ error: 'Database error fetching area/category' }, { status: 500 });
    }

    if (!area || !category) {
      return NextResponse.json({ error: 'Area or category not found' }, { status: 404 });
    }

    const areaContext = AREA_CONTEXTS[area.slug] || `${area.display_name} is ${area.distance_km}km from Karur.`;
    const nearby = area.nearby_subareas?.slice(0, 3).join(', ') || area.display_name;

    const prompt = `Write unique SEO content for "${category.display_name} in ${area.display_name}" for Karur Plywood & Company (25+ year old dealer in Karur, Tamil Nadu).

Local context: ${areaContext}
Delivery: ${area.delivery_time}. Nearby: ${nearby}.

Return JSON:
{
  "seo_title": "60-70 chars",
  "seo_description": "150-160 chars",
  "h1": "natural heading",
  "intro": "200-250 words with local context",
  "product_explanation": "150-200 words explaining the product",
  "localized_content": "150-200 words specific to ${area.display_name}",
  "faq_content": [{"q":"...","a":"..."}],
  "internal_links": [{"text":"...","url":"..."}]
}`;

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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

    if (!groqRes.ok) {
      const err = await groqRes.text();
      throw new Error(`Groq failed: ${err}`);
    }

    const groqData = await groqRes.json();
    const raw = JSON.parse(groqData.choices[0].message.content);

    const wordCount = 
      (raw.intro || '').split(/\s+/).length +
      (raw.product_explanation || '').split(/\s+/).length +
      (raw.localized_content || '').split(/\s+/).length;

    const slug = `${category.slug}-in-${area.slug}`;
    const fullPath = `/location/${area.slug}/${category.slug}`;

    const content = {
      page_type: 'location_category',
      slug,
      full_path: fullPath,
      title: raw.seo_title?.slice(0, 80),
      meta_title: raw.seo_title?.slice(0, 80),
      meta_description: raw.seo_description?.slice(0, 160),
      h1: raw.h1,
      content: raw.intro,
      status: 'pending_review',
      seo_title: raw.seo_title?.slice(0, 80),
      seo_description: raw.seo_description?.slice(0, 160),
      intro: raw.intro,
      product_explanation: raw.product_explanation,
      localized_content: raw.localized_content,
      faq_content: raw.faq_content || [],
      internal_links: raw.internal_links || [],
      word_count: wordCount,
      ai_generated_at: new Date().toISOString(),
      ai_model: GROQ_MODEL,
      content_version: 1,
      area_id: area.id,
      category_id: category.id,
      is_published: false,
    };

    // Upsert to seo_pages (unified table)
    const { data: page, error } = await supabaseAdmin
      .from('seo_pages')
      .upsert(content, { onConflict: 'full_path' })
      .select()
      .single();

    if (error) throw error;

    // Log to seo_content_logs
    await supabaseAdmin.from('seo_content_logs').insert({
      seo_page_id: page.id,
      action: 'generated',
      new_content: content,
      performed_by: 'ai-groq',
    });

    return NextResponse.json({ 
      success: true, 
      page_id: page.id,
      word_count: wordCount,
      preview_url: `https://karurplywood.co.in${fullPath}`,
    });

  } catch (err: any) {
    console.error('Generation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
