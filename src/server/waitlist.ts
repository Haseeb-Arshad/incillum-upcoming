import { createServerFn } from '@tanstack/react-start'

import { createReference, heuristicSpamProtection } from '#/lib/spam.ts'
import { waitlistSchema } from '#/lib/waitlist.ts'
import { waitlistNotifier } from '#/server/notify.ts'

import type { WaitlistResult } from '#/lib/waitlist.ts'

/**
 * Waitlist submission.
 *
 * Runs on the server only. It re-validates the payload with the same schema the
 * browser used — the client check exists to give fast feedback, not to decide
 * anything — evaluates the spam signals, and delivers the record.
 *
 * ── Where a signup actually goes ───────────────────────────────────────────
 *
 * To an inbox, via `server/notify.ts`. There is still no database, and for a
 * pre-launch list of a few hundred an inbox is a legitimate system of record:
 * readable, searchable, and repliable in one keystroke. When a real store
 * arrives it slots in beside the notifier rather than replacing it.
 *
 * The mail goes to *us*. Nothing is sent to the person who joined, which is why
 * the success state on the form still refuses to say "check your inbox" — see
 * `waitlist-form.tsx`. Sending a confirmation is a small addition; promising
 * one that does not exist is the kind of first impression that is expensive.
 */
export const joinWaitlist = createServerFn({ method: 'POST' })
  .validator((input: unknown) => waitlistSchema.parse(input))
  .handler(async ({ data }): Promise<WaitlistResult> => {
    const verdict = heuristicSpamProtection.evaluate({
      honeypot: data.companyWebsite ?? '',
      renderedAt: data.renderedAt,
      submittedAt: Date.now(),
    })

    if (!verdict.allowed) {
      /**
       * A rejected submission gets the same response shape a real one does, and
       * sends no mail. Telling a bot which signal caught it is free tuning
       * information, and a false positive on a real person is better handled by
       * them emailing us than by an accusatory error on a one-field form.
       */
      console.warn('[waitlist] rejected', { reason: verdict.reason })
      return { status: 'joined', reference: createReference('IC') }
    }

    const reference = createReference('IC')
    const notification = {
      reference,
      workEmail: data.workEmail,
      firstWorkflow: data.firstWorkflow ?? 'not answered',
      receivedAt: new Date().toISOString(),
    }

    try {
      await waitlistNotifier().send(notification)
      console.info('[waitlist] joined', {
        reference,
        firstWorkflow: notification.firstWorkflow,
        // Only the domain on the success path. The address is in the mail that
        // was just delivered, so the log does not need a second copy of it.
        emailDomain: data.workEmail.split('@')[1] ?? 'unknown',
      })
    } catch (error) {
      /**
       * A failed send must never fail the submission.
       *
       * From the visitor's side they filled in the form correctly; an error
       * screen for our misconfigured mail provider would lose the signup *and*
       * insult them. So the full record — address included, because at this
       * point the log is the only copy left — goes to `error`, and they are
       * told they are on the list. Which they are: we have it.
       */
      console.error('[waitlist] NOTIFICATION FAILED — record follows', {
        error,
        notification,
      })
    }

    return { status: 'joined', reference }
  })
