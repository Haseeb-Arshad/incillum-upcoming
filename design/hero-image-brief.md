# The night plate — image brief

The hero image is currently **drawn in code** (`src/components/nightfall.tsx`):
an inline SVG, ~14 kB, built from the site's own tokens, so it re-themes with
the dark band and costs no network request.

This brief is for replacing it with a generated raster. Everything below assumes
that decision; read *When not to do this* first, because the SVG is not a
placeholder and swapping it is not automatically an upgrade.

---

## What the image has to do

One sentence, and every decision below serves it:

> **The people left. The work is still lit.**

A visitor who sees only this image, with the copy removed, should come away with
"an office at night, empty, one light still on over something unfinished." If
they come away with "a nice photo of an office", the image has failed and the
drawing was better.

Three things carry that, in this order of importance:

1. **Emptiness.** Most of the frame is unoccupied. The chair is pushed back and
   nobody is in it. This is the point, and it is the thing every generator will
   fight you on — models fill frames.
2. **One light source.** A single desk lamp, warm, falling on a paper document.
   Everything else in the room is off. Not ambient, not overhead, not blue.
3. **A document, not a screen.** The lit thing is paper on the desk. The monitor
   is present and **dark**. A glowing screen says somebody is sitting there,
   which is the exact opposite of the argument.

---

## The prompt

Paste this whole block. It is written long on purpose — the constraints at the
end are doing as much work as the description at the start.

```text
A photograph of an empty commercial office interior, late at night, shot from
inside the room at desk height.

Composition, 16:9 landscape:
The lower third is a wide desk surface running the full width of the frame,
seen at a shallow angle. On the left of the desk, an architect-style task lamp
with a matte dark metal arm is switched on, its shade angled down and to the
right. It throws one warm pool of light onto a single sheet of printed paper
lying flat on the desk — a technical quotation with ruled columns of small
figures, too small to read as words. A second sheet lies half in shadow beside
it. Nothing else is on the desk except a closed notebook.

Behind the desk, slightly right of centre, an empty ergonomic office chair,
turned away and pushed back from the desk. It is in silhouette.

Right of the chair, a desktop monitor seen at an angle. The screen is
completely off — black, no glow, no reflection of content. It is a dark
rectangle.

The entire back wall is a floor-to-ceiling glass curtain wall with slim dark
vertical mullions. Beyond it, a city at night: dark building masses at two
depths, most windows unlit, a scattered handful of small warm-lit windows in
the nearer buildings. No street below, no traffic trails, no moon.

Lighting: exactly one practical light source, the desk lamp. Warm amber,
roughly 2700K, falling off fast. The rest of the room is lit only by the faint
spill of the city through the glass. Deep shadow everywhere else. No overhead
lighting, no fill light, no rim light on the chair.

Colour: near-monochrome. Warm black and charcoal for the room, cool near-black
for the city, bone white for the lit paper, one warm amber accent from the lamp
and the distant windows. No blue tint, no teal, no purple, no colour grading.

Mood: quiet, institutional, ordinary. A real office at 1am, not a set. The
image should feel like it was taken, not staged.

Style: restrained editorial photography. Natural perspective, roughly 35mm,
everything in focus except a very slight falloff at the far edges. No shallow
depth of field, no bokeh balls, no lens flare, no light rays, no haze, no
vignette, no grain overlay, no HDR.

Negative: no people, no hands, no silhouettes of figures, no reflections of
people. No glowing screens or monitors. No holograms, no HUD, no data
visualisation, no floating UI, no charts in the air. No neon, no cyberpunk, no
purple or cyan lighting. No plants, no coffee cups, no crumpled paper, no
clutter. No text that is meant to be legible. No logos. No robots. No
cinematic colour grade. Not a rendering, not 3D, not an illustration.
```

### Ratio and size

Ask for **16:9**. The slot is a `1600 × 900` viewBox, rendering at up to
`1280 × 720` CSS pixels on a 1440px screen, so the asset wants to be **2560 ×
1440** to survive a 2× display. Generate at the largest 16:9 the tool gives you
and downscale; never upscale.

### The variants worth generating

Run the prompt three or four times and change one thing each time. Keep every
result — the choice is easier side by side than in sequence.

| Change | Why |
| --- | --- |
| Move the lamp and paper to the **right** of the frame, chair to the left | The composition reads differently against the caption below it; the right-weighted version sometimes sits better against left-aligned type. |
| Pull the camera **back** so the desk occupies only the bottom quarter | More emptiness. Usually stronger, occasionally too empty to read. |
| Chair **facing** the desk rather than turned away | Turned away says "left". Facing says "stepped out". Both work; they are different sentences. |
| Remove the monitor entirely | The cleanest version. Worth having, because the monitor is the element most likely to come back glowing. |

### How to judge the results

Reject on any of these, without negotiating with yourself:

- Anything glowing that is not the lamp. Screens are the failure mode.
- A person, or the suggestion of one.
- Blue or teal in the shadows. Every model reaches for it.
- Legible fake text on the paper — it will be nonsense and a reader will zoom in.
- Floating interface elements, charts, or anything that looks like a product.
- Warm haze, god rays, or a lens flare. It turns the room into a set.

Then check the last thing, which matters more than any of the above: **cover the
image with your hand except the top half. Does it still read as night?** If the
city is bright enough to compete with the lamp, the argument is gone.

---

## Handing it over

Drop the chosen file in `public/` and tell me. What I will do:

1. Export **AVIF + WebP + JPEG** at 2560, 1600 and 1024 wide, served through a
   `<picture>` with `sizes`, so a phone downloads a phone-sized file. Budget:
   **under 180 kB** for the largest AVIF. If the image cannot get under that
   without visible banding in the dark areas — and dark gradients band badly —
   it does not ship, because a 600 kB hero on a pre-launch page is a worse
   first impression than a drawing.
2. Set explicit `width`/`height` so nothing shifts while it loads, and
   `fetchpriority="high"` since it is above the fold on a phone.
3. Keep `nightfall.alt` as the accessible description — the current text already
   describes this composition, so it needs no change.
4. Keep the SVG in the repository. It becomes the fallback if the raster ever
   has to come out, and it is what the OG image is built from.

---

## When not to do this

The drawing is not a placeholder. It is worth being honest about what a raster
costs before swapping:

- **It stops being ours.** The SVG is built from `--ic-signal` and `--ic-ink-*`.
  If the palette moves, the drawing moves with it and a photograph does not.
- **It is 14 kB against ~150 kB at best.** On the one page whose job is a first
  impression, on a phone, on a train.
- **It can only be checked by looking.** The SVG's lit windows are provably
  eleven; a photograph's are whatever the model drew, and "one glowing screen in
  the background" is a claim the page is not allowed to make.
- **The failure mode is invisible to us and obvious to them.** The reason this
  brief bans so much is that generated interiors have a look, and the readers
  worth converting have seen it a thousand times on other pre-launch sites.

The honest test: put them side by side at 390px and at 1440px, and ask which one
a commercial director would describe to a colleague. If the answer is not
clearly the photograph, keep the drawing.

---

## Other images worth having

Not for the hero, and none of them blocking:

| Image | Where | Why it earns its place |
| --- | --- | --- |
| **The quotation itself** — a real printed RFQ page under lamplight, shot flat from above, 4:3 | Beside or behind the evidence document | It is the one section arguing "every figure carries the page it came from", and a photograph of an actual page is a stronger version of that sentence than the drawn one. Same lighting rules; text must be unreadable at reading size. |
| **A second night frame, vertical** | Nothing yet — hold it | The page has no slot for it. Worth generating while the look is dialled in, because a matching 4:5 crop is what a launch post or an ad set needs later and re-deriving the look in six months is how a brand drifts. |
| **Nothing else** | — | The page has one image on purpose. A second atmospheric shot lower down would be decoration, and this design has no budget for decoration. |

The OG share card is **already generated** from the site's own type and tokens
(`public/og-image.png`, 151 kB) and does not need a photograph — a share card is
read at thumbnail size, where a headline beats an interior every time.
