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

alter table public.products
  add column if not exists updated_at timestamptz default now();

create unique index if not exists products_slug_unique
  on public.products (slug)
  where slug is not null;

comment on column public.products.mrp
  is 'Market/original price shown slashed. If null, no MRP is displayed.';

comment on column public.products.price
  is 'Sale/current price.';

comment on column public.products.slug
  is 'URL-friendly identifier. Optional.';

-- Repair product updated_at trigger.
-- Existing databases may have either a broken trigger function or no
-- products.updated_at column, so this migration repairs both.
create or replace function public.update_products_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
before update on public.products
for each row execute function public.update_products_updated_at();

-- Optional diagnostic: this should return zero rows after the repair above.
-- It finds any update trigger using the generic update_updated_at function on
-- tables that do not have an updated_at column.
-- select event_object_schema, event_object_table, trigger_name
-- from information_schema.triggers t
-- where action_statement ilike '%update_updated_at%'
--   and not exists (
--     select 1
--     from information_schema.columns c
--     where c.table_schema = t.event_object_schema
--       and c.table_name = t.event_object_table
--       and c.column_name = 'updated_at'
--   );

-- Optional one-time slug backfill. Keep commented if product URLs should stay ID-based.
-- update public.products
-- set slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'))
-- where slug is null;
