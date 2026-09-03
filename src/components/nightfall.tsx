import { Container } from '#/components/primitives.tsx'
import { nightfall } from '#/content/site.ts'

/**
 * The night plate — the one image on the site.
 *
 * ── Why it is drawn ───────────────────────────────────────────────────────
 *
 * The reflex for this slot is a photograph of an empty office at dusk with a
 * warm grade on it. It is the most reproduced image in enterprise software and
 * a reader has learned to see through it before reading a word — and the
 * alternative reflex, a product screenshot, is a picture of something that does
 * not exist yet. So it is drawn, in the same flat hairline language the
 * instrument below it uses, out of the same tokens as everything else.
 *
 * It has to carry the thesis with the copy removed: the people left, the work
 * is still lit. Reading order in the composition is deliberate and runs
 * backwards from the light — the quotation under the lamp, then the empty
 * chair beside it, then the city where a few other people are also still going.
 *
 * ── The one place the signal appears in a drawing ─────────────────────────
 *
 * Lamplight. The pool on the desk, the edge it catches on the sheet, one held
 * line on the quotation, and eleven windows in the city. That is it. Every
 * other value in here is `currentColor` at an opacity, which is what lets the
 * whole plate re-theme from the band it sits in without a second asset.
 *
 * ── Why the city is generated ─────────────────────────────────────────────
 *
 * Sixty-odd towers and several hundred windows, placed by hand, is an hour of
 * work that produces a suspiciously even skyline, because a person placing
 * rectangles unconsciously spaces them. A seeded generator gives a distribution
 * with real clumps and gaps in it.
 *
 * The seed is a constant and the generator is pure, so the server and the
 * browser draw the identical skyline. A `Math.random()` here would produce a
 * hydration mismatch on every load — React would warn, and on a bad day it
 * would discard the server's markup and redraw the whole plate.
 *
 * ── Accessibility ─────────────────────────────────────────────────────────
 *
 * The SVG is `aria-hidden` and the caption beneath it is real text. A screen
 * reader announcing four hundred rectangles is noise; `nightfall.alt` is read
 * instead, from a visually hidden paragraph, and it describes the composition
 * rather than listing its parts.
 *
 * ── Motion ────────────────────────────────────────────────────────────────
 *
 * None. Not one element in here moves, and that is a decision rather than an
 * omission: the subject is a room where nothing is happening, and a flickering
 * window or a drifting light would turn the one honest image on the site into a
 * screensaver. The page's whole motion budget is spent elsewhere.
 */

/* ── The skyline ─────────────────────────────────────────────────────────── */

/**
 * Mulberry32. Thirty-two bits of state, one multiply and three shifts, and a
 * distribution good enough for placing rectangles — which is the entire
 * requirement. It exists so the drawing is deterministic across the server and
 * the browser; see the header.
 */
function seeded(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Tower {
  x: number
  y: number
  width: number
  height: number
  /** Depth, 0 (far) to 1 (near). Drives both the fill and how lit the tower is. */
  depth: number
}

interface Window_ {
  x: number
  y: number
  /** Bone at this alpha — or, for the eleven, lamplight. */
  alpha: number
  lit: boolean
}

/** Below this line is the interior. Everything above it is beyond the glass. */
const HORIZON = 596

function skyline(): { towers: Array<Tower>; windows: Array<Window_> } {
  const random = seeded(20260903)
  const towers: Array<Tower> = []
  const windows: Array<Window_> = []

  /**
   * Two ranks. The far one is taller, dimmer and almost unlit — distance, and
   * the reason the near rank reads as near at all. Drawing one rank produces a
   * flat cardboard cut-out, which is the failure this composition can least
   * afford, since depth through a window is most of what makes it a window.
   */
  for (const rank of [
    { depth: 0.25, from: -40, top: 150, span: 190, gap: 8, litChance: 0.1 },
    { depth: 1, from: -60, top: 268, span: 210, gap: 14, litChance: 0.3 },
  ]) {
    let x = rank.from
    while (x < 1680) {
      const width = 58 + random() * 96
      const height = rank.span * (0.34 + random() * 0.66)
      const y = rank.top + (rank.span - height)
      towers.push({ x, y, width, height, depth: rank.depth })

      /**
       * Windows on a 22×17 grid inset from the tower's edges, each lit
       * independently. Most buildings are dark and a few are half awake, which
       * is what an actual city looks like at midnight — an evenly lit skyline
       * reads as a rendering.
       */
      const columns = Math.max(1, Math.floor((width - 16) / 22))
      const rows = Math.max(1, Math.floor((height - 14) / 17))
      const buildingWake = random()
      for (let column = 0; column < columns; column++) {
        for (let row = 0; row < rows; row++) {
          if (random() > buildingWake * rank.litChance) continue
          windows.push({
            x: x + 10 + column * 22,
            y: y + 10 + row * 17,
            alpha: (0.16 + random() * 0.5) * rank.depth,
            /**
             * The eleven. A handful of the near rank's windows carry lamplight
             * rather than bone — other offices with somebody still in them,
             * which is what makes this building one of several rather than the
             * only lit thing in a dead city. Kept scarce on purpose: at twenty
             * it stops reading as coincidence and starts reading as decoration.
             */
            lit: rank.depth === 1 && random() > 0.965,
          })
        }
      }
      x += width + rank.gap + random() * 30
    }
  }

  return { towers, windows }
}

/** Computed once at module scope: the drawing is the same on every render. */
const { towers, windows } = skyline()

/* ── The plate ───────────────────────────────────────────────────────────── */

export function Nightfall() {
  return (
    <Container>
      <figure className="m-0">
        {/*
          `overflow-hidden` with the panel radius, so the drawing is cropped by
          the same corner the instrument's panel uses rather than by a rectangle
          — this and the instrument are two plates in one band and they should
          be cut the same way.

          The aspect is fixed by the viewBox and `h-auto`, so nothing reflows as
          the image scales and there is no layout shift to budget for.
        */}
        <div className="overflow-hidden rounded-panel border border-line">
          <svg
            viewBox="0 0 1600 900"
            className="block h-auto w-full text-ink"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              {/*
                The pool the lamp throws on the desk. Elliptical, because a
                shade throws an ellipse onto a horizontal surface, and stopped
                well short of the plate's edges so it reads as a pool of light
                rather than as a vignette on the whole image.
              */}
              <radialGradient id="ic-lamp-pool" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="var(--ic-signal)" stopOpacity="0.26" />
                <stop offset="48%" stopColor="var(--ic-signal)" stopOpacity="0.1" />
                <stop offset="100%" stopColor="var(--ic-signal)" stopOpacity="0" />
              </radialGradient>

              {/*
                The beam, in the lamp's own rotated frame — `userSpaceOnUse`
                inside a transformed group means these coordinates are the
                group's, so the gradient turns with the shade instead of staying
                axis-aligned and shearing off the side of it.

                The first version of this was a full-height diagonal band across
                the sky. It had no source in the frame, so it read as a lens
                flare rather than as light, which is the failure this whole
                drawing exists to avoid: an effect nobody can trace to a cause
                is decoration.
              */}
              <linearGradient
                id="ic-lamp-beam"
                gradientUnits="userSpaceOnUse"
                x1="34"
                y1="0"
                x2="300"
                y2="0"
              >
                <stop offset="0%" stopColor="var(--ic-signal)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="var(--ic-signal)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* The night outside, and the room, are the same darkness. */}
            <rect width="1600" height="900" fill="var(--ic-paper-sunken)" />

            {/* ── Beyond the glass ───────────────────────────────────────── */}
            <g>
              {towers.map((tower, index) => (
                <rect
                  key={index}
                  x={tower.x}
                  y={tower.y}
                  width={tower.width}
                  height={tower.height}
                  fill="currentColor"
                  fillOpacity={0.025 + tower.depth * 0.05}
                />
              ))}
              {windows.map((window_, index) => (
                <rect
                  key={index}
                  x={window_.x}
                  y={window_.y}
                  width="9"
                  height="6"
                  fill={window_.lit ? 'var(--ic-signal)' : 'currentColor'}
                  fillOpacity={window_.lit ? 0.5 : window_.alpha}
                />
              ))}
            </g>

            {/*
              The glass itself: a mullion every 200 units and one transom near
              the top. It is what puts the reader *inside* the room rather than
              outside looking at a building — without it this is a photograph of
              a skyline with some furniture pasted over it.
            */}
            <g stroke="currentColor" strokeOpacity="0.13" strokeWidth="2">
              {[200, 400, 600, 800, 1000, 1200, 1400].map((x) => (
                <line key={x} x1={x} y1="0" x2={x} y2={HORIZON} />
              ))}
              <line x1="0" y1="118" x2="1600" y2="118" />
              <line x1="0" y1={HORIZON} x2="1600" y2={HORIZON} strokeOpacity="0.22" />
            </g>

            {/* ── The room ───────────────────────────────────────────────── */}

            {/*
              The chair, in silhouette, pushed back and turned away. It is the
              only human-shaped thing in the frame and it is empty, which is the
              whole job — the drawing has to say *somebody was here* before it
              says anything about work.

              Drawn nearly black rather than as an outline: it is between the
              reader and the window, so it is the one object in the composition
              that is genuinely backlit.

              It stops just above the desk's far edge. The chair is behind the
              desk, so the desk occludes its feet — and a chair whose castors
              are visible below that line is standing *on* the desk, which is
              what the first version of this drawing showed.
            */}
            <g
              fill="var(--ic-paper-sunken)"
              stroke="currentColor"
              strokeOpacity="0.14"
              strokeWidth="2"
            >
              <path d="M902 316 q58 -11 112 4 q15 88 4 158 q-60 12 -124 2 q-6 -88 8 -164 Z" />
              <path d="M890 490 q70 20 144 4 l6 26 q-78 16 -156 -6 Z" />
              <rect x="952" y="516" width="10" height="52" />
              <path d="M912 570 h90 l-10 12 h-70 Z" />
            </g>

            {/*
              The desk. One flat mass across the lower third, with a hairline
              along its edge — the only strong horizontal below the window line,
              and the thing that makes everything above it read as depth.
            */}
            <rect x="0" y={HORIZON} width="1600" height="304" fill="currentColor" fillOpacity="0.05" />
            <line
              x1="0"
              y1={HORIZON}
              x2="1600"
              y2={HORIZON}
              stroke="currentColor"
              strokeOpacity="0.2"
              strokeWidth="2"
            />

            {/*
              The monitor, from behind and to the side: a dark slab on a stem.
              Deliberately not glowing. A lit screen in this frame would say
              somebody is sitting at it, which is the one thing the drawing is
              arguing against — and it is the detail every version of this
              picture gets wrong.
            */}
            <g
              fill="var(--ic-paper-sunken)"
              stroke="currentColor"
              strokeOpacity="0.17"
              strokeWidth="2"
            >
              <rect x="1178" y="424" width="268" height="160" rx="4" />
              <rect x="1298" y="584" width="28" height="36" />
              <rect x="1250" y="616" width="124" height="10" rx="4" />
            </g>

            {/*
              The lamp, and the beam it throws. Behind the sheet, so the paper
              sits *in* the light rather than under a wash laid over it.

              It is the only object in the frame that is switched on, and it is
              drawn rather than implied because a pool of light with no source
              is an effect. An architect's lamp: a weighted base on the desk,
              two arms, a shade angled down at the work. Everything is hairline
              except the mouth of the shade, which is the one place in this
              drawing the light is actually coming from.

              The whole assembly is rotated into the beam's own axis so the
              shade, its mouth and the gradient are described in one frame —
              placing them in plate coordinates means three sets of numbers that
              have to be kept in agreement by hand every time the lamp moves.
            */}
            <g stroke="currentColor" strokeOpacity="0.34" strokeWidth="2.5" fill="none">
              <ellipse cx="150" cy="700" rx="52" ry="11" fill="var(--ic-paper-sunken)" />
              <path d="M150 692 L206 512" />
              <path d="M206 512 L322 452" />
              <circle cx="206" cy="512" r="7" fill="var(--ic-paper-sunken)" />
            </g>

            {/*
              56 degrees is the angle from the shade at (322, 452) down to the
              middle of the sheet — `atan2(190, 128)`. If the lamp or the
              quotation moves, this number moves with it, and the beam missing
              the paper is the first thing anybody will notice.
            */}
            <g transform="translate(322 452) rotate(56)">
              <path d="M34 -22 L300 -118 L300 118 L34 22 Z" fill="url(#ic-lamp-beam)" />
              <path
                d="M-10 -9 L-10 9 L34 24 L34 -24 Z"
                fill="var(--ic-paper-sunken)"
                stroke="currentColor"
                strokeOpacity="0.34"
                strokeWidth="2.5"
              />
              {/* The mouth: the source itself, and the brightest thing drawn. */}
              <line
                x1="34"
                y1="-23"
                x2="34"
                y2="23"
                stroke="var(--ic-signal)"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </g>

            {/* The pool the beam lays on the desk. */}
            <ellipse cx="470" cy="742" rx="400" ry="168" fill="url(#ic-lamp-pool)" />

            {/*
              The quotation, lying flat and skewed into the desk's plane. It is
              the brightest object in the frame by a wide margin, which is the
              composition's whole argument: the light in the room is on the work.

              Set as a document, not as a screen — ruled lines, a rule under the
              header, a small block of figures on the right, and one line marked
              in lamplight. That last one is the same held line the thread
              below describes at 01:18. Nothing here is a screenshot of an
              interface and nothing in it is legible as words, which is what
              keeps it an illustration rather than a mock-up.
            */}
            <g transform="translate(258 630) skewX(-13)">
              <rect width="430" height="252" rx="3" fill="currentColor" fillOpacity="0.9" />

              <g fill="var(--ic-paper-sunken)" fillOpacity="0.72">
                <rect x="28" y="30" width="150" height="9" rx="2" />
                <rect x="28" y="50" width="94" height="7" rx="2" />
              </g>
              <line
                x1="28"
                y1="76"
                x2="402"
                y2="76"
                stroke="var(--ic-paper-sunken)"
                strokeOpacity="0.35"
                strokeWidth="2"
              />

              <g fill="var(--ic-paper-sunken)" fillOpacity="0.5">
                {[96, 122, 148, 174, 200].map((y, row) => (
                  <g key={y}>
                    <rect x="28" y={y} width={168 - row * 14} height="7" rx="2" />
                    <rect x="286" y={y} width="52" height="7" rx="2" />
                    <rect x="352" y={y} width="50" height="7" rx="2" />
                  </g>
                ))}
              </g>

              {/* The held line, and the mark beside it in the margin. */}
              <rect x="28" y="148" width="140" height="7" rx="2" fill="var(--ic-signal)" />
              <rect x="352" y="148" width="50" height="7" rx="2" fill="var(--ic-signal)" fillOpacity="0.65" />
              <rect x="12" y="146" width="4" height="11" fill="var(--ic-signal)" />
            </g>

            {/*
              A second sheet, mostly out of the light. One document on a desk is
              a prop; two is a job somebody was in the middle of.

              Skewed by the same -13 degrees as the sheet under the lamp. Two
              sheets on one desk leaning opposite ways is the kind of error that
              nobody can name and everybody can see — the drawing stops reading
              as a surface and starts reading as two stickers.
            */}
            <g transform="translate(700 690) skewX(-13)">
              <rect width="272" height="136" rx="3" fill="currentColor" fillOpacity="0.13" />
            </g>
          </svg>
        </div>

        {/*
          The caption, and the alternative text, both as real text under the
          drawing. The caption is the only sentence in this section, and it is
          the picture's title rather than an explanation of it.
        */}
        <figcaption className="mt-5 flex flex-col gap-1 sm:mt-6">
          <span className="text-lede text-ink">{nightfall.caption}</span>
          <span className="sr-only">{nightfall.alt}</span>
        </figcaption>
      </figure>
    </Container>
  )
}
