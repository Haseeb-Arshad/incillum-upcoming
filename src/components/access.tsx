import { Container, Label } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { access } from '#/content/site.ts'

/** The existing no-training commitment, with unsettled pilot details stated plainly. */
export function Access() {
  return (
    <section
      aria-labelledby="access-heading"
      className="ic-textured border-t border-line bg-paper-sunken py-16 sm:py-20"
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
