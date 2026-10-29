import { useRef } from 'react'

import { Avatar } from '#/components/avatar.tsx'
import { CountUp } from '#/components/count-up.tsx'
import { FileIcon } from '#/components/file-icon.tsx'
import { Icon, showcaseIcons } from '#/components/icons.tsx'
import { OrbitMark } from '#/components/orbit-mark.tsx'
import { at } from '#/components/scene.tsx'
import { charlie, glass, home, people, showcase, thread } from '#/content/site.ts'
import { useScene } from '#/lib/motion.ts'

import type { PersonKey } from '#/content/site.ts'

/**
 * The handover: what is waiting at 08:04, under the morning plate.
 *
 * It used to be a card laid over the photograph, hiding the one quiet room the
 * page ends on. The owner asked for the photograph clean, and something better
 * under it. So the morning is two things, as the product would show them:
 * Charlie's message in the team channel, with the quotation and its workbook
 * attached, and James's decision, with the two figures it turns on.
 *
 * It writes nothing of its own. The message is the channel's own 08:04 post
 * (`charlie.scene`), its counts the matrix's; the person and the decision are
 * the film's last frame; the figures are the thread's 06:50 ledger and the
 * floor's word the matrix's. So the morning cannot disagree with the night that
 * produced it. The shortfall is in the signal, because it is the figure that
 * breaks the floor, and nothing else here is.
 *
 * It plays once as it comes into view (`useScene`): the message arrives, its
 * files, the decision, and the shortfall counting up to itself. On the server,
 * without a script and under reduced motion it is simply there.
 */

const ledger = thread.beats.find((beat) => beat.figures)?.figures ?? []
const margin = ledger.find((entry) => entry.term === home.matrix.summary.margin)
const floor = ledger.find((entry) => entry.term === 'Commercial floor')
const short = ledger.find((entry) => entry.breaches)

const morning = glass.film.frames[glass.film.frames.length - 1]
const person = morning?.chips.find((chip) => !chip.source)
/** The frame's line is the decision and then who makes it: two sentences, set as two things. */
const [decision = '', ...owner] = (morning?.line ?? '').split(/(?<=\.)\s+/)

const post = charlie.scene.messages.find((message) => message.from === 'charlie' && message.at === morning?.at)
const text = (post?.text ?? '')
  .replace('{priced}', String(home.matrix.lines.priced))
  .replace('{held}', String(home.matrix.lines.held))
/** The post opens by naming who it is for: set apart, the way a channel sets a mention. */
const [mention = '', ...rest] = text.split(' ')
/** Who the mention names, so their portrait can stand in it. */
const mentioned = (Object.keys(people) as PersonKey[]).find(
  (key) => mention === `@${people[key].name}`,
)

export function GlassHandover() {
  const ref = useRef<HTMLDivElement>(null)
  const scene = useScene(ref, 0.3)

  return (
    <div ref={ref} className="glass-handover" data-scene={scene}>
      <article className="handover-message" aria-label={`Charlie, in ${charlie.scene.channel}`}>
        <p className="handover-channel" data-step="" style={at(0)}>
          <span>{charlie.scene.channel}</span>
          <span>{post?.at}</span>
        </p>
        <p className="handover-from" data-step="" style={at(150)}>
          <span className="handover-charlie">
            <OrbitMark />
          </span>
          <strong>{charlie.scene.people.charlie.name}</strong>
          <span className="handover-badge">{charlie.scene.people.charlie.role}</span>
        </p>
        <p className="handover-text" data-step="" style={at(350)}>
          <span className="handover-mention">
            {mentioned ? <Avatar person={mentioned} className="handover-mention-avatar" /> : null}
            {mention}
          </span>{' '}
          {rest.join(' ')}
        </p>
        <ul className="handover-files">
          {showcase.approval.files.slice(0, 2).map((file, index) => (
            <li key={file.label} data-step="" style={at(700 + index * 140)}>
              <FileIcon kind={file.kind} />
              {file.label}
            </li>
          ))}
        </ul>
      </article>

      <article className="handover-decision" aria-label={`${people.director.name}, with a person`}>
        <p className="handover-who" data-step="" style={at(900)}>
          <Avatar person="director" className="handover-avatar" />
          <span className="handover-name">
            <strong>{people.director.name}</strong>
            <span>{people.director.role}</span>
          </span>
          {person ? <span className="handover-waiting">{person.text}</span> : null}
        </p>
        <p className="glass-handover-decision" data-step="" style={at(1100)}>
          {decision}
        </p>
        <dl className="glass-handover-figures" data-step="" style={at(1300)}>
          <div>
            <dt>{margin?.term}</dt>
            <dd>
              {margin?.value}
              <span>
                {' '}
                · {home.matrix.summary.floor} {floor?.value}
              </span>
            </dd>
          </div>
          {short ? (
            <div className="glass-handover-short">
              <dt>{short.term}</dt>
              <dd>
                <CountUp value={short.value} scene={scene} delay={1500} duration={1400} />
              </dd>
            </div>
          ) : null}
        </dl>
        <p className="glass-handover-owner" data-step="" style={at(1500)}>
          <Icon icon={showcaseIcons.held} />
          {owner.join(' ')}
        </p>
      </article>
    </div>
  )
}
