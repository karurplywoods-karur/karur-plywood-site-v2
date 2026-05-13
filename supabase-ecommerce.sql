-- ============================================================
-- Karur Plywood - E-commerce schema
-- Run in Supabase SQL Editor.
-- Includes Google Maps delivery location fields for addresses/orders.
-- ============================================================

create table if not exists public.customers (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null default '',
  phone         text not null default '',
  email         text not null default '',
  avatar_url    text default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.addresses (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid not null references public.customers(id) on delete cascade,
  label           text not null default 'Home',
  full_name       text not null,
  phone           text not null,
  line1           text not null,
  line2           text default '',
  city            text not null,
  state           text not null default 'Tamil Nadu',
  pincode         text not null,
  google_map_link text default '',
  latitude        numeric(10,7),
  longitude       numeric(10,7),
  is_default      boolean not null default false,
  created_at      timestamptz not null default now()
);

create table if not exists public.orders (
  id                       uuid primary key default gen_random_uuid(),
  order_number             text not null unique,
  customer_id              uuid not null references public.customers(id),
  address_id               uuid references public.addresses(id),
  delivery_name            text not null,
  delivery_phone           text not null,
  delivery_line1           text not null,
  delivery_line2           text default '',
  delivery_city            text not null,
  delivery_state           text not null default 'Tamil Nadu',
  delivery_pincode         text not null,
  delivery_google_map_link text default '',
  delivery_latitude        numeric(10,7),
  delivery_longitude       numeric(10,7),
  subtotal                 numeric(12,2) not null default 0,
  delivery_charge          numeric(12,2) not null default 0,
  discount                 numeric(12,2) not null default 0,
  total                    numeric(12,2) not null default 0,
  payment_method           text not null default 'cod',
  payment_status           text not null default 'pending',
  razorpay_order_id        text,
  razorpay_payment_id      text,
  status                   text not null default 'pending',
  notes                    text default '',
  admin_notes              text default '',
  tracking_number          text default '',
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid references public.products(id) on delete set null,
  product_name  text not null,
  product_image text default '',
  category_name text default '',
  unit          text default '',
  unit_price    numeric(12,2) not null default 0,
  quantity      integer not null default 1,
  line_total    numeric(12,2) not null default 0,
  created_at    timestamptz not null default now()
);

-- Existing installations: add map columns without dropping data.
alter table public.addresses add column if not exists google_map_link text default '';
alter table public.addresses add column if not exists latitude numeric(10,7);
alter table public.addresses add column if not exists longitude numeric(10,7);
alter table public.orders add column if not exists delivery_google_map_link text default '';
alter table public.orders add column if not exists delivery_latitude numeric(10,7);
alter table public.orders add column if not exists delivery_longitude numeric(10,7);

create or replace function public.generate_order_number()
returns trigger as $$
declare
  year_str text := to_char(now(), 'YYYY');
  seq_num int;
begin
  if new.order_number is not null and new.order_number <> '' then
    return new;
  end if;

  select count(*) + 1 into seq_num
  from public.orders
  where extract(year from created_at) = extract(year from now());

  new.order_number := 'KP-' || year_str || '-' || lpad(seq_num::text, 4, '0');
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_order_number on public.orders;
create trigger set_order_number
before insert on public.orders
for each row execute function public.generate_order_number();

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists customers_updated_at on public.customers;
create trigger customers_updated_at
before update on public.customers
for each row execute function public.update_updated_at();

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
before update on public.orders
for each row execute function public.update_updated_at();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.customers (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.customers enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists customers_own on public.customers;
create policy customers_own on public.customers
for all using (auth.uid() = id);

drop policy if exists addresses_own on public.addresses;
create policy addresses_own on public.addresses
for all using (auth.uid() = customer_id);

drop policy if exists orders_own on public.orders;
create policy orders_own on public.orders
for all using (auth.uid() = customer_id);

drop policy if exists order_items_own on public.order_items;
create policy order_items_own on public.order_items
for select using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.customer_id = auth.uid()
  )
);

create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created on public.orders(created_at desc);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_addresses_customer on public.addresses(customer_id);
create index if not exists idx_orders_number on public.orders(order_number);
