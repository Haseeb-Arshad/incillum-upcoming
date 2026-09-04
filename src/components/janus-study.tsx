import {
  Container,
  DefinitionRows,
  Label,
  Rule,
  TextLink,
} from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
import { janus } from '#/content/janus.ts'

/**
 * The JANUS case study.
 *
 * ── Why this is one file and not six ───────────────────────────────────────
 *
 * The home page keeps one component per section because each of those sections
 * is an argument the site is making about itself, and separating them is what
 * lets one be reordered or removed without touching the others. This page is a
 * secondary surface with a single linear reading, and splitting it into six
 * files would put it structurally on the same footing as the spine — which is
 * the opposite of what it is.
 *
 * ── Why it stays on paper ──────────────────────────────────────────────────
 *
 * No inverted band. The night is the home page's argument — the plate, the
 * instrument and the thread in that order — and a second dark region elsewhere
 * would spend the one visual idea a visitor remembers on a page that is not
 * making that point.
 *
 * ── Why there is no colour ─────────────────────────────────────────────────
 *
 * The demo this describes uses three outcome hues, and they earn their place
 * there because an outcome hue *means* something in that interface. Here they
 * would be decoration, and `--ic-signal` means one specific thing on this site
 * that has nothing to do with a launch rehearsal. So: ink, hairlines, and the
 * type scale, like everything else.
 *
 * ── Why it is not in the navigation ────────────────────────────────────────
 *
 * There is no navigation. The site is one page with one conversion, and a
 * stranger does not need this before deciding whether to leave an address. It
 * exists at a URL that can be shared deliberately; it is not on the path of
 * somebody reading the argument.
 */
export function JanusStudy() {
  return (
    <>
      <Header />
      <Premise />
      <Sequence />
      <Boundary />
      <Build />
      <Checked />
      <Close />
    </>
  )
}

function Header() {
  return (
    <section aria-labelledby="janus-heading" className="pt-16 pb-20 sm:pt-24 sm:pb-28">
      <Container>
        <Reveal className="flex max-w-[56ch] flex-col gap-5">
          <Label>{janus.label}</Label>

          {/*
            The framing line is first, at reading size, in the server's HTML —
            for the same reason the illustrative blocks on the home page carry
            their labels in their own first lines. A reader who works out four
            screens down that this was a weekend build has read everything
            above it as something else.
          */}
          <p className="text-body text-ink-400">{janus.framing}</p>

          <h1 id="janus-heading" className="text-display text-ink">
            {janus.headline}
          </h1>

          <p className="text-lede text-ink-600">{janus.lede}</p>

          <p className="mt-2 flex flex-col gap-2">
            <TextLink
              href={janus.demoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-ui text-ink self-start"
            >
              {janus.demoLabel}
            </TextLink>
            <span className="text-small text-ink-400">{janus.demoNote}</span>
          </p>
        </Reveal>
      </Container>
    </section>
  )
}

function Premise() {
  return (
    <section aria-labelledby="janus-premise" className="pb-20 sm:pb-28">
      <Container>
        <Reveal className="flex max-w-[54ch] flex-col gap-5">
          <Label>{janus.premise.label}</Label>
          <h2 id="janus-premise" className="text-title text-ink">
            {janus.premise.headline}
          </h2>
          <p className="text-lede text-ink-600">{janus.premise.body}</p>
        </Reveal>

        <Reveal delay={80} className="mt-12 sm:mt-16">
          <DefinitionRows points={janus.premise.futures} />
        </Reveal>

        <Reveal delay={120}>
          <p className="mt-8 max-w-[62ch] text-body text-ink-400">
            {janus.premise.reading}
          </p>
        </Reveal>
      </Container>
    </section>
  )
}

/**
 * The sequence, as a numbered thread.
 *
 * An ordered list rather than a stack of headings, because the order is the
 * content: the same six beats shuffled describe a different product. The actor
 * on each beat is what the page is actually about, so it is set as its own
 * column rather than folded into the sentence, where a reader skimming would
 * lose exactly the alternation the section exists to show.
 */
function Sequence() {
  return (
    <section aria-labelledby="janus-sequence" className="pb-20 sm:pb-28">
      <Container>
        <Reveal className="flex max-w-[54ch] flex-col gap-5">
          <Label>{janus.sequence.label}</Label>
          <h2 id="janus-sequence" className="text-title text-ink">
            {janus.sequence.headline}
          </h2>
          <p className="text-lede text-ink-600">{janus.sequence.lede}</p>
        </Reveal>

        <Reveal delay={80} className="mt-12 sm:mt-16">
          <ol className="border-t border-line-strong">
            {janus.sequence.beats.map((beat, index) => (
              <li
                key={beat.title}
                className="grid gap-x-10 gap-y-2.5 border-b border-line py-7 sm:grid-cols-12 sm:py-8"
              >
                <p className="text-label text-ink-400 uppercase sm:col-span-2">
                  <span className="sr-only">Step </span>
                  {String(index + 1).padStart(2, '0')} {beat.actor}
                </p>
                <h3 className="max-w-[30ch] text-heading text-ink sm:col-span-4">
                  {beat.title}
                </h3>
                <p className="max-w-[52ch] text-body text-ink-600 sm:col-span-6">
                  {beat.body}
                </p>
              </li>
            ))}
          </ol>
        </Reveal>
      </Container>
    </section>
  )
}

function Boundary() {
  return (
    <section aria-labelledby="janus-boundary" className="pb-20 sm:pb-28">
      <Container>
        <Reveal className="flex max-w-[54ch] flex-col gap-5">
          <Label>{janus.boundary.label}</Label>
          <h2 id="janus-boundary" className="text-title text-ink">
            {janus.boundary.headline}
          </h2>
          <p className="text-lede text-ink-600">{janus.boundary.body}</p>
        </Reveal>

        <Reveal delay={80} className="mt-12 sm:mt-16">
          <DefinitionRows points={janus.boundary.points} />
        </Reveal>
      </Container>
    </section>
  )
}

function Build() {
  return (
    <section aria-labelledby="janus-build" className="pb-20 sm:pb-28">
      <Container>
        <Reveal className="flex max-w-[54ch] flex-col gap-5">
          <Label>{janus.build.label}</Label>
          <h2 id="janus-build" className="text-title text-ink">
            {janus.build.headline}
          </h2>
          <p className="text-lede text-ink-600">{janus.build.body}</p>
        </Reveal>

        <Reveal delay={80} className="mt-12 sm:mt-16">
          <DefinitionRows points={janus.build.points} />
        </Reveal>
      </Container>
    </section>
  )
}

function Checked() {
  return (
    <section aria-labelledby="janus-checked" className="pb-20 sm:pb-28">
      <Container>
        <Reveal className="flex max-w-[54ch] flex-col gap-5">
          <Label>{janus.checked.label}</Label>
          <h2 id="janus-checked" className="text-title text-ink">
            {janus.checked.headline}
          </h2>
          <p className="text-lede text-ink-600">{janus.checked.body}</p>
        </Reveal>

        <Reveal delay={80} className="mt-12 sm:mt-16">
          <dl className="border-t border-line-strong">
            {janus.checked.facts.map((fact) => (
              <div
                key={fact.term}
                className="grid gap-x-10 gap-y-2.5 border-b border-line py-7 sm:grid-cols-12 sm:py-8"
              >
                <dt className="max-w-[26ch] text-heading text-ink sm:col-span-4">
                  {fact.term}
                </dt>
                <dd className="max-w-[68ch] text-body text-ink-600 sm:col-span-8">
                  {fact.body}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  )
}

/**
 * The close asks for nothing.
 *
 * The home page has one conversion and this page is not it. A form here would
 * be a second ask on a site that has deliberately made one, and a reader who
 * arrives on this URL from somewhere else should leave through the front door
 * rather than be caught at the back one.
 */
function Close() {
  return (
    <section className="pb-24 sm:pb-32">
      <Container>
        <Rule />
        <Reveal className="mt-10 flex max-w-[54ch] flex-col gap-5">
          <p className="text-body text-ink-600">{janus.close.body}</p>
          <TextLink href="/" className="text-ui text-ink self-start">
            {janus.close.backLabel}
          </TextLink>
        </Reveal>
      </Container>
    </section>
  )
}
