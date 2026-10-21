import { CharlieAbilities, CharlieScene } from '#/components/charlie.tsx'
import { PageFrame } from '#/components/page-frame.tsx'
import { ButtonLink, Container } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { charlie } from '#/content/site.ts'

/**
 * /charlie — the colleague inside Incillum.
 *
 * Three parts: what Charlie is, with the whole invented morning beside it; what
 * it does and may not do, each with its real state; and one invitation. Every
 * outward ability is planned and waits for a person, and the page says so in
 * the same type as the rest.
 */
export function CharliePage() {
  const { hero, close } = charlie
  return (
    <PageFrame>
      <section aria-labelledby="charlie-title" className="page-hero">
        <Container className="page-hero-grid">
          <div className="page-hero-copy">
            <h1 id="charlie-title" className="page-title">
              {hero.headline}
            </h1>
            <p className="page-lede">{hero.lede}</p>
          </div>
          <CharlieScene />
        </Container>
      </section>

      <CharlieAbilities />

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
