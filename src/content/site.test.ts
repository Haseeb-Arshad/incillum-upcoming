import { describe, expect, it } from 'vitest'

import { artifact } from '#/content/site.ts'

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
