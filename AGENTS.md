# AGENTS.md — Incillum pre-launch site

The operating contract for this repository. Read it before changing code.

---

## 1. What this is

The public site at **incillum.com** while there is no product to show yet. One
page, one argument, one conversion: an email address for the waitlist.

It is deliberately **not** a marketing site with the product pages removed. It
has no navigation, no pricing, no demo and no blog, because a pre-launch site
that offers a full product menu is advertising a product it has not shipped.

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
│   ├── lib/                   schema, spam heuristic, seo, analytics, cn
│   ├── server/                the one server function, its env, its notifier
│   ├── routes/                __root, index, contact, glass, robots, sitemap
│   ├── fonts/                 self-hosted woff2
│   └── styles.css             tokens, type scale, the two scopes
├── design/                    generators for the mark and the share card
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
3. the held state — in the night thread and on the matrix's held lines,
4. the figure that breaks the commercial floor — in the thread's ledger and
   the matrix's foot.

The matrix uses 3 and 4 because it is the same quotation as the thread at
another magnification, not a new place for the colour.

There is deliberately no red. A held line and a missed floor are the same event
— work that stopped and is waiting for a person — and two colours would say they
are two things. Anything that is not one of the four above uses ink.

### The night

The home page opens in the night and ends at 08:04, back on paper, where a
person picks the work back up. A reader scrolls out of a night.

It used to open on paper and go dark further down. It opens dark now because
the commissioned photograph — an empty office, one lamp, a quotation under it —
is the argument with the words taken away, and below the fold it was doing
none of that work. The photograph is mirrored so the lamp and the quotation sit
on the right and the headline sits over the switched-off monitor; nothing in the
frame is legible, so nothing reads backwards. On a phone it takes the top half of
the screen by itself rather than being scrimmed to nothing behind the words.

The order inside the band is load-bearing: the photograph says where we are,
the matrix says what is waiting in the morning, the thread says how the night
produced it.

- **The matrix** is the product's own object — one request's twenty lines with
  status and evidence — set as a real table on a *lit* panel: `[data-lit]`
  re-points the tokens back to paper inside the band, because the one lit thing
  in the photograph is paper. It is illustrative and says so first, its counts
  are tested against its rows and against the thread's prose, and it carries no
  money of its own: it reads the thread's 06:50 ledger. It is the honest
  substitute for the logo wall and the volume figures enterprise pages lead
  with, which §5 forbids.
- **The desk.** After the band the page returns to the desk tone the contact memo
  is laid on (`--memo-desk`). The two pages share the brand at the same
  coordinates (`components/site-brand.tsx`), the pressed-ink button, and the
  two typefaces; the pressed-ink speckle is for paper only and is dropped in the
  dark, where its holes would read as dust.

- The dark region is `[data-inverted]`, which re-points the same tokens. It is
  not a second palette, and there is **exactly one** on the page — it simply
  contains three sections now rather than one panel. `e2e/home.spec.ts` counts
  it. Nothing inside it knows it is dark: every child is written against
  `text-ink` and `border-line` and would render correctly on paper.
- No hairline at either seam. The colour change is the strongest edge on the
  page already, and a rule drawn on it reads as a mistake.
- The home page draws its own masthead over the photograph; it is not sticky.
- Radii are 6px on controls and 12px on panels. Nothing else is rounded.
- Depth comes from hairlines, never from shadows.
- **Texture:** a fractal-noise tile at ~4% (light) and ~6% (dark), generated by
  the browser's own filter, on the two grounds and the two sunken bands. The
  alpha is baked into the tile rather than applied to a layer over it — the
  obvious `::before` version needs `position: relative` on `body` and silently
  unsticks the masthead.
- Motion is restrained and has a job. One page-load entrance on the hero, one
  scroll reveal per section, one live element (the clock), one arrow nudge and
  one button press. That is the whole budget — a page where every card lifts and
  every row slides is a page that is nervous.
- The night plate does not move, and that is a decision rather than an omission.
  Its subject is a room where nothing is happening; a flickering window or a
  drifting light would turn the one honest image on the site into a screensaver.
- **Everything must honour `prefers-reduced-motion`,** and honouring it means
  rendering the final state, not a faster transition. A reveal that starts at
  `opacity: 0` and depends on a script is worse for that reader than the
  animation they were avoiding.

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

`/glass` is the same night told as a film, for somebody who wants to be shown
rather than read to. Two beats of type over a field of hour rules, a centred
hero with the home page's form, then the quotation played hour by hour in a
frame; after it, six sources gather into one thread, the night's rules are drawn
as a flowchart, and the night is laid out on one scale. It is off the spine:
`noindex`, not in the sitemap, linked from nowhere.

- **One story still.** Every hour, line and figure on it is the thread's or the
  matrix's, read by the components rather than written again; `glass` in
  `content/site.ts` carries no money and no percentage, and a test holds it so.
- **Its own motion budget**, larger than the home page's because a presentation
  tells by moving, and listed in `styles.css` above the block that spends it:
  the opening, the film, the gathering, one reveal per section, the nudge and
  the press. Nothing loops — the film plays once and stops at 08:04 — nothing
  pulses, and reduced motion gets the final frame of all of it.
- **The same licence for the signal**: the held state and the figure that breaks
  the floor. `e2e/glass.spec.ts` fails on any other text in it.
- **No motto.** Its placements are the home page's close and the success state.

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

Two blocks on the page are invented in detail: the night thread and the evidence
document. Both are allowed to exist **only** while their own first lines say so,
at reading size, in the server's HTML — not in small print underneath and not as
a watermark across the figures. `site.test.ts` and `site.spec.ts` both assert it.

The figures in them are exact and they **reconcile across both sections**, to the
cent, because they are one quotation at two magnifications. A commercial reader
will check. Edit one number and `content/site.test.ts` names the others that
have to move with it.

---

## 5. What may never be claimed

This is a pre-launch site. It has no customers, no metrics and no launch date,
and it must never imply otherwise.

**Never write:** customer names or logos · testimonials · accuracy, savings or
volume figures · "trusted by" · security certifications or compliance claims ·
integration availability · a launch date or quarter · the name of any ERP, CRM
or mail client (the form asks; the page does not claim).

**Never claim outbound supplier contact.** Reading a mailbox is a thing software
does. Contacting somebody's suppliers on their behalf is a different promise,
and the moment this page makes it, the first conversation with every design
partner opens with a correction. On this page a supplier answer *arrives* and is
read. It is not requested, chased or negotiated. Both suites test for it.

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
