import { z } from 'zod'

/**
 * The waitlist contract.
 *
 * Shared verbatim between the browser form and the server function. Two copies
 * of a validation rule are two rules, and the second one is always the one that
 * is wrong — so this module is the only definition, and the server re-runs it
 * because a client-side check is a convenience, never a guarantee.
 *
 * One required question and one optional one. This is asked at the moment
 * somebody has decided they are interested and before they have decided they
 * are committed, and every extra required field spends that moment. The
 * optional question earns its place because the answer changes what gets built
 * first — not because it makes the form look substantial.
 */

/**
 * Free-mail domains are rejected with an explanation rather than silently.
 *
 * The list is for finance teams, so a personal address is usually somebody in
 * the wrong place — and they deserve to be told why rather than left staring at
 * a field that will not accept them. The rule survived the site going public:
 * it is not a gate on who may join, it is what makes the list worth having.
 */
const freeEmailDomains = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'aol.com',
  'icloud.com',
  'me.com',
  'proton.me',
  'protonmail.com',
  'mail.com',
  'gmx.com',
  'yandex.com',
])

export function isWorkEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase().trim()
  if (!domain) return false
  return !freeEmailDomains.has(domain)
}

/**
 * The finance workflows the operator is being built around.
 *
 * Ordered the way the work actually runs — a document arrives, it is coded, it
 * is matched, it breaks, it gets paid, and then somebody has to close the month
 * on top of all of it — rather than alphabetically. Someone scanning for their
 * own job finds it faster in the order their day happens.
 */
export const financeWorkflows = [
  'Invoice intake and coding',
  'Three-way match and PO exceptions',
  'Supplier queries and chasing',
  'Payment runs and approvals',
  'Expense and card reconciliation',
  'Bank and account reconciliation',
  'Month-end close preparation',
  'Collections and cash application',
  'Something else',
] as const

export const waitlistSchema = z.object({
  workEmail: z
    .string()
    .trim()
    .min(1, 'Enter an email address so we can write back.')
    .pipe(z.email('That does not look like a valid email address.'))
    .refine(
      isWorkEmail,
      'Use your work email address — the list is for finance teams rather than individuals.',
    ),

  /**
   * Optional, and it has to stay optional.
   *
   * `z.literal('')` is what lets an untouched native `<select>` submit its
   * placeholder without failing validation; `.transform` then collapses that to
   * `undefined` so the server never has to distinguish "empty string" from "not
   * answered".
   */
  firstWorkflow: z
    .union([z.enum(financeWorkflows), z.literal('')])
    .optional()
    .transform((value) => (value === '' ? undefined : value)),

  /** Spam signals. Never shown to a human, never rendered back, checked server-side. */
  companyWebsite: z.string().max(0).optional(),
  renderedAt: z.number().int().nonnegative(),
})

/**
 * The form's value type comes from the *input* side of the schema, because
 * `firstWorkflow` is transformed: React Hook Form holds what the `<select>`
 * produces (`''` before anybody touches it) while the handler receives what the
 * schema produces (`undefined`). Typing the form with the output type would
 * make the empty default a type error and invite somebody to "fix" it by making
 * the field required.
 */
export type WaitlistFormValues = z.input<typeof waitlistSchema>

export interface WaitlistResult {
  status: 'joined'
  /** Short reference the visitor can quote back to us. */
  reference: string
}
