-- ============================================================
-- Karur Plywood — Blog CMS + Image Storage Setup
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. BLOG POSTS TABLE
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text default '',
  content text default '',
  cover_image text default '',
  category text default 'General',
  tags text[] default '{}',
  published boolean default false,
  published_at timestamptz default null,
  author text default 'Karur Plywood Team',
  read_time integer default 5,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_blog_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  if new.published = true and old.published = false then
    new.published_at = now();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger blog_posts_updated_at
  before update on blog_posts
  for each row execute function update_blog_updated_at();

-- RLS
alter table blog_posts enable row level security;

create policy "Public can read published posts" on blog_posts
  for select using (published = true);

create policy "Service role full access on blog_posts" on blog_posts
  for all using (auth.role() = 'service_role');

-- ============================================================
-- 2. STORAGE BUCKET for product images
-- Run this AFTER creating the bucket manually in Supabase Storage UI
-- OR uncomment and run if using service role
-- ============================================================

-- Create storage bucket (run in SQL editor)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Allow public to read images
create policy "Public can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Allow service role to upload/delete
create policy "Service role can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images');

create policy "Service role can delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images');

create policy "Service role can update product images"
  on storage.objects for update
  using (bucket_id = 'product-images');

-- ============================================================
-- SEED: Sample blog posts
-- ============================================================
insert into blog_posts (title, slug, excerpt, content, category, tags, published, read_time) values
(
  'BWR vs MR Plywood — Which One Should You Choose?',
  'bwr-vs-mr-plywood',
  'Confused between BWR and MR plywood? Learn the key differences and which grade is right for your kitchen, bedroom or bathroom.',
  '## What is BWR Plywood?

BWR stands for Boiling Water Resistant. This grade of plywood is manufactured using phenol formaldehyde resin, which makes it highly resistant to moisture, water and humidity. It is certified under IS:303 by the Bureau of Indian Standards.

**Best uses for BWR plywood:**
- Kitchen cabinets and shutters
- Bathroom vanities
- Wet areas with high humidity
- Exterior furniture

## What is MR Plywood?

MR stands for Moisture Resistant. This grade uses urea formaldehyde resin and is suitable for areas with light moisture exposure. It is also IS:303 certified but has lower water resistance compared to BWR.

**Best uses for MR plywood:**
- Bedroom wardrobes
- Living room furniture
- Interior wall paneling
- Study tables and bookshelves

## Key Differences

| Feature | BWR Grade | MR Grade |
|---|---|---|
| Resin used | Phenol formaldehyde | Urea formaldehyde |
| Water resistance | High | Moderate |
| Price | Higher | Lower |
| Best for | Kitchens, bathrooms | Interior furniture |

## Our Recommendation

For any woodwork in kitchens or bathrooms, always go with BWR grade. For interior bedroom and living room furniture, MR grade is a cost-effective and reliable choice.

**Not sure which to pick for your project? Chat with us on WhatsApp and our team will guide you.**',
  'Buying Guide',
  ARRAY['plywood', 'BWR', 'MR', 'buying guide'],
  true,
  5
),
(
  'Top 5 Laminate Sheet Designs for Kitchen Cabinets in 2025',
  'top-laminate-designs-kitchen-2025',
  'Discover the trending laminate sheet designs for modular kitchens in 2025 — from bold gloss finishes to natural wood textures.',
  '## Why Laminates Matter for Your Kitchen

The laminate you choose for your kitchen cabinets can completely transform the look of your home. With 100+ designs available at Karur Plywood, here are the top 5 trending options for 2025.

## 1. Solid Matte White

Clean, modern and timeless. Matte white laminates hide fingerprints better than gloss and give your kitchen a premium European look. Pairs beautifully with black or gold hardware handles.

## 2. Walnut Wood Grain

Natural wood textures are extremely popular in 2025. The warm brown tones of walnut grain laminates add warmth and character to any kitchen without the cost and maintenance of real wood.

## 3. Charcoal Grey Matte

Bold and contemporary. Charcoal grey paired with white stone countertops creates a striking contrast that looks straight out of an interior design magazine.

## 4. High Gloss White

For those who love the mirror-like shine, high gloss white laminates make kitchens look bright and spacious. Easy to wipe clean and always stylish.

## 5. Sage Green

The breakout trend of 2025. Soft sage green laminates are appearing in kitchens across Tamil Nadu, giving homes a fresh, organic feel that stands out.

## How to Choose the Right One

Consider your countertop colour, wall colour and the amount of natural light in your kitchen. Our team at Karur Plywood can show you physical samples of all these designs at our showroom.

**Visit our Karur showroom or WhatsApp us to see the full laminate catalogue.**',
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

Choosing the wrong plywood thickness is one of the most common and costly mistakes in home construction and furniture making. Too thin and your furniture will sag or crack. Too thick and you''re wasting money.

## Thickness Guide by Application

### 4mm Plywood
- Back panels of wardrobes
- Drawer bottoms
- Decorative wall paneling

### 6mm Plywood
- Cabinet backs
- Light-duty shelves
- Partition boards

### 9mm Plywood
- Small shelves
- Door panels
- Light furniture backing

### 12mm Plywood
- Shelves (medium load)
- Cabinet sides for small units
- Stair risers

### 18mm Plywood ⭐ Most Popular
- Kitchen cabinet carcass (body)
- Wardrobe frame and sides
- Office furniture
- Heavy-duty shelves

### 19mm Plywood
- Flooring substrate
- Workbench tops
- Heavy furniture bases

### 25mm Plywood
- Structural applications
- Flooring in high-traffic areas
- Extra-heavy duty shelves

## Our Recommendation

For most home furniture projects, **18mm BWR grade plywood** is the sweet spot — strong, durable and cost-effective. Use 12mm for shelves and 6mm or 4mm for back panels.

**Need help calculating how much plywood you need? WhatsApp us your room dimensions and we''ll calculate it for you — free.**',
  'Buying Guide',
  ARRAY['plywood', 'thickness guide', 'furniture', 'construction'],
  true,
  6
)
on conflict (slug) do nothing;

-- Done!
select 'Blog setup complete! Posts: ' || count(*)::text from blog_posts;
