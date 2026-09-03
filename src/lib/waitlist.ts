import { z } from 'zod'

/**
 * The waitlist contract.
 *
 * Shared verbatim between the browser form and the server function. Two copies
 * of a validation rule are two rules, and the second one is always the one that
 * is wrong — so this module is the only definition, and the server re-runs it
 * because a client-side check is a convenience, never a guarantee.
 *
 * ── One required field, seven optional ones ────────────────────────────────
 *
 * The site is looking for a small number of design partners rather than a
 * mailing list, and the difference shows up in what has to be known about
 * somebody before they are worth a call: what they quote, how much of it, what
 * it has to land in, and which part of it hurts.
 *
 * Every one of those is optional and there is a test that fails if any of them
 * stops being. The form asks for an address first and reveals the rest only
 * after that address is settled — see `components/waitlist-form.tsx` — so the
 * seven questions are never in front of somebody who has not yet decided to
 * answer the one. A form that asks eight questions before it has an address
 * collects fewer addresses *and* fewer answers.
 */

/**
 * Free-mail domains are rejected with an explanation rather than silently.
 *
 * The list is for operating teams, so a personal address is usually somebody in
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
 * The kinds of commercial work the first build is aimed at.
 *
 * These are the sectors named nowhere on the rendered page, and this is why:
 * printing eight industry labels in the copy makes a pre-launch site read as a
 * net cast wide, while asking the same question on a form reads as a company
 * that knows who it is building for. The answer is also the only one of these
 * fields worth measuring in aggregate — it says which vertical the first ten
 * conversations should come from.
 *
 * Ordered by how close the quoting problem is to the centre of the business
 * rather than alphabetically, so somebody scanning for themselves finds it
 * near the top if this site is addressed to them at all.
 */
export const commercialWork = [
  'Industrial distribution',
  'Electronics and components',
  'Electrical distribution',
  'Industrial equipment and machinery',
  'Engineered or made-to-order products',
  'Contract manufacturing',
  'Specialised B2B distribution',
  'Value-added reseller or systems integrator',
  'Something else',
] as const

/**
 * Volume bands rather than a number.
 *
 * A free number field gets "lots", "~200ish" and "300+" in roughly equal
 * measure, none of which can be counted. Bands can be, and the boundaries are
 * placed where the nature of the problem changes: under fifty a month is a
 * person's job, over a thousand is a system's.
 */
export const quoteVolumes = [
  'Under 50 a month',
  '50 to 200 a month',
  '200 to 1,000 a month',
  'Over 1,000 a month',
] as const

export const waitlistSchema = z.object({
  workEmail: z
    .string()
    .trim()
    .min(1, 'Enter an email address so we can write back.')
    .pipe(z.email('That does not look like a valid email address.'))
    .refine(
      isWorkEmail,
      'Use your work email address — the list is for operating teams rather than individuals.',
    ),

  commercialWork: z
    .union([z.enum(commercialWork), z.literal('')])
    .optional()
    .transform((value) => (value === '' ? undefined : value)),

  quoteVolume: z
    .union([z.enum(quoteVolumes), z.literal('')])
    .optional()
    .transform((value) => (value === '' ? undefined : value)),

  /**
   * The three free-text answers.
   *
   * Capped, and trimmed to `undefined` when empty, so the notification never
   * carries a field that says nothing and the mail body stays readable. The
   * caps are generous enough that nobody legitimate hits them and small enough
   * that the endpoint cannot be used to post an essay at us.
   */
  company: z.string().trim().max(120).optional().transform((value) => value || undefined),
  role: z.string().trim().max(120).optional().transform((value) => value || undefined),
  erp: z.string().trim().max(120).optional().transform((value) => value || undefined),
  pain: z.string().trim().max(1_000).optional().transform((value) => value || undefined),

  companyWebsite: z.string().max(0).optional(),
  renderedAt: z.number().int().nonnegative(),
})

export type WaitlistFormValues = z.input<typeof waitlistSchema>

export interface WaitlistResult {
  status: 'joined'
  reference: string
}
