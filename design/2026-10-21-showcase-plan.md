# The home page as a showcase — plan

**Date** 21 October 2026 · **Branch** `feat/home-showcase`, from the newest
`/glass` work (`f9fac69`) plus the TanStack CVE bump · **Scope** the home page
`/`. `/glass` and `/contact` keep working as they are.

---

## The short version

The owner asked for a front page that shows much more of the product — tabs
that explain how it works, real visuals, and a trust section — in the manner of
Harvey and Hebbia. Both sites were studied at 1440px (21 October). The plan
takes their **structure** and keeps Incillum's **honesty**:

1. **One quotation, told in eight acts.** Every act is RFQ 8841, the same
   invented quotation, at a different magnification. Tabs, sources, trust and
   questions are new; the story is not.
2. **The film comes home.** The `/glass` film — the night played in a frame,
   hour by hour, on a spreadsheet — becomes the home page's centrepiece. It is
   the video, and it is honest: every figure is the ledger's, read by code.
3. **How it works, in four tabs.** Read · Hold · Price · Decide — Harvey's
   vertical tab rail, each tab a magnified piece of the same quotation, and
   each ending on *where it stops*. The four boundaries become the tabs.
4. **Trust, built to stay true.** A Hebbia-shaped grid of commitments, each
   carrying its real state — *Decided*, *Built* or *In build*. No certification
   is named, because none is held.
5. **Pictures with a job.** Two photographs of the desk, from above, at night
   and at 08:04, generated from the night plate's own room. The documents in
   the tabs lie on them, and the light turns to morning on the last tab.

---

## 1. What the two references do

| | Harvey (harvey.ai) | Hebbia (hebbia.com) |
| --- | --- | --- |
| First screen | Serif headline left, one line and a black button right; a product screen on a painterly textured panel below | Dark; a prompt typing; "Institutional intelligence" and one button |
| Proof | Logo wall, "3,500+", testimonial carousel, metrics rows | Logo wall, "$26T AUM", testimonial portrait |
| Product | **Vertical tab rail** (Agents, Spaces, Vault…) beside a product panel that changes | **Bento**: Max, collaboration, a data-source marquee, a live Matrix grid |
| Atmosphere | Grain, ink, serif, dark bands | Lamplit offices, a film of the city, a laptop on a dark desk |
| Trust | Certification list with icons | 3×2 grid of chrome icons: ISO 42001, SOC 2, ISO 27001, GDPR, encryption, CCPA |
| Close | One-line CTA band, wide footer | Film, product shot, giant wordmark footer |

**Already ours.** Incillum's type, paper, ink and grain are the same family as
Harvey's, and its night plate is the same lamplit office Hebbia sells with.

## 2. What we cannot borrow, and what stands in its place

AGENTS.md §5 and the brand's `voice.md` forbid anything that asserts what has
not happened. Every proof device on both sites is one of those. Each gets an
honest substitute:

| Their device | Why it is not available | Ours |
| --- | --- | --- |
| Logo wall | No customers | **Six sources** — the documents every quotation is made of, scattered, then gathered onto one sheet |
| Metrics rows ("200,000+") | No usage | **Where this stands** — *Built · In build · Opening*, set as large as their numbers |
| Testimonials | Nobody has used it | **Questions** — the seven a commercial director asks, answered in writing |
| SOC 2 / ISO / GDPR badges | **None is held.** The 11 October trust review records every one as *not verified*, and `e2e/home.spec.ts` fails the page if it names them | **Trust grid** — real commitments with their real state, plus one line: no certification is claimed, and one will be listed here with its report when it is held |
| Product screenshots | Nothing shipped to photograph | **Built documents** — the quotation's own pages in the site's type, labelled invented in their first line |

The badge row the owner pasted is the one thing this plan refuses outright. A
certification shown before it is held is the one lie a buyer's procurement team
can check in an afternoon. The trust section is built so a held certification
can be added in one line, with its report, the day it exists.

## 3. The page, act by act

```text
NIGHT  ┌ 1  Hero ─ the night plate, headline, the form              (exists)
       └ 2  The film ─ 23:47 → 08:04 on one sheet           (from /glass)
PAPER  ┌ 3  Six sources ─ scattered on a desk, then one sheet (from /glass)
       │ 4  How it works ─ four tabs, each ending where it stops     (new)
       │ 5  Where this stands ─ Built · In build · Opening    (content exists)
       │ 6  Trust ─ six commitments, each with its state             (new)
       │ 7  Questions ─ seven, answered in full                       (new)
       └ 8  The morning ─ the 08:04 room, the handover, the ask, the motto
```

The order is the references' order with honest parts: product film (Harvey II),
context (Hebbia's bento), product tabs (Harvey), metrics band, security grid,
then the close. The night still ends at 08:04 and the page still turns to paper
with it. The thread's long prose and the static matrix leave the page: the film
tells the same six hours in a sixth of the words and its sheet *is* the matrix.

**Navigation** becomes real section links — *How it works*, *Trust*,
*Questions*, *Contact* — and the masthead stays with the reader: transparent
over the photograph, a solid night bar once the hero has scrolled away. One
`banner`, one element; nothing is printed twice.

## 4. How it works — the tabs

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ How it works                                                             │
│ From request to decision.                                                │
│ ──────────────────────────────────────────────────────────────────────── │
│ 01 Read          ┃ ┌──────────────── the desk at night, from above ────┐ │
│ ─────────────────┃ │   ┌ Shared mailbox ───── 23:47 ┐                  │ │
│ 02 Hold   ◀──────┃ │   │ RFQ 8841 — framework…      │   ┌ lines ─────┐ │ │
│  What can't be   ┃ │   │ RFQ-8841.pdf  Drawings.zip │   │ 20 read    │ │ │
│  settled is held.┃ │   └────────────────────────────┘   │ 3 flagged  │ │ │
│  One part, three ┃ │                                    └────────────┘ │ │
│  entries…        ┃ └───────────────────────────────────────────────────┘ │
│  Where it stops: ┃                                                       │
│  Ambiguity — …   ┃                                                       │
│ ─────────────────┃                                                       │
│ 03 Price         ┃                                                       │
│ 04 Decide        ┃                                                       │
└──────────────────────────────────────────────────────────────────────────┘
```

| Tab | Title | What the panel shows | Where it stops |
| --- | --- | --- | --- |
| Read | Every line, from what arrived. | The 23:47 mail and its attachments; twenty lines read, three gaps flagged | **Missing evidence** — flagged, never filled in |
| Hold | What can't be settled is held. | The catalogue page, three entries a tolerance apart; lines 04 and 11 *Needs review* | **Ambiguity** — nothing is chosen |
| Price | Costs carried through to margin. | The 03:42 confirmation; line 14's margin falling under the floor; its shortfall | **Commercial policy** — the floor is checked, not argued |
| Decide | A decision, not an investigation. | The three options for line 14 and the quotation's two figures, on the desk at 08:04 | **Approval** — nothing is sent without a person |

- Every figure is read from `evidence`, the ledger or the documents — none is
  typed into the tabs. A test holds it.
- The four boundaries are the four tabs, once each. A test holds that too.
- **Without JavaScript** all four steps are in the HTML, stacked and readable.
  With it they become a real ARIA tablist: arrow keys, Home and End, roving
  focus, `aria-selected`, one `tabpanel` shown.
- The panel changes with a 220ms crossfade; under reduced motion it swaps.

## 5. Trust

Title: *Your figures stay yours.* Six commitments in a hairline grid, each
with a glyph drawn inline, a title, one line and its state:

| Commitment | State | Source of the claim |
| --- | --- | --- |
| Not used for training | Decided | `access.decided`, already on the site's record |
| Nothing sent on your behalf | Decided | The boundary and the evidence copy |
| Approvals reach the right person | Built | `standing`: policies and approval routing are built |
| A record of every decision | Built | `standing`: the audit record is built |
| Every figure keeps its source | In build | The quotation operator is in build |
| Kept to your organisation | In build | Tenant isolation exists in code; hosted proof is pending (trust review §G1) |

Under it, *Before you share a case*: where it is kept and how it is encrypted,
who can see it, how long it is kept and how it is deleted — explained and agreed
first. Then the certification line. States come from a closed set, a certification
can only be listed with a report link, and the banned names stay banned.

## 6. Pictures

Two generated photographs, from the night plate's own room and its brief
(`design/hero-image-brief.md`): the desk **from directly above**, empty, one
pool of lamplight at night; and the same desk at 08:04 in grey daylight with the
lamp still on. No paper in either — the built documents are laid on them, so
nothing on a photograph has to be legible. Encoded AVIF, WebP and JPEG, lazy, and
under 180 kB at the largest size. If neither passes the brief's rejection list,
the panels fall back to the desk tone with its grain, which is already on brand.

No generated video. The film is the moving picture, and it is legible, honest
and 0 kB of media. A launch film can be cut from the same quotation later for
social use.

## 7. Motion on the home page — the budget, rewritten

1. The hero's one entrance (unchanged).
2. The film: once through while on screen, pausable, never looped.
3. The sources gathering: one change of state tied to the scroll.
4. A tab change: one 220ms crossfade, only when the reader asks.
5. One reveal per section.
6. The masthead filling in once the hero has gone — a state change, 300ms.
7. The arrow nudge and the press.

The night plate never moves. No dust, no parallax and no loops on this page;
reduced motion gets the final frame of every one of them.

## 8. Build order — each step tested, then committed

| # | Step | Proof |
| --- | --- | --- |
| 0 | CVE bump, this plan | gates green |
| 1 | Content: tabs, trust, questions, nav — with unit tests for claims, tense, word budgets, reconciliation | `pnpm test` |
| 2 | The film and the sources on the home page; thread and matrix retired; masthead that stays | e2e home + glass |
| 3 | How it works, the tabs | keyboard, no-JS, reduced motion |
| 4 | Where this stands, trust, questions | claims e2e |
| 5 | The morning close and the footer | motto once, last |
| 6 | Photographs, encoded and wired | weight budget |
| 7 | AGENTS.md: the new acts, motion budget and trust rules | review |

Every step runs `pnpm typecheck && pnpm lint && pnpm test && pnpm build`, the
e2e suite at 390 / 768 / 1024 / 1440, and a look at each width.
