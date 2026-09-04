import { gtmId, posthogHost, posthogKey } from '#/env.ts'

/**
 * Analytics: Google Tag Manager and PostHog.
 *
 * Both are optional, both are inlined rather than pulled in as a package, and
 * both render nothing at all unless their key is configured — see the note on
 * each loader below. `trackEvent` at the bottom fans a conversion out to
 * whichever of the two is present.
 *
 * ── Why PostHog is a snippet and not `posthog-js` ──────────────────────────
 *
 * The same reason as GTM. PostHog publishes a `<head>` snippet that is its own
 * documented install path; it lazy-loads `array.js` from PostHog's CDN on first
 * paint, so the library is never in this project's bundle, there is no version
 * to keep current, and the end-to-end build stays free of it. `posthog-js` as
 * a dependency would be the same loader wrapped in a module — AGENTS.md §3.
 *
 * ── Consent applies to both ────────────────────────────────────────────────
 *
 * Neither loader is behind a consent gate, and both need one before the site
 * takes meaningful EU/UK traffic — GTM because of the tags people add to it,
 * PostHog because its snippet sets cookies for `$pageview` and autocapture out
 * of the box. The two closes below (Consent Mode for GTM; `opt_out_capturing`
 * or a delayed `posthog.init` for PostHog) are both a state the same banner
 * would write. Written here because this file is where somebody will be
 * standing when the question comes up.
 *
 * ── Google Tag Manager: what is loaded, and when ──────────────────────────
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
 * ── PostHog: what is loaded, and when ────────────────────────────────────
 *
 * Nothing, unless `VITE_POSTHOG_KEY` is set. With it, the official `<head>`
 * snippet renders: it installs a `window.posthog` stub, then loads `array.js`
 * from `<host>-assets.i.posthog.com` and replays anything queued against the
 * stub. `person_profiles: 'identified_only'` keeps anonymous visitors from
 * creating a person each — this site never calls `identify`, so every visitor
 * would otherwise be a distinct person for no gain.
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
 * PostHog's `<head>` loader.
 *
 * The body of this string is PostHog's official install snippet, verbatim — the
 * stub that queues calls against `window.posthog` until `array.js` finishes
 * loading. Everything from `posthog.init` on is ours:
 *
 * - the project key and ingestion host, from env;
 * - `defaults: '2026-05-30'` — a dated string, by PostHog's design: it pins the
 *   set of defaults current on that date, so a newer `array.js` cannot change
 *   behaviour unless this date also moves;
 * - `person_profiles: 'identified_only'` — this site never calls `identify`, so
 *   anonymous visitors should not each spawn a person record;
 * - `disable_session_recording: true` — the `2026-05-30` defaults switch replay
 *   on. Autocapture and pageviews are analytics; recording a stranger's session
 *   on a page with an email field, with no consent gate in front of it, is a
 *   different commitment. Turn it on deliberately — drop this flag, or enable it
 *   in the PostHog project — once there is a banner. See the consent note at the
 *   top of this file.
 *
 * Returns `null` when unconfigured, so the caller spreads nothing.
 */
export function posthogHeadScript(): { children: string } | null {
  if (!posthogKey) return null

  return {
    children:
      `!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);posthog.init('${posthogKey}',{api_host:'${posthogHost}',defaults:'2026-05-30',person_profiles:'identified_only',disable_session_recording:true});`,
  }
}

/**
 * Push an event to whichever analytics are present — the `dataLayer` for GTM,
 * `posthog.capture` for PostHog.
 *
 * Safe to call whether or not either is configured and whether or not it has
 * finished loading: `dataLayer` exists from the GTM snippet onwards, `posthog`
 * exists as a call-queuing stub from its snippet onwards, and if neither is
 * there the call is a no-op rather than a thrown reference error. Callers never
 * have to check — `waitlist-form.tsx` calls this on the success path with no
 * try/catch.
 *
 * Kept to a narrow payload type on purpose. These are places where anything can
 * be pushed, and a conversion event carrying a raw form object is how an email
 * address ends up in an analytics vendor's logs — see the call site in
 * `waitlist-form.tsx` for what is deliberately not sent.
 */
export function trackEvent(event: string, payload: Record<string, string> = {}): void {
  if (typeof window === 'undefined') return

  const w = window as unknown as {
    dataLayer?: Array<Record<string, unknown>>
    posthog?: { capture?: (event: string, payload?: Record<string, string>) => void }
  }

  w.dataLayer?.push({ event, ...payload })
  w.posthog?.capture?.(event, payload)
}
