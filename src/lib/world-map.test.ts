import { describe, expect, it } from 'vitest'

import { drawLand, pitch, view } from '#/lib/world-map.ts'
import { world } from '#/lib/world.ts'

/** The map is the generator's grid, drawn whole: one dot a land cell, and nothing else. */
describe('the world in dots', () => {
  it('draws every land cell once, as one path', () => {
    const land = world.land.join('').split('#').length - 1
    const path = drawLand()
    expect(path).toMatch(/^M/)
    expect(path.match(/h0/g)).toHaveLength(land)
  })

  it('keeps the grid whole and square', () => {
    expect(world.land).toHaveLength(world.rows)
    for (const line of world.land) expect(line).toHaveLength(world.columns)
    expect(view).toEqual({ width: world.columns * pitch, height: world.rows * pitch })
  })

  it('is cropped the way the reference map is: the Americas, the Atlantic, Europe and Africa', () => {
    expect(world.west).toBeLessThanOrEqual(-165)
    expect(world.east).toBeGreaterThanOrEqual(40)
    expect(world.east).toBeLessThan(90)
  })
})
