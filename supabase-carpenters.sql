-- ============================================================
-- Karur Plywood — Carpenter Pro Directory
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

create table if not exists public.carpenters (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text not null,
  area        text not null,          -- e.g. "Karur", "Trichy", "Namakkal"
  speciality  text[] default '{}',   -- e.g. ["wardrobes","kitchen","doors"]
  experience  integer default 1,      -- years
  bio         text default '',
  photo_url   text default '',
  verified    boolean default false,  -- admin must verify before showing
  wa_number   text default '',        -- optional separate WA number
  rating      numeric(2,1) default 0,
  review_count integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- RLS
alter table public.carpenters enable row level security;

create policy "Public can read verified carpenters"
  on public.carpenters for select
  using (verified = true);

create policy "Service role full access on carpenters"
  on public.carpenters for all
  using (auth.role() = 'service_role');

grant usage on schema public to anon, authenticated, service_role;
grant all on public.carpenters to anon, authenticated, service_role;

-- Auto-update updated_at
create or replace function public.update_carpenters_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger carpenters_updated_at
  before update on public.carpenters
  for each row execute function public.update_carpenters_updated_at();

-- Seed sample verified carpenters
insert into public.carpenters (name, phone, area, speciality, experience, bio, verified, rating, review_count) values
('Rajan K.', '+91 98765 10001', 'Karur', ARRAY['wardrobes','kitchen cabinets','doors'], 12, 'Specialises in modular kitchen and wardrobe fitting. Uses ISI-certified plywood only. 500+ projects in Karur.', true, 4.8, 38),
('Murugan S.', '+91 98765 10002', 'Karur', ARRAY['doors','windows','furniture'], 8, 'Expert in flush door installation and teak wood furniture. Bulk project experience with builders.', true, 4.6, 24),
('Selvam R.', '+91 98765 10003', 'Trichy', ARRAY['kitchen cabinets','wardrobes','false ceiling'], 15, 'Senior carpenter with 15+ years. Known for precision modular kitchen work across Trichy and Karur.', true, 4.9, 61),
('Karthik M.', '+91 98765 10004', 'Namakkal', ARRAY['furniture','wardrobes','sofa frames'], 6, 'Young and skilled. Specialises in contemporary bedroom furniture and walk-in wardrobes.', true, 4.5, 17),
('Anbu C.', '+91 98765 10005', 'Karur', ARRAY['doors','frames','commercial fit-out'], 20, 'Most experienced carpenter in Karur. Handles large commercial fit-outs and builder bulk orders.', true, 4.7, 89)
on conflict do nothing;

notify pgrst, 'reload schema';
select 'Carpenters directory ready: ' || count(*)::text || ' carpenters' from public.carpenters;
