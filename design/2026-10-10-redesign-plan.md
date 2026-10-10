# The night, in motion — redesign plan

**Date** 10 October 2026 · **Branch** `codex/sculptural-lens` at `966425a` ·
**Status** draft — waiting on four decisions (§13) · **Scope** the home page, and
the buttons on `/contact`. Nothing in the site has been changed for this plan.

---

## The short version

1. **Buttons go back to the sans.** Every button today is the heading serif at
   12.5px, in tracked capitals, over a speckled texture — and on a phone the top
   one shrinks to 10.5px. They return to the grotesk: 15px, medium, sentence
   case, solid ink. Same two font files, used the way they were before.
2. **A third of the reading.** The home page asks a visitor to read about 400
   words of sentences (692 words in all). The plan cuts the sentences to about
   140. Every hour of the night gets a time, a title of six words or fewer, and
   one line of fifteen or fewer.
3. **The photograph becomes the stage.** It pins in place and the night plays
   over it: short steps scroll up the left; on the right, the quotation under
   the lamp updates hour by hour — 23:47, 01:18, 03:42 — until a sheet of
   morning paper slides up over the night at 08:04. That is the parallax: the
   words move, the photograph barely does, and the quotation changes in place.
4. **Motion that explains, never decorates.** Native scrolling, CSS
   scroll-driven animation and one IntersectionObserver — no library, no
   scroll-jacking. Nothing loops, nothing moves while the reader is still, and
   reduced motion gets the final frame.
5. **The house rules hold.** Two typefaces, one colour, nothing claimed. The few
   rules that have to change are written out in §10 for your approval.

---

## 1. What you asked for, and where it is answered

| You said | What it means for the page | § |
| --- | --- | --- |
| "The font on the buttons is extremely bad… use the font it used to be" | Every control back in the sans, as before the memo restyle — and as on the site these two faces come from | 3 |
| "Too many text… it shouldn't be just telling everything" | Say what happens, not how it works. Sentences cut by about two-thirds | 4 |
| "That image… I love it. Like the quotation" | Keep the photograph and give it the whole night, not just the first screen | 5 |
| "Parallax… as we go down those get updated… short instructions on one side" | Pinned photograph; short steps on the left; the quotation and the hour update on the right | 5 |
| "More professional, more usable" | Plain navigation, buttons readable on a phone, a scroll cue, an action at the end of the night | 7 |
| "Better motion graphics… best skills" | A motion spec where every movement has a job, and a skill assigned to each phase | 6, 9 |
| "Like Apple… how VC companies do it" | Seven reference sites and the patterns worth taking | 2 |
| "Don't use your own font" | No new typeface. The two existing files, used better | 3 |

I have read *"those get updated"* as **the quotation and the hour on the
photograph**. If you meant a different photograph for each step, that is
decision 6 in §13.

---

## 2. How the best-funded sites do it

Reviewed 10 October 2026 — first screens and page copy. Patterns, not templates;
nothing is copied.

| Site | Worth taking | Not available to us (AGENTS.md §5) |
| --- | --- | --- |
| **Apple** — MacBook Pro | A four-word headline ("Fast runs in the family.") over one line of support. One button, "Buy", in the sans, sentence case. Sections open with a noun and a full stop, then one sentence: "Display. The brilliant…". A highlights gallery where the picture changes and each caption is one short line. | Superlatives — "stunning", "magic" |
| **Linear** | Headline plus one sentence. Every section is a two-line title, one sentence and "Learn more →". The product's own object is the visual. | Logo wall ("Powering the companies…") |
| **Harvey** — the source of our two faces | Serif headline, one supporting sentence, a solid black "Request a Demo" button **in the sans**. This is the button we are going back to. | Customer counts, quotations, SOC 2 and ISO badges |
| **Sequoia** | One sentence in a serif, centred, in a great deal of space; a hand-drawn underline marks two words. Confidence comes from the space. | — |
| **a16z** | Full-bleed cinematic image, four words ("It's time to build"), one quiet link. The image does the talking. | — |
| **Stripe** | Bold noun phrase, full stop, one plain sentence: "Professional services. Get tailored guidance…". | Payment volume and uptime figures |
| **Mercury** | "Radically different banking", one line, an email field and a button — the same conversion shape as our hero. Benefits phrased as outcomes: "Watch bills pay themselves". | "Loved by 300K+" |

**The shape they share**

1. A headline of three to six words.
2. Support of 25 words or fewer.
3. One primary action, in the sans, in sentence case.
4. One hero visual: the product's own object, or one cinematic image.
5. One idea per section, one sentence per idea.
6. Motion that explains — media that holds still while its state changes.
7. Proof. We cannot use any, so ours is the thing they don't show: a worked
   example a commercial reader can check to the cent. The night carries it.

---

## 3. Typography — the same two faces, used properly

### 3.1 What is wrong

Measured on `localhost` at 1440 × 900 and 390 × 844.

- **Buttons.** The block headed `Buttons: pressed ink` in `src/styles.css`
  (around lines 2225–2316) sets `font-family: var(--font-display)`,
  `text-transform: uppercase` and `letter-spacing: 0.12em` at `--memo-label`
  (**12.5px**), over a speckled ink mask. On a phone the masthead button drops to
  **11px** below 440px and **10.5px** below 380px. A text serif in tracked
  capitals at that size loses its hairlines and reads as costume.
- **It breaks two written rules.** AGENTS.md §4: *"a grotesk does everything a
  person reads at length or operates."* The brand typography reference:
  *"uppercase anywhere else — a button, a nav item — is off-brand."*
- **Capitals everywhere.** 18 separate uppercase text elements on the home page,
  the H1 among them.
- **Navigation** is set in the serif.

### 3.2 The fix

| Role | Face | Size | Weight | Case | Tracking |
| --- | --- | --- | --- | --- | --- |
| **Buttons** — masthead, hero, night, closing, `/contact` submit and actions | Sans, `--font-sans` | `--text-ui` 15px · 16px at `lg` | 500 | Sentence | −0.006em |
| Navigation links | Sans | 15px | 500 | Sentence | 0 |
| H1 | Serif | re-derived, §3.3 | 400 | **Sentence** — same words | −0.021em |
| Section and step titles | Serif | `--text-title` · `--text-heading` | 400 | Sentence | per token |
| The story's hour on the stage | Serif numerals | `clamp(3rem, 6vw, 5.5rem)` | 400 | — | −0.02em |
| Lede and step lines | Sans | 17–18px, 1.6 leading | 400 | Sentence | 0 |
| Labels — **the only capitals left** | Sans | `--text-label` 12px | 500 | Upper | +0.1em |
| Figures — table, ledger, rail | Sans, `tabular-nums` and `'tnum'` | 14–15px | 400–500 | — | 0 |

**The button:** 44px tall (`md`) or 48px (`lg`), solid ink, 6px radius, no
texture. On the dark band the fill is paper and the text is ink. The arrow moves
2px on hover; the button presses 1px down. This is what `buttonClasses()` in
`src/components/primitives.tsx` already describes — the CSS block above
overrides it.

### 3.3 In code

- Remove the overriding properties from the `pressed ink` block, so
  `.desk-cta`, `.waitlist-inline-submit`, `.memo-submit` and `.memo-action`
  inherit from `buttonClasses()`. Take `--memo-ink-mask` off every button.
  Delete the font-shrinking rules at 440px and 380px.
- The masthead button reads **"Early access"**, which fits beside the wordmark
  at 390px without shrinking.
- `.home-title`: drop `text-transform: uppercase`, and re-derive
  `--home-display` with the arithmetic in the brand typography reference §5 so
  *"Intelligence for / commercial work."* still breaks after "for" from 1024px
  to 1440px.
- `.desk-nav`: `font-family: var(--font-sans)`.
- `/contact`: "IN PROGRESS. CAREFULLY BUILT." (serif capitals, 0.3em tracking)
  becomes a small sans line.
- **A guard test.** A new end-to-end check reads the computed style of every
  `button` and every call-to-action link at 390px and 1440px, and fails on a
  serif family, on `uppercase`, or on anything under 15px. This is the
  regression that just happened; it should not be able to happen silently again.

### 3.4 Kept as it is

- **The two font files.** No new typeface, as you asked. The licensing note in
  AGENTS.md §7 still stands — they are Harvey's licensed files and need a
  licence before public launch.
- **The memo's printed field labels** on `/contact` — WORK EMAIL, COMPANY and
  the rest — are serif capitals on purpose: the printed-form idea. Decide once
  you have seen the new buttons beside them (§13, decision 5).

---

## 4. Words — a third of the reading, every line working

### 4.1 What is wrong

- **692 words on the home page**, about 400 of them in sentences. The night
  thread alone is 354, in beats of 45–60 words; the matrix block is 193.
- **The same story is told twice, back to back.** "What is waiting at 08:04."
  then "What changed by morning." — under the same label, *"Illustrative · one
  request, one night"*, printed twice.
- **The copy explains the mechanism.** *"It is filed against the line it belongs
  to and the quotation is recalculated on the spot — so the change is a number
  by morning rather than a discovery on Thursday."* Good writing in the wrong
  place: a first-time reader needs the event, not the method.
- **"One night"** is an unclear navigation label, and reads oddly out of context.

### 4.2 Rules for every line

The house voice (brand `voice.md`) plus the copywriting skill. Where they
disagree the house voice wins — no rhetorical questions, no social proof.

- Titles of **six words or fewer**. Lines of **fifteen or fewer**. One idea per
  hour.
- Lead with the event or the person, never with the software.
- Keep the honest hedges — *is being built*, *should*.
- Sentence case everywhere. British spelling. No exclamation marks, none of the
  banned words.
- A noun and a full stop where it helps: *"Two lines are held."*
- The motto keeps its two placements.
- **The budgets become a unit test** (§8, P2), so the page cannot drift back.

### 4.3 Copy deck

**Masthead**

| | Now | Proposed |
| --- | --- | --- |
| Link | One night | How it works |
| Link | Contact | Contact |
| Button | REQUEST EARLY ACCESS | Early access |

**Hero**

| | Now | Proposed | Words |
| --- | --- | --- | --- |
| Eyebrow | FOR THE UNATTENDED HOURS | IN BUILD · FOR THE UNATTENDED HOURS | 6 |
| H1 | INTELLIGENCE FOR COMMERCIAL WORK. | Intelligence for commercial work. | 4 |
| Lede | From the first request to the decisions, follow-ups, documents and financial consequences that follow. Incillum is being built to carry the work forward — and bring you back where judgement matters. *(33)* | **A — recommended.** Commercial work keeps moving after you leave. Incillum is being built to carry it through the night, and bring the judgement calls back to you. | 25 |
| | | **B — keeps every noun AGENTS.md §1 asks the hero to name, at today's length.** Requests, decisions, follow-ups, documents and the money that moves with them — commercial work keeps going after you leave. Incillum is being built to carry it, and bring the judgement calls back to you. | 33 |
| Field | Your work email | Work email | 2 |
| Button | REQUEST EARLY ACCESS | Request early access | 3 |
| Under the button | A conversation, then one real case alongside your team. No payment. No newsletter. | One conversation, then one real case beside your team. No payment, no newsletter. | 13 |
| Caption | The office is empty. The quotation is not finished. | *Unchanged — and now shown on phones too.* | 9 |
| Scroll cue | — | Follow one night ↓ | 3 |

The H1 keeps its words. You chose it on 5 September, and it is also the page
title and the share card, so neither has to be regenerated. If you want to see
alternatives in the same register: *"Commercial work, carried through the
night."* or *"For the hours nobody is at the desk."*

**The night** — one licence line, first, at reading size, in the server's HTML

| | Proposed | Words |
| --- | --- | --- |
| Label | ILLUSTRATIVE · ONE NIGHT | 3 |
| Title | Between 23:47 and 08:04. | 4 |
| Licence line | One invented quotation, followed from arrival to decision. | 8 |

| Hour | Now | Title | Line |
| --- | --- | --- | --- |
| 23:47 | A customer request arrives. *+ 40 words* | A request arrives. | Twenty line items and a drawing pack, due Thursday. The office is empty. |
| 00:06 | The request has structure. *+ 43 words* | The request has structure. | Parts, quantities, dates and terms. What it doesn't say is flagged, not filled in. |
| 01:18 | Two lines cannot be resolved safely. *+ 51 words* | Two lines are held. · *Needs review* | One part matches three catalogue entries. One drawing has no revision. Neither is guessed. |
| 03:42 | A supplier answer changes the economics. *+ 51 words* | A supplier answer arrives. | Unit cost up six per cent, lead time out three weeks. The quote is recalculated. |
| 06:50 | The commercial decision is ready for a person. *+ 31 words and the ledger* | The margin falls below the floor. | *The ledger, unchanged:* Quote value EUR 236,400.00 · Expected margin 16.4% · Commercial floor 20.0% · **Short of the floor EUR 10,638.00** |
| 08:04 | A person returns to a decision, not an investigation. *+ 40 words* | A decision, not an investigation. | Eighteen lines priced, two lines held, and one call that's yours to make. |
| *after 08:04* | — | **Request early access** | *Optional, above the button:* Be the person it comes back to. |

Phrases the tests hold, kept word for word: *twenty line items*, *eighteen lines
priced*, *two lines held*, the 03:42 answer *arrives*, *six per cent*, *three
weeks*, and *Illustrative* / *invented* in the label and the licence line.

**08:04 — the quotation as a person finds it** (the matrix, now the payoff)

| | Now | Proposed |
| --- | --- | --- |
| Title | What is waiting at 08:04. | What's waiting at 08:04. |
| Lede | One request, carried through the night… *(30)* | *Cut — the night has said it.* |
| Bar | Request for quotation · framework agreement / Response expected Thursday | RFQ 8841 · framework agreement / Due Thursday |
| Evidence | up to 14 words a row | eight or fewer: *Matches three catalogue entries* · *Drawing has no revision* · *Supplier answer at 03:42: six per cent, three weeks* |
| Foot | Short of the floor EUR 10,638.00 · A person returns to a decision, not an investigation. | Short of the floor EUR 10,638.00 · Quote under the floor, or go back on the lead time. |

> **A fix while we are there.** The table moves the cost on **line 03**
> ("Stepped shaft"). The evidence document in `site.ts` says the cost moved on
> **line 14** ("Flanged housing, machined", RFQ 8841), and its arithmetic is what
> produces the 16.4%. Move the cost to line 14 in the table so the two agree —
> rows 01, 02, 04, 05, 06, 11 and 14, totals unchanged at 18 priced, 2 held, 20
> lines. A commercial reader comparing them will notice.

**Closing**

| | Now | Proposed | Words |
| --- | --- | --- | --- |
| Label | BRING YOUR HARDEST QUOTATION. | *Cut — the title carries it.* | — |
| Title | Tell us the request that always arrives late. | **A** — Bring us the quotation that keeps you late. · **B** — keep today's line | 8 |
| Body | If there is an RFQ that lands on a Friday evening, or a quotation that is always waiting on one number from one supplier, that is the conversation we want to have. *(32)* | The Friday-evening RFQ. The quote waiting on one supplier's number. That's where we'd like to start. | 16 |
| Button | TELL US ABOUT THE WORK | Tell us about the work | 5 |
| Email | OR WRITE TO US · hello@incillum.com | Or write to hello@incillum.com | 4 |

**Footer** — unchanged. The motto stays last; the status line stays *"In
progress. Carefully built."*

**`/contact`** — the words stay. "SEND TO INCILLUM" becomes **Send to
Incillum** in the sans, and the status line is restyled (§3.3).

### 4.4 Word budget

| | Now | Target |
| --- | --- | --- |
| Sentences a reader has to read | ≈ 400 | **≈ 140** |
| All words, including labels and table cells | 692 | ≈ 430 |
| Longest paragraph | 51 words (01:18) | 15 |

---

## 5. The night, in motion

### 5.1 The idea

The photograph you like stays on screen for the whole night. The reader scrolls;
the words move; the photograph holds, drifting a few per cent towards the lamp.
Down the left, one hour at a time: 23:47, 00:06, 01:18, 03:42, 06:50. On the
right, the quotation under the lamp — shown magnified, as if the sheet had been
lifted off the desk towards the reader — updates as the hours pass. Its lines
are read. Two are held, in lamplight. A cost moves. The margin slides under the
floor. A hairline along the foot of the frame fills from 23:47 towards 08:04.

Then morning arrives as a sheet of paper that slides up over the night,
carrying the hour 08:04, one line, and the quotation as a person finds it. The
page has always argued that a reader scrolls out of a night. Now they do.

### 5.2 Page order

| Now | Proposed |
| --- | --- |
| 1. Hero — photograph, H1, form | 1. **Hero** — the same photograph, now pinned. H1, form, caption, *Follow one night ↓* |
| 2. Matrix — the result, first | 2. **The night** — five hours scroll over the pinned photograph; the quotation updates beside them |
| 3. Thread — how the night produced it | 3. **08:04** — the morning sheet covers the night: the hour, one line, the full table, a button |
| 4. Closing | 4. **Closing** — one title, one line, a button, the address |
| 5. Footer and motto | 5. **Footer and motto** — unchanged |

The story now runs forwards. The old order led with the result because the
thread had no picture; now the night has one, the table can be the payoff.

### 5.3 Desktop, 1440 × 900, at 03:42

```text
┌────────────────────────────────────────────────────────────────────────────────────┐
│ PINNED PHOTOGRAPH · scrim on the left · lamp and paper on the right                │
│                                                                                    │
│  ILLUSTRATIVE · ONE NIGHT                                            03:42         │
│                                                                      ─────         │
│  01:18  Two lines are held.          dimmed                                        │
│                                               ┌─ ILLUSTRATIVE · RFQ 8841 ──────┐   │
│  03:42  A supplier answer arrives.   active   │ 14 Flanged housing  Cost moved │   │
│         Unit cost up six per cent,            │ 04 Bearing seat   Needs review │   │
│         lead time out three weeks.            │ 11 Sensor mount   Needs review │   │
│         The quote is recalculated.            │ 18 / 20 priced                 │   │
│                                               │ ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▏      ┆         │   │
│  06:50  The margin falls below…      dimmed   │ 16.4%                ┆ 20.0%   │   │
│                                               └────────────────────────────────┘   │
│                                                            (lamp)        (desk)    │
│  23:47 ───● 00:06 ───● 01:18 ───● 03:42 ━━━● 06:50 ───○ 08:04 ───○                 │
└────────────────────────────────────────────────────────────────────────────────────┘
```

The left column scrolls at full speed; the right side stands still and changes
state. The card never covers the lamp — it sits over the desk, the sheet lifted
towards the reader.

### 5.4 Storyboard

| Hour | Left column — scrolls | The card — updates in place | The stage |
| --- | --- | --- | --- |
| Hero | H1, lede, form | hidden | Caption: *The office is empty. The quotation is not finished.* |
| 23:47 | A request arrives. | Header *RFQ 8841 · 20 lines · Due Thursday*; rows listed, status blank | The caption hands over to the hour **23:47** |
| 00:06 | The request has structure. | Rows gain item, quantity and date | **00:06** |
| 01:18 | Two lines are held. *Needs review* | Lines 04 and 11 turn **Needs review** in the signal (licence 3); the rest **Priced**; **18 / 20**; the margin bar sits at **20.3%**, just above the floor | **01:18** |
| 03:42 | A supplier answer arrives. | Line 14 turns **Cost moved**, ink outline; the bar slides **20.3% → 16.4%** across the floor, and the figure takes the signal (licence 4) | **03:42** · rail past halfway |
| 06:50 | The margin falls below the floor. *+ ledger* | Foot: **Short of the floor EUR 10,638.00**, in the signal | **06:50** |
| 08:04 | *On the morning sheet:* A decision, not an investigation. | *The full table, on the sheet* | The sheet slides over the pinned photograph |

The hour and the rail are ink, never the signal.

> **The 20.3% is new, and it reconciles.** Before the supplier answer, line 14
> costs 1,200 × EUR 128.00 = 153,600.00 against 192,000.00 quoted, a margin of
> 38,400.00. The other seventeen priced lines carry 9,585.60. Together:
> 47,985.60 on 236,400.00 = **20.3%** — just clear of the floor. After the
> answer, line 14 carries 29,184.00, the total is 38,769.60, and that is the
> 16.4% the ledger already prints. It goes into `site.test.ts` as a derived
> figure, not a typed one (§8, P2).

### 5.5 Phone, 390 × 844

```text
┌──────────────────────────────┐
│ PINNED PHOTOGRAPH  · 46svh   │
│ lamp and paper in view       │
│                       03:42  │
│ 18/20 · 2 held · 16.4% < 20% │
│──────────────────────────────│
│ 03:42                        │
│ A supplier answer arrives.   │
│ Unit cost up six per cent,   │
│ lead time out three weeks.   │
│ The quote is recalculated.   │
│                              │
│ ↑ the hours scroll up here,  │
│   about 65svh apart          │
└──────────────────────────────┘
```

The card shrinks to one strip. The caption shows under the photograph — today
it is hidden below 1024px. With the hours about 65svh apart, the night is
roughly four screens.

### 5.6 The photograph — what moves, and what never does

- **Never on its own.** No flicker, no drifting light, no loop. AGENTS.md is
  right that any of those would turn the one honest image on the site into a
  screensaver.
- **Only with the reader's scroll**, as a camera would, and by no more than
  **4%** — `scale(1 → 1.04)`, centred on the lamp. Stop scrolling and it stops.
- **Under reduced motion it holds completely still.** It stays pinned; pinning
  is layout, not motion.
- **Resolution.** The master is **1672 × 941** (`design/night-source.png`) and
  already soft on a 2× screen. Keep the push at 4% or less until there is a
  master of at least 3344px — upscaled, or regenerated from
  `design/hero-image-brief.md` — then add a 2400w encode.
- **Stretch: a *first light* plate.** The same camera and room at 08:04: grey-gold
  window, lamp still on. It would sit under the morning sheet as it arrives.
  Only if it can be matched to the first frame pixel for pixel.

### 5.7 Fallbacks and accessibility

| | Default | Reduced motion | No JavaScript |
| --- | --- | --- | --- |
| Photograph | Pinned, 4% push with scroll | Pinned, still | Pinned, still |
| Hours | Active hour full, the others at 32% | All at 100% | All at 100% |
| Stage hour and card | Follow the active hour | Swap instantly | Fixed at 06:50 |
| Margin bar | Slides at 03:42 | Final position | Final position |
| Rail | Fills with the scroll | Active tick only | Ticks, no fill |
| Morning sheet | Slides over — it is only scrolling | Same | Same |

- The hours are a real `<ol>`; the active one carries `aria-current="step"`. The
  06:50 ledger stays a `<dl>`.
- The stage — photograph, hour, card, rail — restates what the text already
  says, so it is `aria-hidden`. Every fact in it is also in the hours or in the
  08:04 table.
- The licence line is the section's first line, at reading size, in the
  server's HTML.
- No focus traps; the only thing to tab to in the night is the button at 08:04.

---

## 6. Motion

### 6.1 Budget, second edition (replaces the list in AGENTS.md §4)

1. **One page-load entrance**, on the hero, settled within 1.1s — today it
   takes about 1.8s.
2. **One scroll-linked sequence: the night.** Several layers move, but as one
   movement — the night passing. Nothing in it runs on a timer.
3. **One reveal per section** after the night.
4. **One hover** — the arrow nudge. **One press** — 1px.

If something new wants to move, something old stops. Nothing loops; the
end-to-end check for infinite animations stays.

### 6.2 Values

| Element | Trigger | What changes | Duration or range | Easing |
| --- | --- | --- | --- | --- |
| H1 lines | Load | `translateY(108% → 0)` inside the line box | 700ms; second line +60ms | `--ic-ease` |
| Hero copy | Load | opacity and 12px | 520ms; 60ms apart; last one starts by 400ms | `--ic-ease` |
| Photograph push | Scroll, CSS view timeline | `scale(1 → 1.04)` | Hero top → 06:50 | linear, mapped to scroll |
| Hour focus | IntersectionObserver, centre band | opacity 0.32 ↔ 1 | 320ms | `--ic-ease` |
| Stage hour | Active hour changes | Old hour up and out, new hour up and in — 30%, with opacity | 280ms | `--ic-ease` |
| Card rows | Active hour changes | Status crossfades; the changed row gains a 1px ink rule | 200ms; 40ms apart; three rows at most | `--ic-ease` |
| Margin bar | 03:42 arrives | `scaleX`, 20.3 → 16.4 on a 0–25 scale | 600ms — it is explaining | `--ic-ease` |
| Rail | Scroll | Fill `scaleX(0 → 1)` | 23:47 → 06:50 | linear |
| Reveal | IntersectionObserver, once | opacity and 10px | 520ms | `--ic-ease` |
| Button hover | `(hover: hover)` only | Arrow +2px, fill to ink-800 | 160ms | `--ic-ease` |
| Button press | `:active` | `translateY(1px)` | 100ms | — |

Only `transform` and `opacity` are ever animated. `will-change` sits on the
photograph and the rail, and only while the night is on screen.

### 6.3 How it is built — no library (AGENTS.md §3)

- **Pinning:** `position: sticky` on the stage; the flow after it pulls up by
  `-100svh` and runs over it.
- **Continuous effects** — the push, the rail — are CSS scroll-driven
  animations inside `@supports (animation-timeline: view())`. Chrome and Edge
  run them; Safari added them in version 26 — confirm Safari and Firefox
  support while building. Where they are missing, the photograph simply holds
  still and the rail shows its ticks. Nothing breaks.
- **The active hour:** one `IntersectionObserver` with a centre band
  (`rootMargin: '-45% 0px -45% 0px'`) writes `data-hour` on the night's root.
  Every stage state — each hour, each card state — is rendered once, and CSS
  shows the one that matches. No React render on scroll.
- **Client detection** reuses the `useSyncExternalStore` pattern in
  `reveal.tsx`: the server's HTML is complete, and nothing hides until it is
  safe to bring it back.
- **The morning sheet** is not an animation. The desk section sits inside the
  same sticky container with a higher `z-index`, so ordinary scrolling slides it
  over the pinned stage.
- **Two traps:** the stage cannot live inside `.hero`, whose
  `overflow: hidden` breaks `sticky`; `.home`'s `overflow: clip` is fine.

### 6.4 Never

Scroll-jacking or smooth-scroll libraries. Animation libraries. Cursor-following
effects. Video. Text that moves at a different speed from the scroll. A clock
that ticks. Anything that moves while the reader is still.

The stage hour is the story's page number — set by the scroll, labelled
illustrative. It is never a counter and never says "working now" (AGENTS.md §5).

---

## 7. Usability and polish

- **Navigation:** *How it works*, *Contact*, and an **Early access** button.
  Every control at least 44px tall on a phone.
- **An action at the end of the night.** The masthead stays non-sticky, as the
  contract says, so nobody should have to scroll back up to act.
- **The hero says the page continues:** *Follow one night ↓*. The arrow is drawn
  inline, like the button arrow — no icon package.
- **The hero settles in 1.1s or less**, down from about 1.8s. The caption's
  900ms delay goes.
- **Form states stay exactly as they are, and tested:** sending, *"That did not
  send…"*, and the success state with its reference and the motto.
- **No horizontal overflow** at 390, 768, 1024 and 1440 — including at 23:55 in
  a long timezone (AGENTS.md §8).
- **AA contrast** for every line over the photograph. The scrim stays the one
  gradient on the site.

---

## 8. Build plan — every phase tested, then committed

Each phase ends with:

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

```bash
SUPABASE_URL= SUPABASE_SERVICE_ROLE_KEY= VITE_POSTHOG_KEY= VITE_POSTHOG_HOST= BREVO_API_KEY= pnpm test:e2e
```

The keys are blanked because the local `.env` holds live Supabase and PostHog
keys, and one end-to-end test performs a real signup.

| Phase | What | Main files | Tests added or changed | Commit |
| --- | --- | --- | --- | --- |
| **P0** | Your decisions (§13) | this file | — | — |
| **P1** | Buttons and type (§3) | `styles.css`; masthead label in `content/site.ts` | **New:** the control-typography guard. **Changed:** button and link names in `home.spec.ts` and `contact.spec.ts` | Set every control in the sans, in sentence case |
| **P2** | Copy deck (§4) | `content/site.ts` — a `night` object, the shorter table, line 14 | **Changed:** prose expectations, the `#night` link count. **New:** the word budgets as a test; the 20.3% reconciliation | Cut the home page to a third of the reading |
| **P3** | The night, structure only — pin, hours, card states, active hour; no motion yet | **new** `night-sequence.tsx` and `quote-card.tsx`; `home-page.tsx`; `styles.css` | **New:** hours in order, licence first, `aria-current` follows the scroll, every hour present without JavaScript. **Changed:** the dark-region and lit-panel counts | Pin the photograph and run the night over it |
| **P4** | Motion (§6) | `styles.css`, `night-sequence.tsx` | **New:** the photograph has no motion of its own (still after two idle seconds); under reduced motion it holds still while scrolling. Replaces *the photograph never moves* | Give the night its motion, and none under reduced motion |
| **P5** | The 08:04 sheet, closing, footer | `home-page.tsx`, `styles.css` | **New:** at the morning section, the middle of the screen belongs to the sheet | Let the morning cover the night |
| **P6** | Verify and record | `AGENTS.md`, this file | Full suite at four widths, keyboard, reduced motion, no JavaScript, Lighthouse | Write the night into the contract |

P6 also retires the editorial components nothing imports any more — `access`,
`boundary`, `early-access`, `evidence`, `first-build`, `hero` and `night`, which
takes `instrument` and `nightfall` with it. Their content objects stay in
`site.ts` for as long as the tests reconcile against them.

---

## 9. Skills, phase by phase

| Phase | Skill | What it is for here |
| --- | --- | --- |
| All | **incillum-brand** | Tokens, voice, the claims ban, the motion budget. It wins every disagreement. |
| P1 | **redesign-existing-projects** | Typography audit — capitals, control sizes, states |
| P2 | **copywriting**, then **content-humanizer** | Clarity and specificity, then a pass for anything that reads as generated. The house voice overrides rhetorical questions and social proof. |
| P3 | **design-taste-frontend**, **frontend-design** | The stage layout, the card's hierarchy, the phone composition |
| P4 | **emil-design-eng** | Easing, durations, press feedback, interruptible transitions, reduced motion |
| P4 | **12-principles-of-animation** | An audit of the finished night, with file and line findings, before it is committed |
| P6 | **code-review**, and the browser preview | Bugs before merge; screenshots at four widths |

---

## 10. Contract changes for your approval — AGENTS.md

1. **§4, "The night plate does not move."** Becomes: *"The plate has no motion
   of its own — no flicker, no drifting light, no loop. It may move only with
   the reader's scroll, as a camera would, by no more than 4%, and it holds
   completely still under reduced motion."*
2. **§4, the motion budget.** Replaced by the second edition in §6.1.
3. **§4, a new line on controls.** *"Every control is the grotesk at
   `--text-ui`, in sentence case. No serif, no capitals, no texture on a
   button."*
4. **§4, the order inside the band.** Becomes: photograph → the night → 08:04.
   The table is the morning's payoff, no longer the band's opening.
5. **§1, "the hero names the whole arc"** — only if you choose lede A: *"The hero
   names the scope — commercial work — and the night shows the arc on one
   quotation."*
6. **Housekeeping.** §4 "The mark" still describes the Reuleaux triangle; the
   site ships the orbit mark drawn from your supplied logo. Align the text.

---

## 11. Risks

| Risk | What we do about it |
| --- | --- |
| Scroll-driven CSS is missing in some browsers | It is enhancement only: the photograph holds still, the rail shows ticks, the hours still change |
| `sticky` silently fails under an `overflow` ancestor | The stage stays out of `.hero`; a P3 test checks the stage is still pinned halfway through the night |
| The photograph softens when pushed | 4% at most until a ≥ 3344px master exists |
| The night feels long on a phone | Hours about 65svh apart — roughly four screens |
| The card covers the lamp on unusual screen shapes | Anchored to the desk; below 1024px it is a single strip |
| Tests written for the old structure | Changed in the same commit as the behaviour, never deleted — every rule they hold survives |
| The fonts are not ours | Unchanged by this plan; licence before launch (AGENTS.md §7) |

---

## 12. Done means

- Every control's computed font is `Incillum Sans`, `text-transform: none`, at
  least 15px, at every width.
- About 140 words of sentences on the home page and no more than 450 words in
  all. No hour title over six words; no line over fifteen. One *Illustrative*
  licence, first, in the server's HTML.
- No more than 8 uppercase text elements, down from 18.
- Only `transform` and `opacity` animate. Nothing moves while the reader is
  still. No infinite animations. Reduced motion renders the final frame. Without
  JavaScript every hour is there.
- LCP 2.5s or less on Lighthouse mobile. CLS 0.02 or less. No task over 50ms
  while scrolling the night on a mid-range laptop.
- The figures reconcile to the cent — 236,400.00 · 16.4% · 20.0% · 10,638.00 —
  and so does the new 20.3%.
- Everything already tested stays green: the claims ban, the motto exactly
  twice, the supplier answer *arrives*, no named systems, no *check your inbox*.

---

## 13. Decisions I need from you

| # | Decision | Recommendation |
| --- | --- | --- |
| 1 | Let the photograph move with the scroll — at most 4%, never on its own (§10.1) | **Yes.** It is the parallax you asked for, and it keeps the reason the old rule existed. |
| 2 | Headline in sentence case, same words | **Yes.** Calmer, and closer to Apple and Harvey. |
| 3 | The night replaces the thread and the matrix; the table becomes the 08:04 payoff | **Yes.** One story, told once, forwards. |
| 4 | Hero lede A (25 words, small §1 change) or B (33 words, rule untouched) | **A** |
| 5 | *Optional:* the serif-capital field labels on `/contact` | Decide after P1 |
| 6 | *Optional:* commission a *first light* plate for 08:04 | Only if it matches the first frame exactly |

---

## Appendix — measurements

Taken on `localhost:3201`, with the analytics and database keys blanked;
screenshots by Playwright at 1440 × 900 and 390 × 844, reduced motion on.

| Measure | Value |
| --- | --- |
| Words on the home page | 692 — hero 75 · matrix 193 · thread 354 · closing 54 · footer 12 |
| Words per thread beat | 45 · 48 · 60 · 58 · 56 · 50 |
| Uppercase text elements | 18 |
| Button face, size, tracking | Incillum Serif · 12.5px · 1.5px, uppercase |
| Masthead button on a phone | 11px below 440px · 10.5px below 380px |
| Hero settle time | about 1.8s — the caption waits 900ms, then takes 900ms |
| Night photograph master | 1672 × 941 |
| Page height at 1440 | 4,897px |
