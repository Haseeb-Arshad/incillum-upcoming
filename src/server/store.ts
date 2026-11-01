import { serverEnv } from '#/server/env.ts'

import type { WaitlistNotification } from '#/server/notify.ts'

/**
 * Waitlist store.
 *
 * ── What this is for ───────────────────────────────────────────────────────
 *
 * The durable copy of a signup. It sits *beside* the notifier in
 * `server/waitlist.ts` rather than replacing it — the mail is still how a
 * person hears about a signup and replies to it. The unique-email list keeps
 * the contact, while the submission table preserves each accepted request.
 *
 * ── The provider is Supabase, over its REST endpoint ───────────────────────
 *
 * PostgREST exposes every table at `POST /rest/v1/<table>`. The two required
 * HTTP calls are deliberately used here instead of `@supabase/supabase-js`:
 * the SDK is those calls wrapped in a client, plus a dependency, plus a
 * realtime/auth/storage surface this project does not have, plus a bundle in
 * the server output. AGENTS.md §3 — a dependency needs a reason written into
 * the file that needs it, and these calls do not need one.
 *
 * ── The key ────────────────────────────────────────────────────────────────
 *
 * `SUPABASE_SECRET_KEY`, or the legacy `SUPABASE_SERVICE_ROLE_KEY`, is read
 * from `server/env.ts` and never inlined into the browser bundle. It bypasses
 * RLS, which is why the write runs here on the server and behind the same spam
 * screen as the mail. The migrations enable RLS with no public policy and
 * grant the server role only INSERT.
 *
 * ── Swapping it ────────────────────────────────────────────────────────────
 *
 * `httpStore` below is the only store-shaped code in the project. Everything
 * else talks to the `WaitlistStore` interface. Another Postgres-over-HTTP
 * backend is an endpoint, an auth header and a row-shape change; a different
 * database is a new `WaitlistStore` implementation and nothing else.
 *
 * ── Failure policy, which is the important part ────────────────────────────
 *
 * A durable Supabase write is required before the form may show success. In
 * local development and preview, an unconfigured store logs the record so the
 * UI can still be exercised. Production fails closed instead of telling a
 * visitor that a request was saved when it was not.
 */

export interface WaitlistStore {
  // Property style, not method shorthand — see the note on `Notifier` in
  // `notify.ts` for why (bivariant method-signature checking).
  save: (record: WaitlistNotification) => Promise<void>
}

/** PostgREST paths. The contact table is insert-only; duplicate emails are handled by the unique constraint. */
const REST_PATH = '/rest/v1/waitlist'
const SUBMISSIONS_PATH = '/rest/v1/waitlist_submissions'

/**
 * The no-op store, used in local development and preview when Supabase is not
 * configured.
 *
 * Logs the same record it would have written, at `info`, so local development,
 * the end-to-end suite and preview deployments can exercise the signup path
 * without a database. Production uses `unconfiguredProductionStore` instead.
 */
const loggingStore: WaitlistStore = {
  save: (record) => {
    console.info('[waitlist] not persisted — store unconfigured', record)
    return Promise.resolve()
  },
}

/** Production must never show a successful receipt without durable storage. */
const unconfiguredProductionStore: WaitlistStore = {
  save: () => Promise.reject(new Error('Supabase waitlist storage is not configured')),
}

/**
 * Column names are snake_case in Postgres and camelCase on the notification, so
 * the mapping is explicit here rather than a clever key transform — the one
 * that gets renamed silently is how a column stops being written.
 */
function contactRow(record: WaitlistNotification): Record<string, string> {
  return {
    reference: record.reference,
    // Lower-cased so the `unique` constraint on `work_email` actually
    // de-duplicates a repeat signup. The mail keeps the address as typed.
    work_email: record.workEmail.toLowerCase(),
    commercial_work: record.commercialWork,
    quote_volume: record.quoteVolume,
    company: record.company,
    role: record.role,
    erp: record.erp,
    pain: record.pain,
    received_at: record.receivedAt,
  }
}

function submissionRow(record: WaitlistNotification): Record<string, string | null> {
  return {
    ...contactRow(record),
    source_path: record.sourcePath,
    referrer_host: record.referrerHost,
    utm_source: record.utmSource,
    utm_medium: record.utmMedium,
    utm_campaign: record.utmCampaign,
  }
}

/**
 * The provider call.
 *
 * `apikey` carries either key type. Legacy JWT keys also use the Authorization
 * header; opaque `sb_secret_` keys must not be sent as bearer tokens. `Prefer:
 * return=minimal` skips the echoed row. The contact table stays insert-only;
 * duplicate emails are recognized from its unique-constraint response.
 */
function isUniqueViolation(detail: string): boolean {
  try {
    return (JSON.parse(detail) as { code?: unknown }).code === '23505'
  } catch {
    return false
  }
}

function httpStore(url: string, key: string): WaitlistStore {
  const write = async (
    path: string,
    payload: Record<string, string | null>,
    prefer: string,
    options?: { ignoreUniqueViolation?: boolean },
  ) => {
    const headers: Record<string, string> = {
      apikey: key,
      'content-type': 'application/json',
      prefer,
    }

    // Opaque secret keys authenticate through `apikey`; they are not JWTs and
    // cannot be used in Authorization. The legacy service_role key is a JWT.
    if (!key.startsWith('sb_secret_')) {
      headers.authorization = `Bearer ${key}`
    }

    const response = await fetch(`${url}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      // Read the body before throwing: PostgREST explains refusals (missing
      // table, RLS denial, bad key) in it, and a bare status sends whoever is
      // debugging this to a dashboard for no reason.
      const detail = await response.text().catch(() => '<unreadable>')
      if (
        options?.ignoreUniqueViolation &&
        response.status === 409 &&
        isUniqueViolation(detail)
      ) {
        return
      }
      throw new Error(`Supabase responded ${response.status}: ${detail}`)
    }
  }

  return {
    save: async (record) => {
      // Keep the contact list insert-only. PostgREST upserts require SELECT,
      // which the database deliberately withholds; a duplicate email is the
      // expected unique constraint violation and means that contact exists.
      await write(REST_PATH, contactRow(record), 'return=minimal', {
        ignoreUniqueViolation: true,
      })

      // Write attribution after the contact is durable. If it fails, the form
      // reports the error and a retry can complete it without duplicating the
      // unique-email contact.
      await write(SUBMISSIONS_PATH, submissionRow(record), 'return=minimal')

      console.info('[waitlist] persisted', {
        reference: record.reference,
        host: new URL(url).host,
      })
    },
  }
}

/**
 * The store for the current configuration.
 *
 * Both values are required together. A URL with no key, or a key with no URL,
 * is a half-finished setup. Local and preview environments log the signup so
 * the UI remains testable; production rejects it rather than claiming it was
 * saved.
 */
export function waitlistStore(): WaitlistStore {
  const {
    SUPABASE_API_URL,
    SUPABASE_URL,
    SUPABASE_SECRET_KEY,
    SUPABASE_SERVICE_ROLE_KEY,
  } = serverEnv()
  const url = SUPABASE_API_URL ?? SUPABASE_URL
  const key = SUPABASE_SECRET_KEY ?? SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return process.env.VERCEL_ENV === 'production'
      ? unconfiguredProductionStore
      : loggingStore
  }

  return httpStore(url.replace(/\/$/, ''), key)
}
