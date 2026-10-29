import {
  CharlieConversation,
  CharlieLimits,
  CharlieReach,
} from '#/components/charlie-agent.tsx'
import { CharlieReel } from '#/components/charlie-reel.tsx'
import { OrbitMark } from '#/components/orbit-mark.tsx'
import { PageFrame } from '#/components/page-frame.tsx'
import { ButtonLink, Container } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { charlie } from '#/content/site.ts'

/**
 * /charlie — the colleague inside Incillum, shown at work.
 *
 * A headline and the two ways on; the film of Charlie working one request in
 * Incillum Studio, cut from Studio's own pages; then Charlie as an agent, which
 * the film does not say: spoken to in a team's channel, who it talks to, and
 * where it stops (`charlie-agent.tsx`); and one invitation.
 *
 * Under the film there used to be the same six steps again, each with a still
 * of the Studio page it happens on and a way back into the film. The owner
 * found it repeated the film (29 October 2026), so the film keeps its own
 * chapters and the page says something else. The steps' words and stills are
 * kept, unplaced, in `charlie.steps`.
 */
export function CharliePage() {
  const { hero, close } = charlie
  return (
    <PageFrame>
      <section aria-labelledby="charlie-title" className="cp-hero">
        <Container>
          <p className="cp-eyebrow">
            <OrbitMark className="cp-eyebrow-mark" />
            {hero.eyebrow}
          </p>
          <h1 id="charlie-title" className="cp-title">
            {hero.headline}
          </h1>
          <div className="cp-hero-foot">
            <p className="cp-lede">{hero.lede}</p>
            <div className="cp-actions">
              <ButtonLink href="#film" arrow className="desk-cta">
                {hero.watch}
              </ButtonLink>
              <ButtonLink href="/contact" tone="secondary">
                {hero.contact}
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <section id="film" aria-labelledby="charlie-title" className="cp-film">
        <Container>
          <CharlieReel />
        </Container>
      </section>

      <CharlieConversation />
      <CharlieReach />
      <CharlieLimits />

      <section aria-labelledby="charlie-close-title" className="page-close">
        <Container>
          <Reveal className="glass-close-grid">
            <h2 id="charlie-close-title" className="glass-close-title">
              {close.headline}
            </h2>
            <div className="glass-close-side">
              <p className="glass-close-body">{close.body}</p>
              <div className="glass-close-actions">
                <ButtonLink href="/contact" arrow className="desk-cta">
                  {close.action}
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </PageFrame>
  )
}
