import { Container } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { questions } from '#/content/site.ts'

/**
 * Questions — where the reference pages put their testimonials.
 *
 * There is nobody to quote, so the section answers what a commercial director
 * asks before leaving an address. Every answer is open: a real `<dl>`, nothing
 * folded behind a click, because an answer a reader has to open is an answer
 * half of them never read — and the page's own test holds it to having no
 * disclosure widgets at all.
 *
 * Two columns on a wide screen: the heading holds still on the left while the
 * answers run down the right, the same split the rest of the page reads in.
 */
export function Questions() {
  return (
    <section id={questions.anchor} aria-labelledby="questions-title" className="questions">
      <Container className="questions-grid">
        <Reveal className="questions-intro">
          <h2 id="questions-title" className="glass-heading">
            {questions.headline}
          </h2>
        </Reveal>

        <Reveal delay={80}>
          <dl className="questions-list">
            {questions.items.map((item) => (
              <div key={item.question} className="questions-item">
                <dt className="questions-question">{item.question}</dt>
                <dd className="questions-answer">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  )
}
