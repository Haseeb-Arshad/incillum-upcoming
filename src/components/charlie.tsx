import { CharlieFilm } from '#/components/charlie-film.tsx'
import { abilityIcons, Icon } from '#/components/icons.tsx'
import { ButtonLink, Container } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { ProtectionCards } from '#/components/trust.tsx'
import { charlie } from '#/content/site.ts'

import type { CharlieGlyph } from '#/content/site.ts'

/**
 * Charlie on the front page, and the abilities shared with its own page.
 *
 * The act is a headline, a paragraph, the way to the whole page, and the film
 * of Charlie at work drawn in the site's type (`charlie-film.tsx`). The page
 * itself plays the film cut from Studio (`charlie-reel.tsx`).
 */
export function CharlieAct() {
  const { act } = charlie
  return (
    <section
      id={charlie.anchor}
      aria-labelledby="charlie-act-title"
      className="charlie-act"
    >
      <Container>
        <Reveal className="glass-act-title">
          <h2 id="charlie-act-title" className="glass-heading">
            {act.headline}
          </h2>
          <div className="charlie-act-side">
            <p className="glass-sources-lede">{act.lede}</p>
            <ButtonLink
              href={charlie.path}
              arrow
              tone="secondary"
              className="charlie-more"
            >
              {act.more}
            </ButtonLink>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <CharlieFilm />
        </Reveal>
      </Container>
    </section>
  )
}

/** Charlie's abilities, on the same cards as the trust section. */
export function CharlieAbilities() {
  const { abilities } = charlie
  return (
    <section aria-labelledby="charlie-abilities-title" className="charlie-abilities">
      <Container>
        <Reveal className="glass-act-title">
          <h2 id="charlie-abilities-title" className="glass-heading">
            {abilities.headline}
          </h2>
          <p className="glass-sources-lede">{abilities.lede}</p>
        </Reveal>
        <Reveal delay={80}>
          <ProtectionCards
            items={abilities.items.map((ability) => ({
              key: ability.glyph,
              glyph: <AbilityGlyph glyph={ability.glyph} />,
              title: ability.title,
              body: ability.body,
            }))}
          />
        </Reveal>
      </Container>
    </section>
  )
}

/** An ability's icon, from the product's own set (`icons.tsx`). */
function AbilityGlyph({ glyph }: { glyph: CharlieGlyph }) {
  return <Icon icon={abilityIcons[glyph]} className="trust-glyph" />
}
