import { createHmac, timingSafeEqual } from 'node:crypto'

import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie, setResponseHeader } from '@tanstack/react-start/server'
import { z } from 'zod'

import { serverEnv } from '#/server/env.ts'

import type { Brief } from '#/server/brief-content.ts'

/**
 * The private brief: one password, checked here, and nothing of the brief
 * sent to a browser that has not given it.
 *
 * ── How it is kept private ─────────────────────────────────────────────────
 *
 * The content lives in `brief-content.ts`, which only the handler below
 * imports, so it is never in the browser's bundle: a visitor who reads the
 * page's scripts finds the shape of a brief and none of its words. Giving the
 * password sets an HTTP-only cookie holding a keyed hash of the password (not
 * the password), so changing `BRIEF_PASSWORD` signs everybody out at once,
 * and a script on the page cannot read the cookie. Every answer that carries
 * the brief is marked `private, no-store`, so no cache between here and the
 * reader keeps a copy.
 *
 * It fails shut: with no password configured, or one under eight characters,
 * nobody gets in, and the page says the brief is not available rather than
 * opening it. A wrong password waits a little before it answers, which is
 * enough to make guessing slow without a store of attempts.
 */

const cookie = 'incillum_brief'
/** Thirty days: long enough for an investor to come back to it, short enough to lapse. */
const lasts = 60 * 60 * 24 * 30

function password(): string | null {
  const value = serverEnv().BRIEF_PASSWORD
  return value && value.length >= 8 ? value : null
}

/** The cookie's value: the password, keyed into a hash it cannot be read back out of. */
function token(secret: string): string {
  return createHmac('sha256', secret).update('incillum brief, v1').digest('base64url')
}

/** Equal, compared in constant time so the comparison says nothing about how close a guess was. */
function same(given: string, expected: string): boolean {
  const a = createHmac('sha256', 'incillum brief, compare').update(given).digest()
  const b = createHmac('sha256', 'incillum brief, compare').update(expected).digest()
  return timingSafeEqual(a, b)
}

export type BriefState =
  { state: 'unavailable' } | { state: 'closed' } | { state: 'open'; brief: Brief }

export const readBrief = createServerFn({ method: 'GET' }).handler(
  async (): Promise<BriefState> => {
    setResponseHeader('Cache-Control', 'private, no-store')
    const secret = password()
    if (!secret) return { state: 'unavailable' }
    const held = getCookie(cookie)
    if (!held || !same(held, token(secret))) return { state: 'closed' }
    const { brief } = await import('#/server/brief-content.ts')
    return { state: 'open', brief }
  },
)

export type UnlockResult = { ok: true } | { ok: false; reason: 'wrong' | 'unavailable' }

export const unlockBrief = createServerFn({ method: 'POST' })
  .validator((input: unknown) => z.object({ password: z.string().max(200) }).parse(input))
  .handler(async ({ data }): Promise<UnlockResult> => {
    setResponseHeader('Cache-Control', 'private, no-store')
    const secret = password()
    if (!secret) return { ok: false, reason: 'unavailable' }
    if (!same(data.password, secret)) {
      await new Promise((resolve) => setTimeout(resolve, 700))
      return { ok: false, reason: 'wrong' }
    }
    setCookie(cookie, token(secret), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: lasts,
    })
    return { ok: true }
  })
