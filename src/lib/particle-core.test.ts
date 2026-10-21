import { describe, expect, it } from 'vitest'
import { corePoint } from './particle-core'

describe('travelling particle wave', () => {
  it('keeps the layers finite and inside their drawing bounds over time', () => {
    for (const time of [0, 4, 100, 3600]) {
      for (let i = 0; i < 120; i++) {
        const point = corePoint(i, 120, time)
        expect(Math.abs(point.x)).toBeLessThan(2)
        expect(Math.abs(point.y)).toBeLessThan(1.5)
        expect(point.light).toBeGreaterThanOrEqual(0)
        expect(point.light).toBeLessThanOrEqual(1)
      }
    }
  })
  it('moves particles continuously and deterministically', () => {
    expect(corePoint(50, 120, 0)).toEqual(corePoint(50, 120, 0))
    expect(corePoint(50, 120, 4)).not.toEqual(corePoint(50, 120, 0))
    const a = corePoint(50, 120, 1)
    const b = corePoint(50, 120, 1.001)
    expect(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)).toBeLessThan(0.001)
  })
})
