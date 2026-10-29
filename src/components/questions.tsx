import { Icon, questionIcons } from '#/components/icons.tsx'
import { ButtonLink, Container } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { questions } from '#/content/site.ts'

/**
 * Questions: what a careful buyer asks before leaving an address, answered
 * in full.
 *
 * It was a ruled list of questions and answers, and read as a FAQ, because it
 * was one. It is now a set of cards, a question to each: the question in the
 * serif, an icon on its tile, and the answer under it with its first sentence
 * in ink, so a reader can take the answer from that sentence alone and read
 * the rest only if they want it. A card on the left says where to go with a
 * question that is not here.
 *
 * Nothing is folded away. It is still a real `<dl>`, every answer is in the
 * HTML, there is no disclosure widget and no `hidden`, and `e2e/glass.spec.ts`
 * holds all three: an answer a reader has to open is an answer half of them
 * never read. The icons are decoration; each question says what it is about.
 */

/** An answer's first sentence is the answer; the rest is why. */
function split(answer: string): [lead: string, rest: string] {
  const [lead = answer, ...rest] = answer.split(/(?<=[.?!])\s+/)
  return [lead, rest.join(' ')]
}

export function Questions() {
  return (
    <section id={questions.anchor} aria-labelledby="questions-title" className="questions">
      <Container className="questions-layout">
        <Reveal className="questions-head">
          <h2 id="questions-title" className="glass-heading">
            {questions.headline}
          </h2>
          <p className="questions-lede">{questions.lede}</p>
          <aside className="questions-more">
            <p className="questions-more-title">{questions.more.title}</p>
            <p className="questions-more-body">{questions.more.body}</p>
            <ButtonLink href="/contact" arrow tone="secondary">
              {questions.more.action}
            </ButtonLink>
          </aside>
        </Reveal>

        <Reveal delay={80}>
          <dl className="questions-cards">
            {questions.items.map((item) => {
              const [lead, rest] = split(item.answer)
              return (
                <div key={item.key} className="question-card">
                  <dt className="question-title">
                    <span className="question-tile" aria-hidden="true">
                      <Icon icon={questionIcons[item.key]} />
                    </span>
                    {item.question}
                  </dt>
                  <dd className="questions-answer">
                    <strong className="question-lead">{lead}</strong>
                    {rest ? ` ${rest}` : null}
                  </dd>
                </div>
              )
            })}
          </dl>
        </Reveal>
      </Container>
    </section>
  )
}
