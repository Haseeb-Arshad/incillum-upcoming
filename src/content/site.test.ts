import { describe, expect, it } from 'vitest'

import { access, artifact, direction, hero, outline } from '#/content/site.ts'

/**
 * The example output has to add up.
 *
 * `artifact` is the one block on this site that prints figures, and the reader
 * it exists for is a controller who will check them — quietly, in about four
 * seconds, and then decide what to think about everything else on the page. An
 * illustration of a three-way match that does not reconcile is worse than no
 * illustration, and it fails in front of exactly the audience it was built for.
 *
 * The numbers are also the easiest thing on the site to break by accident. They
 * live in four places that have to agree — three table rows, a document line
 * and a sentence naming the break — and a copy edit to any one of them looks
 * completely harmless in review. So the arithmetic is asserted rather than
 * remembered.
 *
 * These are tests of internal consistency, not of anything the software has
 * done. Everything in `artifact` is invented; see its comment in site.ts.
 */

/** `£18,240.00` → `18240`. Returns `null` when the string is not money. */
function money(value: string): number | null {
  const match = /£([\d,]+(?:\.\d{2})?)/.exec(value)
  if (!match?.[1]) return null
  return Number(match[1].replaceAll(',', ''))
}

/** `480 units` → `480`. */
function units(value: string): number | null {
  const match = /^(\d+) units$/.exec(value)
  return match?.[1] ? Number(match[1]) : null
}

/** `18240` → `£18,240.00`, in the format the copy is written in. */
function formatMoney(value: number): string {
  return `£${value.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

describe('the example three-way match', () => {
  const rows = artifact.record.matchRows
  const [invoice, purchaseOrder, goodsReceipt] = rows

  it('is three rows, exactly one of which broke', () => {
    expect(rows).toHaveLength(3)
    expect(rows.filter((row) => !row.agrees)).toHaveLength(1)
    expect(goodsReceipt.agrees).toBe(false)
  })

  /**
   * The invoice and the purchase order agreeing on every figure is what makes
   * this a *quantity* break rather than a price dispute — which is what the
   * copy below the table says it is, and what the drafted supplier email asks
   * about. Let one of them drift and the block quietly describes a different
   * exception from the one it narrates.
   */
  it('breaks on quantity alone: invoice and purchase order agree throughout', () => {
    expect(invoice.quantity).toBe(purchaseOrder.quantity)
    expect(invoice.total).toBe(purchaseOrder.total)
  })

  it('prices every row identically, so the only variable is quantity', () => {
    const unitPrices = rows.map((row) => {
      const total = money(row.total)
      const quantity = units(row.quantity)
      expect(total).not.toBeNull()
      expect(quantity).not.toBeNull()
      return total! / quantity!
    })

    expect(new Set(unitPrices).size).toBe(1)
  })

  it('names the shortfall in the sentence, to the penny', () => {
    const billed = money(invoice.total)!
    const received = money(goodsReceipt.total)!
    const shortfall = billed - received

    expect(shortfall).toBeGreaterThan(0)
    expect(artifact.record.discrepancy.body).toContain(formatMoney(shortfall))
    expect(artifact.record.decision.body).toContain(formatMoney(shortfall))
  })

  it('quotes the unit price in the sentence that does the arithmetic', () => {
    const unitPrice = money(invoice.total)! / units(invoice.quantity)!
    expect(artifact.record.discrepancy.body).toContain(formatMoney(unitPrice))
  })

  it('shows the invoice total on the document line above the table', () => {
    expect(artifact.record.document).toContain(invoice.total)
  })

  /**
   * The decision this record hands back is a person's, and saying so is the
   * argument the whole page makes. A copy edit that drops it turns the example
   * into a picture of software posting to a ledger on its own.
   */
  it('leaves the posting and the payment to a person', () => {
    expect(artifact.record.decision.body).toMatch(/nothing posts and no money moves/i)
  })
})

describe('the example output', () => {
  /**
   * The block is a mock-up on a site whose stated rule is that it shows no
   * screenshots. What makes that honest is one sentence, above the panel, at
   * reading size. If it moves, shrinks, or softens, the block stops being an
   * illustration and starts being a product shot.
   */
  it('says it is invented, in its own lede', () => {
    expect(artifact.lede).toMatch(/invented/i)
    expect(artifact.lede).toMatch(/not a screenshot/i)
  })

  it('is labelled as an example', () => {
    expect(artifact.label.toLowerCase()).toContain('example')
  })
})

/**
 * The system names, and the discipline holding them.
 *
 * NetSuite, Sage Intacct and Xero are the only vendor names on the site, and
 * naming them is what turns "for finance teams" into a line a controller can
 * act on. They are also one careless edit from being an integrations claim,
 * which AGENTS.md §5 forbids outright.
 *
 * Two things keep them honest, and both are asserted here: they appear in
 * exactly two places, and each of those places carries a sentence putting it in
 * the future. The failure mode is not somebody writing "integrations" — it is a
 * third mention appearing somewhere with no tense contract around it, most
 * likely in `direction`, where a list of instructions with a system under each
 * one would read as a connector grid.
 */
describe('the vendor names', () => {
  const ERPS = ['NetSuite', 'Sage Intacct', 'Xero']

  /** Every string in the deck, flattened, with the two licensed homes removed. */
  function everywhereElse(): string {
    const { qualifier: _qualifier, ...restOfHero } = hero
    const { lede: _lede, ...restOfOutline } = outline
    return JSON.stringify([restOfHero, restOfOutline, direction, artifact, access])
  }

  it('names them where the copy needs them', () => {
    for (const erp of ERPS) {
      expect(hero.qualifier).toContain(erp)
      expect(outline.lede).toContain(erp)
    }
  })

  it('puts both of those places in the future tense', () => {
    expect(hero.qualifier).toMatch(/built for/i)
    expect(outline.lede).toMatch(/being built against/i)
  })

  /**
   * The one that will actually fail one day. `direction` is four instructions
   * that look exactly like a place to hang a system name, which is precisely
   * what the reference design for that section did with vendor logos.
   */
  it('names them nowhere else, and never under an instruction', () => {
    const rest = everywhereElse()
    for (const erp of ERPS) {
      expect(rest).not.toContain(erp)
    }
  })
})

describe('how you ask', () => {
  it('puts the instructions in the future tense', () => {
    expect(direction.lede).toMatch(/being built to take/i)
  })

  /**
   * The inversion this section is built on: where the reference design listed
   * the vendors each instruction reaches, every entry here has to say what it
   * hands back rather than settles. An instruction with no limit beside it is
   * the pattern this section was written to avoid.
   */
  it('gives every instruction something it hands back', () => {
    expect(direction.instructions.length).toBeGreaterThan(0)
    for (const instruction of direction.instructions) {
      expect(instruction.reads.trim()).not.toBe('')
      expect(instruction.handsBack.trim()).not.toBe('')
    }
  })

  /**
   * The reader gives a standing rule about Halstead in this section and finds
   * the held Halstead invoice one section below. Rename the supplier in one
   * place and this fails rather than the through-line quietly breaking.
   */
  it('hands the reader on to the example output by name', () => {
    const supplier = artifact.record.supplier.split(' ')[0]
    expect(supplier).toBeTruthy()
    expect(direction.instructions.some((one) => one.say.includes(supplier!))).toBe(true)
  })
})

describe('data and access', () => {
  /**
   * §5 forbids compliance claims, and this is the only section on the site
   * where one would look at home. There is no certification to name, so naming
   * one — or naming a framework in a way a reader would take for one — is the
   * failure this guards.
   */
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

  /**
   * The admission is the point. A future edit that answers residency or
   * retention here, to make the section read more confidently, is exactly the
   * sentence this site exists not to write — it moves up into `decided` when it
   * is true, and not before.
   */
  it('keeps saying that the rest is open', () => {
    expect(access.open.body).toMatch(/being settled/i)
  })
})
