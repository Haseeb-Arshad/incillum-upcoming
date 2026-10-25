# Meet Charlie — the product film

A 68-second launch film for Charlie: one request, one night, told as one
continuous move rather than a list of features. There are no chapter cards and
no feature grid. The film enters a photograph of an empty office through the
sheet of paper under the lamp, crosses one desk on which the night's work is laid
out, comes back out through the same paper at the moment it needs a person, and
goes in again in the morning for the person's decisions.

It is a HyperFrames composition, like *Charlie at work* (`video/charlie`), which
it does not replace: that film, its files and its place on `/charlie` are
untouched. This one renders to `public/charlie/meet-charlie.mp4` and is not yet
placed on any page.

| Time | What happens |
| --- | --- |
| 0–8 s | The office, the lamp off. *23:47* · *This needs an answer.* The request arrives from Halvorsen Marine, lands on the desk as the paper under the lamp, and the lamp comes on: *Charlie*. |
| 8–16 s | In through the paper. Charlie reads the request (its name on what it is reading), and Studio's panel fills with each fact and the place it came from. The camera pulls back to the covering email, the bill of materials, the framework agreement and the business system's record. *It reads the request, and everything you hold.* |
| 16–26 s | *Every figure keeps its source.* The bill of materials' rows run into Studio's sheet. Line 09: 84 on the sheet, 60 in the covering email, both sources side by side, held. Line 04: panel or rail, with the precedent from the business system, held, and Charlie's name parked beside *Needs your decision*. |
| 26–36 s | Five supplier quotations, one that could not be read. EUR 191,900 and EUR 5,730 freight make the cost basis, EUR 197,630. *The quotation takes shape*: a quotation PDF and a workbook whose Sources sheet says where every figure came from. |
| 36–44 s | Four drafts, each awaiting approval: the customer (which quantity, and the drawing that never arrived), a supplier (the quotation it could not read), a manufacturer (a firm price and lead time) and a Google Meet with Aldermann about its two lead times. The margin, 16.40% against a 20.00% floor. The music stops. *This needs your decision.* Out through the paper. |
| 44–50 s | The same room, night to 08:04. In through the paper again: the person answers line 04. |
| 50–60 s | The reason typed, *Strategic account. One-off for the Ålesund fit-out.*, held still, and the exception approved: the music's unanswered phrase resolves. *Nothing leaves without your approval.* Each draft is approved and sent in turn; the quotation is ready for review. |
| 60–68 s | Out through the paper to the morning room; the lamp goes off. The paper becomes the end card: Charlie, *The colleague in Incillum for commercial work.*, incillum.com. |

## What is in it

| File | What it is |
| --- | --- |
| `index.html` | The composition's structure and styles: the room, the desk with every document on it in world units, and the type over both |
| `film.js` | The timeline. Three cameras the timeline tweens as plain objects (the room's, the portal's and the desk's) turned into transforms on every frame, so a seek to any second is exact |
| `cues.js` | The film's clock, read by the picture and the soundtrack, with the score |
| `sound.py` | The soundtrack: `video/charlie/sound.py`'s engine with this film's energies, a wood pulse, the room's own sound and the lamp, mail and paper cues |
| `plates/` | `night-off`, `night-on`, `morning-on` and `morning-off`: one frame of the office in four states of light; `dawn.mp4`, the night turning to morning between them |
| `stills/` | Studio's pages, captured from its sample workspace: the request's extraction panel, the sheet, the finding, the held question, the suppliers and the approval |
| `icons.js` | Lucide icons as SVG strings, written by `build-icons.mjs` from the release Studio uses |
| `capture.mjs`, `frames.mjs` | Capturing Studio's pages; stills of the composition at given seconds, without a render |

### The dive through the paper

The paper on the desk is measured once, its four corners in the frame
(`PAPER` in `film.js`). Going in, the desk is drawn as a projective map
(`matrix3d`) from the page's rectangle to those corners, and the corners travel
to the rectangle while the room's camera pushes in, so the page lifts off the
desk and squares to the frame; then the desk around the page opens out. Coming
out is the same in reverse. The camera never cuts on the desk: every move is a
`fromTo` from the last keyframe.

### The photographs

The four plates are one frame. `night-on` is the night photograph made for the
first version of this film (generated with GPT Image 2.5 through Higgsfield on
25 October 2026, with the site's night photograph as reference); the other three
were edited from it with GPT Image 2.5 on 26 October 2026, and line up with it to
within two pixels. `dawn.mp4` was generated with Kling 3.0 Pro (Higgsfield) with
`night-on` as its first frame and `morning-on` as its last, and sped to four
seconds. They follow `design/hero-image-brief.md`: one warm light, nobody in the
frame, no glowing screen, nothing legible.

### Composed, not captured

Studio's own pages are the extraction panel, the sheet, the finding, the held
question, the suppliers and the approval. Composed in the brand's type, from
Studio's sample data:

- the documents Charlie reads: the arriving email, the request's first page, the
  covering email, the bill of materials, the framework agreement and the business
  system's account record;
- the cost basis card, and the quotation PDF and workbook (Studio's sample
  quotation belongs to another request);
- the four drafts and their approvals, Studio's answer to line 04, and the
  approved and sent states.

Reading a business system, writing to a customer, a supplier or a manufacturer
and sending a meeting invitation are not built (`requirements/README.md`). Every
outward message in the film waits for a person and is sent only when one approves
it. Google Meet is named in words, never with its logo.

The figures are Studio's: line 09 is 84 on the bill of materials and 60 in the
covering email; Aldermann's EUR 191,900 and EUR 5,730 freight make the cost basis
of EUR 197,630; the customer total is EUR 236,400.00, a margin of 16.40% against
a floor of 20.00%. Studio prices that total at the sheet's 84 units, so the film
asks the customer which quantity holds instead of having the person pick one.

### The score

Original, composed for this film and played in code: D minor to F major at 120
BPM, a bar every two seconds. A short phrase on the piano is asked from the first
bars and always left on its fifth; under it a pluck figure, a rounded bass and a
dry wood pulse build through the night, thin out at the disagreement, open when
the quotation takes shape (36 s) and stop dead at the floor (40 s), leaving only
the room. One held tone, then the morning. The phrase is answered only when the
person approves the exception (54 s), and the film ends on F major. Every sound is
synthesised from sines and noise; nothing is sampled or licensed.

## Rebuilding it

1. To recapture Studio's pages, run Studio (`apps/studio` in the platform
   repository) with its demonstration data and
   `node video/charlie-launch/capture.mjs http://127.0.0.1:3301`, then convert
   `captures/*.png` to `stills/*.webp` (`ffmpeg -i x.png -c:v libwebp -quality 92 x.webp`).
2. Copy the site's two faces into `fonts/` as `sans.woff2` and `serif.woff2`.
3. `python video/charlie-launch/sound.py`, and check it with
   `python video/charlie/qc_audio.py video/charlie-launch`.
4. `node video/charlie-launch/frames.mjs 10.6 21.5 …` for stills at any second
   (the dawn clip shows only in a render).
5. In this folder:
   `npx hyperframes@0.8.152 render . -o renders/meet-charlie.mp4 --quality high --workers 1 --low-memory-mode`.
6. Encode for the web with the product-film skill's `publish.py`:
   `python publish.py renders/meet-charlie.mp4 ../../public/charlie/meet-charlie.mp4 --wav soundtrack.wav --poster 7.2`
   (H.264 CRF 23, faststart, soundtrack at −16 LUFS).

Only the music or a sound changed? Step 3 and
`python video/charlie/mux_audio.py public/charlie/meet-charlie.mp4 video/charlie-launch/soundtrack.wav`
are enough; the picture is copied untouched.
