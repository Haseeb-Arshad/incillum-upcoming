# Incillum

The pre-launch site for **incillum.com**.

Its argument is _the unattended hours_: commercial work keeps mattering after
the people carrying it have gone home. One page, one invented quotation, told
in eight acts: the night plate and a form that asks for one email address; the
night played on one sheet; the six documents the quotation is made of; four tabs
that each end where the software stops; what is built; what is promised about
the data; the questions a buyer asks; and the morning.

The page opens in the night and returns to paper at 08:04, where a person picks
the work back up. That band is the design, and the honest substitutes for logo
walls, metrics, testimonials and certification badges are the rest of it; read
[AGENTS.md](AGENTS.md) §4 and §5 before changing anything.

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
pnpm test:e2e       # playwright, four viewports, against the production build
                    # (landmarks, claims, the film, the tabs, trust, the form)
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

| Variable             | Default                    | Used for                                                              |
| -------------------- | -------------------------- | --------------------------------------------------------------------- |
| `VITE_SITE_URL`      | `http://localhost:3200`    | canonical URL, Open Graph, sitemap                                    |
| `VITE_CONTACT_EMAIL` | `hello@incillum.com`       | the address in the colophon                                           |
| `VITE_GTM_ID`        | _(unset)_                  | Google Tag Manager container. Unset = no banner or analytics requests |
| `VITE_POSTHOG_KEY`   | _(unset)_                  | PostHog project API key (`phc_…`). Unset = no banner or requests      |
| `VITE_POSTHOG_HOST`  | `https://us.i.posthog.com` | PostHog ingestion host — set for an EU project or a proxy             |

### Server only — `src/server/env.ts`

| Variable                    | Used for                                                                                 |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| `BREVO_API_KEY`             | sending waitlist notifications                                                           |
| `WAITLIST_NOTIFY_TO`        | the inbox signups arrive in — yours, not the joiner's                                    |
| `WAITLIST_NOTIFY_FROM`      | the From address; **must** be a Brevo-verified sender                                    |
| `SUPABASE_URL`              | Supabase project URL — the durable copy of each signup                                   |
| `SUPABASE_SECRET_KEY`       | preferred `sb_secret_…` key; bypasses RLS, so **server-only**, never the publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | legacy JWT key, supported when `SUPABASE_SECRET_KEY` is unset                            |

The three Brevo values are needed together. Supabase needs `SUPABASE_URL` and
either `SUPABASE_SECRET_KEY` or the legacy `SUPABASE_SERVICE_ROLE_KEY`. With a
group missing, that half falls back to the server log — nothing breaks, the
record just lands somewhere less convenient. The two halves are independent:
email can be configured without the database and vice versa.

The `waitlist` table keeps one contact row per email. `waitlist_submissions`
keeps each accepted form submission, including repeats, with the server receipt
time, the page path, the referrer host, and any `utm_source`, `utm_medium`, and
`utm_campaign` values. It does not store the full page URL, query string,
cookies, IP address, or user agent. The form currently collects company, role,
commercial work, quote volume, ERP, and the stated pain; it does not collect
order or RFQ line details.

## Setting up Google Tag Manager

1. Create a container at [tagmanager.google.com](https://tagmanager.google.com)
   — choose **Web**. You get an ID like `GTM-ABC1234`.
2. Set `VITE_GTM_ID` to that ID in your host's environment settings and redeploy.
   It is a build-time value, so a redeploy is required; changing it in a
   dashboard without rebuilding does nothing.
3. Confirm it with GTM's **Preview** button, which opens the site with Tag
   Assistant attached. You should see the container connect after analytics is
   allowed.

### The conversion event

A successful signup pushes `waitlist_join` to the `dataLayer`, with the public
page path as `source_path`.

To use it: **Triggers → New → Custom Event**, event name `waitlist_join`, then
point whatever tag you care about at it — a GA4 event, an Ads conversion, a
LinkedIn Insight conversion.

**No email address and no reference are pushed**, deliberately. Everything in
`dataLayer` is readable by every tag in the container and forwarded to whichever
vendors are configured there, and a work email address in an analytics product
is a data problem nobody signed up for.

### Consent

The site holds GTM until a visitor allows analytics. It sends Google Consent
Mode defaults as denied before loading the container, then grants analytics
storage on acceptance. Advertising storage, personalization and advertising
user data remain denied. The privacy settings control is available from each
public footer.

## Setting up PostHog

Independent of GTM and gated the same way: no `VITE_POSTHOG_KEY`, no consent
panel and no analytics request.

1. Create a project at [posthog.com](https://posthog.com) (or an EU-region one).
2. Copy the project API key (`phc_…`) from **Project settings**. Set
   `VITE_POSTHOG_KEY`, and `VITE_POSTHOG_HOST` if the project is not on US Cloud.
   Both are build-time values — a redeploy is required.
3. The official PostHog browser snippet is loaded after opt-in. It captures SPA
   page views and page leaves, clicks, dead and rage clicks, heatmaps, web
   vitals, exceptions, and session replays. It is ready to use PostHog surveys,
   feature flags, and experiments configured in the PostHog project.

Session replay is enabled after consent. All input values and all text inside
the waitlist forms and success receipts are masked. The forms are excluded from
autocapture, and signup events do not send addresses, company details, or form
answers. Replay network bodies and headers are disabled, query strings are
removed from captured URLs, and the private brief and labs are excluded.

The `Privacy settings` control in each public footer can revoke consent. That
stops recording and capture in the current browser and updates GTM consent.

## Where a signup goes

**Two places, independently.** A Supabase row (`src/server/store.ts`) is the
durable copy; an email to your inbox via Brevo (`src/server/notify.ts`) is how a
person hears about it and replies — the notification sets `reply_to` to the
joiner, so answering is one keystroke. Either can be left unconfigured, in which
case that half writes to the server log instead. Neither failing fails the
signup (AGENTS.md §6).

### Setting up the database

1. Run `supabase/manual_waitlist_setup.sql` in the project's SQL Editor, or use
   `supabase db push` with the ordered migration files. The setup creates
   `public.waitlist` and `public.waitlist_submissions`, enables RLS, and grants
   the server role insert-only access. Browser roles receive no access.
2. Set `SUPABASE_URL` and either `SUPABASE_SECRET_KEY` or the legacy
   `SUPABASE_SERVICE_ROLE_KEY` in the host environment. These server keys bypass
   RLS; never prefix them `VITE_`.
3. The contact table upserts on `work_email`; the submissions table keeps each
   accepted signup. A write failure is logged at `error` with the full record
   and the signup still succeeds.

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
  provider would lose the signup _and_ insult them. A failure is logged at
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

#
