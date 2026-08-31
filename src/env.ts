import { z } from 'zod'

/**
 * Public environment.
 *
 * Only `VITE_`-prefixed values belong here: everything in this file is inlined
 * into the browser bundle, so nothing secret may ever be added to this schema.
 * Server-only configuration belongs in a module read from `process.env` inside
 * a server function.
 *
 * Validation runs at module evaluation — during the SSR render of the first
 * request — so a misconfigured deployment fails loudly at startup instead of
 * serving a site with broken canonical URLs.
 */
const publicEnvSchema = z.object({
  /** Absolute origin of the public site. Used for canonical URLs and OG tags. */
  VITE_SITE_URL: z.url().default('http://localhost:3200'),
  /** Address rendered in the colophon and used as the alternative to the form. */
  VITE_CONTACT_EMAIL: z.email().default('hello@incillum.com'),
  /**
   * Google Tag Manager container, e.g. `GTM-ABC1234`.
   *
   * A container ID is public by design — it ships in the page source of every
   * site that uses one — so it belongs here rather than in the server-only
   * module. It is *optional* and empty by default, which is what keeps local
   * development and the end-to-end suite free of analytics: no ID, no script,
   * no cookies, no network call.
   *
   * The pattern is checked rather than accepted as a free string. A typo in a
   * container ID does not fail loudly — GTM simply never loads — and that is a
   * fault you discover weeks later when you go looking for the data.
   */
  VITE_GTM_ID: z
    .string()
    .regex(/^GTM-[A-Z0-9]+$/, 'Expected a container ID of the form GTM-XXXXXXX.')
    .optional()
    .or(z.literal('').transform(() => undefined)),
})

function readPublicEnv(): z.infer<typeof publicEnvSchema> {
  /**
   * `import.meta.env` is typed as `any` for keys Vite does not know about, so
   * the values are narrowed here rather than handed to Zod as `any` — otherwise
   * the one module whose whole job is to make configuration type-safe would be
   * the one module that silently is not.
   */
  const raw = import.meta.env as Record<string, string | undefined>

  const result = publicEnvSchema.safeParse({
    VITE_SITE_URL: raw.VITE_SITE_URL,
    VITE_CONTACT_EMAIL: raw.VITE_CONTACT_EMAIL,
    VITE_GTM_ID: raw.VITE_GTM_ID,
  })

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n')
    throw new Error(`Invalid public environment configuration:\n${issues}`)
  }

  return result.data
}

const env = readPublicEnv()

/** Trailing slash stripped so `${siteUrl}${path}` can never double up. */
export const siteUrl: string = env.VITE_SITE_URL.replace(/\/$/, '')
export const contactEmail: string = env.VITE_CONTACT_EMAIL

/** `GTM-XXXXXXX`, or `undefined` when analytics is not configured. */
export const gtmId: string | undefined = env.VITE_GTM_ID

export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}
