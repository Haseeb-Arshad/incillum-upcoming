import { nightfall } from '#/content/site.ts'

/**
 * The night plate — the one image on the site.
 *
 * ── What it has to do ─────────────────────────────────────────────────────
 *
 * Carry the thesis with the copy removed: **the people left, the work is still
 * lit**. A visitor who saw only this, with every word taken away, should come
 * away with "an office at night, empty, one light still on over something
 * unfinished."
 *
 * Three things do that, in order: the emptiness, the single warm light source,
 * and the fact that the lit thing is a paper document rather than a screen. The
 * monitor in frame is off, and that is the load-bearing detail — a glowing
 * screen says somebody is sitting there, which is the opposite of the argument.
 *
 * ── What was here before ──────────────────────────────────────────────────
 *
 * A drawing. The same scene built as inline SVG out of the site's own tokens —
 * a seeded skyline, a curtain wall, a chair, a lamp and a beam — because the
 * reflex for this slot is a stock photograph of an empty office at dusk with a
 * warm grade on it, which is the most reproduced image in enterprise software
 * and which a reader sees through before reading a word.
 *
 * It is in the history at `550e87d` and it is worth reading before replacing
 * this, because the reasons it existed are the acceptance criteria for anything
 * that stands here: no people, nothing glowing but the lamp, no blue in the
 * shadows, no floating interface, no legible fake text, and a city dim enough
 * that it cannot compete with the desk. `design/hero-image-brief.md` is the
 * long form, including the prompt this image came from.
 *
 * The photograph won on the one thing a drawing could not buy: it is a room,
 * and the drawing was a diagram of a room. What it costs is listed in the brief
 * and is real — it no longer follows the palette, and it cannot be checked by
 * reading it.
 *
 * ── Delivery ──────────────────────────────────────────────────────────────
 *
 * AVIF, WebP and one JPEG, at four widths, pre-encoded by hand and committed —
 * see the encode script referenced in the brief. A build-time image pipeline
 * would be a native dependency carried on every install to re-encode one
 * photograph that changes about never.
 *
 * The largest AVIF is 21 kB, which is not a typo: AV1 is extremely efficient on
 * a dark, smooth image. It is also why the quality setting is much higher than
 * it looks — the first encode came out at 5 kB and had flattened the ruled
 * columns on the quotation into a beige rectangle, which is the one piece of
 * detail the picture exists for.
 *
 * ── Accessibility ─────────────────────────────────────────────────────────
 *
 * The `alt` describes the composition rather than listing its parts, because
 * what a non-sighted reader needs from this is the argument, not an inventory.
 * The caption underneath is separate text and says something the alt does not:
 * `alt` reports what is in the frame, the caption states what it means.
 *
 * ── Motion ────────────────────────────────────────────────────────────────
 *
 * None, and not by omission. The subject is a room where nothing is happening;
 * a parallax drift or a slow zoom would turn the one honest image on the site
 * into a screensaver. It is also not wrapped in a `Reveal` — it is the largest
 * object on the page, and a 10px translate on it reads as the page slipping
 * rather than settling.
 */

/**
 * The source's own pixel dimensions, and the ratio every encoded width holds.
 *
 * Passed to the `<img>` so the browser reserves the right box before a byte of
 * image arrives. Without them this is the largest layout shift on the site, and
 * it lands directly under the fold on a phone — which is where a reader is
 * mid-sentence when it jumps.
 */
const WIDTH = 1672
const HEIGHT = 941

export function Nightfall() {
  return (
    <figure className="m-0">
      {/*
          Cropped by the same corner radius the evidence document uses, so the
          two plates on this page are cut the same way.
        */}
      <div className="overflow-hidden rounded-panel border border-line">
        <picture>
          {/*
              `sizes` is the whole point of the set. The plate is the container
              measure minus its padding — never the full viewport — so without
              this a phone downloads the 1672px file to paint 342 of them.

              The widths track `Container`: 1360 max measure, less 80px of
              padding at `lg`, so 1280 is the largest it is ever painted at.
            */}
          <source
            type="image/avif"
            sizes="(min-width: 1440px) 768px, (min-width: 1024px) 60vw, calc(100vw - 48px)"
            srcSet={[
              '/night/night-640.avif 640w',
              '/night/night-900.avif 900w',
              '/night/night-1280.avif 1280w',
              '/night/night-1672.avif 1672w',
            ].join(', ')}
          />
          <source
            type="image/webp"
            sizes="(min-width: 1440px) 768px, (min-width: 1024px) 60vw, calc(100vw - 48px)"
            srcSet={[
              '/night/night-640.webp 640w',
              '/night/night-900.webp 900w',
              '/night/night-1280.webp 1280w',
              '/night/night-1672.webp 1672w',
            ].join(', ')}
          />
          {/*
              `fetchPriority="high"` and no lazy loading: on a phone this is the
              second thing on the page and it is inside the fold within one
              scroll. Deferring it would trade a byte of bandwidth for the one
              image the page depends on arriving late.
            */}
          <img
            src="/night/night-1672.jpg"
            alt={nightfall.alt}
            width={WIDTH}
            height={HEIGHT}
            decoding="async"
            fetchPriority="high"
            className="block h-auto w-full"
          />
        </picture>
      </div>

      {/*
          The caption is the picture's title, not an explanation of it — and it
          says something the `alt` deliberately does not. The alt reports what is
          in the frame; this states what it means.
        */}
      <figcaption className="mt-5 text-lede text-ink sm:mt-6">
        {nightfall.caption}
      </figcaption>
    </figure>
  )
}
