import { describe, expect, it } from 'vitest'

import { janus, janusSeo } from '#/content/janus.ts'
import { brand } from '#/content/site.ts'

/**
 * The case study, held to the rules it is written under.
 *
 * This page is allowed something `site.ts` is not — the past tense — because it
 * describes a build that is finished and public. Everything else about the way
 * this company writes still applies, and the point of this file is that the
 * licence stops exactly there.
 */

/** Every rendered string, flattened, for the assertions that scan all of it. */
const everything = JSON.stringify(janus) + JSON.stringify(janusSeo)

describe('the framing', () => {
  /**
   * The single most important assertion here. A reader who works out four
   * screens down that this was a weekend build has read everything above it as
   * something else, and "it is a hackathon build" is the first sentence
   * somebody trims when the header feels long.
   */
  it('says what this is, before anything claims anything', () => {
    expect(janus.framing).toMatch(/hackathon/i)
    expect(janus.framing).toMatch(/not an Incillum product/i)
  })

  it('never implies JANUS is a product this company sells', () => {
    for (const claim of [
      'our product',
      'our platform',
      'customers',
      'clients use',
      'in production for',
      'trusted by',
    ]) {
      expect(everything.toLowerCase()).not.toContain(claim)
    }
  })
})

describe('what may never be claimed', () => {
  /**
   * JANUS explores structured scenarios and does not predict anything — its own
   * interface says so on every screen. A case study that says "predicts" is
   * contradicting the artefact it is describing, in public, next to a link to
   * it.
   *
   * The words are not banned outright, because the strongest sentences on this
   * page are the ones that deny them: "not a probability and not a prediction"
   * says the thing precisely. So the rule is that every occurrence has to be a
   * denial, and this checks the words immediately before each one for a
   * negation rather than checking that the word is absent.
   */
  it('uses the words the demo denies only as denials', () => {
    const haystack = everything.toLowerCase()
    /** A negation within the same clause — no sentence boundary in between. */
    const negated = /\b(not|never|no|nothing|neither|without)\b[^.]{0,48}$/

    for (const root of ['predict', 'forecast', 'probabilit', 'likelihood', 'guarantee']) {
      let index = haystack.indexOf(root)
      let found = 0

      while (index !== -1) {
        found += 1
        const preceding = haystack.slice(Math.max(0, index - 64), index)
        expect(
          negated.test(preceding),
          `"${root}" is asserted rather than denied here: …${preceding}${root}…`,
        ).toBe(true)
        index = haystack.indexOf(root, index + root.length)
      }

      // A guard on the guard: if the copy stops using a word entirely, the loop
      // above passes without asserting anything, and this test quietly stops
      // testing. That is fine — but the two denials the page is built on are
      // load-bearing, and they have to still be there.
      if (root === 'predict' || root === 'probabilit') {
        expect(found, `the page no longer denies "${root}"`).toBeGreaterThan(0)
      }
    }
  })

  it('keeps the banned vocabulary banned', () => {
    for (const word of [
      'magic',
      'revolutionary',
      'fully autonomous',
      'replaces your team',
      'AGI',
      'game-changing',
      'seamlessly',
      'effortless',
      'supercharge',
      'cutting-edge',
      'next-generation',
      'powered by AI',
      '10x',
    ]) {
      expect(everything.toLowerCase()).not.toContain(word.toLowerCase())
    }
  })

  it('names no date, quarter or year', () => {
    for (const calendar of [
      'Q1',
      'Q2',
      'Q3',
      'Q4',
      'January',
      'February',
      '2025',
      '2026',
      '2027',
    ]) {
      expect(everything).not.toContain(calendar)
    }
  })

  /**
   * The motto is used twice on the whole site — the close and the success state
   * — and it survives on that scarcity. A third placement would not be caught
   * by `site.test.ts`, which only reads `site.ts`.
   */
  it('does not spend the motto', () => {
    expect(everything.toLowerCase()).not.toContain(
      brand.motto.toLowerCase().replace('.', ''),
    )
  })
})

describe('the figures', () => {
  /**
   * These are deterministic outputs of the demo at its default assumptions. If
   * one is edited, this test names the others that have to move with it — and
   * the band boundaries they are being read against.
   */
  const scores = { upside: 39, drift: 58, breakdown: 46 } as const

  it('states the three modelled scores exactly as the demo produces them', () => {
    for (const score of Object.values(scores)) {
      expect(janus.premise.reading).toContain(String(score))
    }
  })

  it('reads each score against the band the demo actually uses', () => {
    // Below 40 is low; 55 and above is high. The sentence states both edges, so
    // a reader can check the three numbers against them without leaving the
    // page — and so an edit to one cannot silently contradict the other.
    expect(janus.premise.reading).toContain('40')
    expect(janus.premise.reading).toContain('55')
    expect(scores.upside).toBeLessThan(40)
    expect(scores.breakdown).toBeGreaterThanOrEqual(40)
    expect(scores.breakdown).toBeLessThan(55)
    expect(scores.drift).toBeGreaterThanOrEqual(55)
  })

  it('calls them modelled, never predicted', () => {
    expect(janus.premise.reading).toMatch(/modelled/i)
  })

  it('keeps the one changed assumption consistent with the sequence', () => {
    const beat = janus.sequence.beats.find((entry) => entry.body.includes('20,000'))
    expect(beat, 'no beat states the traffic change').toBeTruthy()
    expect(beat!.body).toContain('80,000')
  })

  it('states what was checked as counts, not as adjectives', () => {
    const terms = janus.checked.facts.map((fact) => fact.term).join(' ')
    expect(terms).toContain('114')
    expect(terms).toContain('28')
  })
})

describe('the sequence', () => {
  it('alternates between the two actors, which is the whole point', () => {
    const actors = new Set(janus.sequence.beats.map((beat) => beat.actor))
    expect(actors).toEqual(new Set(['Agent', 'Person']))
  })

  /**
   * The approval beat is the argument. If it ever softens into a permission —
   * "the agent is not allowed to approve" rather than "there is no approval
   * action" — the page is describing a different, much more ordinary product.
   */
  it('describes approval as absent rather than as withheld', () => {
    const approval = janus.sequence.beats.find((beat) => beat.title.includes('Approves'))
    expect(approval, 'no approval beat').toBeTruthy()
    expect(approval!.body).toMatch(/not there|is not there/i)
    expect(approval!.actor).toBe('Person')
    expect(janus.boundary.body).toMatch(/does not have the capability/i)
  })
})

describe('the demo link', () => {
  it('points at the live deployment over https', () => {
    expect(janus.demoUrl.startsWith('https://')).toBe(true)
    expect(() => new URL(janus.demoUrl)).not.toThrow()
  })

  it('says the demo works without an agent, because most readers will not have one', () => {
    expect(janus.demoNote).toMatch(/without/i)
  })
})
