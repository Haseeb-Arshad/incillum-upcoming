import { describe, expect, it } from 'vitest'

import { financeWorkflows, isWorkEmail, waitlistSchema } from '#/lib/waitlist.ts'

/**
 * The waitlist contract.
 *
 * This schema is the only validation the server function runs, so what is
 * asserted here is the actual admission policy for the preview list — not a
 * convenience check sitting in front of one.
 */

const valid = {
  workEmail: 'controller@northwind.co',
  firstWorkflow: 'Three-way match and PO exceptions',
  companyWebsite: '',
  renderedAt: 1_700_000_000_000,
}

describe('isWorkEmail', () => {
  it('accepts a company domain', () => {
    expect(isWorkEmail('ap@northwind-trading.example')).toBe(true)
  })

  it('rejects the common free-mail providers', () => {
    for (const address of ['a@gmail.com', 'b@outlook.com', 'c@icloud.com', 'd@proton.me']) {
      expect(isWorkEmail(address)).toBe(false)
    }
  })

  it('is case-insensitive about the domain', () => {
    expect(isWorkEmail('someone@GMAIL.com')).toBe(false)
  })

  it('rejects a string with no domain rather than throwing', () => {
    expect(isWorkEmail('not-an-address')).toBe(false)
    expect(isWorkEmail('')).toBe(false)
  })
})

describe('waitlistSchema', () => {
  it('accepts a work address with a chosen workflow', () => {
    const result = waitlistSchema.parse(valid)
    expect(result.workEmail).toBe('controller@northwind.co')
    expect(result.firstWorkflow).toBe('Three-way match and PO exceptions')
  })

  it('trims surrounding whitespace from the address', () => {
    expect(waitlistSchema.parse({ ...valid, workEmail: '  ap@acme.io  ' }).workEmail).toBe(
      'ap@acme.io',
    )
  })

  it('rejects a free-mail address, and says why', () => {
    const result = waitlistSchema.safeParse({ ...valid, workEmail: 'someone@gmail.com' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toContain('work email')
  })

  it('rejects a malformed address', () => {
    expect(waitlistSchema.safeParse({ ...valid, workEmail: 'northwind.co' }).success).toBe(
      false,
    )
  })

  it('rejects an empty address with a recoverable message', () => {
    const result = waitlistSchema.safeParse({ ...valid, workEmail: '   ' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe(
      'Enter an email address so we can write back.',
    )
  })

  /**
   * The optional field is the one most likely to be broken by a well-meaning
   * change, because "make the select required" looks like an improvement and is
   * measurable as a regression. Three cases pin it down: the untouched
   * `<select>` value, an omitted key, and the collapse of the first into the
   * second so the server never has to tell them apart.
   */
  it('accepts the untouched select and normalises it away', () => {
    expect(waitlistSchema.parse({ ...valid, firstWorkflow: '' }).firstWorkflow).toBeUndefined()
  })

  it('accepts the field being absent entirely', () => {
    const { firstWorkflow: _omitted, ...withoutWorkflow } = valid
    expect(waitlistSchema.parse(withoutWorkflow).firstWorkflow).toBeUndefined()
  })

  it('rejects a workflow that is not on the list', () => {
    expect(
      waitlistSchema.safeParse({ ...valid, firstWorkflow: 'Anything at all' }).success,
    ).toBe(false)
  })

  it('accepts every workflow the form actually renders', () => {
    for (const workflow of financeWorkflows) {
      expect(waitlistSchema.safeParse({ ...valid, firstWorkflow: workflow }).success).toBe(true)
    }
  })

  /**
   * The honeypot is `max(0)`, not "ignored". A bot that fills it in has to fail
   * validation *before* the spam heuristic sees the payload, so relaxing this to
   * `z.string().optional()` would silently disable half the protection while
   * every other test still passed.
   */
  it('rejects a filled honeypot', () => {
    expect(
      waitlistSchema.safeParse({ ...valid, companyWebsite: 'http://spam.example' }).success,
    ).toBe(false)
  })

  it('requires the timing signal', () => {
    const { renderedAt: _omitted, ...withoutStamp } = valid
    expect(waitlistSchema.safeParse(withoutStamp).success).toBe(false)
    expect(waitlistSchema.safeParse({ ...valid, renderedAt: -1 }).success).toBe(false)
  })

  /**
   * Zero is the value the form carries between server render and the mount
   * effect that sets the real one (see `waitlist-form.tsx`). It has to pass the
   * schema — otherwise the form would be in an invalid state before the visitor
   * had touched anything — and the *timing* judgement is the spam heuristic's
   * job, not the schema's.
   */
  it('accepts the pre-mount zero timestamp', () => {
    expect(waitlistSchema.safeParse({ ...valid, renderedAt: 0 }).success).toBe(true)
  })
})
