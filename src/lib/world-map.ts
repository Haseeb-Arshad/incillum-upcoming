import { world } from '#/lib/world.ts'

/**
 * The world in dots, for the figures on the front page (`components/case.tsx`).
 *
 * The land is `lib/world.ts`: Natural Earth's land on a regular grid in
 * Miller's projection, from `design/generate-world.mjs`, cropped the way the
 * reference map the owner pointed at is cropped. Every land cell is one dot,
 * all of them the same size and the same tone: the map is the ground the
 * figures stand on, not a chart, so nothing on it is marked out.
 */

/** The drawing's units per cell. */
export const pitch = 10

/**
 * Every land cell as a dot, drawn as one path of zero-length strokes with
 * relative moves: one element and a few bytes a dot, however many there are.
 */
export function drawLand(): string {
  let path = ''
  let last: [number, number] | null = null
  for (const [row, line] of world.land.entries()) {
    for (const [column, mark] of [...line].entries()) {
      if (mark !== '#') continue
      const x = (column + 0.5) * pitch
      const y = (row + 0.5) * pitch
      path += last ? `m${x - last[0]} ${y - last[1]}h0` : `M${x} ${y}h0`
      last = [x, y]
    }
  }
  return path
}

export const view = { width: world.columns * pitch, height: world.rows * pitch } as const
