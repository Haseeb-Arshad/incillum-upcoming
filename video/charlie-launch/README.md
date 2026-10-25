# Meet Charlie — the product film

A 60-second launch film for Charlie: what it is and what it does, told in
chapters, the way a product is introduced rather than demonstrated. It is a
HyperFrames composition, like *Charlie at work* (`video/charlie`), which it
does not replace: that film, its files and its place on `/charlie` are
untouched. This one renders to `public/charlie/meet-charlie.mp4` and is not
yet placed on any page.

| Time | What it shows |
| --- | --- |
| 0–8 s | The night: the lamp over the quotation, the empty room, *The request arrives at 23:47. Everyone has gone home. The work hasn’t.* |
| 8–14 s | The reveal: Charlie’s mark drawn, the name, and Studio’s window rising out of depth. |
| 14–42 s | Seven chapters of four seconds, each a card (one Lucide icon, one word) and then Studio’s own page: Reads, Populates, Cites, Costs, Holds, Makes, Reaches out. |
| 42–48 s | *Nothing leaves without a person.*, then the approval: the margin under the floor, the reason typed, the press. |
| 48–52 s | *What Charlie does.*: the Charlie page’s abilities, word for word, as eight tiles. |
| 52–60 s | The same room at 08:04, the lamp still on, and the end card. |

## What is in it

| File | What it is |
| --- | --- |
| `index.html` | The composition: one GSAP timeline, the camera, the chapter cards, overlays and captions |
| `cues.js` | The film’s clock, read by the composition and the soundtrack, with the score |
| `sound.py` | The soundtrack: `video/charlie/sound.py`’s engine with four energies added for a launch film’s drive (`dark`, `reveal`, `drive`, `hush`) |
| `stills/` | Studio’s pages. Six are *Charlie at work*’s captures, copied, so both films show the same request on the same pages; `needs-you`, `artifacts` and `quotation` are captured by `capture.mjs` |
| `plates/` | Four photographs: the lamp over the quotation, the room’s glass wall at night, a quay at night, and the room at 08:04 (below) |
| `capture.mjs` | Captures the three new Studio pages, at twice the density, and measures their overlay rectangles |
| `icons.js` | Lucide icons as SVG strings, written by `build-icons.mjs` from the release Studio uses |
| `frames.mjs` | Stills of the composition at given seconds, without a render |

### The photographs

Generated with GPT Image 2.5 (through Higgsfield) on 25 October 2026, with the
site’s night and morning photographs (`design/night-source.png`,
`design/glass-morning-source.png`) as references, under the rules of
`design/hero-image-brief.md`: one warm light, nobody in the frame, no glowing
screen, nothing legible. They are atmosphere only — the room the work is done
in, and the outside world Charlie reaches — and they show no product, customer
or supplier.

### Composed, not captured

Chapter 07, *Reaches out*, is three cards built in the brand’s type over the
quay: a post in the team’s channel, a request to an approved supplier for a
firm price, and a call to a supplier whose quotation could not be read. Studio
does none of these yet (`requirements/README.md`), so they are composed, and
the two that leave the business wait for an approval on screen. Everything
else in the film is a Studio page.

The quotation in chapter 06 is Studio’s own draft, framed from its title down:
Studio’s sample data labels that draft with an earlier request’s number, and
the line it is on is left out so the film stays on RFQ 1907.

### The score

Original, composed for this film and played in code: A minor at 120 BPM, so a
bar is two seconds and every chapter starts on a downbeat. One piano figure
runs from the first frame to the last — in eighths under the night, in
sixteenths once Charlie arrives — and only what plays under it changes: a
heartbeat at night, a riser into the reveal, four on the floor and a rolling
bass under the chapters with a marimba hook over them, one bar with the drums
out for *Nothing leaves without a person*, and a resolution to C major on the
end card. Every sound is synthesised from sines and noise; nothing is sampled
or licensed.

## Rebuilding it

1. To recapture the three new pages, run Studio (`apps/studio` in the platform
   repository) with its demonstration data and
   `node video/charlie-launch/capture.mjs http://127.0.0.1:3301`, then convert
   `captures/*.png` to `stills/*.webp` (`ffmpeg -i x.png -c:v libwebp -quality 92 x.webp`;
   the quotation is cropped with `-vf crop=1616:1542:0:178`).
2. Copy the site’s two faces into `fonts/` as `sans.woff2` and `serif.woff2`.
3. `python video/charlie-launch/sound.py`, and check it with
   `python video/charlie/qc_audio.py video/charlie-launch`.
4. In this folder:
   `npx hyperframes@0.8.152 render . -o renders/meet-charlie.mp4 --quality high --workers 1 --low-memory-mode`.
5. Encode for the web with the product-film skill’s `publish.py`:
   `python publish.py renders/meet-charlie.mp4 ../../public/charlie/meet-charlie.mp4 --wav soundtrack.wav --poster 10.4`
   (H.264 CRF 23, faststart, soundtrack at −16 LUFS).

Only the music or a sound changed? Steps 3 and
`python video/charlie/mux_audio.py public/charlie/meet-charlie.mp4 video/charlie-launch/soundtrack.wav`
are enough; the picture is copied untouched.
