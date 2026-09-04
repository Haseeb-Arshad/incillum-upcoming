import { createServerFn } from '@tanstack/react-start'

import { createReference, heuristicSpamProtection } from '#/lib/spam.ts'
import { waitlistSchema } from '#/lib/waitlist.ts'
import { waitlistNotifier } from '#/server/notify.ts'
import { waitlistStore } from '#/server/store.ts'

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
 * Two places, independently: an inbox via `server/notify.ts`, and a Supabase
 * row via `server/store.ts`. The store is the durable copy; the mail is how a
 * person hears about it and replies. Either can be unconfigured — then that
 * half logs instead — and **neither failing fails the submission** (AGENTS.md
 * §6): a signup that reached this function is on the list regardless.
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
    /**
     * Every optional answer becomes the same literal when it is missing, here
     * rather than in the mail template.
     *
     * The alternative is `??` in eight places inside `notify.ts`, where the one
     * that gets forgotten produces `undefined` in the body of an email to a
     * stranger's colleague. It is also the reason the fields are strings on
     * `WaitlistNotification` rather than optionals: a notifier cannot render a
     * field it was never given.
     */
    const answered = (value: string | undefined) => value ?? 'not answered'

    const notification = {
      reference,
      workEmail: data.workEmail,
      commercialWork: answered(data.commercialWork),
      quoteVolume: answered(data.quoteVolume),
      company: answered(data.company),
      role: answered(data.role),
      erp: answered(data.erp),
      pain: answered(data.pain),
      receivedAt: new Date().toISOString(),
    }

    /**
     * The mail and the row are attempted independently, and a failure in
     * either is logged with the full record — address included, because on the
     * failure path the log may be the only copy left — and then swallowed. A
     * failed delivery or a failed write must never fail the submission: from
     * the visitor's side they filled in the form correctly, and an error screen
     * for our misconfigured backend would lose the signup *and* insult them.
     * See AGENTS.md §6.
     */
    try {
      await waitlistNotifier().send(notification)
    } catch (error) {
      console.error('[waitlist] NOTIFICATION FAILED — record follows', {
        error,
        notification,
      })
    }

    try {
      await waitlistStore().save(notification)
    } catch (error) {
      console.error('[waitlist] PERSIST FAILED — record follows', {
        error,
        notification,
      })
    }

    /**
     * The signup is accepted regardless of what the two calls above did. The
     * outcome of each — delivered, written, fell back to a log line, or failed
     * loudly at `error` — is logged by the notifier and the store themselves;
     * this line is just the "a real person joined" marker with the two answers
     * worth counting. The address is in the mail and the row already, so only
     * its domain is here.
     */
    console.info('[waitlist] joined', {
      reference,
      commercialWork: notification.commercialWork,
      quoteVolume: notification.quoteVolume,
      emailDomain: data.workEmail.split('@')[1] ?? 'unknown',
    })

    return { status: 'joined', reference }
  })
