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
 * anything — evaluates the spam signals, stores the record, then notifies us.
 *
 * ── Where a signup actually goes ───────────────────────────────────────────
 *
 * Supabase via `server/store.ts` keeps the unique contact and each accepted
 * submission. A successful receipt requires both writes to complete. The email
 * via `server/notify.ts` is independent: a failed or unconfigured mail provider
 * is logged, but does not undo a saved signup (AGENTS.md §6).
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
      sourcePath: data.sourcePath ?? 'unknown',
      referrerHost: data.referrerHost ?? null,
      utmSource: data.utmSource ?? null,
      utmMedium: data.utmMedium ?? null,
      utmCampaign: data.utmCampaign ?? null,
      receivedAt: new Date().toISOString(),
    }

    try {
      await waitlistStore().save(notification)
    } catch (error) {
      console.error('[waitlist] PERSIST FAILED', {
        reference,
        error: error instanceof Error ? error.message : String(error),
      })
      // The form must not claim a durable save that did not happen. Send a
      // provider-neutral error to the browser, never the database response.
      throw new Error('Waitlist submission could not be saved')
    }

    try {
      await waitlistNotifier().send(notification)
    } catch (error) {
      console.error('[waitlist] NOTIFICATION FAILED — record follows', {
        error,
        notification,
      })
    }

    /**
     * The durable write has succeeded. The email may be unavailable, but that
     * does not undo the saved signup. This is the "a real person joined"
     * marker with the two answers worth counting; the address stays out of it.
     */
    console.info('[waitlist] joined', {
      reference,
      commercialWork: notification.commercialWork,
      quoteVolume: notification.quoteVolume,
      emailDomain: data.workEmail.split('@')[1] ?? 'unknown',
    })

    return { status: 'joined', reference }
  })
