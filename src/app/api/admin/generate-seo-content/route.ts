// src/app/api/admin/generate-seo-content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createBuildClient } from '@/lib/supabase/build';
import { supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { SEO_PAGE_TYPES, productLocationPath, productLocationSlug } from '@/lib/seo';

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
      return NextResponse.json({ error: 'Unauthorized login required' }, { status: 401 });
    }

    const { area_id, category_id } = await req.json();
    if (!area_id || !category_id) {
      return NextResponse.json({ error: 'Both area_id and category_id are required fields' }, { status: 400 });
    }

    const supabase = createBuildClient();

    const [{ data: area, error: areaErr }, { data: category, error: catErr }] = await Promise.all([
      supabase.from('seo_areas').select('*').eq('id', area_id).single(),
      supabase.from('seo_categories').select('*').eq('id', category_id).single(),
    ]);

    if (areaErr || catErr) {
      console.error('Database fetch error:', { areaErr, catErr });
      return NextResponse.json({ error: `Database failed fetching metadata: ${areaErr?.message || catErr?.message}` }, { status: 500 });
    }

    if (!area || !category) {
      return NextResponse.json({ error: 'Requested Area or Category item not found in records' }, { status: 404 });
    }

    // Safeguard Fallback context string for expanding districts (Namakkal, Erode, Trichy, etc.)
    const areaContext = AREA_CONTEXTS[area.slug] || 
      `${area.display_name} is an important commercial and residential locality situated in the extended service region of Karur Plywood & Company, located approximately ${area.distance_km}km away.`;
    
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
      return NextResponse.json({ error: 'Server configuration failure: GROQ_API_KEY missing' }, { status: 500 });
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
      const errText = await groqRes.text();
      return NextResponse.json({ error: `Groq Gateway API error: ${errText}` }, { status: 502 });
    }

    const groqData = await groqRes.json();
    let raw;
    try {
      raw = JSON.parse(groqData.choices[0].message.content);
    } catch (e) {
      return NextResponse.json({ error: 'Failed parsing invalid JSON layout returned from AI model' }, { status: 500 });
    }

    const wordCount = 
      (raw.intro || '').split(/\s+/).length +
      (raw.product_explanation || '').split(/\s+/).length +
      (raw.localized_content || '').split(/\s+/).length;

    const slug = productLocationSlug(category.slug, area.slug);
    const fullPath = productLocationPath(area.slug, category.slug);

    const content = {
      page_type: SEO_PAGE_TYPES.PRODUCT_LOCATION,
      slug,
      full_path: fullPath,
      title: raw.seo_title?.slice(0, 80),
      meta_title: raw.seo_title?.slice(0, 80),
      meta_description: raw.seo_description?.slice(0, 160),
      h1: raw.h1,
      // REMOVED: content column line to completely prevent Supabase structural cache collisions[cite: 7]
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

    const { data: page, error: upsertErr } = await supabaseAdmin
      .from('seo_pages')
      .upsert(content, { onConflict: 'full_path' })
      .select()
      .single();

    if (upsertErr) {
      console.error('Supabase Upsert Failure Logs:', upsertErr);
      return NextResponse.json({ error: `Database Upsert Exception: ${upsertErr.message} (Detail: ${upsertErr.details || 'None'})` }, { status: 500 });
    }

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
      preview_url: `https://www.karurplywood.co.in${fullPath}`,
    });

  } catch (err: any) {
    console.error('Unhandled runtime routing exception:', err);
    return NextResponse.json({ error: `Server Crash: ${err.message || 'Unknown Exception'}` }, { status: 500 });
  }
}

