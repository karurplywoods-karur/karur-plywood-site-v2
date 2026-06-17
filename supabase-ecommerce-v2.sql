-- ============================================================
-- KARUR PLYWOOD - ECOMMERCE V2 FEATURE SCHEMA
-- Products, variants, wishlist, reviews, delivery coverage,
-- project gallery, blog product linking, and comparison support.
-- Run after existing product/ecommerce schemas.
-- ============================================================

create extension if not exists pg_trgm;

-- ---------- Shared trigger ----------
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

-- ---------- Brand/catalog enrichment ----------
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  logo_url text default '',
  description text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products add column if not exists brand_id uuid references public.brands(id) on delete set null;
alter table public.products add column if not exists series text default '';
alter table public.products add column if not exists grade text default '';
alter table public.products add column if not exists search_keywords text[] default '{}';
alter table public.products add column if not exists application_tags text[] default '{}';
alter table public.products add column if not exists comparison_attributes jsonb not null default '{}';
alter table public.products add column if not exists seo_title text default '';
alter table public.products add column if not exists seo_description text default '';
alter table public.products add column if not exists updated_at timestamptz default now();

-- ---------- Product variants ----------
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id bigint not null references public.products(id) on delete cascade,
  sku text not null unique,
  slug text,
  thickness text default '',
  size text default '',
  grade text default '',
  finish text default '',
  color text default '',
  pack_size text default '',
  attributes jsonb not null default '{}',
  price numeric(12,2),
  mrp numeric(12,2),
  stock_quantity integer not null default 0,
  stock_status text not null default 'in_stock' check (stock_status in ('in_stock','low_stock','out_of_stock','made_to_order')),
  is_default boolean not null default false,
  sort_order integer not null default 0,
  seo_title text default '',
  seo_description text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id, slug)
);

create index if not exists idx_product_variants_product on public.product_variants(product_id);
create index if not exists idx_product_variants_sku on public.product_variants(sku);
create index if not exists idx_product_variants_attrs on public.product_variants using gin(attributes);
create index if not exists idx_products_brand on public.products(brand_id);
create index if not exists idx_products_keywords on public.products using gin(search_keywords);
create index if not exists idx_products_name_trgm on public.products using gin(name gin_trgm_ops);

-- ---------- Order item variant snapshot ----------
alter table public.order_items add column if not exists variant_id uuid references public.product_variants(id) on delete set null;
alter table public.order_items add column if not exists variant_sku text default '';
alter table public.order_items add column if not exists variant_label text default '';
create index if not exists idx_order_items_variant on public.order_items(variant_id);

-- ---------- Wishlist ----------
create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(customer_id, product_id, variant_id)
);

create index if not exists idx_wishlist_customer on public.wishlist_items(customer_id);

-- ---------- Reviews ----------
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id bigint not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null default '',
  rating integer not null check (rating between 1 and 5),
  title text default '',
  body text default '',
  photo_urls text[] default '{}',
  verified_purchase boolean not null default false,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_reviews_product on public.product_reviews(product_id, approved);

-- ---------- Delivery coverage ----------
create table if not exists public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  slug text not null,
  pincodes text[] default '{}',
  is_available boolean not null default true,
  estimate text not null default '1-2 Days',
  min_order numeric(12,2) default 0,
  notes text default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(slug)
);

create index if not exists idx_delivery_zones_city on public.delivery_zones(lower(city));
create index if not exists idx_delivery_zones_pincodes on public.delivery_zones using gin(pincodes);

-- ---------- Project gallery ----------
create table if not exists public.project_gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null,
  description text default '',
  location text default '',
  before_image_url text default '',
  after_image_url text default '',
  image_urls text[] default '{}',
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_gallery_products (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.project_gallery(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  unique(project_id, product_id, variant_id)
);

-- ---------- Blog product linking ----------
create table if not exists public.blog_product_mentions (
  id uuid primary key default gen_random_uuid(),
  blog_post_id uuid not null references public.blog_posts(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  mention_text text not null,
  sort_order integer not null default 0,
  unique(blog_post_id, product_id, variant_id)
);

-- ---------- Shareable comparisons ----------
create table if not exists public.comparison_sets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  product_ids bigint[] not null default '{}',
  variant_ids uuid[] not null default '{}',
  seo_title text default '',
  seo_description text default '',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Trigger installation ----------
drop trigger if exists brands_updated_at on public.brands;
create trigger brands_updated_at before update on public.brands
for each row execute function public.touch_updated_at();

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
for each row execute function public.touch_updated_at();

drop trigger if exists product_variants_updated_at on public.product_variants;
create trigger product_variants_updated_at before update on public.product_variants
for each row execute function public.touch_updated_at();

drop trigger if exists product_reviews_updated_at on public.product_reviews;
create trigger product_reviews_updated_at before update on public.product_reviews
for each row execute function public.touch_updated_at();

drop trigger if exists delivery_zones_updated_at on public.delivery_zones;
create trigger delivery_zones_updated_at before update on public.delivery_zones
for each row execute function public.touch_updated_at();

drop trigger if exists project_gallery_updated_at on public.project_gallery;
create trigger project_gallery_updated_at before update on public.project_gallery
for each row execute function public.touch_updated_at();

drop trigger if exists comparison_sets_updated_at on public.comparison_sets;
create trigger comparison_sets_updated_at before update on public.comparison_sets
for each row execute function public.touch_updated_at();

-- ---------- RLS ----------
alter table public.brands enable row level security;
alter table public.product_variants enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.product_reviews enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.project_gallery enable row level security;
alter table public.project_gallery_products enable row level security;
alter table public.blog_product_mentions enable row level security;
alter table public.comparison_sets enable row level security;

drop policy if exists brands_public_read on public.brands;
create policy brands_public_read on public.brands for select using (true);

drop policy if exists variants_public_read on public.product_variants;
create policy variants_public_read on public.product_variants for select using (true);

drop policy if exists wishlist_own on public.wishlist_items;
create policy wishlist_own on public.wishlist_items for all using (auth.uid() = customer_id);

drop policy if exists reviews_public_read on public.product_reviews;
create policy reviews_public_read on public.product_reviews for select using (approved = true);

drop policy if exists reviews_own_insert on public.product_reviews;
create policy reviews_own_insert on public.product_reviews for insert with check (auth.uid() = customer_id);

drop policy if exists delivery_public_read on public.delivery_zones;
create policy delivery_public_read on public.delivery_zones for select using (true);

drop policy if exists gallery_public_read on public.project_gallery;
create policy gallery_public_read on public.project_gallery for select using (published = true);

drop policy if exists gallery_products_public_read on public.project_gallery_products;
create policy gallery_products_public_read on public.project_gallery_products for select using (true);

drop policy if exists blog_mentions_public_read on public.blog_product_mentions;
create policy blog_mentions_public_read on public.blog_product_mentions for select using (true);

drop policy if exists comparisons_public_read on public.comparison_sets;
create policy comparisons_public_read on public.comparison_sets for select using (published = true);

-- Service role policies for admin API.
drop policy if exists service_role_all_brands on public.brands;
create policy service_role_all_brands on public.brands for all using (auth.role() = 'service_role');
drop policy if exists service_role_all_variants on public.product_variants;
create policy service_role_all_variants on public.product_variants for all using (auth.role() = 'service_role');
drop policy if exists service_role_all_reviews on public.product_reviews;
create policy service_role_all_reviews on public.product_reviews for all using (auth.role() = 'service_role');
drop policy if exists service_role_all_delivery on public.delivery_zones;
create policy service_role_all_delivery on public.delivery_zones for all using (auth.role() = 'service_role');
drop policy if exists service_role_all_gallery on public.project_gallery;
create policy service_role_all_gallery on public.project_gallery for all using (auth.role() = 'service_role');
drop policy if exists service_role_all_gallery_products on public.project_gallery_products;
create policy service_role_all_gallery_products on public.project_gallery_products for all using (auth.role() = 'service_role');
drop policy if exists service_role_all_blog_mentions on public.blog_product_mentions;
create policy service_role_all_blog_mentions on public.blog_product_mentions for all using (auth.role() = 'service_role');
drop policy if exists service_role_all_comparisons on public.comparison_sets;
create policy service_role_all_comparisons on public.comparison_sets for all using (auth.role() = 'service_role');

-- ---------- Seed delivery zones ----------
insert into public.delivery_zones (city, slug, pincodes, estimate, min_order, sort_order) values
  ('Karur', 'karur', array['639001','639002','639003','639004','639005'], 'Same Day / 1 Day', 0, 1),
  ('Trichy', 'trichy', array['620001','620002','620003','620004','620005'], '1-2 Days', 5000, 2),
  ('Namakkal', 'namakkal', array['637001','637002','637003'], '1-2 Days', 5000, 3),
  ('Erode', 'erode', array['638001','638002','638003'], '1-2 Days', 10000, 4),
  ('Salem', 'salem', array['636001','636002','636003'], '1-2 Days', 10000, 5),
  ('Dindigul', 'dindigul', array['624001','624002','624003'], '2-3 Days', 10000, 6)
on conflict (slug) do update set
  pincodes = excluded.pincodes,
  estimate = excluded.estimate,
  min_order = excluded.min_order,
  sort_order = excluded.sort_order;
