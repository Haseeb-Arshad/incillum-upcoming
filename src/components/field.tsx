import { useId } from 'react'

import { cn } from '#/lib/cn.ts'

import type { ComponentProps, ReactNode, Ref } from 'react'

/**
 * Accessible form primitives.
 *
 * The wiring that is easy to get subtly wrong — `id`, `aria-describedby`,
 * `aria-invalid`, the hint-to-error relationship — is done once here, so no
 * individual field can forget it.
 *
 * The error container exists only when there is an error, rather than sitting
 * on the page empty: a permanently mounted live region announces on every
 * keystroke that changes it, and an empty one is a thing screen readers have to
 * step through for no reason.
 */

export function Field({
  label,
  hint,
  error,
  required = false,
  children,
  className,
}: {
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode
  className?: string
}) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="text-small font-medium text-ink">
        {label}
        {required ? null : (
          <span className="ml-1.5 font-normal text-ink-400">optional</span>
        )}
      </label>

      {hint ? (
        <p id={hintId} className="text-small text-ink-400">
          {hint}
        </p>
      ) : null}

      {children({ id, describedBy, invalid: Boolean(error) })}

      {error ? (
        <p id={errorId} role="alert" className="text-small text-ink">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Control surface.
 *
 * White rather than the page's paper, so a field reads as a place to put
 * something rather than as a rectangle drawn on the background. The invalid
 * state thickens the border to the strong rule and is *also* announced through
 * `aria-invalid` and the message below — on a monochrome page there is no red
 * available, so the visual signal alone was never going to be enough, and
 * building it that way from the start is what keeps it honest.
 */
const controlClasses = cn(
  'w-full rounded-control border bg-paper-raised px-3.5 text-ui text-ink',
  'border-line-strong placeholder:text-ink-200',
  'transition-[border-color] duration-[160ms]',
  'hover:border-ink-200 aria-[invalid=true]:border-ink',
)

export function Input({
  ref,
  invalid,
  className,
  ...props
}: ComponentProps<'input'> & { invalid?: boolean; ref?: Ref<HTMLInputElement> }) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(controlClasses, 'h-12', className)}
      {...props}
    />
  )
}

export function Select({
  ref,
  invalid,
  className,
  children,
  ...props
}: ComponentProps<'select'> & { invalid?: boolean; ref?: Ref<HTMLSelectElement> }) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(controlClasses, 'h-12 appearance-none pr-10', className)}
      {...props}
    >
      {children}
    </select>
  )
}

/**
 * The one multi-line control on the site.
 *
 * `field-sizing: content` is deliberately absent. It is the modern answer and
 * it is not supported everywhere yet, and the fallback — a box that never grows
 * — is worse than a box that is the right size to begin with. Three rows fits
 * the answer this asks for; anything longer scrolls, which is what the caller
 * asked for by using a textarea.
 *
 * `resize-y` rather than the browser default of both axes: a control the
 * visitor can drag wider than its own column is how a careful layout acquires a
 * horizontal scrollbar at 390px.
 */
export function Textarea({
  ref,
  invalid,
  className,
  ...props
}: ComponentProps<'textarea'> & { invalid?: boolean; ref?: Ref<HTMLTextAreaElement> }) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(controlClasses, 'resize-y py-2.5 leading-relaxed', className)}
      {...props}
    />
  )
}

/**
 * The honeypot.
 *
 * Hidden from sight and from assistive technology, out of the tab order, and
 * given a plausible name and a matching label so a naive bot fills it in.
 * Positioned off-canvas rather than `display: none`, which anything
 * sophisticated detects — though sophistication is not what this catches.
 *
 * ── Why the id is generated ────────────────────────────────────────────────
 *
 * It used to be `${name}-field`, which is stable, readable, and wrong the
 * moment the form is rendered twice on one page — which it now is, in the hero
 * and again at the foot of the page. Two elements with one id is invalid HTML
 * and an axe violation, and the specific failure is quiet: the second
 * instance's `<label for>` resolves to the *first* instance's input.
 *
 * `useId` per instance, the same way `Field` does it. The `name` stays fixed,
 * because the server reads the payload by name and it has to keep matching
 * `waitlistSchema`.
 */
export function Honeypot({
  ref,
  name,
  ...props
}: ComponentProps<'input'> & { ref?: Ref<HTMLInputElement> }) {
  const id = useId()

  return (
    <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
      <label htmlFor={id}>Company website</label>
      <input
        ref={ref}
        id={id}
        name={name}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        {...props}
      />
    </div>
  )
}
