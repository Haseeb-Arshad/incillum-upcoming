import { useEffect, useState } from 'react'

import type { Scene } from '#/lib/motion.ts'

/**
 * A figure that counts to itself once, when its scene plays.
 *
 * It reads a figure as it is printed ("42h", "7×", "20.0%", "EUR 11,520.00"),
 * counts only the number inside it and keeps everything around it, with the
 * same decimals and grouping, so the last frame is the printed figure exactly.
 * `from` counts from another printed figure instead of nought: a margin that
 * falls, say, from what it was to what it is.
 *
 * On the server, without a script and under reduced motion the scene is
 * `still`, and the figure is simply printed. While it moves, the figure a
 * screen reader hears is the printed one; the counting is only drawn.
 */

interface Figure {
  prefix: string
  value: number
  decimals: number
  grouped: boolean
  suffix: string
}

function parse(text: string): Figure | null {
  const match = /^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/.exec(text)
  if (!match) return null
  const [, prefix = '', number = '0', suffix = ''] = match
  return {
    prefix,
    value: Number(number.replaceAll(',', '')),
    decimals: number.split('.')[1]?.length ?? 0,
    grouped: number.includes(','),
    suffix,
  }
}

function format(figure: Figure, value: number): string {
  const digits = value.toLocaleString('en-GB', {
    minimumFractionDigits: figure.decimals,
    maximumFractionDigits: figure.decimals,
    useGrouping: figure.grouped,
  })
  return `${figure.prefix}${digits}${figure.suffix}`
}

export function CountUp({
  value,
  from,
  scene,
  duration = 1400,
  delay = 0,
  className,
}: {
  value: string
  from?: string
  scene: Scene
  /** Milliseconds the count takes, and how long it waits before it starts. */
  duration?: number
  delay?: number
  className?: string
}) {
  const [drawn, setDrawn] = useState<string | null>(null)

  useEffect(() => {
    if (scene !== 'playing') return
    const target = parse(value)
    if (!target) return
    const start = from ? (parse(from)?.value ?? 0) : 0
    const began = performance.now() + delay
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min(1, Math.max(0, (now - began) / duration))
      const eased = 1 - (1 - progress) ** 3
      setDrawn(progress < 1 ? format(target, start + (target.value - start) * eased) : null)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [scene, value, from, duration, delay])

  if (scene === 'still') return <span className={className}>{value}</span>

  const target = parse(value)
  const resting = scene === 'armed' && target ? format(target, from ? (parse(from)?.value ?? 0) : 0) : value
  return (
    <span className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">{drawn ?? resting}</span>
    </span>
  )
}
