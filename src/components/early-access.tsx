import { Container, Label } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { WaitlistForm } from '#/components/waitlist-form.tsx'
import { earlyAccess } from '#/content/site.ts'

/**
 * Early access, at the end of the argument.
 *
 * ── Why the form appears a second time ─────────────────────────────────────
 *
 * Because the page is nine screens and the field is on the first one. The
 * sticky masthead button covers the reader who decides early; this covers the
 * reader the page was actually written for — the one who decides at the end,
 * having read the boundary section and checked the arithmetic — and who should
 * not have to scroll back through the whole argument to act on it.
 *
 * It is the same call to action, not a second one. There is no "book a demo"
 * anywhere on this site: a page with two asks is a page that has not decided
 * what it wants.
 *
 * ── Two forms, and why that is safe ────────────────────────────────────────
 *
 * `Field` generates its ids with `useId`, so the two instances cannot collide —
 * which is the failure this pattern usually has, and it is silent: duplicate
 * ids leave every `<label for>` pointing at the first form's input, so clicking
 * a label down here focuses a field four screens up. The one shared identifier
 * on the page is the hero column's `id="waitlist"`, which is an anchor rather
 * than a form id and stays where it is.
 *
 * The two instances hold independent state. Somebody who submits up top and
 * scrolls down finds an empty form rather than their own success message, which
 * is the correct behaviour: the success state is a receipt for an action, not a
 * status for the page.
 *
 * ── The qualification is work, not industries ──────────────────────────────
 *
 * Four sentences about a week rather than eight sector labels. A reader
 * recognises their own work faster than their own sector's name, and printing
 * the sector list here would make the page read as a net. The sector question
 * is on the form, where it is a question instead of a claim.
 *
 * They are set as a list with the page's hairline between them rather than as
 * ticks. A checkmark beside each would turn a description into a scorecard, and
 * a reader who fails one of four ticks stops reading.
 */
export function EarlyAccess() {
  return (
    <section
      aria-labelledby="early-access-heading"
      className="ic-textured border-t border-line bg-paper-sunken py-20 sm:py-28"
    >
      <Container>
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal className="flex flex-col gap-5">
              <Label>{earlyAccess.label}</Label>
              <h2 id="early-access-heading" className="text-title text-ink">
                {earlyAccess.headline}
              </h2>
              <p className="max-w-[52ch] text-lede text-ink-600">{earlyAccess.lede}</p>
            </Reveal>

            <Reveal delay={80} className="mt-10 sm:mt-12">
              <ul className="border-t border-line-strong">
                {earlyAccess.fits.map((fit) => (
                  <li
                    key={fit}
                    className="max-w-[62ch] border-b border-line py-4 text-body text-ink-600"
                  >
                    {fit}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/*
            The form sits on `bg-paper-raised` here, unlike the hero's, which
            sits on the page. This band is the sunken tone, and a white control
            on a sunken ground needs the panel behind it or the fields float —
            it is the same reason the evidence document has one.
          */}
          <Reveal delay={120} className="flex flex-col gap-6 lg:col-span-5">
            <div className="rounded-panel border border-line bg-paper-raised p-6 sm:p-8">
              <WaitlistForm />
            </div>

            {/*
              What actually happens next, under the button rather than beside
              the argument — the same placement, for the same reason, as the
              hero's assurance. The question "and then what" is asked at the
              moment a cursor is on the control, not four paragraphs earlier.

              It also carries the right-hand column. The form is short until
              somebody types into it, and a five-track column holding one small
              panel against nine paragraphs of qualification leaves the bottom
              half of this band empty.
            */}
            <div className="flex flex-col gap-2.5">
              <Label>{earlyAccess.nextLabel}</Label>
              <p className="max-w-[48ch] text-body text-ink-600">{earlyAccess.next}</p>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
