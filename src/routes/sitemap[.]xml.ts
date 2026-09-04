import { createFileRoute } from '@tanstack/react-router'

import { absoluteUrl } from '#/env.ts'

/**
 * sitemap.xml.
 *
 * A sitemap is the cheapest way to tell a crawler which origin is canonical
 * when a site is reachable on both an apex and a `www` host, which is the state
 * most domains are in on day one.
 *
 * The case study is listed at a lower priority than the page the site is for.
 * It is not in the navigation — there is none — so this and a direct link are
 * the only ways to reach it, and leaving it out of the sitemap would mean a
 * page that exists but that nothing can find.
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
            '  <url>',
            `    <loc>${absoluteUrl('/work/janus')}</loc>`,
            '    <changefreq>yearly</changefreq>',
            '    <priority>0.4</priority>',
            '  </url>',
            '</urlset>',
            '',
          ].join('\n'),
          { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
        ),
    },
  },
})
