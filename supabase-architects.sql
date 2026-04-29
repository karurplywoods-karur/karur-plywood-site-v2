-- ============================================================
-- Karur Plywood — Architect Portfolio System
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

create table if not exists public.architects (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  firm         text default '',
  tagline      text default '',
  bio          text default '',
  photo_url    text default '',
  phone        text default '',
  email        text default '',
  website      text default '',
  wa_number    text default '',
  areas        text[] default '{}',
  specialities text[] default '{}',
  years_exp    integer default 1,
  projects_done integer default 0,
  verified     boolean default false,
  featured     boolean default false,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create table if not exists public.architect_projects (
  id           uuid primary key default gen_random_uuid(),
  architect_id uuid not null references public.architects(id) on delete cascade,
  title        text not null,
  description  text default '',
  location     text default '',
  area_sqft    integer default null,
  year         integer default null,
  type         text default 'Residential',
  cover_image  text default '',
  images       text[] default '{}',
  materials    text[] default '{}',
  tags         text[] default '{}',
  sort_order   integer default 0,
  created_at   timestamptz default now()
);

alter table public.architects enable row level security;
alter table public.architect_projects enable row level security;

drop policy if exists "Public can read verified architects" on public.architects;
drop policy if exists "Service role full access architects" on public.architects;
drop policy if exists "Public can read architect projects" on public.architect_projects;
drop policy if exists "Service role full access architect projects" on public.architect_projects;

create policy "Public can read verified architects" on public.architects for select using (verified = true);
create policy "Service role full access architects" on public.architects for all using (auth.role() = 'service_role');
create policy "Public can read architect projects" on public.architect_projects for select using (exists (select 1 from public.architects a where a.id = architect_id and a.verified = true));
create policy "Service role full access architect projects" on public.architect_projects for all using (auth.role() = 'service_role');

grant all on public.architects to anon, authenticated, service_role;
grant all on public.architect_projects to anon, authenticated, service_role;

insert into public.architects (name, slug, firm, tagline, bio, phone, areas, specialities, years_exp, projects_done, verified, featured) values (
  'Your Architect Partner',
  'architect-partner',
  'Design Studio, Karur',
  'Transforming spaces with quality materials and thoughtful design',
  'Collaborated exclusively with Karur Plywood & Company for the past 5 years. All projects use ISI-certified plywood and premium laminates sourced directly from our showroom.',
  '+91 99999 88888',
  ARRAY['Karur','Trichy','Namakkal'],
  ARRAY['Residential','Interior Design','Modular Kitchen'],
  10, 45, true, true
) on conflict (slug) do nothing;

notify pgrst, 'reload schema';
select 'Architect portfolio ready.' as result;
