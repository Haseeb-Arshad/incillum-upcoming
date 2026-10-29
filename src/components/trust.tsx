import { useRef } from 'react'

import { Avatar } from '#/components/avatar.tsx'
import { FileIcon } from '#/components/file-icon.tsx'
import { Icon, showcaseIcons, trustIcons } from '#/components/icons.tsx'
import { OrbitMark } from '#/components/orbit-mark.tsx'
import { Container } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { at, Swap } from '#/components/scene.tsx'
import { charlie, evidence, glass, people, trust } from '#/content/site.ts'
import { useScene } from '#/lib/motion.ts'

import type { TrustGlyph } from '#/content/site.ts'
import type { CSSProperties, ReactNode } from 'react'

/**
 * Data and trust: "Nothing leaves without you.", drawn as the system it is.
 *
 * The section was six commitments in ruled rows, which read as a page of
 * answers, and then a small diagram, which read as a sketch. It is now a
 * board: the emails that arrive (a customer's request and a supplier's
 * answer, each a real email with its sender); your organisation, drawn as a
 * boundary, with your price lists, costs, agreements and quotations inside it
 * and Charlie working among them; the path to model training, drawn and
 * refused; the one gate, with a person's approval on it; and what goes out
 * only after that, to the customer and the supplier. The six commitments
 * follow as a spec grid, each the thing the board just showed, in plain words.
 *
 * ── How it is laid ─────────────────────────────────────────────────────────
 *
 * On a wide screen the board is one picture on a 1120 by 620 grid: every card
 * is placed by its own corner and size in those units (`place`), the curved
 * connectors are one SVG on the same grid, and every size inside is a
 * multiple of `--u`, one design pixel, which is the board's own width over
 * 1120. So it scales as a whole and nothing ever reflows or overlaps. Below
 * that it is a column, the same cards in the same order with a dotted
 * connector between each group, and no SVG.
 *
 * A card's height is part of its placement, so it has to be the height of what
 * is in it: an email whose two attachments ran past the card's border was
 * the first thing the owner saw wrong with this board. Each card is therefore
 * sized from its own rows (`SIZE`), the connectors leave the middle of the
 * card they belong to, and `e2e/glass.spec.ts` measures every card's contents
 * against its padding at every width.
 *
 * ── How it plays ───────────────────────────────────────────────────────────
 *
 * Once, when it comes into view (`useScene`), on one clock: the emails land
 * and their lines draw into the organisation, the cards and Charlie settle,
 * the line to model training is struck out, the quotation travels to the gate,
 * the approval is given, and only then do the lines to the customer and the
 * supplier draw and their cards arrive. On the server, without a script and
 * under reduced motion it is drawn whole, which is its last frame. It is one
 * image to a screen reader, described in full by `trust.diagram.label`; the
 * commitments under it are real text. Everything on it is the example's: the
 * emails, people, figures and approval are read from the documents, the
 * evidence document and the channel (`charlie.scene`). What the platform
 * does not do yet lives in `requirements/README.md`, not on the page.
 *
 * ── Two ways to draw two things ────────────────────────────────────────────
 *
 * The owner asked to see two versions of the cards and of the approval, to
 * choose between them (29 October 2026). `TrustOptions` is that choice, and
 * `/lab/trust` shows every combination. Whichever is chosen, the other is
 * deleted: the board is meant to have one way of drawing each thing.
 *
 * - `cards`: `named` writes who each email is from (their name and role)
 *   beside their portrait; `faces` leaves the name out and lets the portrait
 *   and the subject say it.
 * - `approve`: `button` is a small, quiet button that gives way to a record of
 *   the approval; `slide` is a track the approval is slid along.
 *
 * `ProtectionCards` stays the Charlie page's, whose abilities are cards.
 */

export interface TrustOptions {
  /** Whether the emails and the people they go to carry a name, or only a face. */
  cards: 'named' | 'faces'
  /** What the approval is: a button that settles into a record, or a slide. */
  approve: 'button' | 'slide'
}

/** What the front page draws. */
export const trustChoice: TrustOptions = { cards: 'named', approve: 'button' }

const BOARD = { width: 1120, height: 620 } as const

/** A card's corner and size, in board units, as percentages of the board. */
const place = (x: number, y: number, width: number, height: number) =>
  ({
    '--x': `${(x / BOARD.width) * 100}%`,
    '--y': `${(y / BOARD.height) * 100}%`,
    '--w': `${(width / BOARD.width) * 100}%`,
    '--h': `${(height / BOARD.height) * 100}%`,
  }) as CSSProperties

/** The organisation's box on the board: what stays inside it is placed from its corner. */
const BOUNDARY = { x: 272, y: 20, width: 440, height: 480 } as const
const inside = (x: number, y: number, width: number, height: number) =>
  ({
    '--x': `${((x - BOUNDARY.x) / BOUNDARY.width) * 100}%`,
    '--y': `${((y - BOUNDARY.y) / BOUNDARY.height) * 100}%`,
    '--w': `${(width / BOUNDARY.width) * 100}%`,
    '--h': `${(height / BOUNDARY.height) * 100}%`,
  }) as CSSProperties

/** Charlie's input: the line the two emails are centred on. */
const MIDLINE = 240
/** The gate sits a little above it, so the lines out of it are level with the room between the two cards. */
const GATE_MID = 235
const GATE = { x: 750, width: 180, height: 232 } as const
/** Where the two cards that go out are centred, and their column. */
const OUT = { x: 968, width: 152, mids: [156, 314] } as const
const GAP = 20

/**
 * Each card's height, from what is in it: its padding, its rows, and a little
 * room under the last one. The request has a sender, a subject and two files;
 * the answer a sender, a subject and one; what goes out a face, a line and a
 * status. A name or the lack of one takes the same room, so the two ways of
 * drawing the cards share one layout.
 */
const SIZE = { request: 164, reply: 132, out: 124 } as const
const TOP = MIDLINE - (SIZE.request + GAP + SIZE.reply) / 2
const REQUEST_MID = TOP + SIZE.request / 2
const REPLY_MID = TOP + SIZE.request + GAP + SIZE.reply / 2

const request = glass.sources.documents.request
const { visual, record } = evidence
const ask = charlie.scene.messages.find((message) => message.ask)
const part = record.part.split(' · ')[0] ?? record.part
const askTitle = ask?.ask?.title.replace('{part}', part) ?? ''
const askDetail =
  ask?.ask?.detail.replace('{units}', visual.units.toLocaleString('en-GB')) ?? ''
const supplierSubject = visual.sourceReference.split(' · ')[0] ?? visual.sourceReference
/** The gate already says who decides, so the record of it says only that it was, and when. */
const decided = (ask?.decided ?? '').replace(` by ${people.director.name}`, '')

/**
 * The connectors, in board units: each leaves one card at its edge and
 * reaches the next at its edge. `from` is when it starts to draw, in
 * milliseconds on the scene's clock, and `travel` carries a pulse along it.
 */
const wires = [
  {
    key: 'request',
    d: `M232 ${REQUEST_MID}C268 ${REQUEST_MID} 266 ${MIDLINE} 304 ${MIDLINE}`,
    from: 300,
    travel: true,
  },
  {
    key: 'reply',
    d: `M232 ${REPLY_MID}C268 ${REPLY_MID} 266 ${MIDLINE} 304 ${MIDLINE}`,
    from: 420,
    travel: true,
  },
  { key: 'sheet-1', d: 'M390 240C436 240 432 137 478 137', from: 1500 },
  { key: 'sheet-2', d: 'M390 240C436 240 432 205 478 205', from: 1560 },
  { key: 'sheet-3', d: 'M390 240C436 240 432 273 478 273', from: 1620 },
  { key: 'sheet-4', d: 'M390 240C436 240 432 341 478 341', from: 1680 },
  {
    key: 'gate',
    d: `M688 341C722 341 716 ${GATE_MID} 750 ${GATE_MID}`,
    from: 2000,
    travel: true,
  },
  {
    key: 'to-buyer',
    d: `M930 ${GATE_MID}C950 ${GATE_MID} 948 ${OUT.mids[0]} 968 ${OUT.mids[0]}`,
    from: 3250,
    travel: true,
    after: true,
  },
  {
    key: 'to-supplier',
    d: `M930 ${GATE_MID}C950 ${GATE_MID} 948 ${OUT.mids[1]} 968 ${OUT.mids[1]}`,
    from: 3250,
    travel: true,
    after: true,
  },
] as const

/**
 * What goes out waits for the approval, so it starts when the approval is
 * given: the slide takes longer to give than a press does, and what follows
 * it is later by the difference.
 */
const lateness = { button: 0, slide: 600 } as const

export function Trust() {
  return (
    <section id={trust.anchor} aria-labelledby="trust-title" className="trust">
      <Container>
        <Reveal className="trust-head">
          <h2 id="trust-title" className="glass-heading trust-title">
            {trust.headline}
          </h2>
          <p className="trust-lede">{trust.lede}</p>
        </Reveal>

        <TrustBoard {...trustChoice} />

        <ul className="trust-commitments">
          {trust.commitments.map((commitment) => (
            <li key={commitment.glyph} className="trust-commitment">
              <p className="trust-commitment-title">
                <TrustGlyphIcon glyph={commitment.glyph} />
                {commitment.title}
              </p>
              <p className="trust-commitment-body">{commitment.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

/** The board alone: what the section draws, and what `/lab/trust` compares. */
export function TrustBoard({ cards, approve }: TrustOptions) {
  const ref = useRef<HTMLDivElement>(null)
  const scene = useScene(ref, 0.25)
  const { diagram } = trust
  const approver = people.director
  const late = lateness[approve]

  return (
    <div
      ref={ref}
      className="trust-map"
      data-scene={scene}
      data-cards={cards}
      data-approve={approve}
      role="img"
      aria-label={diagram.label}
    >
      <div className="trust-board">
        <div className="trust-stage">
          <svg
            className="trust-wires"
            viewBox={`0 0 ${BOARD.width} ${BOARD.height}`}
            aria-hidden="true"
          >
            {wires.map((wire) => (
              <g key={wire.key} style={at(wire.from + ('after' in wire ? late : 0))}>
                <path className="trust-line" d={wire.d} pathLength={1} />
                {'travel' in wire ? (
                  <path className="trust-pulse" d={wire.d} pathLength={1} />
                ) : null}
              </g>
            ))}
            <path className="trust-refusal" d="M492 500V570" />
          </svg>

          <div className="trust-comes">
            <p className="trust-caption trust-pos" style={place(0, TOP - 30, 232, 20)}>
              {diagram.comes}
            </p>
            <Email
              style={place(0, TOP, 232, SIZE.request)}
              step={0}
              person="buyer"
              cards={cards}
              subject={request.subject}
            >
              {request.attachments.map((file) => (
                <li key={file.name} className="trust-attachment">
                  <FileIcon kind={file.format === 'PDF' ? 'pdf' : 'archive'} />
                  {file.name}
                </li>
              ))}
            </Email>
            <Email
              style={place(0, TOP + SIZE.request + GAP, 232, SIZE.reply)}
              step={140}
              person="supplier"
              cards={cards}
              subject={supplierSubject}
            >
              <li className="trust-attachment" data-plain="">
                {visual.unitCostBefore.toFixed(2)} → {visual.unitCostAfter.toFixed(2)}
              </li>
            </Email>
          </div>
          <span className="trust-link" aria-hidden="true" />

          <div
            className="trust-boundary trust-pos"
            data-step=""
            style={{
              ...place(BOUNDARY.x, BOUNDARY.y, BOUNDARY.width, BOUNDARY.height),
              ...at(500),
            }}
          >
            <p className="trust-boundary-label">
              <Icon icon={showcaseIcons.lock} />
              {diagram.inside}
            </p>
            <p className="trust-boundary-note">{diagram.insideNote}</p>

            <div
              className="trust-charlie trust-pos"
              data-step=""
              style={{ ...inside(296, 190, 102, 100), ...at(1150) }}
            >
              <span className="trust-charlie-tile">
                <OrbitMark />
              </span>
              <span className="trust-charlie-name">
                {charlie.scene.people.charlie.name}
              </span>
            </div>

            {diagram.data.map((item, index) => (
              <div
                key={item.label}
                className="trust-data trust-pos"
                data-step=""
                style={{
                  ...inside(478, 110 + index * 68, 210, 54),
                  ...at(800 + index * 120),
                }}
              >
                <FileIcon kind={item.kind} />
                {item.label}
              </div>
            ))}

            <ul className="trust-guards trust-pos" style={inside(296, 410, 392, 70)}>
              {diagram.guards.map((guard, index) => (
                <li key={guard.glyph} data-step="" style={at(2100 + index * 110)}>
                  <Icon icon={trustIcons[guard.glyph]} />
                  {guard.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="trust-refused trust-pos" style={place(392, 500, 200, 112)}>
            <span className="trust-never" data-pop="" style={at(2200)}>
              <Icon icon={showcaseIcons.never} />
              {diagram.never}
            </span>
            <div className="trust-training" data-step="" style={at(1900)}>
              <Icon icon={showcaseIcons.training} />
              {diagram.training}
            </div>
          </div>
          <span className="trust-link" aria-hidden="true" />

          <div
            className="trust-gate trust-pos"
            data-step=""
            style={{
              ...place(GATE.x, GATE_MID - GATE.height / 2, GATE.width, GATE.height),
              ...at(2000),
            }}
          >
            <p className="trust-gate-label">{diagram.gate}</p>
            <div className="trust-gate-ask">
              <p className="trust-gate-title">{askTitle}</p>
              <p className="trust-gate-detail">{askDetail}</p>
            </div>
            <p className="trust-gate-who">
              <strong>{approver.name}</strong>
              <span>{approver.role}</span>
            </p>
            {approve === 'button' ? (
              <ApproveButton approve={ask?.ask?.approve ?? ''} />
            ) : (
              <ApproveSlide approve={ask?.ask?.approve ?? ''} />
            )}
          </div>
          <span className="trust-link" aria-hidden="true" />

          <div className="trust-goes">
            <p
              className="trust-caption trust-pos"
              style={place(OUT.x, OUT.mids[0] - SIZE.out / 2 - 34, OUT.width, 20)}
            >
              {diagram.goes}
            </p>
            {diagram.out.map((item, index) => {
              const mid = OUT.mids[index] ?? OUT.mids[0]
              return (
                <div
                  key={item.person}
                  className="trust-out trust-pos"
                  data-step=""
                  style={{
                    ...place(OUT.x, mid - SIZE.out / 2, OUT.width, SIZE.out),
                    ...at(3500 + index * 140 + late),
                  }}
                >
                  <p className="trust-out-who">
                    <Avatar person={item.person} className="trust-out-avatar" />
                    {cards === 'named' ? <span>{people[item.person].name}</span> : null}
                    {cards === 'faces' ? (
                      <span className="trust-out-mail">
                        <FileIcon kind="mail" />
                      </span>
                    ) : null}
                  </p>
                  <p className="trust-out-what">
                    {item.label}
                    {cards === 'named' ? (
                      <span className="trust-out-mail">
                        <FileIcon kind="mail" />
                      </span>
                    ) : null}
                  </p>
                  <Swap
                    start={3900 + index * 140 + late}
                    className="trust-sent"
                    before={<span className="trust-chip"> </span>}
                    after={
                      <span className="trust-chip" data-done="">
                        <Icon icon={showcaseIcons.check} />
                        {item.status}
                      </span>
                    }
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * A real email: who sent it, the app it is in, its subject and what came with
 * it. Named, it says who in words beside their portrait; as a face, the
 * portrait alone says who.
 */
function Email({
  person,
  subject,
  cards,
  step,
  style,
  children,
}: {
  person: 'buyer' | 'supplier'
  subject: string
  cards: TrustOptions['cards']
  step: number
  style: CSSProperties
  children: ReactNode
}) {
  const sender = people[person]
  return (
    <article
      className="trust-email trust-pos"
      data-step=""
      style={{ ...style, ...at(step) }}
    >
      <div className="trust-email-from">
        <Avatar person={person} className="trust-email-avatar" />
        {cards === 'named' ? (
          <p className="trust-email-name">
            <strong>{sender.name}</strong>
            <span>{sender.role}</span>
          </p>
        ) : null}
        <FileIcon kind="mail" className="trust-email-mail" />
      </div>
      <p className="trust-email-subject">{subject}</p>
      <ul className="trust-email-files">{children}</ul>
    </article>
  )
}

/**
 * The approval as a small button. It is one object from start to finish: the
 * pointer presses it, its ink drains to the paper's tone, and its words
 * change from the ask to the record of the answer, so the card never loses its
 * control for a frame and nothing on it moves.
 */
function ApproveButton({ approve }: { approve: string }) {
  return (
    <div className="trust-approve-wrap">
      <span className="trust-approve" style={at(2740)}>
        <span className="trust-approve-ask">{approve}</span>
        <span className="trust-approve-done">
          <Icon icon={showcaseIcons.check} />
          {decided}
        </span>
      </span>
      <Icon icon={showcaseIcons.pointer} className="trust-pointer" />
    </div>
  )
}

/**
 * The approval as a slide: a track with a knob at one end and the words
 * between. Given, the knob is carried across, the track fills behind it and the
 * words are traded for the record. It takes a deliberate gesture, which is the
 * point of the board.
 */
function ApproveSlide({ approve }: { approve: string }) {
  return (
    <div className="trust-slide">
      <span className="trust-slide-fill" aria-hidden="true" />
      <Swap
        start={3700}
        className="trust-slide-text"
        before={<span>{approve}</span>}
        after={<span>{decided}</span>}
      />
      <span className="trust-slide-knob">
        <Icon icon={showcaseIcons.onward} className="trust-slide-arrow" />
        <Icon icon={showcaseIcons.check} className="trust-slide-check" />
        <Icon icon={showcaseIcons.pointer} className="trust-slide-pointer" />
      </span>
    </div>
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
