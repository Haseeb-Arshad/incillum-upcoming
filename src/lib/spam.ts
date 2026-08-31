/**
 * Spam protection, as an abstraction.
 *
 * Deliberately no third-party service. A CAPTCHA on a two-field waitlist costs
 * real prospects more than it costs bots, and adds a cross-origin script to a
 * page whose whole argument is that it is fast and quiet. Instead: two signals
 * that are free and invisible, behind an interface, so swapping in a hosted
 * service later is a one-file change.
 *
 * Both signals are evaluated on the server. A signal a client can skip is not a
 * control.
 */

export interface SpamSignals {
  /** Value of the hidden honeypot input. A human never fills this in. */
  honeypot: string
  /** Epoch milliseconds when the form was rendered in the browser. */
  renderedAt: number
  /** Epoch milliseconds when the submission reached the server. */
  submittedAt: number
}

export interface SpamVerdict {
  allowed: boolean
  /** Internal reason. Logged, never shown to the visitor. */
  reason?: 'honeypot' | 'too-fast' | 'stale' | 'future-timestamp'
}

export interface SpamProtection {
  /**
   * Property style, not method shorthand: method signatures are checked
   * bivariantly, so an implementation could accept a narrower `signals` than
   * the interface promises and still type-check.
   */
  evaluate: (signals: SpamSignals) => SpamVerdict
}

/**
 * Two seconds, not the three a long qualification form can assume. This form is
 * one field, a real person can complete it quickly, and a threshold that
 * rejects a fast typist is worse than one that lets a slow bot through.
 */
const MINIMUM_FILL_MS = 2_000

/** A form open for more than a day is a stale tab or a replayed payload. */
const MAXIMUM_FORM_AGE_MS = 24 * 60 * 60 * 1_000

export const heuristicSpamProtection: SpamProtection = {
  evaluate({ honeypot, renderedAt, submittedAt }) {
    if (honeypot.trim().length > 0) {
      return { allowed: false, reason: 'honeypot' }
    }

    const elapsed = submittedAt - renderedAt

    if (elapsed < 0) {
      // Clock skew or a hand-crafted payload. Either way the pair is untrusted.
      return { allowed: false, reason: 'future-timestamp' }
    }
    if (elapsed < MINIMUM_FILL_MS) {
      return { allowed: false, reason: 'too-fast' }
    }
    if (elapsed > MAXIMUM_FORM_AGE_MS) {
      return { allowed: false, reason: 'stale' }
    }

    return { allowed: true }
  },
}

/**
 * Human-quotable submission reference.
 *
 * `PREFIX-<base36 millisecond stamp>-<base36 noise>`. The stamp makes
 * references sort chronologically and lets support see roughly when something
 * arrived without a lookup; the noise only keeps two submissions in the same
 * millisecond from colliding in an inbox.
 *
 * It is **not** a security token: it is `Math.random`, it is short, and nothing
 * is ever authorised by it. Server-only — `Date.now()` on the client would be
 * the visitor's clock.
 */
export function createReference(prefix: string): string {
  const stamp = Date.now().toString(36).toUpperCase()
  const noise = Math.floor(Math.random() * 36 ** 3)
    .toString(36)
    .toUpperCase()
    .padStart(3, '0')
  return `${prefix}-${stamp}-${noise}`
}
