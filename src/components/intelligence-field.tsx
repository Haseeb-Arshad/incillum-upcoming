import { useEffect, useRef } from 'react'
import { fieldPoint, projectFieldPoint } from '#/lib/particle-field.ts'

// A small server-rendered composition survives absent JS or unavailable canvas.
const still = Array.from({ length: 280 }, (_, index) => {
  const point = fieldPoint((index % 70) / 70, Math.floor(index / 70) / 4, 0)
  return projectFieldPoint(point, 1000, 650, false)
})

export function IntelligenceField() {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d', { alpha: true })
    if (!root || !canvas || !context) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let width = 0
    let height = 0
    let frame = 0
    let time = 0
    let previous = 0
    let visible = true
    let color = ''
    let bright = ''
    let compact = false
    // Reuse opacity/color buckets: at most 16 fills per frame, not one per dot.
    const batches = Array.from({ length: 16 }, () => [] as number[])

    function draw() {
      if (!context || !canvas || !root || !width || !height) return
      context.clearRect(0, 0, width, height)
      const strands = compact ? 24 : 36
      const samples = compact ? 76 : 120
      for (const batch of batches) batch.length = 0

      for (let lane = 0; lane < strands; lane++) {
        let lastX = 0
        let lastY = 0
        context.beginPath()
        for (let step = 0; step < samples; step++) {
          const progress = (step / samples + time * 0.014 + lane * 0.0002) % 1
          const point = fieldPoint(progress, lane / (strands - 1), time)
          const screen = projectFieldPoint(point, width, height, compact)
          // Protect the text and input area without a masking overlay or gradient.
          const clearance = compact
            ? 1
            : Math.min(1, Math.max(0.01, (screen.x / width - 0.35) / 0.3))
          const edge = Math.pow(Math.abs((lane / (strands - 1)) * 2 - 1), 5)
          const alpha =
            (0.25 + screen.depth * 0.46 + edge * 0.2) * point.envelope * clearance
          const spark = (step + lane * 7) % 67 === 0
          if (alpha > 0.035) {
            const bucket = Math.min(7, Math.floor(alpha * 8)) + (spark ? 8 : 0)
            batches[bucket]!.push(
              screen.x,
              screen.y,
              (spark ? 1.1 : 0.46 + screen.depth * 0.35) * screen.perspective,
            )
          }
          if (
            step &&
            Math.hypot(screen.x - lastX, screen.y - lastY) < width * 0.07 &&
            clearance > 0.7
          ) {
            context.lineTo(screen.x, screen.y)
          } else {
            context.moveTo(screen.x, screen.y)
          }
          lastX = screen.x
          lastY = screen.y
        }
        // Sparse threads give particles a shared structure without becoming wire mesh.
        if (lane % 3 === 0) {
          context.strokeStyle = color
          context.globalAlpha = 0.12
          context.lineWidth = 0.5
          context.stroke()
        }
      }

      for (let index = 0; index < batches.length; index++) {
        const batch = batches[index]!
        if (!batch.length) continue
        context.fillStyle = index >= 8 ? bright : color
        context.globalAlpha = ((index % 8) + 0.5) / 8
        context.beginPath()
        for (let offset = 0; offset < batch.length; offset += 3) {
          const x = batch[offset]!
          const y = batch[offset + 1]!
          const radius = batch[offset + 2]!
          context.moveTo(x + radius, y)
          context.arc(x, y, radius, 0, Math.PI * 2)
        }
        context.fill()
      }
      context.globalAlpha = 1
      root.dataset.ready = 'true'
    }

    function tick(now: number) {
      frame = 0
      // Also sample the preference at the frame boundary: a browser may defer
      // the MediaQueryList change event while emulating or switching display modes.
      if (motion.matches || document.hidden || !visible) {
        sync()
        return
      }
      // 30 fps is sufficient for this continuous, unhurried field.
      if (now - previous >= 1000 / 30) {
        time += Math.min((now - previous) / 1000, 0.06)
        previous = now
        draw()
      }
      if (!motion.matches && visible && !document.hidden)
        frame = requestAnimationFrame(tick)
    }

    function sync() {
      cancelAnimationFrame(frame)
      frame = 0
      if (!root) return
      const animate = !motion.matches && visible && !document.hidden
      root.dataset.motion = animate ? 'flowing' : 'still'
      if (motion.matches) time = 0
      draw()
      if (animate) {
        previous = performance.now()
        frame = requestAnimationFrame(tick)
      }
    }

    function resize() {
      if (!root || !canvas || !context) return
      const bounds = root.getBoundingClientRect()
      width = bounds.width
      height = bounds.height
      compact = window.innerWidth <= 600
      const ratio = Math.min(window.devicePixelRatio || 1, 1.75)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      const tokens = getComputedStyle(root)
      color = tokens.getPropertyValue('--launch-particle-ink').trim()
      bright = tokens.getPropertyValue('--launch-particle-bright').trim()
      sync()
    }

    const resizeObserver = new ResizeObserver(resize)
    const intersection = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting)
      sync()
    })
    resizeObserver.observe(root)
    intersection.observe(root)
    motion.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    resize()

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersection.disconnect()
      motion.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  return (
    <div ref={rootRef} className="intelligence-field" aria-hidden="true">
      <svg className="intelligence-field-still" viewBox="0 0 1000 650" focusable="false">
        {still.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={1.2}
            opacity={point.depth * 0.6}
          />
        ))}
      </svg>
      <canvas ref={canvasRef} />
    </div>
  )
}
