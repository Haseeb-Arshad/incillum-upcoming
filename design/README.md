# Design tooling

Two generators. Neither is imported by the site; both write assets it ships.

## The share card

```bash
pnpm generate-og
```

Renders `public/og-image-v<n>.png` at 1200x630 in headless Chromium, from
`src/content/site.ts`, `public/logo.png` and the real `src/fonts/` faces. The
card therefore cannot say something the page does not — which is the failure it
exists to prevent: the hand-made version it replaced kept a headline and a mark
the site had already dropped, and went on serving them to everybody who pasted
the link.

Redesigning it means **renaming** it. Platforms cache a card against its URL, so
new bytes at an old path are shown to nobody; bump the number in the script and
in `src/lib/seo.ts`, and delete the file the old path pointed at.

## Marks

Logo candidates for Incillum, generated from their own mathematics.

```bash
node design/generate-marks.mjs
```

Rewrites every SVG in `marks/`. Nothing here is imported by the site — these are
design candidates, not shipped assets. When one is chosen it moves to
`public/favicon.svg` and into the masthead.

## Why generated rather than drawn

Each mark is a real mathematical or physical object, so the geometry is correct
rather than an impression of correct — and it can be re-cut at any size or
weight by changing one number instead of redrawing.

That paid for itself twice. The Reuleaux triangle was swinging each arc at the
circumradius instead of the side length, producing a shape indistinguishable
from a circle; that is the failure that hides best, because a circle still looks
intentional. And the dial had a centre dot with a line reaching it, which is not
an instrument, it is a clock — it read as a speedometer, which is worse than
reading as nothing, because it reads as a different product.

## The living line

`modulated()` varies stroke weight along a path: heavy where the curve is slow
or dense, hairline where it runs fast. A line of constant width is what makes a
mark look dead — it has no hierarchy, so the eye has nowhere to land.

SVG cannot vary `stroke-width` within one path, and building an offset outline
produces path data nobody can edit afterwards. So widths are quantised into
eight levels and each level is emitted as one path holding every run at that
weight. One path per segment was the first attempt: correct, and 539 kB for the
Lorenz attractor. Eight levels are indistinguishable at any size a mark is seen
at, and cost a hundredth of that.

## Colour

Files carry a literal `#111110` so they work standalone as a favicon. To use one
inline in the site, swap `#111110` for `currentColor` and it follows the theme
like everything else.
