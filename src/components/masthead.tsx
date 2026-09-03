import { useCallback, useSyncExternalStore } from 'react'

import { Mark } from '#/components/mark.tsx'
import { ButtonLink, Container } from '#/components/primitives.tsx'
import { brand } from '#/content/site.ts'

/**
 * The masthead.
 *
 * Mark and wordmark on the left, one black button on the right — the shape a serious
 * software company's header has — with the six-item product menu that normally
 * sits between them removed rather than emptied.
 *
 * That removal is the point. A navigation bar is a promise that there are
 * places to go, and on a pre-launch site every one of those places is either a
 * page that does not exist yet or a way to leave the only thing being asked
 * for. What is left is the minimum a stranger needs: who is asking, and the
 * action.
 *
 * ── The stage label is gone ────────────────────────────────────────────────
 *
 * There was a PRIVATE PREVIEW chip beside the wordmark. It came off when the
 * site went public: a page anybody can reach that calls itself private is
 * either lying or telling the visitor they are not the audience. Nothing
 * replaced it, and nothing should — it was the only element up here announcing
 * a stage rather than doing a job, and the wordmark is better alone.
 *
 * ── Sticky, which it was not at first ──────────────────────────────────────
 *
 * The original reasoning — that a bar following you down a short page to offer
 * something already on screen is furniture — was sound at four screens. The
 * page is six now, and past about five the form is genuinely gone: a reader
 * convinced by §04 would have to scroll back through two sections to act. One
 * button that is always there is the cheapest possible fix.
 *
 * `bg-paper` is solid rather than translucent-with-blur. A backdrop filter over
 * a surface that is one flat off-white buys no depth, costs a compositing layer
 * on every scroll frame, and leaves a faint seam where the blurred strip meets
 * the identical colour beneath it.
 *
 * It also has to stay solid now that there is a night in the middle of the
 * page. A translucent header would show the dark band moving through it for
 * four screens; a header that inverted along with the band would change colour
 * twice a visit. It stays paper, and the night scrolls underneath it — which is
 * the correct reading anyway, since the masthead is the part of the page that
 * is always in the room.
 *
 * ── What happens on scroll ─────────────────────────────────────────────────
 *
 * The bottom rule strengthens, and only that. At rest the masthead should feel
 * like part of the page rather than a bar sitting on top of it, and the hairline
 * that separates them is doing no work while the page is at the top. Once
 * content is running underneath, the same hairline has a job, so it gets darker.
 *
 * It is one token step, on a 300ms transition, and it is the entire animation:
 * a header that shrinks, gains a shadow and swaps its logo on scroll is four
 * effects doing what one border can do.
 */

/**
 * True once the page has scrolled past `offset`.
 *
 * `useSyncExternalStore`, not `useState` + `useEffect`. The effect version has
 * to seed the initial value with a synchronous `setState` during commit, which
 * React 19 flags as a cascading render — and it is right to: the value is
 * readable without rendering. This form hands the server `false` (matching what
 * SSR can know) and the client the real answer in one pass.
 *
 * The store notifies on a rAF-throttled scroll, but React only re-renders when
 * the *snapshot* changes. Since the snapshot is a boolean, reading a six-screen
 * page schedules two renders rather than several hundred — the threshold
 * crossing is free, done by React's own comparison.
 *
 * The listener is passive. A non-passive scroll listener blocks the compositor
 * and is felt as stutter on a trackpad even when the handler does nothing.
 */
function useScrolledPast(offset = 8): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        onChange()
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return useSyncExternalStore(
    subscribe,
    () => window.scrollY > offset,
    () => false,
  )
}

export function Masthead() {
  const scrolled = useScrolledPast()

  return (
    <header
      data-scrolled={scrolled ? 'true' : 'false'}
      className="sticky top-0 z-40 border-b border-line bg-paper transition-[border-color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-[scrolled=true]:border-line-strong"
    >
      <Container className="flex h-[72px] items-center justify-between gap-6 sm:h-20">
        {/*
          The mark identifies the brand at a glance; the wordmark stays as live
          text so it remains crisp, searchable and available to assistive
          technology.

          The mark is inline SVG rather than the `logo.png` that used to be
          here: a rose curve, rasterised, 224 kB on every page load, and a grey
          smudge at the one size a brand mark has to survive. This is about
          three hundred bytes, inherits `currentColor`, and cannot shift the
          layout while it loads because there is nothing to load. See
          `components/mark.tsx` for why this shape and not the seven others in
          `design/marks/`.

          `aria-hidden` on the mark and a plain text wordmark beside it, so the
          brand is announced once. The container carries no `aria-label` — one
          on a `div` wrapping readable text is a second name for the same thing,
          and some screen readers then read the label instead of the text.
        */}
        <div className="flex min-w-0 items-center gap-2.5">
          <Mark className="size-7 shrink-0 text-ink sm:size-8" />
          <span className="font-display text-[1.5rem] leading-none tracking-[-0.02em] text-ink sm:text-[1.75rem]">
            {brand.name}
          </span>
        </div>

        {/*
          Names the act, where the form column names the thing. Two verbs for
          one action is how a page ends up with a reader wondering whether the
          waitlist and early access are different lists.
        */}
        <ButtonLink href="#waitlist" tone="primary" size="md" arrow>
          Join early access
        </ButtonLink>
      </Container>
    </header>
  )
}
