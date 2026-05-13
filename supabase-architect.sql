-- ============================================================
-- Karur Plywood — Architect Portfolio
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. ARCHITECT PROFILE (singleton — one architect partner)
create table if not exists public.architect_profile (
  id           uuid primary key default gen_random_uuid(),
  name         text not null default '',
  title        text not null default '',
  bio          text not null default '',
  photo_url    text not null default '',
  phone        text not null default '',
  email        text not null default '',
  wa_number    text not null default '',
  experience   integer default 1,
  projects_done integer default 0,
  specialities text[] default '{}',
  awards       text[] default '{}',
  active       boolean default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- 2. ARCHITECT PROJECTS
create table if not exists public.architect_projects (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  location     text not null default '',
  project_type text not null default '',   -- e.g. "Residential", "Commercial", "Interior"
  description  text not null default '',
  cover_image  text not null default '',
  images       text[] default '{}',        -- additional images
  area_sqft    integer default null,
  budget_range text default '',            -- e.g. "₹15L - ₹25L"
  year         integer default null,
  tags         text[] default '{}',
  featured     boolean default false,
  sort_order   integer default 0,
  created_at   timestamptz default now()
);

-- RLS
alter table public.architect_profile enable row level security;
alter table public.architect_projects enable row level security;

create policy "Public read architect profile"
  on public.architect_profile for select using (active = true);
create policy "Service role architect profile"
  on public.architect_profile for all using (auth.role() = 'service_role');

create policy "Public read architect projects"
  on public.architect_projects for select using (true);
create policy "Service role architect projects"
  on public.architect_projects for all using (auth.role() = 'service_role');

grant all on public.architect_profile to anon, authenticated, service_role;
grant all on public.architect_projects to anon, authenticated, service_role;

-- Seed: Sample architect profile
insert into public.architect_profile
  (name, title, bio, phone, email, wa_number, experience, projects_done, specialities, awards)
values (
  'Ar. Suresh Natarajan',
  'Principal Architect & Interior Designer',
  'With over 12 years of experience in residential and commercial design across Karur and Trichy, Ar. Suresh Natarajan brings a refined sensibility to every project. Known for maximising space and integrating high-quality materials, his work spans modern homes, luxury apartments and boutique commercial spaces. Partner architect at Karur Plywood & Company.',
  '+91 98765 00001',
  'suresh@example.com',
  '9198765000001',
  12, 85,
  ARRAY['Residential Design', 'Interior Design', 'Commercial Spaces', 'Space Planning', 'Vastu-compliant Design'],
  ARRAY['Best Interior Design — Karur District 2022', 'Excellence in Architecture — TN Chamber 2021']
) on conflict do nothing;

-- Seed: Sample projects
insert into public.architect_projects
  (title, location, project_type, description, cover_image, area_sqft, budget_range, year, tags, featured, sort_order)
values
(
  'Modern 3BHK Villa — Karur',
  'Karur, Tamil Nadu',
  'Residential',
  'A contemporary 3-bedroom villa with open plan living spaces, modular kitchen using CenturyPly and Greenlam laminates, and custom wardrobes throughout. Clean lines, functional storage, and a warm material palette define this home.',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  2400, '₹35L – ₹50L', 2023,
  ARRAY['modular kitchen','wardrobes','Greenlam laminates','CenturyPly'],
  true, 1
),
(
  'Boutique Office Fit-out — Trichy',
  'Trichy, Tamil Nadu',
  'Commercial',
  'A complete office interior for a 20-person tech company. Custom workstations, cabin partitions using high-quality BWR plywood, acoustic panels and modern hardware fittings sourced from Karur Plywood.',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  1800, '₹18L – ₹28L', 2023,
  ARRAY['office fit-out','BWR plywood','acoustic panels','hardware'],
  true, 2
),
(
  'Luxury Kitchen Renovation — Namakkal',
  'Namakkal, Tamil Nadu',
  'Interior',
  'Full modular kitchen makeover with high-gloss acrylic shutters, soft-close hardware, pull-out drawers and quartz countertop. Materials: Merino laminates, Hettich fittings from Karur Plywood.',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
  480, '₹8L – ₹14L', 2024,
  ARRAY['modular kitchen','Merino laminates','Hettich fittings','soft-close'],
  false, 3
),
(
  '4BHK Apartment Interiors — Karur',
  'Karur, Tamil Nadu',
  'Residential',
  'Complete interior design for a luxury 4BHK apartment. Custom TV unit, study room, 4 bedroom wardrobes and a modular kitchen. All plywood work using CenturyPly BWR grade.',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
  3200, '₹55L – ₹75L', 2024,
  ARRAY['wardrobes','TV unit','modular kitchen','CenturyPly BWR'],
  false, 4
)
on conflict do nothing;

notify pgrst, 'reload schema';
select 'Architect portfolio ready!' as result;
