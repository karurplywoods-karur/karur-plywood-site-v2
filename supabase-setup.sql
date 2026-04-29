-- ============================================================
-- Karur Plywood & Company — Supabase Database Setup
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. ENQUIRIES TABLE
create table if not exists enquiries (
  id bigint primary key generated always as identity,
  name text not null,
  phone text not null,
  location text default '',
  product text default '',
  message text default '',
  status text default 'new' check (status in ('new','contacted','converted','closed')),
  created_at timestamptz default now()
);

-- 2. REVIEWS TABLE
create table if not exists reviews (
  id bigint primary key generated always as identity,
  name text not null,
  role text default '',
  rating integer not null check (rating between 1 and 5),
  message text not null,
  approved boolean default false,
  created_at timestamptz default now()
);

-- 3. GALLERY TABLE
create table if not exists gallery (
  id bigint primary key generated always as identity,
  title text default '',
  category text default 'general',
  image_url text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
alter table enquiries enable row level security;
alter table reviews enable row level security;
alter table gallery enable row level security;

-- ENQUIRIES: Anyone can insert, only service_role can read/update/delete
create policy "Anyone can submit enquiry" on enquiries
  for insert with check (true);

create policy "Service role full access on enquiries" on enquiries
  for all using (auth.role() = 'service_role');

-- REVIEWS: Anyone can insert, public can read approved ones, service_role manages all
create policy "Anyone can submit review" on reviews
  for insert with check (true);

create policy "Public can read approved reviews" on reviews
  for select using (approved = true);

create policy "Service role full access on reviews" on reviews
  for all using (auth.role() = 'service_role');

-- GALLERY: Public can read, service_role manages
create policy "Public can read gallery" on gallery
  for select using (true);

create policy "Service role full access on gallery" on gallery
  for all using (auth.role() = 'service_role');

-- ============================================================
-- SEED DATA — Sample reviews (approved)
-- ============================================================

insert into reviews (name, role, rating, message, approved) values
  ('Rajan K.', 'Carpenter, Karur', 5, 'Best plywood dealer in Karur, no doubt. I''ve been buying from them for 8 years. Genuine products, good prices and they know exactly what you need.', true),
  ('Meena S.', 'Homeowner, Trichy', 5, 'Ordered plywood for my new house construction. They gave me a great bulk rate and delivered on time. The quality was excellent. Will recommend to all my friends.', true),
  ('Suresh M.', 'Interior Contractor, Namakkal', 5, 'Very helpful staff, wide variety of laminates to choose from. Got exactly what I needed for my kitchen cabinets. Will come back again!', true),
  ('Priya R.', 'Homeowner, Karur', 4, 'Good quality products and knowledgeable staff. They helped me choose the right plywood thickness for my bedroom wardrobe. Delivery was on time too.', true),
  ('Kumar B.', 'Builder, Erode', 5, 'We have been sourcing all our plywood from Karur Plywood for 3 years now. Consistent quality, honest pricing and they always have stock ready.', true);

-- ============================================================
-- SEED DATA — Sample gallery images
-- ============================================================

insert into gallery (title, category, image_url, sort_order) values
  ('Plywood Stack — BWR Grade', 'plywood', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', 1),
  ('Door Collection', 'doors', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', 2),
  ('Laminate Sheet Designs', 'laminates', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80', 3),
  ('Hardware Fittings', 'hardware', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80', 4),
  ('Our Showroom', 'showroom', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80', 5),
  ('CenturyPly Stock', 'plywood', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', 6);

-- ============================================================
-- Done! Your database is ready.
-- ============================================================
