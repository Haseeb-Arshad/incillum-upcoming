import { useEffect, useState } from 'react'

import { Container } from '#/components/primitives.tsx'
import { Reveal } from '#/components/reveal.tsx'
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
 * say *this hour, right now*.
 *
 * ── Which fifteen hours are shaded, and why it is not the nine ─────────────
 *
 * The first version of this plate shaded the working day and captioned itself
 * from the reader's clock — *your team is at their desks* by day, *nobody is at
 * their desks* at night. Read at 03:20 it was devastating. Read at 16:28, which
 * is when most people actually arrive, the one live element on the page opened
 * by telling a controller that everything was covered: the mass was under the
 * hours somebody is in, and the caption confirmed it. The page spent its single
 * moving element arguing against its own thesis for the whole of a business
 * day.
 *
 * So the ink moved. The fifteen uncovered hours are the shaded mass — two
 * bands, because they wrap midnight — and the nine hours of the working day are
 * the gap in the middle. The caption no longer branches on the hour: it states
 * the proportion, which is true at every hour, and then adds the reader's own
 * time as a clause rather than as a verdict. At 03:20 the mark stands inside
 * the shading; at 16:28 it stands in the gap with shading either side of it.
 * Both readings support the same sentence, which is the entire fix.
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
 * hydration. The rule, the shaded bands, the working-day gap, the key, the hour
 * numerals and the whole first sentence of the caption render on the server
 * exactly as they end up. Only the mark, the readout and the caption's closing
 * clause wait for the client, and the first two fade rather than appear.
 *
 * That split is what the inversion bought as well as fixing the argument: the
 * sentence the server can print is now the sentence that carries the meaning,
 * so a reader with no JavaScript gets the plate's whole point rather than a
 * caption waiting to find out what time it is.
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

  /**
   * The fifteen, as two bands: midnight to the start of the day, and the end of
   * the day to midnight. They are what carries the shading — see the header for
   * why it is these hours and not the nine between them.
   */
  const uncovered = [
    { from: 0, to: from },
    { from: to, to: DAY_HOURS },
  ] as const

  return (
    <section aria-label="A working day, drawn to scale" className="pb-20 sm:pb-28">
      <Container>
        {/*
          `Reveal` wraps the plate rather than being the plate. It takes a fixed
          set of props and does not spread the rest, so a `data-inverted` passed
          to it would be silently dropped — TypeScript permits hyphenated
          attributes on a component without checking them, so nothing would have
          complained and the dark scope would simply not have applied.
        */}
        <Reveal>
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
                {/*
                  The fifteen, at true width, in two bands either side of the
                  working day. Shaded rather than outlined: the argument is
                  mass, and two-thirds of the rule carrying ink while the middle
                  stays bare is readable before anybody has read a word of the
                  caption.
                */}
                {uncovered.map((band) => (
                  <div
                    key={band.from}
                    className="absolute inset-y-0 bg-ink/[0.06]"
                    style={{ left: percent(band.from), width: percent(band.to - band.from) }}
                  />
                ))}

                {/*
                  The working day: the gap. Bordered on both edges so the nine
                  hours read as a deliberate opening rather than as the place
                  the shading happens to stop, and labelled because an unlabelled
                  gap in a diagram is a mistake until proven otherwise.
                */}
                <div
                  className="absolute inset-y-0 border-x border-line-strong"
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

              {/*
                The key.

                Two-thirds of the rule is shaded and nothing on the drawing says
                what the shading means, which in a diagram reads as a defect
                until it is named. One swatch and four words, in the same muted
                label style as the hour numerals, so it sits under the plate as
                a key rather than as a second caption.
              */}
              <div className="mt-6 flex items-center gap-2.5">
                <span className="size-2.5 shrink-0 border border-line bg-ink/[0.06]" />
                <span className="text-label uppercase text-ink-400">
                  {instrument.uncoveredLabel}
                </span>
              </div>
            </div>

            {/*
            Not a live region. It changes once a minute, and a polite
            announcement every minute for the length of a visit is a page nobody
            can read.

            The sentence no longer branches on the hour — the header explains at
            length why it used to and why that was the plate's one real fault.
            What is left is a statement about the drawing, true at any hour, and
            the reader's own time appended as a clause. The first sentence is in
            the server's HTML; only the clause waits for a browser.
          */}
            <p className="mt-8 max-w-[52ch] text-lede text-ink sm:mt-10">
              {instrument.caption}{' '}
              {clock ? (
                <span className="text-ink-400">
                  {instrument.captionLocalPrefix}
                  <span className="ic-tabular">{clock.time}</span>
                  {instrument.captionLocalSuffix}
                </span>
              ) : (
                <span className="text-ink-400">{instrument.unknownTime}</span>
              )}
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
