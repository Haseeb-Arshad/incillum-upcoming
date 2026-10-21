import { useEffect, useRef } from 'react'
import { corePoint } from '#/lib/particle-core.ts'

const stillPoints = Array.from({ length: 720 }, (_, index) => corePoint(index, 720, 0))

export function ParticleCore() {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let time = 0
    let previous = 0
    let visible = true
    let size = 0
    let count = 0
    let color = ''
    const batches: number[][] = Array.from({ length: 12 }, () => [])

    function draw() {
      if (!context || !root) return
      context.clearRect(0, 0, size, size)
      batches.forEach((batch) => {
        batch.length = 0
      })
      for (let i = 0; i < count; i++) {
        const point = corePoint(i, count, time)
        const front = (point.z + 1) / 2
        const x = size * (0.5 + point.x * 0.27)
        const y = size * (0.5 + point.y * 0.35)
        const alpha =
          point.envelope * (0.12 + front * front * (0.35 + point.light * 0.56))
        const radius =
          (0.45 + front * 0.65 + point.light * 0.3) * Math.max(0.75, size / 800)
        if (alpha < 0.025) continue
        batches[Math.min(11, Math.floor(alpha * 12))]!.push(x, y, radius)
      }
      context.fillStyle = color
      batches.forEach((batch, index) => {
        context.globalAlpha = (index + 1) / 12
        context.beginPath()
        for (let i = 0; i < batch.length; i += 3) {
          const x = batch[i]!
          const y = batch[i + 1]!
          const radius = batch[i + 2]!
          context.moveTo(x + radius, y)
          context.arc(x, y, radius, 0, Math.PI * 2)
        }
        context.fill()
      })
      context.globalAlpha = 1
      root.dataset.ready = 'true'
    }
    function tick(now: number) {
      frame = 0
      if (motion.matches || document.hidden || !visible) {
        sync()
        return
      }
      if (now - previous >= 1000 / 30) {
        time += Math.min((now - previous) / 1000, 0.06)
        previous = now
        draw()
      }
      frame = requestAnimationFrame(tick)
    }
    function sync() {
      cancelAnimationFrame(frame)
      const animate = !motion.matches && visible && !document.hidden
      if (root) root.dataset.motion = animate ? 'flowing' : 'still'
      if (motion.matches) time = 0
      draw()
      if (animate) {
        previous = performance.now()
        frame = requestAnimationFrame(tick)
      }
    }
    function resize() {
      if (!root || !canvas || !context) return
      size = root.clientWidth
      const ratio = Math.min(devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(size * ratio)
      canvas.height = Math.round(size * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      count = size < 500 ? 1800 : 4200
      color = getComputedStyle(root).getPropertyValue('--launch-particle-color').trim()
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
    <div className="particle-core" ref={rootRef} aria-hidden="true">
      <svg className="particle-core-still" viewBox="0 0 600 600" focusable="false">
        {stillPoints.map((point, index) => (
          <circle
            key={index}
            cx={300 + point.x * 162}
            cy={300 + point.y * 210}
            r={point.z > 0 ? 1 : 0.6}
            fill="var(--launch-particle-color)"
            opacity={point.envelope * (0.15 + point.light * 0.6)}
          />
        ))}
      </svg>
      <canvas ref={canvasRef} />
    </div>
  )
}
