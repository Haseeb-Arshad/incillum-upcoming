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
  /**
   * Two deliberate lines, and under them two short sentences: what happens to
   * a request, and what stays a person's. The lede named the whole arc in one
   * long sentence until the owner asked for it short on 29 October 2026; the
   * headline still carries the breadth.
   */
  headline: 'Intelligence for commercial work.',
  headlineStart: 'Intelligence for',
  headlineEnd: 'commercial work.',
  lede: 'Every request read, priced and checked the moment it lands. The decisions stay yours.',
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
    body: 'A confirmation lands against the largest line: lead time out by three weeks, unit cost up six per cent. It is filed against the line it belongs to and the quotation is recalculated on the spot, so by morning the change is a number on the sheet rather than a discovery on Thursday.',
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
  lede: 'Incillum moves the work forward within the limits you set. Ambiguity, approvals, commercial policy and missing evidence bring the decision back to you.',

  points: [
    {
      title: 'Ambiguity',
      body: 'When the evidence does not settle which part, which price or which date, nothing is chosen. The line is held with the question narrowed to the one thing it needs from a person. It is not returned as a shrug, and it is not settled on the balance of probability.',
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
 * close up, and it is why that quotation misses its floor. It is the line the
 * matrix marks as moved and the one /glass lays on the desk, and a test holds
 * all three to one line, one part and one cost. Every figure below is exact
 * rather than plausible:
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
    sourceReference: 'Supplier confirmation SC-4471 · 03:42',
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
        { term: 'Customer RFQ 8841', value: 'Line 14: part, quantity, delivery week.' },
        {
          term: 'Framework agreement',
          value:
            'The terms this customer is quoted under, and the floor that applies to them.',
        },
        {
          term: 'Supplier confirmation SC-4471',
          value: 'Received 03:42. Unit cost and lead time, superseding the price list.',
        },
        {
          term: 'Price list, February',
          value: 'The unit cost this line was carrying until 03:42.',
        },
      ],
    },

    finding: {
      label: 'Finding',
      body: 'The supplier confirmation moves two things on one line: unit cost from EUR 128.00 to EUR 135.68, a rise of six per cent, and lead time from 21 days to 42. The price list is not wrong; it has been out of date since 03:42.',
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
      body: 'A customer request, in whatever form it turned up in (an RFQ document, a drawing pack, a spreadsheet, or a paragraph in the body of an email), together with the supplier answers and price changes that land against it afterwards.',
    },
    {
      title: 'What happens to it',
      body: 'It is read into lines. Parts are matched, quantities and dates are pulled through, costs are taken from the most recent thing that says what they are, and the margin is calculated against the policy that applies to that customer. What cannot be settled on the evidence is held rather than guessed.',
    },
    {
      title: 'What comes back',
      body: 'A quotation ready for a person to decide on, with the working attached and the held lines named. Not a draft to check line by line, and not a decision already taken.',
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
    body: 'Data location, encryption, internal access and audit arrangements are being settled with the first group of teams. We will explain the current setup before you decide whether to share a case.',
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
    'Quotes are complex enough that preparing one is real work: parts to match, drawings to read, options to price.',
    'Suppliers move your costs and lead times while a quotation is still open.',
    'Margin is governed: there is a floor, an approval, or somebody whose signature is needed under a certain number.',
    'The answer has to end up somewhere: a CRM, an ERP, a quotation document a customer will hold you to.',
  ],

  /** What actually happens next. The same promise as `hero.assurance`, once more, in full. */
  nextLabel: 'What happens next',
  next: 'A call first, so we understand how you quote today. Then, if it fits, one real case run alongside your existing process, for you to compare, with no commitment and no payment. We won’t ask you to change anything to find out whether this is useful.',
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
 * A straight line between the name and the description, by the owner's call
 * of 29 October 2026: no dash in anything a reader sees.
 */
export const seoCopy = {
  title: 'Incillum | Intelligence for commercial work',
  description:
    'Incillum reads every request for quotation the moment it lands, prices each line, checks the margin, and brings a person in for the decision. Request early access.',
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
 * The front page's shared copy: its head, its navigation, the quotation used
 * by the handover and retained spreadsheet components, and the close the
 * presentation reads. The product film and sourced case have their own copy.
 *
 * The front page is the presentation (`glass` below, `components/glass-page.tsx`).
 * What lives here is what more than one surface reads: the masthead's links and
 * button, the matrix the handover and retained spreadsheet components draw,
 * and the close's headline, body and action.
 *
 * ── Shaped like the pages it is measured against, proved differently ───────
 *
 * The front page follows the product film with a sourced case, six trust
 * commitments, the questions and the close. Its evidence is published research,
 * not customer proof or Incillum performance data (AGENTS.md §5).
 *
 * ── The matrix is illustrative, and reconciles ─────────────────────────────
 *
 * `matrix` below is the quotation's twenty lines as the film's sheet sets them:
 * eighteen priced, two held — one because a part number matches three
 * catalogue entries, one because a customer drawing carries no revision — and
 * one line whose cost moved when a supplier confirmation arrived at 03:42.
 * That line is 14, the flanged housing the evidence document takes apart and
 * the largest line on the quotation, which is what the thread calls it.
 * Its money is not written here. It is read off the thread's 06:50 ledger, so
 * the two cannot disagree. `content/site.test.ts` counts the rows below against
 * the totals and the totals against the thread's own prose.
 *
 * No price per line. A line price would be twenty more figures to keep true and
 * would not tell a stranger anything the status and the evidence do not.
 */
export type MatrixStatus = 'priced' | 'changed' | 'held'

export const home = {
  /**
   * The masthead's links. Every one lands on something that exists — a section
   * on this page or the contact memo — because a link to a page that is not
   * there is a promise this site would be breaking in its first line.
   */
  nav: { how: 'The case', trust: 'Trust', questions: 'Questions', contact: 'Contact' },
  /** The way back up, at the end of the footer's links: not a section, so not in `nav`. */
  top: 'Back to top',
  cta: 'Request early access',
  emailPlaceholder: 'Your work email',

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
      {
        line: '01',
        item: 'Machined bracket, 6061-T6',
        status: 'priced',
        evidence: 'Framework agreement, schedule B',
      },
      {
        line: '02',
        item: 'Cast housing, A380',
        status: 'priced',
        evidence: 'Supplier price list, page 4',
      },
      {
        line: '04',
        item: 'Bearing seat, catalogue part',
        status: 'held',
        evidence:
          'Part number matches three catalogue entries; only the tolerance separates them',
      },
      {
        line: '05',
        item: 'Gasket set',
        status: 'priced',
        evidence: 'Framework agreement, schedule B',
      },
      {
        line: '06',
        item: 'Cover plate, laser cut',
        status: 'priced',
        evidence: 'Supplier price list, page 9',
      },
      {
        line: '11',
        item: 'Sensor mount, customer drawing',
        status: 'held',
        evidence: 'Drawing carries no revision',
      },
      {
        line: '14',
        item: 'Flanged housing, machined',
        status: 'changed',
        evidence:
          'Supplier confirmation at 03:42: unit cost up six per cent, lead time out three weeks',
      },
    ] satisfies ReadonlyArray<{
      line: string
      item: string
      status: MatrixStatus
      evidence: string
    }>,
    more: { count: 13, text: 'more lines priced, each with its source attached' },
  },

  closing: {
    headline: close.headline,
    body: 'If there is an RFQ that lands on a Friday evening, or a quotation that is always waiting on one number from one supplier, that is the conversation we want to have.',
    action: 'Tell us about the work',
  },

  title: seoCopy.title,
  description:
    'Every request for quotation read, priced and checked the moment it lands, with the decisions left to a person. Request early access.',
} as const

/**
 * How it works — four tabs, one quotation. Retained as an unplaced section;
 * the current front page's product film already shows these steps.
 *
 * ── The tabs are the boundaries ────────────────────────────────────────────
 *
 * The section the reference pages fill with product modules. This product has
 * one job, so its tabs are the four things that happen to one request — read,
 * hold, price, decide — and each one ends on the place it stops. Those are the
 * four entries of `boundary`, once each, named by their titles here and read
 * from there: a stranger who clicks through the tabs has read "where it stops"
 * without being handed a list of limits.
 *
 * ── Nothing here is a figure ───────────────────────────────────────────────
 *
 * Every number the panels show — the cost before and after, the margins, the
 * floor, the shortfall, the price at the floor — is read by the component off
 * `evidence`, the 06:50 ledger and the documents on the desk. The words below
 * name what happens; a test fails the moment one of them carries a figure.
 *
 * Each step is pinned to an hour of the thread, so the tabs and the film can
 * never tell the night in a different order.
 */
export type HowKey = 'read' | 'hold' | 'price' | 'decide'

export interface HowStep {
  key: HowKey
  /** The tab's own name: one word. */
  tab: string
  /** The beat of the thread the step happens in. */
  at: string
  title: string
  line: string
  /** The `boundary` point the step ends on, by its title. */
  stops: string
  stopsLine: string
}

const howSteps: ReadonlyArray<HowStep> = [
  {
    key: 'read',
    tab: 'Read',
    at: '00:06',
    title: 'Every line, from what arrived.',
    line: 'A PDF, drawing pack, spreadsheet or email, read into parts, quantities, dates and terms.',
    stops: 'Missing evidence',
    stopsLine: 'What the request does not say is flagged, never filled in.',
  },
  {
    key: 'hold',
    tab: 'Hold',
    at: '01:18',
    title: 'What cannot be settled is held.',
    line: 'One part matches three catalogue entries, and only the tolerance separates them. Nothing is chosen.',
    stops: 'Ambiguity',
    stopsLine: 'The line waits for a person, with the question narrowed to one thing.',
  },
  {
    key: 'price',
    tab: 'Price',
    at: '03:42',
    title: 'Costs carried through to margin.',
    line: 'A supplier answer arrives: six per cent up, three weeks later. The margin is recalculated.',
    stops: 'Commercial policy',
    stopsLine: 'The floor is checked on every line, and never argued down.',
  },
  {
    key: 'decide',
    tab: 'Decide',
    at: '08:04',
    title: 'A decision, not an investigation.',
    line: 'Eighteen lines priced, two lines held, and one call that is yours to make.',
    stops: 'Approval',
    stopsLine: 'Nothing is sent and no price is committed until a person picks one.',
  },
]

export const how = {
  anchor: 'how',
  headline: 'From request to decision.',
  lede: 'Four steps through one quotation, each stopping exactly where a person should take over.',
  tabsLabel: 'Steps of one quotation',
  stopsLabel: 'Where it stops',
  steps: howSteps,

  /** The panels' own words. Their figures are the evidence document's and the ledger's. */
  panels: {
    read: {
      title: 'Read into lines',
      fields: { request: 'Request', terms: 'Terms', lines: 'Lines', due: 'Due' },
    },
    price: {
      quoted: 'Quoted at',
    },
    decide: {
      options: [
        {
          key: 'keep',
          title: 'Keep the price',
          detail: 'and accept the lower margin on the largest line',
        },
        {
          key: 'floor',
          title: 'Price to the floor',
          detail: 'and go back to the supplier on the lead time',
        },
        { key: 'split', title: 'Split the quantity', detail: 'across both' },
      ],
      quotation: 'The whole quotation',
    },
  },
} as const

/**
 * Data and trust.
 *
 * The reference page's six cards of protection: a glyph on a tile, a title and
 * one line. Present tense, on the owner's decision of 22 October 2026 — the
 * product is being built and the page says what it does. Where the platform
 * does not do something yet, `requirements/README.md` says so, and that file
 * is the place for it, not the card.
 *
 * Two lines never move: no certification is named, because none is held, and
 * no customer, usage figure or date is stated. `site.test.ts` holds both.
 */
export type TrustGlyph =
  'training' | 'sending' | 'approval' | 'record' | 'source' | 'separate' | 'key' | 'test'

export interface TrustCommitment {
  glyph: TrustGlyph
  title: string
  body: string
}

export const trust = {
  anchor: 'trust',
  headline: 'Nothing leaves without you.',
  lede: 'Your prices, costs and margins stay inside your organisation. Charlie works on them there, and anything that would go out stops for a person first.',
  /**
   * The boundary, drawn: what comes in, what stays inside with Charlie, the
   * path to model training that does not exist, the one way out through a
   * person, and what goes out once they say yes. Its words are here. The
   * emails, the people, the file marks, the figures and the approval are the
   * example quotation's, read by the component from the documents, the
   * evidence document and the channel (`charlie.scene`).
   */
  diagram: {
    label:
      'Customer requests and supplier answers arrive by email. Prices, costs, agreements and quotations stay inside your organisation, where Charlie works on them. None of it is used to train a model. The only way out is a person’s approval, after which the quotation and the supplier request are sent.',
    comes: 'Comes in',
    inside: 'Your organisation',
    insideNote: 'Charlie works here, on your figures',
    data: [
      { kind: 'sheet', label: 'Price lists' },
      { kind: 'sheet', label: 'Costs' },
      { kind: 'doc', label: 'Agreements' },
      { kind: 'pdf', label: 'Quotations' },
    ] satisfies ReadonlyArray<{ kind: FileKind; label: string }>,
    guards: [
      { glyph: 'separate', label: 'Isolated by organisation' },
      { glyph: 'key', label: 'Credentials sealed' },
      { glyph: 'record', label: 'Every decision recorded' },
    ] satisfies ReadonlyArray<{ glyph: TrustGlyph; label: string }>,
    training: 'Model training',
    never: 'Never',
    gate: 'The only way out',
    goes: 'Goes out',
    out: [
      { person: 'buyer', label: 'Quotation', status: 'Sent' },
      { person: 'supplier', label: 'Supplier request', status: 'Sent' },
    ] satisfies ReadonlyArray<{ person: PersonKey; label: string; status: string }>,
  },
  commitments: [
    {
      glyph: 'training',
      title: 'No model training',
      body: 'Your requests, costs, prices and correspondence are never used to train or fine-tune a model.',
    },
    {
      glyph: 'sending',
      title: 'Approved before it goes',
      body: 'No quotation, request or document is sent, and no price committed, until a person approves it.',
    },
    {
      glyph: 'separate',
      title: 'Kept to your organisation',
      body: 'Each organisation’s records are isolated in the database itself, and every request is checked against the organisation it comes from.',
    },
    {
      glyph: 'record',
      title: 'A record of every decision',
      body: 'Who approved what, and when, is kept with the work it belongs to and cannot be rewritten.',
    },
    {
      glyph: 'source',
      title: 'Every figure cited',
      body: 'A price is always shown with the document and the place on the page it came from.',
    },
    {
      glyph: 'key',
      title: 'Credentials sealed',
      body: 'Connection credentials are encrypted with AES-256-GCM and bound to the organisation they belong to.',
    },
  ] satisfies ReadonlyArray<TrustCommitment>,
} as const

/**
 * Questions.
 *
 * Where the reference pages put their testimonials. There is nobody to quote,
 * so the section answers what a commercial director asks before leaving an
 * address — in full, in the page's HTML, with nothing folded away behind a
 * click. Three of the answers are copy this site has already committed to and
 * are read from where it lives, so they cannot drift.
 *
 * The answers keep the house tense: what the product will do is being built;
 * what has been decided is said flatly.
 */
export const questions = {
  anchor: 'questions',
  headline: 'What you’ll want to know.',
  lede: 'The things a careful buyer asks first, answered straight.',
  more: {
    title: 'Something we haven’t covered?',
    body: 'Write to us and a person will answer.',
    action: 'Write to us',
  },
  items: [
    {
      key: 'who',
      question: 'Who is it for?',
      answer:
        'Teams that quote for a living. Parts to match, drawings to read, suppliers whose prices move while the quote is open, and a margin somebody has to sign off.',
    },
    {
      key: 'sends',
      question: 'Does it send quotations?',
      answer:
        'Not by itself. It prepares the quotation and all the working behind it, and nothing goes to your customer until a person approves it.',
    },
    {
      key: 'suppliers',
      question: 'Does it contact our suppliers?',
      answer:
        'Only with your approval. Charlie drafts a request for a firm price and lead time to the suppliers you have approved, and files each answer against the line it belongs to. Nothing is sent until a person approves it.',
    },
    {
      key: 'held',
      question: 'What happens to a line it can’t resolve?',
      answer:
        'It is held, never guessed. The question is narrowed to the one thing it needs from a person, and the rest of the quotation carries on.',
    },
    {
      key: 'training',
      question: 'Is our data used to train models?',
      answer: `No. ${access.decided.body}`,
    },
    {
      key: 'systems',
      question: 'Which systems does it work with?',
      answer:
        'Tell us which ones you use; the contact form asks. Connections are set up with each team.',
    },
    {
      key: 'access',
      question: 'What does early access involve?',
      answer: earlyAccess.next,
    },
  ],
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
export type GlassSource =
  'request' | 'drawing' | 'catalogue' | 'prices' | 'agreement' | 'supplier'

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
    chips: [{ target: '14', source: 'supplier', text: 'Supplier confirmation · 03:42' }],
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
    '01': {
      category: 'Machined',
      quantity: '400',
      rate: { from: 'agreement', part: 'BR-6061' },
    },
    '02': {
      category: 'Cast',
      quantity: '250',
      rate: { from: 'prices', part: 'CH-A380' },
    },
    '04': { category: 'Catalogue', quantity: '600' },
    '05': {
      category: 'Sealing',
      quantity: '1,000',
      rate: { from: 'agreement', part: 'GS-12' },
    },
    '06': {
      category: 'Sheet metal',
      quantity: '300',
      rate: { from: 'prices', part: 'CP-LC3' },
    },
    '11': { category: 'Machined', quantity: '150' },
    '14': {
      category: 'Machined',
      quantity: '1,200',
      rate: { from: 'prices', part: 'FH-6082' },
    },
  },
} as const satisfies {
  columns: Record<string, string>
  all: string
  lines: Record<
    string,
    {
      category: string
      quantity: string
      rate?: { from: 'prices' | 'agreement'; part: string }
    }
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
 * moves line 14's cost by exactly six per cent and its lead time by exactly
 * three weeks, from the evidence document's own figures. The floor in the
 * agreement is not written here: the component reads it off the ledger, so the
 * clause and the figure cannot disagree.
 *
 * Each carries the one question a person would ask of it at 23:47. They are the
 * same questions the held lines are narrowed to, asked by hand.
 */
const glassDocuments = {
  request: {
    title: 'Shared mailbox',
    at: '23:47',
    subject: 'RFQ 8841, framework agreement',
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
      {
        part: 'FH-6082',
        description: 'Flanged housing, machined',
        cost: '128.00',
        lead: '21 d',
      },
      {
        part: 'CP-LC3',
        description: 'Cover plate, laser cut',
        cost: '6.90',
        lead: '10 d',
      },
      { part: 'SR-20', description: 'Spacer ring', cost: '1.85', lead: '7 d' },
      { part: 'LP-6', description: 'Locating pin', cost: '0.62', lead: '7 d' },
    ],
    /** The row the supplier is about to change. A test holds it to the confirmation. */
    moving: 'FH-6082',
    /** The second tab is drawn open, and it is the one the moving row is kept on. */
    tabs: ['Shafts', 'Housings', 'Plates'],
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
    item: 'Flanged housing, machined',
    changes: [
      { term: 'Unit cost', was: '128.00', now: '135.68' },
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
 * moves line 14. Declared rather than inferred, for the reason `ThreadBeat`
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
  {
    key: 'drawing',
    title: 'Drawing pack',
    line: '11',
    text: 'No revision on the drawing',
    status: 'held',
  },
  {
    key: 'catalogue',
    title: 'Catalogue',
    line: '04',
    text: 'Three entries match the part',
    status: 'held',
  },
  {
    key: 'prices',
    title: 'Supplier price list',
    text: 'Unit costs for the priced lines',
    status: 'priced',
  },
  { key: 'agreement', title: 'Framework agreement', text: 'Margin floor', floor: true },
  {
    key: 'supplier',
    title: 'Supplier confirmation',
    line: '14',
    text: 'Six per cent up, three weeks later',
    status: 'changed',
  },
]

export const glass = {
  title: 'Incillum | One request, one night',
  description:
    'One request for quotation, carried through one night and handed back to a person by morning: what Incillum does, in one night.',

  /**
   * Three short beats: a belief about intelligence, the work it serves, and
   * Charlie's introduction. These are Incillum's own words. The hero then
   * names the wider commercial scope; the film keeps the approval boundary.
   */
  opening: [
    'Intelligence should move work forward.',
    'From request to decision.',
    'Meet Charlie.',
  ],

  /** The masthead's links: this page's own sections and the contact memo, and the one button. */
  nav: home.nav,
  top: home.top,
  cta: home.cta,

  hero: {
    headlineStart: hero.headlineStart,
    headlineEnd: hero.headlineEnd,
    lede: hero.lede,
    assurance: hero.assurance,
    watch: 'Watch the film',
  },

  film: {
    /** The licence, as the frame's first line: a sentence, not a label. */
    licence: 'One quotation, followed through one night.',
    title: home.matrix.title,
    statusLabels: { ...home.matrix.statusLabels, read: 'Read' } satisfies Record<
      GlassStatus,
      string
    >,
    more: 'more lines',
    controls: {
      play: 'Play the night',
      pause: 'Pause',
      chapters: 'Hours of the night',
    },
    frames: glassFrames,
    floor: 'Floor',
    sheet: glassSheet,
  },

  /**
   * The film under the hero (`video/product-film`): what Incillum does with a
   * request, one statement a beat, over Studio's own screens and three
   * daylight plates. It follows Studio's sample request from Halvorsen Marine,
   * the one Charlie's page follows, not this page's quotation.
   *
   * `statements` are the film's titles in the order it shows them, so the
   * section carries the same argument as text for a screen reader, a reader
   * who does not play it, or a page without JavaScript; `site.test.ts` holds
   * them to the composition word for word.
   */
  reel: {
    /** The block's first line: what the film follows, in a sentence. */
    licence:
      'One request for quotation, from the moment it lands to a quotation ready to send.',
    src: '/film/incillum.mp4',
    poster: '/film/incillum.webp',
    label:
      'A film of Incillum at work on one request for quotation, in Incillum Studio. Its statements follow.',
    statements: [
      'Every order starts with a quotation.',
      'Charlie picks it up the moment it lands.',
      'Reads everything the request depends on.',
      'Matches every line to a product you carry.',
      'Checks every figure against its source.',
      'With your approval, asks suppliers for a firm price.',
      'Compares every quote. Holds your margin.',
      'Where money moves, you decide.',
      'The quotation, ready to send.',
      'Intelligence for commercial work.',
    ],
    controls: {
      play: 'Play the film',
      pause: 'Pause the film',
      soundOn: 'Turn the sound on',
      soundOff: 'Turn the sound off',
    },
  },

  sources: {
    scattered: {
      headline: 'Six sources that never meet.',
      /** Ends on the licence for everything drawn below it. */
      lede: 'Everything one quotation needs is already written down, in six places that do not talk to each other.',
    },
    gathered: {
      headline: 'Now they meet.',
      lede: 'Incillum reads all six onto one sheet, with every figure still tied to the page it came from.',
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
    /** Over the contact memo's own three steps, which the component reads from `contact`. */
    nextLabel: earlyAccess.nextLabel,
    /**
     * The morning plate: the night plate's own room at 08:04, where the film
     * ends. Described the way `nightfall.alt` describes the night — the
     * composition, not the argument — so the two read as one room, twice.
     */
    morning:
      'The same office at 08:04, photographed from inside. Grey morning daylight comes through the glass wall; the desk lamp is still on over the printed quotation, the chair behind it is empty and pushed back, and the monitor is still switched off.',
  },
} as const

/**
 * The figures: two short sections after the film, and the only figures on the
 * site that are not the example quotation's.
 *
 * ── Whose figures ──────────────────────────────────────────────────────────
 *
 * On 29 October 2026 the owner asked for the case to be made in figures, short
 * enough to take in at a glance: speed first, because a request answered
 * within the hour is worth several answered the next day. This site still has
 * none of its own (no customers, no usage, nothing measured, AGENTS.md §5),
 * and an invented one is the claim a buyer checks first. So every figure here
 * is a third party's, about the work, with its source printed under it. None
 * is about Incillum, and none may be added without a source a reader can open.
 *
 * The long form (every figure, what it measured, and the case for the
 * company) is the private brief at /brief, which lives on the server
 * (`server/brief-content.ts`) and never reaches a page that has not been
 * unlocked. `design/2026-10-29-research.md` records how each source was
 * checked. A research publisher is named here only as a figure's source,
 * never as a system Incillum works with.
 *
 * ── The voice ──────────────────────────────────────────────────────────────
 *
 * The figures do the shouting. Labels of a few words, one sentence of lede,
 * no dash in place of a comma, and the night kept to the one place it belongs,
 * the morning at the close.
 */
export interface Source {
  key: 'hbr' | 'salesforce' | 'mckinsey'
  /** As it is printed under a figure. */
  short: string
  href: string
}

export interface Odds {
  key: string
  value: string
  label: string
  source: Source['key']
}

export const figures = {
  sources: [
    {
      key: 'hbr',
      short: 'Harvard Business Review, 2011',
      href: 'https://hbr.org/2011/03/the-short-life-of-online-sales-leads',
    },
    {
      key: 'mckinsey',
      short: 'McKinsey Quarterly, 2003',
      href: 'https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/the-power-of-pricing',
    },
    {
      key: 'salesforce',
      short: 'Salesforce, State of Sales, 2025 survey',
      href: 'https://www.salesforce.com/en-us/wp-content/uploads/sites/4/documents/reports/sales/salesforce-state-of-sales-report-2026.pdf',
    },
  ] satisfies ReadonlyArray<Source>,
  sourcesLabel: 'Sources',

  /**
   * The reference page's sunken panel on the paper: a headline, one sentence,
   * four figures, and the world in dots beside them with a note over its
   * corner. The note is the one sentence about Charlie, and it is about speed.
   */
  odds: {
    headline: 'A slow quote costs you twice.',
    lede: 'Once in the buyer who moved on, and again in the margin nobody had time to check.',
    stats: [
      {
        key: 'wait',
        value: '42h',
        label: 'Average reply among companies that replied within 30 days',
        source: 'hbr',
      },
      {
        key: 'hour',
        value: '7×',
        label: 'Nearly seven times likelier to reach a decision maker within the hour',
        source: 'hbr',
      },
      {
        key: 'never',
        value: '23%',
        label: 'Of 2,241 companies never replied at all',
        source: 'hbr',
      },
      {
        key: 'price',
        value: '8%',
        label:
          'More operating profit from a 1% higher price, volume unchanged (S&P 1500)',
        source: 'mckinsey',
      },
    ] satisfies ReadonlyArray<Odds>,
    note: 'Charlie picks up every request the moment it lands, prices it and checks the margin, so a draft is waiting for your approval while the buyer is still listening.',
    map: 'The Americas, Europe and Africa, drawn in dots.',
  },

  /**
   * The reference page's bar: Salesforce's chart of a rep's working week in
   * three parts, each as wide as its share and set large inside it. The
   * survey's own seven parts are folded into three: time with customers,
   * creating quotes and entering data by hand, and everything else.
   */
  week: {
    headline: 'Your sellers spend more of the week on paperwork than with customers.',
    lede: 'In a survey of 4,050 sales professionals, building quotes and typing figures in by hand took almost a third of the week. That is the part Charlie takes off their desk.',
    chart: 'A sales rep’s working week',
    segments: [
      { key: 'customers', label: 'With customers', share: 22 },
      { key: 'quotes', label: 'Quotes and data entry', share: 30 },
      { key: 'other', label: 'Everything else', share: 48 },
    ],
    source: 'salesforce',
  },
} as const

/**
 * The people in the example quotation, and the portraits they are drawn with.
 *
 * Invented, like the customer and the figures (`customer.example`): none is a
 * customer, a user or a member of this company, and nothing about them is a
 * claim. Their portraits are illustrated line drawings in the site's ink
 * (`public/people`), CC0 portraits from the Lorelei set by Lisa Wischofsky,
 * chosen option by option so each reads at 36px; `design/people.md` records the
 * exact choices. A photograph can replace any of them by changing its path:
 * `Avatar` takes whatever image it is given. They appear only inside the
 * drawings of the product, never as a face for the company.
 */
export const people = {
  director: { name: 'James', role: 'Sales director', portrait: '/people/james.svg' },
  sales: { name: 'Sara', role: 'Inside sales', portrait: '/people/sara.svg' },
  buyer: { name: 'Marta Keller', role: 'Purchasing', portrait: '/people/marta.svg' },
  supplier: { name: 'Tomas Berg', role: 'Supplier', portrait: '/people/tomas.svg' },
} as const

export type PersonKey = keyof typeof people

/**
 * The showcase: four panels after the case, each a scene from one request
 * that plays once as it comes into view, in the shape of the bento the owner
 * pointed at and of Hebbia's own product grid. Charlie picks the request up;
 * every figure goes back to its page; a supplier's change is carried to the
 * margin and stopped at the floor; and nothing leaves until a person says yes.
 *
 * The words below name the scenes and their steps. Every value a scene shows
 * (the email and its files, the lines, the rate and its clause, the margins,
 * the floor, the shortfall, the approval) is read by the component from the
 * documents, the matrix, the evidence document and the channel; `{tokens}`
 * are filled from them. On the server, without a script and under reduced
 * motion, each scene is drawn at its last frame.
 *
 * File marks keep their own colours here, by the owner's call of 29 October
 * 2026: they are the documents' identity, the way a reader's own desktop
 * shows them, and appear nowhere outside a drawing.
 */
export type FileKind = 'pdf' | 'sheet' | 'doc' | 'drawing' | 'mail' | 'archive'

export const showcase = {
  headline: 'Your quoting desk, without the queue.',
  lede: 'Charlie picks up every request the moment it lands, does the reading, matching and checking, and hands you only the calls that need you.',
  pickup: {
    title: 'Picks it up the moment it lands',
    body: 'No inbox to clear in the morning. Charlie opens the request, reads every attachment and gets straight to work.',
    now: 'Just now',
    picked: 'Picked up by Charlie',
    working: 'Working',
    done: 'Ready for you',
    steps: [
      'Read the email and its {files} attachments',
      'Matched {lines} lines to your catalogue',
      'Checked every price against its source',
      'Held {held} lines for a person',
    ],
    result: '{priced} lines priced. {held} need your input.',
  },
  sources: {
    title: 'Every figure, back to its page',
    body: 'Open any value and see the document, the clause and the line it came from.',
    tiles: [
      { key: 'request', label: 'Request', kind: 'mail' },
      { key: 'drawing', label: 'Drawings', kind: 'drawing' },
      { key: 'catalogue', label: 'Catalogue', kind: 'pdf' },
      { key: 'prices', label: 'Price list', kind: 'sheet' },
      { key: 'agreement', label: 'Agreement', kind: 'doc' },
      { key: 'supplier', label: 'Supplier reply', kind: 'mail' },
    ] satisfies ReadonlyArray<{ key: GlassSource; label: string; kind: FileKind }>,
    from: 'From',
  },
  floor: {
    title: 'Your floor, held',
    body: 'When a supplier’s price moves, the margin is worked out again, and a line under your floor waits for you.',
    held: 'Held for your decision',
  },
  approval: {
    title: 'Nothing leaves without your yes',
    body: 'Quotations, supplier requests, team updates and calls are prepared for you. Nothing goes out until a person approves it.',
    ready: 'Ready for review',
    files: [
      { kind: 'pdf', label: 'Quotation' },
      { kind: 'sheet', label: 'Workbook' },
      { kind: 'doc', label: 'Cover letter' },
    ] satisfies ReadonlyArray<{ kind: FileKind; label: string }>,
    actions: [
      { kind: 'ask', label: 'Supplier request' },
      { kind: 'tell', label: 'Team update' },
      { kind: 'call', label: 'Call or meeting' },
    ] satisfies ReadonlyArray<{ kind: CharlieGlyph; label: string }>,
    waiting: 'Waiting for approval',
    sent: 'Sent',
  },
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
  title: 'Contact | Incillum',
  description:
    'Tell us about the commercial work you carry. If it looks like a fit, we will write to arrange a call.',
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
    description:
      'Tell us about the work you quote. If it looks like a fit, we’ll write to set up a call.',
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

/**
 * The private brief's gate: the only words of /brief a visitor sees before
 * the password. The brief itself is server-only (`server/brief-content.ts`)
 * and is not here, because nothing in this module may be private.
 */
export const briefGate = {
  brand: 'Incillum',
  title: 'A private brief.',
  hint: 'Enter the password shared with you to read the investor and partner brief.',
  label: 'Password',
  submit: 'Open the brief',
  opening: 'Opening',
  wrong: 'That password did not match. Try again.',
  unavailable: 'This brief is not available right now.',
  failed: 'This brief could not be opened. Try again.',
} as const

/**
 * The masthead's menus — the reference pages' dropdown boxes.
 *
 * One menu — Product, with Charlie in it — a link to the contact memo, and
 * the one button. Every item lands on a page that exists and carries one line,
 * so a reader can tell where it goes before going there. Below a laptop's width
 * the same places are one sheet behind a button that says *Menu*, so the
 * Product page is as easy to find on a phone as on a desk.
 */
export interface MenuItem {
  href: string
  title: string
  line: string
}

export const menu = {
  label: 'Primary',
  groups: [
    {
      key: 'product',
      label: 'Product',
      items: [
        {
          href: '/charlie',
          title: 'Charlie',
          line: 'The agent that carries a quotation from the request to a decision.',
        },
      ],
    },
  ] satisfies ReadonlyArray<{
    key: string
    label: string
    items: ReadonlyArray<MenuItem>
  }>,
  /** Plain links beside the menus. */
  links: [{ href: '/contact', title: 'Contact' }],
  cta: 'Request early access',
  /** What the button says where the bar has no room for the whole of it. */
  ctaShort: 'Early access',
  /** The button that opens every place above as one sheet, below a laptop's width. */
  phone: 'Menu',
} as const

/**
 * Charlie — the colleague in the product, on its own page and as one act of
 * the front page.
 *
 * ── Present tense ──────────────────────────────────────────────────────────
 *
 * The page says what Charlie does, on the owner's decision of 22 October 2026.
 * What the platform does not do yet — asking suppliers, calls, Slack and
 * Teams, the customer send — is listed in `requirements/README.md`, with where
 * each stands. Every outward step is described with the approval it waits for.
 *
 * ── The conversation ───────────────────────────────────────────────────────
 *
 * The channel is one quotation's morning, RFQ 8841, told as messages between
 * Charlie and two people on the team; the front page's film plays it
 * (`charlie-film.tsx`). Its figures are not written here: `{tokens}` are filled
 * by the component from the evidence document and the 06:50 ledger, so the
 * channel cannot disagree with the film or the tabs.
 */
export type CharlieGlyph = 'read' | 'cite' | 'make' | 'tell' | 'ask' | 'call' | 'approve'

/** A step of Charlie's work on the request, and the chapter of the film that shows it. */
export interface CharlieStep {
  key: string
  /** The second of the film the chapter starts at. */
  at: number
  /** One word, for the film's chapter rail. */
  label: string
  title: string
  body: string
  /** A still of the step, cut from the same Studio page as the film. */
  still: string
  alt: string
}

export interface CharlieAbility {
  glyph: CharlieGlyph
  title: string
  body: string
}

export interface CharlieMessage {
  /** An hour of the night, or a minute of the morning after it. */
  at: string
  from: 'charlie' | 'sales' | 'director'
  /** Text with `{tokens}` the component fills from the evidence and the ledger. */
  text: string
  /** A source the message cites, by its document title. */
  cites?: string
  /** A card asking for a decision: what it is, and its two answers. */
  ask?: { title: string; detail: string; approve: string; other: string }
  /** The decision, once taken. */
  decided?: string
}

const charlieMessages: ReadonlyArray<CharlieMessage> = [
  {
    at: '03:42',
    from: 'charlie',
    text: 'A supplier confirmation arrived for line {line}: unit cost {was} → {now}, lead time {leadWas} → {leadNow}. The quotation is now at {margin}, under the {floor} floor.',
    cites: 'Supplier confirmation SC-4471',
  },
  {
    at: '08:04',
    from: 'charlie',
    text: '@Sara RFQ 8841 is ready for you: {priced} lines priced, {held} held. One call is yours: quote under the floor, or go back on the lead time.',
  },
  {
    at: '08:11',
    from: 'sales',
    text: '@Charlie ask our approved suppliers for a firm price on line {line}: {units} units, delivery in 21 days.',
  },
  {
    at: '08:11',
    from: 'charlie',
    text: 'Two approved suppliers carry {part}. The request to both is drafted. Sending it needs an approval.',
    ask: {
      title: 'Request for quotation · {part}',
      detail: '{units} units · to two approved suppliers',
      approve: 'Approve and send',
      other: 'Edit first',
    },
    decided: 'Approved by James · 08:14',
  },
  {
    at: '08:14',
    from: 'charlie',
    text: 'Sent. Each answer will be filed against line {line} and posted here.',
  },
]

export const charlie = {
  anchor: 'charlie',
  path: '/charlie',
  title: 'Charlie | Incillum',
  description:
    'Charlie, in Incillum: reads every request as it lands, puts it on one sheet, cites every figure, costs the supplier quotes, and asks a person before anything leaves.',

  /** The act on the front page: the headline, a paragraph, and the way to the page. */
  act: {
    headline: 'Charlie keeps the work moving.',
    lede: 'An agent on every quotation: it reads what arrives, cites the page, and asks the right person before anything leaves.',
    more: 'Meet Charlie',
  },

  /**
   * The film on the front page: six of Charlie's abilities, one beat each,
   * played round in a frame while it is on screen. Each beat is a title of a
   * few words and one line — the feature, not the mechanism. Every figure in
   * the frame is read from the documents, the matrix and the ledger by the
   * component, so the film writes none of its own.
   */
  film: {
    licence: 'One quotation, from the request to the approval.',
    /** Named for the film they control: the night above has its own pause. */
    controls: {
      play: 'Play Charlie',
      pause: 'Pause Charlie',
      steps: 'Charlie’s abilities',
    },
    steps: [
      {
        key: 'reads',
        title: 'Reads what arrives',
        line: 'Mail, PDFs, drawings and price lists, read into lines.',
      },
      {
        key: 'cites',
        title: 'Cites every source',
        line: 'Each figure links back to the page it came from.',
      },
      {
        key: 'holds',
        title: 'Holds what it can’t settle',
        line: 'A line it cannot settle waits for a person.',
      },
      {
        key: 'makes',
        title: 'Makes the documents',
        line: 'The quotation, ready for someone to check.',
      },
      {
        key: 'tells',
        title: 'Tells your team',
        line: 'Posts what changed in your channel.',
      },
      {
        key: 'asks',
        title: 'Asks before anything leaves',
        line: 'Nothing is sent until a person approves.',
      },
    ],
    stage: {
      reading: 'Reading',
      read: 'lines read',
      sheet: 'Read into lines',
      quotation: 'Quotation · draft',
      prepared: 'Prepared for review',
      typing: 'Charlie is writing',
      sent: 'Sent',
    },
  },

  hero: {
    eyebrow: 'Charlie, in Incillum',
    headline: 'Every request worked. Every decision yours.',
    lede: 'Charlie reads what arrives, puts it on one sheet, cites the page each figure came from and costs the supplier quotes. Then it stops, and asks the person who decides.',
    watch: 'Watch Charlie at work',
    contact: 'Tell us about the work',
  },

  /**
   * The film: Charlie at work on one request, cut from Incillum Studio's own
   * pages (`video/charlie`, rendered to `public/charlie`). It shows Studio's
   * sample workspace — Halvorsen Marine's RFQ 1907 — not the front page's RFQ
   * 8841, and its figures are Studio's. Each step below is also a chapter of
   * the film: `at` is the second it starts, and agrees with
   * `video/charlie/cues.js`.
   */
  reel: {
    src: '/charlie/charlie-at-work.mp4',
    poster: '/charlie/charlie-at-work.webp',
    duration: 50,
    label:
      'Charlie at work in Incillum Studio. A request for quotation arrives by email at 23:47. Charlie reads the email and its attachments, puts twenty lines onto one sheet, cites the source of every figure, costs five supplier quotes, stops below the commercial floor to ask a person, and sends the quotation once it is approved.',
    controls: {
      play: 'Play the film',
      pause: 'Pause the film',
      soundOn: 'Turn the sound on',
      soundOff: 'Turn the sound off',
      chapters: 'Chapters of the film',
      watch: 'Watch this step',
    },
  },

  steps: {
    headline: 'One request, start to finish.',
    lede: 'A request for quotation from Halvorsen Marine, in Incillum Studio: twenty lines, five supplier quotes, and one decision that belongs to a person.',
    items: [
      {
        key: 'reads',
        at: 5.7,
        label: 'Reads',
        title: 'Reads it the moment it lands',
        body: 'The email, the PDF and the spreadsheet are read as they arrive, at 23:47 as readily as at noon. A change in the covering note is found, not missed.',
        still: '/charlie/steps/reads.webp',
        alt: 'The request’s PDF in Incillum Studio: the text Incillum extracted, and each fact it read with the page it came from.',
      },
      {
        key: 'populates',
        at: 15.4,
        label: 'Populates',
        title: 'Every line onto one sheet',
        body: 'Part, manufacturer, quantity and date for all twenty lines, each cell tied to the row of the bill of materials it was read from.',
        still: '/charlie/steps/populates.webp',
        alt: 'The review of the request in Incillum Studio: twenty lines with part, manufacturer, description, quantity and date.',
      },
      {
        key: 'cites',
        at: 20.9,
        label: 'Cites',
        title: 'Every figure cites its source',
        body: 'Open any cell to see where it came from: the sheet and the cell, the email and the sentence. When two sources disagree, Charlie says so and asks.',
        still: '/charlie/steps/cites.webp',
        alt: 'A finding in Incillum Studio: the sheet says 84 and the covering email says 60, each with its source.',
      },
      {
        key: 'costs',
        at: 26.6,
        label: 'Costs',
        title: 'Supplier quotes, compared and costed',
        body: 'Five supplier quotations, compared for the lines each one covers, the quantity it assumes and what it costs, with the one it could not read named.',
        still: '/charlie/steps/costs.webp',
        alt: 'Supplier intelligence in Incillum Studio: five supplier sources, their coverage and the current cost basis.',
      },
      {
        key: 'asks',
        at: 31.0,
        label: 'Asks',
        title: 'Stops at your floor, and asks',
        body: 'Below your commercial floor, Charlie stops and asks the person with the authority, with the margin, the gap and the total in front of them.',
        still: '/charlie/steps/asks.webp',
        alt: 'An approval in Incillum Studio: the margin against the floor, the gap, and the reason the approver gives.',
      },
      {
        key: 'sends',
        at: 38.3,
        label: 'Sends',
        title: 'Sends once you approve',
        body: 'The approved quotation goes out with its record: what arrived, what was read, what was asked, and who decided, when.',
        still: '/charlie/steps/sends.webp',
        alt: 'The quotation delivered, with the record of the night: each step and its time.',
      },
    ] satisfies ReadonlyArray<CharlieStep>,
  },

  scene: {
    /** The licence, as the scene's first line. */
    licence: 'One quotation’s morning, in the team’s channel.',
    channel: '#rfq-8841',
    people: {
      charlie: { name: 'Charlie', role: 'Incillum' },
      sales: people.sales,
      director: people.director,
    },
    messages: charlieMessages,
  },

  abilities: {
    headline: 'What Charlie does.',
    lede: 'Everything a quotation needs between the request and the decision, and the one thing it never does: send without a person.',
    items: [
      {
        glyph: 'read',
        title: 'Reads every document',
        body: 'The request, the drawings, the catalogue, the price list, the agreement and every supplier reply, read into lines.',
      },
      {
        glyph: 'cite',
        title: 'Cites the page',
        body: 'Every figure is shown with the document and the place it came from. A figure with no source is reported as missing.',
      },
      {
        glyph: 'make',
        title: 'Makes the documents',
        body: 'Takes a PDF or a spreadsheet and makes the quotation, a workbook or a chart from it, for a person to check.',
      },
      {
        glyph: 'tell',
        title: 'Tells your channel',
        body: 'Posts what changed and what needs someone in Slack, Teams or by email, and answers when it is mentioned.',
      },
      {
        glyph: 'ask',
        title: 'Asks approved suppliers',
        body: 'Drafts a request for a firm price and lead time to the suppliers you have approved, and sends it once someone approves.',
      },
      {
        glyph: 'call',
        title: 'Calls and books',
        body: 'Calls a supplier to confirm a price or a date, and books the meeting, with the call’s notes filed against the line.',
      },
      {
        glyph: 'approve',
        title: 'Asks before anything leaves',
        body: 'No request, quotation or document leaves without a person’s approval, and every approval is kept with the work.',
      },
    ] satisfies ReadonlyArray<CharlieAbility>,
  },

  /**
   * What Charlie is besides the film (29 October 2026). The film shows one
   * request worked; the page under it said the same six steps again, and the
   * owner asked for something different: Charlie as an agent. So this is who it
   * talks to and how, and where it stops.
   *
   * - `talk`: Charlie is spoken to. The channel beside it is `charlie.scene`,
   *   the morning's messages as they were, so its figures are the thread's and
   *   none is written here.
   * - `reach`: the people the work depends on, each with what is needed before
   *   anything outward happens (nothing does without a person: AGENTS.md §5).
   * - `limits`: what it does alone, what waits for a person, what it never does.
   *
   * It writes no figure, names no system and uses none of the words a page may
   * not (`site.test.ts`).
   */
  agent: {
    talk: {
      headline: 'Talk to Charlie like a colleague.',
      lede: 'It lives in the channel your team already uses. Ask it in plain words and it does the work, says what it found, and asks the person who decides before anything leaves.',
      points: [
        {
          glyph: 'tell',
          title: 'Answers when it is mentioned',
          body: 'Ask about a line, a margin or a supplier. It answers from the documents, with the page each figure came from.',
        },
        {
          glyph: 'ask',
          title: 'Takes instructions in plain words',
          body: 'Tell it to get a firm price on a line. It drafts the request and puts it in front of a person first.',
        },
        {
          glyph: 'approve',
          title: 'Says who it needs',
          body: 'It names the person with the authority and shows them the decision: the figure, the gap and the choice.',
        },
      ] satisfies ReadonlyArray<CharlieAbility>,
      /** The channel's header, and what a message that is waiting on someone says. */
      members: 'In this channel',
      waiting: 'Waiting for',
    },
    reach: {
      headline: 'Who Charlie talks to.',
      lede: 'Your team, your suppliers and, when a call is quicker, the telephone. Whatever leaves, leaves with a person’s approval.',
      items: [
        {
          key: 'team',
          glyph: 'tell',
          title: 'Your team',
          body: 'Posts what changed and what needs someone, in the channel they already read, and answers when it is mentioned.',
          waits: 'In your own channel',
        },
        {
          key: 'suppliers',
          glyph: 'ask',
          title: 'Your suppliers',
          body: 'Drafts a request for a firm price and lead time to the suppliers you have approved, and files each reply against the line it answers.',
          waits: 'Sent once a person approves',
        },
        {
          key: 'phone',
          glyph: 'call',
          title: 'The telephone',
          body: 'Calls a supplier to confirm a price or a date, and books the meeting, with the call’s notes filed against the line.',
          waits: 'Called once a person approves',
        },
      ] satisfies ReadonlyArray<{
        key: 'team' | 'suppliers' | 'phone'
        glyph: CharlieGlyph
        title: string
        body: string
        waits: string
      }>,
      /** The call, in the drawing: what it is for, and where its notes go. */
      call: { label: 'Call', purpose: 'Confirm the cost and the lead time', filed: 'Notes filed to line {line}' },
    },
    limits: {
      headline: 'Where Charlie stops.',
      lede: 'Some of the work is Charlie’s alone. Anything that leaves, or commits money, waits for a person. And three things it never does at all.',
      columns: [
        {
          key: 'alone',
          title: 'On its own',
          items: [
            'Reads every document',
            'Matches each line to a product',
            'Does the arithmetic, in whole cents',
            'Checks the margin floor on every line',
            'Drafts the quotation and the messages',
          ],
        },
        {
          key: 'asks',
          title: 'After a person says yes',
          items: [
            'Sends a request to a supplier',
            'Calls a supplier or books a meeting',
            'Sends the quotation',
            'Commits a price',
          ],
        },
        {
          key: 'never',
          title: 'Never',
          items: [
            'Estimates a figure it cannot source',
            'Settles a line the evidence cannot',
            'Sends or commits without an approval',
            'Trains a model on your data',
          ],
        },
      ] satisfies ReadonlyArray<{
        key: 'alone' | 'asks' | 'never'
        title: string
        items: ReadonlyArray<string>
      }>,
    },
  },

  close: {
    headline: 'Bring Charlie your hardest quotation.',
    body: 'Tell us the request that always arrives late, and the people who have to see it. We will show you where Charlie would stop.',
    action: 'Tell us about the work',
  },
} as const
