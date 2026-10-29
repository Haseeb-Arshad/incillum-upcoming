import { cn } from '#/lib/cn.ts'

import type { FileKind } from '#/content/site.ts'

/**
 * A document's mark, as a reader's own desktop draws it: a page with its
 * corner folded and its format on a coloured band, and for mail, Gmail's.
 *
 * The pages are generic shapes, not anybody's logo: a format is not a vendor.
 * The one exception is mail, by the owner's call of 29 October 2026: an email
 * in a drawing carries the official Gmail mark (the 2020 logo, from the SVG
 * Logos set), because a buyer reads it at once as an email arriving. It is
 * the identity of the object drawn, in the product scenes only, and the page
 * never says Gmail or that anything works with it (AGENTS.md §5;
 * `requirements/README.md` lists what is not built). The colours are the file
 * marks' own tokens (`--ic-file-*`) and Google's own, and appear only inside
 * the product drawings, where they say what kind of thing it is at a glance.
 */
const labels: Record<Exclude<FileKind, 'mail'>, string> = {
  pdf: 'PDF',
  sheet: 'XLSX',
  doc: 'DOCX',
  drawing: 'DWG',
  archive: 'ZIP',
}

export function FileIcon({ kind, className }: { kind: FileKind; className?: string }) {
  if (kind === 'mail') return <GmailMark className={className} />
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

/**
 * The Gmail mark: Google's 2020 logo, five flat shapes in its own colours, as
 * published in the SVG Logos set. It is wider than a page (256 by 193), so it
 * sizes by width and keeps its own proportions.
 */
export function GmailMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 256 193"
      className={cn('file-icon', className)}
      data-kind="mail"
      aria-hidden="true"
    >
      <path fill="#4285f4" d="M58.182 192.05V93.14L27.507 65.077L0 49.504v125.091c0 9.658 7.825 17.455 17.455 17.455z" />
      <path fill="#34a853" d="M197.818 192.05h40.727c9.659 0 17.455-7.826 17.455-17.455V49.505l-31.156 17.837l-27.026 25.798z" />
      <path fill="#ea4335" d="m58.182 93.14l-4.174-38.647l4.174-36.989L128 69.868l69.818-52.364l4.669 34.992l-4.669 40.644L128 145.504z" />
      <path fill="#fbbc04" d="M197.818 17.504V93.14L256 49.504V26.231c0-21.585-24.64-33.89-41.89-20.945z" />
      <path fill="#c5221f" d="m0 49.504l26.759 20.07L58.182 93.14V17.504L41.89 5.286C24.61-7.66 0 4.646 0 26.23z" />
    </svg>
  )
}
