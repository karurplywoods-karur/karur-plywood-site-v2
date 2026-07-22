-- Migration: add account_type and business_type to customers
-- Run this in your Supabase SQL editor.

alter table customers add column if not exists account_type text; -- 'individual' | 'contractor' | 'business'
alter table customers add column if not exists business_type text; -- optional free text, e.g. 'Carpenter', 'Interior Designer', 'Contractor'
