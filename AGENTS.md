# AGENTS.md — Incillum pre-launch site

The operating contract for this repository. Read it before changing code.

---

## 1. What this is

The public site at **incillum.com** while there is no product to show yet. One
page, one argument, one conversion: an email address for the waitlist.

**The front page is the presentation** (`components/glass-page.tsx`, §4 _The
presentation_): the night told as a film, then a short sourced case about
response time, pricing and the work in a sales week, six commitments about
data and trust, the questions, and the morning. It moved to `/` from `/glass`,
which now redirects there. Its sections are specified in §4 _The acts on the
desk_. The quotation in the film remains one illustrative example; the case
uses third-party research with a source beside every figure. It makes no claim
about Incillum's own results.

It is deliberately **not** a marketing site with the product pages removed. Its
navigation is one menu, Product, with Charlie in it (`/charlie`), and a link to
the contact memo (`components/masthead-bar.tsx`, the reference pages' dropdown
box). There is no pricing, no blog and no security page — the owner removed the
last, and the Trust and Company menus, on 22 October 2026. Each page that
exists explains one thing.

### The positioning

Incillum's argument is **the unattended hours**: important commercial work keeps
mattering after the people carrying it have stepped away, and Incillum is being
built to stay attached to it.

The first work it is being built for is the quotation — an RFQ arriving, being
resolved into lines, carrying supplier costs and margin through to a price, and
coming back to a person as a decision. Narrowly: **RFQ to commercial decision**.

That replaced an accounts-payable framing (invoice intake, three-way match,
exception handling). The wedge is narrower on the page and the company is wider:
the hero names the whole arc — request, decisions, follow-ups, documents,
financial consequences — and §06 names the one job being built first. Do not
widen §06 and do not narrow the hero.

**One product story, with evidence for the argument.** The product film follows
one quotation, from 23:47 to 08:04. The case beside it uses published third-party
research, never Incillum's own performance or customer data. The test for
anything added is not "is this true and interesting" — most of what could be
added is — but "does a stranger need this before deciding whether to leave an
address".

### The motto

**Stay with the work.** Used exactly **twice** on the whole site: the close, and
the success state after somebody joins. It survives on scarcity — a phrase this
short is a signature the third time it appears and a slogan the fourth. It is
never extended: "AI that stays with your work" is the same idea with the
conviction removed. `content/site.test.ts` and `e2e/site.spec.ts` both count it.

### The words

The owner's calls of 29 October 2026, for every word a reader sees:

- **No em dash.** Not in copy, not in a title, not in alt text. It is the first
  thing that makes writing read as generated. A page title separates the page
  from the site with a straight line: `Incillum | Intelligence for commercial
  work`, `Charlie | Incillum`. Code comments may keep theirs; readers never see
  them. `content/site.test.ts` and `e2e/glass.spec.ts` both check.
- **Speed is the message; the night appears once.** The page leads with what
  Charlie does the moment a request lands. The night and the office at 08:04
  are kept for the close, where they are the payoff, and are not repeated in
  the hero or the case.
- **Short.** A figure's label is a few words; a lede is one or two sentences.
  The long form belongs in the private brief, not on the front page.

---

## 2. Repository shape

```text
incillum/
├── src/
│   ├── content/site.ts        every word the site renders
│   ├── components/            one file per section, used once each
│   ├── lib/                   schema, spam heuristic, seo, analytics, motion, dust, cn
│   ├── server/                server functions, env, notifier, store, private brief
│   ├── routes/                __root, index, contact, glass, brief, robots, sitemap
│   ├── fonts/                 self-hosted woff2
│   └── styles.css             tokens, type scale, the two scopes
├── design/                    generators for the mark and the share card, photo encoders
├── e2e/                       Playwright
└── public/                    favicon, logo, share card
```

Nothing is shared with the `incillum` platform repository. This site links to
that product; it does not import from it, and it must not grow a dependency on
it. If the two ever need the same component, the answer is a package, not a
relative import across repositories.

---

## 3. Technical defaults

TanStack Start · React 19 · strict TypeScript · TanStack Router · Tailwind CSS
v4 · React Hook Form · Zod · Vitest · Playwright.

No component library, no animation library, no state manager, no analytics
SDK, no email SDK. Each was considered and each would be a dependency carried to
solve a problem one page does not have — the reveal is eleven lines of CSS and
one IntersectionObserver, the GTM loader is Google's own nine lines, and the
mail is one `fetch`. Adding a dependency requires a reason written into the file
that needs it.

**Icons are Lucide**, the set Studio draws with (`@incillum/icons`), pinned to
the same release, on the owner's decision of 23 October 2026: an icon on the
site is the icon in the product, not one drawn for the page. They are imported
by name in `components/icons.tsx` and nowhere else, one stroke for all of them,
in `currentColor`. One vendor's mark is shown, by the owner's call of 29 October
2026: Gmail's, on an email in a drawing of the product (see *File marks* in
§4). The site still names no system (§5).

---

## 4. Design rules

**Two typefaces, one colour.** A text serif at its single weight does every
heading but one kind — the titles on the cards of protection, which are the
grotesk at reading size, as the reference page sets them; a grotesk does
everything a person reads at length or operates. There
is no third voice, no shadow, and two gradients: the scrim over the hero
photograph, which exists to hold the headline at AA and is built from the night
token, and, by the owner's call of 29 October 2026 ("only if a gradient will
look good at the bottom"), the footer's: a wash from the page's white to the
sunken paper, and the fade on the name set across the bottom of the page. It is
ink and paper only and never gains a hue. Contrast is still most of the emphasis, which is exactly why spending it
carelessly ruins this page.

- Every colour, size, radius and duration is a token in `styles.css`. A literal
  hex in a component is a bug. The one exception is `theme-color` in
  `__root.tsx`, which browsers read before any stylesheet is parsed.

### The signal

There is **one hue**, `--ic-signal`, and it is lamplight rather than a brand
colour: a burnt sienna on paper, opening to amber in the dark scope. Two values
of one light, not one colour at two lightnesses.

It means one thing — _something is still lit_ — and it appears in **four**
places, which is the whole licence:

1. the lamp and the lit windows in the night photograph,
2. the reader's own hour on the instrument, where it is on the page,
3. the held state, on the spreadsheet inside the product film,
4. the figure that breaks the commercial floor — on that spreadsheet and in
   the handover.

Every one of those is the same quotation at another magnification, not a new
place for the colour. `e2e/home.spec.ts` and `e2e/glass.spec.ts` fail on any
text in the signal outside them.

There is deliberately no red. A held line and a missed floor are the same event
— work that stopped and is waiting for a person — and two colours would say they
are two things. Anything that is not one of the four above uses ink.

**File marks keep their own colours**, by the owner's call of 29 October 2026,
and only inside the drawings of the product (`components/file-icon.tsx`): a
PDF's red band, a workbook's green, a document's blue, a drawing's teal, as a
reader's own desktop shows them. They are generic shapes with the format
written on them, never anybody's logo, and their tokens (`--ic-file-*`) are
used nowhere else. They are the documents' identity, not a palette: no
heading, figure, button or state takes one.

**Mail is the one exception**, by the owner's call of 29 October 2026: an email
in a drawing carries the official Gmail mark (the 2020 logo, five flat shapes
in Google's own colours, `GmailMark` in `file-icon.tsx`), because a buyer reads
it at once as an email arriving. It is the identity of the object drawn, in
the product scenes only. The page never writes the name, never says anything
works with Gmail, and the mark is never a heading, a button or a link; the
tests fail on the word. It is Google's trademark, and the platform has no
mailbox reader yet (`requirements/README.md`), so a reader could take it for
an integration the site does not claim. Check Google's brand terms before the
site is public; it is one component to change if they or the owner say so.

### The night

The front page opens in the night and ends at 08:04, back on paper, where a
person picks the work back up. A reader scrolls out of a night.

> **History.** Most of this section was written for the photo-led page that
> stood at `/` before the presentation: its night plate, its mirrored
> photograph and its in-flow masthead are retired with it, and the
> photographs in `public/night/` stay in the repository but are no longer
> shown on any routed page. The rules that follow — one `[data-inverted]` region, no hairline
> at its seams, the desk after it, the texture, the motion discipline and
> reduced motion — are the presentation's rules too. Its own specifics are in
> _The presentation_ below.

It used to open on paper and go dark further down. It opens dark now because
the commissioned photograph — an empty office, one lamp, a quotation under it —
is the argument with the words taken away, and below the fold it was doing
none of that work. The photograph is mirrored so the lamp and the quotation sit
on the right and the headline sits over the switched-off monitor; nothing in the
frame is legible, so nothing reads backwards. On a phone it takes the top half of
the screen by itself rather than being scrimmed to nothing behind the words.

The order inside the band is load-bearing: the photograph says where we are,
and the film says what happened in it.

- **The film** (`components/glass-film.tsx`, shared with /glass) is the
  product's own object — one request's lines with status and evidence, set as a
  spreadsheet on a _lit_ panel: `[data-lit]` re-points the tokens back to paper
  inside the band, because the one lit thing in the photograph is paper. It
  plays the night from 23:47 to 08:04 once while it is on screen, the reader
  can pause it or pick an hour, and it stops at 08:04 — where the band ends and
  the page turns to paper. Its first line names what it follows, its
  rows are the matrix's (`home.matrix`, tested against the thread's prose), and
  it carries no money of its own: it reads the thread's 06:50 ledger. It is the
  honest substitute for the product video and the logo wall enterprise pages
  lead with, which §5 forbids.
- **The paper is white.** After the band the page lies on white
  (`--glass-ground`, which is `--ic-paper`, #FFFFFF), with no grain in it — the
  owner's call on 2026-10-23, against the reference pages, beside which the old
  warm #F7F7F5 and the memo's desk tone read as grey. The contact memo keeps
  its darker desk (`--memo-desk`), because its sheet is paper laid on a desk.
  With no step of paper left for elevation, a white panel on white is drawn by
  its `line-strong` hairline, and a tile, a sheet's head or a sheet's foot steps
  down to `paper-sunken`; `e2e/glass.spec.ts` holds the ground white. The two
  pages share the brand at the same coordinates (`components/site-brand.tsx`),
  the pressed-ink button, and the two typefaces; the pressed-ink speckle is for
  paper only and is dropped in the dark, where its holes would read as dust.

- The dark region is `[data-inverted]`, which re-points the same tokens. It is
  not a second palette, and there is **exactly one** on the page — the
  photograph and the film, as one band. `e2e/home.spec.ts` counts
  it. Nothing inside it knows it is dark: every child is written against
  `text-ink` and `border-line` and would render correctly on paper.
- No hairline at either seam. The colour change is the strongest edge on the
  page already, and a rule drawn on it reads as a mistake.
- **The masthead stays with the reader, and nothing paints over it.** One
  `banner`, fixed, outside every section — inside the night's layer it lost to
  the gathered sheet, which painted over it — and `e2e/glass.spec.ts` scans
  the whole page for anything covering it. It is see-through, by the owner's
  call: clear over the first screen, then a pane of whatever it is over (the
  night's ground or the white paper, at 86%, blurred), never a black bar over
  white. Its tokens follow what is under it (`data-tone`, from a point half a
  masthead above the night's end): the night's, then the paper's. It never
  shrinks and never gains a shadow. It slides up out of sight while the reader
  scrolls down and returns on the first scroll up, as bars do in the
  applications people use (the owner's call of 30 October 2026, after a day of
  keeping it fixed): always there at the top, with a menu open and while focus
  is inside it, and never moving under reduced motion. It moves by `translate`
  because the entrance animation's last frame holds `transform`. There is no
  progress line along it (the owner removed it). It is legible in every state a browser can paint it in: a reload or a
  link to a section paints the server's top-of-page guess where the reader
  was, so a head script (`lib/masthead.ts`) reads the scroll before the page's
  own script exists and says so on the document (`data-bar-pane`,
  `data-bar-day`), the stylesheet draws from those until the page's own state
  is in place (`data-bar-live`, set before paint), and without a script at all
  it is a white pane (`@media (scripting: none)`). `e2e/glass.spec.ts` holds
  each. Its links are the page's own sections and the contact memo; below a
  laptop's width they are one sheet behind a button that says *Menu*, a native
  `<details>` that opens with no script, so the Product page can be found on a
  phone as on a desk.
- Radii are 6px on controls and 12px on panels. Nothing else is rounded.
- Depth comes from hairlines, never from shadows.
- **Texture:** a fractal-noise tile at ~6%, generated by the browser's own
  filter, on the night's ground; the white paper has none, by the owner's call.
  The light tile (~4%) is the contact memo's alone. The
  alpha is baked into the tile rather than applied to a layer over it — the
  obvious `::before` version needs `position: relative` on `body` and silently
  unsticks the masthead.
- Motion is restrained and has a job. The home page's whole budget, written down
  in `styles.css` above the block that spends it: the hero's one entrance; the
  film, once through while on screen; one reveal per section; the masthead
  filling in, 300ms; the arrow nudge and the press; and, by the owner's call of
  29 October 2026 for real product energy, **scenes**: the case's figures
  counting to themselves and requests landing across the map, the week's bar
  drawing in, the showcase's four panels and the trust drawing each playing
  their story once as they come into view (`useScene` in `lib/motion.ts`,
  `CountUp`). A scene is still on the server, without a script and under
  reduced motion, which is its last frame; armed at its first frame until it is
  on screen; and played once, never again that visit. Nothing loops and nothing
  pulses. The masthead's slide away and back follows the scroll's direction
  and is absent under reduced motion. The dust, the morning's deck (the
  photograph rising on two sheets behind it, and the two cards dealt from under
  it) and the footer's name rising belong to this page, each one property
  written on a frame, resting at its last frame without a script and under
  reduced motion. A page where every
  card lifts and every row slides is a page that is nervous; a scene earns its
  motion by telling something that happens to the work.
- The night plate does not move, and that is a decision rather than an omission.
  Its subject is a room where nothing is happening; a flickering window or a
  drifting light would turn the one honest image on the site into a screensaver.
- **Everything must honour `prefers-reduced-motion`,** and honouring it means
  rendering the final state, not a faster transition. A reveal that starts at
  `opacity: 0` and depends on a script is worse for that reader than the
  animation they were avoiding.

### The acts on the desk

After the night, the page makes the argument for the work with published
research, then says what Incillum does with a business's figures and answers
the buyer's questions:

| Act                                                                 | Stands where they put           | Component        |
| ------------------------------------------------------------------- | ------------------------------- | ---------------- |
| A sourced case: response time, pricing, and the working week        | customer logos and testimonials | `case.tsx`       |
| The showcase: four panels of what working with Charlie looks like   | the product modules             | `showcase.tsx`   |
| Data and trust: the boundary drawn, then six commitments            | certification badges            | `trust.tsx`      |
| Questions, answered in full                                         | the testimonials                | `questions.tsx`  |
| The morning — the 08:04 room, the handover, the ask, the next steps | the closing band                | `glass-page.tsx` |

- **The case is not Incillum's performance.** Each figure has a linked source
  beside it, keeps its original scope, and is third-party research. Publisher
  names may appear only as citations attached to the figures, never as customer
  logos or claims of integration. The world map is a neutral dot drawing; the
  week bar shows the survey's three grouped shares and totals 100%.
- **The showcase is the product at work** (`components/showcase.tsx`), in the
  bento the owner pointed at on 29 October 2026 and the shape of Hebbia's own
  product grid: "Your quoting desk, without the queue." Four scenes from one
  request, each played once as it comes into view: Charlie picks the request up
  the moment it lands and ticks through it to the two lines that need a person;
  a value goes back to its clause and is highlighted there; a supplier's price
  moves and line 14's margin counts down through the floor to its shortfall,
  held; and the working waits until a person's yes, after which the outward
  steps are sent. Sunken panels on white, white cards with hairlines inside,
  file marks in their own colours, Lucide glyphs for everything else, a
  portrait for each person, and Gmail's mark on an email; no other image or
  vendor's mark. Every count and figure is read from the documents, the
  matrix, the evidence document and the channel; the copy (`showcase` in
  `content/site.ts`) writes none, only `{tokens}`.
- **The people are portraits, not initials** (`components/avatar.tsx`,
  `people` in `content/site.ts`). James, Sara, the customer's buyer and the
  supplier's contact are invented, like the customer: none is a customer, a
  user or a member of this company, and nothing about them is a claim. Their
  portraits are illustrated line drawings in the site's ink (`public/people`;
  CC0 portraits from the Lorelei set by Lisa Wischofsky, chosen option by option
  and recorded in `design/people.md`), because a stranger's photograph under a
  job title would read as a customer and is not ours to use. A photograph can
  replace any of them by changing its path; real photographs are the owner's to
  supply or to commission. They appear only inside drawings of the product,
  never as a face for the company, and are decorative to a screen reader
  because the name is always beside them.
- **Trust is a system, drawn** (`components/trust.tsx`): "Nothing leaves
  without you." A customer's request and a supplier's answer arrive as real
  emails, each from a person with their portrait and Gmail's mark; your
  organisation is a boundary, with your price lists, costs, agreements and
  quotations inside it, Charlie working among them, and three guards beside
  them (isolated by organisation, credentials sealed, every decision recorded);
  the path to model training is drawn, struck through and refused; the only way
  out is a person's approval, named in words and with no portrait, and given by
  one small control; and the quotation and the supplier request go out to their
  recipients only after it. Every card is as tall as what is in it (an email's
  attachments once ran past its border), the connectors leave the middle of the
  card they belong to, and `e2e/glass.spec.ts` measures every card's rows against
  its padding at every width. Two things on it were drawn two ways for the owner
  to choose between on 29 October 2026, and `/lab/trust` shows every
  combination (private: `noindex`, no link, no sitemap entry): the emails
  `named` (the sender's name and role beside the portrait) or `faces` (the portrait
  alone), and the approval as a `button` (one object that is pressed and settles
  into the record) or a `slide` (a knob carried across a track). The front page
  draws `trustChoice`; once one way of each is chosen the other, the lab and its
  spec are deleted. On a wide screen it is one picture
  on a 1120 by 620 grid with curved connectors, every size a multiple of one
  design pixel (`--u`, the board's width over 1120) so it scales as a whole and
  never reflows; below a laptop it is a column in the same order. The owner
  found the ruled rows and then the small diagram that came before it read as a
  page of answers and as a sketch. It is one image to a screen reader, described
  in full by `trust.diagram.label`, and plays once like the showcase: lines
  drawn in with a pulse carried along them, the approval pressed, then the
  lines out. Under it, the six commitments are a spec grid of real text. The
  two commitments already on the record, `access.decided` and the approval
  boundary, keep their words. No framework is named anywhere on the site (§5);
  both suites fail if one is.
- **One showcase card leads to Charlie.** The pickup panel is a link, by the
  owner's call of 29 October 2026: a button that says *Meet Charlie* stretched
  over the whole card, so the picture is as good as the button, and the only
  link in the grid.
- **Questions are cards, and still open** (`components/questions.tsx`): an icon
  on its tile, the question in the serif, and the answer under it with its first
  sentence in ink, so it can be taken from that sentence alone. The owner found
  the ruled list read as a FAQ. Still a real `<dl>`, every answer in the HTML,
  nothing behind a click and no `hidden`, and both suites hold it; three
  answers are read from copy the site has already committed to, so they cannot
  drift. A card beside the heading sends a question that is not here to the
  contact memo, and promises no time.

### Charlie

- **`/charlie`** (`components/charlie-page.tsx`, `charlie-agent.tsx`,
  `charlie-reel.tsx`): a headline and the two ways on; the film of Charlie at
  work; then Charlie as an agent, which the film does not say: talked to in a
  team's channel (the morning's messages from `charlie.scene`, the request in
  plain words and the approval after it), who it talks to (the team, the
  suppliers, the telephone: each drawn as itself, with the approval it waits
  for), and where it stops (what it does alone, what waits for a person, what
  it never does); one invitation. The same six steps, each with a still, used
  to follow the film and repeated it, so the owner had them removed on 29
  October 2026: the film keeps its chapters, and `charlie.steps` and the
  stills are kept, unplaced. The film plays muted while half of it is on
  screen, never by itself under reduced motion, and the reader's play or pause
  outranks the scroll.
- **The film is Studio's own pages** (`video/charlie`), not a drawing of them:
  stills captured from Incillum Studio's sample workspace (`capture.mjs`, at
  twice the density), cut into a HyperFrames composition (`index.html`, its
  clock in `cues.js`), scored with one continuous piece played on that clock
  — Bach's Prelude in C, a public-domain composition — and a sound for every
  cue, all made from sines and noise (`sound.py`: no recording, nothing
  sampled or licensed), and rendered to `public/charlie/`. Its request is Studio's —
  Halvorsen Marine's RFQ 1907 — not the front page's RFQ 8841, and its figures
  are Studio's. Two things in it are not Studio pages: the email arriving at
  23:47, and the send with the night's record after the approval, because
  Studio does not send yet (`requirements/README.md`). Each step's `at` is a
  moment of `cues.js`; `site.test.ts` fails if they part. To change the film:
  run Studio in demo mode, `node video/charlie/capture.mjs <studio url>`,
  convert the captures to `stills/`, `python video/charlie/sound.py`, then
  `npx hyperframes render` in `video/charlie` and encode for the web, as
  `video/charlie/README.md` records; a new soundtrack alone goes under the
  finished film with `mux_audio.py`, which copies the picture untouched.
- **Meet Charlie** (`video/charlie-launch`, rendered to
  `public/charlie/meet-charlie.mp4`) is the launch film: the same request in
  one continuous move, with no chapter cards — into a photograph of the empty
  office through the paper under the lamp, across one desk where Charlie reads,
  cites, costs, makes the quotation and its workbook and drafts four messages,
  out through the paper where a person is needed, and back in at 08:04 for the
  person's decisions. Its room is one generated frame in four states of light and
  a generated clip of the night turning to morning; its score is original and
  played in code. It does not replace _Charlie at work_, which the owner keeps,
  and it is on no page yet. Its business-system record, drafts and approvals are
  composed, and listed in `requirements/README.md`; its `README.md` records how
  it is made.
- **The page** is laid in `components/page-frame.tsx`: the masthead a pane
  over white from the start, in the paper's tokens — the page has no dark
  region at all — the white paper, and the front page's footer without the
  motto. It is in the sitemap.

### The contact memo

`/contact` is the waitlist form on a sheet of continuous-feed paper: a perforated
page on a darker desk, floating labels, a pressed-ink button, and on success a
paler carbon copy that repeats what was typed and is stamped. It posts to the
same `joinWaitlist` function as the home page and keeps the same promise — only
the address is required, nothing is sent to the joiner, and the receipt says we
have it and will write once.

- **Two voices, no third.** The printed form is the serif in capitals; whatever a
  person enters is the grotesk. No mono, however natural a typewritten form makes
  one look.
- **No proof column.** The page it is modelled on spends a column on customer
  logos and quotations. This site has none and §5 forbids implying any, so the
  column says what happens after somebody writes.
- **No colour, including for errors.** A field that needs attention takes the
  heavier rule and says so in words. The stamp is ink, not red.
- **The desk and the carbon are neutrals** (`--memo-desk`, `--memo-copy`), scoped
  to `.memo-page` the way the harbour scope is. They are not a palette.
- **Static text only takes the worn-ink filter.** Never on what somebody is typing.
- The motto appears in the receipt through `brand.motto`, which is one of its two
  placements — it is not spent a third time.

### The presentation

The front page (`/`) opens with three short beats in Incillum's own words —
"Intelligence should move work forward.", "From request to decision.",
"Meet Charlie." — over a field of hour rules. Each beat arrives a word at a
time, rises from below its own mask, then leaves before the next. Only opacity
and transform move. The opening plays once a visit, and again on a reload at
the top, never on a return from another page, a reload further down or an
address with a section in it (`lib/opening.ts`). The centered hero has the
waitlist form, followed by the product film, the sourced case, six trust
commitments, open questions and the morning: one invitation and the motto. It
carries the front page's title, description and canonical at `/`; `/glass` is a
permanent redirect there. `e2e/glass.spec.ts` holds both.

- **The masthead stays within a flick of the reader**: fixed, above everything,
  clear over the first screen and a see-through pane after it, in the tokens of
  whatever is under it, out of the way going down and back going up (see
  _The night_). Its links are the page's own sections and
  the contact memo, with the one button, which puts the cursor in the field;
  below a laptop's width a *Menu* button opens them as one sheet.

- **No labels over headings.** No tracked capitals anywhere on it — not over a
  title, not inside a document — and no title in two tones. The first version
  had both and read as assembled. What a block follows is said in a sentence
  at reading size; `e2e/glass.spec.ts` fails on any uppercase text.
- **The case follows the film** (`components/case.tsx`). Four sourced figures
  sit beside a neutral dot map; a grouped survey of a sales week follows. Every
  figure is linked to its source and keeps the source's scope. The map and the
  chart use ink, never the signal. This is evidence for why the work matters,
  not evidence of Incillum's results.
- **It ends in the night plate's own room at 08:04** — the morning plate,
  generated from the night source as its reference, overcast on purpose (a low
  orange sun read as evening and spent a sky's worth of the signal's hue), and
  cleaned of the one mark the generator left on the monitor. The photograph is
  left clean: nothing is laid over it (the owner's call of 29 October 2026).
  What waits in the room is the handover under it
  (`components/glass-handover.tsx`), on a sunken panel as the showcase's are:
  Charlie's own 08:04 message in the team channel with the quotation and its
  workbook attached, and James's decision with the two figures from the 06:50
  ledger, the shortfall counting up in the signal. Built in the site's type
  and writing nothing of its own.
- **Its motion budget** is listed in `styles.css` above the block that spends
  it: the opening, the film, the dust, the morning's parallax, the case bar
  drawing once, the masthead filling in, one reveal per block after the night,
  the nudge and the press. The film plays muted only while half of it is on
  screen and never by itself under reduced motion; nothing pulses; reduced
  motion gets the final frame of all of it.
- **The film under the hero** (`components/glass-reel.tsx`, rendered from
  `video/product-film`, served as `public/film/incillum.mp4`) says what
  Incillum does with a request, not how a night went: one statement a beat —
  Charlie picks it up, reads what it depends on, matches and checks every
  line, asks suppliers _with your approval_, compares the quotes and holds the
  margin — the one decision that is a person's, and the documents ready to
  send. Studio's own pages float on a dark stage between three daylight plates
  (a port, a warehouse, a highway; Kling 3.0 Pro through Higgsfield). It
  follows Studio's sample request from Halvorsen Marine, as Charlie's page does,
  not this page's quotation. File marks only (Excel, Word, PowerPoint, PDF,
  CSV, an image, a shared Google Sheet) — never a mail client's, CRM's or
  ERP's. Its statements are on the page as text, and `site.test.ts` holds them
  to the composition word for word. On 28 October 2026 the owner replaced the
  night played hour by hour (`components/glass-film.tsx`) with it, as reading
  as progress rather than as the idea; that component and its styles are kept,
  unplaced, and the bullet on _the film's sheet_ below describes it.
- **The dust is the one exception to "nothing moves while the reader is
  still"**, and it is the owner's call rather than a lapse
  (`components/glass-field.tsx`, drawn by `lib/dust.ts` in WebGL with no
  library). At the top it is a landscape under the hero, and the opening's
  three beats are set on plain night: it is dark under all of them. As the
  last beat leaves and the page assembles — on the opening's own clock, read
  off its CSS animations — the night comes up behind the headline over a
  little more than three seconds: no grain moves, only the light changes, the
  crests catching it first and the troughs last, while the landscape rises a
  little into place. It was a slit of light under "Meet Charlie." that the
  landscape unrolled out of, until the owner, on 28 October 2026, found it
  read as Charlie leaving and the dust arriving, and asked for it smooth
  rather than fancy. It waits for the page because it can only start once
  the page has hydrated — two or three seconds in on a busy machine — so a
  dawn under the beats themselves came up under Charlie anyway. A late field
  starts its dawn late rather than hurrying, and a stall in the page is not
  time it travelled through. Round the
  morning plate it is a different
  formation on purpose — the night's dust let loose in the room: motes
  scattered at random, each wandering on its own unrelated path, catching a
  soft band of daylight from the glass wall. The owner rejected the twisted
  ribbons that stood there first, on 22 October 2026. It is ink, never the
  signal; it stops off screen, in a hidden
  tab and once it has faded on scroll; it clears a space behind the hero's
  type; and without WebGL it is simply absent. The home page's night plate
  still does not move — this is a different page making a different argument.
- **The film's sheet is a spreadsheet**, because that is what the reader
  quotes in: column letters, row numbers, hidden rows where the matrix skips
  lines, a selection with its fill handle that moves to whatever the hour
  changed, and a name box. Where the formula would be, the source bar names the
  document the value came from. Its categories and quantities are the
  request's; its rates are read off the documents on the desk — the price list,
  and the agreed rates in schedule B (clause B.6) for the two lines the matrix
  prices from the agreement — and a held line has none. No grey bars stand in
  for text; at 23:47 the cells are simply empty.
- **The same licence for the signal**: the held state and the figure that breaks
  the floor — on the film's sheet and the handover. The sourced case uses ink.
  `e2e/glass.spec.ts` fails on any other text in it.
- **The motto signs it off**, at the head of the footer: this is the front page,
  and its close is one of the motto's two placements; the other is the success
  state of its form. `e2e/glass.spec.ts` counts it.

### The mark

A **Reuleaux triangle** — the curve of constant width, which rotates inside a
square touching all four sides at every angle. It never loses contact. That is
the company's argument drawn, and it is why this one and not the seven other
candidates in `design/marks/`: the dial is a clock, the helix is bookkeeping,
the attractor is chaos, and the two rose curves are the AI sparkle with extra
steps.

Inline SVG on `currentColor` (`components/mark.tsx`), so it inverts with the
band it lands in and costs no request. It replaced a 224 kB raster that was
illegible below about 32px. Any replacement has to work at 16px, and has to
avoid sparkles, infinity symbols, a literal letter I, and brains.

### The share card

`public/og-image-v<n>.png`, generated by `design/generate-og.mjs` from the
site's own copy, mark, faces and tokens — never drawn by hand. It is the one
surface nobody who works here ever looks at, because it only renders in
somebody else's feed, and a hand-made one drifted a whole positioning behind the
page before anyone noticed.

Two rules go with it:

- **No signal.** A card is not one of the four places in the licence above, and
  ink on paper is also what a reader lands on when they click.
- **A redesign is a rename.** Every platform caches a card against its URL, so
  new bytes at the old path reach nobody. Bump the number in the generator and
  in `lib/seo.ts`, delete the old file, and re-share the link once. `seo.test.ts`
  holds the words to the page's headline; `site.spec.ts` fetches the file and
  checks the PNG's own header against the declared dimensions.

### Illustrative material

The product film follows one example quotation, RFQ 8841, for an example
customer at `customer.example`. Its copy names what it follows in the server's
HTML. On the owner's decision of 22 October 2026 it no longer carries the word
_invented_, a state label or a licence line: the copy describes the product as
it works, in the present tense. It names no real customer, supplier or
commercial outcome.

The sourced case is separate from the quotation. Its response and pricing
figures and its sales-week survey belong to their named, linked publishers;
preserve each figure's scope and denominator. They are not Incillum usage,
customer or performance metrics. Tests keep the values, labels, grouped shares
and citations together.

---

## 5. What may never be claimed

This is a pre-launch site. It has no customers, no Incillum performance
metrics and no launch date, and it must never imply otherwise. Published
third-party research may be used in the sourced case and private brief when
each figure has a linked source, accurate scope and denominator, and is clearly
attributed. It must not read as an Incillum outcome.

**Never write:** customer names or logos · testimonials · Incillum accuracy,
savings or volume figures · "trusted by" · security certifications or compliance claims ·
integration availability · a launch date or quarter · the name of any ERP, CRM
or mail client (the form asks; the page does not claim). Gmail's mark on an
email in a drawing is not its name, and says nothing of integration: see *File
marks* in §4.

Publisher names such as Salesforce may appear only inside a linked source
citation beside the research it published. They are never logos, customer
proof, or claims that Incillum integrates with that publisher's products.

**No certification is named — held or not.** On 22 October 2026 the owner
first asked for the frameworks a buyer looks for to be named on a security
page as not held, then removed the page. So no framework is named anywhere on
the site, not as held, not as planned. One is named only once it is held, and
only with its report: a certification shown before it is held is the one
claim a buyer's procurement team can check in an afternoon. The frameworks are
listed for the owner in `requirements/README.md`. `site.test.ts` and both e2e
suites hold it.

**The site is written in the present tense; what is not built is kept off it.**
The owner decided, on 22 October 2026, that the site describes the product as
it works, because it is being built — no _being built_, _planned_, _in build_
or _not yet_ on any page. What the copy describes and the platform does not do
yet is listed in `requirements/README.md`, with the platform's status beside
each line. Change a claim on the site and change that file in the same
commit; `site.test.ts` checks it lists every outward ability the site names.

**Outbound contact is always behind a person.** This rule used to forbid
describing it at all. The owner decided, on 22 October 2026, that Charlie asks
approved suppliers for a firm price, tells a team's channel what changed, and
calls and books a meeting. So the Charlie page describes those abilities, each
with the approval it waits for, and the front page's answer to "does it
contact our suppliers?" opens _Only with your approval_. Nothing outward may
ever be described as happening without an approval. `site.test.ts` holds it.

**The instrument's mark is a measurement, never a verb.** It says _this is your
hour_. It may never say "working now", carry a counter, or pulse — that would be
a claim made simultaneously to every visitor about work nobody is doing.

**Never write:** _magic_ · _revolutionary_ · _fully autonomous_ · _replaces your
team_ · _one-click automation of everything_ · _AGI_.

Progress is never put on a calendar. A date is a promise made by whoever wrote
it to whoever has to keep it, and it becomes a lie on a fixed schedule.

`e2e/site.spec.ts` enforces the worst of these. The test is a backstop, not the
rule.

### The private brief

`/brief` is a password-protected investor and partner page. It is not linked
from the public site or sitemap and sends `noindex, nofollow`. `BRIEF_PASSWORD`
is server-only; when it is unset or shorter than eight characters, the page is
unavailable. The brief's words live in `server/brief-content.ts`, imported only
after the server verifies the password. The browser receives them only after
unlock, over a private, no-store response, and the session is an HttpOnly,
Secure, SameSite=Lax cookie. Never move the content into a route, client
component, shared site-copy module, or public asset. `e2e/brief.spec.ts` checks
the locked page, wrong password, successful unlock, reload, and metadata.

---

## 6. The promise the form makes

A signup is validated, screened for spam, given a reference and emailed to us
(`server/notify.ts`). **Nothing is sent to the person who joined.**

So the success state may say we have the address and will write once. It may
**not** say "check your inbox" — there is a test for this. Adding a confirmation
to the joiner is a small change; the copy may change on the commit that adds it
and not before.

Two rules that go with it:

- **A failed send never fails the submission.** The visitor did nothing wrong.
  Log the full record at `error` and return success.
- **The secret split is not negotiable.** `src/env.ts` is inlined into the
  browser bundle; `src/server/env.ts` is not. An API key in the first one is
  published, not leaked, and the code looks identical in review.

---

## 7. Fonts — resolve before launch

`src/fonts/` holds another company's licensed web fonts. They are correct for
this design and they are not ours to ship on a commercial domain.

Before incillum.com is public: either license these families, or swap them. Every
reference goes through `--font-display` and `--font-sans` in `styles.css`, so the
swap is the `@font-face` block plus two lines and nothing else in the project
changes.

---

## 8. Definition of done

For changed product behavior, apply the relevant criteria below:

- behaves correctly, with loading, empty, error and success states,
- works with the keyboard, and at 390px, 768px, 1024px and 1440px,
- causes no horizontal overflow — check it at 23:55 and in a long timezone, which
  is how the last two overflow faults on this page were found,
- uses the shared tokens,
- honours reduced motion,
- has tests for anything with a rule in it,
- has no TypeScript, lint or build failure,
- exposes no secret,
- claims nothing from §5.

A prose-only instruction edit needs a focused diff and reference review. Apply UI
state, viewport, motion and form checks when those behaviors change. Preserve the
complete release checks when preparing a release; commit/push follows §10.

---

## 9. Commands

```bash
pnpm dev                 # vite dev on :3200
pnpm typecheck           # tsc --noEmit
pnpm lint                # eslint
pnpm test                # vitest — schema and spam rules
pnpm test:e2e            # playwright, three viewports, against the built app
pnpm build               # production build
pnpm generate-routes     # after adding or renaming a route file
pnpm generate-og         # re-render the share card from content/site.ts
```

Run checks that exercise the affected behavior. UI changes need the relevant viewport
and interaction checks; form or commercial-content changes need their relevant tests.
Run the full required suite for a release or when the impact warrants it. Once checks
pass, repeat them only for new edits, failures or unresolved concerns. Continue fixing
in-scope failures while a safe next step exists; report concrete blockers accurately.

---

## 10. Version control

Follow the user's authorized delivery mode: local edits, draft, commit, PR or push.
Readiness does not require publication for a local edit or read-only review. When
commits are requested, keep each commit cohesive, validate affected behavior and stage
only task-owned paths. Preserve unrelated dirty work. State what remains uncommitted
and do not push unless that delivery is in scope.
