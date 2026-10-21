/**
 * The contact memo's three steps, as sixteen-pixel glyphs on `currentColor`:
 * a quotation, a call, a case. Three of them do not earn a package. Shared with
 * the home page's close, which promises the same three steps in the same words.
 */
export function StepIcon({ name }: { name: 'quotation' | 'call' | 'case' }) {
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
