import { serverEnv } from '#/server/env.ts'

import type { WaitlistNotification } from '#/server/notify.ts'

/**
 * Waitlist store.
 *
 * ── What this is for ───────────────────────────────────────────────────────
 *
 * The durable copy of a signup. It sits *beside* the notifier in
 * `server/waitlist.ts` rather than replacing it — the mail is still how a
 * person hears about a signup and replies to it; this is the row that is still
 * there in six months when the inbox has been archived.
 *
 * ── The provider is Supabase, over its REST endpoint ───────────────────────
 *
 * PostgREST exposes every table at `POST /rest/v1/<table>`. That is one
 * documented HTTP call, and it is deliberately used here instead of
 * `@supabase/supabase-js`: the SDK is that call wrapped in a client, plus a
 * dependency, plus a realtime/auth/storage surface this project does not have,
 * plus a bundle in the server output. AGENTS.md §3 — a dependency needs a
 * reason written into the file that needs it, and "one POST" is not one.
 *
 * ── The key ────────────────────────────────────────────────────────────────
 *
 * `SUPABASE_SERVICE_ROLE_KEY`, read from `server/env.ts`, which is never
 * inlined into the browser bundle. It bypasses RLS, which is why the write
 * runs here on the server and behind the same spam screen as the mail — never
 * from the client with the public `sb_publishable_…` key. The migration in
 * `supabase/migrations/` enables RLS with no policy, so the publishable key
 * cannot reach this table at all.
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
 * A signup that reached the server is on the list whether or not this row got
 * written.
 */

export interface WaitlistStore {
  // Property style, not method shorthand — see the note on `Notifier` in
  // `notify.ts` for why (bivariant method-signature checking).
  save: (record: WaitlistNotification) => Promise<void>
}

/** PostgREST table path. `on_conflict` names the column the upsert dedupes on. */
const REST_PATH = '/rest/v1/waitlist?on_conflict=work_email'

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
function row(record: WaitlistNotification): Record<string, string> {
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

/**
 * The provider call.
 *
 * `apikey` *and* `Authorization: Bearer` both carry the key — PostgREST wants
 * the first, the Supabase gateway in front of it wants the second, and sending
 * only one is a 401 with no other symptom. `Prefer: return=minimal` skips the
 * echoed row; `resolution=ignore-duplicates` turns a repeat signup into a
 * no-op instead of a 409.
 */
function httpStore(url: string, key: string): WaitlistStore {
  return {
    save: async (record) => {
      const response = await fetch(`${url}${REST_PATH}`, {
        method: 'POST',
        headers: {
          apikey: key,
          authorization: `Bearer ${key}`,
          'content-type': 'application/json',
          prefer: 'return=minimal,resolution=ignore-duplicates',
        },
        body: JSON.stringify(row(record)),
      })

      if (!response.ok) {
        // Read the body before throwing: PostgREST explains refusals (missing
        // table, RLS denial, bad key) in it, and a bare status sends whoever is
        // debugging this to a dashboard for no reason.
        const detail = await response.text().catch(() => '<unreadable>')
        throw new Error(`Supabase responded ${response.status}: ${detail}`)
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
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = serverEnv()

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return loggingStore
  }

  return httpStore(SUPABASE_URL.replace(/\/$/, ''), SUPABASE_SERVICE_ROLE_KEY)
}
