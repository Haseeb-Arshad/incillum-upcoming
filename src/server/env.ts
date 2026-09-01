import { z } from 'zod'

/**
 * Server-only configuration.
 *
 * ── Why this is a separate file from `src/env.ts` ──────────────────────────
 *
 * Everything in `src/env.ts` is read through `import.meta.env` and is inlined
 * into the browser bundle by Vite. Putting an API key there would publish it in
 * the page source of every visit — not leak it, *publish* it — and the mistake
 * is invisible in review because the code looks identical.
 *
 * This module reads `process.env` instead. It must never be imported from a
 * component, a route, or anything under `src/lib/` that a component can reach:
 * a single client import would pull it into the client graph. It has exactly
 * one importer, `server/notify.ts`, and that is the whole design.
 *
 * ── Why it is read lazily ──────────────────────────────────────────────────
 *
 * `src/env.ts` validates at module evaluation on purpose: a missing site URL
 * should fail the deployment at boot rather than serve broken canonicals. The
 * opposite is true here. Email is optional — the site is fully functional
 * without it, and a build that refused to start until somebody had an API key
 * would make local development harder for no safety gained. So this is read on
 * first use and cached, and the absence of a key is a supported state rather
 * than an error.
 */

const serverEnvSchema = z.object({
  /**
   * Brevo API key. Absent means notifications are logged rather than sent.
   *
   * Named for the provider rather than something neutral like `MAIL_API_KEY`,
   * because a key whose name does not say where it came from is a key nobody
   * can rotate confidently a year later. If the provider changes, this renames
   * with it — see the swap table in `server/notify.ts`.
   */
  BREVO_API_KEY: z.string().min(1).optional(),
  /**
   * Where waitlist notifications are delivered — your inbox, not the joiner's.
   * Provider-neutral: this one survives a change of vendor.
   */
  WAITLIST_NOTIFY_TO: z.email().optional(),
  /**
   * The From address. It has to be a sender verified with the provider; an
   * unverified sender is typically accepted by the API and then silently not
   * delivered, which is the worst failure shape available.
   */
  WAITLIST_NOTIFY_FROM: z.email().optional(),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>

let cached: ServerEnv | null = null

export function serverEnv(): ServerEnv {
  if (cached) return cached

  const result = serverEnvSchema.safeParse({
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    WAITLIST_NOTIFY_TO: process.env.WAITLIST_NOTIFY_TO,
    WAITLIST_NOTIFY_FROM: process.env.WAITLIST_NOTIFY_FROM,
  })

  if (!result.success) {
    /**
     * A malformed value is a real misconfiguration and is worth shouting about
     * — but it must not take the site down. A visitor trying to join a waitlist
     * should not get a 500 because somebody typed the From address wrong; they
     * should join, and the record should end up in the log where it can be
     * recovered.
     */
    console.error(
      '[env] server configuration is invalid, notifications are disabled:',
      result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    )
    cached = {}
    return cached
  }

  cached = result.data
  return cached
}
