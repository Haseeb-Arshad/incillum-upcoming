# The film under the front page's hero

A 49-second film of what Incillum does with a request, rendered with HyperFrames
from one HTML composition and placed on the front page by
`src/components/glass-reel.tsx` (`public/film/incillum.mp4`, poster
`public/film/incillum.webp`).

It is not a walkthrough and not a night. It is cut the way an enterprise launch
film is cut: Studio's own screens floating on a dark stage, between three
daylight plates, one statement a beat, nothing narrated as progress. Charlie
does the work; one decision stays with a person.

| Time | Picture | Statement |
| --- | --- | --- |
| 0–2.4 s | Incillum's mark draws itself | *Incillum* |
| 2.4–7.6 s | Plate: a container port in daylight | *Every order starts with a quotation.* |
| 7.6–12.8 s | The request lands — a PDF, an Excel workbook, a Word file and a PowerPoint deck — and Charlie's name is on it | *Charlie picks it up the moment it lands.* |
| 12.8–16.7 s | Four lanes of sources with real file marks; the ones this request depends on light up and are ticked | *Reads everything the request depends on.* |
| 16.7–20.6 s | Plate: a sunlit warehouse, conveyors running | *Matches every line to a product you carry.* |
| 20.6–27.1 s | Studio's matrix fills and ticks off; line 09 is held; the finding opens with both sources cited | *Checks every figure against its source.* |
| 27.1–31.0 s | Plate: trucks on the road to an industrial park | *With your approval, asks suppliers for a firm price.* |
| 31.0–36.2 s | Studio's supplier comparison: the quotes ticked, the one that could not be read left alone, the cost basis ringed | *Compares every quote. Holds your margin.* |
| 36.2–41.4 s | Studio's approval: margin under the floor, a reason typed, approved | *Where money moves, you decide.* |
| 41.4–45.3 s | On paper: the quotation PDF, its Excel workbook, the Word letter, and the reply waiting to be sent | *The quotation, ready to send.* |
| 45.3–49.4 s | End card | *Intelligence for commercial work.* · incillum.com |

The statements are also in `src/content/site.ts` (`glass.reel.statements`);
`site.test.ts` holds the page and this composition to the same words in the same
order.

## What is in it, and where it came from

| Path | What it is |
| --- | --- |
| `index.html` | The composition: one paused GSAP timeline (`window.__timelines.main`), the camera, overlays and titles |
| `cues.js` | The film's clock, read by the picture and by the soundtrack, with the score and the cue sounds |
| `plates/` | The three daylight clips, generated with Kling 3.0 Pro through Higgsfield on 28 October 2026 (jobs `1d59a725`, `1476cb22`, `d9f54901`), re-encoded at 30 fps with a short keyframe interval for seeking; the port is slowed to 5.6 s |
| `stills/` | Studio's own pages from its sample workspace, as captured for the Charlie films (`video/charlie`): the matrix, the finding, the supplier comparison, the approval before and after its reason, and the quotation draft |
| `icons.js` | Lucide icons from the release the site and Studio use (`build-icons.mjs`) |
| `marks.js` | File marks (`build-marks.mjs`): Excel, Word, PowerPoint, PDF, CSV and image from Iconify's vscode-icons (MIT), a Google Sheet from Simple Icons (CC0) |
| `frames.mjs` | Stills of the composition at given seconds, without a render; it seeks the plates by hand, in Chrome, because they are H.264 |

**Composed, not captured:** the request card, the wall of sources, the workbook
and letter cards and the reply are set in the site's type, because no Studio page
shows them that way. The workbook's rows are the quotation draft's own rows.
What they show that the platform does not do yet is listed in
`requirements/README.md`.

**No system is named.** The site names no mail client, CRM or ERP (AGENTS.md §5),
so the marks are documents only; an email wears Lucide's envelope, as it does in
Studio.

**The score** is original: one sixteenth-note figure from the first frame to the
last, in D major, with only the layers under it changing on the cuts. It was
judged by measurement (`qc_audio.py`), not by ear.

## Rebuilding it

From this folder, with the product-film tooling
(`~/.claude/skills/product-film/scripts`):

1. Copy the site's two faces into `fonts/` as `sans.woff2` and `serif.woff2`
   (from `src/fonts`; copied in, never committed twice).
2. Check frames before rendering: `node frames.mjs . 10.6 14.9 22.8 25.9 33.0 40.5 43.6`.
3. `python <scripts>/soundtrack.py .` and `python <scripts>/qc_audio.py .`
4. `npx --yes hyperframes@0.8.152 render . -o renders/film.mp4 --quality high --workers 1 --low-memory-mode`
5. `python <scripts>/publish.py renders/film.mp4 ../../public/film/incillum.mp4 --wav soundtrack.wav --poster 14.9`

Only the music changed? Step 3, then
`python <scripts>/mux_audio.py ../../public/film/incillum.mp4 soundtrack.wav`;
the picture is copied untouched.
