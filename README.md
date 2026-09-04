# Incillum

The pre-launch site for **incillum.com**.

Its argument is *the unattended hours*: commercial work keeps mattering after
the people carrying it have gone home. One page — the thesis, a night the reader
scrolls through, where the software is built to stop, one line of a quotation
with its arithmetic shown, and a form that asks for one email address.

The page goes dark where the office empties and returns to paper at 08:04, where
a person picks the work back up. That band is the design; read
[AGENTS.md](AGENTS.md) §4 before changing anything inside it.

## Running it

```bash
pnpm install
pnpm dev            # http://localhost:3200
```

## Checks

```bash
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint
pnpm test           # vitest — the schema and spam rules
pnpm test:e2e       # playwright, three viewports, against the production build
                    # (96 tests: landmarks, claims, the night, the clock, the form)
pnpm build
```

`pnpm test:e2e` builds the app and serves it, rather than running against the dev
server. Dev-mode module resolution is far more forgiving than a production
bundle, so a suite pointed at `vite dev` is green on exactly the failures that
take a deployment down.

## Configuration

Copy `.env.example` and fill it in. **The split matters:** anything prefixed
`VITE_` is inlined into the browser bundle and readable in the page source of
every visit, so nothing secret may ever be added to `src/env.ts`. Server-only
values are read from `process.env` in `src/server/env.ts`, which has exactly one
importer and must never be reached from a component.

### Public — `src/env.ts`

| Variable | Default | Used for |
| --- | --- | --- |
| `VITE_SITE_URL` | `http://localhost:3200` | canonical URL, Open Graph, sitemap |
| `VITE_CONTACT_EMAIL` | `hello@incillum.com` | the address in the colophon |
| `VITE_GTM_ID` | *(unset)* | Google Tag Manager container. Unset = no script, no cookies, no request |
| `VITE_POSTHOG_KEY` | *(unset)* | PostHog project API key (`phc_…`). Unset = the snippet is not rendered |
| `VITE_POSTHOG_HOST` | `https://us.i.posthog.com` | PostHog ingestion host — set for an EU project or a proxy |

### Server only — `src/server/env.ts`

| Variable | Used for |
| --- | --- |
| `BREVO_API_KEY` | sending waitlist notifications |
| `WAITLIST_NOTIFY_TO` | the inbox signups arrive in — yours, not the joiner's |
| `WAITLIST_NOTIFY_FROM` | the From address; **must** be a Brevo-verified sender |
| `SUPABASE_URL` | Supabase project URL — the durable copy of each signup |
| `SUPABASE_SERVICE_ROLE_KEY` | the `service_role` key; bypasses RLS, so **server-only**, never the anon key |

The three Brevo values are needed together, and so are the two Supabase values.
With a group missing, that half falls back to the server log — nothing breaks,
the record just lands somewhere less convenient. The two halves are
independent: email can be configured without the database and vice versa.

## Setting up Google Tag Manager

1. Create a container at [tagmanager.google.com](https://tagmanager.google.com)
   — choose **Web**. You get an ID like `GTM-ABC1234`.
2. Set `VITE_GTM_ID` to that ID in your host's environment settings and redeploy.
   It is a build-time value, so a redeploy is required; changing it in a
   dashboard without rebuilding does nothing.
3. Confirm it with GTM's **Preview** button, which opens the site with Tag
   Assistant attached. You should see the container connect on load.

### The conversion event

A successful signup pushes `waitlist_join` to the `dataLayer`, with a single
`first_workflow` property (one of nine fixed options, or `not_answered`).

To use it: **Triggers → New → Custom Event**, event name `waitlist_join`, then
point whatever tag you care about at it — a GA4 event, an Ads conversion, a
LinkedIn Insight conversion.

**No email address and no reference are pushed**, deliberately. Everything in
`dataLayer` is readable by every tag in the container and forwarded to whichever
vendors are configured there, and a work email address in an analytics product
is a data problem nobody signed up for.

### Consent — do this before real EU/UK traffic

There is **no consent gate**. GTM itself sets no cookies, but nearly every tag
people put in it does, and under GDPR/PECR those need opt-in *before* they fire.
Either configure Google Consent Mode v2 in the container with every storage type
defaulting to `denied` and add a banner that updates it, or hold the snippet
back entirely until a banner is accepted. See the header of `src/lib/analytics.ts`.

## Setting up PostHog

Independent of GTM and gated the same way: no `VITE_POSTHOG_KEY`, no snippet, no
cookies, no request.

1. Create a project at [posthog.com](https://posthog.com) (or an EU-region one).
2. Copy the project API key (`phc_…`) from **Project settings**. Set
   `VITE_POSTHOG_KEY`, and `VITE_POSTHOG_HOST` if the project is not on US Cloud.
   Both are build-time values — a redeploy is required.
3. The snippet is PostHog's own, inlined in `src/lib/analytics.ts` rather than
   pulled in as `posthog-js` — same reasoning as the GTM loader. It autocaptures
   `$pageview` and clicks; a successful signup also sends a `waitlist_join`
   event (no address, no reference — see the call site in `waitlist-form.tsx`).

**Consent applies here too.** The snippet sets cookies out of the box. The same
banner that gates GTM should gate this — `posthog.opt_out_capturing()` by
default, or hold the snippet back until accepted.

**Session replay is off.** The pinned `defaults` date would switch it on; the
snippet passes `disable_session_recording: true` to keep it off until there is a
consent banner. To enable it later, drop that flag in `src/lib/analytics.ts` (or
turn it on in the PostHog project).

## Where a signup goes

**Two places, independently.** A Supabase row (`src/server/store.ts`) is the
durable copy; an email to your inbox via Brevo (`src/server/notify.ts`) is how a
person hears about it and replies — the notification sets `reply_to` to the
joiner, so answering is one keystroke. Either can be left unconfigured, in which
case that half writes to the server log instead. Neither failing fails the
signup (AGENTS.md §6).

### Setting up the database

1. Run the migration once: `supabase db push`, or paste
   `supabase/migrations/*_waitlist.sql` into the project's SQL editor. It
   creates `public.waitlist` with **RLS enabled and no policy** — only the
   `service_role` key writes; the public anon key cannot touch the table.
2. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (Project settings → API)
   in your host's environment. The `service_role` key bypasses RLS — treat it
   like the mail key, never prefix it `VITE_`.
3. Repeat signups upsert on `work_email` and change nothing; a write failure is
   logged at `error` with the full record and the signup still succeeds.

### Setting up the email

1. Create an account at [brevo.com](https://www.brevo.com) — the free tier is
   300 emails/day, permanently, with no card.
2. **Verify the sender first.** Senders, Domains & Dedicated IPs → Senders → add
   `WAITLIST_NOTIFY_FROM`. An unverified sender is accepted by the API and then
   silently not delivered.
3. Create a key under Settings → SMTP & API → API Keys (`xkeysib-…`).
4. Set all three server variables in your host's environment settings.

### Using a different provider

`apiNotifier` in `src/server/notify.ts` is the only provider-shaped code in the
project. Everything else — the form, the server function, the failure policy,
the tests — talks to the `Notifier` interface. Changing vendor means changing an
endpoint, an auth header and a payload builder, and nothing else; the file's
header carries the exact shape for Mailgun, SendGrid, Postmark and Resend.

### Two properties worth knowing

- **A failed send never fails the submission.** From the visitor's side they
  filled in the form correctly; an error screen for a misconfigured mail
  provider would lose the signup *and* insult them. A failure is logged at
  `error` with the full record — address included, because at that point the log
  is the only copy — and they are told they are on the list. Which they are.
- **Nothing is sent to the person who joined.** That is why the success state
  refuses to say "check your inbox". Adding a confirmation is small; promising
  one that does not exist is not. See AGENTS.md §6.

## One thing to resolve before launch

**The fonts are not ours.** `src/fonts/` holds another company's licensed web
fonts. Either license them or swap them; the swap is one `@font-face` block in
`src/styles.css` plus two token lines. See AGENTS.md §7.

## Layout

```text
src/content/site.ts    every word the site renders, in one file
src/components/        one file per section
src/lib/               waitlist schema, spam heuristic, seo, cn
src/server/            the one server function
src/styles.css         tokens, type scale, the light and inverted scopes
```
#   i n c i l l u m - u p c o m i n g 
 
 