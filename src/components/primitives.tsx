import { cn } from '#/lib/cn.ts'

import type { ComponentProps, ReactNode } from 'react'

/**
 * The handful of shapes this page repeats.
 *
 * Everything here is layout or type. Nothing carries product meaning, and
 * nothing takes a variant it does not use — a `<Button>` with five tones on a
 * page with two buttons is a component library nobody asked for.
 */

/** Content measure. One width, used by every band, so nothing drifts. */
export function Container({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mx-auto w-full max-w-measure px-6 sm:px-8 lg:px-10', className)}>
      {children}
    </div>
  )
}

/**
 * Section label.
 *
 * The only tracked-out uppercase style on the site, and the only thing standing
 * in for the monospace a technical page would reach for. Small caps in the
 * grotesk stays in the two-typeface system; a third family for six words would
 * not have earned its download.
 */
export function Label({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <p className={cn('text-label text-ink-400 uppercase', className)}>{children}</p>
  )
}

/** A hairline. The page's only divider — no shadows, no filled rules. */
export function Rule({ className }: { className?: string }) {
  return <hr aria-hidden="true" className={cn('border-0 border-t border-line', className)} />
}

/**
 * The arrow that rides in the primary button.
 *
 * Drawn inline rather than pulled from an icon package: it inherits
 * `currentColor`, costs no request, cannot shift layout while a font loads, and
 * is the only glyph on the site that is not a letter. A dependency for one
 * 14-pixel path is not a saving.
 */
function ArrowRight() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="size-[0.875em] shrink-0 translate-y-[0.5px]"
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type Tone = 'primary' | 'secondary'
type Size = 'md' | 'lg'

/**
 * Button styling, shared by the three shapes a call to action can take: a real
 * `button`, an in-page anchor, and an external link.
 *
 * One class function and three thin wrappers, rather than one polymorphic
 * component with an `as` prop — which loses type safety on `href` versus
 * `onClick` and gains nothing at this scale.
 *
 * The primary is a filled black rectangle with a 6px radius and no shadow. That
 * is the whole design: on a page with no colour, a solid black mass *is* the
 * emphasis, and a shadow under it would be the one piece of fake depth in an
 * otherwise flat system.
 */
function buttonClasses(tone: Tone, size: Size, className?: string): string {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-control text-ui whitespace-nowrap',
    'transition-[background-color,border-color,color] duration-[160ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
    'disabled:pointer-events-none disabled:opacity-45',
    size === 'md' && 'h-10 px-4',
    size === 'lg' && 'h-12 px-6',
    tone === 'primary' && 'bg-ink text-paper hover:bg-ink-800',
    tone === 'secondary' &&
      'border border-line-strong bg-paper-raised text-ink hover:bg-paper-sunken',
    className,
  )
}

interface CtaProps {
  tone?: Tone
  size?: Size
  arrow?: boolean
  className?: string
  children: ReactNode
}

export function Button({
  tone = 'primary',
  size = 'md',
  arrow = false,
  className,
  children,
  type = 'button',
  ...rest
}: CtaProps & Omit<ComponentProps<'button'>, 'className' | 'children'>) {
  return (
    <button type={type} className={buttonClasses(tone, size, className)} {...rest}>
      {children}
      {arrow ? <ArrowRight /> : null}
    </button>
  )
}

export function ButtonLink({
  tone = 'primary',
  size = 'md',
  arrow = false,
  className,
  children,
  ...rest
}: CtaProps & Omit<ComponentProps<'a'>, 'className' | 'children'>) {
  return (
    <a className={buttonClasses(tone, size, className)} {...rest}>
      {children}
      {arrow ? <ArrowRight /> : null}
    </a>
  )
}

/**
 * Inline text link, always underlined.
 *
 * WCAG 1.4.1 requires a link inside a block of text to be distinguishable by
 * more than colour — and on a site with no colour at all, an underline that
 * appeared only on hover would leave a link with *no* resting affordance
 * whatsoever. The offset is generous so the rule clears the serif's descenders.
 */
export function TextLink({
  className,
  children,
  ...rest
}: ComponentProps<'a'> & { children: ReactNode }) {
  return (
    <a
      className={cn(
        'rounded-[2px] underline decoration-line-strong decoration-1 underline-offset-[5px]',
        'transition-colors duration-[160ms] hover:decoration-ink',
        className,
      )}
      {...rest}
    >
      {children}
    </a>
  )
}
