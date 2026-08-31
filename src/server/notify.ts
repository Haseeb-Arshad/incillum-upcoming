import { serverEnv } from '#/server/env.ts'

/**
 * Waitlist notification.
 *
 * ── What this is for ───────────────────────────────────────────────────────
 *
 * Until there is a real store, this **is** the store. Somebody joins the
 * waitlist and the record arrives in an inbox, where it can be read, replied to
 * and searched. That is a legitimate system of record for a pre-launch list of
 * a few hundred, and it is a far better position than the log line it replaces.
 *
 * The mail goes to *us*, not to the person who joined. Nothing confirms a
 * signup to the joiner, which is exactly why the success state on the form
 * still refuses to say "check your inbox" — see `waitlist-form.tsx`. Sending a
 * confirmation is a small addition; promising one before it exists is not.
 *
 * ── Why `fetch` and not the `resend` package ───────────────────────────────
 *
 * One POST to one documented endpoint. The SDK is a dependency, a version to
 * keep current and a bundle in the server output, in exchange for wrapping a
 * `fetch` call in a class. If the provider ever changes, the interface below is
 * the seam — not the package.
 *
 * ── Failure policy, which is the important part ────────────────────────────
 *
 * **A failed send must never fail the submission.** From the visitor's side
 * they filled in a form correctly; showing them an error for our misconfigured
 * mail provider would lose the signup *and* insult them. So a failure is logged
 * at error level with the full record — deliberately including the address,
 * because at that point the log is the only copy left — and the caller carries
 * on.
 *
 * That is a considered trade: it puts an email address in a server log on the
 * failure path only, in exchange for never silently dropping somebody who asked
 * to be contacted. It stops being the right trade the day a real store exists,
 * and this comment is the note to revisit it then.
 */

export interface WaitlistNotification {
  reference: string
  workEmail: string
  firstWorkflow: string
  /** ISO 8601, stamped on the server so every record is in one timezone. */
  receivedAt: string
}

export interface Notifier {
  // Property style, not method shorthand: method signatures are checked
  // bivariantly, so an implementation could accept a narrower argument than the
  // interface promises and still type-check.
  send: (notification: WaitlistNotification) => Promise<void>
}

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

/**
 * Plain text, not HTML.
 *
 * This is an operational notification read by one person, not a newsletter. A
 * plain body threads properly in every client, is searchable, never trips a
 * spam filter on its markup, and cannot render an address wrong.
 */
function body(notification: WaitlistNotification): string {
  return [
    `Reference    ${notification.reference}`,
    `Email        ${notification.workEmail}`,
    `First job    ${notification.firstWorkflow}`,
    `Received     ${notification.receivedAt}`,
    '',
    'Reply directly to this message to reach them.',
  ].join('\n')
}

/**
 * The no-op notifier, used whenever the provider is not configured.
 *
 * It logs the same record it would have sent, at `info`, so local development
 * and preview deployments still show the full path working without needing an
 * API key — and so nothing is lost if production is deployed before the key is
 * set. It is a fallback, not a silent failure: the record is always somewhere.
 */
const loggingNotifier: Notifier = {
  send: (notification) => {
    console.info('[waitlist] notification not sent — provider unconfigured', notification)
    return Promise.resolve()
  },
}

function resendNotifier(apiKey: string, to: string, from: string): Notifier {
  return {
    send: async (notification) => {
      const response = await fetch(RESEND_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          /**
           * Replies go to the person who joined, so answering somebody is one
           * keystroke rather than a copy-paste out of the body.
           */
          reply_to: notification.workEmail,
          subject: `Waitlist — ${notification.workEmail}`,
          text: body(notification),
        }),
      })

      if (!response.ok) {
        // Read the body before throwing: Resend explains refusals (unverified
        // domain, bad key) in it, and a bare status code sends whoever is
        // debugging this to the dashboard for no reason.
        const detail = await response.text().catch(() => '<unreadable>')
        throw new Error(`Resend responded ${response.status}: ${detail}`)
      }
    },
  }
}

/**
 * The notifier for the current configuration.
 *
 * All three values are required together. Having a key but no destination is a
 * half-finished setup, and quietly sending to a default would be worse than
 * doing nothing — so it falls back to logging and says which piece is missing.
 */
export function waitlistNotifier(): Notifier {
  const { RESEND_API_KEY, WAITLIST_NOTIFY_TO, WAITLIST_NOTIFY_FROM } = serverEnv()

  if (!RESEND_API_KEY || !WAITLIST_NOTIFY_TO || !WAITLIST_NOTIFY_FROM) {
    return loggingNotifier
  }

  return resendNotifier(RESEND_API_KEY, WAITLIST_NOTIFY_TO, WAITLIST_NOTIFY_FROM)
}
