-- ============================================================
-- Karur Plywood — Products & Categories Schema
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. CATEGORIES TABLE
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  icon text default '📦',
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- 2. PRODUCTS TABLE
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references categories(id) on delete set null,
  description text default '',
  image_url text default '',
  type text not null default 'project' check (type in ('project','quick')),
  price numeric(10,2) default null,
  unit text default '',
  in_stock boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
  before update on products
  for each row execute function update_updated_at();

-- 3. RLS
alter table categories enable row level security;
alter table products enable row level security;

-- Public can read everything
create policy "Public read categories" on categories for select using (true);
create policy "Public read products"   on products   for select using (true);

-- Service role manages all
create policy "Service role all categories" on categories for all using (auth.role() = 'service_role');
create policy "Service role all products"   on products   for all using (auth.role() = 'service_role');

-- ============================================================
-- SEED: Categories
-- ============================================================
insert into categories (name, slug, icon, sort_order) values
  ('Plywood',   'plywood',   '🪵', 1),
  ('Doors',     'doors',     '🚪', 2),
  ('Laminates', 'laminates', '🎨', 3),
  ('Hardware',  'hardware',  '🔩', 4),
  ('Tools',     'tools',     '🔧', 5),
  ('Adhesives', 'adhesives', '🧴', 6)
on conflict (slug) do nothing;

-- ============================================================
-- SEED: Project Products
-- ============================================================
insert into products (name, category_id, description, image_url, type, price, unit, in_stock, sort_order)
select
  p.name, c.id, p.description, p.image_url, 'project', p.price, p.unit, true, p.sort_order
from (values
  ('BWR Grade Plywood 18mm', 'plywood', 'Boiling Water Resistant — ideal for kitchens and bathrooms. ISI certified IS:303.', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', 2800, 'per sheet', 1),
  ('MR Grade Plywood 18mm', 'plywood', 'Moisture Resistant plywood for wardrobes and interior furniture.', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', 1800, 'per sheet', 2),
  ('Commercial Plywood 12mm', 'plywood', 'Economical plywood for shuttering and general construction use.', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', 950, 'per sheet', 3),
  ('Marine Plywood 18mm', 'plywood', 'Fully waterproof for external use. IS:710 certified.', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', 3500, 'per sheet', 4),
  ('Block Board 19mm', 'plywood', 'Solid wood core block board for doors and shelves.', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', 2200, 'per sheet', 5),
  ('Flush Door Solid Core 7ft', 'doors', 'Heavy-duty solid core flush door with teak face veneer.', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', 4500, 'per door', 1),
  ('Flush Door Hollow Core 7ft', 'doors', 'Lightweight hollow core door for bedrooms. Economical and clean finish.', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', 2800, 'per door', 2),
  ('Moulded Panel Door 7ft', 'doors', 'Decorative moulded skin door — ready to paint or polish.', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', 3200, 'per door', 3),
  ('PVC Door 7ft', 'doors', '100% waterproof PVC door for bathrooms. Termite-proof, zero maintenance.', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', 3800, 'per door', 4),
  ('High Gloss Laminate Sheet', 'laminates', 'Mirror-finish glossy laminate for kitchen shutters. Scratch resistant.', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80', 850, 'per sheet', 1),
  ('Matt Finish Laminate Sheet', 'laminates', 'Anti-fingerprint matt laminate. Modern look for wardrobes and cabinets.', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80', 780, 'per sheet', 2),
  ('Wood Texture Laminate Sheet', 'laminates', 'Realistic wood grain finish. Available in teak, oak and walnut tones.', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80', 820, 'per sheet', 3)
) as p(name, category_slug, description, image_url, price, unit, sort_order)
join categories c on c.slug = p.category_slug;

-- ============================================================
-- SEED: Quick Order Products
-- ============================================================
insert into products (name, category_id, description, image_url, type, price, unit, in_stock, sort_order)
select
  p.name, c.id, p.description, p.image_url, 'quick', p.price, p.unit, true, p.sort_order
from (values
  ('Fevicol SH 1kg', 'adhesives', 'Premium synthetic resin adhesive for furniture and woodwork.', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80', 180, 'per kg', 1),
  ('Fevicol SH 5kg', 'adhesives', 'Bulk pack synthetic resin adhesive. Best for contractors.', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80', 820, 'per 5kg', 2),
  ('Fevicol Marine 1kg', 'adhesives', 'Waterproof marine adhesive for kitchen and bathroom woodwork.', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80', 280, 'per kg', 3),
  ('SS Hinges 3 inch (pair)', 'hardware', 'Stainless steel 304 grade butt hinges for doors and cabinets.', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80', 45, 'per pair', 1),
  ('Soft Close Hinge (pair)', 'hardware', 'Hydraulic soft-close concealed hinge for cabinet doors.', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80', 120, 'per pair', 2),
  ('Drawer Channel 18 inch (pair)', 'hardware', 'Ball-bearing drawer slide channel. Smooth operation guaranteed.', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80', 180, 'per pair', 3),
  ('Cabinet Handle 96mm', 'hardware', 'Stainless steel cabinet handle. Modern design for kitchen cabinets.', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80', 35, 'per piece', 4),
  ('Cabinet Handle 128mm', 'hardware', 'Large SS cabinet handle. Fits most modular kitchen designs.', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80', 45, 'per piece', 5),
  ('Wood Screws 1.5 inch (100pcs)', 'hardware', 'Zinc-plated countersunk wood screws. Sharp point for easy driving.', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80', 80, 'per 100', 6),
  ('Wood Screws 2 inch (100pcs)', 'hardware', 'Heavy-duty 2-inch wood screws for frame joints and panel fixing.', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80', 95, 'per 100', 7),
  ('Sandpaper 80 grit (pack of 10)', 'tools', 'Aluminium oxide sandpaper. Ideal for rough sanding of plywood edges.', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80', 60, 'pack of 10', 1),
  ('Sandpaper 120 grit (pack of 10)', 'tools', 'Medium grit sandpaper for finishing wood surfaces before polish.', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80', 65, 'pack of 10', 2),
  ('Wood Putty 200g', 'tools', 'White wood putty for filling nail holes and surface imperfections.', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80', 75, 'per tube', 3),
  ('Measuring Tape 5m', 'tools', 'Steel blade retractable measuring tape with mm and inch markings.', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80', 120, 'per piece', 4),
  ('Door Stopper (set of 2)', 'hardware', 'Stainless steel floor-mount door stopper. Prevents wall damage.', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80', 90, 'set of 2', 8)
) as p(name, category_slug, description, image_url, price, unit, sort_order)
join categories c on c.slug = p.category_slug;

-- Done!
select 'Setup complete! Categories: ' || count(*)::text from categories;
