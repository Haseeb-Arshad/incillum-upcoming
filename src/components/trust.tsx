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

/**
 * Twenty-four-pixel glyphs on `currentColor`, one per commitment, drawn here
 * in the documents' stroke rather than taken from a package (AGENTS.md §3).
 * No shields, locks-on-globes or stars: they are the badge vocabulary, and
 * this section's whole point is that it is not a badge row.
 */
export function TrustGlyphIcon({ glyph }: { glyph: TrustGlyph }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    'aria-hidden': true,
    focusable: 'false',
    className: 'trust-glyph',
  } as const
  const stroke = {
    stroke: 'currentColor',
    strokeWidth: 1.25,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const

  switch (glyph) {
    // A page of figures that stays where it is: the corner folded, a clasp across it.
    case 'training':
      return (
        <svg {...common}>
          <path d="M5.5 2.75h8.25l4.75 4.75v13.75h-13z" {...stroke} />
          <path d="M13.75 2.75V7.5h4.75M8.5 11h7M8.5 14h4" {...stroke} />
          <rect x="11.75" y="16.25" width="5.5" height="4" rx="0.75" {...stroke} />
          <path d="M13 16.25v-1a1.5 1.5 0 0 1 3 0v1" {...stroke} />
        </svg>
      )
    // A sealed envelope that waits: nothing leaves until somebody sends it.
    case 'sending':
      return (
        <svg {...common}>
          <rect x="2.75" y="5.75" width="15.5" height="11" rx="1" {...stroke} />
          <path d="M3.25 6.5L10.5 12l7.25-5.5" {...stroke} />
          <path d="M19.75 15.25v5M22 15.25v5" {...stroke} />
        </svg>
      )
    // A signature on its line.
    case 'approval':
      return (
        <svg {...common}>
          <path d="M3 19.25h18" {...stroke} />
          <path
            d="M4.5 15.5c1.2-3.4 2.7-6.6 3.9-6.1 1.3.5-1.4 5.3.1 5.4 1.1.1 2.1-2.7 3.1-2.6.9.1.4 2.3 1.4 2.4 1 .1 1.6-1.4 2.6-1.6"
            {...stroke}
          />
          <path d="M17.25 6.25l2.5 2.5-5.5 5.5-3 .5.5-3z" {...stroke} />
        </svg>
      )
    // A bound record, ruled, with an entry being added.
    case 'record':
      return (
        <svg {...common}>
          <rect x="4.75" y="2.75" width="14.5" height="18.5" rx="1" {...stroke} />
          <path d="M8 2.75v18.5M10.75 7.5h5.5M10.75 11h5.5M10.75 14.5h3" {...stroke} />
        </svg>
      )
    // A document wired to the cell it became.
    case 'source':
      return (
        <svg {...common}>
          <path d="M2.75 3.75h6.5l2.5 2.5v8h-9z" {...stroke} />
          <path d="M5 8.5h4.5M5 11h3" {...stroke} />
          <path d="M11.75 10.25h2.5a1.5 1.5 0 0 1 1.5 1.5v3" {...stroke} />
          <rect x="12.75" y="14.75" width="8.5" height="5.5" rx="0.75" {...stroke} />
        </svg>
      )
    // A key: what seals a credential to the organisation it belongs to.
    case 'key':
      return (
        <svg {...common}>
          <circle cx="8" cy="12" r="4.25" {...stroke} />
          <path d="M12.25 12h9M18.5 12v3.25M21.25 12v2.25" {...stroke} />
        </svg>
      )
    // A magnifier over a ruled page: looked at by somebody else.
    case 'test':
      return (
        <svg {...common}>
          <path d="M4.25 3.25h9.5l3 3v6" {...stroke} />
          <path d="M4.25 3.25v17.5h7M7 8h6.5M7 11h4" {...stroke} />
          <circle cx="16.25" cy="16.25" r="3.5" {...stroke} />
          <path d="M18.75 18.75l2.5 2.5" {...stroke} />
        </svg>
      )
    // Two organisations, each in its own box, with clear space between.
    case 'separate':
      return (
        <svg {...common}>
          <rect x="2.75" y="5.75" width="7.75" height="12.5" rx="1" {...stroke} />
          <rect x="13.5" y="5.75" width="7.75" height="12.5" rx="1" {...stroke} />
          <path d="M5.25 9.5h2.75M5.25 12h2.75M16 9.5h2.75M16 12h2.75" {...stroke} />
        </svg>
      )
  }
}
