import { useState } from 'react'

import { TrustBoard, trustChoice } from '#/components/trust.tsx'
import { Container } from '#/components/primitives.tsx'

import type { TrustOptions } from '#/components/trust.tsx'

/**
 * /lab/trust: the trust board drawn both ways, side by side in one place.
 *
 * The owner asked to choose between two versions of the emails (with the
 * sender's name written, and without) and two versions of the approval (a
 * small button, and a slide). This page draws any combination of them as the
 * front page would, and replays the scene on demand, so each can be judged in
 * motion at the size it will be seen at. It is private, like `/lab/particles`:
 * no link to it, no sitemap entry, `noindex`.
 *
 * Once one way of each is chosen, the other is deleted from `trust.tsx` and
 * `styles.css`, and so is this page.
 */

const cardChoices: ReadonlyArray<{
  value: TrustOptions['cards']
  label: string
  note: string
}> = [
  { value: 'named', label: 'Named', note: 'Portrait, name and role, then the subject.' },
  {
    value: 'faces',
    label: 'Portrait only',
    note: 'The portrait and the subject; no name written.',
  },
]

const approveChoices: ReadonlyArray<{
  value: TrustOptions['approve']
  label: string
  note: string
}> = [
  { value: 'button', label: 'Button', note: 'Small; pressed, it settles into a record.' },
  { value: 'slide', label: 'Slide', note: 'A track; carried across, it fills with ink.' },
]

export function TrustLab() {
  const [cards, setCards] = useState<TrustOptions['cards']>(trustChoice.cards)
  const [approve, setApprove] = useState<TrustOptions['approve']>(trustChoice.approve)
  const [plays, setPlays] = useState(0)

  return (
    <div className="glass desk trust-lab">
      <Container>
        <header className="trust-lab-head">
          <h1 className="trust-lab-title">The trust board, two ways</h1>
          <p className="trust-lab-lede">
            Choose how the emails are drawn and how the approval is given. The board below
            is the front page&rsquo;s, and plays once when it comes into view; Replay
            plays it again.
          </p>
          <div className="trust-lab-controls">
            <Choice
              legend="The emails"
              name="cards"
              value={cards}
              choices={cardChoices}
              onChange={setCards}
            />
            <Choice
              legend="The approval"
              name="approve"
              value={approve}
              choices={approveChoices}
              onChange={setApprove}
            />
            <button
              type="button"
              className="trust-lab-replay"
              onClick={() => setPlays((n) => n + 1)}
            >
              Replay
            </button>
          </div>
        </header>
        <TrustBoard
          key={`${cards}-${approve}-${plays}`}
          cards={cards}
          approve={approve}
        />
      </Container>
    </div>
  )
}

function Choice<Value extends string>({
  legend,
  name,
  value,
  choices,
  onChange,
}: {
  legend: string
  name: string
  value: Value
  choices: ReadonlyArray<{ value: Value; label: string; note: string }>
  onChange: (value: Value) => void
}) {
  return (
    <fieldset className="trust-lab-choice">
      <legend>{legend}</legend>
      {choices.map((choice) => (
        <label
          key={choice.value}
          data-checked={choice.value === value ? 'true' : 'false'}
        >
          <input
            type="radio"
            name={name}
            value={choice.value}
            checked={choice.value === value}
            onChange={() => onChange(choice.value)}
          />
          <span className="trust-lab-label">{choice.label}</span>
          <span className="trust-lab-note">{choice.note}</span>
        </label>
      ))}
    </fieldset>
  )
}
