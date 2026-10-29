import { Icon, showcaseIcons } from '#/components/icons.tsx'
import { Mark } from '#/components/mark.tsx'
import { Container } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { charlie, evidence, glass, home, showcase, thread } from '#/content/site.ts'

/**
 * The showcase: what working with Charlie looks like, in four panels.
 *
 * The shape is the reference the owner pointed at, and the one Hebbia's own
 * product grid uses: a centred heading, then panels of mixed width, each a
 * short title, one line, and a drawing of the product's own objects filling
 * the rest. A tall panel reads a request into lines; a figure panel shows a
 * value with its source; a gauge holds the margin against the floor; a wide
 * panel runs from the files that arrive to the approval that lets anything
 * leave.
 *
 * Every word and value in a drawing is the example quotation's, read here
 * from the documents, the matrix and the 06:50 ledger, so the showcase cannot
 * say anything the rest of the page does not. The drawings are pictures as
 * far as a screen reader is concerned: each panel's title and line say what
 * the drawing shows. No colour, no logo of anybody else's, and nothing moves
 * but the section's one reveal.
 */

const request = glass.sources.documents.request
const lines = home.matrix.rows
const cited = home.matrix.rows.filter((row) => row.status === 'priced').slice(0, 2)

const ledger = thread.beats.find((beat) => beat.figures)?.figures ?? []
const margin = ledger.find((entry) => entry.term === home.matrix.summary.margin)
const floor = ledger.find((entry) => entry.term === 'Commercial floor')
const approve = charlie.scene.messages.find((message) => message.ask)?.ask?.approve ?? ''

export function Showcase() {
  return (
    <section id="showcase" aria-labelledby="showcase-title" className="showcase">
      <Container>
        <Reveal as="h2" className="showcase-heading">
          <span id="showcase-title">{showcase.headline}</span>
        </Reveal>

        <Reveal delay={80} className="showcase-grid">
          <article className="showcase-panel" data-panel="reads" aria-labelledby="showcase-reads">
            <h3 id="showcase-reads" className="showcase-title">
              {showcase.reads.title}
            </h3>
            <p className="showcase-body">{showcase.reads.body}</p>
            <div className="showcase-art" aria-hidden="true">
              <RequestDrawing />
            </div>
          </article>

          <article className="showcase-panel" data-panel="cites" aria-labelledby="showcase-cites">
            <div className="showcase-art" aria-hidden="true">
              <ul className="showcase-cited">
                {cited.map((row) => (
                  <li key={row.line}>
                    <span className="showcase-cell">{row.item}</span>
                    <span className="showcase-source">
                      <Icon icon={showcaseIcons.source} className="showcase-source-icon" />
                      {row.evidence}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="showcase-value">{showcase.cites.value}</p>
            <h3 id="showcase-cites" className="showcase-title">
              {showcase.cites.title}
            </h3>
            <p className="showcase-body">{showcase.cites.body}</p>
          </article>

          <article className="showcase-panel" data-panel="floor" aria-labelledby="showcase-floor">
            <div className="showcase-art" aria-hidden="true">
              <MarginGauge />
            </div>
            <h3 id="showcase-floor" className="showcase-title">
              {showcase.floor.title}
            </h3>
            <p className="showcase-body">{showcase.floor.body}</p>
          </article>

          <article className="showcase-panel" data-panel="flow" aria-labelledby="showcase-flow">
            <h3 id="showcase-flow" className="showcase-title">
              {showcase.flow.title}
            </h3>
            <p className="showcase-body">{showcase.flow.body}</p>
            <div className="showcase-art" aria-hidden="true">
              <ApprovalFlow />
            </div>
          </article>
        </Reveal>
      </Container>
    </section>
  )
}

/** The request as it lands, and the first of its lines underneath, the way the sheet holds them. */
function RequestDrawing() {
  return (
    <div className="showcase-request">
      <div className="showcase-mail">
        <p className="showcase-mail-from">
          <span className="showcase-avatar">
            <Icon icon={showcaseIcons.mail} className="showcase-avatar-icon" />
          </span>
          <span>
            <strong>{request.from}</strong>
            <span>{request.address}</span>
          </span>
        </p>
        <p className="showcase-mail-subject">{request.subject}</p>
        <ul className="showcase-files">
          {request.attachments.map((attachment) => (
            <li key={attachment.name}>
              <b>{attachment.format}</b>
              {attachment.name}
            </li>
          ))}
        </ul>
      </div>
      <span className="showcase-wire" />
      <div className="showcase-sheet">
        <p className="showcase-sheet-head">
          <span>{showcase.reads.lines}</span>
          <span>{home.matrix.lines.total}</span>
        </p>
        <ol>
          {lines.map((row) => (
            <li key={row.line} data-status={row.status}>
              <span className="showcase-line">{row.line}</span>
              <span className="showcase-item">{row.item}</span>
              <span className="showcase-status">{home.matrix.statusLabels[row.status]}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

/**
 * The margin against the floor, as a dial: nought to the evidence document's
 * scale, a tick for every point, the floor marked, and the needle at the
 * ledger's expected margin. Both readings are the ledger's own words.
 */
function MarginGauge() {
  const scale = evidence.visual.scaleMax
  const at = (value: number) => Math.PI * (1 - value / scale)
  const point = (value: number, radius: number) =>
    [120 + radius * Math.cos(at(value)), 124 - radius * Math.sin(at(value))] as const
  const expected = Number.parseFloat(margin?.value ?? '0')
  const [needleX, needleY] = point(expected, 76)
  const [floorInner, floorOuter] = [point(evidence.visual.floorPercent, 84), point(evidence.visual.floorPercent, 108)]

  return (
    <div className="showcase-gauge">
      <svg viewBox="0 0 240 132">
        <path className="showcase-gauge-arc" d="M 20 124 A 100 100 0 0 1 220 124" />
        {Array.from({ length: scale + 1 }, (_, value) => {
          const [x1, y1] = point(value, value % 5 === 0 ? 86 : 92)
          const [x2, y2] = point(value, 100)
          return <line key={value} className="showcase-gauge-tick" x1={x1} y1={y1} x2={x2} y2={y2} />
        })}
        <line
          className="showcase-gauge-floor"
          x1={floorInner[0]}
          y1={floorInner[1]}
          x2={floorOuter[0]}
          y2={floorOuter[1]}
        />
        <line className="showcase-gauge-needle" x1="120" y1="124" x2={needleX} y2={needleY} />
        <circle className="showcase-gauge-hub" cx="120" cy="124" r="6" />
      </svg>
      <dl className="showcase-readings">
        <div>
          <dt>{margin?.term}</dt>
          <dd>{margin?.value}</dd>
        </div>
        <div>
          <dt>{floor?.term}</dt>
          <dd>{floor?.value}</dd>
        </div>
      </dl>
    </div>
  )
}

/** The files that arrive, Charlie in the middle, and the one approval that lets anything leave. */
function ApprovalFlow() {
  return (
    <div className="showcase-flow">
      <ul className="showcase-flow-files">
        {showcase.flow.files.map((file) => (
          <li key={file}>{file}</li>
        ))}
      </ul>
      <span className="showcase-wire" />
      <span className="showcase-node">
        <Mark className="showcase-mark" />
      </span>
      <span className="showcase-wire" />
      <span className="showcase-approve">
        {approve}
        <Icon icon={showcaseIcons.pointer} className="showcase-pointer" />
      </span>
    </div>
  )
}
