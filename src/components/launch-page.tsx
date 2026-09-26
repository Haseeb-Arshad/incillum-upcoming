import { ParticleCore } from '#/components/particle-core.tsx'
import { Mark } from '#/components/mark.tsx'
import { WaitlistForm } from '#/components/waitlist-form.tsx'
import { brand, launch } from '#/content/site.ts'

export function LaunchPage() {
  return (
    <div className="launch" data-inverted>
      <header className="launch-header" role="banner">
        <a href="/" className="launch-brand" aria-label={brand.name}>
          <Mark className="launch-mark" />
          <span>{brand.name}</span>
        </a>
        <span className="launch-stage">{launch.stage}</span>
      </header>
      <section className="launch-stage-area" aria-labelledby="launch-title">
        <ParticleCore />
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
          <span>
            © {new Date().getFullYear()} {brand.name}
          </span>
        </div>
      </footer>
    </div>
  )
}
