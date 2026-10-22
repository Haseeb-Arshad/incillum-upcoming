import { StateMark } from '#/components/charlie.tsx'
import { PageFrame } from '#/components/page-frame.tsx'
import { ButtonLink, Container } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { TrustGlyphIcon } from '#/components/trust.tsx'
import { security } from '#/content/site.ts'

/**
 * /security — in the shape the reference page gives its own, and honest.
 *
 * ── The bands ──────────────────────────────────────────────────────────────
 *
 * 1. A large statement and one action.
 * 2. Protection by design: six cards, a glyph on a tile, each with its state.
 * 3. A dark band of certifications: the frameworks a buyer looks for, one per
 *    row, and where the reference page has *Details* each row has its status —
 *    not held — because there is no report to link to yet.
 * 4. The controls, each with its state.
 * 5. Security questions, answered in full — nothing folded behind a click.
 * 6. One invitation.
 *
 * The dark band is this page's night: the masthead's own scope and this band
 * are the two inverted regions, and nothing inside either knows it is dark.
 */
export function SecurityPage() {
  const { hero, principles, frameworks, controls, questions, contact } = security
  return (
    <PageFrame>
      <section aria-labelledby="security-title" className="page-hero security-hero">
        <Container>
          <div className="page-hero-copy page-hero-copy--wide">
            <p className="security-label">{hero.label}</p>
            <h1 id="security-title" className="security-title">
              {hero.headline}
            </h1>
            <p className="page-lede security-lede">{hero.lede}</p>
            <div>
              <ButtonLink href="/contact" arrow className="desk-cta">
                {hero.action}
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="security-principles" className="security-section">
        <Container>
          <Reveal>
            <h2 id="security-principles" className="glass-heading">
              {principles.headline}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <ul className="security-principles">
              {principles.items.map((principle) => (
                <li key={principle.title} className="security-principle">
                  <span className="security-tile">
                    <TrustGlyphIcon glyph={principle.glyph} />
                  </span>
                  <StateMark state={principle.state} />
                  <h3 className="security-principle-title">{principle.title}</h3>
                  <p className="security-principle-body">{principle.body}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>

      <section
        data-inverted=""
        aria-labelledby="security-frameworks"
        className="security-band"
      >
        <Container className="security-band-grid">
          <Reveal className="security-band-copy">
            <h2 id="security-frameworks" className="glass-heading">
              {frameworks.headline}
            </h2>
            <p className="glass-sources-lede">{frameworks.lede}</p>
            <div>
              <ButtonLink
                href="/contact"
                arrow
                tone="secondary"
                className="security-band-action"
              >
                {frameworks.action}
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <ul className="security-frameworks">
              {frameworks.items.map((framework) => (
                <li key={framework.name} className="security-framework">
                  {/* The status first, at reading size: a row is never read as a badge. */}
                  <p className="security-framework-status">{framework.status}</p>
                  <h3 className="security-framework-name">{framework.name}</h3>
                  <p className="security-framework-covers">{framework.covers}</p>
                </li>
              ))}
            </ul>
            <p className="security-framework-note">{frameworks.note}</p>
          </Reveal>
        </Container>
      </section>

      <section aria-labelledby="security-controls" className="security-section">
        <Container>
          <Reveal className="glass-act-title">
            <h2 id="security-controls" className="glass-heading">
              {controls.headline}
            </h2>
            <p className="glass-sources-lede">{controls.lede}</p>
          </Reveal>
          <Reveal delay={80}>
            <ul className="security-controls">
              {controls.items.map((control) => (
                <li key={control.title} className="security-control">
                  <StateMark state={control.state} />
                  <h3 className="security-control-title">{control.title}</h3>
                  <p className="security-control-body">{control.body}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>

      <section aria-labelledby="security-questions" className="security-section">
        <Container className="questions-grid">
          <Reveal className="questions-intro">
            <h2 id="security-questions" className="glass-heading">
              {questions.headline}
            </h2>
            <p className="glass-sources-lede">{questions.lede}</p>
          </Reveal>
          <Reveal delay={80}>
            <dl className="questions-list">
              {questions.items.map((item) => (
                <div key={item.question} className="questions-item">
                  <dt className="questions-question">{item.question}</dt>
                  <dd className="questions-answer">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </Container>
      </section>

      <section aria-labelledby="security-contact" className="page-close">
        <Container>
          <Reveal className="glass-close-grid">
            <h2 id="security-contact" className="glass-close-title">
              {contact.headline}
            </h2>
            <div className="glass-close-side">
              <p className="glass-close-body">{contact.body}</p>
              <div className="glass-close-actions">
                <ButtonLink href="/contact" arrow className="desk-cta">
                  {contact.action}
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </PageFrame>
  )
}
