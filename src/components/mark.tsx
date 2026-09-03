/**
 * The Incillum mark.
 *
 * ── What it is ────────────────────────────────────────────────────────────
 *
 * A Reuleaux triangle: the curve of constant width. Every diameter across it is
 * the same length, so it rolls inside a square touching all four sides at every
 * angle of rotation. It never loses contact, and it never stops turning.
 *
 * That is the company's argument, drawn: *stay with the work*. The alternative
 * candidates in `design/marks/` were each a real object too, and each said
 * something else — the diel rosette is a clock, and a clock mark sells time
 * tracking; the double-entry helix is bookkeeping, which is the positioning
 * this site has just left; the Lorenz attractor is chaos, which is a promise
 * nobody wants from software that touches a price. The epicycloid and the
 * phyllotaxis are starbursts, and a starburst in this category is the AI
 * sparkle with extra steps.
 *
 * ── Why it replaced what was there ────────────────────────────────────────
 *
 * The masthead was carrying `logo.png`: a rose curve, rasterised, 224 kB, on
 * every page load, illegible below about 32px and silhouetted into a grey
 * smudge at 16. A brand mark that cannot be recognised at favicon size is not a
 * brand mark, and a quarter of a megabyte for one is a performance defect
 * before it is a design one. This is roughly 300 bytes, inline, in the markup.
 *
 * ── The drawing ───────────────────────────────────────────────────────────
 *
 * Circumradius R, arcs swung at the *side* length R·√3 and centred on the
 * opposite vertex — not at R, which produces a shape indistinguishable from a
 * circle and is the mistake that hides best, because a circle still looks
 * intentional.
 *
 * Open rather than filled. Filled it survives 16px more easily and says less:
 * a solid rounded triangle is a badge, and the mark's whole subject is a line
 * that closes. 2.4 units of stroke on a 24 unit box is 1.1px at 16px, which is
 * the lightest weight that still holds on a low-density display.
 *
 * `currentColor`, so it inverts with the band it lands in and needs no second
 * asset for the dark scope. `vector-effect` is deliberately not used: the
 * stroke should scale with the mark, not stay hairline as it grows.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M12 3A18 18 0 0 1 21 18.588A18 18 0 0 1 3 18.588A18 18 0 0 1 12 3Z"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}
