import { CharlieAbilities } from '#/components/charlie.tsx'
import { CharlieReel, seekReel } from '#/components/charlie-reel.tsx'
import { Icon, reelIcons } from '#/components/icons.tsx'
import { OrbitMark } from '#/components/orbit-mark.tsx'
import { PageFrame } from '#/components/page-frame.tsx'
import { ButtonLink, Container } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { charlie } from '#/content/site.ts'

/**
 * /charlie — the colleague inside Incillum, shown at work.
 *
 * A headline and the two ways on; the film of Charlie working one request in
 * Incillum Studio, cut from Studio's own pages; the same six steps again, each
 * with a still of the page it happens on and a way back into the film at that
 * step; what Charlie does; and one invitation.
 */
export function CharliePage() {
  const { hero, steps, close } = charlie
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

      <section aria-labelledby="charlie-steps-title" className="cp-steps">
        <Container>
          <Reveal className="glass-act-title">
            <h2 id="charlie-steps-title" className="glass-heading">
              {steps.headline}
            </h2>
            <p className="glass-sources-lede">{steps.lede}</p>
          </Reveal>
          <ol className="cp-step-list">
            {steps.items.map((step, index) => (
              <li key={step.key} className="cp-step">
                <Reveal className="cp-step-copy">
                  <p className="cp-step-number">
                    <span className="ic-tabular">{String(index + 1).padStart(2, '0')}</span>
                    {step.label}
                  </p>
                  <h3 className="cp-step-title">{step.title}</h3>
                  <p className="cp-step-body">{step.body}</p>
                  <button type="button" className="cp-watch" onClick={() => seekReel(step.at)}>
                    <Icon icon={reelIcons.play} className="cp-watch-icon" />
                    {charlie.reel.controls.watch}
                  </button>
                </Reveal>
                <Reveal delay={80} className="cp-step-still">
                  <img
                    src={step.still}
                    alt={step.alt}
                    width={1600}
                    height={1000}
                    loading="lazy"
                    decoding="async"
                  />
                </Reveal>
              </li>
            ))}
          </ol>
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
