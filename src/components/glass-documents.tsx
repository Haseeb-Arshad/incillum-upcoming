import { glass } from '#/content/site.ts'

import type { GlassSource } from '#/content/site.ts'

/**
 * The six documents a quotation is assembled from, drawn as the documents.
 *
 * ── Why they are built, not pictured ───────────────────────────────────────
 *
 * The obvious way to make these look real is to generate pictures of them, and
 * a generated document is the one image that always gives itself away: the
 * type is nonsense, and the reader this page is for zooms in. So they are made
 * of the site's own type and hairlines, and filled with the quotation's own
 * contents — a subject line, a title block with its revision cell empty, three
 * catalogue entries a tolerance apart, the cost a supplier is about to change.
 * They stay sharp at any size, re-theme with the page, and every word in them
 * comes from `content/site.ts`, where a test holds it to the night thread.
 *
 * The one photograph is the part itself (`PartPhoto`), because a machined
 * bracket has no text to catch out.
 *
 * ── How they scale ─────────────────────────────────────────────────────────
 *
 * Every measurement inside a document is in `em`, so one `font-size` on the
 * wrapper sets the size of the whole sheet: legible on the desk, a thumbnail on
 * the gathered sheet. The questions pinned to them are set in `rem` instead, so
 * they stay readable however small the paper gets.
 */

const { documents } = glass.sources

export function SourceDocument({
  source,
  floor,
}: {
  source: GlassSource
  floor: string
}) {
  switch (source) {
    case 'request':
      return <RequestDocument />
    case 'drawing':
      return <DrawingDocument />
    case 'catalogue':
      return <CatalogueDocument />
    case 'prices':
      return <PriceListDocument />
    case 'agreement':
      return <AgreementDocument floor={floor} />
    case 'supplier':
      return <ConfirmationDocument />
  }
}

/** The question a person would ask of a document, pinned to the place it is asked of. */
export function DocumentQuestion({ source }: { source: GlassSource }) {
  return (
    <span className="gd-question-anchor" data-source={source}>
      <span className="gd-question">{documents[source].question}</span>
    </span>
  )
}

function RequestDocument() {
  const mail = documents.request
  return (
    <div className="gd gd-window">
      <div className="gd-bar">
        <SourceIcon source="request" />
        <span className="gd-bar-title">{mail.title}</span>
        <span className="gd-bar-meta">{mail.at}</span>
      </div>
      <div className="gd-mail">
        <p className="gd-mail-subject">{mail.subject}</p>
        <p className="gd-mail-from">
          <span className="gd-initial" aria-hidden="true">
            {mail.from.charAt(0)}
          </span>
          <span>{mail.from}</span>
          <span className="gd-quiet">{mail.address}</span>
        </p>
        <p className="gd-mail-body">{mail.body}</p>
        <div className="gd-attachments">
          {mail.attachments.map((file) => (
            <span key={file.name} className="gd-attachment">
              <FileIcon format={file.format} />
              <span>{file.name}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * A customer drawing: two views, three dimensions and a title block whose
 * revision cell is empty — the reason line 11 is held.
 */
function DrawingDocument() {
  const drawing = documents.drawing
  const { dimensions } = drawing
  return (
    <div className="gd gd-drawing">
      <svg viewBox="0 0 360 240" className="gd-drawing-svg" focusable="false">
        <rect className="gd-d-frame" x="4" y="4" width="352" height="232" />
        <rect className="gd-d-border" x="11" y="11" width="338" height="218" />
        {[95, 180, 265].map((x) => (
          <path key={x} className="gd-d-border" d={`M${x} 4v7M${x} 229v7`} />
        ))}
        {[80, 160].map((y) => (
          <path key={y} className="gd-d-border" d={`M4 ${y}h7M349 ${y}h7`} />
        ))}

        {/* Front view: the plate, its boss and bore, two holes, centre lines. */}
        <rect className="gd-d-part" x="40" y="46" width="132" height="78" rx="3" />
        <circle className="gd-d-part" cx="106" cy="85" r="19" />
        <circle className="gd-d-part" cx="106" cy="85" r="8" />
        <circle className="gd-d-part" cx="60" cy="85" r="5.5" />
        <circle className="gd-d-part" cx="152" cy="85" r="5.5" />
        <path className="gd-d-centre" d="M30 85h152M106 36v98M60 76v18M152 76v18" />

        {/* Side view, with the bore in hidden line. */}
        <rect className="gd-d-part" x="204" y="46" width="22" height="78" />
        <rect className="gd-d-part" x="226" y="66" width="12" height="38" />
        <path className="gd-d-hidden" d="M204 77h34M204 93h34" />
        <path className="gd-d-centre" d="M196 85h52" />

        {/* Dimensions. */}
        <path className="gd-d-dim" d="M40 128v18M172 128v18M44 142h124" />
        <path className="gd-d-arrow" d="M40 142l6-2.5v5zM172 142l-6-2.5v5z" />
        <text className="gd-d-text" x="106" y="139" textAnchor="middle">
          {dimensions.width}
        </text>
        <path className="gd-d-dim" d="M36 46h-18M36 124h-18M24 50v70" />
        <path className="gd-d-arrow" d="M24 46l-2.5 6h5zM24 124l-2.5-6h5z" />
        <text
          className="gd-d-text"
          x="19"
          y="88"
          textAnchor="middle"
          transform="rotate(-90 19 88)"
        >
          {dimensions.height}
        </text>
        <path className="gd-d-dim" d="M156 81l22-22h20" />
        <text className="gd-d-text" x="180" y="56">
          {dimensions.count} {dimensions.hole}
        </text>

        {/* The title block. The revision cell is the one the line is held for. */}
        <rect className="gd-d-border" x="218" y="166" width="131" height="63" />
        <path className="gd-d-border" d="M218 187h131M218 208h131M283 187v42" />
        <text className="gd-d-title" x="224" y="181">
          {drawing.title}
        </text>
        <text className="gd-d-text" x="224" y="201">
          {drawing.number}
        </text>
        <text className="gd-d-text" x="289" y="201">
          {drawing.material}
        </text>
        <text className="gd-d-text" x="224" y="222">
          {drawing.revision} {drawing.blank}
        </text>
        <text className="gd-d-text" x="289" y="222">
          {drawing.scale}
        </text>
        <ellipse className="gd-d-ring" cx="247" cy="218.5" rx="26" ry="9.5" />
      </svg>
    </div>
  )
}

/** Three entries on one catalogue page, the same part a tolerance apart — the reason line 04 is held. */
function CatalogueDocument() {
  const catalogue = documents.catalogue
  return (
    <div className="gd gd-page">
      <div className="gd-page-head">
        <span className="gd-page-title">{catalogue.title}</span>
        <span className="gd-quiet">{catalogue.page}</span>
      </div>
      <ol className="gd-entries">
        {catalogue.entries.map((entry) => (
          <li key={entry.part} className="gd-entry">
            <BearingSeat />
            <span className="gd-entry-text">
              <span className="gd-entry-part">{entry.part}</span>
              <span className="gd-quiet">{entry.name}</span>
            </span>
            <span className="gd-entry-fit">{entry.fit}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** The supplier's price list as it is kept: a workbook, with the row about to change. */
function PriceListDocument() {
  const prices = documents.prices
  const format = prices.file.split('.').pop()?.toUpperCase() ?? ''
  return (
    <div className="gd gd-window">
      <div className="gd-bar">
        <FileIcon format={format} />
        <span className="gd-bar-title">{prices.file}</span>
      </div>
      <table className="gd-grid">
        <thead>
          <tr>
            <th />
            {prices.columns.map((_, index) => (
              <th key={index}>{String.fromCharCode(65 + index)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="gd-grid-head">
            <th>1</th>
            {prices.columns.map((column) => (
              <td key={column}>{column}</td>
            ))}
          </tr>
          {prices.rows.map((row, index) => (
            <tr
              key={row.part}
              data-moving={row.part === prices.moving ? 'true' : undefined}
            >
              <th>{index + 2}</th>
              <td>{row.part}</td>
              <td>{row.description}</td>
              <td className="gd-num">{row.cost}</td>
              <td className="gd-num">{row.lead}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="gd-tabs">
        {prices.tabs.map((tab, index) => (
          <span key={tab} data-active={index === 1 ? 'true' : undefined}>
            {tab}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Schedule B of the framework agreement. The floor clause carries the ledger's own figure. */
function AgreementDocument({ floor }: { floor: string }) {
  const agreement = documents.agreement
  return (
    <div className="gd gd-page gd-contract">
      <p className="gd-contract-title">{agreement.title}</p>
      <p className="gd-quiet">{agreement.schedule}</p>
      <ol className="gd-clauses">
        {agreement.clauses.map((clause) => (
          <li key={clause.number} data-floor={'floor' in clause ? 'true' : undefined}>
            <span className="gd-clause-number">{clause.number}</span>
            <span>
              {clause.text}
              {'floor' in clause ? (
                <>
                  {' '}
                  <strong>{floor}</strong>.
                </>
              ) : null}
              {'rates' in clause
                ? clause.rates.map((entry, index) => (
                    <span key={entry.part} className="gd-rate">
                      {index ? ' · ' : ' '}
                      <span className="gd-quiet">{entry.part}</span> {entry.rate}
                    </span>
                  ))
                : null}
            </span>
          </li>
        ))}
      </ol>
      <div className="gd-signatures">
        {agreement.signatures.map((signature) => (
          <span key={signature}>{signature}</span>
        ))}
      </div>
    </div>
  )
}

/** The answer that arrives at 03:42, against line 14. */
function ConfirmationDocument() {
  const confirmation = documents.supplier
  return (
    <div className="gd gd-window">
      <div className="gd-bar">
        <SourceIcon source="supplier" />
        <span className="gd-bar-title">{confirmation.title}</span>
        <span className="gd-bar-meta">{confirmation.at}</span>
      </div>
      <div className="gd-mail">
        <p className="gd-mail-subject">{confirmation.item}</p>
        <dl className="gd-changes">
          {confirmation.changes.map((change) => (
            <div key={change.term}>
              <dt>{change.term}</dt>
              <dd>
                <s>{change.was}</s>
                <span aria-hidden="true">→</span>
                <strong>{change.now}</strong>
              </dd>
            </div>
          ))}
        </dl>
        <p className="gd-quiet">{confirmation.note}</p>
      </div>
    </div>
  )
}

/**
 * The part itself — line 01's machined bracket — photographed on white and
 * shown with `multiply`, so the white drops out and it lies on the desk with
 * its own shadow. See `design/encode-glass.sh`.
 */
export function PartPhoto() {
  return (
    <picture className="gd-photo">
      <source
        type="image/avif"
        srcSet="/glass/bracket-440.avif 440w, /glass/bracket-720.avif 720w"
        sizes="14rem"
      />
      <source
        type="image/webp"
        srcSet="/glass/bracket-440.webp 440w, /glass/bracket-720.webp 720w"
        sizes="14rem"
      />
      <img
        src="/glass/bracket-720.jpg"
        alt=""
        width={720}
        height={720}
        loading="lazy"
        decoding="async"
        draggable="false"
      />
    </picture>
  )
}

/** A catalogue line drawing of a bearing seat: a short cylinder with a bore and a flange. */
function BearingSeat() {
  return (
    <svg viewBox="0 0 48 40" className="gd-entry-art" focusable="false">
      <path d="M8 26c0 3.9 7.2 7 16 7s16-3.1 16-7" />
      <path d="M8 16v10M40 16v10" />
      <ellipse cx="24" cy="16" rx="16" ry="7" />
      <ellipse cx="24" cy="16" rx="7" ry="3" />
      <path d="M3 29c0 4.4 9.4 8 21 8s21-3.6 21-8M3 29c0-2 2-3.8 5.4-5.2M45 29c0-2-2-3.8-5.4-5.2" />
    </svg>
  )
}

/**
 * Sixteen-pixel glyphs on `currentColor`, one per kind of source, drawn here
 * rather than taken from a package (AGENTS.md §3). One stroke weight for all.
 */
export function SourceIcon({ source }: { source: GlassSource }) {
  const common = {
    viewBox: '0 0 16 16',
    fill: 'none',
    'aria-hidden': true,
    focusable: 'false',
    className: 'gd-icon',
  } as const
  const stroke = {
    stroke: 'currentColor',
    strokeWidth: 1.25,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const

  switch (source) {
    case 'request':
    case 'supplier':
      return (
        <svg {...common}>
          <rect x="1.75" y="3.25" width="12.5" height="9.5" rx="1" {...stroke} />
          <path d="M2.25 4l5.75 4.5L13.75 4" {...stroke} />
        </svg>
      )
    case 'drawing':
      return (
        <svg {...common}>
          <rect x="1.75" y="2.25" width="12.5" height="11.5" rx="1" {...stroke} />
          <path d="M4.5 10.5l3-5 3 5M5.5 9h4M9.5 11.75h3" {...stroke} />
        </svg>
      )
    case 'catalogue':
      return (
        <svg {...common}>
          <path d="M3 2.75h7.25a1 1 0 0 1 1 1v9.5H4a1 1 0 0 1-1-1z" {...stroke} />
          <path d="M3 12.25a1 1 0 0 1 1-1h7.25M13 4.5v10" {...stroke} />
        </svg>
      )
    case 'prices':
      return (
        <svg {...common}>
          <rect x="1.75" y="2.25" width="12.5" height="11.5" rx="1" {...stroke} />
          <path d="M1.75 6h12.5M1.75 9.75h12.5M6 2.25v11.5" {...stroke} />
        </svg>
      )
    case 'agreement':
      return (
        <svg {...common}>
          <path d="M3.25 1.75h6l3.5 3.5v9H3.25z" {...stroke} />
          <path
            d="M5.5 7h5M5.5 9.5h3M5.5 12c1-.9 1.6-.9 2.2 0s1.2.9 2.3-.4"
            {...stroke}
          />
        </svg>
      )
  }
}

/** A file, with its format on its corner — the way a mail client shows an attachment. */
function FileIcon({ format }: { format: string }) {
  return (
    <span className="gd-file" aria-hidden="true">
      <svg viewBox="0 0 16 20" fill="none" focusable="false">
        <path
          d="M2.5 1.5h7.25l3.75 3.75V18.5h-11z"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
        <path
          d="M9.75 1.5v3.75h3.75"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
      </svg>
      <span className="gd-file-format">{format}</span>
    </span>
  )
}
