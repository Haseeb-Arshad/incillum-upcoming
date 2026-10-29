import { useRef } from 'react'

import { FileIcon } from '#/components/file-icon.tsx'
import { Icon, showcaseIcons, trustIcons } from '#/components/icons.tsx'
import { OrbitMark } from '#/components/orbit-mark.tsx'
import { Container } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { charlie, trust } from '#/content/site.ts'
import { useScene } from '#/lib/motion.ts'

import type { TrustGlyph } from '#/content/site.ts'
import type { CSSProperties, ReactNode } from 'react'

/**
 * Data and trust: "Nothing leaves without you.", drawn rather than listed.
 *
 * The section used to be six commitments in ruled rows, and read as a page
 * of answers to questions nobody had asked yet. It is now the boundary itself:
 * requests and supplier answers come in; prices, costs, agreements and
 * quotations stay inside the organisation, where Charlie works on them; the
 * path to model training is drawn and refused; and the one way out runs
 * through a person's approval. The six commitments follow it as a spec, each
 * the thing the drawing just showed, said plainly.
 *
 * The drawing plays once as it comes into view (`useScene`): what comes in,
 * what stays, the refusal, the approval, and only then the way out. On the
 * server, without a script and under reduced motion it is drawn whole. It is
 * one picture to a screen reader, described in full by `trust.diagram.label`;
 * the commitments under it are real text. The approver and the button are the
 * channel's (`charlie.scene`). What the platform does not do yet lives in
 * `requirements/README.md`, not on the page.
 *
 * `ProtectionCards` stays the Charlie page's, whose abilities are cards.
 */

/** A step's start on the drawing's clock, in milliseconds. */
const at = (start: number) => ({ ['--at' as string]: start }) as CSSProperties

export function Trust() {
  const ref = useRef<HTMLDivElement>(null)
  const scene = useScene(ref, 0.3)
  const { diagram } = trust
  const approver = charlie.scene.people.director
  const approve = charlie.scene.messages.find((message) => message.ask)?.ask?.approve ?? ''

  return (
    <section id={trust.anchor} aria-labelledby="trust-title" className="trust">
      <Container>
        <Reveal className="trust-head">
          <h2 id="trust-title" className="glass-heading trust-title">
            {trust.headline}
          </h2>
          <p className="trust-lede">{trust.lede}</p>
        </Reveal>

        <div ref={ref} className="trust-map" data-scene={scene} role="img" aria-label={diagram.label}>
          <div className="trust-in">
            {diagram.inbound.map((label, index) => (
              <span key={label} className="trust-node" data-step="" style={at(index * 140)}>
                <FileIcon kind="mail" />
                {label}
              </span>
            ))}
          </div>
          <span className="trust-wire" data-wire="in" style={at(450)} />

          <div className="trust-boundary" data-step="" style={at(250)}>
            <p className="trust-boundary-label">
              <Icon icon={showcaseIcons.lock} />
              {diagram.inside}
            </p>
            <ul className="trust-data">
              {diagram.data.map((item, index) => (
                <li key={item.label} data-step="" style={at(650 + index * 110)}>
                  <FileIcon kind={item.kind} />
                  {item.label}
                </li>
              ))}
            </ul>
            <span className="trust-charlie" data-step="" style={at(1150)}>
              <OrbitMark />
              {charlie.scene.people.charlie.name}
            </span>
          </div>

          <div className="trust-training" data-step="" style={at(1450)}>
            <span className="trust-training-wire" />
            <span className="trust-node" data-refused="">
              <Icon icon={showcaseIcons.training} />
              {diagram.training}
            </span>
            <span className="trust-never" data-pop="" style={at(1950)}>
              <Icon icon={showcaseIcons.never} />
              {diagram.never}
            </span>
          </div>

          <span className="trust-wire" data-wire="out" style={at(1700)} />
          <div className="trust-gate" data-step="" style={at(1600)}>
            <p className="trust-gate-label">{diagram.gate}</p>
            <p className="trust-gate-who">
              <span className="scene-avatar">{approver.name.charAt(0)}</span>
              <span>
                <strong>{approver.name}</strong>
                <span>{approver.role}</span>
              </span>
            </p>
            <span className="trust-approve" style={at(2400)}>
              <Icon icon={showcaseIcons.check} />
              {approve}
            </span>
          </div>

          <span className="trust-wire" data-wire="onward" style={at(2650)} />
          <div className="trust-out" data-step="" style={at(2850)}>
            <span className="trust-node">
              <Icon icon={showcaseIcons.people} />
              {diagram.out}
            </span>
          </div>
        </div>

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
