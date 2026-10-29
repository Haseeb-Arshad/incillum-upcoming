import { evidence, glass, home, thread } from '#/content/site.ts'

/**
 * The words of the team's channel, with the figures put in.
 *
 * The messages in `charlie.scene` carry `{tokens}` where a figure belongs, so
 * the channel cannot disagree with the night it describes. This is the one
 * place they are filled: from the supplier confirmation (what moved), the
 * matrix (the line and the counts), the 06:50 ledger (the margin and the
 * floor) and the evidence document (the part and the quantity).
 */

const { documents } = glass.sources
const ledger = thread.beats.find((beat) => beat.figures)?.figures ?? []
const figure = (term: string) => ledger.find((entry) => entry.term === term)?.value ?? ''
const change = (term: string) =>
  documents.supplier.changes.find((entry) => entry.term === term)

const tokens: Record<string, string> = {
  line: home.matrix.rows.find((row) => row.status === 'changed')?.line ?? '',
  priced: String(home.matrix.lines.priced),
  held: String(home.matrix.lines.held),
  units: evidence.visual.units.toLocaleString('en-GB'),
  part: evidence.record.part.split(' · ')[0] ?? evidence.record.part,
  margin: figure('Expected margin'),
  floor: figure('Commercial floor'),
  was: change('Unit cost')?.was ?? '',
  now: change('Unit cost')?.now ?? '',
  leadWas: change('Lead time')?.was ?? '',
  leadNow: change('Lead time')?.now ?? '',
}

/** A message's text, or any line that carries tokens, with each one replaced by its figure. */
export const fill = (text: string) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => tokens[key] ?? '')
