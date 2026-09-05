# First impression: editorial force

## Baseline

Clean checkout at `a7af847`. Preserve the supplied logo and the JANUS route.
The current hero gives the headline and questionnaire almost equal weight;
the strongest visual is separated from the opening by a long text-only lead-in.
Small section typography makes the page feel uniformly quiet and long.
Hero delays reach 200ms, and the reveal observer uses a negative bottom margin,
starting animations after content has entered the viewport. Thread rows each
animate separately despite the section-level motion budget.
The active font files are explicitly identified as unlicensed in AGENTS.md.

## Implementation

1. Give the hero a larger, two-line statement: “Your day ends. The work doesn’t.”
   Keep the full commercial-work arc in the explanation and the in-build state
   visible. Make the signup invitation concise and visually contained.
2. Introduce a static, typographic 23:47–08:04 bridge into the existing narrative.
   It describes the illustrative story, never live activity. Place the night
   introduction beside its still image on desktop, stack naturally on mobile.
3. Retain the original font files, as explicitly requested during review. Remove
   the hero's “Commercial operations · In build” eyebrow. Increase section
   heading presence without changing the evidence figures or commercial claims.
   The existing AGENTS.md font licensing note remains unresolved.
4. Stage a masked two-line hero entrance, trigger reveals before the fold, remove
   accumulated per-row thread delays, preserve native scrolling and immediate
   final states for reduced motion. Keep the night image completely still.
5. Verify typecheck, lint, unit tests, production build and browser suite. Add
   focused coverage for four viewport widths, late-hour/long-timezone overflow,
   reduced motion, no-JS visibility and the hero's desktop conversion visibility.
   Put every optional qualifier behind the form disclosure so only email is
   asked up front. Exercise loading/error recovery with intercepted test responses; do not send
   test outreach. Visually inspect desktop/mobile and the JANUS typography.
6. Record results, commit the functional redesign, and push.

## Boundaries

One inverted band, one quotation, the existing two motto placements and one
conversion. No invented traction, launch date, product UI, supplier outreach,
looping decoration, extra colours, gradients, shadows or dependencies.

## Second review: clearer category and a visible commercial consequence

The user rejected the day/work headline, requested more top spacing, a better
evidence visualization, and removal of the status section. Reviewed Harvey's
homepage and Hebbia's homepage on 2026-09-05. Their useful pattern is category
clarity, concise explanation, and a concrete visual that supports the proposition.
Their customer counts and compliance claims are specific to them and are not
appropriate evidence for Incillum.

- Hero: “Intelligence for commercial work.” Keep the original font and explain
  the full request-to-consequence arc beneath it; add generous top spacing.
- Evidence: show the actual causal chain in the invented quotation: supplier
  cost 128.00 → 135.68; unchanged quoted price 160.00; margin 20.0% → 15.2%;
  floor price 169.60; shortfall 11,520.00. Use HTML/CSS with readable figures,
  source provenance and an optional full-calculation disclosure, not a raster
  image of text or a pretend screenshot of the product.
- Remove the status section from the page. Keep a concise pre-launch explanation
  in the hero and the existing first-build section.
- Keep data/access, replace defensive language with the exact existing
  no-training commitment and a concise explanation of unsettled pilot details.
- Recheck arithmetic, disclosure keyboard behavior, responsive visualization,
  SSR illustrative labels, reduced motion, all static gates and production E2E.
