# Incillum — X profile covers

Four upload-ready PNGs, each 1500 × 500 pixels:

1. `01-incillum-signature.png` — closest to the supplied reference.
2. `02-incillum-open-paper.png` — larger name and a white background.
3. `03-incillum-lockup.png` — the mark beside the name.
4. `04-incillum-night.png` — the centered signature on a dark ground.

All visible artwork sits within the central 380 pixels vertically, allowing
for the 60-pixel top and bottom crop described by [X's help page](https://help.x.com/en/managing-your-account/common-issues-when-uploading-profile-photo.html).
The artwork also starts more than 350 pixels from the left edge to leave room
for the profile photo. Actual X rendering can vary by device.

The files are newly typeset layouts based on the user's reference. The mark is
the four-ellipse geometry from `src/components/orbit-mark.tsx`, which the
current site's masthead uses. The backgrounds and typography were rendered as
HTML and exported as PNG, so there is no generated or guessed lettering.

The display face is Newsreader; the supporting face is Instrument Sans. Both
are under the SIL Open Font License 1.1, included in `fonts/`. The site's
separately licensed font files were not reused in these covers.

To rebuild the editable HTML files from this checkout, run:

```powershell
node output/x-covers/incillum/create-covers.mjs
```

Then render the desired HTML file at 1500 × 500 with Playwright, for example:

```powershell
npx playwright screenshot --browser chromium --viewport-size "1500,500" --wait-for-timeout 1500 "file:///E:/projects/incillum/output/x-covers/incillum/01-incillum-signature.html" "output/x-covers/incillum/01-incillum-signature.png"
```

The earlier photographic explorations, made before the reference was supplied,
are in the parent folder. Their image-generation prompts are documented there.
