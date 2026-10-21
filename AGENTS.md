# AGENTS.md — Incillum pre-launch site

The operating contract for this repository. Read it before changing code.

---

## 1. What this is

The public site at **incillum.com** while there is no product to show yet. One
page, one argument, one conversion: an email address for the waitlist.

**The front page is the presentation** (`components/glass-page.tsx`, §4 *The
presentation*): the night told as a film, then the same quotation taken apart
on the desk — six sources, four tabs that end where the work stops, the build's
states, a trust grid, the questions — and the morning. It moved to `/` from
`/glass`, which now redirects there. Its acts on the desk are specified in §4
*The acts on the desk*; the eight-act page they were first built for
has been retired; its component and its styles are gone. Every act is the same
invented quotation, and every proof device the reference pages use (Harvey,
Hebbia) is replaced by an honest one.

It is deliberately **not** a marketing site with the product pages removed. Its
navigation is three menus (`components/masthead-bar.tsx`, the reference pages'
dropdown boxes) over sections of the front page and three more pages: Charlie
(`/charlie`), security (`/security`) and the contact memo. There is no pricing,
no demo and no blog, because a pre-launch site that offers a full product menu
is advertising a product it has not shipped; each page that exists explains one
thing, and says what state that thing is in.

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

**One story, not a catalogue.** Everything the product is being built to do
happens once, to one quotation, between 23:47 and 08:04. A capability list is
what a reader skims; a thread is what a reader follows. The test for anything
added is not "is this true and interesting" — most of what could be added is —
but "does a stranger need this before deciding whether to leave an address".

### The motto

**Stay with the work.** Used exactly **twice** on the whole site: the close, and
the success state after somebody joins. It survives on scarcity — a phrase this
short is a signature the third time it appears and a slogan the fourth. It is
never extended: "AI that stays with your work" is the same idea with the
conviction removed. `content/site.test.ts` and `e2e/site.spec.ts` both count it.

---

## 2. Repository shape

```text
incillum/
├── src/
│   ├── content/site.ts        every word the site renders
│   ├── components/            one file per section, used once each
│   ├── lib/                   schema, spam heuristic, seo, analytics, motion, dust, cn
│   ├── server/                the one server function, its env, its notifier
│   ├── routes/                __root, index, contact, glass, robots, sitemap
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

No component library, no icon package, no animation library, no state manager,
no analytics SDK, no email SDK. Each was considered and each would be a
dependency carried to solve a problem one page does not have — the reveal is
eleven lines of CSS and one IntersectionObserver, the GTM loader is Google's own
nine lines, and the mail is one `fetch`. Adding a dependency requires a reason
written into the file that needs it.

---

## 4. Design rules

**Two typefaces, one colour.** A text serif at its single weight does every
heading; a grotesk does everything a person reads at length or operates. There
is no third voice, no shadow, and one gradient: the scrim over the hero
photograph, which exists to hold the headline at AA and is built from the night
token. Contrast is still most of the emphasis, which is exactly why spending it
carelessly ruins this page.

- Every colour, size, radius and duration is a token in `styles.css`. A literal
  hex in a component is a bug. The one exception is `theme-color` in
  `__root.tsx`, which browsers read before any stylesheet is parsed.

### The signal

There is **one hue**, `--ic-signal`, and it is lamplight rather than a brand
colour: a burnt sienna on paper, opening to amber in the dark scope. Two values
of one light, not one colour at two lightnesses.

It means one thing — *something is still lit* — and it appears in **four**
places, which is the whole licence:

1. the lamp and the lit windows in the night photograph,
2. the reader's own hour on the instrument, where it is on the page,
3. the held state — on the film's sheet, the gathered sheet and the held lines
   in the tabs,
4. the figure that breaks the commercial floor — in the film's ledger, the
   gathered sheet, the handover, and the tabs' line and quotation shortfalls.

Every one of those is the same quotation at another magnification, not a new
place for the colour. `e2e/home.spec.ts` and `e2e/glass.spec.ts` fail on any
text in the signal outside them.

There is deliberately no red. A held line and a missed floor are the same event
— work that stopped and is waiting for a person — and two colours would say they
are two things. Anything that is not one of the four above uses ink.

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
> *The presentation* below.

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
  spreadsheet on a *lit* panel: `[data-lit]` re-points the tokens back to paper
  inside the band, because the one lit thing in the photograph is paper. It
  plays the night from 23:47 to 08:04 once while it is on screen, the reader
  can pause it or pick an hour, and it stops at 08:04 — where the band ends and
  the page turns to paper. It is invented and says so in its first line, its
  rows are the matrix's (`home.matrix`, tested against the thread's prose), and
  it carries no money of its own: it reads the thread's 06:50 ledger. It is the
  honest substitute for the product video and the logo wall enterprise pages
  lead with, which §5 forbids.
- **The desk.** After the band the page returns to the desk tone the contact memo
  is laid on (`--memo-desk`). The two pages share the brand at the same
  coordinates (`components/site-brand.tsx`), the pressed-ink button, and the
  two typefaces; the pressed-ink speckle is for paper only and is dropped in the
  dark, where its holes would read as dust.

- The dark region is `[data-inverted]`, which re-points the same tokens. It is
  not a second palette, and there is **exactly one** on the page — the
  photograph and the film, as one band. `e2e/home.spec.ts` counts
  it. Nothing inside it knows it is dark: every child is written against
  `text-ink` and `border-line` and would render correctly on paper.
- No hairline at either seam. The colour change is the strongest edge on the
  page already, and a rule drawn on it reads as a mistake.
- **The masthead stays with the reader.** The home page draws its own: one
  `banner`, fixed, transparent over the photograph and filled with the night's
  sunken ground once the first screen has gone. It belongs to the night region,
  so it is the same night bar over every section and never changes colour twice
  a visit; it never shrinks and never gains a shadow. Its links are the page's
  own sections and the contact memo, and below a laptop's width only the brand
  and the button remain.
- Radii are 6px on controls and 12px on panels. Nothing else is rounded.
- Depth comes from hairlines, never from shadows.
- **Texture:** a fractal-noise tile at ~4% (light) and ~6% (dark), generated by
  the browser's own filter, on the two grounds and the two sunken bands. The
  alpha is baked into the tile rather than applied to a layer over it — the
  obvious `::before` version needs `position: relative` on `body` and silently
  unsticks the masthead.
- Motion is restrained and has a job. The home page's whole budget, written down
  in `styles.css` above the block that spends it: the hero's one entrance; the
  film, once through while on screen; the sources gathering, one change of state
  tied to the scroll; a tab change, one 220ms crossfade the reader asked for;
  one reveal per section; the masthead filling in, 300ms; the arrow nudge and
  the press. Nothing loops, and there is no dust and no parallax on this page —
  those are /glass's. A page where every card lifts and every row slides is a
  page that is nervous; if something new wants to move, something old stops.
- The night plate does not move, and that is a decision rather than an omission.
  Its subject is a room where nothing is happening; a flickering window or a
  drifting light would turn the one honest image on the site into a screensaver.
- **Everything must honour `prefers-reduced-motion`,** and honouring it means
  rendering the final state, not a faster transition. A reveal that starts at
  `opacity: 0` and depends on a script is worse for that reader than the
  animation they were avoiding.

### The acts on the desk

After the night the page takes the same quotation apart, act by act. Each one
stands where a reference page puts a proof device this site cannot use, and
each says so in its component's header:

| Act | Stands where they put | Component |
| --- | --- | --- |
| Six sources, scattered then gathered | the logo wall | `glass-sources.tsx` |
| How it works — four tabs | the product modules | `how-it-works.tsx` |
| Where this stands — *Built · In build · Opening* | the band of usage figures | `standing.tsx` |
| Data and trust — six commitments | the certification badges | `trust.tsx` |
| Questions, answered in full | the testimonials | `questions.tsx` |
| The morning — the 08:04 room, the handover, the ask, the next steps | the closing band | `glass-page.tsx` |

- **The tabs are the boundaries.** Read · Hold · Price · Decide, one line of the
  quotation each, and each ends on one entry of `boundary` — all four, once
  each. They write no figure: margins, floor, shortfalls and the price at the
  floor are computed from `evidence` or read off the ledger. Without a script
  the four steps are listed in order, each with its heading; with one they are a
  real ARIA tablist (arrows, Home, End, roving focus) whose panels share one
  cell, so a tab change never moves the page under it.
- **The desk photographs** under the tabs are the night plate's own desk from
  directly above, empty, at night and at 08:04 (`design/encode-how.sh`). Nothing
  in them is legible because nothing is on them: the documents laid on them are
  built, in the site's type, from `glass.sources.documents`. The light turns to
  morning on the last tab, and that is the only thing the photographs say.
- **Trust states come from a closed set.** *Decided* only for promises already
  on the record (`access.decided`, the approval boundary); *Built* only for what
  `standing` already says is built; everything else *In build*. What is still
  open about the data is `access.open`, set in the same ink. A certification
  can be listed only with a link to its report — the type will not accept one
  without — and until one is held the section says no certification is
  claimed. No framework is named anywhere on the page; both suites fail if one
  is.
- **Questions are open.** A real `<dl>`, every answer in the HTML, nothing
  behind a click; three answers are read from copy the site has already
  committed to, so they cannot drift.

### Charlie and security

- **`/charlie`** (`components/charlie-page.tsx`, `charlie.tsx`): what Charlie is,
  beside one invented morning set as a team channel — Charlie, an inside sales
  person and a sales director, from the 03:42 supplier answer to the 08:14
  approval — then seven abilities, each with its state, then one invitation.
  The scene's licence is its first line; its figures are tokens the component
  fills from the evidence document and the 06:50 ledger; the two answers on its
  request card are drawn, not buttons. Its first four messages are also an act
  on the front page, after the tabs, with the way to the page.
- **`/security`** (`components/security-page.tsx`): the controls an enterprise
  team expects, each with its state from the trust grid's closed set plus
  *Planned*; the frameworks, each as not held (§5); the front page's own trust
  grid; and one invitation. *Built* is used only for what the build says is
  built or what exists in the platform's code with its tests; nothing that
  needs a hosted environment is called built.
- **Both pages** are laid in `components/page-frame.tsx`: the masthead filled
  from the start in its own `[data-inverted]` scope (the one dark region on the
  page), the desk, and the front page's footer without the motto. Both are in
  the sitemap.

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

The front page (`/`) is the night told as a film, for somebody who wants to be
shown rather than read to. Two beats of type over a field of hour rules, a
centred hero with the form, then the quotation played hour by hour in a frame;
after it, the six documents a quotation is assembled from lie on a desk with the
part itself among them, and gather onto one sheet; then the acts on the desk —
the four tabs, where the build stands, data and trust, the questions — and the
morning, one invitation, and the motto. It carries the front page's head — the
title, description and canonical at `/` — and `/glass`, where it used to live
off the spine, is a permanent redirect to it. `e2e/glass.spec.ts` holds both.

- **The masthead stays with the reader**: fixed, transparent over the night,
  and filled with the night's sunken ground once the first screen has gone. It
  belongs to the night region, so it is the same night bar over every act and
  never changes colour twice a visit. Its links are the page's own sections and
  the contact memo, with the one button, which puts the cursor in the field;
  below a laptop's width only the brand and the button remain.

- **No labels over headings.** No tracked capitals anywhere on it — not over a
  title, not inside a document — and no title in two tones. The first version
  had both and read as assembled. The licence for invented material is a
  sentence at reading size; `e2e/glass.spec.ts` fails on any uppercase text.
- **The documents are built, not pictured** (`components/glass-documents.tsx`):
  real contents from the same quotation, in the site's own type, because a
  generated document's text is nonsense and the reader zooms in. The part on
  the desk is a photograph (`design/encode-glass.sh`), shown with `multiply` —
  so nothing may lie under it, and a test checks that nothing does.
- **It ends in the night plate's own room at 08:04** — the morning plate,
  generated from the night source as its reference, overcast on purpose (a low
  orange sun read as evening and spent a sky's worth of the signal's hue), and
  cleaned of the one mark the generator left on the monitor. Its caption is the
  handover (`components/glass-handover.tsx`): the person and the decision from
  the film's last frame, and the two figures from the 06:50 ledger, built in
  the site's type and writing nothing of its own.
- **One story still.** Every hour, line and figure on it is the thread's or the
  matrix's, read by the components rather than written again; `glass` in
  `content/site.ts` writes none of the quotation's own figures, and the one cost
  that moves, moves by the thread's six per cent and three weeks. Tests hold it.
- **Its own motion budget**, larger than the home page's because a presentation
  tells by moving, and listed in `styles.css` above the block that spends it:
  the opening, the film, the gathering, the dust, the morning's parallax, a tab
  change (one 220ms crossfade the reader asked for), the masthead filling in,
  one reveal per block after the night, the nudge and the press. The film plays once
  and stops at 08:04; nothing pulses; reduced motion gets the final frame of
  all of it.
- **The dust is the one exception to "nothing moves while the reader is
  still"**, and it is the owner's call rather than a lapse
  (`components/glass-field.tsx`, drawn by `lib/dust.ts` in WebGL with no
  library). Under the opening it is a landscape that is not there when the page
  opens: it unrolls out of one thin slit of light on the horizon, far ridge
  first, across the two beats. Round the morning plate it is a different
  formation on purpose — two twisted ribbons framing the room, the night's dust
  put in order. It is ink, never the signal; it stops off screen, in a hidden
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
  the floor — on the film's sheet, the gathered sheet, the handover and the
  tabs. `e2e/glass.spec.ts` fails on any other text in it.
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

Three blocks on the home page are invented in detail: the film, the six
sources and the tabs. Each is allowed to exist **only** while its own first
lines say so, at reading size, in the server's HTML — not in small print
underneath and not as a watermark across the figures. `site.test.ts` and
`home.spec.ts` both assert it.

The figures in them are exact and they **reconcile across every section**, to
the cent, because they are one quotation at several magnifications — the
thread's ledger and the evidence document's line 14, read by the components
rather than written again. A commercial reader will check. Edit one number and
`content/site.test.ts` names the others that have to move with it.

---

## 5. What may never be claimed

This is a pre-launch site. It has no customers, no metrics and no launch date,
and it must never imply otherwise.

**Never write:** customer names or logos · testimonials · accuracy, savings or
volume figures · "trusted by" · security certifications or compliance claims ·
integration availability · a launch date or quarter · the name of any ERP, CRM
or mail client (the form asks; the page does not claim).

**A certification is claimed only once it is held, and only with its report.**
The owner asked, on 22 October 2026, for the frameworks a buyer looks for to be
on the site, because a buyer will look for them. So they are named on
`/security` and nowhere else, each in its own card whose first line is its
status at reading size — *Not held · planned* or *Not yet assessed* — never as a
badge, a seal or an "in progress". The front page names none, and says plainly
that none is claimed. The trust grid takes a held one (`trust.certifications`,
whose type requires a report link) on the day it exists. A certification shown
as held before it is held is the one claim a buyer's procurement team can
check in an afternoon. `site.test.ts` and `e2e/pages.spec.ts` hold all of it.

**Outbound supplier contact is planned, never claimed, and always behind a
person.** This rule used to be absolute. The owner decided, on 22 October 2026,
that Charlie is being built to ask approved suppliers for a firm price, to tell
a team's channel what changed, and to call and book a meeting. So the Charlie
page describes those abilities — as *Planned*, in the future tense, and each
with the approval it waits for — and the front page's answer to "does it
contact our suppliers?" says *not today* and what is planned. What is true
today is still the rule everywhere: a supplier answer *arrives* and is read;
nothing is requested, chased or negotiated yet. Nothing outward may be called
built until it is, and nothing outward may ever be described as happening
without an approval. `site.test.ts` holds both.

**The instrument's mark is a measurement, never a verb.** It says *this is your
hour*. It may never say "working now", carry a counter, or pulse — that would be
a claim made simultaneously to every visitor about work nobody is doing.

**Never write:** *magic* · *revolutionary* · *fully autonomous* · *replaces your
team* · *one-click automation of everything* · *AGI*.

Progress is described in present-tense states — Built, In build, Opening — never
on a calendar. A date is a promise made by whoever wrote it to whoever has to
keep it, and it becomes a lie on a fixed schedule.

`e2e/site.spec.ts` enforces the worst of these. The test is a backstop, not the
rule.

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
