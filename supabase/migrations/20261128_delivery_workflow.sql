-- 20261128_delivery_workflow.sql
-- "Delivery charges are EXTRA" workflow. Safe to run more than once.
-- Adds columns only — no existing data is changed. Existing orders keep
-- delivery_status = NULL (legacy: not gated). New orders get a status from the app.
-- KPC does not collect the transport money (customer pays the transport person on
-- delivery), so nothing here touches payment / revenue records.

alter table public.orders add column if not exists shipping_method           text not null default 'standard';
alter table public.orders add column if not exists delivery_status           text;
alter table public.orders add column if not exists customer_approval_status  text;
alter table public.orders add column if not exists delivery_payment_status   text;
alter table public.orders add column if not exists transport_type            text default '';
alter table public.orders add column if not exists transporter_name          text default '';
alter table public.orders add column if not exists transporter_phone         text default '';
alter table public.orders add column if not exists actual_transport_cost     numeric(12,2);
alter table public.orders add column if not exists delivery_charge_quoted    numeric(12,2);
alter table public.orders add column if not exists delivery_payment_note     text default '';
alter table public.orders add column if not exists care_remarks              text default '';
alter table public.orders add column if not exists expected_delivery_date    date;
alter table public.orders add column if not exists delivery_quoted_at        timestamptz;
alter table public.orders add column if not exists delivery_approved_at      timestamptz;
alter table public.orders add column if not exists delivery_updated_by       text;

create index if not exists idx_orders_delivery_status
  on public.orders (delivery_status) where delivery_status is not null;

-- Refresh PostgREST's schema cache so the API sees the new columns immediately.
notify pgrst, 'reload schema';
