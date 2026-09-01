import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * Candidate marks for Incillum, generated from their own formulas.
 *
 * The point of generating rather than tracing: every one of these is a real
 * mathematical or physical object, so the mark is *correct* rather than an
 * impression of correctness — and it can be regenerated at any size or weight.
 *
 * ── What makes one of these feel alive ──────────────────────────────────────
 *
 * Uniform stroke weight is what killed the first pass. A line of constant width
 * carries no hierarchy: the eye has nowhere to land and nothing to follow. So
 * where it helps, a path is emitted as consecutive short segments whose widths
 * modulate — heavy where the curve is slow or dense, hairline where it runs
 * fast or thins out. That is what an engraver does with a burin and what a
 * plotter pen cannot do, and it is most of the difference between a diagram and
 * a mark.
 */

// Resolved from this file, not hard-coded, so the script runs from anywhere.
const OUT = fileURLToPath(new URL('./marks', import.meta.url))
mkdirSync(OUT, { recursive: true })

const S = 200
const C = S / 2
const TAU = Math.PI * 2
const INK = '#111110'

const f = (n) => Math.round(n * 100) / 100

function doc(inner, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" role="img" aria-label="${title}">
  <title>${title}</title>
${inner}
</svg>
`
}

/** A uniform-width path. */
function path(d, w, opts = {}) {
  const extra = Object.entries(opts)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join('')
  return `  <path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`
}

const poly = (pts) => 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')

/**
 * A modulated path: a line whose stroke weight varies along its length.
 *
 * SVG cannot vary `stroke-width` within one path, and the usual workaround —
 * building an offset outline and filling it — produces path data nobody can
 * edit afterwards. So the width is quantised into a few discrete levels and
 * each level is emitted as a single path holding every run at that weight.
 *
 * ── Why quantised, and not one path per segment ────────────────────────────
 *
 * One path per segment was the first attempt and it is correct and unusable:
 * the Lorenz attractor came out at 539 kB, for a file whose main job is to be a
 * favicon. Eight levels are indistinguishable from continuous at any size a
 * mark is actually seen at, and collapse five thousand elements into eight —
 * a hundredfold saving for no visible difference.
 *
 * Consecutive segments at the same level are merged into one polyline run, so
 * a long stretch of even weight costs one `M` and a list of points rather than
 * a fresh path each time.
 */
const WIDTH_LEVELS = 8

function modulated(pts, widthAt) {
  const widths = []
  for (let i = 0; i < pts.length - 1; i++) widths.push(widthAt(i / (pts.length - 1), i))

  const present = widths.filter((w) => w > 0.05)
  if (present.length === 0) return ''
  const lo = Math.min(...present)
  const hi = Math.max(...present)
  const step = (hi - lo) / (WIDTH_LEVELS - 1) || 1

  /** Segment index → quantised width, or 0 for a deliberate gap. */
  const level = widths.map((w) => (w <= 0.05 ? 0 : f(lo + Math.round((w - lo) / step) * step)))

  // Group contiguous same-level segments into runs.
  const runs = new Map()
  let i = 0
  while (i < level.length) {
    const w = level[i]
    if (w === 0) {
      i += 1
      continue
    }
    let j = i
    while (j < level.length && level[j] === w) j += 1
    const run = pts.slice(i, j + 1)
    if (!runs.has(w)) runs.set(w, [])
    runs.get(w).push(poly(run))
    i = j
  }

  return [...runs.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(
      ([w, ds]) =>
        `  <path d="${ds.join('')}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join('\n')
}

/* ═══ 01 · Diel rosette ═══════════════════════════════════════════════════
   The 24-hour scale. Nine attended hours drawn as stubs, fifteen unattended at
   full reach, and the index mark heavy enough to be the one place the eye
   lands. The asymmetry is the content: this is not a sun. */
function dielRosette() {
  const rOut = 84
  const rLong = 44
  const rShort = 70
  let d = ''
  for (let h = 0; h < 24; h++) {
    const a = (h / 24) * TAU - Math.PI / 2
    const office = h >= 9 && h < 18
    const ri = office ? rShort : rLong
    d += poly([
      [C + Math.cos(a) * ri, C + Math.sin(a) * ri],
      [C + Math.cos(a) * rOut, C + Math.sin(a) * rOut],
    ])
  }
  const idx = (3 / 24) * TAU - Math.PI / 2
  return doc(
    [
      `  <circle cx="${C}" cy="${C}" r="${rOut}" fill="none" stroke="${INK}" stroke-width="1.6"/>`,
      path(d, 1.6),
      /**
       * A heavy tick that overshoots the ring — not a hand reaching the centre.
       * With a centre dot and a full radius this read as a speedometer, which
       * is worse than reading as nothing: it reads as a different product.
       */
      path(
        poly([
          [C + Math.cos(idx) * 34, C + Math.sin(idx) * 34],
          [C + Math.cos(idx) * 97, C + Math.sin(idx) * 97],
        ]),
        5,
      ),
    ].join('\n'),
    'Diel rosette',
  )
}

/* ═══ 02 · Double-entry helix ═════════════════════════════════════════════
   Two strands in antiphase joined by rungs — a double helix, and double-entry
   bookkeeping. The strands thicken crossing the axis and thin at the turns,
   which is what a helix does in perspective and what makes it read as a body
   rather than a wave. */
function helix() {
  const top = 24
  const bot = 176
  const amp = 46
  const periods = 2
  const N = 180

  const strand = (phase) => {
    const pts = []
    for (let i = 0; i <= N; i++) {
      const t = i / N
      pts.push([C + Math.sin(t * TAU * periods + phase) * amp, top + t * (bot - top)])
    }
    return modulated(pts, (t) => 1.1 + Math.abs(Math.cos(t * TAU * periods + phase)) * 3.6)
  }

  let rungs = ''
  // Nine, not fifteen. Fifteen closed the strands into a coil spring and
  // buried the crossings, which are the whole reason the mark means anything.
  const R = 9
  for (let i = 1; i < R; i++) {
    const t = i / R
    const y = top + t * (bot - top)
    const x1 = C + Math.sin(t * TAU * periods) * amp
    const x2 = C + Math.sin(t * TAU * periods + Math.PI) * amp
    const w = 0.7 + Math.abs(Math.cos(t * TAU * periods)) * 1.5
    rungs += `  <path d="${poly([[x1, y], [x2, y]])}" fill="none" stroke="${INK}" stroke-width="${f(w)}" stroke-linecap="round" stroke-opacity="0.42"/>\n`
  }

  return doc(rungs + strand(0) + '\n' + strand(Math.PI), 'Double-entry helix')
}

/* ═══ 03 · Trefoil ════════════════════════════════════════════════════════
   The (2,3) torus knot: one line, three crossings, no beginning. Gaps where a
   strand passes beneath — the over-under is what stops it reading as a generic
   geometric loop. */
function trefoil() {
  const k = 25
  const N = 540
  const pt = (t) => [
    C + (Math.sin(t) + 2 * Math.sin(2 * t)) * k,
    C + (Math.cos(t) - 2 * Math.cos(2 * t)) * k,
  ]
  const pts = []
  for (let i = 0; i <= N; i++) pts.push(pt((i / N) * TAU))

  const breaks = [1 / 6, 3 / 6, 5 / 6]
  const gap = 0.026
  return doc(
    modulated(pts, (t) => {
      for (const b of breaks) {
        const raw = Math.abs(t - b)
        if (Math.min(raw, 1 - raw) < gap) return 0
      }
      return 3.6 + Math.sin(t * TAU * 3) * 1.0
    }),
    'Trefoil knot',
  )
}

/* ═══ 04 · Reuleaux ═══════════════════════════════════════════════════════
   Three arcs, each swung from the opposite vertex: constant width, rolls like a
   circle without being one. The construction triangle stays, faintly — it is
   what separates this from a rounded triangle. */
function reuleaux() {
  const R = 80
  const v = [0, 1, 2].map((i) => {
    const a = -Math.PI / 2 + (i / 3) * TAU
    return [C + Math.cos(a) * R, C + Math.sin(a) * R]
  })
  /**
   * The arc radius is the *side* length, not the circumradius.
   *
   * Swinging each arc at R produced a shape indistinguishable from a circle —
   * the failure that hides best, because a circle still looks intentional. A
   * Reuleaux arc is centred on the opposite vertex, so its radius is the
   * distance between two vertices: R·√3 for an equilateral triangle.
   */
  const side = f(R * Math.sqrt(3))
  let d = `M${f(v[0][0])} ${f(v[0][1])}`
  for (let i = 0; i < 3; i++) {
    const to = v[(i + 1) % 3]
    d += `A${side} ${side} 0 0 1 ${f(to[0])} ${f(to[1])}`
  }
  d += 'Z'
  return doc(
    [
      path(poly([v[0], v[1], v[2], v[0]]), 1, { 'stroke-opacity': '0.35' }),
      path(d, 5),
      ...v.map(([x, y]) => `  <circle cx="${f(x)}" cy="${f(y)}" r="3.4" fill="${INK}"/>`),
    ].join('\n'),
    'Reuleaux triangle',
  )
}

/* ═══ 05 · Lorenz attractor ═══════════════════════════════════════════════
   Deterministic and never repeating: the same rules every night, never the same
   night twice. RK4-integrated, projected on x–z, then modulated by speed — the
   trajectory crawls at the lobe centres and whips across the handover, so the
   line is thick where it lingers and fine where it flies. That speed reading is
   the whole reason this one feels alive rather than drawn. */
function lorenz() {
  const sigma = 10
  const rho = 28
  const beta = 8 / 3
  const dt = 0.005
  const steps = 5400

  const d = ([x, y, z]) => [sigma * (y - x), x * (rho - z) - y, x * y - beta * z]
  const add = (a, b, s) => a.map((v, i) => v + b[i] * s)

  let p = [0.9, 0.6, 12]
  const raw = []
  for (let i = 0; i < steps; i++) {
    const k1 = d(p)
    const k2 = d(add(p, k1, dt / 2))
    const k3 = d(add(p, k2, dt / 2))
    const k4 = d(add(p, k3, dt))
    p = p.map((v, j) => v + ((k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]) / 6) * dt)
    if (i > 500) raw.push([p[0], p[2]])
  }

  const xs = raw.map((q) => q[0])
  const ys = raw.map((q) => q[1])
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const scale = 168 / Math.max(maxX - minX, maxY - minY)

  const pts = raw.map(([x, y]) => [
    C + (x - (minX + maxX) / 2) * scale,
    C - (y - (minY + maxY) / 2) * scale,
  ])

  const speeds = pts
    .slice(0, -1)
    .map(([x1, y1], i) => Math.hypot(pts[i + 1][0] - x1, pts[i + 1][1] - y1))
  const maxSpeed = Math.max(...speeds)

  return doc(
    modulated(pts, (_t, i) => 0.3 + (1 - speeds[i] / maxSpeed) * 2.0),
    'Lorenz attractor',
  )
}

/* ═══ 06 · Kármán vortex street ═══════════════════════════════════════════
   The alternating vortices a flow sheds past an obstacle — the reason a wire
   hums in wind. Periodic, self-sustaining, driven entirely by something passing
   through. The vortices grow as they travel, so the mark has a direction, which
   is where its energy comes from. */
function karman() {
  const items = [`  <circle cx="30" cy="${C}" r="9" fill="${INK}"/>`]

  const spiral = (cx, cy, r0, turns, dir, w) => {
    const pts = []
    const N = 110
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * TAU * turns
      const r = r0 * Math.exp(0.16 * t) * 0.3
      pts.push([cx + Math.cos(t * dir) * r, cy + Math.sin(t * dir) * r])
    }
    return modulated(pts, (t) => 0.5 + t * w)
  }

  // Three, larger, nearly touching. Four small ones read as scattered debris
  // rather than one shedding flow — the rhythm only registers when they meet.
  ;[70, 120, 170].forEach((x, i) => {
    const above = i % 2 === 0
    items.push(spiral(x, C + (above ? -20 : 20), 12 * (1 + i * 0.26), 1.95, above ? 1 : -1, 3.4 + i * 0.8))
  })

  items.push(path('M12 74 Q60 74 96 62', 0.9, { 'stroke-opacity': '0.35' }))
  items.push(path('M12 126 Q60 126 96 138', 0.9, { 'stroke-opacity': '0.35' }))

  return doc(items.join('\n'), 'Karman vortex street')
}

/* ═══ 07 · Epicycloid ═════════════════════════════════════════════════════
   A point on a circle rolling inside a circle, closing after seven turns —
   cycles inside cycles, the shape of a finance calendar. Modulated so the petal
   tips are fine and the centre weave carries the mass. */
function epicycloid() {
  const R = 82
  const r = 82 * (3 / 7)
  const dd = 50
  const N = 1400
  const pts = []
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * TAU * 7
    pts.push([
      C + (R - r) * Math.cos(t) + dd * Math.cos(((R - r) / r) * t),
      C + (R - r) * Math.sin(t) - dd * Math.sin(((R - r) / r) * t),
    ])
  }
  return doc(
    modulated(pts, (_t, i) => {
      const [x, y] = pts[i]
      const dist = Math.min(Math.hypot(x - C, y - C) / 84, 1)
      return 0.4 + (1 - dist) * 1.8
    }),
    'Epicycloid',
  )
}

/* ═══ 08 · Phyllotaxis ════════════════════════════════════════════════════
   Seeds at the golden angle. Nothing draws the spiral arms — they emerge from
   one rule applied repeatedly, which is a fair description of an operator
   running the same policy every night. Dot size falls with radius so the mark
   has a dense core and a soft edge rather than a flat disc. */
function phyllotaxis() {
  const golden = Math.PI * (3 - Math.sqrt(5))
  const dots = []
  for (let i = 1; i <= 300; i++) {
    const r = 5.6 * Math.sqrt(i)
    if (r > 84) break
    const a = i * golden
    dots.push(
      `  <circle cx="${f(C + Math.cos(a) * r)}" cy="${f(C + Math.sin(a) * r)}" r="${f(3.5 - (r / 84) * 1.7)}" fill="${INK}"/>`,
    )
  }
  return doc(dots.join('\n'), 'Phyllotaxis')
}

const MARKS = {
  '01-diel-rosette': dielRosette,
  '02-double-entry-helix': helix,
  '03-trefoil': trefoil,
  '04-reuleaux': reuleaux,
  '05-lorenz': lorenz,
  '06-karman-vortex': karman,
  '07-epicycloid': epicycloid,
  '08-phyllotaxis': phyllotaxis,
}

const report = []
for (const [name, fn] of Object.entries(MARKS)) {
  const svg = fn()
  writeFileSync(`${OUT}/${name}.svg`, svg, 'utf8')
  report.push(`${name.padEnd(24)} ${(Buffer.byteLength(svg) / 1024).toFixed(1)} kB`)
}
console.log(report.join('\n'))
