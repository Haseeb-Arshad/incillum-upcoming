import { useEffect, useRef, useState } from 'react'

import { Icon, reelIcons } from '#/components/icons.tsx'
import { charlie } from '#/content/site.ts'

/**
 * The Charlie page's film: Charlie at work on one request, cut from Incillum
 * Studio's own pages (`video/charlie`), with a rail of its chapters.
 *
 * It plays muted while at least half of it is on screen, and stops when it
 * leaves; once the reader presses play or pause, the reader decides, not the
 * scroll. Under reduced motion it never starts by itself. Sound is the
 * reader's to turn on. The chapters are the page's steps: each starts at a
 * second of the film, fills as the film passes through it, and plays from its
 * start when chosen — as does a step's own "watch" link, through `seekReel`.
 */

const { reel, steps } = charlie
const seekEvent = 'charlie-reel:seek'

/** Plays the film on this page from `at` seconds. */
export function seekReel(at: number) {
  window.dispatchEvent(new CustomEvent<number>(seekEvent, { detail: at }))
}

/** Plays the film, from `at` seconds if given; a refusal (no sound allowed, no data yet) leaves it paused. */
function start(video: HTMLVideoElement, at?: number) {
  if (at !== undefined) seek(video, at)
  void video.play().catch(() => {})
}

/**
 * Moves the film to `at` — now if it can be sought there, or as soon as it can.
 * A file served without byte ranges can only be sought as far as it has
 * arrived, and a seek past that is silently dropped, so it is tried again as
 * the file comes in.
 */
const pending = new WeakMap<HTMLVideoElement, () => void>()

function seek(video: HTMLVideoElement, at: number) {
  // A later choice replaces an earlier one still waiting for its part of the file.
  pending.get(video)?.()
  const reachable = () => {
    for (let range = 0; range < video.seekable.length; range += 1) {
      if (video.seekable.start(range) <= at && at <= video.seekable.end(range)) return true
    }
    return false
  }
  video.currentTime = at
  if (reachable()) return
  const cancel = () => {
    video.removeEventListener('progress', retry)
    video.removeEventListener('canplaythrough', retry)
    pending.delete(video)
  }
  const retry = () => {
    if (!reachable()) return
    cancel()
    video.currentTime = at
  }
  video.addEventListener('progress', retry)
  video.addEventListener('canplaythrough', retry)
  pending.set(video, cancel)
}

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`

export function CharlieReel() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  /** Set once the reader has pressed play or pause: from then on the scroll no longer decides. */
  const chosenRef = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [time, setTime] = useState(0)

  // The film's own state, reported back: playing, the time, and the sound.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    const report = () => {
      setPlaying(!video.paused)
      setMuted(video.muted)
      setTime(video.currentTime)
    }
    const events = ['play', 'pause', 'timeupdate', 'volumechange', 'seeked'] as const
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

  // A step's "watch" link: to the film, and from that step.
  useEffect(() => {
    const seek = (event: Event) => {
      const video = videoRef.current
      if (!video) return
      chosenRef.current = true
      start(video, (event as CustomEvent<number>).detail)
      frameRef.current?.scrollIntoView({
        block: 'center',
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      })
    }
    window.addEventListener(seekEvent, seek)
    return () => window.removeEventListener(seekEvent, seek)
  }, [])

  function play(at?: number) {
    const video = videoRef.current
    if (!video) return
    chosenRef.current = true
    start(video, at)
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
          onClick={toggle}
        />
        <button type="button" className="reel-start" onClick={() => play()} tabIndex={playing ? -1 : 0}>
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
      <ol className="reel-chapters" aria-label={controls.chapters}>
        {steps.items.map((step, index) => {
          const end = steps.items[index + 1]?.at ?? reel.duration
          const active = time >= step.at && time < end
          const filled = Math.min(1, Math.max(0, (time - step.at) / (end - step.at)))
          return (
            <li key={step.key}>
              <button
                type="button"
                className="reel-chapter"
                aria-current={active ? 'step' : undefined}
                onClick={() => play(step.at)}
              >
                <span className="reel-chapter-bar" aria-hidden="true">
                  <span style={{ transform: `scaleX(${filled})` }} />
                </span>
                <span className="reel-chapter-label">
                  <span className="reel-chapter-number ic-tabular">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {step.label}
                </span>
                <span className="reel-chapter-time">{clock(step.at)}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </figure>
  )
}
