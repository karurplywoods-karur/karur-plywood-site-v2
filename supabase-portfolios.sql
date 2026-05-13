-- ============================================================
-- Karur Plywood — Architect & Carpenter Portfolio Tables
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. ARCHITECTS TABLE
create table if not exists public.architects (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,           -- URL slug e.g. "rajan-architect"
  name         text not null,
  firm         text default '',                -- Firm/studio name
  phone        text default '',
  email        text default '',
  wa_number    text default '',
  city         text default 'Karur',
  bio          text default '',
  photo_url    text default '',
  website      text default '',
  specialities text[] default '{}',           -- e.g. ["residential","interior","commercial"]
  years_exp    integer default 1,
  featured     boolean default false,
  verified     boolean default false,
  created_at   timestamptz default now()
);

-- 2. ARCHITECT PROJECTS TABLE
create table if not exists public.architect_projects (
  id           uuid primary key default gen_random_uuid(),
  architect_id uuid references public.architects(id) on delete cascade,
  title        text not null,
  description  text default '',
  location     text default '',
  project_type text default 'residential',    -- residential / commercial / interior
  year         integer default 2024,
  cover_image  text default '',
  images       text[] default '{}',           -- array of image URLs
  materials_used text[] default '{}',         -- e.g. ["BWR Plywood","Merino Laminates"]
  published    boolean default true,
  sort_order   integer default 0,
  created_at   timestamptz default now()
);

-- 3. RLS
alter table public.architects enable row level security;
alter table public.architect_projects enable row level security;

create policy "Public read verified architects" on public.architects for select using (verified = true);
create policy "Public read published projects"  on public.architect_projects for select using (published = true);
create policy "Service role all architects"     on public.architects for all using (auth.role() = 'service_role');
create policy "Service role all projects"       on public.architect_projects for all using (auth.role() = 'service_role');

grant all on public.architects to anon, authenticated, service_role;
grant all on public.architect_projects to anon, authenticated, service_role;

-- 4. Seed a sample architect
insert into public.architects (slug, name, firm, phone, wa_number, city, bio, specialities, years_exp, featured, verified)
values (
  'arjun-interiors',
  'Arjun Designs',
  'Arjun Interiors & Architecture',
  '+91 98765 20001',
  '9876520001',
  'Karur',
  'A leading interior architect based in Karur with 12+ years of experience in residential and commercial interior design. Known for blending contemporary aesthetics with durable, locally-sourced materials. Exclusive partner of Karur Plywood & Company for all wood-based specifications.',
  ARRAY['residential','interior design','modular kitchens','wardrobes'],
  12,
  true,
  true
) on conflict (slug) do nothing;

-- Seed a sample project
insert into public.architect_projects (architect_id, title, description, location, project_type, year, cover_image, materials_used, published)
select
  a.id,
  '3BHK Villa Interior — Karur',
  'Complete interior design and execution for a 3BHK villa in Karur. Featuring custom modular kitchen with high-gloss laminates, full wardrobe system with soft-close fittings, and teak-finish flush doors throughout.',
  'Karur, Tamil Nadu',
  'residential',
  2024,
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
  ARRAY['BWR Plywood 18mm','Merino High Gloss Laminates','Flush Doors','Soft-close Hinges','Drawer Channels'],
  true
from public.architects a where a.slug = 'arjun-interiors';

notify pgrst, 'reload schema';
select 'Portfolio tables ready!' as result;
