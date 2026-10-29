import { cn } from '#/lib/cn.ts'

import type { FileKind } from '#/content/site.ts'

/**
 * A document's mark, as a reader's own desktop draws it: a page with its
 * corner folded and its format on a coloured band, or an envelope for mail.
 *
 * Generic shapes, not anybody's logo: the site names no system (AGENTS.md
 * §5), and a format is not a vendor. The colours are the file marks' own
 * tokens (`--ic-file-*`), by the owner's call of 29 October 2026, and appear
 * only inside the product drawings, where they say what kind of document a
 * thing is at a glance, the way they do on a desk.
 */
const labels: Record<Exclude<FileKind, 'mail'>, string> = {
  pdf: 'PDF',
  sheet: 'XLSX',
  doc: 'DOCX',
  drawing: 'DWG',
  archive: 'ZIP',
}

export function FileIcon({ kind, className }: { kind: FileKind; className?: string }) {
  if (kind === 'mail') {
    return (
      <svg viewBox="0 0 40 40" className={cn('file-icon', className)} data-kind="mail" aria-hidden="true">
        <rect className="file-icon-envelope" x="3" y="9" width="34" height="23" rx="3.5" />
        <path className="file-icon-flap" d="M5 12l15 10.5L35 12" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 40 40" className={cn('file-icon', className)} data-kind={kind} aria-hidden="true">
      <path
        className="file-icon-page"
        d="M10.5 2.5h14L33 11v24a2.5 2.5 0 0 1-2.5 2.5h-20A2.5 2.5 0 0 1 8 35V5a2.5 2.5 0 0 1 2.5-2.5Z"
      />
      <path className="file-icon-corner" d="M24.5 2.5V9a2 2 0 0 0 2 2H33" />
      <rect className="file-icon-band" x="3" y="19" width="26" height="11" rx="2.5" />
      <text className="file-icon-label" x="16" y="27.1" textAnchor="middle">
        {labels[kind]}
      </text>
    </svg>
  )
}
