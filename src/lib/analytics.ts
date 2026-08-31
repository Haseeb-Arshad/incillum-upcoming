import { gtmId } from '#/env.ts'

/**
 * Google Tag Manager.
 *
 * ── What is loaded, and when ───────────────────────────────────────────────
 *
 * Nothing, unless `VITE_GTM_ID` is set. No container ID means no script tag, no
 * `dataLayer`, no cookies and no third-party request — which is what keeps
 * local development, the end-to-end suite and any preview deployment clean, and
 * means a developer running this site never quietly pollutes production
 * analytics with their own page views.
 *
 * ── Why the snippet is inlined rather than an npm package ──────────────────
 *
 * GTM's loader is nine lines and Google's own documented form. Every wrapper
 * package is those nine lines plus a React abstraction over a global that is
 * already global. The one part worth writing carefully is the `dataLayer`
 * bootstrap, and it is below.
 *
 * ── Consent ────────────────────────────────────────────────────────────────
 *
 * There is **no consent gate here**, and there needs to be one before this site
 * takes meaningful traffic from the EU or the UK. GTM itself sets no cookies,
 * but essentially every tag people put inside it does, and under GDPR/PECR
 * those require opt-in *before* they fire.
 *
 * Two ways to close that, in increasing order of effort:
 *
 *   1. Configure Google Consent Mode v2 inside the container, defaulting every
 *      storage type to `denied`, and add a banner that updates it. The tags
 *      stay in GTM; the gate is a `consent` push.
 *   2. Do not render this at all until a banner has been accepted — move the
 *      call behind the same state the banner writes.
 *
 * Written down here rather than in a ticket because this file is where somebody
 * will be standing when the question comes up.
 */

/**
 * The `<head>` half: the loader.
 *
 * `dataLayer` is created before the script tag so that anything pushed between
 * hydration and GTM finishing its download is queued rather than thrown away.
 * That is not theoretical here — the waitlist conversion event can fire within
 * a second or two of load on a returning visitor.
 *
 * Returns `null` when unconfigured, so the caller spreads nothing.
 */
export function gtmHeadScript(): { children: string } | null {
  if (!gtmId) return null

  return {
    children: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`,
  }
}

/**
 * The `<body>` half: the `<noscript>` iframe.
 *
 * It exists so tags still fire for a visitor with JavaScript disabled. It has
 * to be the first thing in `<body>`, and it has to be an iframe rather than an
 * image, because that is what GTM's server expects.
 */
export const gtmNoScriptSrc: string | null = gtmId
  ? `https://www.googletagmanager.com/ns.html?id=${gtmId}`
  : null

/**
 * Push an event onto the dataLayer.
 *
 * Safe to call whether or not GTM is configured and whether or not it has
 * finished loading: the array exists from the head snippet onwards, and if
 * there is no container the call is a no-op rather than a thrown reference
 * error. Callers never have to check.
 *
 * Kept to a narrow payload type on purpose. `dataLayer` is famously a place
 * where anything can be pushed, and a conversion event carrying a raw form
 * object is how an email address ends up in an analytics vendor's logs — see
 * the call site in `waitlist-form.tsx` for what is deliberately not sent.
 */
export function trackEvent(event: string, payload: Record<string, string> = {}): void {
  if (typeof window === 'undefined') return

  const layer = (window as unknown as { dataLayer?: Array<Record<string, unknown>> })
    .dataLayer
  if (!layer) return

  layer.push({ event, ...payload })
}
