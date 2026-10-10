import { describe, expect, it } from 'vitest'

import {
  access,
  boundary,
  brand,
  contact,
  earlyAccess,
  evidence,
  home,
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

  it('reconciles the visual comparison with the source record', () => {
    const visual = evidence.visual
    expect(visual.units).toBe(UNITS)
    expect(visual.unitCostAfter).toBeCloseTo(visual.unitCostBefore * 1.06, 2)
    expect(visual.unitCostAfter * visual.units).toBeCloseTo(cost, 2)
    expect(visual.unitPrice * visual.units).toBeCloseTo(quoted, 2)
    expect((1 - visual.unitCostBefore / visual.unitPrice) * 100).toBeCloseTo(floor, 2)
    expect((1 - visual.unitCostAfter / visual.unitPrice) * 100).toBeCloseTo(
      percent(row('Margin').working),
      2,
    )
    expect(visual.floorPercent).toBe(floor)
  })

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
    const [was, now] = [
      ...evidence.record.finding.body.matchAll(/EUR ([\d,]+\.\d{2})/g),
    ].map((match) => Number(match[1]!.replaceAll(',', '')))
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
      evidence.record.calculation.rows.find((row) => row.basis.startsWith('At the'))!
        .basis,
    )
    expect(threadFloor).toBe(documentFloor)
  })

  it('leaves the other lines carrying a plausible margin, not an impossible one', () => {
    const quote = money(figure('Quote value').value)
    const expected = percent(figure('Expected margin').value)
    const wholeMargin = quote * (expected / 100)

    const lineQuoted = money(
      evidence.record.calculation.rows.find((row) => row.basis.startsWith('Quoted'))!
        .amount,
    )
    const lineMargin = money(
      evidence.record.calculation.rows.find((row) => row.basis.startsWith('Margin'))!
        .amount,
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
  const everything = JSON.stringify([
    thread,
    evidence,
    firstBuild,
    boundary,
    hero,
    standing,
  ])

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
    contact,
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
      contact,
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
      expect(point.body.toLowerCase()).not.toMatch(
        /but usually|most of the time|in practice it/,
      )
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

/**
 * The contact memo.
 *
 * It spends the column a proof page would spend on logos and quotations on what
 * happens next, because the site has no customers and must never imply
 * otherwise. These hold it to the same rules as the page it links from.
 */
describe('the contact page', () => {
  const everything = JSON.stringify(contact)

  it('claims no customers, no metrics, no certification and no date', () => {
    for (const forbidden of [
      'trusted by',
      'customers',
      'testimonial',
      'SOC 2',
      'GDPR',
      'HIPAA',
      'certified',
      'compliant',
      '2026',
      '2027',
      'Q1',
      'Q2',
      'Q3',
      'Q4',
    ]) {
      expect(everything.toLowerCase()).not.toContain(forbidden.toLowerCase())
    }
    expect(everything).not.toMatch(/\d+\s?%|\d+\s?x\b/i)
  })

  it('never says magic, autonomous or replaces your team', () => {
    for (const forbidden of ['magic', 'revolutionary', 'fully autonomous', 'replaces your team', 'AGI']) {
      expect(everything).not.toContain(forbidden)
    }
  })

  it('keeps the promise the form makes', () => {
    expect(everything.toLowerCase()).not.toContain('check your inbox')
    expect(contact.receipt.body).toMatch(/we.ll write once/i)
    expect(contact.receipt.body).toMatch(/nothing is sent before then/i)
  })

  it('keeps the wedge narrow and contacts nobody on anyone’s behalf', () => {
    expect(contact.steps[0].text).toMatch(/request for quotation/i)
    for (const forbidden of ['asks the supplier', 'chases the supplier', 'contacts the supplier']) {
      expect(everything.toLowerCase()).not.toContain(forbidden)
    }
  })

  it('does not spend the motto, which the receipt renders from `brand.motto`', () => {
    expect(everything.toLowerCase()).not.toContain('stay with the work')
  })

  it('describes the stage as a state, never as an opening', () => {
    expect(contact.description.toLowerCase()).toContain('early access is not open yet')
    expect(contact.status).toMatch(/in progress/i)
  })
})

/**
 * The home page's matrix.
 *
 * It is the thread's quotation at another magnification, so its counts are
 * held to the rows and its totals to the thread's own prose. The money is not
 * in the content at all — the component reads it off the 06:50 ledger — which
 * is why there is no figure to reconcile here.
 */
describe('the home matrix', () => {
  const { matrix } = home

  it('counts its rows into the totals it prints', () => {
    const priced = matrix.rows.filter((row) => row.status !== 'held').length + matrix.more.count
    const held = matrix.rows.filter((row) => row.status === 'held').length
    expect(priced).toBe(matrix.lines.priced)
    expect(held).toBe(matrix.lines.held)
    expect(priced + held).toBe(matrix.lines.total)
    // Line numbers are unique and inside the request.
    const numbers = matrix.rows.map((row) => Number(row.line))
    expect(new Set(numbers).size).toBe(numbers.length)
    for (const n of numbers) expect(n).toBeGreaterThanOrEqual(1)
    for (const n of numbers) expect(n).toBeLessThanOrEqual(matrix.lines.total)
  })

  it('agrees with what the thread says in words', () => {
    const prose = thread.beats.map((beat) => `${beat.title} ${beat.body}`).join(' ').toLowerCase()
    expect(prose).toContain('twenty line items')
    expect(prose).toContain('eighteen lines priced')
    expect(prose).toContain('two lines held')
    expect(matrix.lines).toEqual({ total: 20, priced: 18, held: 2 })
  })

  it('holds the same two lines the thread holds, and moves the cost the thread moves', () => {
    const held = matrix.rows.filter((row) => row.status === 'held').map((row) => row.evidence)
    expect(held.some((text) => /three catalogue entries/i.test(text))).toBe(true)
    expect(held.some((text) => /no revision/i.test(text))).toBe(true)
    const moved = matrix.rows.filter((row) => row.status === 'changed')
    expect(moved).toHaveLength(1)
    expect(moved[0]!.evidence).toMatch(/03:42/)
    expect(moved[0]!.evidence).toMatch(/six per cent/)
    expect(moved[0]!.evidence).toMatch(/three weeks/)
    expect(thread.beats.some((beat) => beat.at === '03:42')).toBe(true)
  })

  it('carries no money of its own', () => {
    expect(JSON.stringify(matrix)).not.toMatch(/EUR|\d+(\.\d+)?%/)
  })

  it('claims nothing a pre-launch site cannot back, and names no system', () => {
    const everything = JSON.stringify(home)
    for (const forbidden of [
      'trusted by',
      'customers include',
      'testimonial',
      'SOC 2',
      'certified',
      'magic',
      'fully autonomous',
      'replaces your team',
      'NetSuite',
      'SAP',
      'Salesforce',
      'check your inbox',
    ]) {
      expect(everything.toLowerCase()).not.toContain(forbidden.toLowerCase())
    }
    expect(everything.toLowerCase()).not.toContain('stay with the work')
  })
})

/**
 * The table moves the cost on the line the evidence document takes apart. They
 * were different lines once (03 and 14), which a commercial reader comparing
 * the two would have caught.
 */
describe('the matrix and the evidence document are about the same line', () => {
  it('moves the cost on the line the document names', () => {
    const lineNumber = /Line (\d+)/.exec(evidence.record.reference)?.[1]
    expect(lineNumber).toBeTruthy()
    const moved = home.matrix.rows.find((row) => row.status === 'changed')
    expect(moved?.line).toBe(lineNumber)
    expect(moved?.item.toLowerCase()).toContain('flanged housing')
    expect(evidence.record.part.toLowerCase()).toContain('flanged housing')
    expect(home.matrix.title).toContain(/RFQ (\d+)/.exec(evidence.record.reference)![1]!)
  })
})

/**
 * What the night shows before the supplier answer.
 *
 * At 01:18 the quotation sits just above its floor, and at 03:42 the answer
 * moves one line and takes it under. The 20.3% is not a number anybody chose:
 * it is what the ledger's 16.4% becomes if line 14 still costs what it did
 * before the answer.
 */
describe('the margin before the supplier answer', () => {
  const ledger = thread.beats.find((beat) => beat.figures)!.figures!
  const get = (term: string) => ledger.find((entry) => entry.term === term)!.value
  const quote = money(get('Quote value'))
  const after = quote * (percent(get('Expected margin')) / 100)

  it('is derived from the line that moved, and rounds to the figure the page shows', () => {
    const { units, unitCostBefore, unitCostAfter } = evidence.visual
    const before = after + units * (unitCostAfter - unitCostBefore)
    expect(((before / quote) * 100).toFixed(1)).toBe(percent(thread.marginBefore).toFixed(1))
  })

  it('sits above the floor, so the answer is what takes it under', () => {
    expect(percent(thread.marginBefore)).toBeGreaterThan(percent(get('Commercial floor')))
    expect(percent(get('Expected margin'))).toBeLessThan(percent(get('Commercial floor')))
  })
})

/**
 * Words are a budget here, because the first version of every hour ran to fifty
 * and explained the mechanism. A stranger needs the event, and needs to read it
 * while the photograph is still on screen.
 */
describe('the home page is short', () => {
  const words = (text: string) => text.trim().split(/\s+/).filter(Boolean).length

  it('keeps every hour to a title of six words and a line of fifteen', () => {
    for (const beat of thread.beats) {
      expect(words(beat.title), beat.title).toBeLessThanOrEqual(6)
      expect(words(beat.body), beat.body).toBeLessThanOrEqual(15)
    }
  })

  it('keeps the hero, the table and the close to a glance', () => {
    expect(words(hero.lede)).toBeLessThanOrEqual(30)
    expect(words(hero.assurance)).toBeLessThanOrEqual(15)
    for (const row of home.matrix.rows) {
      expect(words(row.evidence), row.evidence).toBeLessThanOrEqual(12)
    }
    expect(words(home.closing.headline)).toBeLessThanOrEqual(8)
    expect(words(home.closing.body)).toBeLessThanOrEqual(20)
  })

  it('reads at about a hundred and forty words of sentences', () => {
    const sentences = [
      hero.lede,
      hero.assurance,
      thread.lede,
      ...thread.beats.map((beat) => beat.body),
      home.closing.body,
    ].join(' ')
    expect(words(sentences)).toBeLessThanOrEqual(160)
  })
})
