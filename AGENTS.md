# AGENTS.md — Incillum pre-launch site

The operating contract for this repository. Read it before changing code.

---

## 1. What this is

The public site at **incillum.com** while there is no product to show yet. One
page, one argument, one conversion: an email address for the waitlist.

It is deliberately **not** a marketing site with the product pages removed. It
has no navigation, no pricing, no demo and no blog, because a pre-launch site
that offers a full product menu is advertising a product it has not shipped.

Incillum is building an AI coworker for **finance operations** — invoice intake,
coding, three-way match, exception handling — that carries the work inside the
systems a finance team already runs, and brings a person in for the decisions
that are theirs.

---

## 2. Repository shape

```text
incillum/
├── src/
│   ├── content/site.ts        every word the site renders
│   ├── components/            one file per section, used once each
│   ├── lib/                   schema, spam heuristic, seo, analytics, cn
│   ├── server/                the one server function, its env, its notifier
│   ├── routes/                __root, index, robots, sitemap
│   ├── fonts/                 self-hosted woff2
│   └── styles.css             tokens, type scale, the two scopes
├── e2e/                       Playwright
└── public/                    favicon, og-image
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

**Two typefaces, no colour.** A text serif at its single weight does every
heading; a grotesk does everything a person reads at length or operates. There
is no third voice, no accent hue, no gradient, and no shadow. Contrast is the
only emphasis available, which is exactly why it works — and why spending it
carelessly is the fastest way to ruin this page.

- Every colour, size, radius and duration is a token in `styles.css`. A literal
  hex in a component is a bug. The one exception is `theme-color` in
  `__root.tsx`, which browsers read before any stylesheet is parsed.
- The dark region is `[data-inverted]`, which re-points the same tokens. It is
  not a second palette, and it is used **once**.
- Radii are 6px on controls and 12px on the one panel. Nothing else is rounded.
- Depth comes from hairlines, never from shadows.
- Motion is restrained and has a job. One page-load entrance on the hero, one
  scroll reveal per section, one live element (the clock), one arrow nudge and
  one button press. That is the whole budget — a page where every card lifts and
  every row slides is a page that is nervous.
- **Everything must honour `prefers-reduced-motion`,** and honouring it means
  rendering the final state, not a faster transition. A reveal that starts at
  `opacity: 0` and depends on a script is worse for that reader than the
  animation they were avoiding.

---

## 5. What may never be claimed

This is a pre-launch site. It has no customers, no metrics and no launch date,
and it must never imply otherwise.

**Never write:** customer names or logos · testimonials · accuracy, savings or
volume figures · "trusted by" · security certifications or compliance claims ·
integration availability · a launch date or quarter.

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

A change is complete only when it:

- behaves correctly, with loading, empty, error and success states,
- works with the keyboard, and at 390px, 768px and 1440px,
- uses the shared tokens,
- honours reduced motion,
- has tests for anything with a rule in it,
- has no TypeScript, lint or build failure,
- exposes no secret,
- claims nothing from §5,
- **is committed and pushed.**

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
```

Run typecheck, lint, test and build for anything you touch — **before**
committing, not after. A commit that has not been run is a guess.

---

## 10. Version control

**Uncommitted work does not exist.** One commit per functional unit; if the
subject line needs an "and", it is probably two commits. Never end a task with a
dirty tree — either commit it or say in your summary what you left and why.
