/**
 * The Incillum logo, shared by the masthead, close, and structured data.
 *
 * The supplied transparent PNG is intentionally kept as the source of truth
 * here so the browser favicon and the visible brand mark cannot drift apart.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt=""
      aria-hidden="true"
      className={className}
      draggable="false"
    />
  )
}
