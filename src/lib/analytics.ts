import { gtmId, posthogHost, posthogKey } from '#/env.ts'

/** Only public routes may collect analytics. */
export const analyticsConfigured = Boolean(gtmId || posthogKey)
export const analyticsConsentStorageKey = 'incillum-analytics-consent-v1'
export const analyticsSettingsEvent = 'incillum:analytics-settings'
export const analyticsConsentChangedEvent = 'incillum:analytics-consent-change'

export type AnalyticsConsent = 'granted' | 'denied'

let memoryConsent: AnalyticsConsent | null = null

type PosthogStub = {
  capture?: (event: string, payload?: Record<string, string>) => void
  opt_in_capturing?: () => void
  opt_out_capturing?: () => void
  startSessionRecording?: () => void
  stopSessionRecording?: () => void
}

type AnalyticsWindow = Window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
  posthog?: PosthogStub
  __incillumAnalyticsAllowed?: boolean
}

/**
 * Analytics loaders and events.
 *
 * PostHog is loaded through its documented browser snippet so it stays out of
 * the app bundle. The visitor's choice is read before either analytics vendor
 * is loaded. Session replay is enabled after opt-in, with form text masked and
 * network bodies and headers disabled. See `sessionRecordingConfig` below.
 */

/** The GTM loader. It is inserted only after a visitor allows analytics. */
export function gtmHeadScript(): { children: string } | null {
  if (!gtmId) return null

  return {
    children: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(gtmId)});`,
  }
}

/** Legacy markup used only by the retired pre-launch page snapshot. */
export const gtmNoScriptSrc: string | null = gtmId
  ? `https://www.googletagmanager.com/ns.html?id=${gtmId}`
  : null

/**
 * The PostHog loader and its initialization config.
 *
 * The snippet queues calls until `array.js` is ready. Keep this in one place so
 * `startAnalytics` can add it after consent and the browser tests can inspect
 * the exact options without contacting the real project.
 */
export function posthogHeadScript(): { children: string } | null {
  if (!posthogKey) return null

  const loader = `!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var o="posthog";return"posthog"!==a&&(o+="."+a),t||(o+=" (stub)"),o},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);`

  const config = `posthog.init(${JSON.stringify(posthogKey)},{api_host:${JSON.stringify(posthogHost)},defaults:'2026-08-30',person_profiles:'identified_only',respect_dnt:true,external_scripts_inject_target:'head',capture_pageview:'history_change',capture_pageleave:true,autocapture:true,capture_dead_clicks:true,rageclick:true,capture_exceptions:true,capture_heatmaps:true,capture_performance:true,capture_copied_text:false,disable_session_recording:false,disable_surveys:false,enable_recording_console_log:false,session_recording:{maskAllInputs:true,maskTextSelector:'*',maskTextFn:function(text,element){return element&&element.closest&&element.closest('[data-ph-private]')?text.replace(/\\S/g,'*'):text;},recordBody:false,recordHeaders:false,maskCapturedNetworkRequestFn:function(request){if(request&&request.name)request.name=request.name.split('?')[0].split('#')[0];return request;}},before_send:function(event){if(!event||!event.properties)return event;var props=event.properties;var url=props.$current_url||window.location.href;try{var path=new URL(url,window.location.href).pathname;if(path==='/brief'||path.indexOf('/brief/')===0||path==='/lab'||path.indexOf('/lab/')===0)return null;}catch(e){}['$current_url','$initial_current_url','$referrer'].forEach(function(key){if(typeof props[key]==='string')props[key]=props[key].split('?')[0].split('#')[0];});return event;}});`

  return { children: `${loader}${config}` }
}

/** Read the visitor's persisted choice without making storage failures fatal. */
export function readAnalyticsConsent(): AnalyticsConsent | null {
  if (typeof window === 'undefined') return null

  try {
    const choice = window.localStorage.getItem(analyticsConsentStorageKey)
    memoryConsent = choice === 'granted' || choice === 'denied' ? choice : null
  } catch {
    // Keep an in-memory choice when browser storage is blocked.
  }

  return memoryConsent
}

/** useSyncExternalStore subscription for same-tab and cross-tab choice changes. */
export function subscribeToAnalyticsConsent(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined

  window.addEventListener('storage', onChange)
  window.addEventListener(analyticsConsentChangedEvent, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(analyticsConsentChangedEvent, onChange)
  }
}

/** Persist the choice and apply it to any SDKs already loaded in this tab. */
export function setAnalyticsConsent(choice: AnalyticsConsent): void {
  if (typeof window === 'undefined') return
  memoryConsent = choice

  try {
    window.localStorage.setItem(analyticsConsentStorageKey, choice)
  } catch {
    // The choice still applies for this visit when browser storage is blocked.
  }
  window.dispatchEvent(new Event(analyticsConsentChangedEvent))

  if (choice === 'granted') startAnalytics()
  else stopAnalytics()
}

/** Make a settings control available from each public footer. */
export function openAnalyticsSettings(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(analyticsSettingsEvent))
  }
}

/** Load the configured vendors once, after a visitor has opted in. */
export function startAnalytics(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const w = window as AnalyticsWindow
  if (w.__incillumAnalyticsAllowed) return
  w.__incillumAnalyticsAllowed = true

  const gtm = gtmHeadScript()
  if (gtm) {
    w.dataLayer ??= []
    w.gtag ??= (...args: unknown[]) => w.dataLayer?.push(args)
    w.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
    w.gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
    injectSnippet('incillum-gtm-bootstrap', gtm.children)
  }

  const posthog = posthogHeadScript()
  if (posthog) {
    if (!w.posthog) injectSnippet('incillum-posthog-bootstrap', posthog.children)
    else {
      w.posthog.opt_in_capturing?.()
      w.posthog.startSessionRecording?.()
    }
  }
}

/** Stop PostHog recording/capture and update an already loaded GTM container. */
export function stopAnalytics(): void {
  if (typeof window === 'undefined') return

  const w = window as AnalyticsWindow
  w.__incillumAnalyticsAllowed = false
  w.posthog?.stopSessionRecording?.()
  w.posthog?.opt_out_capturing?.()

  if (gtmId && w.gtag) {
    w.gtag('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
  }
}

/**
 * Push a small event to configured analytics only after opt-in.
 *
 * Waitlist calls send no email, company, role, free text, or form answers. Those
 * stay in Supabase. The allowed payload is limited to fixed, non-identifying
 * event details.
 */
export function trackEvent(event: string, payload: Record<string, string> = {}): void {
  if (typeof window === 'undefined') return

  const w = window as AnalyticsWindow
  if (!w.__incillumAnalyticsAllowed) return

  w.dataLayer?.push({ event, ...payload })
  w.posthog?.capture?.(event, payload)
}

function injectSnippet(id: string, source: string): void {
  if (document.getElementById(id)) return

  const script = document.createElement('script')
  script.id = id
  script.textContent = source
  document.head.append(script)
}
