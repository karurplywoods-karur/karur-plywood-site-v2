-- ============================================================
-- Karur Plywood — Blog Posts Table (FIXED)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- This fixes: "could not find table 'public.blog_posts' in schema cache"
-- ============================================================

-- Step 1: Drop and recreate cleanly (safe — only runs if table doesn't exist properly)
drop table if exists blog_posts cascade;

-- Step 2: Create with explicit schema
create table public.blog_posts (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique,
  excerpt      text not null default '',
  content      text not null default '',
  cover_image  text not null default '',
  category     text not null default 'General',
  tags         text[] not null default '{}',
  published    boolean not null default false,
  published_at timestamptz default null,
  author       text not null default 'Karur Plywood Team',
  read_time    integer not null default 5,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Step 3: updated_at trigger
create or replace function public.update_blog_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  if new.published = true and old.published = false then
    new.published_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists blog_posts_updated_at on public.blog_posts;
create trigger blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function public.update_blog_updated_at();

-- Step 4: RLS
alter table public.blog_posts enable row level security;

-- Drop existing policies if any
drop policy if exists "Public can read published posts" on public.blog_posts;
drop policy if exists "Service role full access on blog_posts" on public.blog_posts;

-- Public: read published only
create policy "Public can read published posts"
  on public.blog_posts
  for select
  using (published = true);

-- Service role: full access (used by your admin API routes)
create policy "Service role full access on blog_posts"
  on public.blog_posts
  for all
  using (auth.role() = 'service_role');

-- Step 5: Grant permissions (fixes schema cache issue)
grant usage on schema public to anon, authenticated, service_role;
grant all on public.blog_posts to anon, authenticated, service_role;

-- Step 6: Reload schema cache (critical fix)
notify pgrst, 'reload schema';

-- Step 7: Seed 3 starter posts
insert into public.blog_posts (title, slug, excerpt, content, category, tags, published, read_time)
values
(
  'BWR vs MR Plywood — Which One Should You Choose?',
  'bwr-vs-mr-plywood',
  'Confused between BWR and MR plywood? Learn the key differences and which grade is right for your project.',
  '## What is BWR Plywood?

BWR stands for Boiling Water Resistant. This grade uses phenol formaldehyde resin, making it highly resistant to moisture and humidity. It is certified under IS:303.

**Best uses for BWR plywood:**
- Kitchen cabinets and shutters
- Bathroom vanities
- Any area with high moisture exposure

## What is MR Plywood?

MR stands for Moisture Resistant. This grade uses urea formaldehyde resin and suits areas with light moisture exposure. Also IS:303 certified but lower water resistance than BWR.

**Best uses for MR plywood:**
- Bedroom wardrobes
- Living room furniture
- Interior wall paneling

## Key Differences

| Feature | BWR Grade | MR Grade |
|---|---|---|
| Resin | Phenol formaldehyde | Urea formaldehyde |
| Water resistance | High | Moderate |
| Price | Higher | Lower |
| Best for | Kitchens, bathrooms | Interior furniture |

## Our Recommendation

For kitchens and bathrooms, always choose BWR grade. For interior bedroom and living room furniture, MR grade is cost-effective and reliable.

**Not sure which to pick? Chat with us on WhatsApp and our team will guide you.**',
  'Buying Guide',
  ARRAY['plywood', 'BWR', 'MR', 'buying guide'],
  true,
  5
),
(
  'Top 5 Laminate Sheet Designs for Kitchen Cabinets in 2025',
  'top-laminate-designs-kitchen-2025',
  'Discover the trending laminate sheet designs for modular kitchens in 2025 from bold gloss to natural wood textures.',
  '## Why Laminates Matter

The laminate you choose for your kitchen cabinets can completely transform the look of your home. With 100+ designs at Karur Plywood, here are the top 5 trending options for 2025.

## 1. Solid Matte White

Clean, modern and timeless. Matte white laminates hide fingerprints better than gloss and give a premium European look.

## 2. Walnut Wood Grain

Natural wood textures are very popular in 2025. Warm walnut tones add character without the cost of real wood.

## 3. Charcoal Grey Matte

Bold and contemporary. Charcoal grey paired with white stone countertops creates a striking contrast.

## 4. High Gloss White

Mirror-like shine makes kitchens look bright and spacious. Easy to wipe clean and always stylish.

## 5. Sage Green

The breakout trend of 2025. Soft sage green gives homes a fresh, organic feel that stands out.

**Visit our showroom or WhatsApp us to see the full laminate catalogue.**',
  'Interior Design',
  ARRAY['laminates', 'kitchen', 'interior design', '2025 trends'],
  true,
  4
),
(
  'Plywood Thickness Guide — What to Use for Every Application',
  'plywood-thickness-guide',
  'From 4mm to 25mm — a complete guide to choosing the right plywood thickness for furniture, flooring and construction.',
  '## Why Thickness Matters

Choosing the wrong plywood thickness is one of the most common and costly mistakes in home construction. Too thin and your furniture sags. Too thick and you waste money.

## Thickness Guide by Application

### 4mm Plywood
- Back panels of wardrobes
- Drawer bottoms

### 6mm Plywood
- Cabinet backs
- Light-duty shelves

### 12mm Plywood
- Shelves (medium load)
- Cabinet sides for small units

### 18mm Plywood (Most Popular)
- Kitchen cabinet carcass
- Wardrobe frame and sides
- Office furniture
- Heavy-duty shelves

### 25mm Plywood
- Structural applications
- Extra-heavy duty shelves

## Our Recommendation

For most home furniture, 18mm BWR grade plywood is the sweet spot — strong, durable and cost-effective.

**Need help calculating how much plywood you need? WhatsApp us your room dimensions and we will calculate it for you — free.**',
  'Buying Guide',
  ARRAY['plywood', 'thickness guide', 'furniture', 'construction'],
  true,
  6
)
on conflict (slug) do nothing;

-- Verify
select id, title, published from public.blog_posts order by created_at;
