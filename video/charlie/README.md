# Charlie at work — the film on /charlie

A HyperFrames composition cut from Incillum Studio's own pages. The rendered
film and its stills live in `public/charlie/`; this folder is how they are made.

| File | What it is |
| --- | --- |
| `capture.mjs` | Captures the Studio pages, at twice the density, from Studio's sample workspace |
| `stills/` | The captures as WebP, which the composition reads |
| `index.html` | The composition: one GSAP timeline, the camera, overlays and captions |
| `cues.js` | The film's clock, read by the composition and the soundtrack |
| `sound.py` | The soundtrack: an original score written on the film's clock (`cues.js` → `score`), and a sound for every cue — synthesised from sines and noise, nothing sampled |
| `qc_audio.py` | Loudness, a level curve and a spectrogram with the cues drawn on it (`frames/soundtrack.png`) |
| `mux_audio.py` | Lays a new soundtrack under the finished film, copying the picture untouched |
| `icons.js` | Lucide icons as SVG strings, written by `build-icons.mjs` |
| `frames.mjs` | Stills of the composition at given seconds, without a render |

## Rebuilding it

1. Run Studio (`apps/studio` in the platform repository) with its default,
   demonstration data source, and capture: `node video/charlie/capture.mjs http://127.0.0.1:3301`.
2. Convert `captures/*.png` to `stills/*.webp` (`ffmpeg -i x.png -c:v libwebp -quality 92 x.webp`).
3. Copy the site's two faces into `fonts/` as `sans.woff2` and `serif.woff2`
   (from `src/fonts`; they are licensed, so they are copied in, not committed twice).
4. `python video/charlie/sound.py`, and check it with `python video/charlie/qc_audio.py video/charlie`;
   then, in this folder,
   `npx hyperframes@0.8.152 render . -o renders/charlie.mp4 --quality high --workers 1 --low-memory-mode`.
5. Encode for the web into `public/charlie/charlie-at-work.mp4`
   (`-c:v libx264 -preset slow -crf 23 -movflags +faststart -an`), then lay the soundtrack under it with
   `python video/charlie/mux_audio.py public/charlie/charlie-at-work.mp4 video/charlie/soundtrack.wav`
   (two-pass loudness to -16 LUFS); take the poster at 18.8 s, and cut the step stills from the captures.

Only the music or a sound changed? Steps 4 and 5's last command are enough: `mux_audio.py` copies the
picture as it is, so nothing is rendered again.

## The score

`cues.js` carries the music as `score`: a bar of 2.6 s (92 BPM), and seven sections laid on the
film's cuts — the night (a felt piano over Am9), reads (the groove comes in on the iris at 5.0),
populates-cites-costs (the full groove and the melody, from the sheet at 15.4), stops and asks (the
drums drop out at the approval, 31.0), approved (a build into the send), sends (full again from 38.8)
and the morning (Cmaj9, from the end card at 45.3). Its chords, melodies and arrangement are data;
the instruments are `sound.py`'s. A moment moved in `cues.js` is not followed by the score: move the
section with it.

If a moment in `cues.js` moves, move the matching step's `at` in
`src/content/site.ts`; `site.test.ts` fails until they agree.
