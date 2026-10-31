-- Incillum waitlist setup for the Supabase SQL Editor.
-- Copy and run this entire file in project nrubifcvldimjxcufgbh.
-- Safe to rerun: it creates missing tables and indexes and reapplies grants.
-- It does not delete existing rows.

begin;

create table if not exists public.waitlist (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  received_at     timestamptz not null,
  reference       text not null,
  work_email      text not null unique,
  commercial_work text not null default 'not answered',
  quote_volume    text not null default 'not answered',
  company         text not null default 'not answered',
  role            text not null default 'not answered',
  erp             text not null default 'not answered',
  pain            text not null default 'not answered'
);

comment on table public.waitlist is
  'Pre-launch waitlist contacts. Written server-side; RLS denies public access.';

create index if not exists waitlist_created_at_idx
  on public.waitlist (created_at desc);

alter table public.waitlist enable row level security;

create table if not exists public.waitlist_submissions (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  received_at     timestamptz not null,
  reference       text not null unique,
  work_email      text not null,
  commercial_work text not null,
  quote_volume    text not null,
  company         text not null,
  role            text not null,
  erp             text not null,
  pain            text not null,
  source_path     text not null,
  referrer_host   text,
  utm_source      text,
  utm_medium      text,
  utm_campaign    text
);

comment on table public.waitlist_submissions is
  'Append-only accepted waitlist submissions with form answers and first-party attribution.';

create index if not exists waitlist_submissions_created_at_idx
  on public.waitlist_submissions (created_at desc);
create index if not exists waitlist_submissions_email_received_at_idx
  on public.waitlist_submissions (work_email, received_at desc);

alter table public.waitlist_submissions enable row level security;

-- Supabase no longer grants new public tables to the Data API automatically.
-- The server key gets INSERT only. There are no browser grants or RLS policies.
grant usage on schema public to service_role;
revoke all on table public.waitlist from public, anon, authenticated, service_role;
grant insert on table public.waitlist to service_role;
revoke all on table public.waitlist_submissions from public, anon, authenticated, service_role;
grant insert on table public.waitlist_submissions to service_role;

commit;
