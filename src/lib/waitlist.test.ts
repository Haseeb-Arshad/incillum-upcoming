import { describe, expect, it } from 'vitest'

import { commercialWork, isWorkEmail, quoteVolumes, waitlistSchema } from '#/lib/waitlist.ts'

/**
 * The waitlist contract.
 *
 * This schema is the only validation the server function runs, so what is
 * asserted here is the actual admission policy for the preview list — not a
 * convenience check sitting in front of one.
 */

const valid = {
  workEmail: 'controller@northwind.co',
  commercialWork: 'Industrial distribution',
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
  it('accepts a work address with a chosen kind of work', () => {
    const result = waitlistSchema.parse(valid)
    expect(result.workEmail).toBe('controller@northwind.co')
    expect(result.commercialWork).toBe('Industrial distribution')
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
   * Seven optional fields, and every one of them is a candidate for somebody
   * deciding the list would be higher quality if it were required. It would not
   * — it would be shorter, which is a different thing — and the form's whole
   * shape depends on the address being the only thing anybody has to answer.
   *
   * These are the cases that matter: the untouched `<select>` value, an omitted
   * key, and the collapse of the first into the second so the server never has
   * to tell them apart.
   */
  it('accepts the untouched selects and normalises them away', () => {
    const parsed = waitlistSchema.parse({ ...valid, commercialWork: '', quoteVolume: '' })
    expect(parsed.commercialWork).toBeUndefined()
    expect(parsed.quoteVolume).toBeUndefined()
  })

  it('accepts every optional field being absent entirely', () => {
    const { commercialWork: _omitted, ...bare } = valid
    const parsed = waitlistSchema.parse(bare)
    expect(parsed.commercialWork).toBeUndefined()
    expect(parsed.quoteVolume).toBeUndefined()
    expect(parsed.company).toBeUndefined()
    expect(parsed.role).toBeUndefined()
    expect(parsed.erp).toBeUndefined()
    expect(parsed.pain).toBeUndefined()
  })

  it('normalises an empty free-text answer away rather than storing ""', () => {
    const parsed = waitlistSchema.parse({ ...valid, company: '   ', pain: '' })
    expect(parsed.company).toBeUndefined()
    expect(parsed.pain).toBeUndefined()
  })

  it('trims the free-text answers it does keep', () => {
    expect(waitlistSchema.parse({ ...valid, company: '  Northwind  ' }).company).toBe(
      'Northwind',
    )
  })

  it('rejects a kind of work that is not on the list', () => {
    expect(
      waitlistSchema.safeParse({ ...valid, commercialWork: 'Anything at all' }).success,
    ).toBe(false)
  })

  it('accepts every option the form actually renders', () => {
    for (const kind of commercialWork) {
      expect(waitlistSchema.safeParse({ ...valid, commercialWork: kind }).success).toBe(true)
    }
    for (const band of quoteVolumes) {
      expect(waitlistSchema.safeParse({ ...valid, quoteVolume: band }).success).toBe(true)
    }
  })

  /**
   * The caps are what stop the endpoint being a place to post an essay at us.
   * They are generous enough that nobody legitimate reaches them, which is
   * exactly why nobody would notice them being removed.
   */
  it('caps the free-text answers', () => {
    expect(waitlistSchema.safeParse({ ...valid, company: 'x'.repeat(121) }).success).toBe(false)
    expect(waitlistSchema.safeParse({ ...valid, role: 'x'.repeat(121) }).success).toBe(false)
    expect(waitlistSchema.safeParse({ ...valid, erp: 'x'.repeat(121) }).success).toBe(false)
    expect(waitlistSchema.safeParse({ ...valid, pain: 'x'.repeat(1_001) }).success).toBe(false)
    expect(waitlistSchema.safeParse({ ...valid, pain: 'x'.repeat(1_000) }).success).toBe(true)
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
