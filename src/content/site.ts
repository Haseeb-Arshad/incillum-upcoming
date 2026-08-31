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
