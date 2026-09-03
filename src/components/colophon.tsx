import { Mark } from '#/components/mark.tsx'
import { Container, Label, TextLink } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { contactEmail } from '#/env.ts'
import { brand, close } from '#/content/site.ts'

/**
 * The close.
 *
 * ── The motto lands here ───────────────────────────────────────────────────
 *
 * One of two places on the site — the other is the success state after somebody
 * joins — and this is the one the page ends on. It is set at title size under
 * the mark and the wordmark, on its own, with nothing after it but the year.
 *
 * The placements that were considered and rejected are worth naming, because
 * each of them is the version somebody will propose later:
 *
 *   · Beside the wordmark in the masthead. It would be read on every screen of
 *     every visit, which is the fastest way to turn a sentence into furniture.
 *   · Under the headline in the hero. It would be competing with the thesis for
 *     the same job, and the thesis is the better sentence for that position
 *     because it is about the reader.
 *   · In the bottom bar with the copyright. That is where a tagline goes, and a
 *     tagline is a thing readers have learned not to read.
 *
 * Here it is the last thing on the page, at a size that says it is meant, after
 * an argument that has earned it. A reader who has scrolled this far has just
 * spent nine screens on the idea that work continues after people leave, and
 * these four words are the name for what they have been reading.
 *
 * It is never extended. "AI that stays with your work" is the same idea with
 * the conviction removed.
 */
export function Colophon() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-line py-20 sm:py-28">
      <Container>
        <Reveal className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="flex flex-col gap-5 lg:col-span-7">
            <h2 className="max-w-[18ch] text-title text-ink">{close.headline}</h2>
            <p className="max-w-[54ch] text-lede text-ink-600">{close.body}</p>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-5 lg:pt-2">
            <Label>{close.emailLabel}</Label>
            {/*
              The address at title size, in the serif, underlined. It is the one
              other door on a page with no navigation, and a reader who does not
              want to fill in a form should be able to find it without looking.
            */}
            <TextLink
              href={`mailto:${contactEmail}`}
              className="w-fit font-display text-heading text-ink sm:text-title"
            >
              {contactEmail}
            </TextLink>
          </div>
        </Reveal>

        {/*
          The signature: the mark, the name, and the motto, on the page's own
          hairline. Set as one block at the left rather than centred — centring
          it would make it a sign-off, and this is a statement.
        */}
        <Reveal
          delay={60}
          className="mt-16 flex flex-col gap-5 border-t border-line pt-10 sm:mt-20 sm:pt-12"
        >
          <div className="flex items-center gap-2.5">
            <Mark className="size-7 shrink-0 text-ink" />
            <span className="font-display text-[1.5rem] leading-none tracking-[-0.02em] text-ink">
              {brand.name}
            </span>
          </div>
          <p className="font-display text-title text-ink">{brand.motto}</p>
        </Reveal>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-7 sm:mt-16 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-small text-ink-400">
            © {year} {brand.name}
          </p>
          <p className="text-small text-ink-400">{brand.domain}</p>
        </div>
      </Container>
    </footer>
  )
}
