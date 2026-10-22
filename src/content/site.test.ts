import { describe, expect, it } from 'vitest'

import {
  access,
  boundary,
  brand,
  charlie,
  contact,
  earlyAccess,
  evidence,
  glass,
  home,
  how,
  firstBuild,
  hero,
  instrument,
  menu,
  nightfall,
  questions,
  security,
  standing,
  thread,
  trust,
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
    how,
    trust,
    questions,
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
    home,
    how,
    trust,
    questions,
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
      home,
      how,
      trust,
      questions,
      glass,
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
 * The presentation at /glass.
 *
 * It is the same night told as a film, so it is held to everything the home
 * page is held to — and to one more rule, which is the reason it exists at all:
 * it is short. The quotation's own figures are not here to reconcile, because
 * the components read them off the 06:50 ledger; what is here is held to the
 * thread's hours, the matrix's lines, and the one cost that moves.
 */
describe('the presentation', () => {
  const everything = JSON.stringify(glass)
  const { documents } = glass.sources
  const words = (text: string) => text.split(/\s+/).filter((word) => /\w/.test(word)).length
  const amount = (value: string) => Number(value.replaceAll(',', ''))

  it('tells the thread’s night, hour for hour', () => {
    expect(glass.film.frames.map((frame) => frame.at)).toEqual(
      thread.beats.map((beat) => beat.at),
    )
  })

  it('writes none of the quotation’s own figures, which belong to the ledger', () => {
    expect(everything).not.toMatch(/EUR|\d+(\.\d+)?\s?%/)
    // The floor clause in the agreement is completed by the component, from the ledger.
    const clause = documents.agreement.clauses.find((entry) => 'floor' in entry)
    expect(clause?.text).not.toMatch(/\d/)
  })

  it('says it is invented, in a sentence, before anything invented is shown', () => {
    expect(glass.film.licence).toMatch(/invented/i)
    expect(glass.sources.scattered.lede).toMatch(/invented/i)
    // And never as a tracked label: the labels were what read as assembled.
    expect(everything).not.toMatch(/Illustrative ·/)
  })

  it('lands every source on a target the sheet has, with the icon of a real source', () => {
    const targets = new Set(['head', 'floor', ...home.matrix.rows.map((row) => row.line)])
    for (const frame of glass.film.frames) {
      for (const chip of frame.chips) {
        expect(targets.has(chip.target), chip.target).toBe(true)
        if (chip.source) expect(Object.keys(documents)).toContain(chip.source)
      }
    }
  })

  it('holds and moves the lines the matrix holds and moves, for the matrix’s reasons', () => {
    const lines = (rows: ReadonlyArray<{ line?: string; status?: string }>, status: string) =>
      rows
        .filter((row) => row.status === status)
        .map((row) => row.line)
        .sort()
    expect(lines(glass.sources.thread, 'held')).toEqual(lines(home.matrix.rows, 'held'))
    expect(lines(glass.sources.thread, 'changed')).toEqual(lines(home.matrix.rows, 'changed'))

    const evidenceFor = (key: string) => {
      const line = glass.sources.thread.find((row) => row.key === key)?.line
      return home.matrix.rows.find((row) => row.line === line)?.evidence ?? ''
    }
    expect(evidenceFor('catalogue')).toMatch(/three catalogue entries/i)
    expect(evidenceFor('drawing')).toMatch(/no revision/i)
    expect(evidenceFor('supplier')).toMatch(/03:42/)
  })

  it('threads every document, once, in the order they lie on the desk', () => {
    const keys = Object.keys(documents)
    expect(keys).toHaveLength(6)
    expect(glass.sources.scattered.headline).toMatch(/^Six /)
    expect(glass.sources.thread.map((row) => row.key)).toEqual(keys)
  })

  it('moves the supplier’s cost by exactly the thread’s six per cent and three weeks', () => {
    const moving = documents.prices.rows.find((row) => row.part === documents.prices.moving)
    expect(moving, 'the price list carries the row the supplier changes').toBeTruthy()

    const [cost, lead] = documents.supplier.changes
    expect(amount(cost.was)).toBe(amount(moving!.cost))
    expect(amount(cost.now)).toBeCloseTo(amount(cost.was) * 1.06, 2)

    const days = (value: string) => Number(/(\d+)/.exec(value)?.[1])
    expect(days(lead.was)).toBe(days(moving!.lead))
    expect(days(lead.now) - days(lead.was)).toBe(21)

    // The thread says the same thing in words, at the same hour, about the same part.
    const beat = thread.beats.find((entry) => entry.at === documents.supplier.at)
    expect(beat?.body).toMatch(/six per cent/)
    expect(beat?.body).toMatch(/three weeks/)
    expect(documents.supplier.item).toBe(moving!.description)
  })

  it('holds the drawing and the catalogue for the reasons the thread gives', () => {
    expect(documents.drawing.blank).toBe('—')
    expect(new Set(documents.catalogue.entries.map((entry) => entry.name)).size).toBe(1)
    expect(new Set(documents.catalogue.entries.map((entry) => entry.fit)).size).toBe(3)
    expect(documents.request.at).toBe(thread.beats[0]!.at)
  })

  it('sets the sheet’s lines as the matrix’s, and reads every rate off a document on the desk', () => {
    const { sheet } = glass.film
    expect(Object.keys(sheet.lines).sort()).toEqual(home.matrix.rows.map((row) => row.line).sort())
    const agreed = documents.agreement.clauses.flatMap((clause) =>
      'rates' in clause ? clause.rates : [],
    )
    for (const row of home.matrix.rows) {
      const line = sheet.lines[row.line as keyof typeof sheet.lines]
      expect(line.quantity, row.line).toMatch(/^\d{1,3}(,\d{3})*$/)
      const rate = 'rate' in line ? line.rate : undefined
      // Nothing is guessed: a held line has no rate, and every other line has one.
      expect(Boolean(rate), row.line).toBe(row.status !== 'held')
      if (!rate) continue
      const found =
        rate.from === 'prices'
          ? documents.prices.rows.find((entry) => entry.part === rate.part)
          : agreed.find((entry) => entry.part === rate.part)
      expect(found, `${row.line} reads ${rate.part}`).toBeTruthy()
      // Read from where the matrix says the line is priced from.
      expect(row.evidence, row.line).toMatch(rate.from === 'agreement' ? /schedule B/i : /supplier/i)
    }
    // The line that moves is priced off the row the supplier moves.
    const moved = home.matrix.rows.find((row) => row.status === 'changed')!
    const movedLine = sheet.lines[moved.line as keyof typeof sheet.lines]
    expect('rate' in movedLine ? movedLine.rate.part : null).toBe(documents.prices.moving)
    // The agreed rates name the items they price, as the matrix names them.
    for (const entry of agreed) {
      expect(home.matrix.rows.map((row) => row.item), entry.item).toContain(entry.item)
    }
  })

  it('is short: titles of six words, lines of sixteen, ledes of thirty', () => {
    const titles = [
      ...glass.opening,
      glass.sources.scattered.headline,
      glass.sources.gathered.headline,
    ]
    for (const title of titles) expect(words(title), title).toBeLessThanOrEqual(6)
    for (const frame of glass.film.frames) {
      expect(words(frame.line), frame.line).toBeLessThanOrEqual(16)
    }
    for (const lede of [
      glass.film.licence,
      glass.sources.scattered.lede,
      glass.sources.gathered.lede,
    ]) {
      expect(words(lede), lede).toBeLessThanOrEqual(30)
    }
  })

  it('keeps what the product will do in the future tense, and the stage as states', () => {
    expect(glass.sources.gathered.lede).toMatch(/being built/i)
    for (const stage of standing.stages) {
      expect(glass.standing).toContain(`${stage.title} is ${stage.state.toLowerCase()}.`)
    }
  })

  it('leaves the call to a person', () => {
    expect(glass.film.frames.at(-1)?.line).toMatch(/without you/i)
  })

  it('claims nothing, names no system, contacts no supplier, and spends no motto', () => {
    for (const forbidden of [
      'trusted by',
      'customers',
      'testimonial',
      'SOC 2',
      'GDPR',
      'HIPAA',
      'certified',
      'compliant',
      'magic',
      'revolutionary',
      'autonomous',
      'replaces your team',
      'seamless',
      'effortless',
      'supercharge',
      'unlock',
      'next-generation',
      'cutting-edge',
      'NetSuite',
      'SAP',
      'Salesforce',
      'Dynamics',
      'Outlook',
      'Gmail',
      'HubSpot',
      'Excel',
      'asks the supplier',
      'chases the supplier',
      'contacts the supplier',
      'emails the supplier',
      'reaches out to the supplier',
      'check your inbox',
      'stay with the work',
    ]) {
      expect(everything.toLowerCase()).not.toContain(forbidden.toLowerCase())
    }
    for (const calendar of [
      '2026',
      '2027',
      'Q1',
      'Q2',
      'Q3',
      'Q4',
      'January',
      'February',
      'September',
    ]) {
      expect(everything).not.toContain(calendar)
    }
    // An address in an invented document uses the domain reserved for examples.
    expect(documents.request.address).toMatch(/\.example$/)
  })
})

/**
 * The line the 03:42 confirmation moved.
 *
 * Four sections name it — the matrix marks it, the thread calls it the largest
 * line, the evidence document takes it apart, and /glass lays its price-list
 * row and the confirmation on the desk — and they once named two different
 * lines: a stepped shaft at 46.50 on line 03, and a flanged housing at 128.00
 * on line 14. Every test above still passed, because each held its own section
 * to the thread's six per cent and none held the sections to each other. These
 * do: one confirmation, read in one minute, moving one line, one part, one
 * quantity and one cost.
 */
describe('the line the supplier moved is one line on every surface', () => {
  const moved = home.matrix.rows.filter((row) => row.status === 'changed')
  const { documents } = glass.sources
  const { sheet } = glass.film
  const listed = documents.prices.rows.find((row) => row.part === documents.prices.moving)
  const landed = glass.film.frames.flatMap((frame) =>
    frame.chips
      .filter((chip) => chip.source === 'supplier')
      .map((chip) => ({ ...chip, at: frame.at })),
  )
  const ledger = thread.beats.find((beat) => beat.figures)?.figures ?? []

  const decimal = (value: string) => Number(value.replaceAll(',', ''))
  const days = (value: string) => Number(/(\d+)/.exec(value)?.[1])
  const lineIn = (value: string) => Number(/Line (\d+)/.exec(value)?.[1])
  const hoursIn = (value: string) =>
    [...value.matchAll(/\d{2}:\d{2}/g)].map((match) => match[0])
  const sheetLine = (line: string) => sheet.lines[line as keyof typeof sheet.lines]
  const source = (term: string) => {
    const found = evidence.record.source.items.find((item) => item.term.startsWith(term))
    expect(found, `no source "${term}" in the evidence document`).toBeTruthy()
    return found!
  }
  const change = (term: string) => {
    const found = documents.supplier.changes.find((entry) => entry.term === term)
    expect(found, `no "${term}" on the confirmation`).toBeTruthy()
    return found!
  }
  const calculated = (basis: string) => {
    const found = evidence.record.calculation.rows.find((row) =>
      row.basis.startsWith(basis),
    )
    expect(found, `no calculation row starting "${basis}"`).toBeTruthy()
    return money(found!.amount)
  }
  const quote = () =>
    money(ledger.find((entry) => entry.term === 'Quote value')?.value ?? '')

  it('is one line of the matrix, and it is the evidence document’s line', () => {
    expect(moved).toHaveLength(1)
    const line = Number(moved[0]!.line)
    expect(lineIn(evidence.record.reference)).toBe(line)
    expect(lineIn(source('Customer RFQ').value)).toBe(line)
  })

  it('is the line /glass moves: on the film, on the gathered sheet, and off the price list', () => {
    const { line } = moved[0]!
    expect(glass.sources.thread.find((row) => row.key === 'supplier')?.line).toBe(line)
    expect(landed.map((chip) => chip.target)).toEqual([line])
    const entry = sheetLine(line)
    expect('rate' in entry ? entry.rate.part : undefined).toBe(documents.prices.moving)
  })

  it('belongs to one request', () => {
    const rfq = (value: string) => /RFQ (\d+)/.exec(value)?.[1]
    expect(rfq(evidence.record.reference)).toBeTruthy()
    expect(rfq(source('Customer RFQ').term)).toBe(rfq(evidence.record.reference))
    expect(rfq(documents.request.subject)).toBe(rfq(evidence.record.reference))
  })

  it('names one part, in the same words', () => {
    const [part] = evidence.record.part.split(' · ')
    expect(moved[0]!.item).toBe(part)
    expect(listed?.description).toBe(part)
    expect(documents.supplier.item).toBe(part)
  })

  it('carries one quantity', () => {
    const { quantity } = sheetLine(moved[0]!.line)
    expect(decimal(quantity)).toBe(evidence.visual.units)
    expect(evidence.record.part).toContain(`${quantity} units`)
  })

  it('moves one cost, from the evidence document’s figure to the evidence document’s figure', () => {
    const cost = change('Unit cost')
    expect(decimal(listed!.cost)).toBe(evidence.visual.unitCostBefore)
    expect(decimal(cost.was)).toBe(evidence.visual.unitCostBefore)
    expect(decimal(cost.now)).toBe(evidence.visual.unitCostAfter)
    const finding = [
      ...evidence.record.finding.body.matchAll(/EUR ([\d,]+\.\d{2})/g),
    ].map((match) => decimal(match[1]!))
    expect(finding).toEqual([decimal(cost.was), decimal(cost.now)])
    // The sheet's quantity at the confirmed cost is the evidence's cost line, to the cent.
    expect(decimal(sheetLine(moved[0]!.line).quantity) * decimal(cost.now)).toBeCloseTo(
      calculated('Cost'),
      2,
    )
  })

  it('moves one lead time', () => {
    const lead = change('Lead time')
    expect(days(listed!.lead)).toBe(days(lead.was))
    const stated = [...evidence.visual.leadTime.matchAll(/\d+/g)].map((match) =>
      Number(match[0]),
    )
    expect(stated).toEqual([days(lead.was), days(lead.now)])
    expect(evidence.record.finding.body).toContain(
      `from ${days(lead.was)} days to ${days(lead.now)}`,
    )
  })

  it('is one confirmation, read and recalculated in the same minute', () => {
    const number = /SC-\d+/.exec(documents.supplier.title)?.[0]
    expect(number).toBeTruthy()
    expect(evidence.visual.sourceReference).toContain(number)
    expect(source('Supplier confirmation').term).toContain(number)

    // The thread recalculates "on the spot", so every hour the confirmation and
    // the evidence document name is the one it arrives in, and that is a beat.
    const { at } = documents.supplier
    expect(thread.beats.map((beat) => beat.at)).toContain(at)
    expect(new Set(hoursIn(JSON.stringify(documents.supplier)))).toEqual(new Set([at]))
    expect(new Set(hoursIn(JSON.stringify(evidence)))).toEqual(new Set([at]))
    expect(evidence.record.revisedAt).toBe(at)
    expect(hoursIn(moved[0]!.evidence)).toEqual([at])
    for (const chip of landed) {
      expect(chip.at).toBe(at)
      expect(hoursIn(chip.text)).toEqual([at])
    }
  })

  it('is the largest line on the quotation, which is what the thread calls it', () => {
    const quoted = calculated('Quoted')
    // Larger than every other priced line put together, so larger than any one of them.
    expect(quoted).toBeGreaterThan(quote() - quoted)
    const beat = thread.beats.find((entry) => entry.at === documents.supplier.at)
    expect(beat?.body).toMatch(/largest line/)
    expect(evidence.record.decision.body).toMatch(/largest line/)
  })

  it('leaves room beside it for every other rate the sheet shows', () => {
    // A rate on the sheet is a unit cost or an agreed unit rate, and either is
    // at most what its line is quoted at. So the other priced lines, at their
    // rates, have to fit inside what the quotation carries beside this one.
    const agreed = documents.agreement.clauses.flatMap((clause) =>
      'rates' in clause ? clause.rates : [],
    )
    let others = 0
    for (const row of home.matrix.rows) {
      if (row.status !== 'priced') continue
      const entry = sheetLine(row.line)
      if (!('rate' in entry)) continue
      const { from, part } = entry.rate
      const rate =
        from === 'prices'
          ? documents.prices.rows.find((price) => price.part === part)?.cost
          : agreed.find((term) => term.part === part)?.rate
      expect(rate, `${row.line} reads ${part}`).toBeTruthy()
      others += decimal(entry.quantity) * decimal(rate!)
    }
    expect(others).toBeGreaterThan(0)
    expect(others).toBeLessThan(quote() - calculated('Quoted'))
  })
})

/** Everything a page section may never say, gathered so every new section is held to all of it. */
const banned = [
  'trusted by',
  'customers include',
  'testimonial',
  'SOC 2',
  'SOC2',
  'ISO',
  'GDPR',
  'CCPA',
  'HIPAA',
  'certified',
  'compliant',
  'magic',
  'revolutionary',
  'autonomous',
  'replaces your team',
  'seamless',
  'effortless',
  'supercharge',
  'unlock',
  'next-generation',
  'cutting-edge',
  'asks the supplier',
  'chases the supplier',
  'contacts the supplier',
  'emails the supplier',
  'reaches out to the supplier',
  'check your inbox',
  'stay with the work',
] as const
const calendar = ['2026', '2027', 'Q1', 'Q2', 'Q3', 'Q4', 'January', 'February', 'September']
const words = (text: string) => text.split(/\s+/).filter((word) => /\w/.test(word)).length

function claimsNothing(section: unknown) {
  const text = JSON.stringify(section)
  for (const forbidden of banned) {
    // Whole words for the short ones, so "ISO" cannot hide inside "decisions".
    const pattern = /^[A-Z0-9 ]+$/.test(forbidden)
      ? new RegExp(`\\b${forbidden}\\b`)
      : new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    expect(text, forbidden).not.toMatch(pattern)
  }
  for (const date of calendar) expect(text, date).not.toContain(date)
}

/**
 * How it works — the four tabs.
 *
 * The tabs are the boundaries: each step ends on one entry of `where it stops`,
 * and all four entries are used once. They are held to the thread's hours, to
 * the presentation's word budgets, and to carrying no figure of their own.
 */
describe('how it works', () => {
  it('walks one request in four steps, in the order of the night', () => {
    expect(how.steps.map((step) => step.key)).toEqual(['read', 'hold', 'price', 'decide'])
    const hours = thread.beats.map((beat) => beat.at)
    const order = how.steps.map((step) => hours.indexOf(step.at))
    for (const index of order) expect(index).toBeGreaterThanOrEqual(0)
    expect([...order].sort((a, b) => a - b)).toEqual(order)
    // It starts after the request has arrived and ends where the night does.
    expect(how.steps.at(-1)?.at).toBe(thread.beats.at(-1)?.at)
  })

  it('ends every step on one of the four places it stops, and uses each once', () => {
    const limits = boundary.points.map((point) => point.title)
    expect(how.steps.map((step) => step.stops).sort()).toEqual([...limits].sort())
  })

  it('names each tab in one word, and keeps the rest short', () => {
    for (const step of how.steps) {
      expect(words(step.tab), step.tab).toBe(1)
      expect(words(step.title), step.title).toBeLessThanOrEqual(6)
      expect(words(step.line), step.line).toBeLessThanOrEqual(16)
      expect(words(step.stopsLine), step.stopsLine).toBeLessThanOrEqual(14)
    }
    expect(words(how.headline)).toBeLessThanOrEqual(6)
    expect(words(how.lede)).toBeLessThanOrEqual(30)
  })

  it('says the quotation is invented, and keeps the product in the future tense', () => {
    expect(how.lede).toMatch(/invented/i)
    expect(how.lede).toMatch(/being built/i)
  })

  it('writes no figure: the panels read every one off the evidence and the ledger', () => {
    expect(JSON.stringify(how)).not.toMatch(/EUR|\d+(\.\d+)?\s?%|\d,\d{3}/)
  })

  it('tells each step in the thread’s own terms', () => {
    const step = (key: string) => how.steps.find((entry) => entry.key === key)!
    expect(step('hold').line).toMatch(/three catalogue entries/)
    expect(step('price').line).toMatch(/six per cent/)
    expect(step('price').line).toMatch(/three weeks/)
    expect(step('price').line).toMatch(/arrives/)
    expect(step('decide').line.toLowerCase()).toContain('eighteen lines priced')
    expect(step('decide').line.toLowerCase()).toContain('two lines held')
    expect(step('decide').stopsLine).toMatch(/until a person/)
  })

  it('claims nothing, names no system and spends no motto', () => {
    claimsNothing(how)
  })
})

/**
 * Data and trust — the grid that stands where the badges would.
 *
 * Its states come from a closed set, each Decided entry is a promise already
 * on the record, each Built entry is something `standing` already says is
 * built, and no certification is named while none is held.
 */
describe('data and trust', () => {
  it('gives every commitment one of three states', () => {
    for (const commitment of trust.commitments) {
      expect(['Decided', 'Built', 'In build']).toContain(commitment.state)
      expect(words(commitment.title), commitment.title).toBeLessThanOrEqual(6)
    }
    expect(new Set(trust.commitments.map((commitment) => commitment.glyph)).size).toBe(
      trust.commitments.length,
    )
  })

  it('decides only what is already decided', () => {
    const decided = trust.commitments.filter((commitment) => commitment.state === 'Decided')
    expect(decided.map((commitment) => commitment.body)).toContain(access.decided.body)
    // The other decided promise is the approval boundary's own first clause.
    const approval = boundary.points.find((point) => point.title === 'Approval')!
    const promise = /^No quotation is sent, no price is committed and no order is confirmed\b/
    expect(approval.body).toMatch(promise)
    for (const commitment of decided) {
      const onRecord = commitment.body === access.decided.body || promise.test(commitment.body)
      expect(onRecord, commitment.title).toBe(true)
    }
  })

  it('calls built only what the build already says is built', () => {
    const built = standing.stages.find((stage) => stage.state === 'Built')!
    expect(built.body).toMatch(/approval routing/)
    expect(built.body).toMatch(/audit record/)
    const claimed = trust.commitments.filter((commitment) => commitment.state === 'Built')
    expect(claimed.map((commitment) => commitment.glyph).sort()).toEqual(['approval', 'record'])
  })

  it('keeps the open arrangements open, encryption among them', () => {
    expect(trust.open).toBe(access.open)
    expect(trust.open.body).toMatch(/being settled/i)
    expect(trust.open.body).toMatch(/encryption/i)
  })

  it('lists a certification only with its report, and says so while there are none', () => {
    for (const certification of trust.certifications) {
      expect(certification.report).toMatch(/^https:\/\/\S+$/)
    }
    if (trust.certifications.length === 0) {
      expect(trust.noCertification).toMatch(/^No certification is claimed/)
    }
  })

  it('claims nothing, names no framework and spends no motto', () => {
    claimsNothing({ ...trust, certifications: [] })
  })
})

describe('questions', () => {
  const answer = (question: RegExp) =>
    questions.items.find((item) => question.test(item.question))?.answer ?? ''

  it('answers in full, each one a question', () => {
    expect(questions.items.length).toBeGreaterThanOrEqual(5)
    for (const item of questions.items) {
      expect(item.question.trim().endsWith('?'), item.question).toBe(true)
      expect(item.answer.trim(), item.question).not.toBe('')
    }
  })

  /**
   * The owner decided on 22 October 2026 that Charlie is being built to ask
   * approved suppliers for a price. So the answers say what is true today —
   * nothing is sent on its own — and what is planned, gated by an approval.
   */
  it('says nothing is sent on its own, and that supplier contact is planned behind an approval', () => {
    expect(answer(/send quotations/)).toMatch(/^Not on its own\./)
    expect(answer(/send quotations/)).toMatch(/being built/)
    expect(answer(/send quotations/)).toMatch(/approves/)
    expect(answer(/suppliers/)).toMatch(/^Not today\./)
    expect(answer(/suppliers/)).toMatch(/arrives/)
    expect(answer(/suppliers/)).toMatch(/planned/)
    expect(answer(/suppliers/)).toMatch(/approval/)
  })

  it('reads the commitments from where they already live', () => {
    expect(answer(/train/)).toContain(access.decided.body)
    expect(answer(/early access/)).toBe(earlyAccess.next)
  })

  it('asks about systems rather than naming any', () => {
    expect(answer(/systems/)).toMatch(/form asks/)
  })

  it('claims nothing, names no system and spends no motto', () => {
    claimsNothing(questions)
  })
})

describe('the home page’s navigation', () => {
  it('points only at sections that exist on the page, or at the memo', () => {
    expect(Object.keys(home.nav)).toEqual(['how', 'trust', 'questions', 'contact'])
    expect(how.anchor).toBe('how')
    expect(trust.anchor).toBe('trust')
    expect(questions.anchor).toBe('questions')
  })
})

describe('the masthead’s menus', () => {
  const pages = new Set(['/', '/contact', charlie.path, security.path])
  const sections = new Set(['film', how.anchor, trust.anchor, questions.anchor])

  it('land every item on a page or a front-page section that exists', () => {
    for (const group of menu.groups) {
      for (const item of group.items) {
        const [path, hash] = item.href.split('#')
        expect(pages.has(path || '/'), item.href).toBe(true)
        if (hash) expect(sections.has(hash), item.href).toBe(true)
        expect(words(item.line), item.line).toBeLessThanOrEqual(10)
      }
    }
  })

  it('claims nothing, names no system and spends no motto', () => {
    claimsNothing(menu)
  })
})

/**
 * Charlie.
 *
 * Its scene is invented and says so first; its figures are tokens the
 * component fills from the evidence and the ledger; and every outward ability
 * — a request to a supplier, a call — is planned and waits for a person.
 */
describe('Charlie', () => {
  const states = ['Decided', 'Built', 'In build', 'Planned']

  it('says the conversation is invented and not yet built, in its first line', () => {
    expect(charlie.scene.licence).toMatch(/^Invented/)
    expect(charlie.scene.licence).toMatch(/not yet built/)
    expect(charlie.film.licence).toMatch(/invented/i)
  })

  it('writes no figure of its own: the scene reads them from the evidence and the ledger', () => {
    expect(JSON.stringify(charlie.scene)).not.toMatch(/EUR|\d+(\.\d+)?\s?%|\d+\.\d{2}|\d,\d{3}/)
    for (const message of charlie.scene.messages) {
      for (const token of message.text.match(/\{(\w+)\}/g) ?? []) {
        expect(
          ['{line}', '{was}', '{now}', '{leadWas}', '{leadNow}', '{margin}', '{floor}', '{priced}', '{held}', '{units}', '{part}'],
          token,
        ).toContain(token)
      }
    }
  })

  it('tells the night in order, starting at the hour the supplier answer arrives', () => {
    const hours = charlie.scene.messages.map((message) => message.at)
    expect([...hours].sort()).toEqual(hours)
    expect(hours[0]).toBe(glass.sources.documents.supplier.at)
    expect(hours).toContain(thread.beats.at(-1)!.at)
  })

  it('asks for an approval before anything leaves, and shows who gave it', () => {
    const asks = charlie.scene.messages.filter((message) => message.ask)
    expect(asks.length).toBeGreaterThanOrEqual(1)
    for (const message of asks) expect(message.decided).toMatch(/^Approved by /)
  })

  it('gives every ability a real state, and keeps every outward one planned and behind a person', () => {
    for (const ability of charlie.abilities.items) {
      expect(states).toContain(ability.state)
      expect(words(ability.title), ability.title).toBeLessThanOrEqual(5)
    }
    const outward = charlie.abilities.items.filter((ability) => ['ask', 'call'].includes(ability.glyph))
    expect(outward).toHaveLength(2)
    for (const ability of outward) expect(ability.state).toBe('Planned')
    const ask = charlie.abilities.items.find((ability) => ability.glyph === 'ask')!
    expect(ask.body).toMatch(/only once someone approves/)
    const approve = charlie.abilities.items.find((ability) => ability.glyph === 'approve')!
    expect(approve.state).toBe('Decided')
    // Nothing Charlie does is called built yet: widen to the type's own set to check.
    const claimed: ReadonlyArray<string> = charlie.abilities.items.map((ability) => ability.state)
    expect(claimed).not.toContain('Built')
  })

  it('films six abilities in a few words each, and writes no figure', () => {
    expect(charlie.film.steps.map((step) => step.key)).toEqual(['reads', 'cites', 'holds', 'makes', 'tells', 'asks'])
    for (const step of charlie.film.steps) {
      expect(words(step.title), step.title).toBeLessThanOrEqual(5)
      expect(words(step.line), step.line).toBeLessThanOrEqual(10)
    }
    expect(JSON.stringify(charlie.film)).not.toMatch(/EUR|\d+(\.\d+)?\s?%|\d+\.\d{2}/)
    // The beat that ends the film is the approval.
    expect(charlie.film.steps.at(-1)?.line).toMatch(/approves/)
  })

  it('keeps the product in the future tense', () => {
    expect(charlie.hero.lede).toMatch(/being built/)
    expect(charlie.act.lede).toMatch(/being built/i)
  })

  it('claims nothing, names no ERP or mail client, and spends no motto', () => {
    claimsNothing({ ...charlie, scene: { ...charlie.scene, messages: [] } })
    claimsNothing(charlie.scene.messages)
  })
})

/**
 * Security.
 *
 * The frameworks a buyer looks for are named here, and only here, each with
 * its real status in its own card: not held. Controls carry a state from the
 * closed set, and the ones that need a hosted environment are not called built.
 */
describe('security', () => {
  it('names each framework with a status that says it is not held', () => {
    expect(security.frameworks.items.length).toBeGreaterThanOrEqual(4)
    for (const framework of security.frameworks.items) {
      expect(['Not held · planned', 'Not yet assessed']).toContain(framework.status)
    }
    expect(security.frameworks.lede).toMatch(/None is held today/)
    expect(security.frameworks.note).toMatch(/^Not held means not held/)
  })

  it('gives every control a real state, and calls nothing hosted built', () => {
    for (const control of security.controls.items) {
      expect(['Decided', 'Built', 'In build', 'Planned']).toContain(control.state)
      if (/hosted/i.test(control.body)) expect(control.state).not.toBe('Built')
    }
    const titles = (state: string) =>
      security.controls.items.filter((control) => control.state === state).map((control) => control.title)
    expect(titles('Built')).toEqual(
      expect.arrayContaining(['Approval routing', 'Audit record']),
    )
    expect(titles('Planned')).toEqual(expect.arrayContaining(['SAML single sign-on', 'Encryption at rest and in transit']))
  })

  it('gives every card of protection a real state, and decides only what is on the record', () => {
    for (const principle of security.principles.items) {
      expect(['Decided', 'Built', 'In build', 'Planned']).toContain(principle.state)
      expect(words(principle.title), principle.title).toBeLessThanOrEqual(6)
    }
    const decided = security.principles.items.filter((principle) => principle.state === 'Decided')
    expect(decided.map((principle) => principle.glyph).sort()).toEqual(['sending', 'training'])
    const tested = security.principles.items.find((principle) => principle.glyph === 'test')!
    expect(tested.state).toBe('Planned')
  })

  it('answers the security questions in the tense of what exists', () => {
    const answer = (question: RegExp) =>
      security.questions.items.find((item) => question.test(item.question))?.answer ?? ''
    expect(security.questions.items.length).toBeGreaterThanOrEqual(5)
    for (const item of security.questions.items) expect(item.question.endsWith('?')).toBe(true)
    expect(answer(/hosted/)).toMatch(/being set up/)
    expect(answer(/leave/)).toMatch(/being built/)
    expect(answer(/tested/)).toMatch(/planned/)
    expect(answer(/trained/)).toMatch(/^No\./)
  })

  it('keeps the framework names off every front-page section', () => {
    const front = JSON.stringify([home, glass, how, trust, questions, standing, menu, charlie])
    for (const name of ['SOC 2', 'ISO/IEC', 'GDPR', 'CCPA']) expect(front, name).not.toContain(name)
  })

  it('claims no customer, no metric and no date, and spends no motto', () => {
    const text = JSON.stringify(security)
    for (const forbidden of ['trusted by', 'customers include', 'testimonial', 'certified', 'compliant', 'stay with the work']) {
      expect(text.toLowerCase()).not.toContain(forbidden)
    }
    for (const date of calendar) expect(text, date).not.toContain(date)
  })
})
