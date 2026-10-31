import { useEffect, useId, useState, useSyncExternalStore } from 'react'
import { useRouterState } from '@tanstack/react-router'

import { Button } from '#/components/primitives.tsx'
import { analyticsPreferences } from '#/content/site.ts'
import { cn } from '#/lib/cn.ts'
import {
  analyticsConfigured,
  analyticsSettingsEvent,
  openAnalyticsSettings,
  readAnalyticsConsent,
  setAnalyticsConsent,
  subscribeToAnalyticsConsent,
  stopAnalytics,
  startAnalytics,
} from '#/lib/analytics.ts'

import type { AnalyticsConsent } from '#/lib/analytics.ts'

/** A small, optional choice. No analytics script loads before this is answered. */
export function AnalyticsConsent() {
  const copyId = useId()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const choice = useSyncExternalStore(
    subscribeToAnalyticsConsent,
    readAnalyticsConsent,
    () => 'loading',
  )
  const [settingsOpen, setSettingsOpen] = useState(false)
  const isPrivateRoute =
    pathname === '/brief' ||
    pathname.startsWith('/brief/') ||
    pathname === '/lab' ||
    pathname.startsWith('/lab/')

  useEffect(() => {
    function onSettings() {
      setSettingsOpen(true)
    }

    window.addEventListener(analyticsSettingsEvent, onSettings)
    return () => {
      window.removeEventListener(analyticsSettingsEvent, onSettings)
    }
  }, [])

  useEffect(() => {
    if (choice === 'granted' && !isPrivateRoute) startAnalytics()
    else stopAnalytics()
  }, [choice, isPrivateRoute])

  if (
    !analyticsConfigured ||
    isPrivateRoute ||
    choice === 'loading' ||
    (choice !== null && !settingsOpen)
  ) {
    return null
  }

  function choose(next: AnalyticsConsent) {
    setAnalyticsConsent(next)
    setSettingsOpen(false)
  }

  return (
    <aside className="analytics-consent" aria-labelledby={copyId} role="region">
      <div className="analytics-consent-copy">
        <p id={copyId} className="text-small text-ink-600">
          {analyticsPreferences.notice}
        </p>
      </div>
      <div className="analytics-consent-actions">
        <Button tone="secondary" onClick={() => choose('denied')}>
          {analyticsPreferences.decline}
        </Button>
        <Button onClick={() => choose('granted')}>{analyticsPreferences.allow}</Button>
      </div>
    </aside>
  )
}

/** The footer link that lets a visitor change the saved choice later. */
export function AnalyticsSettingsButton({ className }: { className?: string }) {
  if (!analyticsConfigured) return null

  return (
    <button
      type="button"
      className={cn('analytics-settings-link', className)}
      onClick={openAnalyticsSettings}
    >
      {analyticsPreferences.settings}
    </button>
  )
}
