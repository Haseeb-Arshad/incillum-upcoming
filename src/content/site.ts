/**
 * Every word this site renders.
 *
 * One file, so the claims can be read in one sitting and held to one standard.
 * That standard, in two rules:
 *
 *   1. Nothing here asserts something that has already happened. No customers,
 *      no logos, no accuracy figures, no "trusted by", no launch date. Anything
 *      in the future says so.
 *   2. Nothing says *magic*, *autonomous*, *revolutionary*, or implies that
 *      commercial judgement runs itself. The product's argument is that a
 *      person stays in the loop exactly where the loop matters; the copy has to
 *      make that argument rather than undercut it.
 *
 * ── What this file used to be ──────────────────────────────────────────────
 *
 * Accounts payable. Invoice intake, three-way match, exception handling — a
 * good, specific pre-launch wedge, and narrower than the company it was
 * describing. The site now argues the thing underneath it: that commercial work
 * keeps mattering after the people carrying it have gone home, and that the
 * eventual system is the one that stays attached to it. The first work it is
 * being built for is the quotation — an RFQ arriving, being resolved, and
 * coming back to a person as a decision.
 *
 * The discipline did not change with the subject. Two of the rewrites that
 * happened here are worth naming because they are the ones most likely to be
 * undone by somebody trying to make a sentence stronger:
 *
 *   · Nothing on this page says Incillum contacts a supplier. Supplier
 *     information *arrives* and is read; that is a claim about reading a
 *     mailbox, which is a thing software does. Outbound contact on somebody
 *     else's behalf is a different promise and it is not made here.
 *   · The night thread and the evidence document are labelled illustrative in
 *     their own first lines, at reading size. Not in small print underneath.
 *
 * ── On naming systems ──────────────────────────────────────────────────────
 *
 * No ERP is named in the rendered copy any more. The old page named three, and
 * the naming was safe there because every mention sat under a lede that had
 * already put it in the future. That contract is easy to state and easy to
 * break in one careless edit, and the reason it existed — letting a reader
 * recognise themselves in about a second — is now done by the form, where the
 * question can be asked instead of answered. `lib/waitlist.ts` asks which ERP;
 * the page claims nothing about any of them. There is a test.
 */

export const brand = {
  name: 'Incillum',
  domain: 'incillum.com',
  /**
   * The noun for the thing somebody is joining.
   *
   * It was "Private preview", and that came off the site when it went public.
   * A page anybody can reach that calls itself private is either lying or
   * telling a visitor they are not the audience — and both readings cost more
   * than the word was buying. "Early access" says the same thing about the
   * stage without claiming a door that is not there.
   */
  access: 'Early access',
  /**
   * The motto, and the rule that goes with it.
   *
   * It is used **twice** on the whole site: once at the close, where the page
   * ends on it, and once in the success state after somebody joins, where it is
   * the last thing they read. That is the entire budget.
   *
   * It survives on scarcity. A phrase this short is a signature the third time
   * it appears and a slogan the fourth, and a slogan is a thing a reader learns
   * to skip. It is also never extended: "AI that stays with your work" is the
   * same idea with the conviction taken out of it, and every version of this
   * sentence that adds a noun is weaker than the four words.
   */
  motto: 'Stay with the work.',
} as const

export const hero = {
  /** Two deliberate lines; the explanation keeps the full commercial arc. */
  headline: 'Intelligence for commercial work.',
  headlineStart: 'Intelligence for',
  headlineEnd: 'commercial work.',
  lede: 'From the first request to the decisions, follow-ups, documents and financial consequences that follow. Incillum is being built to carry the work forward — and bring you back where judgement matters.',
  invitation: 'Bring your hardest quotation.',
  storyLink: 'Follow one night of work',
  /**
   * The proof beat.
   *
   * One concrete hour and one modest claim, sitting under a rule at the bottom
   * of the hero. It is deliberately the quietest line in the column and it is
   * the one doing the most work: it converts an abstract thesis into a Tuesday,
   * and it is the hook into the night thread further down, which opens at the
   * same minute. If the hour here changes, it changes there.
   *
   * "should be" rather than "is". The page has not shipped anything.
   *
   * Two fields rather than one sentence, because the hour is set in the tabular
   * figures at full ink while the clause around it stays muted — and the
   * alternative, slicing the sentence at a character index in the component, is
   * a magic number that breaks silently the first time a word is edited.
   */
  proof: 'A request arrives at 23:47.',
  proofTail: 'By morning, the decision should be further along.',
  /**
   * Who the form is for, printed at the top of the form column.
   *
   * The old page put this under the headline as a spec stamp naming two ERPs
   * and a volume band. It moved here because its job is not to qualify the
   * argument, it is to qualify the person about to type an address — and that
   * person is looking at the field, not at the prose. Named as work rather than
   * as an industry list: a reader who quotes for a living recognises all four
   * of these, and the industry itself is a question on the form.
   */
  qualifier:
    'Complex RFQs. Moving supplier costs. A margin to protect. If this is your work, help shape what comes next.',
  /**
   * Sits under the button.
   *
   * It answers "what happens if I give you this address", and the moment that
   * question gets asked is the moment a cursor is on the button. It says what
   * the first group actually gets, which is the same thing `earlyAccess`
   * commits to further down — one promise stated twice, not two promises.
   */
  assurance:
    'A conversation, then one real case alongside your team. No payment. No newsletter.',
} as const

/**
 * The night plate — the one image on the site.
 *
 * ── What it is, and what it is not ─────────────────────────────────────────
 *
 * The slot a launched company fills here holds a product screenshot, and the
 * slot a pre-launch company usually fills holds a stock photograph of an
 * office. There is nothing shipped to screenshot, and the stock version is
 * worse than nothing: an empty office at dusk with a warm grade on it is the
 * most reproduced image in enterprise software, and a reader sees through it
 * before reading a word.
 *
 * This is a commissioned frame built to one brief — `design/hero-image-brief.md`
 * — and it earns the slot by refusing everything that makes the stock version
 * useless. One light source. The lit object is paper, not a screen. The monitor
 * in shot is off, which is the load-bearing detail: a glowing screen says
 * somebody is sitting there. No people, no floating interface, no blue in the
 * shadows, no legible text to zoom in on and catch out.
 *
 * It replaced a drawing of the same scene built out of the site's own tokens.
 * The drawing is at `550e87d` and its constraints are the acceptance criteria
 * for anything that stands here.
 *
 * Both strings below are real text under the picture rather than inside it, so
 * both are selectable, translatable and read aloud — and they say different
 * things on purpose. See each.
 */
export const nightfall = {
  /**
   * What a non-sighted reader gets instead of the picture.
   *
   * It describes the composition rather than inventorying it, because what this
   * image is for is the argument, not the furniture — and it deliberately stops
   * short of stating the argument, which is the caption's job. An `alt` that
   * says "the work is still lit" is editorialising in a field that is supposed
   * to report.
   */
  alt: 'A commercial office at night, photographed from inside. A desk lamp is the only light on, falling across a printed quotation lying on the desk. The chair behind it is empty and pushed back, the monitor beside it is switched off, and beyond the window the city is dark except for a few lit floors.',
  /**
   * The picture's title, not an explanation of it — and the one place the
   * argument is stated rather than shown. The `alt` above reports what is in
   * the frame and stops there; this is the sentence the frame is for.
   */
  caption: 'The office is empty. The quotation is not finished.',
} as const

/**
 * The instrument.
 *
 * A working day is nine hours. The other fifteen are the product's entire
 * reason to exist, so they are drawn at the same scale rather than described.
 *
 * ── The inversion, which was the second version of this plate ──────────────
 *
 * The first version shaded the nine hours somebody is at a desk, and captioned
 * itself from the reader's clock: *your team is at their desks* by day,
 * *nobody is at their desks* at night. Which meant that for the whole of a
 * working day — the hours most visitors actually arrive in — the one live
 * element on the page opened by arguing the opposite of the page's thesis.
 *
 * So the shading moved onto the fifteen hours, and the caption stopped
 * depending on the hour. It now says the same true thing at any time of day and
 * the reader's mark simply lands inside the shaded mass or in the gap. The mark
 * is still the reader's own clock, because a diagram somebody can check against
 * their own wrist is the only kind that gets checked at all.
 *
 * ── What the mark may not become ───────────────────────────────────────────
 *
 * The mark is lit with the site's one colour now, and that is the whole of the
 * change: it is the reader's hour, and it is the only live thing on the page,
 * so it is the thing that is still on. It is **not** a claim that Incillum is
 * doing anything at that hour, for that reader, anywhere. Nothing on this plate
 * may ever say "working now", and no counter may ever tick beside it.
 */
export const instrument = {
  label: 'The unattended hours',
  headline: 'A lot can change before morning.',
  lede: 'A request arrives. A supplier answers. A cost moves and a deadline closes in. None of it waits for the morning, and for fifteen hours a day there is nobody attached to any of it.',

  /** Local hours the office is treated as occupied. Inclusive of `from`, exclusive of `to`. */
  officeHours: { from: 9, to: 18 },

  /** The nine hours: the one gap in the rule, left bare. */
  occupiedLabel: 'Staffed',
  /** The fifteen: shaded, and named once beneath the plate. */
  uncoveredLabel: 'The unattended hours',

  /**
   * The caption, and why it does not branch.
   *
   * One sentence about the drawing, equally true at 03:20 and at 16:28,
   * followed by the reader's own time as a clause rather than as a verdict.
   * Everything before the clause is in the server's HTML; only the clause waits
   * for a browser, so the plate reads correctly with no JavaScript at all.
   */
  caption: 'Fifteen of these twenty-four hours have nobody attached to the work.',
  /** Completes the caption once the browser has a clock. */
  captionLocalPrefix: 'It is ',
  captionLocalSuffix: ' where you are.',
  /** Server-rendered stand-in — the server cannot know where the reader is. */
  unknownTime: 'Reading the clock on your device.',
} as const

/**
 * One night, one thread.
 *
 * ── Why there is exactly one story ─────────────────────────────────────────
 *
 * Because the alternative is a capability list, and a capability list is what a
 * reader skims. Everything this product is being built to do — reading a
 * request, resolving parts, holding what it cannot settle, taking a cost change
 * through to a price, handing back a decision — happens once, to one quotation,
 * between 23:47 and 08:04. A reader who follows it has understood the product;
 * a reader who skims it has still seen the first hour and the last, which are
 * the two that carry the argument.
 *
 * ── The label is the licence ───────────────────────────────────────────────
 *
 * `Illustrative` is in the first line, at reading size, in the server's HTML.
 * Not a watermark, not a red banner across the section, and not small print
 * under it. The block is allowed to exist only while that word is above it, and
 * there is a test.
 *
 * ── What is deliberately not claimed ───────────────────────────────────────
 *
 * At 03:42 a supplier confirmation *arrives* and is read. It is not requested,
 * chased, or negotiated. Reading a mailbox is a thing software does; contacting
 * somebody's suppliers on their behalf is a different promise, and the moment
 * this page makes it, the first conversation with every design partner starts
 * with a correction. If the shipped product ever does outbound supplier
 * contact, this beat changes on the commit that ships it and not before.
 *
 * ── The arithmetic ────────────────────────────────────────────────────────
 *
 * A commercial reader will check it, and it reconciles with `evidence` below to
 * the cent — deliberately, because the two sections are the same quotation seen
 * at two magnifications. The relations, all of which have tests:
 *
 *   twenty line items, two held, eighteen priced
 *   quote  EUR 236,400.00  ·  expected margin 16.4%  ·  floor 20.0%
 *   cost   236,400 × (1 − 0.164)          = 197,630.40
 *   price needed to clear the floor        = 197,630.40 ÷ 0.8 = 247,038.00
 *   short of the floor                     = 10,638.00
 *
 * Edit one number here and every number in `evidence` moves with it. An example
 * that does not add up is worse than no example, and it fails hardest in front
 * of exactly the reader this section exists for.
 */
/**
 * A figure on the 06:50 ledger. `breaches` marks the one that is under the
 * floor, which is the only place in this section the signal colour appears.
 */
export interface ThreadFigure {
  term: string
  value: string
  breaches?: boolean
}

/**
 * One beat of the night.
 *
 * `state` and `figures` are optional and appear on one beat each — the held
 * lines at 01:18 and the ledger at 06:50. They are declared here rather than
 * left to be inferred from the literal so that a component reading
 * `beat.figures` type-checks against the shape of a beat rather than against
 * the particular six that happen to be written below. Inferring them from `as
 * const` gives a union in which most members simply lack the property, which
 * makes every read of it a narrowing exercise for no benefit.
 */
export interface ThreadBeat {
  at: string
  title: string
  body: string
  state?: string
  figures?: ReadonlyArray<ThreadFigure>
}

const beats: ReadonlyArray<ThreadBeat> = [
  {
    at: '23:47',
    title: 'A customer request arrives.',
    body: 'An RFQ against a framework agreement: twenty line items, a drawing pack, and a response expected on Thursday. It lands in the shared mailbox at the hour the building is emptiest, and until somebody opens it, it is a PDF.',
  },
  {
    at: '00:06',
    title: 'The request has structure.',
    body: 'Customer, parts, quantities, delivery dates, the terms it is being quoted under. What the document does not say is listed as missing rather than filled in: two lines carry no drawing revision, and one delivery date is a range rather than a date.',
  },
  {
    at: '01:18',
    title: 'Two lines cannot be resolved safely.',
    /**
     * The restraint beat, and the reason the section exists at this length.
     * A demonstration where everything resolves is a demonstration of a
     * product nobody who has quoted for a living believes in.
     */
    body: 'One part number matches three catalogue entries and only the tolerance separates them; the other is a customer drawing with no revision on it. Neither is guessed. Both are set aside as held, with the question narrowed to the one thing each needs, and the remaining eighteen carry on without them.',
    /** Rendered as the state on the held lines. The one place the signal appears in this section. */
    state: 'Needs review',
  },
  {
    at: '03:42',
    title: 'A supplier answer changes the economics.',
    body: 'A confirmation lands against the largest line: lead time out by three weeks, unit cost up six per cent. It is filed against the line it belongs to and the quotation is recalculated on the spot — so the change is a number by morning rather than a discovery on Thursday.',
  },
  {
    at: '06:50',
    title: 'The commercial decision is ready for a person.',
    body: 'Eighteen lines priced, every figure still attached to the document it came from. The recalculated quotation now sits under the commercial floor, and that is not something software gets to resolve.',
    /**
     * The figures. Rendered as a small ledger rather than as prose, because
     * this is the moment the section stops being a story and becomes a
     * commercial object — and because a margin below a floor is read in a
     * glance when it is set as figures and argued about when it is set as a
     * sentence.
     */
    figures: [
      { term: 'Quote value', value: 'EUR 236,400.00' },
      { term: 'Expected margin', value: '16.4%' },
      { term: 'Commercial floor', value: '20.0%' },
      { term: 'Short of the floor', value: 'EUR 10,638.00', breaches: true },
    ],
  },
  {
    at: '08:04',
    title: 'A person returns to a decision, not an investigation.',
    body: 'Eighteen lines priced with their evidence attached, two lines held with the question already narrowed, and one commercial call to make: quote under the floor, or go back to the supplier on the three-week lead time. Neither happens without you.',
  },
]

export const thread = {
  label: 'Illustrative · one request, one night',
  headline: 'What changed by morning.',
  lede: 'Invented, and marked as invented. Follow one quotation from arrival to review. The customer, supplier and figures are illustrative; the boundaries show where a person takes over.',

  beats,
} as const

/**
 * Where it stops.
 *
 * ── Why this section is not last ───────────────────────────────────────────
 *
 * Because it is the answer to the question the night thread just raised. A
 * reader who has watched software resolve eighteen lines of a quotation
 * overnight has exactly one thought, and it is not "how impressive" — it is
 * "and what happens when it is wrong". A page that answers that six screens
 * later has already lost the reader who was going to ask it.
 *
 * It is also, commercially, the most persuasive section on the site. Everybody
 * building in this category is claiming capability. Very few are willing to
 * write down where their software is not allowed to go, in advance, on a page
 * strangers can read — and a commercial director evaluating this is buying the
 * boundary at least as much as the capability.
 *
 * Every entry names a limit and none of them names a mitigation. "It stops" is
 * the whole sentence; "it stops, but usually it can work it out" is the version
 * that makes the section worthless.
 */
export const boundary = {
  label: 'Where it stops',
  headline: 'Your judgement. At the right moment.',
  lede: 'Incillum is being built to move the work forward within the limits you set. Ambiguity, approvals, commercial policy and missing evidence bring the decision back to you.',

  points: [
    {
      title: 'Ambiguity',
      body: 'When the evidence does not settle which part, which price or which date, nothing is chosen. The line is held with the question narrowed to the one thing it needs from a person — not returned as a shrug, and not resolved on the balance of probability.',
    },
    {
      title: 'Approval',
      body: 'No quotation is sent, no price is committed and no order is confirmed on a model’s confidence. A person does that, with the working already assembled in front of them.',
    },
    {
      title: 'Commercial policy',
      body: 'Margin floors, discount authority, payment terms, which customers need a second signature. Stated in advance, checked on every line, and changed deliberately rather than discovered afterwards. A floor that can be argued down by the thing being measured against it is not a floor.',
    },
    {
      title: 'Missing evidence',
      body: 'A figure with no document behind it is reported as missing, never estimated to fill the gap. A quotation assembled out of numbers nobody can point at is worse than a late one, because it is wrong at a speed nobody can catch.',
    },
  ],
} as const

/**
 * The evidence.
 *
 * ── Why a document and not an interface ────────────────────────────────────
 *
 * The rule this page holds to is that there is nothing shipped to photograph,
 * and a rendered dashboard presented as a product would be a lie told in
 * pixels. That rule is intact. There is no chrome here, no sidebar, no button,
 * no cursor, nothing that could be mistaken for a running application — and the
 * block says what it is in its own first line, in the same type as everything
 * around it.
 *
 * What it is instead is one line of a quotation with its provenance still
 * attached: source, finding, calculation, decision. That is the thing four
 * paragraphs of specification cannot make concrete, and it is the specific
 * claim this company is making — not that the number appears, but that the
 * number arrives carrying the page it came from.
 *
 * ── The arithmetic, which is checked ───────────────────────────────────────
 *
 * This is line 14 of the same twenty-line quotation the night thread runs, seen
 * close up, and it is why that quotation misses its floor. Every figure below
 * is exact rather than plausible:
 *
 *   1,200 units
 *   unit cost was 128.00, now 135.68            128.00 × 1.06 = 135.68
 *   extended cost      1,200 × 135.68         = 162,816.00
 *   quoted unit price 160.00, extended        = 192,000.00
 *   margin             192,000 − 162,816      =  29,184.00   → 15.2%
 *   price at a 20% floor  162,816 ÷ 0.8       = 203,520.00   → 169.60 a unit
 *   short of the floor                        =  11,520.00   →   9.60 a unit
 *
 * And it reconciles upward: this line contributes 29,184.00 of margin on
 * 192,000.00 of the quotation's 236,400.00, which leaves the other seventeen
 * priced lines carrying 9,585.60 on 44,400.00 — and the whole quotation at
 * 16.4%, which is the figure the night thread prints at 06:50.
 *
 * `content/site.test.ts` asserts all of it. If one number here is edited, the
 * test will tell you which of the others have to move.
 */
export const evidence = {
  label: 'Illustrative · one line of that quotation',
  headline: 'The number changed. The reason comes with it.',
  lede: 'Invented, and not a screenshot. One line from the quotation above: a supplier cost changes, the margin falls, and the decision comes back with the evidence attached.',

  visual: {
    unitCostBefore: 128,
    unitCostAfter: 135.68,
    unitPrice: 160,
    units: 1200,
    floorPercent: 20,
    scaleMax: 25,
    sourceLabel: 'The source',
    sourceTitle: 'A supplier cost changes.',
    sourceReference: 'Supplier confirmation SC-4471 · 03:39',
    costLabel: 'Cost per unit',
    beforeLabel: 'Previous',
    afterLabel: 'Confirmed',
    leadTime: 'Lead time moves from 21 to 42 days.',
    quoteLabel: 'Quoted price holds at',
    impactLabel: 'The consequence',
    impactTitle: 'The margin crosses your floor.',
    chartLabel:
      'Margin before and after the supplier update, on a shared zero to twenty-five percent scale.',
    beforeMarginLabel: 'Before the update',
    afterMarginLabel: 'After the update',
    floorLabel: 'Commercial floor',
    shortfallLabel: 'Below the floor on this line',
    shortfallExplanation:
      'The additional revenue needed to restore the 20.0% margin. The quotation stays with a person for the commercial decision.',
    decisionTitle: 'The arithmetic is settled. The decision is yours.',
    decisionBody:
      'Keep the price and accept the lower margin, revise the price to meet the floor, or reconsider the lead time. The sources and calculation are ready to review. Nothing is sent on your behalf.',
    detailsLabel: 'Trace the sources and the full calculation',
  },

  record: {
    reference: 'RFQ 8841 · Line 14',
    part: 'Flanged housing, machined · 1,200 units',
    revisedLabel: 'Recalculated',
    revisedAt: '03:42',

    source: {
      label: 'Source',
      lede: 'What was read, and where each number came from.',
      items: [
        { term: 'Customer RFQ 8841', value: 'Line 14 — part, quantity, delivery week.' },
        {
          term: 'Framework agreement',
          value:
            'The terms this customer is quoted under, and the floor that applies to them.',
        },
        {
          term: 'Supplier confirmation SC-4471',
          value: 'Received 03:39. Unit cost and lead time, superseding the price list.',
        },
        {
          term: 'Price list, February',
          value: 'The unit cost this line was carrying until 03:42.',
        },
      ],
    },

    finding: {
      label: 'Finding',
      body: 'The supplier confirmation moves two things on one line: unit cost from EUR 128.00 to EUR 135.68, a rise of six per cent, and lead time from 21 days to 42. The price list is not wrong; it is out of date by three minutes.',
    },

    calculation: {
      label: 'Calculation',
      /** `sr-only` column headings — see the component for why they are not visible. */
      columns: { basis: 'Basis', working: 'Working', amount: 'Amount' },
      rows: [
        { basis: 'Cost', working: '1,200 × EUR 135.68', amount: 'EUR 162,816.00' },
        { basis: 'Quoted', working: '1,200 × EUR 160.00', amount: 'EUR 192,000.00' },
        { basis: 'Margin', working: '15.2%', amount: 'EUR 29,184.00' },
        {
          basis: 'At the 20.0% floor',
          working: 'EUR 169.60 a unit',
          amount: 'EUR 203,520.00',
        },
      ],
      /**
       * The one figure on the page in the signal colour. It is the number that
       * stopped the work, and it is the only thing in this document a person is
       * actually being asked to look at.
       */
      shortfall: {
        basis: 'Short of the floor',
        working: 'EUR 9.60 a unit',
        amount: 'EUR 11,520.00',
      },
    },

    decision: {
      label: 'Decision',
      body: 'Quote at EUR 160.00 and accept 15.2% on the largest line, hold the line at EUR 169.60 and go back to the supplier on the lead time, or split the quantity across both. Nothing is sent and no price is committed until a person picks one.',
    },
  },
} as const

/**
 * What is being built first.
 *
 * ── Why this is three sentences and not a capability list ──────────────────
 *
 * Because the thing a reader has to leave with is the wedge, stated narrowly
 * enough to be repeated. Everything the eventual product might carry — orders,
 * follow-up, the financial consequences afterwards — is in the hero's lede
 * where it belongs, as the shape of the company. Here there is one job, and
 * naming a second one costs the first its edge.
 *
 * The three lines are the sequence, not a feature set: what arrives, what
 * happens to it, and what comes back. A fourth line would be a product tour.
 */
export const firstBuild = {
  label: 'What we are building first',
  headline: 'RFQ to commercial decision.',
  lede: 'One piece of work, chosen because it is where the cost of stopping is highest: a request that arrives with a deadline on it, and a quotation that has to be right about parts, cost and margin before anybody can send it.',

  points: [
    {
      title: 'What arrives',
      body: 'A customer request, in whatever form it turned up in — an RFQ document, a drawing pack, a spreadsheet, or a paragraph in the body of an email — together with the supplier answers and price changes that land against it afterwards.',
    },
    {
      title: 'What happens to it',
      body: 'It is read into lines. Parts are matched, quantities and dates are pulled through, costs are taken from the most recent thing that says what they are, and the margin is calculated against the policy that applies to that customer. What cannot be settled on the evidence is held rather than guessed.',
    },
    {
      title: 'What comes back',
      body: 'A quotation ready for a person to decide on, with the working attached and the held lines named — not a draft to check line by line, and not a decision already taken.',
    },
  ],
} as const

/**
 * Where the build stands.
 *
 * A pre-launch page that says nothing about its own progress reads as a parked
 * domain; one that invents a date reads as a lie the moment the date passes.
 * So: three stages, present tense, no calendar.
 *
 * This is the only place on the page that says what does and does not exist.
 * Saying it three times is not three times the integrity — the first is candour
 * and the third is an apology, and a reader who has been apologised to twice
 * has stopped reading a specification and started reading a disclaimer.
 */
export const standing = {
  label: 'Where this stands',
  headline: 'Honest about what exists.',
  stages: [
    {
      state: 'Built',
      title: 'The platform underneath',
      body: 'Deployments, cases, policies, approval routing and the audit record — the parts that have to be right before any model is allowed near a price a customer will be held to.',
    },
    {
      state: 'In build',
      title: 'The quotation operator',
      body: 'Reading a request into lines, matching parts, carrying supplier costs through to a price, checking margin against policy, and the held-line path a person picks up in the morning.',
    },
    {
      state: 'Opening',
      title: 'Early access',
      body: 'A first group of teams, one real case each, run alongside the way they quote today so the two can be compared before anything depends on ours.',
    },
  ],
} as const

/**
 * Data and access.
 *
 * ── Why this section is two paragraphs and not a trust page ────────────────
 *
 * A commercial team asks what happens to their pricing before they ask what the
 * software does with it, and its absence on a page about reading costs and
 * margins is loud. So it is here. What it is not is a security page: there is
 * no badge, no certification, no framework named, and nothing that could be
 * mistaken for one. A certification asserted before it is held is the one lie
 * on a pre-launch site that a buyer can check in an afternoon.
 *
 * ── Why only one thing is asserted ─────────────────────────────────────────
 *
 * Because only one thing is settled. Training was a decision that could be made
 * before anything shipped, so it was, and it is stated flatly. Residency,
 * internal access, retention and audit are not settled, and every one of them
 * was a candidate for a confident sentence here.
 *
 * Writing that sentence is the failure mode this whole site is built against.
 * Nobody can check it today, everybody can check it later, and the version of
 * this company that writes it now is the one that has to walk it back in front
 * of its first ten customers.
 *
 * If any of the open items is settled, it moves up into `decided` with the same
 * flatness — and it does not move up a moment before.
 */
export const access = {
  label: 'Data and access',
  headline: 'Your commercial data stays out of training.',

  decided: {
    title: 'A clear commitment',
    body: 'Your requests, supplier costs, price lists, margins and correspondence are not used to train or fine-tune a model. That commitment is part of how we are building Incillum.',
  },

  open: {
    title: 'Before you share a case',
    body: 'Data location, internal access and audit arrangements are being settled with the first group of teams. We will explain the current setup before you decide whether to share a case.',
  },
} as const

/**
 * Early access.
 *
 * ── Why the form appears twice ─────────────────────────────────────────────
 *
 * Because the page is nine screens and the field is on the first one. The
 * sticky masthead button covers a reader who decides early; this covers the
 * reader the page was actually written for, who decides at the end, and who
 * should not have to scroll back through the whole argument to act on it.
 *
 * It is the same call to action, not a second one. There is no "book a demo"
 * anywhere on this site and there should not be: a page with two asks is a page
 * that has not decided what it wants, and this one wants an address from a team
 * that quotes for a living.
 *
 * ── Why the qualification is a list of work and not of industries ──────────
 *
 * The industries this fits — industrial and electrical distribution,
 * components, engineered products, contract manufacturing — are on the form as
 * a question, not on the page as a wall. A reader recognises the *work* faster
 * than they recognise their own sector's label, and printing eight sectors
 * where four sentences would do makes the page read as a net rather than as an
 * invitation.
 */
export const earlyAccess = {
  label: 'Early access',
  headline: 'Who this is for.',
  lede: 'We are looking for a small number of teams to build against, not a mailing list. If the work below is your week, the form is worth two minutes.',

  fits: [
    'Quotes are complex enough that preparing one is real work — parts to match, drawings to read, options to price.',
    'Suppliers move your costs and lead times while a quotation is still open.',
    'Margin is governed: there is a floor, an approval, or somebody whose signature is needed under a certain number.',
    'The answer has to end up somewhere — a CRM, an ERP, a quotation document a customer will hold you to.',
  ],

  /** What actually happens next. The same promise as `hero.assurance`, once more, in full. */
  nextLabel: 'What happens next',
  next: 'A call first, so we understand how you quote today. Then, if it fits, one real case run alongside your existing process — yours to compare, no commitment and no payment. We are not going to ask you to change anything to find out whether this is useful.',
} as const

/**
 * The close.
 *
 * The motto lands here, and this is one of the two places on the entire site it
 * is allowed to appear. It is set as the last thing on the page, under the
 * wordmark, at display size — not as a tagline beside the logo in the masthead,
 * where it would be read fifty times a visit and mean nothing by the third.
 */
export const close = {
  headline: 'Tell us the request that always arrives late.',
  body: 'If there is an RFQ that lands on a Friday evening, or a quotation that is always waiting on one number from one supplier, that is the conversation we want to have. Join the list above, or write to us directly.',
  emailLabel: 'Write to us',
} as const

/**
 * The head, and the one rule it lives under.
 *
 * ── The title is the headline ─────────────────────────────────────────────
 *
 * It said "the work doesn’t leave when you do" long after the page stopped
 * saying it. That phrase was the previous positioning's headline, and when the
 * page was rewritten around `hero.headline` it survived here, where nobody on
 * the team ever reads it — a title and a share card are the two parts of a site
 * that only ever render in somebody else's tab.
 *
 * So the rule is that this title carries the hero's headline, and
 * `lib/seo.test.ts` fails if it stops doing so. A visitor who arrives from a
 * search result or a pasted link should read the same sentence twice: once in
 * the preview and once at the top of the page. Two different first sentences is
 * not a richer pitch, it is a reader wondering whether they clicked the right
 * link.
 *
 * Lower case after the dash, because the wordmark is the proper noun and the
 * rest is a description of what the company does.
 */
export const seoCopy = {
  title: 'Incillum — intelligence for commercial work',
  description:
    'Incillum is being built to stay with commercial work: an RFQ that arrives at night, the supplier costs and margin decisions that follow it, and a quotation ready for a person by morning. Join early access.',
} as const

/** The intentionally unrevealing public launch surface. Editorial copy above is archived. */
export const launch = {
  headline: 'A different kind of intelligence.',
  headlineStart: 'A different kind',
  headlineEnd: 'of intelligence.',
  category: 'Commercial intelligence. Reimagined.',
  stage: 'In formation',
  invitation: 'Be there at the beginning.',
  note: 'One email when we are ready. Nothing before.',
  submit: 'Join the waitlist',
  success: 'You are on the list.',
  successNote: 'We have your address. We will write when we are ready.',
  index: ['Artificial intelligence', 'Commercial instinct', 'A new perspective'],
  title: 'Incillum - A different kind of intelligence.',
  description:
    'Commercial intelligence. Reimagined. Incillum is in formation. Join the waitlist.',
} as const

/**
 * The home page: night first, then morning.
 *
 * The page opens on the commissioned photograph — an empty office, one lamp,
 * a quotation still lying under it — because that frame is the argument with
 * the words taken away, and it was sitting below the fold. Then the product's
 * own object, lit: one request's twenty lines with their status and their
 * evidence. Then the thread of the night that produced it. The page ends on
 * paper, at the hour a person picks the work back up, with one invitation.
 *
 * ── The matrix is illustrative, and reconciles ─────────────────────────────
 *
 * It is the same quotation the thread follows, at a different magnification:
 * twenty lines, eighteen priced, two held — one because a part number matches
 * three catalogue entries, one because a customer drawing carries no revision —
 * and one line whose cost moved when a supplier confirmation arrived at 03:42.
 * Its money is not written here. It is read off the thread's 06:50 ledger, so
 * the two cannot disagree. `content/site.test.ts` counts the rows below against
 * the totals and the totals against the thread's own prose.
 *
 * It says it is invented in its first line, at reading size, in the server's
 * HTML, with the same words the thread uses.
 *
 * No price per line. A line price would be twenty more figures to keep true and
 * would not tell a stranger anything the status and the evidence do not.
 */
export type MatrixStatus = 'priced' | 'changed' | 'held'

export const home = {
  headlineStart: hero.headlineStart,
  headlineEnd: hero.headlineEnd,
  kicker: 'For the unattended hours',
  lede: hero.lede,
  nav: { night: 'One night', contact: 'Contact' },
  cta: 'Request early access',
  emailPlaceholder: 'Your work email',
  /** The note under the field: what a first email is for, and what it is not. */
  assurance: hero.assurance,
  status: 'In progress. Carefully built.',

  night: { anchor: 'night' },

  matrix: {
    heading: 'What is waiting at 08:04.',
    lede: 'One request, carried through the night: every line priced or held, every figure still attached to where it came from, and the one call that is not software’s to make.',
    title: 'Request for quotation · framework agreement',
    due: 'Response expected Thursday',
    lines: { total: 20, priced: 18, held: 2 },
    summary: {
      priced: 'Lines priced',
      held: 'Held for review',
      value: 'Quote value',
      margin: 'Expected margin',
      floor: 'floor',
    },
    columns: { line: 'Line', item: 'Item', status: 'Status', evidence: 'Evidence' },
    statusLabels: {
      priced: 'Priced',
      changed: 'Cost moved',
      held: 'Needs review',
    } satisfies Record<MatrixStatus, string>,
    rows: [
      { line: '01', item: 'Machined bracket, 6061-T6', status: 'priced', evidence: 'Framework agreement, schedule B' },
      { line: '02', item: 'Cast housing, A380', status: 'priced', evidence: 'Supplier price list, page 4' },
      { line: '03', item: 'Stepped shaft, Ø20 h6', status: 'changed', evidence: 'Supplier confirmation at 03:42 — unit cost up six per cent, lead time out three weeks' },
      { line: '04', item: 'Bearing seat, catalogue part', status: 'held', evidence: 'Part number matches three catalogue entries; only the tolerance separates them' },
      { line: '05', item: 'Gasket set', status: 'priced', evidence: 'Framework agreement, schedule B' },
      { line: '06', item: 'Cover plate, laser cut', status: 'priced', evidence: 'Supplier price list, page 9' },
      { line: '11', item: 'Sensor mount, customer drawing', status: 'held', evidence: 'Drawing carries no revision' },
    ] satisfies ReadonlyArray<{ line: string; item: string; status: MatrixStatus; evidence: string }>,
    more: { count: 13, text: 'more lines priced, each with its source attached' },
  },

  closing: {
    label: hero.invitation,
    headline: close.headline,
    body: 'If there is an RFQ that lands on a Friday evening, or a quotation that is always waiting on one number from one supplier, that is the conversation we want to have.',
    action: 'Tell us about the work',
    emailLabel: 'Or write to us',
  },

  title: seoCopy.title,
  description:
    'Incillum is being built to carry commercial work forward and bring people back where judgement matters: an RFQ that arrives at night, and a decision ready for a person by morning. Request early access.',
} as const

/**
 * /glass — the presentation.
 *
 * The same company and the same night as the home page, told the way a launch
 * film tells it: two beats of type in the dark, one line of argument, the night
 * played in a frame, and the documents the work is assembled from — scattered,
 * then gathered onto one sheet. The shape is borrowed from pages it was
 * measured against. None of their proof is, because there is none to borrow
 * (AGENTS.md §5).
 *
 * ── No labels over headings ────────────────────────────────────────────────
 *
 * The first version put a tracked capital label over every block. That is the
 * most recognisable mark of a page assembled rather than written, and it was
 * read as one. So the licence for invented material is a sentence, at reading
 * size, inside the block's own first lines — which is what AGENTS.md asks for
 * anyway, and says more plainly than a label did.
 *
 * ── One story, again ───────────────────────────────────────────────────────
 *
 * Nothing here is a second example. The film is the night thread at another
 * magnification, its sheet is the matrix's rows, and the quotation's figures —
 * the value, the margin, the floor, the shortfall — are read off the thread's
 * 06:50 ledger by the components, so none of them is written here and a test
 * keeps it that way. The hours are the thread's, the line numbers are the
 * matrix's, and the one cost that moves, moves by the thread's six per cent and
 * three weeks: tests hold all of it.
 *
 * ── Shorter than the home page, on purpose ─────────────────────────────────
 *
 * A presentation is watched, not read: titles of six words or fewer, lines of
 * sixteen or fewer, and a test for both. Anything longer is on the home page.
 *
 * ── The motto is not here ──────────────────────────────────────────────────
 *
 * Its two placements are the home page's close and the success state. The form
 * on this page is the home page's form, so its success state can appear here —
 * that is the same placement, not a third.
 */
export type GlassStatus = MatrixStatus | 'read'

/** The six places one quotation's facts are kept. Also the icon a source carries. */
export type GlassSource = 'request' | 'drawing' | 'catalogue' | 'prices' | 'agreement' | 'supplier'

export interface GlassFrame {
  /** An hour of the thread. A test holds every frame to a beat. */
  at: string
  line: string
  /** The sheet's source bar until the ledger exists, which is 06:50: what the night has done so far. */
  note?: string
  /**
   * Where a source lands on the sheet — `head`, `floor`, or a line number from
   * the matrix — and which source it is, for its icon. A chip with no source is
   * the person the night ends with.
   */
  chips: ReadonlyArray<{ target: string; source?: GlassSource; text: string }>
}

const glassFrames: ReadonlyArray<GlassFrame> = [
  {
    at: '23:47',
    line: 'Twenty line items and a drawing pack, due Thursday. The office is empty.',
    note: 'Twenty lines, unread.',
    chips: [{ target: 'head', source: 'request', text: 'Shared mailbox · 23:47' }],
  },
  {
    at: '00:06',
    line: 'Parts, quantities, dates and terms. What it does not say is flagged, not filled in.',
    note: 'Twenty lines read. Three gaps flagged, none filled in.',
    chips: [],
  },
  {
    at: '01:18',
    line: 'One part matches three catalogue entries. One drawing has no revision. Neither is guessed.',
    note: 'Two lines held. Eighteen carry on.',
    chips: [
      { target: '04', source: 'catalogue', text: 'Catalogue · three entries match' },
      { target: '11', source: 'drawing', text: 'Drawing · no revision' },
    ],
  },
  {
    at: '03:42',
    line: 'A confirmation arrives: unit cost up six per cent, lead time out three weeks.',
    note: 'Recalculated when the answer arrived.',
    chips: [{ target: '03', source: 'supplier', text: 'Supplier confirmation · 03:42' }],
  },
  {
    at: '06:50',
    line: 'Eighteen lines priced, each figure still attached to the page it came from.',
    chips: [{ target: 'floor', source: 'agreement', text: 'Framework agreement' }],
  },
  {
    at: '08:04',
    line: 'Quote under the floor, or go back on the lead time. Neither happens without you.',
    chips: [{ target: 'head', text: 'With a person · 08:04' }],
  },
]

/**
 * The film's sheet, set as a spreadsheet: what the night reads off the request
 * for each of the matrix's lines, and where each line's rate comes from.
 *
 * The categories and quantities are the request's own and are written here,
 * because the request is a PDF no page draws. The rates are not: each names the
 * document row it is read from — the supplier's price list, or the agreed
 * rates in schedule B for the two lines the matrix prices from the agreement —
 * and the component reads the figure there, so the sheet and the documents on
 * the desk cannot disagree. The held lines have no rate, because nothing is
 * guessed. A test holds every line to the matrix and every rate to a row.
 */
const glassSheet = {
  columns: {
    line: 'Line',
    item: 'Item',
    category: 'Category',
    quantity: 'Qty',
    rate: 'Rate',
    status: 'Status',
  },
  /** The name box's name for the selection that takes the whole sheet, at 08:04. */
  all: 'Quote',
  lines: {
    '01': { category: 'Machined', quantity: '400', rate: { from: 'agreement', part: 'BR-6061' } },
    '02': { category: 'Cast', quantity: '250', rate: { from: 'prices', part: 'CH-A380' } },
    '03': { category: 'Turned', quantity: '1,200', rate: { from: 'prices', part: 'SS-20H6' } },
    '04': { category: 'Catalogue', quantity: '600' },
    '05': { category: 'Sealing', quantity: '1,000', rate: { from: 'agreement', part: 'GS-12' } },
    '06': { category: 'Sheet metal', quantity: '300', rate: { from: 'prices', part: 'CP-LC3' } },
    '11': { category: 'Machined', quantity: '150' },
  },
} as const satisfies {
  columns: Record<string, string>
  all: string
  lines: Record<
    string,
    { category: string; quantity: string; rate?: { from: 'prices' | 'agreement'; part: string } }
  >
}

/**
 * The six documents, as they lie on the desk before anything reads them.
 *
 * Drawn from their own contents rather than from grey bars: a reader who leans
 * in finds a real subject line, a title block with the revision cell empty, the
 * three catalogue entries a tolerance apart, the cost the supplier is about to
 * change. All of it is the same invented quotation, and it reconciles — the
 * held lines are held for the reasons the matrix gives, and the confirmation
 * moves line 03's cost by exactly six per cent and its lead time by exactly
 * three weeks. The floor in the agreement is not written here: the component
 * reads it off the ledger, so the clause and the figure cannot disagree.
 *
 * Each carries the one question a person would ask of it at 23:47. They are the
 * same questions the held lines are narrowed to, asked by hand.
 */
const glassDocuments = {
  request: {
    title: 'Shared mailbox',
    at: '23:47',
    subject: 'RFQ 8841 — framework agreement',
    from: 'Purchasing',
    address: 'rfq@customer.example',
    body: 'Please quote the twenty lines attached, against our framework agreement. We need your response by Thursday.',
    attachments: [
      { name: 'RFQ-8841.pdf', format: 'PDF' },
      { name: 'Drawings-8841.zip', format: 'ZIP' },
    ],
    question: 'Due Thursday. Who has it?',
  },
  drawing: {
    title: 'Sensor mount',
    number: 'DWG 8841-11',
    revision: 'Rev',
    blank: '—',
    scale: 'Scale 1:1',
    material: '6061-T6',
    dimensions: { width: '120', height: '70', hole: 'Ø8', count: '2×' },
    question: 'Which revision?',
  },
  catalogue: {
    title: 'Bearing seats',
    page: 'p. 112',
    entries: [
      { part: 'BS-2210-H6', name: 'Bearing seat, Ø20', fit: 'h6' },
      { part: 'BS-2210-H7', name: 'Bearing seat, Ø20', fit: 'h7' },
      { part: 'BS-2210-K6', name: 'Bearing seat, Ø20', fit: 'k6' },
    ],
    question: 'Which of the three?',
  },
  prices: {
    file: 'supplier-prices.xlsx',
    columns: ['Part', 'Description', 'Unit cost', 'Lead time'],
    rows: [
      { part: 'CH-A380', description: 'Cast housing, A380', cost: '18.40', lead: '21 d' },
      { part: 'SS-20H6', description: 'Stepped shaft, Ø20 h6', cost: '46.50', lead: '21 d' },
      { part: 'CP-LC3', description: 'Cover plate, laser cut', cost: '6.90', lead: '10 d' },
      { part: 'SR-20', description: 'Spacer ring', cost: '1.85', lead: '7 d' },
      { part: 'LP-6', description: 'Locating pin', cost: '0.62', lead: '7 d' },
    ],
    /** The row the supplier is about to change. A test holds it to the confirmation. */
    moving: 'SS-20H6',
    tabs: ['Housings', 'Shafts', 'Plates'],
    question: 'Still this price?',
  },
  agreement: {
    title: 'Framework agreement',
    schedule: 'Schedule B · Commercial terms',
    clauses: [
      { number: 'B.1', text: 'Prices hold for twelve months from signature.' },
      { number: 'B.2', text: 'Quotations stay open for thirty days.' },
      { number: 'B.3', text: 'Payment falls due sixty days after invoice.' },
      { number: 'B.4', text: 'No quotation is issued below a margin of', floor: true },
      { number: 'B.5', text: 'Lead times are confirmed in writing.' },
      /** The agreed unit rates the sheet reads for lines 01 and 05, which the matrix prices from schedule B. */
      {
        number: 'B.6',
        text: 'Agreed unit rates:',
        rates: [
          { part: 'BR-6061', item: 'Machined bracket, 6061-T6', rate: '21.60' },
          { part: 'GS-12', item: 'Gasket set', rate: '3.15' },
        ],
      },
    ],
    signatures: ['For the customer', 'For the supplier'],
    question: 'What is their floor?',
  },
  supplier: {
    title: 'Supplier confirmation SC-4471',
    at: '03:42',
    item: 'Stepped shaft, Ø20 h6',
    changes: [
      { term: 'Unit cost', was: '46.50', now: '49.29' },
      { term: 'Lead time', was: '21 days', now: '42 days' },
    ],
    note: 'Supersedes the price list for this part.',
    question: 'Who saw this at 03:42?',
  },
} as const satisfies Record<GlassSource, unknown>

/**
 * What each source becomes on the sheet.
 *
 * The line numbers and states are the matrix's, and a test holds them to it:
 * the catalogue and the drawing hold lines 04 and 11, and the supplier answer
 * moves line 03. Declared rather than inferred, for the reason `ThreadBeat`
 * is: only some rows carry a line, and reading `row.line` should type-check
 * against the shape of a row, not against six literals.
 */
export interface GlassThreadRow {
  key: GlassSource
  title: string
  line?: string
  text: string
  status?: MatrixStatus
  /** Set on the agreement's row, which ends on the floor read from the ledger. */
  floor?: boolean
}

const glassThread: ReadonlyArray<GlassThreadRow> = [
  { key: 'request', title: 'Shared mailbox', text: 'Twenty line items, due Thursday' },
  { key: 'drawing', title: 'Drawing pack', line: '11', text: 'No revision on the drawing', status: 'held' },
  { key: 'catalogue', title: 'Catalogue', line: '04', text: 'Three entries match the part', status: 'held' },
  { key: 'prices', title: 'Supplier price list', text: 'Unit costs for the priced lines', status: 'priced' },
  { key: 'agreement', title: 'Framework agreement', text: 'Margin floor', floor: true },
  { key: 'supplier', title: 'Supplier confirmation', line: '03', text: 'Six per cent up, three weeks later', status: 'changed' },
]

export const glass = {
  title: 'Incillum — one request, one night',
  description:
    'One request for quotation, carried through one night and handed back to a person by morning: a short, illustrative presentation of what Incillum is being built to do.',

  /**
   * The opening: two beats, then the page.
   *
   * The first is the world as it is — the tools got faster, at the desk. The
   * second is the hour this company exists for. It is a sentence about people,
   * which is the house rule, and it leaves the argument to the hero rather than
   * spending it in the dark.
   */
  opening: ['AI made every desk faster.', 'Then everyone went home.'],

  nav: { contact: home.nav.contact },

  hero: {
    headlineStart: hero.headlineStart,
    headlineEnd: hero.headlineEnd,
    lede: hero.lede,
    assurance: hero.assurance,
    watch: 'Watch one night',
  },

  film: {
    /** The licence, as the frame's first line: a sentence, not a label. */
    licence: 'One quotation, invented for this page, followed through one night.',
    title: home.matrix.title,
    statusLabels: { ...home.matrix.statusLabels, read: 'Read' } satisfies Record<GlassStatus, string>,
    more: 'more lines',
    controls: {
      play: 'Play the night',
      pause: 'Pause',
      replay: 'Watch it again',
      chapters: 'Hours of the night',
    },
    frames: glassFrames,
    floor: 'Floor',
    sheet: glassSheet,
  },

  sources: {
    scattered: {
      headline: 'Six sources that never meet.',
      /** Ends on the licence for everything drawn below it. */
      lede: 'Everything one quotation needs is already written down, in six places that do not talk to each other. The six on this page are invented.',
    },
    gathered: {
      headline: 'Now they meet.',
      lede: 'Incillum is being built to read all six onto one sheet, with every figure still tied to the page it came from.',
    },
    documents: glassDocuments,
    thread: glassThread,
    line: 'Line',
    priced: 'priced',
    held: 'held',
    against: 'against a floor of',
  },

  closing: {
    headline: home.closing.headline,
    body: home.closing.body,
    action: home.closing.action,
    writeTo: 'Or write to',
    /**
     * The morning plate: the night plate's own room at 08:04, where the film
     * ends. Described the way `nightfall.alt` describes the night — the
     * composition, not the argument — so the two read as one room, twice.
     */
    morning:
      'The same office at 08:04, photographed from inside. Grey morning daylight comes through the glass wall; the desk lamp is still on over the printed quotation, the chair behind it is empty and pushed back, and the monitor is still switched off.',
  },

  /**
   * Where the build stands, as one plain paragraph rather than three labelled
   * columns: each stage's title and its state, read off `standing` so the two
   * pages cannot disagree about what exists.
   */
  standing: standing.stages.map(({ state, title }) => `${title} is ${state.toLowerCase()}.`).join(' '),
} as const

/**
 * The contact page — a memo, not a form.
 *
 * `/contact` is where somebody who has decided to say more goes, so it can ask
 * for more than the address the home page asks for. It posts to the same
 * waitlist function and keeps the same promise: only the address is required,
 * nothing is sent to the person who wrote, and the success state says we have
 * it and will write once.
 *
 * It carries no logos, no quotations from customers and no figures, because
 * there are none. Where the page it is modelled on spends a column on proof,
 * this one spends it on what happens next — which is the only thing a stranger
 * needs before deciding to write.
 *
 * The motto is deliberately absent from this object. The success state renders
 * `brand.motto` itself, which is one of its two permitted placements.
 */
export const contact = {
  title: 'Contact — Incillum',
  description:
    'Tell us about the commercial work you carry. If it looks like a fit, we will write to arrange a call. Incillum is being built; early access is not open yet.',
  heading: 'Tell us about the work that outlasts the day.',
  steps: [
    {
      icon: 'quotation',
      text: 'We start with one job: a request for quotation, carried to a commercial decision.',
    },
    {
      icon: 'call',
      text: 'If it looks like a fit, we write once to arrange a call.',
    },
    {
      icon: 'case',
      text: 'Then one real case, run beside the way your team works today.',
    },
  ],
  status: 'In progress. Carefully built.',
  alternative: 'Prefer email?',
  back: 'Incillum',
  memo: {
    formLabel: 'Contact Incillum',
    description: 'Tell us about the work you quote. If it looks like a fit, we’ll write to set up a call.',
    requiredNote: 'Only your email is required.',
    fields: {
      email: 'Work email',
      company: 'Company',
      role: 'Your role',
      commercialWork: 'Kind of commercial work',
      quoteVolume: 'RFQs a month',
      erp: 'Current ERP',
      pain: 'What costs you most in quoting?',
    },
    skip: 'Skip this',
    submit: 'Send to Incillum',
    sending: 'Sending',
    stillSending: 'Still sending. Thanks for your patience.',
    privacy: 'Nothing is sent to you until we write. We will write once.',
    failure: {
      title: 'We couldn’t confirm delivery.',
      body: 'Your note may have arrived. Your details are still here if you need to retry or email us.',
      action: 'Email us',
    },
  },
  receipt: {
    kicker: 'Copy for your records',
    heading: 'Received.',
    body: 'We have your note. If the work looks like a fit, we’ll write once to arrange a call, and then one real case run beside the way your team works today. Nothing is sent before then.',
    reference: 'Reference',
    stamp: 'Received',
    another: 'Write another',
    home: 'Back to home',
    lead: 'Until then:',
  },
} as const
