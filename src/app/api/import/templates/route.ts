// src/app/api/import/templates/route.ts
// Returns downloadable CSV template files for products, variants, images

import { NextRequest, NextResponse } from 'next/server';

const TEMPLATES: Record<string, { filename: string; content: string }> = {

  products: {
    filename: 'products_template.csv',
    content: [
      // Header
      'name,type,category_slug,brand_slug,description,price,mrp,unit,image_url,sort_order',
      // Example rows
      'Century Marine Plywood 19mm,project,marine-plywood,century,ISI 710 certified marine plywood BWR grade,3200,3500,per sheet,https://example.com/img1.jpg,1',
      'Hettich Soft Close Hinge,project,hardware,hettich,Hydraulic soft close hinge 50000 cycle tested,85,95,per piece,,2',
      'Century Block Board 19mm,project,block-board,century,Hardwood core block board no sagging guaranteed,2450,2800,per sheet,,3',
    ].join('\n'),
  },

  variants: {
    filename: 'variants_template.csv',
    content: [
      // Header â€” product_slug must match an existing product slug in DB
      'product_slug,thickness,size,grade,finish,color,pack_size,price,mrp,stock_quantity,stock_status',
      // Example rows
      'century-marine-plywood-19mm-abc123,19mm,8x4 ft,BWR,,,1 sheet,3200,3500,50,in_stock',
      'century-marine-plywood-19mm-abc123,12mm,8x4 ft,BWR,,,1 sheet,2200,2500,30,in_stock',
      'century-marine-plywood-19mm-abc123,25mm,8x4 ft,Marine,,,1 sheet,4500,5000,15,low_stock',
    ].join('\n'),
  },

  images: {
    filename: 'images_template.csv',
    content: [
      // Header â€” product_slug must match an existing product slug
      'product_slug,image_url,sort_order,alt_text',
      // Example rows
      'century-marine-plywood-19mm-abc123,https://example.com/img-front.jpg,1,Front view',
      'century-marine-plywood-19mm-abc123,https://example.com/img-edge.jpg,2,Edge profile',
      'century-marine-plywood-19mm-abc123,https://example.com/img-back.jpg,3,Back face',
    ].join('\n'),
  },

};

// â”€â”€ GET /api/import/templates?type=products|variants|images â”€â”€â”€â”€
export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') || 'products';

  const template = TEMPLATES[type];
  if (!template) {
    return NextResponse.json({ error: 'Invalid type. Use products, variants, or images.' }, { status: 400 });
  }

  return new NextResponse(template.content, {
    status: 200,
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${template.filename}"`,
    },
  });
}

