import { useRef } from 'react'

import { CountUp } from '#/components/count-up.tsx'
import { FileIcon } from '#/components/file-icon.tsx'
import { abilityIcons, Icon, showcaseIcons } from '#/components/icons.tsx'
import { OrbitMark } from '#/components/orbit-mark.tsx'
import { Container } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { charlie, evidence, glass, home, showcase } from '#/content/site.ts'
import { useScene } from '#/lib/motion.ts'

import type { Scene } from '#/lib/motion.ts'
import type { CSSProperties, ReactNode } from 'react'

/**
 * The showcase: four scenes from one request, in the bento the owner pointed
 * at and the shape of Hebbia's own product grid.
 *
 *   1. Charlie picks the request up the moment it lands, works through it,
 *      and hands back the two lines that need a person.
 *   2. Every figure goes back to its page: a rate, its clause, highlighted.
 *   3. A supplier's price moves; the margin on the line falls through the
 *      floor; the line is held for a decision.
 *   4. The working is ready, the outward steps wait, and a person says yes.
 *
 * Each panel plays its scene once, when it comes into view (`useScene`), as a
 * sequence of steps on one clock: every step carries its start in
 * milliseconds as `--at`, and the stylesheet does the moving. On the server,
 * without a script and under reduced motion, each is drawn at its last frame,
 * which is the whole story at once. Nothing loops.
 *
 * Every word and value in a scene is the example quotation's, read here from
 * the documents, the matrix, the evidence document and the channel. The
 * drawings are pictures to a screen reader; each panel's title and line say
 * what its scene shows.
 */

const documents = glass.sources.documents
const request = documents.request
const rateClause = documents.agreement.clauses.find((clause) => 'rates' in clause)
const rates = rateClause && 'rates' in rateClause ? rateClause.rates : []
const cited = rates[0]
const held = home.matrix.rows.filter((row) => row.status === 'held')
const { lines } = home.matrix
const fill = (text: string) =>
  text
    .replace('{files}', String(request.attachments.length))
    .replace('{lines}', String(lines.total))
    .replace('{held}', String(lines.held))
    .replace('{priced}', String(lines.priced))

const { visual, record } = evidence
const margin = (cost: number) =>
  `${(((visual.unitPrice - cost) / visual.unitPrice) * 100).toFixed(1)}%`
const before = margin(visual.unitCostBefore)
const after = margin(visual.unitCostAfter)
const floor = `${visual.floorPercent.toFixed(1)}%`
const onScale = (value: string) => `${(Number.parseFloat(value) / visual.scaleMax) * 100}%`
const supplier = visual.sourceReference.split(' · ')[0] ?? visual.sourceReference

const ask = charlie.scene.messages.find((message) => message.ask)
const approver = charlie.scene.people.director
const part = record.part.split(' · ')[0] ?? record.part
const askTitle = ask?.ask?.title.replace('{part}', part) ?? ''
const askDetail = ask?.ask?.detail.replace('{units}', visual.units.toLocaleString('en-GB')) ?? ''

/** A step's start on its scene's clock, in milliseconds. */
const at = (start: number) => ({ ['--at' as string]: start }) as CSSProperties

export function Showcase() {
  return (
    <section id="showcase" aria-labelledby="showcase-title" className="showcase">
      <Container>
        <Reveal className="showcase-intro">
          <h2 id="showcase-title" className="showcase-heading">
            {showcase.headline}
          </h2>
          <p className="showcase-lede">{showcase.lede}</p>
        </Reveal>
        <div className="showcase-grid">
          <Panel name="pickup" title={showcase.pickup.title} body={showcase.pickup.body}>
            {() => <PickupScene />}
          </Panel>
          <Panel name="sources" title={showcase.sources.title} body={showcase.sources.body}>
            {() => <SourcesScene />}
          </Panel>
          <Panel name="floor" title={showcase.floor.title} body={showcase.floor.body}>
            {(scene) => <FloorScene scene={scene} />}
          </Panel>
          <Panel name="approval" title={showcase.approval.title} body={showcase.approval.body}>
            {() => <ApprovalScene />}
          </Panel>
        </div>
      </Container>
    </section>
  )
}

function Panel({
  name,
  title,
  body,
  children,
}: {
  name: string
  title: string
  body: string
  children: (scene: Scene) => ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  const scene = useScene(ref)
  return (
    <article
      ref={ref}
      className="showcase-panel"
      data-panel={name}
      data-scene={scene}
      aria-labelledby={`showcase-${name}`}
    >
      <div className="showcase-copy">
        <h3 id={`showcase-${name}`} className="showcase-title">
          {title}
        </h3>
        <p className="showcase-body">{body}</p>
      </div>
      <div className="showcase-art" aria-hidden="true">
        {children(scene)}
      </div>
    </article>
  )
}

/** Two states of one thing, stacked, so a scene can change it without moving anything round it. */
function Swap({ start, before, after, className }: { start: number; before: ReactNode; after: ReactNode; className?: string }) {
  return (
    <span className={`scene-swap ${className ?? ''}`}>
      <span data-swap="before" style={at(start)}>
        {before}
      </span>
      <span data-swap="after" style={at(start)}>
        {after}
      </span>
    </span>
  )
}

function PickupScene() {
  const { pickup } = showcase
  return (
    <div className="scene-pickup">
      <div className="scene-mail" data-step="" style={at(0)}>
        <p className="scene-mail-head">
          <FileIcon kind="mail" className="scene-mail-icon" />
          <span className="scene-mail-from">
            <strong>{request.from}</strong>
            <span>{request.address}</span>
          </span>
          <span className="scene-time">{pickup.now}</span>
        </p>
        <p className="scene-mail-subject">{request.subject}</p>
        <p className="scene-mail-body">{request.body}</p>
        <ul className="scene-files">
          {request.attachments.map((file) => (
            <li key={file.name}>
              <FileIcon kind={file.format === 'PDF' ? 'pdf' : 'archive'} />
              {file.name}
            </li>
          ))}
        </ul>
        <span className="scene-picked" data-step="" style={at(500)}>
          <OrbitMark className="scene-picked-mark" />
          {pickup.picked}
        </span>
      </div>

      <div className="scene-agent" data-step="" style={at(750)}>
        <p className="scene-agent-head">
          <span className="scene-agent-mark">
            <OrbitMark />
          </span>
          <strong>{charlie.scene.people.charlie.name}</strong>
          <Swap
            start={2600}
            className="scene-status-swap"
            before={<span className="scene-status">{pickup.working}</span>}
            after={
              <span className="scene-status" data-tone="done">
                <Icon icon={showcaseIcons.check} />
                {pickup.done}
              </span>
            }
          />
        </p>
        <ol className="scene-steps">
          {pickup.steps.map((text, index) => (
            <li key={text} data-step="" style={at(950 + index * 420)}>
              <span className="scene-tick" data-pop="" style={at(1250 + index * 420)}>
                <Icon icon={showcaseIcons.check} />
              </span>
              {fill(text)}
            </li>
          ))}
        </ol>
        <p className="scene-result" data-step="" style={at(2750)}>
          {fill(pickup.result)}
        </p>
        <ul className="scene-held" data-step="" style={at(2900)}>
          {held.map((row, index) => (
            <li key={row.line} data-step="" style={at(2950 + index * 160)}>
              <span className="scene-line">{row.line}</span>
              <span className="scene-item">{row.item}</span>
              <span className="scene-chip" data-tone="held">
                <Icon icon={showcaseIcons.held} />
                {home.matrix.statusLabels[row.status]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function SourcesScene() {
  const { sources } = showcase
  return (
    <div className="scene-sources">
      <ul className="scene-tiles">
        {sources.tiles.map((tile, index) => (
          <li
            key={tile.key}
            data-step=""
            data-cited={tile.key === 'agreement' ? 'true' : undefined}
            style={at(index * 90)}
          >
            <FileIcon kind={tile.kind} />
            <span>{tile.label}</span>
          </li>
        ))}
      </ul>
      <div className="scene-cited" data-step="" style={at(900)}>
        <p className="scene-cited-row">
          <span>{cited?.item}</span>
          <strong>{cited?.rate}</strong>
        </p>
        <p className="scene-cited-source">
          <Icon icon={showcaseIcons.source} />
          {sources.from} {documents.agreement.title}, {rateClause?.number}
        </p>
        <p className="scene-clause">
          <span className="scene-clause-number">{rateClause?.number}</span>
          <span>
            {rateClause?.text}{' '}
            <mark data-sweep="" style={at(1450)}>
              {cited?.part} {cited?.rate}
            </mark>
            {rates[1] ? ` · ${rates[1].part} ${rates[1].rate}` : null}
          </span>
        </p>
      </div>
    </div>
  )
}

function FloorScene({ scene }: { scene: Scene }) {
  return (
    <div
      className="scene-floor"
      style={
        {
          '--from-at': onScale(before),
          '--to-at': onScale(after),
          '--floor-at': onScale(floor),
        } as CSSProperties
      }
    >
      <p className="scene-cause" data-step="" style={at(0)}>
        <FileIcon kind="mail" className="scene-cause-icon" />
        <span>
          <strong>{supplier}</strong>
          <span>
            {visual.costLabel} {visual.unitCostBefore.toFixed(2)} → {visual.unitCostAfter.toFixed(2)}
          </span>
        </span>
      </p>
      <p className="scene-floor-ref">{record.reference}</p>
      <p className="scene-floor-figure">
        <CountUp value={after} from={before} scene={scene} delay={700} duration={1500} />
        <Icon icon={showcaseIcons.falling} className="scene-falling" />
      </p>
      <div className="scene-track" style={at(700)}>
        <span className="scene-track-fill" />
        <span className="scene-track-floor">
          <span>
            {visual.floorLabel} {floor}
          </span>
        </span>
        <span className="scene-track-marker" />
      </div>
      <p className="scene-short" data-step="" style={at(2350)}>
        <span>{visual.shortfallLabel}</span>
        <strong>{record.calculation.shortfall.amount}</strong>
      </p>
      <span className="scene-chip scene-floor-held" data-tone="held" data-step="" style={at(2650)}>
        <Icon icon={showcaseIcons.held} />
        {showcase.floor.held}
      </span>
    </div>
  )
}

function ApprovalScene() {
  const { approval } = showcase
  return (
    <div className="scene-approval">
      <div className="scene-outputs">
        <p className="scene-label">{approval.ready}</p>
        <ul>
          {approval.files.map((file, index) => (
            <li key={file.label} data-step="" style={at(index * 130)}>
              <FileIcon kind={file.kind} />
              <span>{file.label}</span>
            </li>
          ))}
        </ul>
        <ul className="scene-actions" data-step="" style={at(420)}>
          {approval.actions.map((action, index) => (
            <li key={action.kind} data-step="" style={at(500 + index * 130)}>
              <Icon icon={abilityIcons[action.kind]} />
              <span className="scene-action-label">{action.label}</span>
              <Swap
                start={2850 + index * 160}
                before={<span className="scene-chip">{approval.waiting}</span>}
                after={
                  <span className="scene-chip" data-tone="done">
                    <Icon icon={showcaseIcons.check} />
                    {approval.sent}
                  </span>
                }
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="scene-ask" data-step="" style={at(950)}>
        <p className="scene-ask-who">
          <span className="scene-avatar">{approver.name.charAt(0)}</span>
          <span>
            <strong>{approver.name}</strong>
            <span>{approver.role}</span>
          </span>
        </p>
        <p className="scene-ask-title">{askTitle}</p>
        <p className="scene-ask-detail">{askDetail}</p>
        <Swap
          start={2550}
          className="scene-ask-swap"
          before={
            <span className="scene-buttons">
              <span className="scene-button" data-primary="">
                {ask?.ask?.approve}
              </span>
              <span className="scene-button">{ask?.ask?.other}</span>
            </span>
          }
          after={
            <span className="scene-stamp">
              <Icon icon={showcaseIcons.check} />
              {ask?.decided}
            </span>
          }
        />
        <Icon icon={showcaseIcons.pointer} className="scene-pointer" />
      </div>
    </div>
  )
}
