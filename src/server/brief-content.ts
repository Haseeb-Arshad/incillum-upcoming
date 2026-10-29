/**
 * The private brief's words, for investors and partners the founder has
 * given the password to. Server-only: `server/brief.ts` is its one importer,
 * inside the handler that has checked the password, so none of it is in the
 * browser's bundle.
 *
 * It is held to the public site's rules where they protect a reader (no
 * figure without a source, no customer, usage or date that is not true, no
 * dash in place of a comma), and it says plainly what is built and what is
 * not, from `requirements/README.md`. An investor who checks a sentence here
 * should find it true. `design/2026-10-29-research.md` records every source.
 */

export type BriefSourceKey =
  'hbr' | 'salesforce' | 'mckinsey' | 'gartner' | 'gartner-cancel' | 'cpq'

export interface BriefFigure {
  value: string
  label: string
  source: BriefSourceKey
}

export type BriefSection =
  | {
      kind: 'figures'
      id: string
      heading: string
      lede?: string
      figures: ReadonlyArray<BriefFigure>
      closing?: string
    }
  | { kind: 'prose'; id: string; heading: string; paragraphs: ReadonlyArray<string> }
  | {
      kind: 'rows'
      id: string
      heading: string
      lede?: string
      rows: ReadonlyArray<{ title: string; body: string }>
    }
  | {
      kind: 'status'
      id: string
      heading: string
      lede?: string
      rows: ReadonlyArray<{
        ability: string
        stands: string
        built: 'yes' | 'partly' | 'no'
      }>
    }

export interface Brief {
  title: string
  dated: string
  lead: string
  sections: ReadonlyArray<BriefSection>
  sources: ReadonlyArray<{ key: BriefSourceKey; citation: string; href: string }>
  builtLabels: Record<'yes' | 'partly' | 'no', string>
  sourcesHeading: string
}

export const brief: Brief = {
  title: 'Incillum, in brief',
  dated: 'As of 29 October 2026',
  lead: 'Incillum is intelligence for commercial work. Its agent, Charlie, picks up a customer’s request for quotation the moment it lands, reads every document behind it, prices each line against real costs and the agreed margin, and hands a person a decision instead of a backlog. It is pre-launch. What is built, what is not, and where every figure comes from are on this page.',

  sections: [
    {
      kind: 'figures',
      id: 'problem',
      heading: 'The problem, in numbers',
      lede: 'A quotation is where a sale is won or lost, and it is still assembled by hand.',
      figures: [
        {
          value: '42h',
          label:
            'Average reply to a sales enquiry, among 2,241 US companies that replied within a month',
          source: 'hbr',
        },
        { value: '23%', label: 'Of those companies never replied at all', source: 'hbr' },
        {
          value: '7×',
          label:
            'Better odds of reaching a decision maker when the reply comes within the hour, rather than an hour later',
          source: 'hbr',
        },
        {
          value: '60×',
          label: 'Better odds within the hour than after a day or more',
          source: 'hbr',
        },
        {
          value: '17%',
          label:
            'Of a sales rep’s week spent creating quotes, against 22% with customers, and 13% more entering data by hand',
          source: 'salesforce',
        },
        {
          value: '8%',
          label:
            'More operating profit from a price 1% higher at the same volume, for the average S&P 1500 company',
          source: 'mckinsey',
        },
      ],
      closing:
        'Speed decides who gets the conversation. Margin decides whether it was worth having. Today both depend on someone being at a desk with six documents open.',
    },
    {
      kind: 'prose',
      id: 'insight',
      heading: 'Why it stays slow',
      paragraphs: [
        'A real request for quotation is not a form. It is an email with a PDF, a drawing pack, a spreadsheet of twenty lines, and a covering note that changes one of them. Pricing it means matching every line to a product, reading costs off supplier price lists, applying the terms of a framework agreement, and checking the result against a margin floor. The documents never meet, so a person carries the figures between them.',
        'That work does not wait for office hours. Requests arrive overnight and at weekends, supplier prices move while a quote is open, and every hour a reply waits lowers the odds of winning it. CPQ software makes the quote document; it does not do the reading, matching and checking that come before it. That is the gap.',
      ],
    },
    {
      kind: 'rows',
      id: 'product',
      heading: 'What Charlie does',
      lede: 'One agent on every request, from the moment it lands to the moment a person decides.',
      rows: [
        {
          title: 'Reads',
          body: 'The email, PDFs, drawings and spreadsheets, read into lines: part, quantity, date and terms, each value tied to the page and passage it came from.',
        },
        {
          title: 'Matches',
          body: 'Every line to a product the business carries. Where the evidence does not settle which one, the line is held with one question, never guessed.',
        },
        {
          title: 'Prices',
          body: 'Costs from the price lists and supplier replies, terms from the agreement, and the arithmetic done in whole cents by code, not by the model.',
        },
        {
          title: 'Checks',
          body: 'The margin floor on every line. When a supplier’s price changes, the line is priced again against the floor and the shortfall named.',
        },
        {
          title: 'Hands back',
          body: 'A quotation ready for a decision, with the working attached. Nothing is sent and no price is committed until a person approves it.',
        },
      ],
    },
    {
      kind: 'rows',
      id: 'trust',
      heading: 'Built to be checked',
      lede: 'Most agent projects fail on trust. These are the controls Charlie works inside.',
      rows: [
        {
          title: 'Every figure cited',
          body: 'A value on the sheet opens to the document, page and passage it was read from. A figure with no source is reported as missing.',
        },
        {
          title: 'Exact arithmetic',
          body: 'Margins and totals are worked in integer minor units by one financial kernel. The model reads; it never prices.',
        },
        {
          title: 'One gate for anything outward',
          body: 'Every action that would leave the business passes a single approval gate. Today no outward action runs without one.',
        },
        {
          title: 'A record that cannot be rewritten',
          body: 'Revisions and the activity journal refuse update and delete for the application.',
        },
        {
          title: 'Isolated by organisation',
          body: 'Row-level security forced on every tenant table, with tests run as the restricted role. Credentials sealed with AES-256-GCM, bound to their organisation.',
        },
      ],
    },
    {
      kind: 'figures',
      id: 'now',
      heading: 'Why now',
      lede: 'Language models can finally read the documents a quote is built from. The question is which agents will be trusted with money.',
      figures: [
        {
          value: '<1%',
          label: 'Of enterprise software applications included agentic AI in 2024',
          source: 'gartner',
        },
        { value: '33%', label: 'Expected to by 2028', source: 'gartner' },
        {
          value: '40%+',
          label:
            'Of agentic AI projects expected to be cancelled by the end of 2027, over cost, unclear value or weak risk controls',
          source: 'gartner-cancel',
        },
      ],
      closing:
        'The agents that last in commercial work will be the ones a finance director can audit. Charlie is built that way from the first line.',
    },
    {
      kind: 'prose',
      id: 'market',
      heading: 'The market',
      paragraphs: [
        'The first job is the request for quotation in businesses that quote for a living: manufacturers and distributors with parts to match, drawings to read, suppliers whose prices move, and a margin someone signs off.',
        'Configure, price and quote software alone is estimated at USD 2.8 to 3.5 billion in 2025, growing 9 to 17% a year. That is the tool, and a floor. The larger prize is the work around it: the 17% of every sales rep’s week that goes on building quotes, and the margin decided inside them. From the quote, the same agent extends to the follow-ups, orders and documents that come after it.',
      ],
    },
    {
      kind: 'status',
      id: 'status',
      heading: 'Where it stands',
      lede: 'Built and tested locally, not yet on a hosted environment, and no customers yet. Line by line:',
      rows: [
        {
          ability: 'Reads requests into lines',
          stands:
            'OCR, Word and the review engine read requests locally. Customer uploads stay blocked until reader isolation is qualified.',
          built: 'partly',
        },
        {
          ability: 'Cites every figure',
          stands:
            'Citations carry source, page and span in the review. Not yet carried into the quotation draft.',
          built: 'partly',
        },
        {
          ability: 'Holds what it cannot settle',
          stands: 'Held lines and required-spec status in the review.',
          built: 'yes',
        },
        {
          ability: 'Checks the margin floor',
          stands: 'Deterministic margin arithmetic on integer minor units.',
          built: 'yes',
        },
        {
          ability: 'Prices again when a supplier answers',
          stands:
            'The arithmetic exists. The supplier update that reopens an approved price is specified, not yet built end to end.',
          built: 'partly',
        },
        {
          ability: 'Compares supplier quotes',
          stands: 'Supplier intelligence review on a sample workspace.',
          built: 'yes',
        },
        {
          ability: 'Makes the quotation, workbook or chart',
          stands: 'Document engine and the Charlie panel in Studio.',
          built: 'yes',
        },
        {
          ability: 'Nothing leaves without a person',
          stands:
            'True of the platform today: no outward action runs without an approval.',
          built: 'yes',
        },
        {
          ability: 'Asks suppliers, posts to a team, calls, sends to the customer',
          stands: 'Not built. Each will be an action behind the same approval gate.',
          built: 'no',
        },
        {
          ability: 'Hosted environment',
          stands:
            'Not yet. Isolation is proven locally and has to be proven again hosted before any customer data.',
          built: 'no',
        },
      ],
    },
    {
      kind: 'rows',
      id: 'risks',
      heading: 'Risks, and what we do about them',
      rows: [
        {
          title: 'A wrong number is worse than a late one',
          body: 'Every figure cited, uncertain lines held rather than guessed, the arithmetic in code, and a person approving anything that leaves.',
        },
        {
          title: 'Every team’s systems are different',
          body: 'Connections are set up with each team, reading first. The page names no system because none is promised before it works.',
        },
        {
          title: 'Agent washing makes buyers sceptical',
          body: 'A narrow first job with outcomes a buyer can check for themselves: the hours a reply waits, and the margin held on the lines it prices.',
        },
        {
          title: 'No customers yet',
          body: 'Early access is one real case run beside a team’s own process, with nothing to pay and nothing to change, so the comparison is theirs.',
        },
      ],
    },
  ],

  builtLabels: { yes: 'Built', partly: 'Partly built', no: 'Not yet' },
  sourcesHeading: 'Sources',
  sources: [
    {
      key: 'hbr',
      citation:
        'James B. Oldroyd, Kristina McElheran and David Elkington, “The Short Life of Online Sales Leads”, Harvard Business Review, March 2011. An audit of 2,241 US companies, and a study of 1.25 million leads at 42 companies.',
      href: 'https://hbr.org/2011/03/the-short-life-of-online-sales-leads',
    },
    {
      key: 'salesforce',
      citation:
        'Salesforce, State of Sales, seventh edition. A survey of 4,050 sales professionals in 22 countries, August to September 2025.',
      href: 'https://www.salesforce.com/en-us/wp-content/uploads/sites/4/documents/reports/sales/salesforce-state-of-sales-report-2026.pdf',
    },
    {
      key: 'mckinsey',
      citation:
        'Michael V. Marn, Eric V. Roegner and Craig C. Zawada, “The power of pricing”, McKinsey Quarterly, 2003, number 1.',
      href: 'https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/the-power-of-pricing',
    },
    {
      key: 'gartner',
      citation: 'Gartner, Top Strategic Technology Trends for 2025, October 2024.',
      href: 'https://www.gartner.com/en/articles/ai-agents-pc1',
    },
    {
      key: 'gartner-cancel',
      citation:
        'Gartner, “Gartner Predicts Over 40% of Agentic AI Projects Will Be Canceled by End of 2027”, 25 June 2025.',
      href: 'https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027',
    },
    {
      key: 'cpq',
      citation:
        'Market estimates for configure, price and quote software: Technavio (January 2025), Custom Market Insights (January 2026), Kings Research. Paid reports; the range is wide and definitions differ.',
      href: 'https://technavio.com/report/configure-price-and-quote-software-market-industry-size-analysis',
    },
  ],
}
