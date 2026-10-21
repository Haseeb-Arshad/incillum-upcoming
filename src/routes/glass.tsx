import { createFileRoute, redirect } from '@tanstack/react-router'

/**
 * /glass — where the presentation used to live.
 *
 * It is the front page now (`routes/index.tsx`). The address was handed to
 * people before that, so it stays, as a permanent redirect: one canonical page,
 * and nobody holding the old link lands on nothing.
 */
export const Route = createFileRoute('/glass')({
  // `throw: true` has the router throw its own redirect, so nothing here throws a non-Error.
  beforeLoad: () => {
    redirect({ to: '/', statusCode: 301, throw: true })
  },
})
