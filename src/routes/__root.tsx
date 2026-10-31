import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from '@tanstack/react-router'
import { useEffect } from 'react'

import appCss from '#/styles.css?url'
import { Colophon } from '#/components/colophon.tsx'
import { Masthead } from '#/components/masthead.tsx'
import { AnalyticsConsent } from '#/components/analytics-consent.tsx'
import { mastheadHeadScript } from '#/lib/masthead.ts'
import { openingHeadScript } from '#/lib/opening.ts'
import { organizationJsonLd, seoTags, websiteJsonLd } from '#/lib/seo.ts'

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
        { name: 'theme-color', content: '#ffffff' },
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
        { rel: 'icon', href: '/icon-48.png', type: 'image/png', sizes: '48x48' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
      ],
      /**
       * Analytics loads after the visitor's saved choice is read by the client.
       * The front page's once-a-visit mark has to be set before the first paint,
       * so it is in the head as well, and so is the masthead's reading of where
       * the reader is: both are about the page the browser paints before its
       * script has run.
       */
      scripts: [
        { children: openingHeadScript },
        { children: mastheadHeadScript },
        { type: 'application/ld+json', children: organizationJsonLd() },
        { type: 'application/ld+json', children: websiteJsonLd() },
      ].filter((script) => script !== null),
    }
  },
  shellComponent: RootDocument,
  component: RootComponent,
})

function RootComponent() {
  /**
   * Pages that draw their own header and footer, plus the private brief, which
   * deliberately has no public navigation or colophon. A second masthead on
   * the composed pages would print the site's chrome twice.
   */
  const ownsChrome = useRouterState({
    select: (state) =>
      [
        '/',
        '/contact',
        '/charlie',
        '/glass',
        '/lab/particles',
        '/lab/trust',
        '/brief',
      ].includes(state.location.pathname),
  })
  const privateRoute = useRouterState({
    select: (state) =>
      state.location.pathname === '/brief' ||
      state.location.pathname.startsWith('/brief/') ||
      state.location.pathname === '/lab' ||
      state.location.pathname.startsWith('/lab/'),
  })
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

      {!ownsChrome && <Masthead />}

      <main
        id="main"
        tabIndex={-1}
        className={privateRoute ? 'ph-no-capture' : undefined}
      >
        <Outlet />
      </main>

      <AnalyticsConsent />

      {!ownsChrome && <Colophon />}
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
        {children}
        <Scripts />
      </body>
    </html>
  )
}
