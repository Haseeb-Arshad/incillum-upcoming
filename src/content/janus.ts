/**
 * Every word the JANUS case study renders.
 *
 * ── Why this is not in `site.ts` ───────────────────────────────────────────
 *
 * `site.ts` holds the copy for the one page this site exists to serve, and its
 * standard is that nothing asserts something that has already happened. This
 * page is held to a different standard, because it is about a different thing:
 * a small build that is finished, public, and checkable by anybody who follows
 * the link. Statements here may be in the past tense, and they must be true.
 *
 * Keeping the two apart is what stops that licence leaking. A sentence written
 * in this file cannot accidentally end up on the pre-launch page, and a
 * reviewer reading `site.ts` still sees the whole of what the company claims
 * about itself in one sitting.
 *
 * ── The rules this file is held to ─────────────────────────────────────────
 *
 *   1. Every factual statement about the build is verifiable by opening the
 *      demo or the repository. Figures are exact and reconcile across the
 *      page — `janus.test.ts` names the ones that have to move together.
 *   2. Nothing here claims anything about Incillum. JANUS is not an Incillum
 *      product, was not built for a customer, and produced no commercial
 *      result. The framing line says so in its own first sentence.
 *   3. The banned vocabulary is banned here too. It is the same company
 *      writing.
 *   4. JANUS explores structured scenarios and does not predict anything. Its
 *      own interface says so. Nothing on this page may contradict that, which
 *      rules out "predicts", "forecasts", and every figure presented as a
 *      likelihood rather than as a modelled output.
 */

export const janus = {
  label: 'Work · JANUS',

  /**
   * The framing sentence, first and at reading size.
   *
   * It exists for the same reason the illustrative blocks on the home page
   * carry their own labels: a reader who works out four screens down that this
   * was a weekend build has read everything above it as something else.
   */
  framing:
    'JANUS is a hackathon build, not an Incillum product. It is public, it works, and everything below can be checked by opening it.',

  headline: 'An agent that can do the work, and cannot do the deciding.',

  lede: 'JANUS rehearses a launch before it happens. It runs three structured futures of the same launch, names what they have in common, and helps prepare a response — and it hands a browser agent the same typed actions a person uses for all of it, except the one that matters.',

  demoLabel: 'Open the demo',
  demoUrl: 'https://janus-vert.vercel.app/',
  demoNote: 'Best in a browser with native WebMCP. Everything works by hand without it.',

  /** 01 — what the thing does, before any architecture. */
  premise: {
    label: 'What it does',
    headline: 'Three ways the same launch could go.',
    body: 'Somebody describes a launch as a set of assumptions — expected visitors, target conversion, how ready checkout is, who is covering support, how much trust the brand has. JANUS runs three futures of that launch and shows what happens in each, why it happens, and what the first visible sign would be.',
    futures: [
      {
        title: 'Upside',
        body: 'Demand arrives and the operation holds. The constraint moves to the support desk before it moves anywhere else.',
      },
      {
        title: 'Drift',
        body: 'The launch works and then quietly stops mattering. Signups look healthy; nobody builds a reason to come back in week two.',
      },
      {
        title: 'Breakdown',
        body: 'One operational weakness compounds into a public one. Payment retries become duplicate charges, then a support queue, then a conversion problem.',
      },
    ],
    /**
     * The scores are deterministic outputs of the model at the demo's default
     * assumptions. The word "modelled" is doing real work in this sentence and
     * is not decoration.
     */
    reading:
      'At the example launch those come out at 39, 58 and 46 — modelled pressure out of 100, not a probability and not a prediction. Below 40 reads as low, 55 and above as high.',
  },

  /** 02 — the sequence. The centre of the page. */
  sequence: {
    label: 'The sequence',
    headline: 'Where the line is drawn.',
    lede: 'This is the whole argument in one interaction. Every step below is something the software actually does, in the order it does it.',
    beats: [
      {
        actor: 'Agent',
        title: 'Reads the launch and runs the three futures',
        body: 'It calls typed actions the page has published — read the launch, run a future, compare them, trace what causes the breakdown. The three futures appear on screen as it goes.',
      },
      {
        actor: 'Agent',
        title: 'Prepares a response, and is refused',
        body: 'It stages the smallest set of measures that improves more than one future, then asks to verify its own work. Verification is refused: no person has approved anything yet.',
      },
      {
        actor: 'Person',
        title: 'Changes one assumption',
        body: 'Expected visitors go from 20,000 to 80,000. The prepared response immediately desaturates and reads “Needs reassessment” — it was built against a launch that no longer exists.',
      },
      {
        actor: 'Agent',
        title: 'Notices, without being told and without a reload',
        body: 'It reads the launch again, sees the response is no longer valid, runs the futures against the new numbers, and prepares a replacement.',
      },
      {
        actor: 'Person',
        title: 'Approves it',
        body: 'This is the one action no tool can perform. There is no approve, ratify, publish or override action on the agent surface — not disabled, not permission-gated. It is not there.',
      },
      {
        actor: 'Agent',
        title: 'Verifies the exact thing that was approved',
        body: 'It re-runs the model with the approved measures applied and reports pressure before and after. If the plan had changed by one character since approval, verification would fail rather than pass quietly.',
      },
    ],
  },

  /** 03 — the boundary. */
  boundary: {
    label: 'Where it stops',
    headline: 'The approval is not a permission.',
    body: 'The usual way to keep an agent away from a decision is to give it the capability and then withhold the right. JANUS does not have the capability to withhold. Approval exists only as something a person does in the interface, so there is nothing to misconfigure, nothing to escalate, and nothing that a longer prompt talks its way past.',
    points: [
      {
        title: 'A plan is bound to the launch it was built against',
        body: 'The measures, the launch state and the reason are hashed together. Change an assumption afterwards and the approval and the verification are both dropped, because they belonged to a launch that no longer exists.',
      },
      {
        title: 'Verification recomputes rather than trusts',
        body: 'It hashes the plan again from the plan’s own contents and compares that against what was approved. A plan edited after approval fails the check instead of riding it through.',
      },
      {
        title: 'Nothing is predicted',
        body: 'Every score, comparison, causal chain and verification comes from plain deterministic code. No model sits in the path that produces a number, so the same inputs always give the same outputs.',
      },
      {
        title: 'A refusal says how to recover',
        body: 'Every failure carries the reason and the next legal action, because an agent that is told only “no” has no way to find out what it should have done.',
      },
    ],
  },

  /** 04 — construction. */
  build: {
    label: 'How it is built',
    headline: 'One path, two callers.',
    body: 'A person’s click and an agent’s call land on the same application command, which calls the same engine and writes the same state. There is no second implementation of any rule for the agent — which is why an agent cannot reach a field, like an approval or a revision, that the command does not accept from anybody.',
    points: [
      {
        title: 'Six typed actions, published to the browser',
        body: 'The page registers them on the browser’s own model-context interface, so a compatible agent finds them by reading the page rather than by being wired to it. They read the launch, run a future, compare the three, trace a cause, prepare a response, and verify an approved one.',
      },
      {
        title: 'Semantic actions, not clicks',
        body: 'Nothing here automates a cursor. The actions mean what a person means, so a change to the interface does not silently change what an agent is doing.',
      },
      {
        title: 'Readiness is checked, not assumed',
        body: 'Registration resolving is not treated as proof. The tools are read back out of the browser and all six must be present before anything reports itself ready; a partial surface is an error that names what is missing.',
      },
      {
        title: 'Agent activity is observed, never narrated',
        body: 'While an agent works, the page shows what it actually did — one line per real call, taken from the record. It shows no reasoning, because it has none to show, and inventing some is the one thing that would make the demonstration a lie.',
      },
    ],
  },

  /** 05 — what was checked. Facts, stated as facts. */
  checked: {
    label: 'What was checked',
    headline: 'Verified against the deployed site.',
    body: 'The sequence above is not a description of intent. It was run end to end against the public deployment, in a browser, driving the published actions the way an agent would.',
    facts: [
      {
        term: '114 automated tests',
        body: 'The engine’s arithmetic, the command layer, hashing, the revision rules, the published action surface, and the copy rules.',
      },
      {
        term: '28 checks against production',
        body: 'The full sequence — six actions, a refused verification, a changed assumption, a recovered plan, a human approval, a passing verification — with no page error and no reload at any point.',
      },
      {
        term: 'Nothing stored, nothing to sign in to',
        body: 'A rehearsal lives in the browser that ran it. There is no account, no database and no server holding anybody’s launch.',
      },
    ],
  },

  /** The close. Deliberately quiet, and it does not ask for anything. */
  close: {
    body: 'JANUS is a small thing built quickly, and it is on this site for one reason: the question it is about — where an autonomous system stops and a person decides — is the same question the rest of this site is about.',
    backLabel: 'Back to Incillum',
  },
} as const

export const janusSeo = {
  title: 'JANUS — an agent that can do the work, and cannot do the deciding',
  description:
    'A launch rehearsal tool built for a WebMCP hackathon. It publishes six typed actions to the browser so an agent can run the whole rehearsal, and deliberately publishes no way to approve anything.',
} as const
