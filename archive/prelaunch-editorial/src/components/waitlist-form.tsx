import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Field, Honeypot, Input, Select, Textarea } from '#/components/field.tsx'
import { Button } from '#/components/primitives.tsx'
import { brand } from '#/content/site.ts'
import { trackEvent } from '#/lib/analytics.ts'
import { commercialWork, quoteVolumes, waitlistSchema } from '#/lib/waitlist.ts'
import { joinWaitlist } from '#/server/waitlist.ts'

import type { WaitlistFormValues } from '#/lib/waitlist.ts'

/**
 * The waitlist form.
 *
 * ── One question, then seven ───────────────────────────────────────────────
 *
 * The site is looking for design partners, and identifying one needs to know
 * what they quote, how much of it, what it lands in and which part of it hurts.
 * Asking all of that up front is how a form collects nothing: eight fields in
 * front of somebody who has not yet decided to give you an address is a page
 * that has confused qualification with conversion.
 *
 * So the form opens on the address and one question, and the other six sit
 * behind a disclosure the reader opens. Every one of them is optional and there
 * is a test that fails if one of them stops being.
 *
 * ── Why a disclosure, and not a reveal ────────────────────────────────────
 *
 * The first build of this revealed the block automatically once the address was
 * blurred and valid, on the reasoning that blur is a completed action and
 * therefore a safe moment to change the layout. It is not, and the end-to-end
 * suite found the reason in four tests: **clicking the submit button is a
 * blur**. Somebody who types an address and goes straight for the button gets
 * five fields inserted above it at the instant they press, the button slides
 * down, and the click lands on nothing. The most decisive visitor on the page
 * is the one it fails.
 *
 * Narrowing the trigger — checking `relatedTarget`, ignoring a blur toward the
 * submit button — fixes the symptom and keeps the shape of the fault: browsers
 * disagree about whether clicking a button focuses it, so the guard would work
 * on one engine and not another, and the failure would be invisible again.
 *
 * So the block is a `<details>` the reader opens. Nothing moves unless somebody
 * asked it to, the summary is keyboard-operable and announced as expanded or
 * collapsed without a line of ARIA, and it works with no JavaScript at all.
 *
 * The cost is real and it is accepted: fewer people will answer seven optional
 * questions they have to open than would answer seven that appeared in front of
 * them. The ones who open it are the ones worth calling first, and a form that
 * occasionally eats a submission is worse than a form that collects less.
 *
 * ── Why the address field is not a placeholder-only input ──────────────────
 *
 * The single-input-plus-button pattern this design invites puts the label
 * inside the field as placeholder text, where it disappears the moment somebody
 * types and takes the field's accessible name with it. The label stays visible.
 *
 * ── The success state ──────────────────────────────────────────────────────
 *
 * It says we have the address and names what the one email will be for — a
 * call, then one real case run beside the way the team works now. That is the
 * same promise the hero makes above the button and the same one `earlyAccess`
 * commits to at the end of the page: three statements of one promise is a
 * promise, three statements of three promises is a leak.
 *
 * It still does **not** say "check your inbox", and that restraint is
 * load-bearing rather than modest: `server/waitlist.ts` mails *us* and nothing
 * sends a confirmation, so a page promising one would produce its first broken
 * promise before the product had shipped anything at all. There is a test.
 *
 * The motto is the last line, and this is one of the two places on the site it
 * is allowed to appear. It earns the position: somebody who has just joined is
 * the one reader who has agreed with the argument, and four words is the whole
 * of what is left to say to them.
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
      commercialWork: '',
      quoteVolume: '',
      company: '',
      role: '',
      erp: '',
      pain: '',
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

      /**
       * The conversion event, and what is deliberately not in it.
       *
       * No email address, no company, no role, no free text. `dataLayer` is
       * readable by every tag in the container and forwarded to whichever
       * vendors are configured there — so anything pushed here should be
       * assumed to end up in an analytics product, and a person's employer and
       * job title in an analytics product is a data problem nobody signed up
       * for.
       *
       * The two that go are safe and are the two worth measuring: both are
       * fixed option sets, neither identifies anybody, and between them they
       * say which vertical and which size of operation this page is actually
       * reaching — which is what decides who the first ten calls are with.
       *
       * A no-op when GTM is unconfigured, so this needs no guard.
       */
      trackEvent('waitlist_join', {
        commercial_work: values.commercialWork || 'not_answered',
        quote_volume: values.quoteVolume || 'not_answered',
      })
    } catch (error) {
      // Never swallow: surface a recovery path, keep the detail in the console.
      console.error('[waitlist] submission failed', error)
      setSubmitState({
        kind: 'error',
        message: 'That did not send. Try again, or email us and we will add you by hand.',
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
        <p className="font-display text-heading text-ink">You’re on the list.</p>
        <p className="text-body text-ink-600">
          If the workflow looks like a fit, we’ll reach out about running one real case
          alongside the way your team works today. Nothing is sent before then.
        </p>
        <p className="ic-tabular text-small text-ink-400">{submitState.reference}</p>
        {/*
          The motto, in the serif, behind the page's hairline. One of two
          placements on the whole site — see `brand.motto`. It is last because
          there is nothing to say after it.
        */}
        <p className="mt-2 border-t border-line pt-4 font-display text-quote text-ink">
          Until then: {brand.motto.toLowerCase()}
        </p>
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

      {/*
        The qualifying questions, behind a disclosure the reader opens.

        `<details>` rather than a state flag and a conditional render: the
        summary is focusable, operable with Enter and Space, and announced with
        its expanded state, all without a line of ARIA — and it works before
        hydration, which a React-controlled version does not.

        The `[&::-webkit-details-marker]` reset removes Safari's legacy triangle
        so the disclosure reads as a line of the form rather than as a native
        control dropped into it. The `group-open` rotation on the chevron is the
        one piece of motion here and it is a 160ms transform on an inline SVG,
        which is the same budget the button's arrow spends.
      */}
      <details className="group border-t border-line pt-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-[2px] text-small font-medium text-ink [&::-webkit-details-marker]:hidden">
          <span>
            Tell us about the work
            <span className="ml-1.5 font-normal text-ink-400">optional</span>
          </span>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="size-4 shrink-0 text-ink-400 transition-transform duration-[160ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-open:rotate-180"
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </summary>

        <div className="mt-5 flex flex-col gap-5">
          {/*
            Why, not whether. The summary above already says optional and every
            field below carries its own marker — a third statement of the same
            fact is noise, and the one thing none of them says is what answering
            actually buys.
          */}
          <p className="text-small text-ink-400">
            It is what tells us whether to start with your team.
          </p>

          <Field
            label="What kind of commercial work do you handle?"
            error={errors.commercialWork?.message}
          >
            {({ id, describedBy, invalid }) => (
              <Select
                id={id}
                aria-describedby={describedBy}
                invalid={invalid}
                defaultValue=""
                {...register('commercialWork')}
              >
                <option value="">Skip this</option>
                {commercialWork.map((kind) => (
                  <option key={kind} value={kind}>
                    {kind}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Company" error={errors.company?.message}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="text"
                autoComplete="organization"
                aria-describedby={describedBy}
                invalid={invalid}
                {...register('company')}
              />
            )}
          </Field>

          <Field label="Your role" error={errors.role?.message}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="text"
                autoComplete="organization-title"
                aria-describedby={describedBy}
                invalid={invalid}
                {...register('role')}
              />
            )}
          </Field>

          <Field
            label="Roughly how many RFQs or quotes a month?"
            error={errors.quoteVolume?.message}
          >
            {({ id, describedBy, invalid }) => (
              <Select
                id={id}
                aria-describedby={describedBy}
                invalid={invalid}
                defaultValue=""
                {...register('quoteVolume')}
              >
                <option value="">Skip this</option>
                {quoteVolumes.map((band) => (
                  <option key={band} value={band}>
                    {band}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field
            label="Current ERP"
            hint="Or whatever the quotation has to end up in."
            error={errors.erp?.message}
          >
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="text"
                autoComplete="off"
                aria-describedby={describedBy}
                invalid={invalid}
                {...register('erp')}
              />
            )}
          </Field>

          <Field
            label="What part of quoting costs you the most?"
            error={errors.pain?.message}
          >
            {({ id, describedBy, invalid }) => (
              <Textarea
                id={id}
                rows={3}
                aria-describedby={describedBy}
                invalid={invalid}
                {...register('pain')}
              />
            )}
          </Field>
        </div>
      </details>

      <Button
        type="submit"
        tone="primary"
        size="lg"
        arrow
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Sending…' : 'Join early access'}
      </Button>

      {submitState.kind === 'error' ? (
        <p role="alert" className="text-small text-ink">
          {submitState.message}
        </p>
      ) : null}
    </form>
  )
}
