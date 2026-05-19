-- ============================================================
-- ADD / REPAIR MRP SUPPORT FOR PRODUCTS
-- Run this in Supabase SQL Editor
-- Existing `price` remains the sale/current price.
-- New `mrp` is the original/market price shown with strikethrough.
-- ============================================================

alter table public.products
  add column if not exists mrp numeric(10, 2);

alter table public.products
  add column if not exists slug text;

create unique index if not exists products_slug_unique
  on public.products (slug)
  where slug is not null;

comment on column public.products.mrp
  is 'Market/original price shown slashed. If null, no MRP is displayed.';

comment on column public.products.price
  is 'Sale/current price.';

comment on column public.products.slug
  is 'URL-friendly identifier. Optional.';

-- Optional one-time slug backfill. Keep commented if product URLs should stay ID-based.
-- update public.products
-- set slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'))
-- where slug is null;
