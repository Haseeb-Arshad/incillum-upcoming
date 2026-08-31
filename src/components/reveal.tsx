import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { cn } from '#/lib/cn.ts'

import type { ElementType, ReactNode } from 'react'

/**
 * Scroll reveal, built as progressive enhancement.
 *
 * ── The failure mode this is shaped around ─────────────────────────────────
 *
 * The naive version renders `opacity: 0` and animates to 1 when an observer
 * fires. If JavaScript is slow, blocked, or throws anywhere before the effect
 * runs, the visitor gets a blank page — and a crawler, which does not scroll,
 * gets one too. That is a marketing site that occasionally serves nothing, and
 * it fails silently.
 *
 * So the element is fully visible in server HTML and stays visible until the
 * component has decided it is safe to animate. Only then does CSS take over. A
 * visitor with no JavaScript, a slow connection, or a hydration error always
 * sees the content; the worst case is that it does not move.
 *
 * ── Why not Framer Motion ──────────────────────────────────────────────────
 *
 * This is eleven lines of CSS and one IntersectionObserver. An animation
 * library would be the largest dependency in the project, shipped to every
 * visitor, to fade six elements.
 *
 * ── The numbers ────────────────────────────────────────────────────────────
 *
 * 10px and 520ms on the site's one easing curve. Small enough that it reads as
 * the page settling rather than as things flying in, which is the difference
 * between polish and a template. Movement is opacity and `translate3d` only —
 * both composited, neither able to trigger layout — and `prefers-reduced-motion`
 * removes it entirely rather than shortening it.
 */

/** A subscription that never fires: the answer cannot change after hydration. */
const neverChanges = () => () => {}

/**
 * True once React is running on the client *and* an IntersectionObserver exists
 * to un-hide things again.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect`. The effect
 * version is the pattern everybody writes, and React 19 is right to flag it:
 * it sets state synchronously during the commit, which schedules a second
 * render of every revealed element on the page for a value that was knowable
 * without rendering at all. This form gives the server `false` and the client
 * `true` in a single pass.
 *
 * Folding the observer check in here is what removes the other failure mode. If
 * `IntersectionObserver` is missing, nothing ever becomes animatable, so nothing
 * is ever hidden — rather than being hidden by CSS and waiting on a callback
 * that will never come.
 */
function useAnimatable(): boolean {
  return useSyncExternalStore(
    neverChanges,
    () => typeof IntersectionObserver !== 'undefined',
    () => false,
  )
}

export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  /**
   * Milliseconds. Keep the total spread across a group under ~180ms; past that
   * a stagger stops reading as one movement and starts reading as latency.
   */
  delay?: number
  as?: ElementType
}) {
  const ref = useRef<HTMLElement | null>(null)
  const animatable = useAnimatable()
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || !animatable) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        setRevealed(true)
        // Once is enough. A section that re-fades every time it re-enters the
        // viewport turns scrolling back up into a light show.
        observer.disconnect()
      },
      // Fires a little before the element's top edge reaches the fold, so the
      // movement is finishing as it arrives rather than starting.
      { rootMargin: '0px 0px -10% 0px' },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [animatable])

  return (
    <Tag
      ref={ref}
      className={cn('ic-reveal', className)}
      data-animatable={animatable ? 'true' : 'false'}
      data-revealed={revealed ? 'true' : 'false'}
      style={delay ? { ['--ic-reveal-delay' as string]: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
