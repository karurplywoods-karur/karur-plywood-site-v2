// src/app/api/admin/save-seo-content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { SEO_PAGE_TYPES, productLocationPath, productLocationSlug } from '@/lib/seo';

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { page_id, area_id, category_id, content, reviewed_by, review_notes } = await req.json();

    // Validate: need either page_id OR (area_id + category_id)
    if (!page_id && (!area_id || !category_id)) {
      return NextResponse.json({ error: 'Need page_id OR area_id+category_id' }, { status: 400 });
    }

    let targetPageId = page_id;

    // If no page_id, look up from area+category via seo_pages
    if (!targetPageId && area_id && category_id) {
      const { data: existing } = await supabaseAdmin
        .from('seo_pages')
        .select('id')
        .eq('page_type', SEO_PAGE_TYPES.PRODUCT_LOCATION)
        .eq('area_id', area_id)
        .eq('category_id', category_id)
        .single();

      if (existing) {
        targetPageId = existing.id;
      } else {
        const [{ data: area }, { data: category }] = await Promise.all([
          supabaseAdmin.from('seo_areas').select('slug').eq('id', area_id).single(),
          supabaseAdmin.from('seo_categories').select('slug').eq('id', category_id).single(),
        ]);

        if (!area?.slug || !category?.slug) {
          return NextResponse.json({ error: 'Invalid area_id or category_id.' }, { status: 400 });
        }

        // Create new page record in seo_pages
        const { data: newPage, error: createErr } = await supabaseAdmin
          .from('seo_pages')
          .insert({
            page_type: SEO_PAGE_TYPES.PRODUCT_LOCATION,
            area_id,
            category_id,
            status: 'draft',
            is_published: false,
            slug: productLocationSlug(category.slug, area.slug),
            full_path: productLocationPath(area.slug, category.slug),
          })
          .select('id')
          .single();

        if (createErr) throw createErr;
        targetPageId = newPage.id;
      }
    }

    // Get old content for logging
    const { data: oldPage } = await supabaseAdmin
      .from('seo_pages')
      .select('*')
      .eq('id', targetPageId)
      .single();

    // Update page
    const updateData: any = {
      status: 'published',
      reviewed_by: reviewed_by || 'admin',
      review_notes: review_notes || '',
      content_version: (oldPage?.content_version || 0) + 1,
      is_published: true,
      updated_at: new Date().toISOString(),
    };

    // Merge content fields if provided
    if (content) {
      if (content.seo_title !== undefined) updateData.seo_title = content.seo_title;
      if (content.seo_description !== undefined) updateData.seo_description = content.seo_description;
      if (content.h1 !== undefined) updateData.h1 = content.h1;
      if (content.intro !== undefined) updateData.intro = content.intro;
      if (content.product_explanation !== undefined) updateData.product_explanation = content.product_explanation;
      if (content.localized_content !== undefined) updateData.localized_content = content.localized_content;
      if (content.faq_content !== undefined) updateData.faq_content = content.faq_content;
      if (content.internal_links !== undefined) updateData.internal_links = content.internal_links;
      if (content.brands_json !== undefined) updateData.brands_json = content.brands_json;
      if (content.pricing_json !== undefined) updateData.pricing_json = content.pricing_json;
      if (content.applications_json !== undefined) updateData.applications_json = content.applications_json;
      if (content.word_count !== undefined) updateData.word_count = content.word_count;
      if (content.title !== undefined) updateData.title = content.title;
      if (content.meta_title !== undefined) updateData.meta_title = content.meta_title;
      if (content.meta_description !== undefined) updateData.meta_description = content.meta_description;
      if (content.content !== undefined) updateData.content = content.content;
    }

    const { data: page, error } = await supabaseAdmin
      .from('seo_pages')
      .update(updateData)
      .eq('id', targetPageId)
      .select()
      .single();

    if (error) throw error;

    // Log the edit
    await supabaseAdmin.from('seo_content_logs').insert({
      seo_page_id: page.id,
      action: 'edited',
      old_content: oldPage,
      new_content: updateData,
      performed_by: reviewed_by || 'admin',
    });

    return NextResponse.json({ success: true, page });
  } catch (err: any) {
    console.error('Save error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

