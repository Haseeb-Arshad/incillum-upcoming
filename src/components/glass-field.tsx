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
 *   - **The night.** Under the opening and the hero, as a landscape. It is not
 *     there when the page opens: one thin slit of light appears on the horizon
 *     under the first beat, and the landscape unrolls out of it — the far ridge
 *     first, the near dunes last — across the opening's two beats. When the
 *     page assembles it sinks a little, dims, and clears a space behind the
 *     centred type, so the form is never read through it. As the reader
 *     scrolls it falls behind at a little under half the page's speed, and it
 *     has faded out by the time the film is on screen.
 *   - **The morning.** Around the photograph at the close, on the desk: the
 *     same dust put in order, as two ribbons framing the room, one above it
 *     and one below.
 *
 * ── How it moves, and when it stops ────────────────────────────────────────
 *
 * Its own drift, thirty frames a second, only while it is on screen, not faded
 * out, and the tab is visible; and the scroll, written straight to the element
 * on an animation frame so scrolling never re-renders anything. Under reduced
 * motion it draws one still frame of its final state and does neither. Without
 * a script or without WebGL it is simply absent — it is decoration, and the page
 * reads the same without it. The renderer is `lib/dust.ts`.
 */

/**
 * The landscape at the opening, at the hero, and on the desk in the morning —
 * each composed twice, for a wide screen and a narrow one, and blended by the
 * field's own shape. Wide, the swells rise at the edges and the words sit just
 * above the bright far ridge. Narrow, there is no room for tall edges, so the
 * camera stands higher and the landscape lies lower, under the type rather
 * than through it.
 */
const scenes = {
  opening: {
    wide: { horizon: 0.5, camera: 1.4, swell: 1.4, level: 0.85, clear: 0, flank: 1, fade: [0.04, 0.9] },
    narrow: { horizon: 0.54, camera: 2, swell: 1.4, level: 0.85, clear: 0, flank: 0.25, fade: [0.04, 0.86] },
  },
  hero: {
    wide: { horizon: 0.56, camera: 1.4, swell: 1.4, level: 0.62, clear: 0.85, flank: 1, fade: [0.04, 0.9] },
    narrow: { horizon: 0.64, camera: 2, swell: 1.4, level: 0.62, clear: 0.85, flank: 0.25, fade: [0.04, 0.86] },
  },
  // The ribbons read only the level and the fade.
  morning: {
    wide: { horizon: 0.3, camera: 1.6, swell: 1, level: 0.9, clear: 0, flank: 1, fade: [0.03, 0.98] },
    narrow: { horizon: 0.3, camera: 2, swell: 1, level: 0.7, clear: 0, flank: 0.25, fade: [0.03, 0.98] },
  },
} satisfies Record<string, Record<'wide' | 'narrow', Composition>>

/** The moment of the swells the scene was composed at, so the first frame and the still frame are that one. */
const START = 12
/** How long the night takes to settle from the opening into the hero. */
const SETTLE = 1600
/** How long the landscape takes to unroll from its opening, inside the opening's two beats. */
const FORM = 2600
/** How quickly it finishes forming once the reader has skipped the opening. */
const FORM_SKIPPED = 450

/** A scene without the formation, which is the field's own state rather than a composition. */
type Composition = Omit<DustScene, 'form'>

const mix = (from: number, to: number, amount: number) => from + (to - from) * amount

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
  settled = true,
  until,
}: {
  tone?: DustTone
  /** The night only: whether the opening has given way to the hero. */
  settled?: boolean
  /** The night only: what it has faded out for by the time it is on screen. */
  until?: RefObject<HTMLElement | null>
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const settledRef = useRef(settled)
  const wakeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    settledRef.current = settled
    wakeRef.current?.()
  }, [settled])

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
    /** The night, from the opening (0) to the hero (1). */
    let settle = settledRef.current ? 1 : 0
    let wide = 1
    /**
     * The night, from every grain inside its opening (0) to every grain in
     * place (1). It forms once, during the opening; arriving after the opening
     * has already ended, or under reduced motion, it is simply formed.
     */
    let form = tone === 'night' && !settledRef.current && !motion.matches ? 0 : 1

    function scene(): DustScene {
      const at = (pair: Record<'wide' | 'narrow', Composition>) => blend(pair.narrow, pair.wide, wide)
      if (tone === 'morning') return { ...at(scenes.morning), form: 1 }
      return { ...blend(at(scenes.opening), at(scenes.hero), 1 - Math.pow(1 - settle, 3)), form }
    }

    function render() {
      if (!dust || !root) return
      dust.draw(time, scene())
      root.dataset.ready = 'true'
      // Written when it changes, which is twice: a test can tell a landscape forming from one formed.
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
      if (elapsed >= 1000 / 30) {
        time += Math.min(elapsed / 1000, 0.06)
        previous = now
        if (settledRef.current && settle < 1) settle = Math.min(1, settle + elapsed / SETTLE)
        if (form < 1) form = Math.min(1, form + elapsed / (settledRef.current ? FORM_SKIPPED : FORM))
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
        settle = settledRef.current ? 1 : 0
        form = 1
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

    /** The parallax. The night falls behind and fades; the morning's ribbons drift slowly against the page. */
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
  }, [tone, until])

  return (
    <div ref={rootRef} className="glass-field" data-tone={tone} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  )
}
