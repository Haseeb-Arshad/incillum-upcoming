# Charlie at work — the film on /charlie

A HyperFrames composition cut from Incillum Studio's own pages. The rendered
film and its stills live in `public/charlie/`; this folder is how they are made.

| File | What it is |
| --- | --- |
| `capture.mjs` | Captures the Studio pages, at twice the density, from Studio's sample workspace |
| `stills/` | The captures as WebP, which the composition reads |
| `index.html` | The composition: one GSAP timeline, the camera, overlays and captions |
| `cues.js` | The film's clock, read by the composition and the soundtrack |
| `sound.py` | The soundtrack, synthesised from sines and noise: nothing sampled |
| `icons.js` | Lucide icons as SVG strings, written by `build-icons.mjs` |
| `frames.mjs` | Stills of the composition at given seconds, without a render |

## Rebuilding it

1. Run Studio (`apps/studio` in the platform repository) with its default,
   demonstration data source, and capture: `node video/charlie/capture.mjs http://127.0.0.1:3301`.
2. Convert `captures/*.png` to `stills/*.webp` (`ffmpeg -i x.png -c:v libwebp -quality 92 x.webp`).
3. Copy the site's two faces into `fonts/` as `sans.woff2` and `serif.woff2`
   (from `src/fonts`; they are licensed, so they are copied in, not committed twice).
4. `python video/charlie/sound.py`, then, in this folder,
   `npx hyperframes@0.8.152 render . -o renders/charlie.mp4 --quality high --workers 1 --low-memory-mode`.
5. Encode for the web into `public/charlie/charlie-at-work.mp4`
   (`-c:v libx264 -preset slow -crf 23 -movflags +faststart -af loudnorm=I=-18:TP=-1.5 -c:a aac -b:a 128k`),
   take the poster at 18.8 s, and cut the step stills from the captures.

If a moment in `cues.js` moves, move the matching step's `at` in
`src/content/site.ts`; `site.test.ts` fails until they agree.
