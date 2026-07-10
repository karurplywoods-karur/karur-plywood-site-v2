-- ============================================================
-- KARUR PLYWOOD - PROGRAMMATIC SEO SCHEMA
-- Scalable foundation for hyperlocal SEO and future SaaS use.
--
-- Page type model:
--   location          = broad service/delivery area page
--   product_location  = hyperlocal product/category page
--   brand_location    = future brand + area landing page
--   category          = broad product category page
--   brand             = broad brand page
--   blog              = editorial/supporting content
--
-- Run in Supabase SQL Editor. Safe to re-run.
-- ============================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'page_type') then
    create type public.page_type as enum (
      'location',
      'category',
      'brand',
      'product_location',
      'brand_location',
      'blog'
    );
  end if;
end $$;

do $$
begin
  if exists (select 1 from pg_type where typname = 'page_type') then
    alter type public.page_type add value if not exists 'location';
    alter type public.page_type add value if not exists 'category';
    alter type public.page_type add value if not exists 'brand';
    alter type public.page_type add value if not exists 'product_location';
    alter type public.page_type add value if not exists 'brand_location';
    alter type public.page_type add value if not exists 'blog';
  end if;
end $$;

create table if not exists public.seo_areas (
  id serial primary key,
  tenant_id uuid,
  slug text not null unique,
  name text not null,
  display_name text not null,
  district text default 'Karur',
  pincode text default '639001',
  latitude numeric(10,7),
  longitude numeric(10,7),
  lat numeric(10,8),
  lng numeric(11,8),
  distance_km numeric(8,2) default 0,
  delivery_time text default '1-2 days',
  priority integer not null default 100,
  famous_for text default '',
  local_landmark text default '',
  transport_hub text default '',
  nearby_subareas text[] default '{}',
  neighborhoods text[] default '{}',
  local_use_cases text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.seo_areas add column if not exists tenant_id uuid;
alter table public.seo_areas add column if not exists district text default 'Karur';
alter table public.seo_areas add column if not exists pincode text default '639001';
alter table public.seo_areas add column if not exists latitude numeric(10,7);
alter table public.seo_areas add column if not exists longitude numeric(10,7);
alter table public.seo_areas add column if not exists lat numeric(10,8);
alter table public.seo_areas add column if not exists lng numeric(11,8);
alter table public.seo_areas add column if not exists distance_km numeric(8,2) default 0;
alter table public.seo_areas add column if not exists delivery_time text default '1-2 days';
alter table public.seo_areas add column if not exists priority integer not null default 100;
alter table public.seo_areas add column if not exists famous_for text default '';
alter table public.seo_areas add column if not exists local_landmark text default '';
alter table public.seo_areas add column if not exists transport_hub text default '';
alter table public.seo_areas add column if not exists nearby_subareas text[] default '{}';
alter table public.seo_areas add column if not exists neighborhoods text[] default '{}';
alter table public.seo_areas add column if not exists local_use_cases text[] default '{}';
alter table public.seo_areas add column if not exists created_at timestamptz not null default now();
alter table public.seo_areas add column if not exists updated_at timestamptz not null default now();

create table if not exists public.seo_categories (
  id serial primary key,
  tenant_id uuid,
  slug text not null unique,
  name text not null,
  display_name text not null,
  description text default '',
  parent_id integer references public.seo_categories(id),
  parent_category text default '',
  sort_order integer default 0,
  base_price numeric(12,2) default 0,
  price_unit text default 'per sheet',
  brands text[] default '{}',
  key_benefits text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.seo_categories add column if not exists tenant_id uuid;
alter table public.seo_categories add column if not exists description text default '';
alter table public.seo_categories add column if not exists parent_id integer;
alter table public.seo_categories add column if not exists parent_category text default '';
alter table public.seo_categories add column if not exists sort_order integer default 0;
alter table public.seo_categories add column if not exists base_price numeric(12,2) default 0;
alter table public.seo_categories add column if not exists price_unit text default 'per sheet';
alter table public.seo_categories add column if not exists brands text[] default '{}';
alter table public.seo_categories add column if not exists key_benefits text default '';
alter table public.seo_categories add column if not exists created_at timestamptz not null default now();
alter table public.seo_categories add column if not exists updated_at timestamptz not null default now();

create table if not exists public.seo_pages (
  id serial primary key,
  tenant_id uuid,
  page_type public.page_type not null,
  slug text not null,
  parent_slug text,
  full_path text not null,
  area_id integer references public.seo_areas(id) on delete set null,
  category_id integer references public.seo_categories(id) on delete set null,
  brand_id integer,
  blog_id integer,
  title text default '',
  meta_title text default '',
  meta_description text default '',
  seo_title text default '',
  seo_description text default '',
  h1 text default '',
  intro text default '',
  product_explanation text default '',
  localized_content text default '',
  content text default '',
  faq_content jsonb not null default '[]',
  internal_links jsonb not null default '[]',
  faq_schema jsonb,
  breadcrumb_schema jsonb,
  local_business_schema jsonb,
  organization_schema jsonb,
  product_schema jsonb,
  brands_json jsonb,
  pricing_json jsonb,
  applications_json jsonb,
  canonical_url text,
  og_title text,
  og_description text,
  og_image text,
  content_hash text,
  similarity_score numeric(5,4),
  word_count integer default 0,
  status text not null default 'draft' check (status in ('draft', 'pending_review', 'published', 'rejected')),
  is_published boolean not null default false,
  is_indexed boolean not null default false,
  ai_generated_at timestamptz,
  ai_model text default '',
  content_version integer not null default 1,
  reviewed_by text default '',
  review_notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint seo_pages_valid_slug check (slug ~ '^[a-z0-9-]+$'),
  constraint seo_pages_valid_path check (full_path ~ '^/[a-z0-9-/]+$'),
  unique(full_path),
  unique(page_type, area_id, category_id)
);

alter table public.seo_pages add column if not exists tenant_id uuid;
alter table public.seo_pages add column if not exists page_type public.page_type;
alter table public.seo_pages add column if not exists slug text;
alter table public.seo_pages add column if not exists parent_slug text;
alter table public.seo_pages add column if not exists full_path text;
alter table public.seo_pages add column if not exists area_id integer;
alter table public.seo_pages add column if not exists category_id integer;
alter table public.seo_pages add column if not exists brand_id integer;
alter table public.seo_pages add column if not exists blog_id integer;
alter table public.seo_pages add column if not exists title text default '';
alter table public.seo_pages add column if not exists meta_title text default '';
alter table public.seo_pages add column if not exists meta_description text default '';
alter table public.seo_pages add column if not exists seo_title text default '';
alter table public.seo_pages add column if not exists seo_description text default '';
alter table public.seo_pages add column if not exists h1 text default '';
alter table public.seo_pages add column if not exists intro text default '';
alter table public.seo_pages add column if not exists product_explanation text default '';
alter table public.seo_pages add column if not exists localized_content text default '';
alter table public.seo_pages add column if not exists content text default '';
alter table public.seo_pages add column if not exists faq_content jsonb not null default '[]';
alter table public.seo_pages add column if not exists internal_links jsonb not null default '[]';
alter table public.seo_pages add column if not exists faq_schema jsonb;
alter table public.seo_pages add column if not exists breadcrumb_schema jsonb;
alter table public.seo_pages add column if not exists local_business_schema jsonb;
alter table public.seo_pages add column if not exists organization_schema jsonb;
alter table public.seo_pages add column if not exists product_schema jsonb;
alter table public.seo_pages add column if not exists brands_json jsonb;
alter table public.seo_pages add column if not exists pricing_json jsonb;
alter table public.seo_pages add column if not exists applications_json jsonb;
alter table public.seo_pages add column if not exists canonical_url text;
alter table public.seo_pages add column if not exists og_title text;
alter table public.seo_pages add column if not exists og_description text;
alter table public.seo_pages add column if not exists og_image text;
alter table public.seo_pages add column if not exists content_hash text;
alter table public.seo_pages add column if not exists similarity_score numeric(5,4);
alter table public.seo_pages add column if not exists word_count integer default 0;
alter table public.seo_pages add column if not exists status text not null default 'draft';
alter table public.seo_pages add column if not exists is_published boolean not null default false;
alter table public.seo_pages add column if not exists is_indexed boolean not null default false;
alter table public.seo_pages add column if not exists ai_generated_at timestamptz;
alter table public.seo_pages add column if not exists ai_model text default '';
alter table public.seo_pages add column if not exists content_version integer not null default 1;
alter table public.seo_pages add column if not exists reviewed_by text default '';
alter table public.seo_pages add column if not exists review_notes text default '';
alter table public.seo_pages add column if not exists created_at timestamptz not null default now();
alter table public.seo_pages add column if not exists updated_at timestamptz not null default now();
alter table public.seo_pages add column if not exists published_at timestamptz;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'seo_pages'
      and column_name = 'page_type'
      and udt_name <> 'page_type'
  ) then
    alter table public.seo_pages
      alter column page_type type public.page_type
      using (
        case page_type::text
          when 'location' then 'location'::public.page_type
          when 'category' then 'category'::public.page_type
          when 'brand' then 'brand'::public.page_type
          when 'product_location' then 'product_location'::public.page_type
          when 'location_category' then 'product_location'::public.page_type
          when 'brand_location' then 'brand_location'::public.page_type
          when 'blog' then 'blog'::public.page_type
          else 'product_location'::public.page_type
        end
      );
  end if;
end $$;

update public.seo_pages
set page_type = 'product_location'::public.page_type
where page_type is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'seo_pages_area_id_fkey'
      and conrelid = 'public.seo_pages'::regclass
  ) then
    alter table public.seo_pages
      add constraint seo_pages_area_id_fkey
      foreign key (area_id) references public.seo_areas(id) on delete set null
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'seo_pages_category_id_fkey'
      and conrelid = 'public.seo_pages'::regclass
  ) then
    alter table public.seo_pages
      add constraint seo_pages_category_id_fkey
      foreign key (category_id) references public.seo_categories(id) on delete set null
      not valid;
  end if;
end $$;

create table if not exists public.seo_content_queue (
  id serial primary key,
  tenant_id uuid,
  area_id integer references public.seo_areas(id) on delete cascade,
  category_id integer references public.seo_categories(id) on delete cascade,
  page_type public.page_type not null default 'product_location',
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  generated_content jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(page_type, area_id, category_id)
);

create table if not exists public.seo_content_logs (
  id serial primary key,
  tenant_id uuid,
  seo_page_id integer references public.seo_pages(id) on delete cascade,
  action text not null,
  old_content jsonb,
  new_content jsonb,
  performed_by text default '',
  created_at timestamptz not null default now()
);

alter table public.seo_pages alter column page_type set default 'product_location'::public.page_type;
alter table public.seo_pages alter column page_type set not null;

-- Compatibility cleanup for accidental merged naming.
update public.seo_pages
set page_type = 'product_location'::public.page_type
where page_type::text = 'location_category';

create or replace function public.generate_seo_slug(
  p_type public.page_type,
  p_area_slug text default null,
  p_category_slug text default null,
  p_brand_slug text default null
) returns text as $$
begin
  return case p_type
    when 'location' then coalesce(p_area_slug, 'unknown')
    when 'category' then coalesce(p_category_slug, 'unknown')
    when 'brand' then coalesce(p_brand_slug, 'unknown')
    when 'product_location' then coalesce(p_category_slug, 'unknown') || '-in-' || coalesce(p_area_slug, 'unknown')
    when 'brand_location' then coalesce(p_brand_slug, 'unknown') || '-dealer-' || coalesce(p_area_slug, 'unknown')
    else 'unknown'
  end;
end;
$$ language plpgsql;

create or replace function public.generate_seo_path(
  p_type public.page_type,
  p_slug text
) returns text as $$
begin
  return case p_type
    when 'location' then '/location/' || p_slug
    when 'category' then '/category/' || p_slug
    when 'brand' then '/brand/' || p_slug
    when 'product_location' then '/location/' || split_part(p_slug, '-in-', 2) || '/' || split_part(p_slug, '-in-', 1)
    when 'brand_location' then '/brand/' || split_part(p_slug, '-dealer-', 1) || '/' || split_part(p_slug, '-dealer-', 2)
    else '/' || p_slug
  end;
end;
$$ language plpgsql;

create or replace function public.auto_generate_seo_page_fields()
returns trigger as $$
declare
  v_area_slug text;
  v_cat_slug text;
begin
  select slug into v_area_slug from public.seo_areas where id = new.area_id;
  select slug into v_cat_slug from public.seo_categories where id = new.category_id;

  if new.slug is null or new.slug = '' then
    new.slug := public.generate_seo_slug(new.page_type, v_area_slug, v_cat_slug);
  end if;

  if new.full_path is null or new.full_path = '' then
    new.full_path := public.generate_seo_path(new.page_type, new.slug);
  end if;

  if new.canonical_url is null or new.canonical_url = '' then
    new.canonical_url := 'https://www.karurplywood.co.in' || new.full_path;
  end if;

  if new.status = 'published' and new.is_published = true and new.published_at is null then
    new.published_at := now();
  end if;

  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_auto_generate_seo_page_fields on public.seo_pages;
create trigger trg_auto_generate_seo_page_fields
before insert or update on public.seo_pages
for each row execute function public.auto_generate_seo_page_fields();

create or replace function public.seo_touch_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists seo_areas_updated_at on public.seo_areas;
create trigger seo_areas_updated_at before update on public.seo_areas
for each row execute function public.seo_touch_updated_at();

drop trigger if exists seo_categories_updated_at on public.seo_categories;
create trigger seo_categories_updated_at before update on public.seo_categories
for each row execute function public.seo_touch_updated_at();

create index if not exists idx_seo_areas_priority on public.seo_areas(priority);
create index if not exists idx_seo_pages_type on public.seo_pages(page_type);
create index if not exists idx_seo_pages_slug on public.seo_pages(slug);
create index if not exists idx_seo_pages_path on public.seo_pages(full_path);
create index if not exists idx_seo_pages_status on public.seo_pages(status, is_published);
create index if not exists idx_seo_pages_published on public.seo_pages(page_type, is_published, status);
create index if not exists idx_seo_pages_area_category on public.seo_pages(area_id, category_id);
create index if not exists idx_seo_pages_created on public.seo_pages(created_at desc);
create index if not exists idx_seo_pages_faq on public.seo_pages using gin(faq_content);
create index if not exists idx_seo_pages_links on public.seo_pages using gin(internal_links);
create unique index if not exists seo_pages_full_path_unique on public.seo_pages(full_path);
create unique index if not exists seo_pages_type_area_category_unique
  on public.seo_pages(page_type, area_id, category_id)
  where area_id is not null and category_id is not null;

alter table public.seo_areas enable row level security;
alter table public.seo_categories enable row level security;
alter table public.seo_pages enable row level security;
alter table public.seo_content_queue enable row level security;
alter table public.seo_content_logs enable row level security;

drop policy if exists seo_areas_public_read on public.seo_areas;
create policy seo_areas_public_read on public.seo_areas for select using (true);

drop policy if exists seo_categories_public_read on public.seo_categories;
create policy seo_categories_public_read on public.seo_categories for select using (true);

drop policy if exists seo_pages_public_read_published on public.seo_pages;
create policy seo_pages_public_read_published on public.seo_pages
for select using (is_published = true and status = 'published');

drop policy if exists service_role_all_seo_areas on public.seo_areas;
create policy service_role_all_seo_areas on public.seo_areas for all using (auth.role() = 'service_role');

drop policy if exists service_role_all_seo_categories on public.seo_categories;
create policy service_role_all_seo_categories on public.seo_categories for all using (auth.role() = 'service_role');

drop policy if exists service_role_all_seo_pages on public.seo_pages;
create policy service_role_all_seo_pages on public.seo_pages for all using (auth.role() = 'service_role');

drop policy if exists service_role_all_seo_queue on public.seo_content_queue;
create policy service_role_all_seo_queue on public.seo_content_queue for all using (auth.role() = 'service_role');

drop policy if exists service_role_all_seo_logs on public.seo_content_logs;
create policy service_role_all_seo_logs on public.seo_content_logs for all using (auth.role() = 'service_role');

create or replace function public.get_product_location_page(area_slug text, category_slug text)
returns table (
  page_id integer,
  status text,
  seo_title text,
  seo_description text,
  h1 text,
  intro text,
  product_explanation text,
  localized_content text,
  faq_content jsonb,
  internal_links jsonb,
  area_name text,
  category_name text,
  area_distance numeric,
  area_delivery text,
  is_published boolean
) as $$
begin
  return query
  select p.id, p.status, p.seo_title, p.seo_description, p.h1, p.intro,
    p.product_explanation, p.localized_content, p.faq_content, p.internal_links,
    a.display_name as area_name, c.display_name as category_name,
    a.distance_km, a.delivery_time, p.is_published
  from public.seo_pages p
  join public.seo_areas a on p.area_id = a.id
  join public.seo_categories c on p.category_id = c.id
  where a.slug = area_slug
    and c.slug = category_slug
    and p.page_type = 'product_location'
    and p.status = 'published'
    and p.is_published = true;
end;
$$ language plpgsql stable;

insert into public.seo_areas (slug, name, display_name, district, pincode, latitude, longitude, lat, lng, distance_km, delivery_time, priority, famous_for, local_landmark, transport_hub, nearby_subareas, neighborhoods, local_use_cases)
values
  ('karur', 'Karur', 'Karur', 'Karur', '639001', 10.9601, 78.0785, 10.9601, 78.0785, 0, 'same day', 1, 'textile and home construction', 'Karur Bus Stand', 'Karur transport corridor', array['Gandhigramam','Vengamedu','Thanthonimalai'], array['Vengamedu','Thanthonimalai','Pasupathipalayam','Sengunthapuram'], array['modular kitchens','wardrobes','commercial interiors']),
  ('thanthonimalai', 'Thanthonimalai', 'Thanthonimalai', 'Karur', '639005', 10.9340, 78.0840, 10.9340, 78.0840, 5, 'same day', 5, 'residential construction', 'Thanthonimalai Temple', 'Karur local route', array['Karur','Vengamedu'], array['Anna Nagar','Collectorate Area'], array['modular kitchens','wardrobes','home interiors']),
  ('vengamedu', 'Vengamedu', 'Vengamedu', 'Karur', '639006', 10.9730, 78.0780, 10.9730, 78.0780, 3, 'same day', 6, 'residential interiors', 'Vengamedu Main Road', 'Karur local route', array['Karur','Thanthonimalai'], array['Gandhigramam','Pasupathipalayam'], array['kitchen cabinets','wardrobes','false ceilings']),
  ('trichy', 'Trichy', 'Trichy', 'Tiruchirappalli', '620001', 10.7905, 78.7047, 10.7905, 78.7047, 85, '3-5 days', 20, 'residential and commercial projects', 'Central Bus Stand', 'Trichy highway route', array['Srirangam','Thillai Nagar','Woraiyur'], array['Srirangam','Thillai Nagar','Woraiyur'], array['apartments','retail fit-outs','kitchen cabinets']),
  ('namakkal', 'Namakkal', 'Namakkal', 'Namakkal', '637001', 11.2194, 78.1678, 11.2194, 78.1678, 50, '2-3 days', 30, 'transport and poultry businesses', 'Namakkal Fort', 'Namakkal truck route', array['Mohanur','Rasipuram','Paramathi Velur'], array['Mohanur','Rasipuram','Paramathi Velur'], array['commercial storage','home interiors','office partitions'])
on conflict (slug) do nothing;

insert into public.seo_categories (slug, name, display_name, parent_category, base_price, price_unit, brands, key_benefits)
values
  ('plywood', 'plywood', 'Plywood', 'Boards', 85, 'per sq.ft.', array['CenturyPly','Greenply','Sainik'], 'high strength, calibrated thickness, moisture resistance'),
  ('laminates', 'laminates', 'Laminates', 'Surface Finishes', 950, 'per sheet', array['Greenlam','Merino','CenturyLaminates'], 'scratch resistance, design variety, easy maintenance'),
  ('hardware', 'hardware', 'Hardware', 'Fittings', 120, 'per piece', array['Hettich','Ebco','Godrej'], 'durable motion, smooth operation, long service life'),
  ('doors', 'doors', 'Doors', 'Door Solutions', 2800, 'per piece', array['CenturyDoors','Greenply','Local Flush Doors'], 'stability, finish options, termite resistance')
on conflict (slug) do nothing;
