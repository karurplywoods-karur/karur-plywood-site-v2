// src/app/api/products/feed/route.ts
// Google Merchant Center RSS 2.0 product feed.
// Submit https://www.karurplywood.co.in/api/products/feed to Merchant Center.
// Google fetches this daily and syncs products to Shopping.

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE_URL = 'https://www.karurplywood.co.in';
const STORE_NAME = 'Karur Plywood & Company';
const CURRENCY = 'INR';

// Maps your category names to Google's product taxonomy IDs.
// Full list: https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt
const GOOGLE_CATEGORY_MAP: Record<string, string> = {
  'Commercial Plywood': 'Hardware > Building Materials > Lumber & Composites > Plywood',
  'Marine Plywood':     'Hardware > Building Materials > Lumber & Composites > Plywood',
  'MDF Board':          'Hardware > Building Materials > Lumber & Composites > MDF',
  'HDHMR Board':        'Hardware > Building Materials > Lumber & Composites > MDF',
  'Particle Board':     'Hardware > Building Materials > Lumber & Composites',
  'Laminates':          'Hardware > Building Materials > Countertops',
  'Flush Doors':        'Hardware > Doors, Windows & Trim > Doors',
  'Hardware':           'Hardware > Fasteners & Hardware',
  'Adhesive':           'Hardware > Building Materials > Adhesives & Sealants',
  'Paints & Polish':    'Hardware > Paint > Wood Paint',
};

// Google requires product condition
const CONDITION = 'new';

function escapeXml(str: string): string {
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&apos;');
}

function buildProductEntry(p: any): string {
  const title = escapeXml(p.name);
  const description = escapeXml(p.description || p.name);
  const link = `${SITE_URL}/products/${p.id}`;
  const imageLink = p.image_url || `${SITE_URL}/og-image.png`;
  const price = p.price ? `${p.price}.00 ${CURRENCY}` : null;
  const salePrice = null; // Set this if you want to show sale price
  const availability = p.in_stock ? 'in_stock' : 'out_of_stock';
  const categoryName = p.categories?.name || '';
  const googleCategory = GOOGLE_CATEGORY_MAP[categoryName] || 'Hardware > Building Materials';
  const brand = p.brands?.name || STORE_NAME;
  const gtin = ''; // Leave blank — we don't have GTINs for Indian plywood
  const mpn = `KPC-${p.id}`; // Our internal product number

  // Build variants as separate items if they exist
  const variants = p.product_variants && p.product_variants.length > 0
    ? p.product_variants.filter((v: any) => v.in_stock !== 'out_of_stock')
    : [];

  if (variants.length > 0) {
    // One entry per variant
    return variants.map((v: any) => {
      const variantTitle = escapeXml(`${p.name} — ${v.label || v.thickness || v.finish || v.size || ''}`);
      const variantPrice = v.price ? `${v.price}.00 ${CURRENCY}` : price;
      const variantId = `KPC-${p.id}-${v.id}`;
      return `
    <item>
      <g:id>${variantId}</g:id>
      <g:item_group_id>KPC-${p.id}</g:item_group_id>
      <title>${variantTitle}</title>
      <description>${description}</description>
      <link>${link}</link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      <g:availability>${availability}</g:availability>
      ${variantPrice ? `<g:price>${variantPrice}</g:price>` : ''}
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:condition>${CONDITION}</g:condition>
      <g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>
      <g:product_type>${escapeXml(categoryName)}</g:product_type>
      <g:mpn>${variantId}</g:mpn>
      <g:identifier_exists>no</g:identifier_exists>
      ${v.label ? `<g:size>${escapeXml(v.label)}</g:size>` : ''}
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard Delivery</g:service>
        <g:price>0.00 ${CURRENCY}</g:price>
      </g:shipping>
    </item>`.trim();
    }).join('\n    ');
  }

  // No variants — single entry
  return `
    <item>
      <g:id>${mpn}</g:id>
      <title>${title}</title>
      <description>${description}</description>
      <link>${link}</link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      <g:availability>${availability}</g:availability>
      ${price ? `<g:price>${price}</g:price>` : ''}
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:condition>${CONDITION}</g:condition>
      <g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>
      <g:product_type>${escapeXml(categoryName)}</g:product_type>
      <g:mpn>${mpn}</g:mpn>
      <g:identifier_exists>no</g:identifier_exists>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard Delivery</g:service>
        <g:price>0.00 ${CURRENCY}</g:price>
      </g:shipping>
    </item>`.trim();
}

export async function GET() {
  try {
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select(`
        id, name, description, price, mrp, unit, image_url, in_stock, type,
        categories(id, name, slug, icon),
        brands(id, name, slug),
        product_variants(id, label, thickness, finish, size, price, mrp, in_stock)
      `)
      .eq('in_stock', true)
      .order('id');

    if (error) throw error;

    const items = (products || []).map(buildProductEntry).join('\n    ');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(STORE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>Wholesale and retail plywood, laminates, doors and hardware in Karur, Tamil Nadu.</description>
    ${items}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch (err) {
    console.error('[feed] Error generating product feed:', err);
    return NextResponse.json({ error: 'Feed generation failed' }, { status: 500 });
  }
}
