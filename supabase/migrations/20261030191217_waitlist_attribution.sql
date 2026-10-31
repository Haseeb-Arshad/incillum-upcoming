-- Keep each accepted submission, including repeat submissions from the same
-- address. `waitlist` remains the one-row-per-address contact list.
-- Capture the form's page and campaign source without storing raw URLs,
-- cookies, IP addresses, or user-agent strings.
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
  'Append-only record of accepted waitlist form submissions. Written server-side; RLS denies public access.';

create index if not exists waitlist_submissions_created_at_idx
  on public.waitlist_submissions (created_at desc);
create index if not exists waitlist_submissions_email_received_at_idx
  on public.waitlist_submissions (work_email, received_at desc);

alter table public.waitlist_submissions enable row level security;

-- Explicit grants are required for new public tables after 2026-10-30.
-- There are intentionally no anon/authenticated grants or RLS policies.
revoke all on public.waitlist from public, anon, authenticated, service_role;
grant insert on public.waitlist to service_role;
revoke all on public.waitlist_submissions from public, anon, authenticated, service_role;
grant insert on public.waitlist_submissions to service_role;
