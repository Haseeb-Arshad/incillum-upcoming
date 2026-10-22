import { Icon, trustIcons } from '#/components/icons.tsx'
import { Container } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { trust } from '#/content/site.ts'

import type { TrustGlyph } from '#/content/site.ts'
import type { ReactNode } from 'react'

/**
 * Data and trust — six cards of protection, in the reference page's shape.
 *
 * A glyph on a tile, a title and one line: the reference page closes its
 * argument this way, and so does this one. The cards say what Incillum does
 * with a business's figures, in the present tense; what the platform does not
 * do yet lives in `requirements/README.md`, not on the card.
 *
 * `ProtectionCards` is shared with the Charlie page, whose abilities are the
 * same shape.
 */
export function Trust() {
  return (
    <section id={trust.anchor} aria-labelledby="trust-title" className="trust ic-textured">
      <Container>
        <Reveal className="glass-act-title">
          <h2 id="trust-title" className="glass-heading">
            {trust.headline}
          </h2>
          <p className="glass-sources-lede">{trust.lede}</p>
        </Reveal>

        <Reveal delay={80}>
          <ProtectionCards
            items={trust.commitments.map((commitment) => ({
              key: commitment.glyph,
              glyph: <TrustGlyphIcon glyph={commitment.glyph} />,
              title: commitment.title,
              body: commitment.body,
            }))}
          />
        </Reveal>
      </Container>
    </section>
  )
}

/** Cards on a hairline grid: a glyph on its tile, a title, one line. */
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
