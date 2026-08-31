import { describe, expect, it } from 'vitest'

import { createReference, heuristicSpamProtection } from '#/lib/spam.ts'

/**
 * The two invisible controls on the form, and the reference the visitor sees.
 *
 * Worth testing precisely because none of it is visible: a broken honeypot, a
 * threshold set to the wrong unit or a reference generator that returns the
 * same string twice all look exactly like a working system from the outside.
 */

const RENDERED = 1_700_000_000_000

function verdict(overrides: Partial<Parameters<typeof heuristicSpamProtection.evaluate>[0]>) {
  return heuristicSpamProtection.evaluate({
    honeypot: '',
    renderedAt: RENDERED,
    submittedAt: RENDERED + 10_000,
    ...overrides,
  })
}

describe('heuristicSpamProtection', () => {
  it('allows a plausible human submission', () => {
    expect(verdict({})).toEqual({ allowed: true })
  })

  it('rejects a filled honeypot', () => {
    expect(verdict({ honeypot: 'http://spam.example' })).toEqual({
      allowed: false,
      reason: 'honeypot',
    })
  })

  /**
   * Browsers and password managers can put whitespace into a field nobody
   * touched. Treating that as a bot would reject real people for something
   * their software did.
   */
  it('ignores a whitespace-only honeypot', () => {
    expect(verdict({ honeypot: '   ' })).toEqual({ allowed: true })
  })

  it('rejects a submission faster than a person could type an address', () => {
    expect(verdict({ submittedAt: RENDERED + 400 }).reason).toBe('too-fast')
  })

  /**
   * The boundary, from both sides. This form's threshold is two seconds rather
   * than the three a long qualification form can assume — it is one field, and
   * a limit that rejects a fast typist costs more than it saves.
   */
  it('allows a submission just past the minimum fill time', () => {
    expect(verdict({ submittedAt: RENDERED + 2_001 }).allowed).toBe(true)
    expect(verdict({ submittedAt: RENDERED + 1_999 }).allowed).toBe(false)
  })

  it('rejects a form left open for more than a day', () => {
    expect(verdict({ submittedAt: RENDERED + 25 * 60 * 60 * 1_000 }).reason).toBe('stale')
  })

  /** Clock skew, or a hand-built payload. Either way the pair is untrusted. */
  it('rejects a submission stamped before it was rendered', () => {
    expect(verdict({ submittedAt: RENDERED - 1 }).reason).toBe('future-timestamp')
  })
})

describe('createReference', () => {
  it('is shaped so a person can read it down a phone line', () => {
    expect(createReference('IC')).toMatch(/^IC-[0-9A-Z]+-[0-9A-Z]{3}$/)
  })

  it('pads the noise segment so every reference is the same length', () => {
    // Regenerating is cheap; a padding bug shows up as a short tail, and only
    // on the small fraction of draws that land under 36^2.
    const tails = Array.from({ length: 200 }, () => createReference('IC').split('-')[2])
    for (const tail of tails) expect(tail).toHaveLength(3)
  })

  it('uses the prefix it is given', () => {
    expect(createReference('WL').startsWith('WL-')).toBe(true)
  })
})
