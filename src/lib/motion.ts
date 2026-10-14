import { useEffect, useState, useSyncExternalStore } from 'react'

import type { RefObject } from 'react'

/**
 * The three questions a moving page has to ask before it moves anything.
 *
 * Each is answered without a library and without the `useState` + `useEffect`
 * pattern that sets state during commit (see the note in `reveal.tsx`). The
 * first two are external stores read through `useSyncExternalStore`, which gives
 * the server one answer and the client another in a single pass; the third is
 * an IntersectionObserver whose callback is the only thing that sets state.
 */

/** A subscription that never fires: the answer cannot change after hydration. */
const neverChanges = () => () => {}

/**
 * True once React is running on the client.
 *
 * The server and the render that hydrates its HTML both get `false`, so the
 * server's HTML is the page a visitor without JavaScript reads, and anything
 * that renders differently with a script attached does so one render after
 * hydration rather than during it.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  )
}

/**
 * True on a client that has an IntersectionObserver — the condition for
 * staging anything by where the reader is. Without one, whatever would have
 * waited to be seen renders in its final state instead of waiting forever.
 */
export function useObservable(): boolean {
  return useSyncExternalStore(
    neverChanges,
    () => typeof IntersectionObserver !== 'undefined',
    () => false,
  )
}

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/**
 * The reader's reduced-motion setting, live.
 *
 * `false` on the server, which is safe only because nothing that reads it
 * starts moving on its own before hydration — the CSS carries its own
 * `prefers-reduced-motion` rules for everything that would.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false,
  )
}

/**
 * Whether an element is on screen, as one boolean.
 *
 * Re-renders when the answer flips and at no other time, which is the whole
 * reason it is an observer rather than a scroll listener. With no
 * IntersectionObserver it stays `false`, and everything that waits on it simply
 * never starts — the page does not move, and nothing is hidden by the wait.
 */
export function useInView(ref: RefObject<Element | null>, threshold: number): boolean {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? false),
      { threshold },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, threshold])

  return inView
}
