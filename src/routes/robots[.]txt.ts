import { createFileRoute } from '@tanstack/react-router'

import { absoluteUrl } from '#/env.ts'

/**
 * robots.txt.
 *
 * Served from a route rather than `public/` so the sitemap URL is built from
 * the same `VITE_SITE_URL` as every canonical tag. A robots file pointing at
 * the wrong origin is worse than none.
 *
 * Everything is allowed. This is a one-page site with nothing to hide from a
 * crawler, and the usual reflexive `Disallow: /api/` would advertise a path
 * that does not exist here.
 */
export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(
          ['User-agent: *', 'Allow: /', '', `Sitemap: ${absoluteUrl('/sitemap.xml')}`, ''].join(
            '\n',
          ),
          { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
        ),
    },
  },
})
