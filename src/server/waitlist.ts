import { createServerFn } from '@tanstack/react-start'

import { createReference, heuristicSpamProtection } from '#/lib/spam.ts'
import { waitlistSchema } from '#/lib/waitlist.ts'

import type { WaitlistResult } from '#/lib/waitlist.ts'

/**
 * Waitlist submission.
 *
 * Runs on the server only. It re-validates the payload with the same schema the
 * browser used — the client check exists to give fast feedback, not to decide
 * anything — evaluates the spam signals, and records the request.
 *
 * NOTE FOR THE NEXT ENGINEER: there is no mailing list, no CRM and no backend
 * wired up yet, so a successful submission is written to the server log and
 * nothing else. Replacing the `console.info` below is the whole of the
 * remaining work; the validation, the verdict and the reference are not
 * scaffolding, and the shape of this handler should not change when a real
 * store arrives.
 *
 * Until that lands, **the page must not promise more than a log file can
 * keep.** The success state says we have the address and will write once; it
 * never says "check your inbox", because nothing sends a confirmation.
 */
export const joinWaitlist = createServerFn({ method: 'POST' })
  .validator((input: unknown) => waitlistSchema.parse(input))
  /**
   * Not `async`. There is nothing to await yet — the whole handler is
   * synchronous validation plus a log line — and an `async` keyword with no
   * `await` under it advertises I/O that is not happening. It becomes `async`
   * the day a real store is called, and that diff will be the honest signal
   * that the handler started doing something.
   */
  .handler(({ data }): WaitlistResult => {
    const verdict = heuristicSpamProtection.evaluate({
      honeypot: data.companyWebsite ?? '',
      renderedAt: data.renderedAt,
      submittedAt: Date.now(),
    })

    if (!verdict.allowed) {
      /**
       * A rejected submission gets the same response shape a real one does.
       * Telling a bot which signal caught it is free tuning information, and a
       * false positive on a real person is better handled by them emailing us
       * than by an accusatory error on a one-field form.
       */
      console.warn('[waitlist] rejected', { reason: verdict.reason })
      return { status: 'joined', reference: createReference('IC') }
    }

    const reference = createReference('IC')

    console.info('[waitlist] request received', {
      reference,
      firstWorkflow: data.firstWorkflow ?? 'not answered',
      /**
       * The address is the only directly identifying field on this form and the
       * log is not the system of record, so only the domain is written. It is
       * also the useful half before there is a real store: it says which
       * companies are asking.
       */
      emailDomain: data.workEmail.split('@')[1] ?? 'unknown',
    })

    return { status: 'joined', reference }
  })
