import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

import appCss from '#/styles.css?url'
import { Colophon } from '#/components/colophon.tsx'
import { Masthead } from '#/components/masthead.tsx'
import { gtmHeadScript, gtmNoScriptSrc, posthogHeadScript } from '#/lib/analytics.ts'
import { organizationJsonLd, seoTags } from '#/lib/seo.ts'

import type { ReactNode } from 'react'

/**
 * Root route: the document shell, the head, and the page chrome.
 *
 * The masthead and colophon live here rather than inside the page component so
 * they stay siblings of `<main>`. A `<header>` or `<footer>` nested inside
 * `<main>` is not a `banner` or `contentinfo` landmark — the page looks
 * identical and silently loses two of the three landmarks a screen-reader user
 * navigates by.
 *
 * No devtools. This is a marketing page with a performance budget, and the
 * TanStack devtools bundle would be shipped to every visitor.
 */
export const Route = createRootRoute({
  head: () => {
    const base = seoTags()

    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        /**
         * The one place a literal colour is unavoidable: browsers paint the UA
         * chrome from `theme-color` before any stylesheet is parsed, so it
         * cannot take a `var()`. It must be kept equal to `--ic-paper` in
         * styles.css by hand — there is nowhere else to read it from.
         */
        { name: 'theme-color', content: '#f7f7f5' },
        { name: 'color-scheme', content: 'light' },
        ...base.meta,
      ],
      /**
       * No canonical here. Meta tags deduplicate by name as routes nest, so a
       * page can override the title and the Open Graph block — but `links`
       * concatenate, and a document carrying two canonicals is worse than one
       * carrying none, because a crawler discards both. Each route therefore
       * owns its own, and `seoTags` is still the only place one is built.
       */
      links: [
        { rel: 'stylesheet', href: appCss },
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      ],
      /**
       * Order matters. The GTM and PostHog loaders go first so their globals
       * (`dataLayer`, the `posthog` stub) exist before anything else on the
       * page could push to them, and `.filter` removes each one entirely when
       * its key is unset — an empty inline script tag on every page of an
       * unconfigured deployment is litter.
       */
      scripts: [
        gtmHeadScript(),
        posthogHeadScript(),
        { type: 'application/ld+json', children: organizationJsonLd() },
      ].filter((script) => script !== null),
    }
  },
  shellComponent: RootDocument,
  component: RootComponent,
})

function RootComponent() {
  useEffect(() => {
    /**
     * Hydration marker.
     *
     * Absent from the streamed HTML, set the instant React attaches. Every
     * interactive element in the SSR markup exists and is clickable before that
     * happens, but nothing is listening yet, and a click in that window is
     * silently lost. This gives the end-to-end suite a real signal to wait on
     * instead of a guessed timeout. It carries no visual or SEO effect.
     */
    document.documentElement.dataset.hydrated = 'true'
  }, [])

  return (
    <>
      <a
        href="#main"
        className="sr-only fixed top-4 left-4 z-50 rounded-control bg-ink px-4 py-2 text-ui text-paper focus:not-sr-only"
      >
        Skip to main content
      </a>

      <Masthead />

      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>

      <Colophon />
    </>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {/*
          GTM's no-script fallback, first in `<body>` as Google requires, so
          tags still fire for a visitor with JavaScript disabled. `title` is not
          decoration — an iframe without an accessible name is a serious axe
          violation, and this one is in the DOM on every page.
        */}
        {gtmNoScriptSrc ? (
          <noscript>
            <iframe
              src={gtmNoScriptSrc}
              title="Google Tag Manager"
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        ) : null}
        {children}
        <Scripts />
      </body>
    </html>
  )
}
