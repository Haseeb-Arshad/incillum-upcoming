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
 *      finance runs itself. The product's argument is that a person stays in
 *      the loop exactly where the loop matters; the copy has to make that
 *      argument rather than undercut it.
 *
 * ── On naming systems ──────────────────────────────────────────────────────
 *
 * NetSuite, Sage Intacct, Xero, Outlook and Gmail appear by name below. That is
 * deliberate, and it sits inside rule 1 rather than against it: every mention
 * is inside a block whose lede has already put it in the future — these are the
 * systems the operator is being *built against*, which is a specification, not
 * an availability claim. Nowhere on this page does a system name appear next to
 * a verb in the perfect tense, and none of them may become a logo, a badge, or
 * an "integrations" row. Delete one of those ledes and the names below become
 * the exact claim AGENTS.md §5 forbids.
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
   *
   * The masthead no longer prints it at all. The chip beside the wordmark was
   * the only place on the page that announced a stage instead of describing the
   * work, and the page is stronger with the wordmark standing on its own.
   */
  access: 'Early access',
} as const

export const hero = {
  /**
   * The eyebrow carries the stage now.
   *
   * A visitor should know what state they have walked into before they scroll.
   * The alternative — finding out six screens down at `standing` — means
   * everything above it is read as the copy of a shipped product and then
   * retroactively discounted, which is the most expensive way to tell somebody
   * the truth. "In build" is a state, not a calendar; AGENTS.md §5 is why the
   * month that wants to go here never will.
   *
   * This is not the PRIVATE PREVIEW chip coming back. That sat beside the
   * wordmark, announcing a stage instead of doing a job. This one is inside the
   * argument, one line above the thesis it qualifies.
   */
  eyebrow: 'Finance operations · In build',
  /**
   * The whole site in five words.
   *
   * "Keep office hours" does two jobs at once — it is what a person does, and
   * it is the one thing the work refuses to do — which is the argument the rest
   * of the page has to make anyway. Every alternative said *24/7*, and a number
   * in a headline is a specification, not a thesis.
   */
  headline: 'Finance work doesn’t keep office hours.',
  lede: 'Incillum is building an AI coworker for finance operations. It works invoice intake, matching and exceptions inside the systems your team already runs — through the night, and it brings a person in when the call is theirs.',
  /**
   * Who this is for, in one line, naming systems and a volume.
   *
   * Without it, "finance teams" means everybody, which means nobody reads on
   * looking for themselves. Two named systems and a range let a controller
   * decide in about a second whether the rest of the page is addressed to them
   * — and the ones who decide it is not were never going to be worth an email.
   *
   * The volume describes the audience, not the software. Nothing here says how
   * many of anything gets processed, or how well.
   */
  qualifier:
    'Built for finance teams running roughly 500 to 5,000 supplier invoices a month on NetSuite, Sage Intacct or Xero.',
  /**
   * Sits under the form.
   *
   * It used to promise one email, eventually — which turned the form into a
   * bookmark. Nothing to decide, nothing to expect, no reason to do it today
   * rather than never. It now says what the first group actually gets, which is
   * the same thing `standing` already commits to three screens further down: a
   * call, then one workflow run beside the way the team does it now.
   *
   * That is a real promise made to a stranger, so the two sentences are the
   * whole of it. No pilot fee, no commitment, and still no newsletter.
   */
  assurance:
    'The first group gets a call, then one workflow run alongside the way you do it today — no commitment, no payment. No newsletter, no drip sequence.',
} as const

/**
 * The instrument.
 *
 * A working day is nine hours. The other fifteen are the product's entire
 * reason to exist, so they are drawn at the same scale rather than described.
 *
 * ── The inversion, which is the second version of this plate ───────────────
 *
 * The first version shaded the nine hours somebody is at a desk, and captioned
 * itself from the reader's clock: *your team is at their desks* by day,
 * *nobody is at their desks* at night. Which meant that for the whole of a
 * working day — the hours most visitors actually arrive in — the one live
 * element on the page opened by arguing the opposite of the page's thesis. A
 * controller reading at 16:28 was told, by the drawing, that everything was
 * covered.
 *
 * So the shading moved onto the fifteen hours, and the caption stopped
 * depending on the hour. It now says the same true thing at any time of day and
 * the reader's mark simply lands inside the shaded mass or in the gap. The mark
 * is still the reader's own clock, because a diagram somebody can check against
 * their own wrist is the only kind that gets checked at all.
 */
export const instrument = {
  label: 'The hours nobody is in',
  headline: 'Fifteen hours a day, the work is on its own.',
  lede: 'Invoices arrive, cut-offs approach and exceptions collect against a team that is asleep. That is the shift we are building the operator to take.',

  /** Local hours the office is treated as occupied. Inclusive of `from`, exclusive of `to`. */
  officeHours: { from: 9, to: 18 },

  /** The nine hours: the one gap in the rule, left bare. */
  occupiedLabel: 'Your team',
  /** The fifteen: shaded, and named once beneath the plate. */
  uncoveredLabel: 'The hours nobody is in',

  /**
   * The caption, and why it no longer branches.
   *
   * One sentence about the drawing, equally true at 03:20 and at 16:28,
   * followed by the reader's own time as a clause rather than as a verdict.
   * Everything before the clause is in the server's HTML; only the clause waits
   * for a browser, so the plate reads correctly with no JavaScript at all.
   */
  caption: 'Fifteen of these twenty-four hours have nobody in them.',
  /** Completes the caption once the browser has a clock. */
  captionLocalPrefix: 'It is ',
  captionLocalSuffix: ' where you are.',
  /** Server-rendered stand-in — the server cannot know where the reader is. */
  unknownTime: 'Reading the clock on your device.',

  /**
   * Three shifts, each a real piece of finance operations work, each stated as
   * intent. The times illustrate *when the work arrives*; they are not claims
   * about anything the software has done.
   */
  shifts: [
    {
      at: '23:40',
      title: 'An invoice lands after the last person has logged off.',
      body: 'Read, coded to the right account and cost centre, and matched against the purchase order and the goods receipt. If the three agree it is ready to post. If they do not, it becomes an exception with the discrepancy already written down.',
    },
    {
      at: '03:15',
      title: 'A payment run has to be ready for the morning cut-off.',
      body: 'Assembled, checked against the vendor master and the duplicate history, then split into the batch that is clean and the batch that needs somebody. Nothing is released — releasing money is a person’s decision, by design.',
    },
    {
      at: '06:50',
      title: 'The exception nobody has looked at gets chased.',
      body: 'The supplier is asked for what is missing, the reply is filed against the case, and the evidence is attached. By the time the team is back it is a decision rather than an investigation.',
    },
  ],
} as const

/**
 * The outline: what it will do, and how you direct it.
 *
 * ── Why this is five lines and not ten ─────────────────────────────────────
 *
 * It was ten — five capabilities against five notes on interaction, in two
 * columns of equal weight. Ten blocks of the same size in the middle of a page
 * is not a specification, it is a wall, and a reader skims a wall. The five
 * that survived are the ones carrying the argument: it reads what actually
 * arrives, it matches three ways, it shows the working, it stops rather than
 * guesses, and it is directed through the inbox that already exists.
 *
 * The rest were not deleted so much as folded. "Show the working" absorbed the
 * figure-level provenance; "stop rather than guess" absorbed the posting and
 * payment limits; the last entry absorbed both interaction lines, which is
 * correct — forwarding a thread and stating a rule once *are* how you direct
 * it, and they were never a separate subject.
 *
 * The full version — five capabilities, each a paragraph with a schematic
 * drawing beside it, plus a section of its own on interaction — is on the
 * `groundwork/full-capabilities` branch and belongs on the product site.
 *
 * ── The tense, and why it is safe ──────────────────────────────────────────
 *
 * The section's lede puts everything below into the future: this is what the
 * operator is *being built* to do. Once that is established, the entries can be
 * written in the plain present tense of a specification, which is how anybody
 * describes software under construction and is far easier to read than five
 * separately hedged lines.
 *
 * That contract is load-bearing, and it is the only thing licensing the system
 * names in it. Delete the lede and these entries stop being a specification and
 * start being a claim.
 *
 * The lede used to open "None of this has shipped." That sentence is gone; the
 * tense contract is not. The page says once, in `standing`, exactly what
 * exists. Saying it three times is not three times the integrity — the first is
 * candour and the third is an apology, and a reader who has been apologised to
 * twice has stopped reading a specification and started reading a disclaimer.
 *
 * ── Why every capability names a limit ─────────────────────────────────────
 *
 * Never inferred · nothing posts · no money moves · it hands the case over. The
 * reader most worth convincing is a controller whose first question about any
 * of this is "and what happens when it is wrong", and a capability list that
 * never answers it is a brochure.
 */
export const outline = {
  label: 'What it is being built to do',
  /**
   * Short enough to break in two lines at this section's measure. The longer
   * version — "The work, end to end — and how you direct it." — took three, and
   * broke across the em dash, which left "— and how you" stranded as a line of
   * its own.
   */
  headline: 'The work, and how you direct it.',
  lede: 'The specification the finance operator is being built against, in the order a piece of work moves through it — reading from the Outlook or Gmail inbox your AP team already uses, and writing into NetSuite, Sage Intacct or Xero.',

  points: [
    {
      title: 'Read what arrives',
      body: 'A PDF, a phone photo of a delivery note, a spreadsheet, or three lines in the body of an email — taken from the accounts payable inbox rather than from a portal somebody has to remember to check. Fields it cannot find are listed as not found, never inferred.',
    },
    {
      title: 'Match it three ways',
      body: 'Invoice against purchase order against goods receipt, read from your ERP and written back to it, with the break named — quantity, price, a receipt that never arrived — before anybody opens the case.',
    },
    {
      title: 'Show the working',
      body: 'Not a confidence score. What it read, which document each figure came from, which rule applied, and what it did as a result — every number carrying a way back to the page it was taken from.',
    },
    {
      title: 'Stop rather than guess',
      body: 'When the evidence does not settle a question it hands the case over, with the question narrowed to the one thing it needs from you. Nothing posts to the ledger and no money moves without a person.',
    },
    {
      title: 'Work the inbox you already have',
      body: 'Forward it a thread and it picks the work up there — asking the supplier, filing the reply, coming back when the answer changes something. A rule told once, in a sentence, holds for every case after it: how you code a cost centre, which suppliers need two approvals, what counts as a tolerable variance.',
    },
  ],
} as const

/**
 * One artifact.
 *
 * ── Why a mock-up is allowed here, when a screenshot is not ────────────────
 *
 * The rule this page has held to is that there is nothing shipped to
 * photograph, and a rendered dashboard presented as a product would be a lie
 * told in pixels. That rule is intact. This is not a picture of an interface:
 * there is no chrome, no sidebar, no button, no cursor, nothing that could be
 * mistaken for a running application — and the block says what it is in its own
 * first line, in the same type as everything around it.
 *
 * What it is instead is the *deliverable*, set as a document: the record a
 * person picks up at 09:00. That is the one thing five paragraphs of
 * specification cannot make concrete. A controller reading the section above
 * has to assemble this in their head out of five abstractions; showing it costs
 * one screen and does more than the five.
 *
 * ── The numbers have to survive a finance person ───────────────────────────
 *
 * They will check. 480 × £38.00 = £18,240.00; 450 × £38.00 = £17,100.00; the
 * thirty-unit difference is £1,140.00. If one line here is edited, all of them
 * are edited — an example that does not add up is worse than no example, and it
 * fails hardest in front of exactly the reader this section exists for.
 *
 * Everything is invented. The supplier does not exist, the references are not
 * real, and nothing in this block describes work anybody has had done. The
 * label says so, and the label is not decorative.
 */
export const artifact = {
  label: 'Example output',
  headline: 'What is waiting when you get in.',
  lede: 'Invented, and not a screenshot — there is nothing shipped to screenshot. This is the shape of the record the operator is being built to leave behind: one exception, the break already named, the supplier already asked, the evidence already attached.',

  record: {
    reference: 'AP-2291',
    raisedLabel: 'Raised',
    raisedAt: '06:50',
    state: 'Needs a decision',
    supplier: 'Halstead Packaging Ltd',
    document: 'Invoice HP-88214 · 14 January · £18,240.00',

    matchLabel: 'Three-way match',
    /**
     * Three columns, not four.
     *
     * Unit price was the fourth and it came out. Four columns do not fit at
     * 390px without either a sideways scroll — inside the one block on the page
     * whose whole argument is that nothing is hidden — or source labels cut
     * down to the point of ambiguity. Quantity and total are what the break is
     * about; the unit price is stated in `discrepancy` where the arithmetic is,
     * and the document references live in `evidence` where they belong anyway.
     */
    matchColumns: { source: 'Source', quantity: 'Quantity', total: 'Total' },
    /**
     * `agrees: false` marks the one line that broke. It is drawn with the
     * page's only remaining emphasis — full-strength ink against the muted
     * ink-600 of the two rows that agree — because there is no colour to reach
     * for, and a red row is exactly what this design does not have.
     */
    matchRows: [
      { source: 'Invoice', quantity: '480 units', total: '£18,240.00', agrees: true },
      { source: 'Purchase order', quantity: '480 units', total: '£18,240.00', agrees: true },
      { source: 'Goods receipt', quantity: '450 units', total: '£17,100.00', agrees: false },
    ],

    discrepancy: {
      label: 'The break',
      body: 'Quantity. The invoice bills 480 units; the goods receipt records 450 received on 11 January. Thirty units at £38.00 billed and not received — £1,140.00.',
    },

    done: {
      label: 'Already done',
      points: [
        'Coded to 5100 · Packaging, cost centre OPS-02, taken from the purchase order.',
        'Checked against the vendor master and ninety days of paid history. No duplicate.',
        'Asked the supplier for a delivery note covering the thirty units, at 06:51.',
      ],
    },

    draft: {
      label: 'Sent to the supplier',
      body: 'Invoice HP-88214 bills 480 units against PO 4471. Our goods receipt records 450 received on 11 January. Could you send the delivery note covering the remaining 30, or a credit note if they were not shipped?',
    },

    decision: {
      label: 'Waiting on you',
      body: 'Short-pay at 450 units and hold £1,140.00 until the delivery note arrives, or accept the invoice in full. Nothing posts and no money moves until you say which.',
    },

    evidence: {
      label: 'Attached',
      items: [
        'Invoice HP-88214.pdf',
        'Purchase order 4471',
        'Goods receipt 20114',
        'Supplier thread · 3 messages',
      ],
    },
  },
} as const

/**
 * The frame-correction section.
 *
 * Everybody arrives at an "AI for finance" page with a chatbot in their head,
 * and every sentence after that is heard through it. Correcting the frame is
 * worth more than a feature list, which is why this runs before anything else
 * explains how the product works.
 */
export const scope = {
  label: 'What we are building',
  headline: 'A coworker, not a copilot.',

  is: {
    label: 'What it is',
    points: [
      {
        title: 'A responsibility it owns end to end',
        body: 'Not a prompt you write each time. It is given a piece of finance work — intake, matching, chasing, escalation — and it carries that work until it is finished or until a person is genuinely needed.',
      },
      {
        title: 'Work done in your systems',
        body: 'Your ERP, your accounts payable inbox, your bank files, your ticket queue. Nothing is re-platformed, and nothing moves somewhere your finance team cannot point at.',
      },
      {
        title: 'Authority written down before it runs',
        body: 'What it may do alone, what needs an approval and what it must never touch are stated in advance, checked on every action, and changed deliberately rather than discovered afterwards.',
      },
    ],
  },

  isNot: {
    label: 'What it is not',
    points: [
      {
        title: 'Not a chat window',
        body: 'There is nothing to keep open and nothing to re-explain each morning. Most of its work happens while nobody is watching, which is the only way the overnight hours get covered at all.',
      },
      {
        title: 'Not an autonomous approver',
        body: 'Money does not move on a model’s confidence. Payment release, posting, and anything touching the ledger of record go to a person — with the evidence already assembled.',
      },
      {
        title: 'Not a rip-and-replace',
        body: 'It does not ask you to migrate a general ledger or retire a system that works. It joins the stack you already run, and takes one piece of work at a time.',
      },
    ],
  },
} as const

/**
 * Where the build stands.
 *
 * A pre-launch page that says nothing about its own progress reads as a parked
 * domain; one that invents a date reads as a lie the moment the date passes.
 * So: three stages, present tense, no calendar.
 *
 * This is now the *only* place on the page that says what does and does not
 * exist. `outline` used to say it too, and a second statement of the same thing
 * turned candour into apology. Keep it here, keep it once.
 */
export const standing = {
  label: 'Where this stands',
  headline: 'Honest about what exists.',
  stages: [
    {
      state: 'Built',
      title: 'The platform underneath',
      body: 'Deployments, cases, policies, approval routing and the audit record — the parts that have to be right before any model is allowed near a ledger.',
    },
    {
      state: 'In build',
      title: 'The finance operator',
      body: 'Invoice intake, account and cost-centre coding, three-way match, duplicate detection, and the exception path a person picks up in the morning.',
    },
    {
      state: 'Opening',
      title: 'Early access',
      body: 'A first group of finance teams, one workflow each, run alongside the way they do it today so the two can be compared before anything depends on ours.',
    },
  ],
} as const

export const close = {
  headline: 'Tell us the hour that hurts.',
  body: 'If there is a piece of finance work that is always behind by Monday, or an inbox that is never empty on the first of the month, that is the conversation we want to have. Join the list above, or write to us directly.',
  emailLabel: 'Write to us',
} as const

export const seoCopy = {
  title: 'Incillum — an AI coworker for finance operations',
  description:
    'Incillum is building an AI coworker for finance operations: invoice intake, matching and exceptions, run inside your existing systems, through the hours nobody is in. Join the waitlist.',
} as const
