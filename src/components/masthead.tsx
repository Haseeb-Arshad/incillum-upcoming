import { ButtonLink, Container } from '#/components/primitives.tsx'
import { brand } from '#/content/site.ts'

/**
 * The masthead.
 *
 * Wordmark on the left, one black button on the right — the shape a serious
 * software company's header has — with the six-item product menu that normally
 * sits between them removed rather than emptied.
 *
 * That removal is the point. A navigation bar is a promise that there are
 * places to go, and on a pre-launch site every one of those places is either a
 * page that does not exist yet or a way to leave the only thing being asked
 * for. What is left is the minimum a stranger needs: who is asking, what stage
 * this is, and the action.
 *
 * Sticky, which it was not at first and should have been sooner. The original
 * reasoning — that a bar following you down a short page to offer something
 * already on screen is furniture — was sound when the page was four screens.
 * The capability and interaction sections took it past eight, and past about
 * five the form is genuinely gone: a reader who is convinced by §04 has to
 * scroll back through three sections to act on it. A single button that is
 * always there is the cheapest possible fix.
 *
 * `bg-paper` is solid rather than translucent-with-blur. A backdrop filter over
 * a page whose entire surface is one flat off-white buys no depth, costs a
 * compositing layer on every scroll frame, and produces a faint seam where the
 * blurred strip meets the identical colour beneath it.
 *
 * The stage sits beside the wordmark as a plain label rather than a pill with a
 * pulsing dot. It is a fact about where the company is, and setting it as a
 * fact is more convincing than decorating it.
 */
export function Masthead() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <Container className="flex h-[72px] items-center justify-between gap-6 sm:h-20">
        <div className="flex items-baseline gap-3 sm:gap-4">
          {/*
            The wordmark is the serif at its display weight, set as text rather
            than as a logotype image — it is the same face as the headline
            below, so the page introduces itself in the voice it then speaks in.
          */}
          <span className="font-display text-[1.5rem] leading-none tracking-[-0.02em] text-ink sm:text-[1.75rem]">
            {brand.name}
          </span>

          <span aria-hidden="true" className="hidden h-4 w-px self-center bg-line-strong sm:block" />

          <p className="hidden text-label uppercase text-ink-400 sm:block">{brand.stage}</p>
        </div>

        <ButtonLink href="#waitlist" tone="primary" size="md">
          Join the waitlist
        </ButtonLink>
      </Container>
    </header>
  )
}
