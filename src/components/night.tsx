import { Instrument } from '#/components/instrument.tsx'
import { Nightfall } from '#/components/nightfall.tsx'
import { Container, Label } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { Thread } from '#/components/thread.tsx'
import { instrument } from '#/content/site.ts'

/** One uninterrupted night. The plate stays still; only the introduction enters. */
export function Night() {
  return (
    <div data-inverted="" className="py-16 sm:py-20">
      <Container>
        <section
          id="night-story"
          aria-labelledby="night-heading"
          className="ic-night-opening scroll-mt-28"
        >
          <Reveal className="flex flex-col gap-5">
            <Label>{instrument.label}</Label>
            <h2 id="night-heading" className="scroll-mt-28 text-title text-ink">
              {instrument.headline}
            </h2>
            <p className="max-w-[44ch] text-lede text-ink-600">{instrument.lede}</p>
          </Reveal>
          <Nightfall />
        </section>
      </Container>
      <Instrument />
      <Thread />
    </div>
  )
}
