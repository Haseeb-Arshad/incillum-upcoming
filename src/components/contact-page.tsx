import { MemoForm } from '#/components/memo-form.tsx'
import { SiteBrand } from '#/components/site-brand.tsx'
import { contact } from '#/content/site.ts'
import { contactEmail } from '#/env.ts'

/**
 * /contact — a sheet of continuous-feed paper on a desk.
 *
 * Two columns on a wide screen: what happens after somebody writes, on the
 * left, and the memo itself on the right. One column below 860px, the sheet
 * under the copy. The page draws its own masthead (see `ownsChrome` in
 * `__root.tsx`) for the same reason the home page does: a second one above it
 * would be the site's chrome printed twice.
 *
 * ── What the left column does not have ─────────────────────────────────────
 *
 * The page this is modelled on spends that column on proof: customer logos and
 * a rotating quotation. Incillum has no customers, and AGENTS.md §5 is explicit
 * that the site must never imply otherwise — so the column answers the question
 * a stranger has instead, which is what happens if they write.
 *
 * ── The two filters ────────────────────────────────────────────────────────
 *
 * `memo-worn` and `memo-stamp-ink` are SVG filters declared once, here, and
 * referenced from CSS. The first wears the printed text very slightly, as a
 * form run through a worn ribbon would be; the second roughens the stamp's
 * edge. Both are applied to static text only — never to what somebody is
 * typing, which has to stay crisp — and both are a no-op where filters are
 * unsupported, which leaves clean type rather than a broken page.
 */
export function ContactPage() {
  return (
    <div className="memo-page">
      <svg className="memo-filters" width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <filter id="memo-worn" x="-2%" y="-6%" width="104%" height="112%">
            <feTurbulence type="fractalNoise" baseFrequency="2.4" numOctaves="2" seed="7" result="noise" />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.7 2.05"
              result="wear"
            />
            <feComposite in="SourceGraphic" in2="wear" operator="in" />
          </filter>
          <filter id="memo-stamp-ink" x="-4%" y="-6%" width="108%" height="112%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="11" result="noise" />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.4 3.3"
              result="wear"
            />
            <feComposite in="SourceGraphic" in2="wear" operator="in" />
          </filter>
        </defs>
      </svg>

      <div className="memo-shell">
        <aside className="memo-brand" aria-label={contact.heading}>
          <SiteBrand />

          <div className="memo-intro">
            <h1 className="memo-title">{contact.heading}</h1>

            <ul className="memo-steps">
              {contact.steps.map((step) => (
                <li key={step.icon}>
                  <StepIcon name={step.icon} />
                  <span>{step.text}</span>
                </li>
              ))}
            </ul>

            <p className="memo-state">{contact.status}</p>
          </div>

          <p className="memo-alt">
            {contact.alternative} <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
          </p>
        </aside>

        <div className="memo-stage">
          <MemoForm />
        </div>
      </div>
    </div>
  )
}

/** Sixteen-pixel glyphs on `currentColor`. Three of them do not earn a package. */
function StepIcon({ name }: { name: 'quotation' | 'call' | 'case' }) {
  const common = {
    viewBox: '0 0 16 16',
    fill: 'none',
    'aria-hidden': true,
    className: 'memo-step-icon',
  } as const
  const stroke = { stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

  if (name === 'quotation') {
    return (
      <svg {...common}>
        <path d="M3.5 1.75h6l3 3v9.5h-9z" {...stroke} />
        <path d="M9.5 1.75v3h3M5.5 8h5M5.5 10.5h5" {...stroke} />
      </svg>
    )
  }
  if (name === 'call') {
    return (
      <svg {...common}>
        <path d="M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2z" {...stroke} />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="M2 4.5h12M2 8h12M2 11.5h12" {...stroke} />
      <path d="M5 2.5v11" {...stroke} />
    </svg>
  )
}
