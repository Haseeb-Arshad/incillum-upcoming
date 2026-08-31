import { createRouter as createTanStackRouter } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'

/**
 * Router factory.
 *
 * No query client and no router context. This site is one page with one server
 * function behind a form; adding TanStack Query here would ship a cache to
 * every visitor so that nothing could use it.
 */
export function getRouter() {
  return createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
