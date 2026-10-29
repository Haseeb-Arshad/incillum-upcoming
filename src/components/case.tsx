import { Container } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { figures } from '#/content/site.ts'
import { drawLand, view } from '#/lib/world-map.ts'

import type { Source } from '#/content/site.ts'

/**
 * The case: two short sections after the film, in the shapes of the two
 * reference pages the owner pointed at, laid full width on the paper.
 *
 *   1. The odds: a headline, one sentence and four figures, beside the world
 *      in dots with a note over its corner. Speed first, then margin.
 *   2. The week: one bar of a sales rep's working week in three parts, the
 *      share of each set large inside it.
 *
 * Every figure is a third party's, with its source printed under it
 * (`figures` in `content/site.ts`); none is Incillum's. The long form is the
 * private brief at /brief.
 *
 * No colour, no panel, nothing that moves but the site's one reveal and the
 * bar drawing itself in once: the figures are the emphasis.
 */
export function Case() {
  return (
    <div className="case">
      <CaseOdds />
      <CaseWeek />
    </div>
  )
}

function sourceOf(key: Source['key']) {
  return figures.sources.find((source) => source.key === key)
}

/** The sources a section cites, once each, as one quiet line of links. */
function Sources({ keys }: { keys: ReadonlyArray<Source['key']> }) {
  const listed = [...new Set(keys)].map(sourceOf).filter((source) => source !== undefined)
  return (
    <p className="case-sources">
      <span>{figures.sourcesLabel}</span>
      {listed.map((source) => (
        <a key={source.key} href={source.href} rel="noreferrer">
          {source.short}
        </a>
      ))}
    </p>
  )
}

const land = drawLand()

/** The odds: four figures beside the world in dots, as the reference sets its own four. */
function CaseOdds() {
  const { odds } = figures
  return (
    <section id="odds" aria-labelledby="odds-title" className="case-odds">
      <Container className="case-odds-grid">
        <Reveal className="case-odds-copy">
          <h2 id="odds-title" className="case-title">
            {odds.headline}
          </h2>
          <p className="case-lede">{odds.lede}</p>
          <dl className="case-stats">
            {odds.stats.map((stat) => (
              <div key={stat.key} className="case-stat">
                <dt className="case-stat-value">{stat.value}</dt>
                <dd className="case-stat-label">{stat.label}</dd>
              </div>
            ))}
          </dl>
          <Sources keys={odds.stats.map((stat) => stat.source)} />
        </Reveal>

        <Reveal as="figure" delay={80} className="case-map">
          <svg
            viewBox={`0 0 ${view.width} ${view.height}`}
            role="img"
            aria-label={odds.map}
          >
            <path className="case-land" d={land} />
          </svg>
          <figcaption className="case-note">{odds.note}</figcaption>
        </Reveal>
      </Container>
    </section>
  )
}

/** The week: one bar, each part as wide as its share, the share set large inside it. */
function CaseWeek() {
  const { week } = figures
  return (
    <section aria-labelledby="week-title" className="case-week">
      <Container>
        <Reveal className="case-week-head">
          <h2 id="week-title" className="case-title">
            {week.headline}
          </h2>
          <p className="case-lede">{week.lede}</p>
        </Reveal>

        <Reveal as="figure" delay={80} className="case-week-figure">
          <figcaption className="case-key">
            <span>{week.chart}</span>
            <span className="case-legend">
              {week.segments.map((segment) => (
                <span key={segment.key} data-part={segment.key}>
                  {segment.label}
                </span>
              ))}
            </span>
          </figcaption>
          <div
            className="case-bar"
            role="img"
            aria-label={`${week.chart}: ${week.segments
              .map((segment) => `${segment.label.toLowerCase()} ${segment.share}%`)
              .join(', ')}.`}
          >
            {week.segments.map((segment) => (
              <span
                key={segment.key}
                className="case-bar-part"
                data-part={segment.key}
                style={{ ['--case-part' as string]: segment.share }}
              >
                <span className="case-bar-share">{`${segment.share}%`}</span>
              </span>
            ))}
          </div>
          <Sources keys={[week.source]} />
        </Reveal>
      </Container>
    </section>
  )
}
