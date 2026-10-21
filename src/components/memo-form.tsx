import { useEffect, useId, useRef, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Honeypot } from '#/components/field.tsx'
import { MemoSelect } from '#/components/memo-select.tsx'
import { OrbitMark } from '#/components/orbit-mark.tsx'
import { brand, contact } from '#/content/site.ts'
import { contactEmail } from '#/env.ts'
import { trackEvent } from '#/lib/analytics.ts'
import { commercialWork, quoteVolumes, waitlistSchema } from '#/lib/waitlist.ts'
import { joinWaitlist } from '#/server/waitlist.ts'

import type { ReactNode } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import type { WaitlistFormValues } from '#/lib/waitlist.ts'

/**
 * The contact memo.
 *
 * ── What it is ─────────────────────────────────────────────────────────────
 *
 * The waitlist form wearing a different page. It posts to the same server
 * function, validates against the same schema and is held to the same promise
 * (AGENTS.md §6): only the address is required, nothing is sent to the person
 * who wrote, and the success state says we have it and will write once. Nothing
 * on the server changed to build this, which is the test of whether it is a new
 * page or a new product.
 *
 * ── Why a sheet of paper ───────────────────────────────────────────────────
 *
 * This site's argument is about commercial paper — the quotation, the
 * purchase order, the thing somebody signs. A continuous-feed memo is the
 * oldest form of the document this company is being built to carry, and a
 * contact form that looks like one makes the same point the page does without
 * saying it. Two voices, exactly as in the type system: the *printed* form is
 * the serif in capitals, and whatever a person *enters* is the grotesk.
 *
 * ── Floating labels ────────────────────────────────────────────────────────
 *
 * The label starts on the line, as the field's own placeholder, and lifts when
 * there is something to label. It is still a real `<label>`, so the field keeps
 * its accessible name the whole time; the lift is CSS (`:focus-within`,
 * `:not(:placeholder-shown)`, autofill), which is why inputs carry a single
 * space as a placeholder. No state tracks "filled", so there is none to drift.
 *
 * ── The receipt ────────────────────────────────────────────────────────────
 *
 * On success the sheet is replaced by its carbon: a second, paler sheet that
 * repeats what was typed and is stamped. The stamp is the page's one flourish
 * and it has a job — it is the moment the page says "recorded" without
 * promising a reply, which is all the server can honestly say.
 */

type Submission =
  | { kind: 'idle' }
  | { kind: 'success'; reference: string; record: Array<readonly [string, string]> }
  | { kind: 'error' }

const { memo, receipt } = contact

export function MemoForm() {
  const [submission, setSubmission] = useState<Submission>({ kind: 'idle' })

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      workEmail: '',
      commercialWork: '',
      quoteVolume: '',
      company: '',
      role: '',
      erp: '',
      pain: '',
      companyWebsite: '',
      renderedAt: 0,
    },
  })

  /** The instant the form became usable — see `waitlist-form.tsx` for why it is not `Date.now()` above. */
  useEffect(() => {
    setValue('renderedAt', Date.now())
  }, [setValue])

  /**
   * "Write another" removes the button that had focus along with the receipt it
   * was on, which would drop a keyboard user at the top of the document. The
   * form that replaces it takes focus on its first field instead.
   */
  const returning = useRef(false)
  useEffect(() => {
    if (submission.kind !== 'idle' || !returning.current) return
    returning.current = false
    setFocus('workEmail')
  }, [submission.kind, setFocus])

  /** The textarea's text, so its hidden twin can grow with it. */
  const pain = useWatch({ control, name: 'pain' }) ?? ''

  async function onSubmit(values: WaitlistFormValues) {
    try {
      const result = await joinWaitlist({ data: values })

      const fields = memo.fields
      const record = (
        [
          [fields.email, values.workEmail],
          [fields.company, values.company],
          [fields.role, values.role],
          [fields.commercialWork, values.commercialWork],
          [fields.quoteVolume, values.quoteVolume],
          [fields.erp, values.erp],
          [fields.pain, values.pain],
        ] as const
      )
        .map(([label, value]) => [label, (value ?? '').trim()] as const)
        .filter(([, value]) => value !== '')

      setSubmission({ kind: 'success', reference: result.reference, record })

      /** Same two fixed-option answers as the home form, and nothing that identifies anybody. */
      trackEvent('waitlist_join', {
        commercial_work: values.commercialWork || 'not_answered',
        quote_volume: values.quoteVolume || 'not_answered',
      })
    } catch (error) {
      console.error('[contact] submission failed', error)
      setSubmission({ kind: 'error' })
    }
  }

  if (submission.kind === 'success') {
    return (
      <Receipt
        reference={submission.reference}
        record={submission.record}
        onAnother={() => {
          reset()
          setValue('renderedAt', Date.now())
          returning.current = true
          setSubmission({ kind: 'idle' })
        }}
      />
    )
  }

  return (
    <section className="memo-paper memo-enter" aria-label={memo.formLabel}>
      <div className="memo-texture" aria-hidden="true" />
      <div className="memo-perforations" aria-hidden="true" />

      <header className="memo-header">
        <a href="/" className="memo-mark" aria-label={brand.name}>
          <OrbitMark />
        </a>
      </header>

      <div className="memo-body">
        <div className="memo-content">
          <h2 className="sr-only">{memo.formLabel}</h2>
          <p className="memo-description memo-worn">{memo.description}</p>

          <form
            noValidate
            aria-busy={isSubmitting}
            onSubmit={(event) => {
              void handleSubmit(onSubmit)(event)
            }}
            className="memo-form"
          >
            <Honeypot {...register('companyWebsite')} name="companyWebsite" />

            <fieldset disabled={isSubmitting} className="memo-fieldset">
              <TextField
                label={memo.fields.email}
                error={errors.workEmail?.message}
                registration={register('workEmail')}
                type="email"
                autoComplete="email"
                required
              />

              <div className="memo-pair">
                <TextField
                  label={memo.fields.company}
                  error={errors.company?.message}
                  registration={register('company')}
                  autoComplete="organization"
                />
                <TextField
                  label={memo.fields.role}
                  error={errors.role?.message}
                  registration={register('role')}
                  autoComplete="organization-title"
                />
              </div>

              <Controller
                control={control}
                name="commercialWork"
                render={({ field, fieldState }) => (
                  <SelectField
                    label={memo.fields.commercialWork}
                    options={commercialWork}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />

              <div className="memo-pair">
                <Controller
                  control={control}
                  name="quoteVolume"
                  render={({ field, fieldState }) => (
                    <SelectField
                      label={memo.fields.quoteVolume}
                      options={quoteVolumes}
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={fieldState.error?.message}
                    />
                  )}
                />
                <TextField
                  label={memo.fields.erp}
                  error={errors.erp?.message}
                  registration={register('erp')}
                  autoComplete="off"
                />
              </div>

              <TextField
                label={memo.fields.pain}
                error={errors.pain?.message}
                registration={register('pain')}
                multiline
                mirror={pain}
              />
            </fieldset>

            <p className="memo-note memo-worn">{memo.requiredNote}</p>

            <Notice open={submission.kind === 'error'}>
              <p className="memo-notice-title">{memo.failure.title}</p>
              <p className="memo-notice-body">{memo.failure.body}</p>
              <a href={`mailto:${contactEmail}`} className="memo-notice-link">
                {memo.failure.action} {contactEmail}
              </a>
            </Notice>

            <button type="submit" className="memo-submit" disabled={isSubmitting}>
              <span className="memo-submit-label">
                {isSubmitting ? (
                  <>
                    <span className="memo-spinner" aria-hidden="true" />
                    {memo.sending}
                  </>
                ) : (
                  <>
                    {memo.submit}
                    <ArrowRight />
                  </>
                )}
              </span>
            </button>

            <p className="memo-progress memo-worn" role="status">
              {isSubmitting ? <Patience /> : null}
            </p>
          </form>

          <p className="memo-privacy memo-worn">{memo.privacy}</p>
        </div>
      </div>
    </section>
  )
}

/** "Still sending" appears only once the wait is long enough to be worth saying. */
function Patience() {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), 4_000)
    return () => window.clearTimeout(timer)
  }, [])

  return slow ? memo.stillSending : null
}

/* ── Fields ───────────────────────────────────────────────────────────── */

function TextField({
  label,
  error,
  registration,
  type = 'text',
  autoComplete,
  required,
  multiline = false,
  mirror = '',
}: {
  label: string
  error: string | undefined
  registration: UseFormRegisterReturn
  type?: 'text' | 'email'
  autoComplete?: string
  required?: boolean
  multiline?: boolean
  /** The textarea's current text, mirrored into a hidden twin so the pair grows together. */
  mirror?: string
}) {
  const id = useId()
  const errorId = `${id}-error`

  const shared = {
    id,
    placeholder: ' ',
    autoComplete,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
    ...registration,
  } as const

  return (
    <div className="memo-field">
      <div className="floating-field">
        <label htmlFor={id} className="floating-label memo-worn">
          {label}
        </label>
        {multiline ? (
          <div className="grow" data-mirror={`${mirror} `}>
            <textarea {...shared} rows={1} className="input-field needs-field" />
          </div>
        ) : (
          <input
            {...shared}
            type={type}
            required={required}
            autoCapitalize={type === 'email' ? 'none' : undefined}
            spellCheck={type === 'email' ? false : undefined}
            className="input-field"
          />
        )}
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  )
}

function SelectField({
  label,
  options,
  value,
  onChange,
  onBlur,
  error,
}: {
  label: string
  options: ReadonlyArray<string>
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  error: string | undefined
}) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="memo-field">
      <MemoSelect
        id={id}
        label={label}
        options={options}
        skip={memo.skip}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        invalid={Boolean(error)}
        describedBy={error ? errorId : undefined}
      />
      <FieldError id={errorId} message={error} />
    </div>
  )
}

/**
 * The error, in a box that is always mounted and opens and closes.
 *
 * The message is only a live region while it is the current one: an alert
 * element is inserted when there is something to say and swapped for an inert,
 * `aria-hidden` copy while the box closes, so it announces once on arrival and
 * is not read again on the way out. The previous text is kept so the box
 * collapses around words instead of around nothing.
 */
function FieldError({ id, message }: { id: string; message: string | undefined }) {
  const [kept, setKept] = useState(message ?? '')
  if (message && message !== kept) setKept(message)

  return (
    <div className="form-reveal" data-open={Boolean(message)} inert={!message}>
      <div className="form-reveal-content">
        {message ? (
          <p id={id} role="alert" className="field-error">
            {message}
          </p>
        ) : (
          <p className="field-error" aria-hidden="true">
            {kept}
          </p>
        )}
      </div>
    </div>
  )
}

function Notice({ open, children }: { open: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  /** An error the visitor did not cause has to be seen: move focus to it. */
  useEffect(() => {
    if (open) ref.current?.focus()
  }, [open])

  return (
    <div className="form-reveal" data-open={open} inert={!open}>
      <div className="form-reveal-content">
        <div ref={ref} role={open ? 'alert' : undefined} tabIndex={-1} className="memo-notice">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="memo-notice-icon">
            <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.3" />
            <path d="M8 4.75v3.9M8 10.9v.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div>{children}</div>
        </div>
      </div>
    </div>
  )
}

/* ── The receipt ──────────────────────────────────────────────────────── */

function Receipt({
  reference,
  record,
  onAnother,
}: {
  reference: string
  record: Array<readonly [string, string]>
  onAnother: () => void
}) {
  const heading = useRef<HTMLHeadingElement>(null)

  /** The form that had focus is gone; put it on the thing that replaced it. */
  useEffect(() => {
    heading.current?.focus()
  }, [])

  return (
    <section className="memo-paper memo-paper--copy memo-enter" aria-labelledby="memo-receipt-title">
      <div className="memo-texture" aria-hidden="true" />
      <div className="memo-perforations" aria-hidden="true" />

      <header className="memo-header">
        <span className="memo-mark">
          <OrbitMark />
        </span>
      </header>

      <div className="memo-body">
        <div className="memo-content memo-receipt">
          <p className="memo-kicker memo-worn">{receipt.kicker}</p>
          <h2 id="memo-receipt-title" ref={heading} tabIndex={-1} className="memo-receipt-title">
            {receipt.heading}
          </h2>
          <p className="memo-receipt-body">{receipt.body}</p>

          <dl className="memo-record">
            <div>
              <dt className="memo-worn">{receipt.reference}</dt>
              <dd className="ic-tabular">{reference}</dd>
            </div>
            {record.map(([label, value]) => (
              <div key={label}>
                <dt className="memo-worn">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          <p className="memo-lead">
            {receipt.lead} {brand.motto.toLowerCase()}
          </p>

          <div className="memo-actions">
            <button type="button" className="memo-action" onClick={onAnother}>
              {receipt.another}
            </button>
            <a href="/" className="memo-action memo-action--primary">
              {receipt.home}
            </a>
          </div>
        </div>

        <Stamp reference={reference} />
      </div>
    </section>
  )
}

/**
 * The rubber stamp.
 *
 * Drawn, not photographed: two rules, the word, and the reference, in the
 * serif at its single weight, with the ink worn by the page's own turbulence
 * filter so it is never the same clean edge twice. It multiplies into the paper
 * rather than sitting on it. It carries no date and no name of a person — it
 * records that a note arrived, and that is all it is entitled to say.
 */
function Stamp({ reference }: { reference: string }) {
  return (
    <div className="memo-stamp" aria-hidden="true">
      <svg viewBox="0 0 240 128" className="memo-stamp-art">
        <g filter="url(#memo-stamp-ink)" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="234" height="122" rx="9" strokeWidth="3" />
          <rect x="11" y="11" width="218" height="106" rx="4" strokeWidth="1" />
        </g>
        <g filter="url(#memo-stamp-ink)" fill="currentColor" textAnchor="middle">
          <text x="120" y="42" fontSize="10" letterSpacing="3.2" className="memo-stamp-small">
            {brand.name.toUpperCase()}
          </text>
          <text x="120" y="80" fontSize="31" letterSpacing="4.5" className="memo-stamp-word">
            {receipt.stamp.toUpperCase()}
          </text>
          <text x="120" y="104" fontSize="10.5" letterSpacing="1.6" className="memo-stamp-small">
            {reference}
          </text>
        </g>
      </svg>
    </div>
  )
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="memo-arrow">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
