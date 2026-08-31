# Incillum

The pre-launch site for **incillum.com** — an AI coworker for finance operations.

One page: the argument, a drawing of a working day marked at the visitor's own
clock, what the product is and is deliberately not, how far along the build is,
and a form that asks for one email address.

## Running it

```bash
pnpm install
pnpm dev            # http://localhost:3200
```

## Checks

```bash
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint
pnpm test           # vitest — the schema and spam rules
pnpm test:e2e       # playwright, three viewports, against the production build
pnpm build
```

`pnpm test:e2e` builds the app and serves it, rather than running against the dev
server. Dev-mode module resolution is far more forgiving than a production
bundle, so a suite pointed at `vite dev` is green on exactly the failures that
take a deployment down.

## Configuration

Both values are public and inlined into the browser bundle. Nothing secret may
ever be added to `src/env.ts`.

| Variable | Default | Used for |
| --- | --- | --- |
| `VITE_SITE_URL` | `http://localhost:3200` | canonical URL, Open Graph, sitemap |
| `VITE_CONTACT_EMAIL` | `hello@incillum.com` | the address in the colophon |

## Two things to resolve before launch

- **The waitlist stores nothing.** `src/server/waitlist.ts` validates the
  submission, screens it for spam, mints a reference and writes one line to the
  server log. Replacing that `console.info` with a real store is the whole of the
  remaining work. Until it is done, the success copy must not promise a
  confirmation email — see AGENTS.md §6.
- **The fonts are not ours.** `src/fonts/` holds another company's licensed web
  fonts. Either license them or swap them; the swap is one `@font-face` block in
  `src/styles.css` plus two token lines. See AGENTS.md §7.

## Layout

```text
src/content/site.ts    every word the site renders, in one file
src/components/        one file per section
src/lib/               waitlist schema, spam heuristic, seo, cn
src/server/            the one server function
src/styles.css         tokens, type scale, the light and inverted scopes
```
