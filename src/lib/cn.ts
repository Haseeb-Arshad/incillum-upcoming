/**
 * Class-name join.
 *
 * Deliberately not `clsx` + `tailwind-merge`. Those two exist to let a shared
 * component library resolve conflicts when a caller overrides an internal
 * class — and this project has no shared component library. It has one page,
 * whose components are used exactly once each and never take a `className`
 * override that fights an internal one.
 *
 * `tailwind-merge` would also have to be taught this project's custom `--text-*`
 * scale, because it classifies an unrecognised `text-<name>` as a *colour* and
 * silently drops the size when one is merged next to a text colour. Carrying
 * both a dependency and that maintenance burden to solve a problem the codebase
 * does not have is the wrong trade.
 *
 * If a genuinely reusable component with overridable styling ever lands here,
 * replace this — do not work around it.
 */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}
