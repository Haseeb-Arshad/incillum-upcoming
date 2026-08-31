import { createFileRoute } from '@tanstack/react-router'

import { absoluteUrl } from '#/env.ts'

/**
 * sitemap.xml.
 *
 * One URL, because there is one page. It exists anyway: a sitemap is the
 * cheapest way to tell a crawler which origin is canonical when a site is
 * reachable on both an apex and a `www` host, which is the state most domains
 * are in on day one.
 *
 * No `lastmod`. A date generated at request time is always "today", which
 * teaches a crawler that the page changes daily and that its dates are
 * worthless.
 */
export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () =>
        new Response(
          [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            '  <url>',
            `    <loc>${absoluteUrl('/')}</loc>`,
            '    <changefreq>weekly</changefreq>',
            '    <priority>1.0</priority>',
            '  </url>',
            '</urlset>',
            '',
          ].join('\n'),
          { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
        ),
    },
  },
})
