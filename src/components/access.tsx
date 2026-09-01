import { Container, Label } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { access } from '#/content/site.ts'

/**
 * Data and access.
 *
 * ── Why it is four lines and not a trust page ──────────────────────────────
 *
 * A finance team asks what happens to their invoice data before they ask what
 * the software does with it, and the absence of any answer on a page about
 * reading invoices is loud. So there is an answer. What there is not is a
 * security page: no badge, no certification, no framework named, no lock icon,
 * nothing that could be mistaken for an attestation. AGENTS.md §5 forbids
 * compliance claims outright, and a certification asserted before it is held
 * is the one lie on a pre-launch site a buyer can check in an afternoon.
 *
 * ── Why one side of it says "not yet" ──────────────────────────────────────
 *
 * Because one thing is settled and the rest is not, and the version of this
 * section that reads well is the version that invents the rest. Residency,
 * internal access, retention and audit were all candidates for a confident
 * sentence here; every one of them would be unverifiable today, verifiable
 * later, and walked back in front of the first ten customers.
 *
 * So the block is built as two halves of equal weight rather than one claim
 * with a footnote — the admission is not smaller than the assertion, it is the
 * same size beside it. That is the same argument `standing` makes about the
 * product, applied to the thing a controller will actually ask about first.
 *
 * ── Where it sits ──────────────────────────────────────────────────────────
 *
 * Directly after `Standing`, sharing its sunken ground, divided from it by the
 * page's usual hairline. The two are one closing statement in two parts: what
 * exists, then what is decided. Putting this anywhere above them would make a
 * reader answer a question they had not asked yet.
 */
export function Access() {
  return (
    <section
      aria-labelledby="access-heading"
      className="border-t border-line bg-paper-sunken py-16 sm:py-20"
    >
      <Container>
        <Reveal className="flex flex-col gap-5">
          <Label>{access.label}</Label>
          <h2 id="access-heading" className="max-w-[20ch] text-title text-ink">
            {access.headline}
          </h2>
        </Reveal>

        {/*
          Two columns of equal width, not a claim with a caveat under it. The
          layout is the argument: what is decided and what is not are the same
          size, on the same rule, in the same tone of ink.
        */}
        <Reveal
          delay={80}
          className="mt-10 grid gap-x-16 gap-y-8 border-t border-line-strong pt-8 sm:mt-12 lg:grid-cols-2"
        >
          {[access.decided, access.open].map((entry) => (
            <div key={entry.title} className="flex flex-col gap-2.5">
              <h3 className="max-w-[30ch] text-heading text-ink">{entry.title}</h3>
              <p className="max-w-[52ch] text-body text-ink-600">{entry.body}</p>
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  )
}
