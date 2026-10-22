import { CharlieFilm } from '#/components/charlie-film.tsx'
import { SourceIcon } from '#/components/glass-documents.tsx'
import { OrbitMark } from '#/components/orbit-mark.tsx'
import { ButtonLink, Container } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { charlie, glass, home, thread } from '#/content/site.ts'

import type { CharlieGlyph, CharlieMessage, CharlieState } from '#/content/site.ts'
import type { ReactNode } from 'react'

/**
 * Charlie — the scene, the act on the front page, and the abilities.
 *
 * ── The scene ──────────────────────────────────────────────────────────────
 *
 * One quotation's morning, RFQ 8841, set as a team channel: Charlie, an inside
 * sales person and a sales director, from the supplier answer at 03:42 to the
 * approval at 08:14. It is built in the site's type rather than pictured, for
 * the reason the documents are: a generated chat is nonsense when the reader
 * leans in. Its licence is its first line.
 *
 * Every figure in it is read here — from the supplier's confirmation, the
 * 06:50 ledger and the matrix — and put into the message's `{tokens}`, so the
 * channel cannot disagree with the film or the tabs. The two answers on the
 * request card are drawn, not buttons: this is a picture of a decision, not one
 * the reader can take.
 */

const { documents } = glass.sources
const confirmation = documents.supplier
const cost = confirmation.changes.find((change) => change.term === 'Unit cost')
const lead = confirmation.changes.find((change) => change.term === 'Lead time')
const ledger = thread.beats.find((beat) => beat.figures)?.figures ?? []
const figure = (term: string) => ledger.find((entry) => entry.term === term)?.value ?? ''
const moved = home.matrix.rows.find((row) => row.status === 'changed')
const movedLine = moved
  ? glass.film.sheet.lines[moved.line as keyof typeof glass.film.sheet.lines]
  : undefined

const tokens: Record<string, string> = {
  line: moved?.line ?? '',
  was: cost?.was ?? '',
  now: cost?.now ?? '',
  leadWas: lead?.was ?? '',
  leadNow: lead?.now ?? '',
  margin: figure('Expected margin'),
  floor: figure('Commercial floor'),
  priced: String(home.matrix.lines.priced),
  held: String(home.matrix.lines.held),
  units: movedLine?.quantity ?? '',
  part: documents.prices.moving,
}

const fill = (text: string) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => tokens[key] ?? '')

/** A message's text, with each @mention set as a mention. */
function Text({ text }: { text: string }) {
  const parts = fill(text).split(/(@\w+)/)
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith('@') ? (
          <span key={index} className="charlie-mention">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

export function CharlieScene({ count }: { count?: number }) {
  const { scene } = charlie
  const messages = count ? scene.messages.slice(0, count) : scene.messages
  return (
    <figure data-lit="" className="charlie-scene" aria-labelledby="charlie-scene-licence">
      <figcaption id="charlie-scene-licence" className="charlie-licence">
        {scene.licence}
      </figcaption>
      <div className="charlie-window">
        <div className="charlie-window-bar">
          <span className="charlie-channel">{scene.channel}</span>
          <span className="charlie-people" aria-hidden="true">
            {(['charlie', 'sales', 'director'] as const).map((who) => (
              <Avatar key={who} who={who} />
            ))}
          </span>
        </div>
        <ol className="charlie-messages">
          {messages.map((message, index) => (
            <Message key={`${message.at}-${index}`} message={message} />
          ))}
        </ol>
      </div>
    </figure>
  )
}

function Avatar({ who }: { who: CharlieMessage['from'] }) {
  if (who === 'charlie') {
    return (
      <span className="charlie-avatar charlie-avatar--charlie">
        <OrbitMark className="charlie-avatar-mark" />
      </span>
    )
  }
  return (
    <span className="charlie-avatar">{charlie.scene.people[who].name.charAt(0)}</span>
  )
}

function Message({ message }: { message: CharlieMessage }) {
  const person = charlie.scene.people[message.from]
  return (
    <li className="charlie-message" data-from={message.from}>
      <Avatar who={message.from} />
      <div className="charlie-message-body">
        <p className="charlie-message-head">
          <span className="charlie-name">{person.name}</span>
          <span className="charlie-role">{person.role}</span>
          <span className="charlie-at ic-tabular">{message.at}</span>
        </p>
        <p className="charlie-text">
          <Text text={message.text} />
        </p>
        {message.cites ? (
          <p className="charlie-cite">
            <SourceIcon source="supplier" />
            {message.cites}
          </p>
        ) : null}
        {message.ask ? (
          <div className="charlie-ask">
            <p className="charlie-ask-title">{fill(message.ask.title)}</p>
            <p className="charlie-ask-detail">{fill(message.ask.detail)}</p>
            <p className="charlie-ask-answers" aria-hidden="true">
              <span className="charlie-ask-approve">{message.ask.approve}</span>
              <span className="charlie-ask-other">{message.ask.other}</span>
            </p>
            {message.decided ? (
              <p className="charlie-ask-decided">{message.decided}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </li>
  )
}

/**
 * The act on the front page: a headline, a paragraph, the way to the whole
 * page, and the film of Charlie at work (`charlie-film.tsx`).
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

/** Charlie's abilities, each with its real state, on the trust grid's hairlines. */
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
          <ul className="trust-grid">
            {abilities.items.map((ability) => (
              <li key={ability.glyph} className="trust-cell">
                <AbilityGlyph glyph={ability.glyph} />
                <StateMark state={ability.state} />
                <h3 className="trust-cell-title">{ability.title}</h3>
                <p className="trust-cell-body">{ability.body}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  )
}

/** A state as a word and a mark: filled when settled, open in build, dashed when planned. */
export function StateMark({ state }: { state: CharlieState }) {
  const kind =
    state === 'Planned' ? 'planned' : state === 'In build' ? 'building' : 'settled'
  return (
    <p className="trust-state" data-state={kind}>
      {state}
    </p>
  )
}

/**
 * Twenty-four-pixel glyphs on `currentColor`, one per ability, in the trust
 * grid's stroke. No sparkles and no robots: Charlie is a colleague, and its
 * glyphs are the things it handles.
 */
function AbilityGlyph({ glyph }: { glyph: CharlieGlyph }) {
  const paths: Record<CharlieGlyph, ReactNode> = {
    // A page being read, line by line.
    read: (
      <path d="M5.5 2.75h9l4 4v14.5h-13zM14.5 2.75v4h4M8.5 10.5h7M8.5 13.5h7M8.5 16.5h4" />
    ),
    // A figure tied to the page it came from.
    cite: (
      <path d="M3 4.75h8.5v10H3zM5.5 8h3.5M5.5 10.5h3.5M11.5 9.75h3.25a2 2 0 0 1 2 2v2M14.25 14.75h6.5v4.5h-6.5z" />
    ),
    // Two sheets: what came in, and what was made from it.
    make: (
      <path d="M3.25 6.75h9v13.5h-9zM8.75 3.75h9v13.5M5.75 11h4M5.75 14h4M5.75 17h2.5" />
    ),
    // A message to the channel.
    tell: <path d="M3.25 4.75h17.5v11.5H11l-4.5 3.5v-3.5H3.25zM7 9.25h10M7 12.25h6.5" />,
    // A request going out, which waits for an approval first.
    ask: (
      <path d="M2.75 6.25h12.5v10H2.75zM3.25 7l5.75 4.5L14.75 7M17.5 11.25h4M19.75 9l2.25 2.25-2.25 2.25" />
    ),
    // A call.
    call: (
      <path d="M6.5 3.5l2.75 3.25-1.75 2.25a12 12 0 0 0 7.5 7.5l2.25-1.75 3.25 2.75-1.25 3a3 3 0 0 1-3 1.75A16 16 0 0 1 2.75 9.25 3 3 0 0 1 4.5 6.25z" />
    ),
    // A signature on its line: nothing leaves without one.
    approve: (
      <path d="M3 19.25h18M4.5 15.5c1.2-3.4 2.7-6.6 3.9-6.1 1.3.5-1.4 5.3.1 5.4 1.1.1 2.1-2.7 3.1-2.6.9.1.4 2.3 1.4 2.4 1 .1 1.6-1.4 2.6-1.6M17.25 6.25l2.5 2.5-5.5 5.5-3 .5.5-3z" />
    ),
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="trust-glyph"
    >
      {paths[glyph]}
    </svg>
  )
}
