import { describe, expect, it } from 'vitest'
import { fieldPoint, projectFieldPoint } from './particle-field.ts'

describe('particle field geometry', () => {
  it('keeps every projected particle finite throughout the formation cycle', () => {
    for (const time of [0, 4, 12, 20, 32, 10000]) {
      for (let sample = 0; sample <= 100; sample++) {
        const point = fieldPoint(sample / 100, (sample % 32) / 32, time)
        for (const compact of [true, false]) {
          const screen = projectFieldPoint(point, compact ? 390 : 1440, 700, compact)
          expect(Object.values(screen).every(Number.isFinite)).toBe(true)
          expect(screen.perspective).toBeGreaterThan(0)
          expect(screen.depth).toBeGreaterThanOrEqual(0.15)
          expect(screen.depth).toBeLessThanOrEqual(1)
        }
      }
    }
  })

  it('fades the wrapping seam and evolves smoothly rather than teleporting', () => {
    expect(fieldPoint(0, 0.4, 10).envelope).toBe(0)
    expect(fieldPoint(1, 0.4, 10).envelope).toBeLessThan(0.001)
    for (let time = 0; time < 40; time += 0.2) {
      const a = fieldPoint(0.37, 0.4, time)
      const b = fieldPoint(0.37, 0.4, time + 1 / 30)
      expect(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)).toBeLessThan(0.05)
    }
    expect(fieldPoint(0.37, 0.4, 12)).not.toEqual(fieldPoint(0.37, 0.4, 0))
  })
})
