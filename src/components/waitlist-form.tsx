import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Field, Honeypot, Input, Select } from '#/components/field.tsx'
import { Button } from '#/components/primitives.tsx'
import { financeWorkflows, waitlistSchema } from '#/lib/waitlist.ts'
import { joinWaitlist } from '#/server/waitlist.ts'

import type { WaitlistFormValues } from '#/lib/waitlist.ts'

/**
 * The waitlist form.
 *
 * ── Why it is two fields and not one ───────────────────────────────────────
 *
 * One required (where to write back) and one optional (which finance workflow
 * you would hand over first). The optional one earns its place because the
 * answer is the ranking input for what gets built after invoice intake — not
 * because a one-field form looks unserious. It stays optional, and there is a
 * test that fails if somebody decides otherwise.
 *
 * ── Why the address field is not a placeholder-only input ──────────────────
 *
 * The single-input-plus-button pattern this design invites puts the label
 * inside the field as placeholder text, where it disappears the moment somebody
 * types and takes the field's accessible name with it. The label stays visible.
 *
 * ── The success state ──────────────────────────────────────────────────────
 *
 * It says we have the address and that we will write once. It does **not** say
 * "check your inbox", and that restraint is load-bearing rather than modest:
 * `server/waitlist.ts` writes to a log and nothing sends a confirmation, so a
 * page promising one would produce its first broken promise before the product
 * had shipped anything at all.
 */

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'success'; reference: string }
  | { kind: 'error'; message: string }

export function WaitlistForm() {
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: 'idle' })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    /**
     * Validate a field the first time it is blurred, then on every keystroke.
     * `onBlur` alone leaves the error — and `aria-invalid` — sitting on a field
     * the visitor has already corrected until they happen to blur it a second
     * time, which is exactly when a screen reader would still be announcing it
     * as invalid.
     */
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      workEmail: '',
      firstWorkflow: '',
      companyWebsite: '',
      /**
       * Zero until the effect below runs. It cannot be `Date.now()` here for
       * two reasons that point the same way: reading the clock during render is
       * impure, and during SSR it would read the *server's* clock — so the
       * timing signal the spam heuristic depends on would measure the gap
       * between our machine and the visitor's submit, which is not a
       * measurement of anything.
       */
      renderedAt: 0,
    },
  })

  /**
   * The moment the form became usable.
   *
   * `spam.ts` rejects a submission that arrives implausibly soon after this, so
   * the value has to be the instant the visitor could first type — which is
   * mount on their machine, not render on ours. Effects run before a human can
   * reach the field, so there is no window in which a real person submits
   * against the zero default.
   */
  useEffect(() => {
    setValue('renderedAt', Date.now())
  }, [setValue])

  async function onSubmit(values: WaitlistFormValues) {
    try {
      const result = await joinWaitlist({ data: values })
      setSubmitState({ kind: 'success', reference: result.reference })
    } catch (error) {
      // Never swallow: surface a recovery path, keep the detail in the console.
      console.error('[waitlist] submission failed', error)
      setSubmitState({
        kind: 'error',
        message:
          'That did not send. Try again, or email us and we will add you by hand.',
      })
    }
  }

  if (submitState.kind === 'success') {
    return (
      /**
       * `role="status"`, not `role="alert"`: this replaces the form on an
       * action the visitor just took deliberately, so it should be announced at
       * the next opportunity rather than interrupting whatever the screen
       * reader is saying about the control they pressed.
       */
      <div
        role="status"
        className="flex flex-col gap-3 rounded-panel border border-line-strong bg-paper-raised p-6 sm:p-7"
      >
        <p className="text-label uppercase text-ink-400">Request recorded</p>
        <p className="font-display text-heading text-ink">
          You are on the list for the private preview.
        </p>
        <p className="text-body text-ink-600">
          We will write to you once, when the finance operator is ready for someone
          outside the team to run it. Nothing is sent before then.
        </p>
        <p className="ic-tabular text-small text-ink-400">{submitState.reference}</p>
      </div>
    )
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event)
      }}
      className="relative flex flex-col gap-5"
    >
      {/*
        `renderedAt` rides in form state from `defaultValues` rather than in a
        hidden input — there is nothing for a user agent to autofill and nothing
        to coerce back from a string.
      */}
      <Honeypot {...register('companyWebsite')} name="companyWebsite" />

      <Field label="Work email" required error={errors.workEmail?.message}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            aria-describedby={describedBy}
            invalid={invalid}
            {...register('workEmail')}
          />
        )}
      </Field>

      <Field
        label="The first thing you would hand it"
        hint="Changes what we build after invoice intake."
        error={errors.firstWorkflow?.message}
      >
        {({ id, describedBy, invalid }) => (
          <Select
            id={id}
            aria-describedby={describedBy}
            invalid={invalid}
            defaultValue=""
            {...register('firstWorkflow')}
          >
            <option value="">Skip this</option>
            {financeWorkflows.map((workflow) => (
              <option key={workflow} value={workflow}>
                {workflow}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Button
        type="submit"
        tone="primary"
        size="lg"
        arrow
        disabled={isSubmitting}
        className="w-full sm:w-auto sm:self-start"
      >
        {isSubmitting ? 'Sending…' : 'Join the waitlist'}
      </Button>

      {submitState.kind === 'error' ? (
        <p role="alert" className="text-small text-ink">
          {submitState.message}
        </p>
      ) : null}
    </form>
  )
}
