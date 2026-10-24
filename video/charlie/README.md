# Charlie at work — the film on /charlie

A HyperFrames composition cut from Incillum Studio's own pages. The rendered
film and its stills live in `public/charlie/`; this folder is how they are made.

| File | What it is |
| --- | --- |
| `capture.mjs` | Captures the Studio pages, at twice the density, from Studio's sample workspace |
| `stills/` | The captures as WebP, which the composition reads |
| `index.html` | The composition: one GSAP timeline, the camera, overlays and captions |
| `cues.js` | The film's clock, read by the composition and the soundtrack |
| `sound.py` | The soundtrack: one piece played on the film's clock (`cues.js` → `score`, Bach's Prelude in C), and a sound for every cue — synthesised from sines and noise, nothing sampled |
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

`cues.js` carries the music as `score`: one piece from the first frame to the last, so nothing
drops out and the music never starts again. It is J. S. Bach's Prelude in C major (BWV 846, the first
of *The Well-Tempered Clavier*): bars 1–19 and its last chord, note for note, played on `sound.py`'s
felt piano. The composition is three centuries out of copyright and the playing is synthesised here,
so there is no recording in it and nothing to license.

A bar is 2.6 s (92 BPM), so the cuts land on its downbeats, and what plays under the figure changes
there: the piano alone in the night; a bass and a light beat from the iris (5.0); the full beat and a
pluck an octave over the piano from the sheet (15.4); the light beat again while Charlie stops and
asks (31.0); the full beat for the send (38.8); and the Prelude's return to C on the end card (46.6),
with its last chord rolled under the fade. The notes and the arrangement are data; the instruments
are `sound.py`'s. A moment moved in `cues.js` is not followed by the score: move the section with it.

If a moment in `cues.js` moves, move the matching step's `at` in
`src/content/site.ts`; `site.test.ts` fails until they agree.
