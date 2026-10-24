import { Icon, stepIcons } from '#/components/icons.tsx'

/**
 * The contact memo's three steps — a quotation, a call, a case — from the
 * product's own icon set (`icons.tsx`). Shared with the home page's close,
 * which promises the same three steps in the same words.
 */
export function StepIcon({ name }: { name: keyof typeof stepIcons }) {
  return <Icon icon={stepIcons[name]} className="memo-step-icon" />
}
