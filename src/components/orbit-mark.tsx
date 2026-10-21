/**
 * `/logo.png`, redrawn as four ellipses on `currentColor`.
 *
 * The raster's hairline is drawn for 1254px and thins to nothing at header
 * size; this is the same geometry (read off the file: 86% by 41%, turned in
 * quarter-steps of 45°) with a stroke chosen for 40–60px. Shared by the home
 * page's masthead and the contact page's brand column, so the two cannot drift.
 */
export function OrbitMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      {[0, 45, 90, 135].map((angle) => (
        <ellipse
          key={angle}
          cx="50"
          cy="50"
          rx="43"
          ry="20.5"
          transform={`rotate(${angle} 50 50)`}
          stroke="currentColor"
          strokeWidth="2.4"
        />
      ))}
    </svg>
  )
}
