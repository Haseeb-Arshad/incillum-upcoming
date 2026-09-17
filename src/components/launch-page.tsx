import { useState } from 'react'
import { Mark } from '#/components/mark.tsx'
import { WaitlistForm } from '#/components/waitlist-form.tsx'
import { brand, launch } from '#/content/site.ts'

/** Decorative geometry, never a representation of live product activity. */
const contours = Array.from({ length: 56 }, (_, ring) => {
  const v = (ring / 56) * Math.PI * 2
  return (
    Array.from({ length: 181 }, (_, step) => {
      const u = (step / 180) * Math.PI * 2
      const radius = 205 + 82 * Math.cos(v)
      const x = radius * Math.cos(u)
      const y = radius * Math.sin(u) * 0.48 + 82 * Math.sin(v) * 0.88
      return `${step ? 'L' : 'M'}${(350 + x * 0.86 - y * 0.5).toFixed(2)},${(350 + x * 0.5 + y * 0.86).toFixed(2)}`
    }).join(' ') + ' Z'
  )
})

export function LaunchPage() {
  const [paused, setPaused] = useState(false)
  return (
    <div className="launch" data-inverted data-paused={paused}>
      <header className="launch-header" role="banner">
        <a href="/" className="launch-brand" aria-label={brand.name}>
          <Mark className="launch-mark" />
          <span>{brand.name}</span>
        </a>
        <span className="launch-stage">{launch.stage}</span>
      </header>
      <section className="launch-stage-area" aria-labelledby="launch-title">
        <div className="launch-art" aria-hidden="true">
          <svg viewBox="0 0 700 700" fill="none">
            <g className="launch-contours">
              {contours.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
          </svg>
        </div>
        <div className="launch-copy">
          <p className="launch-eyebrow">{launch.category}</p>
          <h1 id="launch-title">
            {launch.headlineStart}
            <br />
            <em>{launch.headlineEnd}</em>
          </h1>
          <div id="waitlist" className="launch-invitation">
            <h2>{launch.invitation}</h2>
            <WaitlistForm compact />
            <p className="launch-note">{launch.note}</p>
          </div>
        </div>
        <div className="launch-art-caption" aria-hidden="true">
          <span>FIG. 01</span>
          <span>{launch.stage}</span>
        </div>
      </section>
      <footer className="launch-footer" role="contentinfo">
        <ol className="launch-index">
          {launch.index.map((item, i) => (
            <li key={item}>
              <span>0{i + 1}</span>
              {item}
            </li>
          ))}
        </ol>
        <div className="launch-bottom">
          <p>{brand.motto}</p>
          <button
            type="button"
            className="launch-motion"
            onClick={() => setPaused(!paused)}
            aria-pressed={paused}
          >
            {paused ? launch.play : launch.pause}
          </button>
          <span>
            © {new Date().getFullYear()} {brand.name}
          </span>
        </div>
      </footer>
    </div>
  )
}
