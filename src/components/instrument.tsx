import { useEffect, useState } from 'react'

import { Container } from '#/components/primitives.tsx'
import { instrument } from '#/content/site.ts'

/**
 * The instrument — the one picture on this site, and the only thing that moves.
 *
 * ── What sits here, and why it is not a screenshot ─────────────────────────
 *
 * This is the slot a launched company fills with a product shot. There is no
 * product to shoot, and a mocked-up dashboard would be an image of something
 * that does not exist presented as though it does. So the slot holds a drawing
 * of the argument instead: a twenty-four hour rule with the working day marked
 * on it at true scale, and a mark at the reader's own local time.
 *
 * "Works 24/7" is a claim every product on the internet makes. Nine hours
 * against fifteen is a proportion, and a proportion shown is checked in a
 * glance while a proportion asserted is a number the reader has already stopped
 * reading. Whatever hour somebody arrives, the plate can point at the rule and
 * say *this hour, right now* — and for most of the day and all of the night the
 * mark is standing in the empty part.
 *
 * ── Why the reader's clock and not ours ────────────────────────────────────
 *
 * A fixed illustration says the same thing to everyone and means nothing to
 * anyone. Reading the device clock costs one `Date`, never leaves this
 * component and is never sent anywhere — no geolocation prompt, no IP lookup,
 * no network request of any kind — and it turns a diagram into something the
 * reader can check against their own wrist. The IANA zone is printed underneath
 * because a bare time invites the suspicion that it was invented.
 *
 * ── Server rendering ───────────────────────────────────────────────────────
 *
 * The server cannot know what time it is where the reader is, and guessing with
 * its own clock would put the mark in the wrong place and then move it on
 * hydration. The rule, the working-day block, the hour numerals and the plate's
 * own caption all render on the server exactly as they end up; only the mark
 * and the readout wait for the client, and they fade rather than appear.
 */

/** Hours in a day. Named because it is a divisor in five places. */
const DAY_HOURS = 24

/**
 * Major gridline hours. Six-hour spacing is the coarsest division that still
 * shows a reader where noon is without making them count.
 */
const MAJOR_HOURS = [0, 6, 12, 18, 24] as const

/**
 * Pinned to `en-GB` rather than the reader's locale, deliberately. The rule
 * above the readout is a twenty-four hour instrument — it is numbered 00 to 24
 * — so `4:47 PM` underneath it would be a second time format on the same
 * object, and the reader would have to convert between them to check that the
 * mark sits where it should. Finance quotes cut-offs the same way for the same
 * reason.
 */
const timeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

interface LocalClock {
  /** Fractional hours since local midnight, e.g. 15.75 at 15:45. */
  hours: number
  /** `15:45`. */
  time: string
  /** `Europe/London`, or `null` where the environment will not say. */
  zone: string | null
}

/**
 * The reader's clock, or `null` until the browser has one.
 *
 * Ticks every thirty seconds, so a displayed minute is never more than thirty
 * seconds stale — and only while the tab is visible. The `visibilitychange`
 * listener tears the interval down on a hidden tab and re-reads the clock on
 * return, so a tab left open overnight costs nothing and is never wrong when it
 * comes back.
 */
function useLocalClock(): LocalClock | null {
  const [clock, setClock] = useState<LocalClock | null>(null)

  useEffect(() => {
    let timer: number | undefined

    const read = () => {
      const now = new Date()
      let zone: string | null = null
      try {
        zone = Intl.DateTimeFormat().resolvedOptions().timeZone
      } catch {
        // `resolvedOptions` is typed as always returning a zone; a hardened or
        // privacy-patched engine can throw instead. The time is still correct
        // and still worth showing — only the label is dropped.
        zone = null
      }

      setClock({
        hours: now.getHours() + now.getMinutes() / 60,
        time: timeFormat.format(now),
        zone,
      })
    }

    const sync = () => {
      window.clearInterval(timer)
      if (document.visibilityState === 'hidden') return
      read()
      timer = window.setInterval(read, 30_000)
    }

    sync()
    document.addEventListener('visibilitychange', sync)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  return clock
}

function percent(hour: number): string {
  return `${(hour / DAY_HOURS) * 100}%`
}

export function Instrument() {
  const clock = useLocalClock()
  const { from, to } = instrument.officeHours
  const atDesks = clock !== null && clock.hours >= from && clock.hours < to

  return (
    <section aria-label="A working day, drawn to scale" className="pb-16 sm:pb-24">
      <Container>
        <div
          data-inverted=""
          className="rounded-panel border border-line px-6 py-10 sm:px-12 sm:py-14 lg:px-16 lg:py-16"
        >
          {/*
            The drawing is hidden from assistive technology and the caption
            below carries the same information as a sentence. A screen reader
            announcing twenty-five tick marks is noise, and a second description
            of the same clock would be read twice.
          */}
          <div aria-hidden="true">
            {/*
              The readout rides above the mark. Its horizontal position is
              clamped to 10–90% so a reader arriving at 00:10 or 23:50 gets a
              label inside the plate rather than one hanging off the edge. The
              mark itself is never clamped — the mark is the measurement, and
              moving it would make the drawing lie.
            */}
            <div className="relative h-[4.5rem] sm:h-20">
              <div
                className="absolute bottom-0 flex -translate-x-1/2 flex-col items-center gap-1.5 transition-opacity duration-[520ms]"
                style={{
                  left: clock
                    ? `${Math.min(Math.max((clock.hours / DAY_HOURS) * 100, 10), 90)}%`
                    : '50%',
                  opacity: clock ? 1 : 0,
                }}
              >
                <span className="ic-tabular text-[2.25rem] leading-none text-ink sm:text-[2.75rem]">
                  {clock?.time ?? '00:00'}
                </span>
                <span className="text-label uppercase text-ink-400">
                  {clock?.zone ?? ''}
                </span>
              </div>
            </div>

            <div className="relative h-24 border-y border-line sm:h-28">
              {/* The working day, at true width. */}
              <div
                className="absolute inset-y-0 border-x border-line-strong bg-ink/[0.06]"
                style={{ left: percent(from), width: percent(to - from) }}
              >
                <p className="absolute inset-x-0 bottom-3 px-2 text-center text-label uppercase text-ink-400">
                  {instrument.occupiedLabel}
                </p>
              </div>

              {/* Hour ticks. Major hours run full height; the rest are stubs. */}
              {Array.from({ length: DAY_HOURS + 1 }, (_, hour) => {
                const major = (MAJOR_HOURS as ReadonlyArray<number>).includes(hour)
                return (
                  <span
                    key={hour}
                    className={
                      major
                        ? 'absolute inset-y-0 w-px bg-line-strong'
                        : 'absolute top-0 h-2 w-px bg-line'
                    }
                    style={{ left: percent(hour) }}
                  />
                )
              })}

              {/*
                The mark: one hairline in the surface's foreground, capped with a
                small square so it terminates against the rule rather than
                trailing off. It fades in on mount — opacity only, so a reader
                who has asked for reduced motion still gets a transition rather
                than a hard swap, and nothing on the page translates.
              */}
              <span
                className="absolute inset-y-0 w-px bg-ink transition-opacity duration-[520ms]"
                style={{
                  left: clock ? percent(clock.hours) : '50%',
                  opacity: clock ? 1 : 0,
                }}
              >
                <span className="absolute -top-px -left-[2px] size-[5px] bg-ink" />
              </span>
            </div>

            {/* Numerals, hung from the same coordinates as the ticks. */}
            <div className="relative h-7">
              {MAJOR_HOURS.map((hour) => (
                <span
                  key={hour}
                  className="ic-tabular absolute top-2.5 text-label text-ink-400"
                  style={{
                    left: percent(hour),
                    /* The first and last hang inside the rule rather than
                       straddling it, so neither overflows the plate. */
                    transform:
                      hour === 0
                        ? 'none'
                        : hour === DAY_HOURS
                          ? 'translateX(-100%)'
                          : 'translateX(-50%)',
                  }}
                >
                  {String(hour).padStart(2, '0')}
                </span>
              ))}
            </div>
          </div>

          {/*
            Not a live region. It changes once a minute, and a polite
            announcement every minute for the length of a visit is a page nobody
            can read.
          */}
          <p className="mt-8 max-w-[52ch] text-lede text-ink sm:mt-10">
            {clock ? (
              <>
                It is <span className="ic-tabular">{clock.time}</span> where you are.{' '}
                <span className="text-ink-400">
                  {atDesks ? instrument.atDesks : instrument.awayFromDesks}
                </span>
              </>
            ) : (
              <span className="text-ink-400">{instrument.unknownTime}</span>
            )}
          </p>
        </div>
      </Container>
    </section>
  )
}
