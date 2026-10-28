import { useEffect, useRef } from 'react'

import type { RefObject } from 'react'

import { channels, createDust } from '#/lib/dust.ts'

import type { Dust, DustScene, DustTone } from '#/lib/dust.ts'

/**
 * The field — the night's dust, at the two ends of the page.
 *
 * ── Where it lies ──────────────────────────────────────────────────────────
 *
 * Twice, in ink, and never in the signal: it is not one of the places
 * something is lit.
 *
 *   - **The night.** Under the hero, as a landscape. The opening's beats have
 *     the night to themselves: it is dark under all three. Then, as the last
 *     one leaves and the page assembles, the night comes up behind it, slowly
 *     — the crests catch the light first and it spreads down into the
 *     troughs — while the landscape rises a little into its place. Nothing in
 *     it moves to get there but that rise; only the light changes. It clears
 *     a space behind the centred type, so the form is never read through it.
 *     As the reader scrolls it falls behind at a little under half the page's
 *     speed, and it has faded out by the time the film is on screen.
 *   - **The morning.** Around the photograph at the close, on the desk: the
 *     same dust let loose in the room, motes scattered at random, each
 *     wandering on its own path, catching a soft band of daylight.
 *
 * ── How it keeps time with the type ────────────────────────────────────────
 *
 * The night follows the opening's own clock, read off its CSS animations: it
 * begins to come up just before the page assembles, so the headline arrives
 * first and the light rises around it. It does not wait for the page to say
 * the opening has ended — that arrives a render late. The dawn eases in and
 * out over a little more than three seconds.
 *
 * It was tried twice the other way. Unrolled out of a slit of light under the
 * last beat, it read as an event under "Meet Charlie." — Charlie leaving and
 * the dust arriving — and the owner rejected it. Brought up across all three
 * beats, it depended on the page hydrating early, which on a busy machine it
 * does not: the field can only start once the page has hydrated, two or three
 * seconds in. Waiting for the page to assemble, it is ready almost
 * everywhere, so every reader sees the same dawn. Where it is not, the dawn
 * starts late at its own pace rather than hurrying, and a stall in the page is
 * not time it travelled through. Ended early, it comes up from wherever it
 * was; on a return this visit there is no opening to follow, and it is simply
 * lit.
 *
 * ── How it moves, and when it stops ────────────────────────────────────────
 *
 * Every frame while it forms or settles, then its own drift at thirty frames a
 * second; only while it is on screen, not faded out, and the tab is visible.
 * The scroll is written straight to the element on an animation frame so
 * scrolling never re-renders anything. Under reduced
 * motion it draws one still frame of its final state and does neither. Without
 * a script or without WebGL it is simply absent — it is decoration, and the page
 * reads the same without it. The renderer is `lib/dust.ts`.
 */

/**
 * The landscape as the dawn begins, at the hero, and on the desk in the
 * morning — each composed twice, for a wide screen and a narrow one, and
 * blended by the field's own shape. Wide, the swells rise at the edges and the
 * words sit just above the bright far ridge. Narrow, there is no room for tall
 * edges, so the camera stands higher and the landscape lies lower, under the
 * type rather than through it. The dawn begins with the horizon a little
 * lower than the hero's, and the landscape rises into place as it comes up.
 * The hero clears the grains behind its headline, keeping the bright ridge
 * away from the type.
 */
const scenes = {
  dawn: {
    wide: { horizon: 0.62, camera: 1.4, swell: 1.4, level: 0.62, clear: 0.85, flank: 1, fade: [0.04, 0.9] },
    narrow: { horizon: 0.7, camera: 2, swell: 1.4, level: 0.62, clear: 0.85, flank: 0.25, fade: [0.04, 0.86] },
  },
  hero: {
    wide: { horizon: 0.56, camera: 1.4, swell: 1.4, level: 0.62, clear: 0.85, flank: 1, fade: [0.04, 0.9] },
    narrow: { horizon: 0.64, camera: 2, swell: 1.4, level: 0.62, clear: 0.85, flank: 0.25, fade: [0.04, 0.86] },
  },
  // The motes read only the level and the fade.
  morning: {
    wide: { horizon: 0.3, camera: 1.6, swell: 1, level: 0.9, clear: 0, flank: 1, fade: [0.03, 0.98] },
    narrow: { horizon: 0.3, camera: 2, swell: 1, level: 0.7, clear: 0, flank: 0.25, fade: [0.03, 0.98] },
  },
} satisfies Record<string, Record<'wide' | 'narrow', Composition>>

/** The moment of the swells the scene was composed at, so the first frame and the still frame are that one. */
const START = 12
/**
 * The night coming up: from just before the opening ends, as the last beat
 * finishes leaving and the headline begins to arrive, over a little more than
 * three seconds. It is the same length however late the page hydrated — a late
 * dawn starts late rather than hurrying, because hurrying is what made it read
 * as an event. As it comes up the landscape rises a little into the hero's
 * place, over most of the same time.
 */
const DAWN_LEAD = 200
const DAWN = 3200
const SETTLE_SHARE = 0.8
/** The most one frame may move it, however long the frame took. */
const STALL = 50
/** How long it takes to come up once the opening has been ended early. */
const DAWN_SKIPPED = 2400
/** The drift's frame interval, once nothing is forming or settling. */
const DRIFT = 1000 / 30

/** A scene without the formation, which is the field's own state rather than a composition. */
type Composition = Omit<DustScene, 'form'>

const mix = (from: number, to: number, amount: number) => from + (to - from) * amount

/** Ease in and out, so a movement neither starts with a jolt nor stops with one. */
function smooth(amount: number): number {
  const x = Math.min(1, Math.max(0, amount))
  return x * x * (3 - 2 * x)
}

/**
 * The opening's own clock, read off its animations: when the page assembles,
 * on the timeline `requestAnimationFrame` reports. Null when there is nothing
 * left to follow.
 */
function openingEnd(element: HTMLElement | null | undefined): number | null {
  if (!element || typeof element.getAnimations !== 'function') return null
  const now = performance.now()
  let end = 0
  for (const animation of element.getAnimations({ subtree: true })) {
    // Still pending, it starts on the next frame, which is now as near as matters.
    const began = typeof animation.startTime === 'number' ? animation.startTime : now
    end = Math.max(end, began + Number(animation.effect?.getComputedTiming().endTime ?? 0))
  }
  return end > now ? end : null
}

function blend(from: Composition, to: Composition, amount: number): Composition {
  return {
    horizon: mix(from.horizon, to.horizon, amount),
    camera: mix(from.camera, to.camera, amount),
    swell: mix(from.swell, to.swell, amount),
    level: mix(from.level, to.level, amount),
    clear: mix(from.clear, to.clear, amount),
    flank: mix(from.flank, to.flank, amount),
    fade: [mix(from.fade[0], to.fade[0], amount), mix(from.fade[1], to.fade[1], amount)],
  }
}

/** A canvas's shape, from a phone held upright (0) to a wide screen (1). */
const wideness = (width: number, height: number) =>
  Math.min(1, Math.max(0, (width / Math.max(1, height) - 0.6) / 0.8))

export function GlassField({
  tone = 'night',
  opening,
  skipped = false,
  until,
}: {
  tone?: DustTone
  /** The night only: the opening whose clock it keeps. */
  opening?: RefObject<HTMLElement | null>
  /** The night only: whether the reader ended the opening early. */
  skipped?: boolean
  /** The night only: what it has faded out for by the time it is on screen. */
  until?: RefObject<HTMLElement | null>
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const skippedRef = useRef(skipped)
  const wakeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    skippedRef.current = skipped
    wakeRef.current?.()
  }, [skipped])

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return

    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    const color = channels(getComputedStyle(root).color)
    let dust: Dust | null = createDust(canvas, tone, color)
    let frame = 0
    let scrollFrame = 0
    let time = START
    let previous = 0
    let intersecting = true
    let faded = false
    let wide = 1
    /**
     * The night, from dark (0) to lit (1), and from where the dawn begins (0)
     * to the hero's place (1). It comes up once, as the opening ends.
     */
    let form = 1
    let settle = 1
    /** When the night last moved, so a stalled frame is not counted as time it travelled through. */
    let moved = 0
    /** Whether the canvas has been cleared and nothing on it is lit yet, so there is nothing to draw. */
    let blank = false
    const assembles = tone === 'night' && !motion.matches ? openingEnd(opening?.current) : null
    /**
     * The dawn once it has begun — where the night was, how long it has run,
     * and how long it has to run. It begins on the opening's clock, at once if
     * the reader ends the opening early, and at once if the opening ran its
     * course before the page could follow it.
     */
    let dawn: { since: number; form: number; settle: number; length: number } | null = null
    if (assembles) {
      form = 0
      settle = 0
    } else if (tone === 'night' && !motion.matches && opening?.current?.getClientRects().length) {
      form = 0
      settle = 0
      dawn = { since: 0, form: 0, settle: 0, length: DAWN }
    }

    /** Where the night is at this moment. */
    function advance(now: number) {
      // A stall — the page hydrating under it — is not time the night travelled through: it goes on from where it was.
      const step = moved ? Math.min(Math.max(0, now - moved), STALL) : 0
      moved = now
      if (form >= 1 && settle >= 1) return
      if (skippedRef.current && (!dawn || dawn.length > DAWN_SKIPPED)) {
        dawn = { since: 0, form, settle, length: DAWN_SKIPPED }
      } else if (!dawn && assembles && now >= assembles - DAWN_LEAD) {
        dawn = { since: 0, form, settle, length: DAWN }
      } else if (dawn) {
        dawn.since += step
      }
      if (!dawn) return
      form = mix(dawn.form, 1, smooth(dawn.since / dawn.length))
      settle = mix(dawn.settle, 1, smooth(dawn.since / (dawn.length * SETTLE_SHARE)))
    }

    function scene(): DustScene {
      const at = (pair: Record<'wide' | 'narrow', Composition>) => blend(pair.narrow, pair.wide, wide)
      if (tone === 'morning') return { ...at(scenes.morning), form: 1 }
      return { ...blend(at(scenes.dawn), at(scenes.hero), settle), form }
    }

    function render() {
      if (!dust || !root) return
      // Unlit, it is cleared once and then left alone: no point drawing a hundred thousand dark grains a frame.
      if (form > 0 || !blank) dust.draw(time, scene())
      blank = form <= 0
      root.dataset.ready = 'true'
      // Written when it changes, which is twice: a test can tell a landscape coming up from one lit.
      const formed = form >= 1 ? 'true' : 'false'
      if (root.dataset.formed !== formed) root.dataset.formed = formed
    }

    function running() {
      return Boolean(dust) && !motion.matches && intersecting && !faded && !document.hidden
    }

    function tick(now: number) {
      frame = 0
      if (!running()) {
        sync()
        return
      }
      const elapsed = now - previous
      // Every frame while it forms or settles; the drift alone is slow enough for thirty.
      if (form < 1 || settle < 1 || elapsed >= DRIFT) {
        time += Math.min(elapsed / 1000, 0.06)
        previous = now
        advance(now)
        render()
      }
      frame = requestAnimationFrame(tick)
    }

    function sync() {
      cancelAnimationFrame(frame)
      frame = 0
      if (!root) return
      if (!dust) {
        root.dataset.motion = 'none'
        return
      }
      if (motion.matches) {
        time = START
        settle = 1
        form = 1
      } else {
        advance(performance.now())
      }
      place()
      const flowing = running()
      root.dataset.motion = flowing ? 'flowing' : 'still'
      render()
      if (flowing) {
        previous = performance.now()
        frame = requestAnimationFrame(tick)
      }
    }

    /** The parallax. The night falls behind and fades; the morning's motes drift slowly against the page. */
    function place() {
      scrollFrame = 0
      if (!root) return
      if (motion.matches) {
        root.style.transform = ''
        root.style.opacity = ''
        faded = false
        return
      }
      if (tone === 'night') {
        const travelled = Math.max(0, window.scrollY)
        const reach = Math.max(1, window.innerHeight)
        // Gone by the time what follows is on screen, so it never draws behind it.
        const next = until?.current?.getBoundingClientRect().top
        const gone = next === undefined ? reach * 0.8 : next + travelled - reach * 0.15
        const opacity = Math.max(0, 1 - travelled / Math.max(1, gone))
        faded = opacity < 0.01
        root.style.transform = `translate3d(0, ${(Math.min(travelled, reach * 1.2) * 0.42).toFixed(1)}px, 0)`
        root.style.opacity = opacity.toFixed(3)
        return
      }
      const box = (root.parentElement ?? root).getBoundingClientRect()
      const through = Math.min(1, Math.max(0, (window.innerHeight - box.top) / (window.innerHeight + box.height)))
      root.style.transform = `translate3d(0, ${((through - 0.5) * box.height * 0.16).toFixed(1)}px, 0)`
    }

    function onScroll() {
      if (scrollFrame) return
      scrollFrame = requestAnimationFrame(() => {
        const was = running()
        place()
        if (running() !== was) sync()
      })
    }

    function resize() {
      if (!root) return
      wide = wideness(root.clientWidth, root.clientHeight)
      dust?.resize(root.clientWidth, root.clientHeight, Math.min(window.devicePixelRatio || 1, 2))
      sync()
    }

    function lost(event: Event) {
      event.preventDefault()
      dust = null
      sync()
    }
    function restored() {
      if (!canvas) return
      dust = createDust(canvas, tone, color)
      resize()
    }

    const resizeObserver = new ResizeObserver(resize)
    const intersection = new IntersectionObserver(([entry]) => {
      intersecting = Boolean(entry?.isIntersecting)
      sync()
    })
    resizeObserver.observe(root)
    intersection.observe(root)
    motion.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    window.addEventListener('scroll', onScroll, { passive: true })
    canvas.addEventListener('webglcontextlost', lost)
    canvas.addEventListener('webglcontextrestored', restored)
    wakeRef.current = sync
    resize()

    return () => {
      wakeRef.current = null
      cancelAnimationFrame(frame)
      cancelAnimationFrame(scrollFrame)
      resizeObserver.disconnect()
      intersection.disconnect()
      motion.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('scroll', onScroll)
      canvas.removeEventListener('webglcontextlost', lost)
      canvas.removeEventListener('webglcontextrestored', restored)
      dust?.dispose()
    }
  }, [tone, opening, until])

  return (
    <div ref={rootRef} className="glass-field" data-tone={tone} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  )
}
