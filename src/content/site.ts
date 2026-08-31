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
 */

export const brand = {
  name: 'Incillum',
  domain: 'incillum.com',
  /** Sits beside the wordmark. A stage, not a slogan. */
  stage: 'Private preview',
} as const

export const hero = {
  eyebrow: 'Finance operations',
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
  /** Sits under the form. The one promise this page can actually keep. */
  assurance:
    'One email, when there is something real to show. No newsletter, no drip sequence.',
} as const

/**
 * The instrument.
 *
 * A working day is nine hours. The other fifteen are the product's entire
 * reason to exist, so they are drawn at the same scale rather than described.
 */
export const instrument = {
  label: 'The hours nobody is in',
  headline: 'Fifteen hours a day, the work is on its own.',
  lede: 'Invoices arrive, cut-offs approach and exceptions collect against a team that is asleep. That is the shift we are building the operator to take.',

  /** Local hours the office is treated as occupied. Inclusive of `from`, exclusive of `to`. */
  officeHours: { from: 9, to: 18 },

  occupiedLabel: 'Your team',
  atDesks: 'Your team is at their desks.',
  awayFromDesks: 'Nobody is at their desks.',
  /** Server-rendered placeholder — the server cannot know where the reader is. */
  unknownTime: 'Reading the clock on your device.',

  /**
   * Three shifts, each a real piece of finance operations work, each stated as
   * intent. The times illustrate *when the work arrives*; they are not claims
   * about anything the software has done.
   *
   * Kept to one sentence each. They used to run three, and every one of those
   * extra sentences said something `capabilities` below now says properly, with
   * a drawing beside it — so the same material was on the page twice, once
   * badly. These say *when*; that section says *what*.
   */
  shifts: [
    {
      at: '23:40',
      title: 'An invoice lands after the last person has logged off.',
      body: 'By morning it is either ready to post or an exception with the discrepancy already written down.',
    },
    {
      at: '03:15',
      title: 'A payment run has to be ready for the morning cut-off.',
      body: 'Assembled, checked and split into the batch that is clean and the batch that needs somebody. Nothing is released.',
    },
    {
      at: '06:50',
      title: 'The exception nobody has looked at gets chased.',
      body: 'By the time the team is back it is a decision rather than an investigation.',
    },
  ],
} as const

/**
 * What it does with the work.
 *
 * ── The tense, and why it is safe ──────────────────────────────────────────
 *
 * The section's own label and lede put everything below into the future: this
 * is what the operator is *being built* to do. Once that is established, the
 * individual entries can be written in the plain present tense of a
 * specification, which is how anybody describes software under construction and
 * is far easier to read than five paragraphs each hedging separately.
 *
 * That contract is load-bearing. If somebody ever deletes the lede, these
 * entries stop being a specification and start being a claim.
 *
 * ── Why each one names a limit ─────────────────────────────────────────────
 *
 * Every entry says what it does *and* where it stops — the fields it could not
 * find, the batch it will not release, the case it hands over. A capability
 * list without limits is a brochure, and the reader most worth convincing here
 * is a controller whose first question about any of this is "and what happens
 * when it is wrong".
 */
export const capabilities = {
  label: 'What it is being built to do',
  headline: 'The work, in five parts.',
  lede: 'None of this is shipped. It is the specification the finance operator is being built against, in the order a piece of work moves through it.',

  items: [
    {
      figure: 'intake',
      title: 'Read what actually arrives',
      body: 'A supplier sends a PDF, a phone photo of a delivery note, a spreadsheet, or three lines in the body of an email. It reads all of them and pulls out what matters — supplier, dates, currency, tax, line items, the PO reference buried in a subject line.',
      limit: 'The fields it could not find are listed as not found, never inferred to keep a record looking complete.',
    },
    {
      figure: 'match',
      title: 'Match it three ways',
      body: 'Invoice against purchase order against goods receipt. When the three agree the case is ready to post. When they disagree, the break is named before anybody opens it — a quantity short, a price above tolerance, a receipt that never arrived.',
      limit: 'A break is never closed by choosing the most likely answer. It becomes an exception with the working attached.',
    },
    {
      figure: 'schedule',
      title: 'Build the schedule underneath',
      body: 'Accruals, prepayments, supplier statement reconciliations, the payment run. The arithmetic a team otherwise assembles by hand in the last four days of a month, assembled continuously instead, with every figure traceable to the document it came from.',
      limit: 'Nothing posts and no money moves. The run is prepared for a person to release.',
    },
    {
      figure: 'report',
      title: 'Write it up so it can be read',
      body: 'A close pack, a variance note, an ageing summary — in the format your team already sends, with each number carrying a link back to its evidence. Finished enough to read, rather than finished enough to start editing.',
      limit: 'A figure it could not source is shown as unsourced rather than quietly rounded into a total.',
    },
    {
      figure: 'inbox',
      title: 'Work from the inbox you already have',
      body: 'Forward it a thread and it picks the work up there: it asks the supplier for what is missing, files the reply against the case, and comes back to you when the answer changes something. There is no second inbox to check and no new place to look.',
      limit: 'It writes to suppliers about facts and documents. Anything that commits the company goes out from a person.',
    },
  ],
} as const

/**
 * How you work with it.
 *
 * The section that answers the question `scope` provokes. Once a reader has
 * accepted that this is not a chat window, the very next thought is *then how
 * do I tell it anything* — and leaving that unanswered is how a good frame
 * correction turns into a page that sounds evasive.
 *
 * Five short entries rather than five paragraphs. This runs late on the page,
 * after roughly four screens of argument, and by here a reader is scanning.
 */
export const working = {
  label: 'Working with it',
  headline: 'You talk to it like a colleague, and it answers like an auditor.',

  points: [
    {
      title: 'Ask in a sentence',
      body: '“Chase everything over sixty days from the top twenty suppliers.” No query syntax, no rule builder, no configuration screen between you and the work.',
    },
    {
      title: 'Tell it the rule once',
      body: 'How your company codes a cost centre, which suppliers need two approvals, what counts as a tolerable price variance. Written down once, applied to every case, and changed deliberately rather than re-explained each morning.',
    },
    {
      title: 'It shows the working',
      body: 'Not a confidence score. What it read, which document each figure came from, which rule applied, and what it did as a result — in that order, on the case itself.',
    },
    {
      title: 'It stops rather than guesses',
      body: 'When the evidence does not settle a question it hands the case over, with the question narrowed to the one thing it needs from you. A short answer is worth more than a confident wrong one.',
    },
    {
      title: 'It runs the same at four thousand as at forty',
      body: 'A person triaging exceptions is slower on the fortieth than the first, and month-end is exactly when the volume arrives. Nothing about the hundredth case here is different from the first.',
    },
  ],
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
      title: 'The private preview',
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
    'Incillum is building an AI coworker for finance operations: invoice intake, matching and exceptions, run inside your existing systems, through the hours nobody is in. Join the private preview.',
} as const
