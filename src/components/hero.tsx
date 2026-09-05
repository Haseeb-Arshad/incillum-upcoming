import { Container, Label } from '#/components/primitives.tsx'
import { WaitlistForm } from '#/components/waitlist-form.tsx'
import { brand, hero } from '#/content/site.ts'

/** A statement first, an invitation second, then the opening of the night. */
export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="ic-hero">
      <Container>
        <div className="ic-hero-grid">
          <div className="min-w-0">
            <h1 id="hero-heading" className="text-display text-ink">
              <span className="ic-hero-line">
                <span>{hero.headlineStart}</span>
              </span>{' '}
              <span className="ic-hero-line">
                <span>{hero.headlineEnd}</span>
              </span>
            </h1>
            <p className="ic-enter ic-enter-copy ic-hero-lede text-quote text-ink-600">
              {hero.lede}
            </p>
          </div>
          <div
            id="waitlist"
            className="ic-enter ic-enter-form ic-hero-access scroll-mt-28"
          >
            <div className="mb-6">
              <Label className="mb-3">{brand.access}</Label>
              <h2 className="text-heading text-ink">{hero.invitation}</h2>
              <p className="mt-3 text-small text-ink-600">{hero.qualifier}</p>
            </div>
            <WaitlistForm />
            <p className="mt-5 text-small text-ink-400">{hero.assurance}</p>
          </div>
        </div>
        <div className="ic-hero-bridge">
          <p className="max-w-[48ch] text-small text-ink-600">
            <span className="text-ink">{hero.proof}</span> {hero.proofTail}
          </p>
          <a href="#night-story" className="ic-story-link ic-cta">
            <span className="text-small">{hero.storyLink}</span>
            <span aria-hidden="true" className="ic-cta-arrow">
              ↓
            </span>
          </a>
        </div>
      </Container>
    </section>
  )
}
