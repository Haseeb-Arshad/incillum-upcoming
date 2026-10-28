import { useEffect, useRef, useState } from 'react'

import { Container } from '#/components/primitives.tsx'
import { Icon, reelIcons } from '#/components/icons.tsx'
import { glass } from '#/content/site.ts'

/**
 * The film under the hero: what Incillum does with a request, in forty-nine
 * seconds (`video/product-film`).
 *
 * Not a walkthrough and not the night: one statement a beat — Charlie picks
 * the request up, reads what it depends on, matches and checks every line,
 * asks suppliers once a person approves, compares the quotes and holds the
 * margin — the one decision that stays with a person, and the documents
 * ready to send. It plays like the Charlie page's film (`charlie-reel.tsx`),
 * on the same styles, without its chapters.
 *
 * It plays muted while at least half of it is on screen, and stops when it
 * leaves; once the reader presses play or pause, the reader decides, not the
 * scroll. Under reduced motion it never starts by itself. Sound is the
 * reader's to turn on. Everything it says is on the page as text too, for a
 * screen reader and for a page without JavaScript, where the poster is all
 * that shows.
 */

const { reel } = glass

/** Plays the film; a refusal (no sound allowed, no data yet) leaves it paused. */
function start(video: HTMLVideoElement) {
  void video.play().catch(() => {})
}

export function GlassReel() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  /** Set once the reader has pressed play or pause: from then on the scroll no longer decides. */
  const chosenRef = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)

  // The film's own state, reported back: playing, and the sound.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    const report = () => {
      setPlaying(!video.paused)
      setMuted(video.muted)
    }
    const events = ['play', 'pause', 'volumechange'] as const
    for (const event of events) video.addEventListener(event, report)
    return () => {
      for (const event of events) video.removeEventListener(event, report)
    }
  }, [])

  // Muted, while it is on screen — unless motion is reduced, or the reader has chosen.
  useEffect(() => {
    const video = videoRef.current
    const frame = frameRef.current
    if (!video || !frame || typeof IntersectionObserver === 'undefined') return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (chosenRef.current) return
        if (entries[0]?.isIntersecting) start(video)
        else video.pause()
      },
      { threshold: 0.5 },
    )
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])

  function play() {
    const video = videoRef.current
    if (!video) return
    chosenRef.current = true
    start(video)
  }

  function toggle() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) play()
    else {
      chosenRef.current = true
      video.pause()
    }
  }

  function toggleSound() {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    if (!video.muted && video.paused) play()
  }

  const { controls } = reel
  return (
    <section id="film" aria-labelledby="film-label" className="glass-film-section">
      <Container>
        <div className="glass-reel">
          {/* What the film follows, first, in the server's HTML: a sentence, not a label. */}
          <h2 id="film-label" className="glass-reel-licence">
            {reel.licence}
          </h2>

          <figure className="reel" data-playing={playing ? '' : undefined}>
            <div ref={frameRef} className="reel-frame">
              <video
                ref={videoRef}
                className="reel-video"
                src={reel.src}
                poster={reel.poster}
                width={1920}
                height={1080}
                playsInline
                loop
                preload="metadata"
                aria-label={reel.label}
                aria-describedby="film-statements"
                onClick={toggle}
              />
              <button
                type="button"
                className="reel-start"
                onClick={play}
                tabIndex={playing ? -1 : 0}
              >
                <span className="reel-start-pill">
                  <Icon icon={reelIcons.play} className="reel-icon" />
                  {controls.play}
                </span>
              </button>
              <div className="reel-controls">
                <button
                  type="button"
                  className="reel-button"
                  onClick={toggle}
                  aria-label={playing ? controls.pause : controls.play}
                >
                  <Icon icon={playing ? reelIcons.pause : reelIcons.play} className="reel-icon" />
                </button>
                <button
                  type="button"
                  className="reel-button"
                  onClick={toggleSound}
                  aria-label={muted ? controls.soundOn : controls.soundOff}
                  aria-pressed={!muted}
                >
                  <Icon icon={muted ? reelIcons.soundOff : reelIcons.soundOn} className="reel-icon" />
                </button>
              </div>
            </div>
            <ol id="film-statements" className="sr-only">
              {reel.statements.map((statement) => (
                <li key={statement}>{statement}</li>
              ))}
            </ol>
          </figure>
        </div>
      </Container>
    </section>
  )
}
