import { describe, expect, it } from 'vitest'
import { channels, dustCount, seeds } from './dust'

describe('dust', () => {
  it('seeds the same grains every time, so the still frame is one frame', () => {
    expect(seeds(500)).toEqual(seeds(500))
    expect(seeds(500, 8)).not.toEqual(seeds(500))
  })

  it('keeps every grain inside the ranges the shader reads them in', () => {
    const data = seeds(20_000)
    expect(data).toHaveLength(80_000)
    for (let index = 0; index < 20_000; index += 1) {
      expect(Math.abs(data[index * 4]!)).toBeLessThanOrEqual(1.25)
      for (const offset of [1, 2, 3]) {
        expect(data[index * 4 + offset]).toBeGreaterThanOrEqual(0)
        expect(data[index * 4 + offset]).toBeLessThan(1)
      }
    }
  })

  it('weights the grains toward the near rows, which the perspective spreads thinnest', () => {
    const data = seeds(20_000)
    let near = 0
    for (let index = 0; index < 20_000; index += 1) if (data[index * 4 + 1]! < 0.5) near += 1
    expect(near / 20_000).toBeGreaterThan(0.6)
  })

  it('scales the count with the area, inside what a phone and a wide screen can both fill', () => {
    expect(dustCount(390, 844)).toBe(29_924)
    expect(dustCount(1440, 900)).toBe(117_818)
    expect(dustCount(200, 200)).toBe(20_000)
    expect(dustCount(3840, 2160)).toBe(120_000)
  })

  it('gives the morning’s two ribbons far fewer grains, since they gather them into thin bands', () => {
    expect(dustCount(1440, 900, 'morning')).toBe(48_000)
    expect(dustCount(390, 630, 'morning')).toBe(14_000)
    expect(dustCount(1440, 900, 'morning')).toBeLessThan(dustCount(1440, 900))
  })

  it('reads a computed colour into channels', () => {
    expect(channels('rgb(242, 242, 238)')).toEqual([242 / 255, 242 / 255, 238 / 255])
    expect(channels('rgba(17, 17, 16, 0.5)')).toEqual([17 / 255, 17 / 255, 16 / 255])
  })
})
