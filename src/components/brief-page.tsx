import { useState } from 'react'

import { Button, Container } from '#/components/primitives.tsx'
import { briefGate } from '#/content/site.ts'
import { readBrief, unlockBrief } from '#/server/brief.ts'

import type { FormEvent } from 'react'
import type { Brief, BriefSection, BriefSourceKey } from '#/server/brief-content.ts'
import type { BriefState } from '#/server/brief.ts'

/** The password-protected investor and partner brief. */
export function BriefPage({ initialState }: { initialState: BriefState }) {
  const [state, setState] = useState(initialState)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setPending(true)

    try {
      const result = await unlockBrief({ data: { password } })
      if (!result.ok) {
        setError(
          result.reason === 'unavailable'
            ? briefGate.unavailable
            : briefGate.wrong,
        )
        return
      }

      const opened = await readBrief()
      if (opened.state !== 'open') {
        setError(briefGate.failed)
        return
      }

      setState(opened)
      setPassword('')
    } catch {
      setError(briefGate.failed)
    } finally {
      setPending(false)
    }
  }

  if (state.state === 'open') return <BriefDocument brief={state.brief} />

  return (
    <section aria-labelledby="brief-access-title" className="brief-access">
      <Container>
        <div className="brief-access-sheet">
          <p className="brief-kicker">{briefGate.brand}</p>
          <h1 id="brief-access-title" className="brief-access-title">
            {briefGate.title}
          </h1>
          {state.state === 'unavailable' ? (
            <p className="brief-access-copy" role="status">
              {briefGate.unavailable}
            </p>
          ) : (
            <>
              <p id="brief-password-hint" className="brief-access-copy">
                {briefGate.hint}
              </p>
              <form
                className="brief-access-form"
                onSubmit={(event) => {
                  void submit(event)
                }}
              >
                <label htmlFor="brief-password" className="brief-password-label">
                  {briefGate.label}
                </label>
                <input
                  id="brief-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  maxLength={200}
                  required
                  value={password}
                  aria-describedby={
                    error
                      ? 'brief-password-hint brief-password-error'
                      : 'brief-password-hint'
                  }
                  aria-invalid={error ? 'true' : undefined}
                  onChange={(event) => setPassword(event.currentTarget.value)}
                />
                {error ? (
                  <p
                    id="brief-password-error"
                    className="brief-password-error"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}
                <Button type="submit" disabled={pending}>
                  {pending ? briefGate.opening : briefGate.submit}
                </Button>
              </form>
            </>
          )}
        </div>
      </Container>
    </section>
  )
}

function BriefDocument({ brief }: { brief: Brief }) {
  return (
    <article className="brief-document">
      <Container>
        <header className="brief-document-head">
          <p className="brief-kicker">{brief.dated}</p>
          <h1 className="brief-document-title">{brief.title}</h1>
          <p className="brief-document-lead">{brief.lead}</p>
        </header>

        {brief.sections.map((section) => (
          <BriefSectionView key={section.id} section={section} brief={brief} />
        ))}

        <Sources brief={brief} />
      </Container>
    </article>
  )
}

function BriefSectionView({ section, brief }: { section: BriefSection; brief: Brief }) {
  if (section.kind === 'figures') {
    return (
      <section aria-labelledby={`brief-${section.id}`} className="brief-section">
        <div className="brief-section-heading">
          <h2 id={`brief-${section.id}`} className="brief-section-title">
            {section.heading}
          </h2>
          {section.lede ? <p className="brief-section-lede">{section.lede}</p> : null}
        </div>
        <dl className="brief-figure-grid">
          {section.figures.map((figure, index) => (
            <div key={`${figure.source}-${index}`} className="brief-figure">
              <dt className="brief-figure-value">{figure.value}</dt>
              <dd className="brief-figure-label">
                {figure.label}
                <SourceMark source={figure.source} brief={brief} />
              </dd>
            </div>
          ))}
        </dl>
        {section.closing ? (
          <p className="brief-section-closing">{section.closing}</p>
        ) : null}
      </section>
    )
  }

  if (section.kind === 'prose') {
    return (
      <section aria-labelledby={`brief-${section.id}`} className="brief-section">
        <div className="brief-section-heading">
          <h2 id={`brief-${section.id}`} className="brief-section-title">
            {section.heading}
          </h2>
        </div>
        <div className="brief-prose">
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
    )
  }

  if (section.kind === 'rows') {
    return (
      <section aria-labelledby={`brief-${section.id}`} className="brief-section">
        <div className="brief-section-heading">
          <h2 id={`brief-${section.id}`} className="brief-section-title">
            {section.heading}
          </h2>
          {section.lede ? <p className="brief-section-lede">{section.lede}</p> : null}
        </div>
        <dl className="brief-rows">
          {section.rows.map((row) => (
            <div key={row.title} className="brief-row">
              <dt>{row.title}</dt>
              <dd>{row.body}</dd>
            </div>
          ))}
        </dl>
      </section>
    )
  }

  return (
    <section aria-labelledby={`brief-${section.id}`} className="brief-section">
      <div className="brief-section-heading">
        <h2 id={`brief-${section.id}`} className="brief-section-title">
          {section.heading}
        </h2>
        {section.lede ? <p className="brief-section-lede">{section.lede}</p> : null}
      </div>
      <div className="brief-status-wrap">
        <table className="brief-status">
          <thead>
            <tr>
              <th scope="col">Capability</th>
              <th scope="col">What exists</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row) => (
              <tr key={row.ability}>
                <th scope="row">{row.ability}</th>
                <td>{row.stands}</td>
                <td>{brief.builtLabels[row.built]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function SourceMark({ source, brief }: { source: BriefSourceKey; brief: Brief }) {
  const index = brief.sources.findIndex((entry) => entry.key === source)
  if (index < 0) return null

  return (
    <sup className="brief-source-mark">
      <a href={`#brief-source-${source}`} aria-label={`Source ${index + 1}`}>
        {index + 1}
      </a>
    </sup>
  )
}

function Sources({ brief }: { brief: Brief }) {
  return (
    <section aria-labelledby="brief-sources-title" className="brief-sources">
      <h2 id="brief-sources-title" className="brief-section-title">
        {brief.sourcesHeading}
      </h2>
      <ol>
        {brief.sources.map((source, index) => (
          <li key={source.key} id={`brief-source-${source.key}`}>
            <span className="brief-source-number">{index + 1}.</span>
            <a href={source.href} target="_blank" rel="noreferrer">
              {source.citation}
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}
