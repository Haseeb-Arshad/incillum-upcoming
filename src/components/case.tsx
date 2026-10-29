import { useRef } from 'react'

import { CountUp } from '#/components/count-up.tsx'
import { Container } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { figures } from '#/content/site.ts'
import { useScene } from '#/lib/motion.ts'
import { drawLand, project, view } from '#/lib/world-map.ts'

import type { Source } from '#/content/site.ts'
import type { CSSProperties } from 'react'

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
 * Each plays once as it comes into view (`useScene`): the four figures count
 * up to themselves, requests land one after another across the map, and the
 * bar draws in with its shares counting. Nothing loops, and on the server,
 * without a script and under reduced motion every figure is simply printed.
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

/**
 * Where requests land on the map: six industrial cities in the reference's
 * crop, unnamed on the page. They say "from anywhere, at any hour", not "from
 * these customers": nothing on the map is a claim.
 */
const landings = [
  [-87.6, 41.9],
  [-100.3, 25.7],
  [4.5, 51.9],
  [-46.6, -23.5],
  [3.4, 6.5],
  [29, 41],
].map(([longitude = 0, latitude = 0]) => {
  const [x, y] = project(longitude, latitude)
  return { left: `${(x / view.width) * 100}%`, top: `${(y / view.height) * 100}%` }
})

/** The odds: four figures beside the world in dots, as the reference sets its own four. */
function CaseOdds() {
  const { odds } = figures
  const ref = useRef<HTMLElement>(null)
  const scene = useScene(ref, 0.3)
  return (
    <section ref={ref} id="odds" aria-labelledby="odds-title" className="case-odds" data-scene={scene}>
      <Container className="case-odds-grid">
        <Reveal className="case-odds-copy">
          <h2 id="odds-title" className="case-title">
            {odds.headline}
          </h2>
          <p className="case-lede">{odds.lede}</p>
          <dl className="case-stats">
            {odds.stats.map((stat, index) => (
              <div key={stat.key} className="case-stat">
                <dt className="case-stat-value">
                  <CountUp value={stat.value} scene={scene} delay={250 + index * 180} />
                </dt>
                <dd className="case-stat-label">{stat.label}</dd>
              </div>
            ))}
          </dl>
          <Sources keys={odds.stats.map((stat) => stat.source)} />
        </Reveal>

        <Reveal as="figure" delay={80} className="case-map">
          <div className="case-map-frame">
            <svg viewBox={`0 0 ${view.width} ${view.height}`} role="img" aria-label={odds.map}>
              <path className="case-land" d={land} />
            </svg>
            {landings.map((place, index) => (
              <span
                key={index}
                className="case-landing"
                aria-hidden="true"
                style={{ ...place, ['--at' as string]: 600 + index * 380 }}
              />
            ))}
          </div>
          <figcaption className="case-note">{odds.note}</figcaption>
        </Reveal>
      </Container>
    </section>
  )
}

/** The week: one bar, each part as wide as its share, the share set large inside it. */
function CaseWeek() {
  const { week } = figures
  const ref = useRef<HTMLElement>(null)
  const scene = useScene(ref, 0.35)
  return (
    <section ref={ref} aria-labelledby="week-title" className="case-week" data-scene={scene}>
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
            {week.segments.map((segment, index) => (
              <span
                key={segment.key}
                className="case-bar-part"
                data-part={segment.key}
                style={
                  {
                    '--case-part': segment.share,
                    '--at': 300 + index * 260,
                  } as CSSProperties
                }
              >
                <span className="case-bar-share">
                  <CountUp value={`${segment.share}%`} scene={scene} delay={500 + index * 260} duration={1100} />
                </span>
              </span>
            ))}
          </div>
          <Sources keys={[week.source]} />
        </Reveal>
      </Container>
    </section>
  )
}
