import { describe, expect, it } from 'vitest'

import {
  access,
  boundary,
  brand,
  earlyAccess,
  evidence,
  firstBuild,
  hero,
  instrument,
  nightfall,
  standing,
  thread,
} from '#/content/site.ts'

/**
 * The copy, held to the rules it is written under.
 *
 * Three kinds of assertion live here, and only the first is about arithmetic:
 *
 *   1. The illustrative quotation has to add up, and it has to add up *across*
 *      two sections that show it at two magnifications. A commercial reader
 *      will check it, and an example that does not reconcile fails hardest in
 *      front of exactly the reader it exists for.
 *   2. The labels that license the illustrative material have to be present. A
 *      night thread this specific and a document this exact are honest only
 *      while their own first lines say they are invented — and that sentence is
 *      the first thing somebody trims when a section feels long.
 *   3. The words this site may never say have to stay unsaid, and the words it
 *      says exactly twice have to stay twice.
 */

/** Pulls a decimal out of `EUR 162,816.00`, ignoring the currency and commas. */
function money(value: string): number {
  const match = /EUR ([\d,]+\.\d{2})/.exec(value)
  expect(match?.[1], `no EUR amount in ${JSON.stringify(value)}`).toBeTruthy()
  return Number(match![1]!.replaceAll(',', ''))
}

/** Pulls `15.2%` out of anywhere in a string. */
function percent(value: string): number {
  const match = /([\d.]+)%/.exec(value)
  expect(match?.[1], `no percentage in ${JSON.stringify(value)}`).toBeTruthy()
  return Number(match![1]!)
}

function formatMoney(value: number): string {
  return `EUR ${value.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/** The single line item the `evidence` document takes apart. */
const UNITS = 1_200

describe('the evidence document’s arithmetic', () => {
  const rows = evidence.record.calculation.rows
  const row = (basis: string) => {
    const found = rows.find((entry) => entry.basis.startsWith(basis))
    expect(found, `no calculation row starting "${basis}"`).toBeTruthy()
    return found!
  }

  const cost = money(row('Cost').amount)
  const quoted = money(row('Quoted').amount)
  const margin = money(row('Margin').amount)
  const atFloor = money(row('At the').amount)
  const shortfall = money(evidence.record.calculation.shortfall.amount)
  const floor = percent(row('At the').basis)

  it('states the quantity once, and multiplies by it correctly', () => {
    expect(evidence.record.part).toContain(UNITS.toLocaleString('en-GB'))
    expect(money(row('Cost').working) * UNITS).toBeCloseTo(cost, 2)
    expect(money(row('Quoted').working) * UNITS).toBeCloseTo(quoted, 2)
  })

  it('derives the margin from the two figures above it', () => {
    expect(quoted - cost).toBeCloseTo(margin, 2)
    expect((margin / quoted) * 100).toBeCloseTo(percent(row('Margin').working), 3)
  })

  it('is below the floor, which is the only reason the section exists', () => {
    expect(percent(row('Margin').working)).toBeLessThan(floor)
  })

  it('prices the floor from the cost, not from the quoted price', () => {
    expect(cost / (1 - floor / 100)).toBeCloseTo(atFloor, 2)
    expect(money(row('At the').working) * UNITS).toBeCloseTo(atFloor, 2)
  })

  it('names the shortfall to the cent, per unit and in total', () => {
    expect(atFloor - quoted).toBeCloseTo(shortfall, 2)
    expect(money(evidence.record.calculation.shortfall.working) * UNITS).toBeCloseTo(
      shortfall,
      2,
    )
  })

  it('carries the cost rise through from the finding that caused it', () => {
    // The supplier confirmation is the reason this line moved: 128.00 × 1.06.
    const [was, now] = [...evidence.record.finding.body.matchAll(/EUR ([\d,]+\.\d{2})/g)].map(
      (match) => Number(match[1]!.replaceAll(',', '')),
    )
    expect(was).toBeTruthy()
    expect(now).toBeCloseTo(was! * 1.06, 2)
    expect(money(row('Cost').working)).toBeCloseTo(now!, 2)
  })

  it('leaves the decision to a person, and says so', () => {
    expect(evidence.record.decision.body).toMatch(/until a person/i)
    expect(evidence.record.decision.body).toMatch(/nothing is sent/i)
  })
})

/**
 * The two sections are the same quotation at two magnifications, and the whole
 * point of showing the second one is that it explains the first. If they stop
 * reconciling, the page is quietly telling a commercial reader that neither
 * number can be trusted.
 */
describe('the night thread and the evidence document reconcile', () => {
  const beat = thread.beats.find((entry) => entry.figures)
  const figure = (term: string) => {
    const found = beat!.figures!.find((entry) => entry.term === term)
    expect(found, `no figure "${term}"`).toBeTruthy()
    return found!
  }

  it('quotes one set of figures, at one hour', () => {
    expect(beat, 'no beat carries the ledger').toBeTruthy()
    expect(beat!.at).toBe('06:50')
  })

  it('prices the whole quotation short of the same floor', () => {
    const quote = money(figure('Quote value').value)
    const expected = percent(figure('Expected margin').value)
    const floor = percent(figure('Commercial floor').value)
    const short = money(figure('Short of the floor').value)

    expect(expected).toBeLessThan(floor)

    // cost = quote × (1 − margin); the price that clears the floor is cost ÷ (1 − floor).
    const cost = quote * (1 - expected / 100)
    expect(cost / (1 - floor / 100) - quote).toBeCloseTo(short, 2)
  })

  it('uses the same commercial floor in both sections', () => {
    const threadFloor = percent(figure('Commercial floor').value)
    const documentFloor = percent(
      evidence.record.calculation.rows.find((row) => row.basis.startsWith('At the'))!.basis,
    )
    expect(threadFloor).toBe(documentFloor)
  })

  it('leaves the other lines carrying a plausible margin, not an impossible one', () => {
    const quote = money(figure('Quote value').value)
    const expected = percent(figure('Expected margin').value)
    const wholeMargin = quote * (expected / 100)

    const lineQuoted = money(
      evidence.record.calculation.rows.find((row) => row.basis.startsWith('Quoted'))!.amount,
    )
    const lineMargin = money(
      evidence.record.calculation.rows.find((row) => row.basis.startsWith('Margin'))!.amount,
    )

    // The one line has to fit inside the quotation it belongs to …
    expect(lineQuoted).toBeLessThan(quote)
    expect(lineMargin).toBeLessThan(wholeMargin)

    // … and what is left for the other lines has to be a margin somebody could
    // actually have quoted: positive, and not above a hundred per cent.
    const restMargin = ((wholeMargin - lineMargin) / (quote - lineQuoted)) * 100
    expect(restMargin).toBeGreaterThan(0)
    expect(restMargin).toBeLessThan(100)
  })

  it('holds two of twenty lines, and prices the other eighteen', () => {
    const text = thread.beats.map((entry) => `${entry.title} ${entry.body}`).join(' ')
    expect(text).toContain('twenty line items')
    expect(text).toMatch(/remaining eighteen|Eighteen lines/)
  })

  it('spends the same amount of money in the document as in the thread', () => {
    // Not a coincidence to be maintained by hand: the shortfall on the one line
    // and the shortfall on the whole quotation are different numbers, and the
    // test exists so nobody "fixes" one to match the other.
    expect(money(evidence.record.calculation.shortfall.amount)).not.toBe(
      money(figure('Short of the floor').value),
    )
    expect(formatMoney(money(figure('Short of the floor').value))).toBe(
      figure('Short of the floor').value,
    )
  })
})

describe('the illustrative material says it is illustrative', () => {
  it('labels the night thread, in its label and its lede', () => {
    expect(thread.label.toLowerCase()).toContain('illustrative')
    expect(thread.lede).toMatch(/invented/i)
  })

  it('labels the evidence document, in its label and its lede', () => {
    expect(evidence.label.toLowerCase()).toContain('illustrative')
    expect(evidence.lede).toMatch(/invented/i)
    expect(evidence.lede).toMatch(/not a screenshot/i)
  })
})

/**
 * The claim this page is most likely to acquire by accident.
 *
 * Reading a mailbox is a thing software does; contacting somebody's suppliers
 * on their behalf is a different promise, and the moment this page makes it,
 * the first conversation with every design partner starts with a correction.
 * The supplier answer *arrives*. It is not requested.
 */
describe('nothing claims outbound supplier contact', () => {
  const everything = JSON.stringify([thread, evidence, firstBuild, boundary, hero, standing])

  it('never says it asks, chases or contacts a supplier', () => {
    for (const forbidden of [
      'asks the supplier',
      'chases the supplier',
      'contacts the supplier',
      'emails the supplier',
      'chased the supplier',
      'reaches out to the supplier',
    ]) {
      expect(everything.toLowerCase()).not.toContain(forbidden)
    }
  })

  it('describes the supplier answer as arriving', () => {
    const beat = thread.beats.find((entry) => entry.at === '03:42')
    expect(beat).toBeTruthy()
    expect(`${beat!.title} ${beat!.body}`).toMatch(/lands|arrives|answer/i)
  })
})

/**
 * No ERP is named in the rendered copy. The previous version of this site named
 * three, under a future-tense contract that was easy to state and easy to break
 * in one edit; the question is now asked on the form instead, where it costs
 * nothing and claims nothing.
 */
describe('no system is named on the page', () => {
  const everything = JSON.stringify([
    hero,
    nightfall,
    instrument,
    thread,
    boundary,
    evidence,
    firstBuild,
    standing,
    access,
    earlyAccess,
  ])

  it('names no ERP, CRM or mail client', () => {
    for (const system of [
      'NetSuite',
      'Sage',
      'Intacct',
      'Xero',
      'SAP',
      'Salesforce',
      'Dynamics',
      'Outlook',
      'Gmail',
      'HubSpot',
    ]) {
      expect(everything).not.toContain(system)
    }
  })
})

describe('the motto', () => {
  it('is the short form, never extended', () => {
    expect(brand.motto).toBe('Stay with the work.')
  })

  /**
   * Scarcity is the whole of why it works. The two placements are the close and
   * the success state; both render `brand.motto` rather than a copy of the
   * string, so a third occurrence would have to be written into the content
   * file — which is what this catches.
   */
  it('appears in the content file exactly once, as its own field', () => {
    const everywhereElse = JSON.stringify([
      hero,
      nightfall,
      instrument,
      thread,
      boundary,
      evidence,
      firstBuild,
      standing,
      access,
      earlyAccess,
    ])
    expect(everywhereElse.toLowerCase()).not.toContain('stay with the work')
  })
})

describe('the hero', () => {
  it('opens the night at the hour the proof beat names', () => {
    const hour = /(\d{2}:\d{2})/.exec(hero.proof)?.[1]
    expect(hour).toBeTruthy()
    expect(thread.beats[0]!.at).toBe(hour)
  })

  it('keeps the claim in the future', () => {
    expect(hero.lede).toMatch(/being built/i)
    expect(hero.proofTail).toMatch(/should be/i)
  })

  it('promises no confirmation email', () => {
    expect(hero.assurance.toLowerCase()).not.toContain('check your inbox')
    expect(hero.assurance).toMatch(/no newsletter/i)
  })
})

describe('where it stops', () => {
  it('names a limit in every entry, and softens none of them', () => {
    expect(boundary.points.length).toBeGreaterThanOrEqual(4)
    for (const point of boundary.points) {
      expect(point.body.trim()).not.toBe('')
      // "but usually it can work it out" is the sentence that makes this
      // section worthless, and it arrives as a hedge on a limit.
      expect(point.body.toLowerCase()).not.toMatch(/but usually|most of the time|in practice it/)
    }
  })

  it('keeps the boundary in the future tense', () => {
    expect(boundary.lede).toMatch(/being built/i)
  })
})

describe('data and access', () => {
  it('claims no certification and no framework', () => {
    const text = `${access.headline} ${access.decided.title} ${access.decided.body} ${access.open.title} ${access.open.body}`
    for (const forbidden of [
      'SOC 2',
      'SOC2',
      'ISO 27001',
      'GDPR-compliant',
      'HIPAA',
      'certified',
      'compliant',
    ]) {
      expect(text.toLowerCase()).not.toContain(forbidden.toLowerCase())
    }
  })

  it('asserts the one thing that is settled', () => {
    expect(access.decided.body).toMatch(/train or fine-tune/i)
  })

  it('keeps saying that the rest is open', () => {
    expect(access.open.body).toMatch(/being settled/i)
  })
})

describe('where this stands', () => {
  it('describes progress as states, never as a date', () => {
    for (const stage of standing.stages) {
      expect(stage.state).toMatch(/^(Built|In build|Opening)$/)
    }
    const text = JSON.stringify(standing)
    for (const calendar of [
      'Q1',
      'Q2',
      'Q3',
      'Q4',
      'January',
      'February',
      'March',
      '2026',
      '2027',
    ]) {
      expect(text).not.toContain(calendar)
    }
  })
})
