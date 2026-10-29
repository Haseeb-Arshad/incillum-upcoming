import { useRef } from 'react'

import { Avatar } from '#/components/avatar.tsx'
import { FileIcon } from '#/components/file-icon.tsx'
import { abilityIcons, Icon, showcaseIcons } from '#/components/icons.tsx'
import { OrbitMark } from '#/components/orbit-mark.tsx'
import { Container } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { at, Swap } from '#/components/scene.tsx'
import { charlie, people } from '#/content/site.ts'
import { fill } from '#/lib/channel.ts'
import { useScene } from '#/lib/motion.ts'

import type { CharlieMessage, PersonKey } from '#/content/site.ts'
import type { ReactNode } from 'react'

/**
 * Charlie as an agent: the three things the page says under its film.
 *
 * The film shows one request worked, and what used to follow it said the same
 * six steps again, a still for each. The owner asked for something different
 * on 29 October 2026: what Charlie is as an agent. So this is three sections,
 * none of which the film already says:
 *
 * 1. **Talk to it** (`CharlieConversation`): a team channel, with the
 *    morning's messages in it as they were (`charlie.scene`): Charlie tells
 *    the team, a person asks it for something in plain words, it answers with
 *    what it has drafted and waits for the person who decides, who does.
 * 2. **Who it talks to** (`CharlieReach`): the team, the suppliers and the
 *    telephone, each drawn as the thing it is (a message, an email, a call)
 *    with what has to happen before it leaves.
 * 3. **Where it stops** (`CharlieLimits`): what it does alone, what waits for a
 *    person, what it never does.
 *
 * Every figure is read from the same documents as the front page's night, by
 * `fill`, and nothing here is written in, so the page cannot disagree with it.
 * The channel plays once when it comes into view and is still, at its last
 * message, for a page without a script and under reduced motion.
 */

const { agent } = charlie
const { channel, messages } = charlie.scene
const speakers = {
  charlie: charlie.scene.people.charlie,
  sales: people.sales,
  director: people.director,
}
const portraitOf: Record<CharlieMessage['from'], PersonKey | null> = {
  charlie: null,
  sales: 'sales',
  director: 'director',
}

export function CharlieConversation() {
  const { talk } = agent
  return (
    <section aria-labelledby="charlie-talk-title" className="agent-talk">
      <Container>
        <div className="agent-talk-grid">
          <Reveal className="agent-talk-copy">
            <h2 id="charlie-talk-title" className="glass-heading">
              {talk.headline}
            </h2>
            <p className="glass-sources-lede">{talk.lede}</p>
            <ul className="agent-points">
              {talk.points.map((point) => (
                <li key={point.glyph}>
                  <span className="agent-tile" aria-hidden="true">
                    <Icon icon={abilityIcons[point.glyph]} />
                  </span>
                  <h3 className="agent-point-title">{point.title}</h3>
                  <p className="agent-point-body">{point.body}</p>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={80}>
            <Channel />
          </Reveal>
        </div>
      </Container>
    </section>
  )
}

/** The team's channel, as it was that morning. It plays once as it comes into view. */
function Channel() {
  const ref = useRef<HTMLDivElement>(null)
  const scene = useScene(ref, 0.3)
  const { talk } = agent
  // The approval comes once the request is drafted, and the line that says it was sent comes after the approval.
  const asked = messages.findIndex((message) => message.ask)
  const approvedAt = asked * 800 + 1100

  return (
    <div ref={ref} className="agent-channel" data-scene={scene}>
      <p className="agent-channel-head">
        <span>{channel}</span>
        <span className="agent-members">
          <span className="agent-members-label">{talk.members}</span>
          <span className="agent-charlie agent-charlie--small" aria-hidden="true">
            <OrbitMark />
          </span>
          <Avatar person="sales" className="agent-avatar agent-avatar--small" />
          <Avatar person="director" className="agent-avatar agent-avatar--small" />
        </span>
      </p>
      <ol className="agent-messages">
        {messages.map((message, index) => {
          const who = speakers[message.from]
          const portrait = portraitOf[message.from]
          // What follows the request waits for the approval; the rest arrive one after another.
          const start = index > asked && asked >= 0 ? approvedAt + 900 : index * 800
          return (
            <li
              key={`${message.at}-${index}`}
              className="agent-message"
              data-step=""
              style={at(start)}
            >
              {portrait ? (
                <Avatar person={portrait} className="agent-avatar" />
              ) : (
                <span className="agent-charlie" aria-hidden="true">
                  <OrbitMark />
                </span>
              )}
              <div className="agent-message-body">
                <p className="agent-meta">
                  <strong>{who.name}</strong>
                  <span className="agent-role">{who.role}</span>
                  <time>{message.at}</time>
                </p>
                <p className="agent-text">{mentioned(fill(message.text))}</p>
                {message.cites ? (
                  <p className="agent-cite">
                    <FileIcon kind="mail" />
                    {message.cites}
                  </p>
                ) : null}
                {message.ask ? (
                  <div className="agent-draft">
                    <p className="agent-draft-title">
                      <FileIcon kind="mail" />
                      <span>
                        {fill(message.ask.title)}
                        <span>{fill(message.ask.detail)}</span>
                      </span>
                    </p>
                    <Swap
                      start={approvedAt}
                      className="agent-draft-status"
                      before={
                        <span className="scene-chip">
                          {talk.waiting} {people.director.name}
                        </span>
                      }
                      after={
                        <span className="scene-chip" data-tone="done">
                          <Icon icon={showcaseIcons.check} />
                          {message.decided}
                        </span>
                      }
                    />
                  </div>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/** A message opens by naming who it is for, and a channel sets that name apart. */
function mentioned(text: string): ReactNode {
  const [first = '', ...rest] = text.split(' ')
  if (!first.startsWith('@')) return text
  return (
    <>
      <span className="agent-mention">{first}</span> {rest.join(' ')}
    </>
  )
}

/** Who Charlie talks to: the team, the suppliers and the telephone, each drawn as itself. */
export function CharlieReach() {
  const { reach } = agent
  return (
    <section aria-labelledby="charlie-reach-title" className="agent-reach">
      <Container>
        <Reveal className="glass-act-title">
          <h2 id="charlie-reach-title" className="glass-heading">
            {reach.headline}
          </h2>
          <p className="glass-sources-lede">{reach.lede}</p>
        </Reveal>
        <Reveal delay={80}>
          <ul className="agent-reach-grid">
            {reach.items.map((item) => (
              <li key={item.key} className="agent-reach-card">
                <div className="agent-art" aria-hidden="true">
                  <Art kind={item.key} />
                </div>
                <h3 className="agent-reach-title">
                  <Icon icon={abilityIcons[item.glyph]} />
                  {item.title}
                </h3>
                <p className="agent-reach-body">{item.body}</p>
                <p className="agent-reach-waits">{item.waits}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  )
}

const ready = messages.find(
  (message) => message.from === 'charlie' && message.text.startsWith('@'),
)
const askMessage = messages.find((message) => message.ask)

/** One small object of each kind, from the same messages: what it looks like when Charlie reaches them. */
function Art({ kind }: { kind: 'team' | 'suppliers' | 'phone' }) {
  const { call, items } = agent.reach
  if (kind === 'team') {
    return (
      <div className="agent-art-card">
        <p className="agent-art-from">
          <span className="agent-charlie agent-charlie--small">
            <OrbitMark />
          </span>
          <strong>{charlie.scene.people.charlie.name}</strong>
          <span className="agent-art-sub">{channel}</span>
        </p>
        <p className="agent-art-line">
          {mentioned(fill(ready?.text.split(/(?<=\.)\s/)[0] ?? ''))}
        </p>
      </div>
    )
  }
  if (kind === 'suppliers') {
    return (
      <div className="agent-art-card">
        <p className="agent-art-from">
          <Avatar person="supplier" className="agent-avatar agent-avatar--small" />
          <strong>{people.supplier.name}</strong>
          <span className="agent-art-sub">{people.supplier.role}</span>
          <FileIcon kind="mail" className="agent-art-mail" />
        </p>
        <p className="agent-art-line">{fill(askMessage?.ask?.title ?? '')}</p>
        <p className="agent-art-chip">
          <span className="scene-chip">
            {agent.talk.waiting} {people.director.name}
          </span>
        </p>
      </div>
    )
  }
  const phone = items.find((item) => item.key === 'phone')
  return (
    <div className="agent-art-card">
      <p className="agent-art-from">
        <span className="agent-call" aria-hidden="true">
          <Icon icon={abilityIcons[phone?.glyph ?? 'call']} />
        </span>
        <strong>{call.label}</strong>
        <span className="agent-art-sub">{people.supplier.name}</span>
      </p>
      <p className="agent-art-line">{call.purpose}</p>
      <p className="agent-art-chip">
        <span className="scene-chip">
          <Icon icon={showcaseIcons.check} />
          {fill(call.filed)}
        </span>
      </p>
    </div>
  )
}

/** Where Charlie stops: what it does alone, what waits for a person, what it never does. */
export function CharlieLimits() {
  const { limits } = agent
  const marks = {
    alone: showcaseIcons.check,
    asks: showcaseIcons.held,
    never: showcaseIcons.never,
  } as const
  return (
    <section aria-labelledby="charlie-limits-title" className="agent-limits">
      <Container>
        <Reveal className="glass-act-title">
          <h2 id="charlie-limits-title" className="glass-heading">
            {limits.headline}
          </h2>
          <p className="glass-sources-lede">{limits.lede}</p>
        </Reveal>
        <Reveal delay={80}>
          <ul className="agent-limits-grid">
            {limits.columns.map((column) => (
              <li key={column.key} className="agent-limit" data-kind={column.key}>
                <h3 className="agent-limit-title">
                  <span className="agent-tile" aria-hidden="true">
                    <Icon icon={marks[column.key]} />
                  </span>
                  {column.title}
                </h3>
                <ul className="agent-limit-items">
                  {column.items.map((item) => (
                    <li key={item}>
                      <Icon icon={marks[column.key]} />
                      {item}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  )
}
