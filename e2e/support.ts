import type { Locator } from '@playwright/test'

/**
 * The cards on the trust board whose contents run past their own padding.
 *
 * An email whose attachments touched its lower border was the first fault the
 * owner saw in the board, and a fixed height cannot tell. Each card's rows are
 * laid out inside it, so the last must end above the card's padding, and none
 * may reach past the right-hand one. Returns a line for each that does, so an
 * empty list is a board that holds what is in it.
 */
export async function cramped(map: Locator): Promise<string[]> {
  return map.evaluate((drawing) => {
    const found: string[] = []
    for (const card of drawing.querySelectorAll(
      '.trust-email, .trust-gate, .trust-out',
    )) {
      const box = card.getBoundingClientRect()
      const style = getComputedStyle(card)
      const bottom =
        box.bottom - parseFloat(style.borderBottomWidth) - parseFloat(style.paddingBottom)
      const right =
        box.right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight)
      for (const row of card.children) {
        const rect = row.getBoundingClientRect()
        if (rect.bottom > bottom + 1) {
          found.push(
            `${card.className} / ${row.className}: ${(rect.bottom - bottom).toFixed(1)}px past the bottom`,
          )
        }
        if (rect.right > right + 1) {
          found.push(
            `${card.className} / ${row.className}: ${(rect.right - right).toFixed(1)}px past the right`,
          )
        }
      }
    }
    return found
  })
}
