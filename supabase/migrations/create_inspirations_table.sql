-- Migration: create inspirations table for the Inspiration gallery feature
-- Run this in your Supabase SQL editor.

create table if not exists inspirations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  space_type text not null,               -- e.g. 'Modular Kitchen', 'Wardrobes', 'TV Units', 'Bedrooms', 'Living Room', 'False Ceiling', 'Office Spaces', 'Doors', 'Commercial'
  style text,                              -- e.g. 'Modern', 'Contemporary'
  cover_image text,
  gallery_images text[] default '{}',
  location text,                           -- e.g. 'Karur', 'Trichy'
  area_sqft integer,
  items_used integer,
  completed_on date,
  description text,
  materials_used jsonb default '[]',        -- [{ "type": "Plywood", "name": "Century Club Prime 18mm" }, ...]
  color_palette text[] default '{}',        -- hex codes shown as swatches
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists inspirations_space_type_idx on inspirations (space_type);
create index if not exists inspirations_published_idx on inspirations (published);

-- Row Level Security: public can read published rows only
alter table inspirations enable row level security;

create policy "Public can read published inspirations"
  on inspirations for select
  using (published = true);
