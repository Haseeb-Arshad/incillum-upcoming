-- Waitlist store.
--
-- Run this once against the project — either `supabase db push`, or paste it
-- into the SQL editor at
-- https://supabase.com/dashboard/project/rsburzsagfpsconfyvrl/sql/new
--
-- ── What writes here ───────────────────────────────────────────────────────
--
-- The site's server function (`src/server/store.ts`) POSTs one row per signup
-- with the project's *service_role* key, which bypasses RLS. Nothing else has a
-- way in: RLS is enabled below and no policy is created, so the public
-- `sb_publishable_…` key — the one that ships in the browser bundle — can
-- neither read nor write this table. That is deliberate. It means the anon key
-- being public is not also an invitation to flood the list straight past the
-- server's spam screen.
--
-- ── Column shape ──────────────────────────────────────────────────────────
--
-- Mirrors `WaitlistNotification` in `src/server/notify.ts` one-to-one, so the
-- same record object is handed to the mailer and to this table without a second
-- mapping to keep in sync. The optional answers are stored as the literal
-- 'not answered' rather than NULL, for the same reason the mail body does it:
-- one representation of "missing", decided in one place. Aggregate queries
-- filter it out explicitly, e.g. `where commercial_work <> 'not answered'`.

create table if not exists public.waitlist (
  id              uuid primary key default gen_random_uuid(),
  -- When the row was written here. `received_at` is when the server accepted
  -- the signup; the two differ only if a write was retried.
  created_at      timestamptz not null default now(),
  received_at     timestamptz not null,
  reference       text not null,
  -- Lower-cased by the server before insert, so the constraint actually
  -- de-duplicates. A repeat signup is an upsert that changes nothing — see the
  -- `on_conflict` / `resolution=ignore-duplicates` request in `store.ts`.
  work_email      text not null unique,
  commercial_work text not null default 'not answered',
  quote_volume    text not null default 'not answered',
  company         text not null default 'not answered',
  role            text not null default 'not answered',
  erp             text not null default 'not answered',
  pain            text not null default 'not answered'
);

comment on table public.waitlist is
  'Pre-launch waitlist signups. Written server-side with the service_role key; RLS denies everyone else.';

-- Newest first is the only way this table is ever read by a person.
create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);

-- Enable RLS and create no policy: service_role bypasses it, everything else is
-- denied. Do not add an anon policy without also moving the write off the
-- publishable key.
alter table public.waitlist enable row level security;
