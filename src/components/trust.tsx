import { Icon, trustIcons } from '#/components/icons.tsx'
import { Container } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { trust } from '#/content/site.ts'

import type { TrustGlyph } from '#/content/site.ts'
import type { ReactNode } from 'react'

/**
 * Data and trust — six commitments about a business's figures.
 *
 * On the front page they are set the way the questions under them are: the
 * heading holds still on the left, and the commitments run down the right as
 * ruled rows, each its icon, a title in the grotesk at reading size, and a
 * plain sentence. A grid of icon cards was the shape of a template, and the
 * page after the case reads as one document, so the two sections that close
 * it share one layout. The commitments say what Incillum does with a
 * business's figures, in the present tense; what the platform does not do yet
 * lives in `requirements/README.md`, not on the page.
 *
 * `ProtectionCards` stays the Charlie page's, whose abilities are cards.
 */
export function Trust() {
  return (
    <section id={trust.anchor} aria-labelledby="trust-title" className="trust">
      <Container className="questions-grid">
        <Reveal className="questions-intro">
          <h2 id="trust-title" className="glass-heading">
            {trust.headline}
          </h2>
          <p className="trust-lede">{trust.lede}</p>
        </Reveal>

        <Reveal delay={80}>
          <dl className="questions-list trust-rules">
            {trust.commitments.map((commitment) => (
              <div key={commitment.glyph} className="questions-item trust-rule">
                <dt className="trust-rule-title">
                  <TrustGlyphIcon glyph={commitment.glyph} />
                  {commitment.title}
                </dt>
                <dd className="questions-answer">{commitment.body}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  )
}

/** The cards: an icon on its tile, a title, a few lines — no box around any of them. */
export function ProtectionCards({
  items,
}: {
  items: ReadonlyArray<{ key: string; glyph: ReactNode; title: string; body: string }>
}) {
  return (
    <ul className="protect-grid">
      {items.map((item) => (
        <li key={item.key} className="protect-card">
          <span className="protect-tile" aria-hidden="true">
            {item.glyph}
          </span>
          <h3 className="protect-title">{item.title}</h3>
          <p className="protect-body">{item.body}</p>
        </li>
      ))}
    </ul>
  )
}

/** A commitment's icon, from the product's own set (`icons.tsx`). */
export function TrustGlyphIcon({ glyph }: { glyph: TrustGlyph }) {
  return <Icon icon={trustIcons[glyph]} className="trust-glyph" />
}
