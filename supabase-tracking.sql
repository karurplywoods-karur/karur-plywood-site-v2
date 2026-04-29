-- ============================================================
-- Karur Plywood — Extend enquiries table for conversion tracking
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

alter table enquiries
  add column if not exists tracking_id uuid default gen_random_uuid(),
  add column if not exists source text default 'website',
  add column if not exists wa_source text default null,
  add column if not exists product_name text default null,
  add column if not exists category text default null,
  add column if not exists quantity integer default null,
  add column if not exists total_value numeric(10,2) default null;

-- Index for fast tracking_id lookups
create index if not exists enquiries_tracking_id_idx on enquiries(tracking_id);

-- Done
select 'Enquiries table updated with tracking fields.' as result;
