import { OrbitMark } from '#/components/orbit-mark.tsx'
import { brand } from '#/content/site.ts'

/**
 * The mark and the wordmark, as one link home.
 *
 * Shared by the home page and the contact memo, and kept in one place for a
 * reason that is visible rather than tidy: the two pages open with the brand at
 * exactly the same coordinates, at exactly the same size, so moving from one to
 * the other reads as turning a page on the same desk and not as arriving at a
 * different site. The mark is ink, on both.
 *
 * The wordmark is live text and the mark is decoration, so the link is
 * announced once, by the `aria-label`, rather than as "Incillum Incillum".
 */
export function SiteBrand() {
  return (
    <a href="/" className="site-brand" aria-label={brand.name}>
      <OrbitMark className="site-brand-mark" />
      <span aria-hidden="true">{brand.name}</span>
    </a>
  )
}
