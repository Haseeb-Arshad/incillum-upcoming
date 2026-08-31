import { Container, Label, TextLink } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { contactEmail } from '#/env.ts'
import { brand, close } from '#/content/site.ts'

/**
 * The close, and the colophon.
 *
 * ── Why the form is not repeated here ──────────────────────────────────────
 *
 * The reflex at the foot of a landing page is a second copy of the hero form,
 * and on a page this short that is the same control twenty seconds of scrolling
 * apart, asking the same question of somebody who has already decided either
 * way.
 *
 * What is offered instead is a genuinely different door. The form joins a list;
 * the address starts a conversation, and for the person who has a specific
 * broken Monday in mind that is the thing they actually wanted. It is a real
 * `mailto:` to a real inbox rather than a second funnel — which is also the
 * only version of "get in touch" this site can honestly offer while
 * `server/waitlist.ts` still writes to a log.
 *
 * The address is set at heading size in the serif. It is the last thing on the
 * page and the only remaining action, and on a site with no colour, size is the
 * only way left to say so.
 */
export function Colophon() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-line py-20 sm:py-28">
      <Container>
        <Reveal className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="flex flex-col gap-5 lg:col-span-7">
            <h2 className="max-w-[16ch] text-title text-ink">{close.headline}</h2>
            <p className="max-w-[52ch] text-lede text-ink-600">{close.body}</p>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-5 lg:pt-2">
            <Label>{close.emailLabel}</Label>
            <TextLink
              href={`mailto:${contactEmail}`}
              className="w-fit font-display text-title text-ink"
            >
              {contactEmail}
            </TextLink>
          </div>
        </Reveal>

        <div className="mt-16 flex flex-col gap-3 border-t border-line pt-7 sm:mt-20 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-small text-ink-400">
            © {year} {brand.name}
          </p>
          <p className="text-small text-ink-400">{brand.domain}</p>
        </div>
      </Container>
    </footer>
  )
}
