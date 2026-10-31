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
 * **A failed write must never fail the submission** — the same rule the mailer
 * follows, for the same reason (AGENTS.md §6). The caller runs this in its own
 * try/catch, logs the full record at `error` on failure, and returns success.
 * A signup that reached the server is on the list whether or not both rows got
 * written.
 */

export interface WaitlistStore {
  // Property style, not method shorthand — see the note on `Notifier` in
  // `notify.ts` for why (bivariant method-signature checking).
  save: (record: WaitlistNotification) => Promise<void>
}

/** PostgREST table path. `on_conflict` names the column the upsert dedupes on. */
const REST_PATH = '/rest/v1/waitlist?on_conflict=work_email'
const SUBMISSIONS_PATH = '/rest/v1/waitlist_submissions'

/**
 * The no-op store, used whenever Supabase is not configured.
 *
 * Logs the same record it would have written, at `info`, so local development,
 * the end-to-end suite and any preview deployment exercise the whole signup
 * path without a database — and so nothing is lost if production is deployed
 * before the keys are set. A fallback, not a silent failure: the record is
 * always somewhere.
 */
const loggingStore: WaitlistStore = {
  save: (record) => {
    console.info('[waitlist] not persisted — store unconfigured', record)
    return Promise.resolve()
  },
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
 * return=minimal` skips the echoed row; `resolution=ignore-duplicates` keeps
 * the contact list at one row per address.
 */
function httpStore(url: string, key: string): WaitlistStore {
  const write = async (
    path: string,
    payload: Record<string, string | null>,
    prefer: string,
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
      throw new Error(`Supabase responded ${response.status}: ${detail}`)
    }
  }

  return {
    save: async (record) => {
      const results = await Promise.allSettled([
        // The first table remains a unique-email contact list. The second is an
        // append-only record of every accepted submission, including repeats.
        write(
          REST_PATH,
          contactRow(record),
          'return=minimal,resolution=ignore-duplicates',
        ),
        write(SUBMISSIONS_PATH, submissionRow(record), 'return=minimal'),
      ])
      const failures = results.flatMap((result): Error[] => {
        if (result.status !== 'rejected') return []

        const reason: unknown = result.reason
        return [reason instanceof Error ? reason : new Error(String(reason))]
      })

      if (failures.length > 0) {
        const detail = failures
          .map((failure) =>
            failure instanceof Error ? failure.message : String(failure),
          )
          .join('; ')
        throw new AggregateError(failures, detail)
      }
    },
  }
}

/**
 * The store for the current configuration.
 *
 * Both values are required together. A URL with no key, or a key with no URL,
 * is a half-finished setup — it falls back to logging rather than throwing on
 * the first signup after a deploy.
 */
export function waitlistStore(): WaitlistStore {
  const { SUPABASE_URL, SUPABASE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY } = serverEnv()
  const key = SUPABASE_SECRET_KEY ?? SUPABASE_SERVICE_ROLE_KEY

  if (!SUPABASE_URL || !key) {
    return loggingStore
  }

  return httpStore(SUPABASE_URL.replace(/\/$/, ''), key)
}
