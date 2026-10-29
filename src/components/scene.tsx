import type { CSSProperties, ReactNode } from 'react'

/**
 * The pieces every scene is built from (`lib/motion.ts` says what a scene is).
 *
 * `at` puts a step on its scene's clock: its start in milliseconds, which the
 * stylesheet turns into an animation delay. `Swap` trades one state of a
 * thing for the next in the same place, so a change in a scene (waiting to
 * sent, a button to its stamp) never moves anything round it: both states are
 * laid in one cell, and the stylesheet shows the first until its moment, then
 * the second. On the server and under reduced motion the second is simply
 * what is there.
 */
export const at = (start: number) => ({ ['--at' as string]: start }) as CSSProperties

export function Swap({
  start,
  before,
  after,
  className,
}: {
  start: number
  before: ReactNode
  after: ReactNode
  className?: string
}) {
  return (
    <span className={`scene-swap ${className ?? ''}`}>
      <span data-swap="before" style={at(start)}>
        {before}
      </span>
      <span data-swap="after" style={at(start)}>
        {after}
      </span>
    </span>
  )
}
