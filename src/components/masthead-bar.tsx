import { useEffect, useId, useRef, useState } from 'react'

import { ButtonLink, Container } from '#/components/primitives.tsx'
import { SiteBrand } from '#/components/site-brand.tsx'
import { menu } from '#/content/site.ts'
import { cn } from '#/lib/cn.ts'
import { useReducedMotion } from '#/lib/motion.ts'

import type { KeyboardEvent, MouseEvent } from 'react'

/**
 * The masthead: the brand, the Product menu, the contact link, and the one button.
 *
 * ── The shape it borrows ───────────────────────────────────────────────────
 *
 * The reference pages open a small box under a menu's name when it is hovered
 * or chosen: a handful of places to go, each with one line. These do the same.
 * The box is the night's raised panel on a hairline, with a 12px radius and no
 * shadow; it settles 4px into place over 160ms and goes at once.
 *
 * ── Without a pointer, and without a script ────────────────────────────────
 *
 * A menu is a real button with `aria-expanded`. Enter, Space or a click opens
 * it; the arrow keys move through its items; Escape closes it and returns to
 * the button; focus leaving the menu closes it. Hover opens it only where
 * there is a pointer that hovers. Without a script, focus inside a menu still
 * shows its box (`:focus-within`), so every item stays reachable by keyboard.
 *
 * ── On a phone ─────────────────────────────────────────────────────────────
 *
 * Below a laptop's width there is no room for the menus along the bar, and the
 * Product menu used to vanish with them: a visitor on a phone could not tell
 * there was a product page at all. So the bar ends in a button that says
 * *Menu*, which opens one sheet under it with every place the desktop menus
 * reach, written out with its line, and the button again. It is a native
 * `<details>`, so it opens with no script and before the page has hydrated;
 * the script only adds what a disclosure does not do by itself: it closes on
 * Escape, on a tap outside and on choosing a place.
 *
 * ── Out of the way going down, back the moment the reader turns ────────────
 *
 * It is fixed to the top of the page and above everything on it. Scrolling
 * down it slides up out of sight, and the first scroll back up brings it
 * back, as bars do in the applications people use: it never covers what is
 * being read, and it is one flick away. (It was kept in place for a day, and
 * the owner asked for this on 30 October 2026.) It is always there at the top
 * of the page, while a menu is open and while focus is inside it, so no link
 * is ever out of a keyboard's reach; under reduced motion it never moves.
 * On the front page it is clear over the first screen and turns to a pane of
 * glass once that has gone (`scrolled`); on the other pages it is a pane from
 * the start. Its tokens are those of whatever it is over (`tone`): the
 * night's while the night is under it, the paper's after, so it is never a
 * pale bar over white. There is no progress line along it.
 */
export function MastheadBar({
  scrolled,
  onFront,
  tone = 'day',
  className,
}: {
  scrolled: boolean
  /** On the front page the button puts the cursor in the hero's field; elsewhere it goes there. */
  onFront: boolean
  /** What is under it: the night, or the paper. */
  tone?: 'night' | 'day'
  className?: string
}) {
  const [open, setOpen] = useState<string | null>(null)
  const [tucked, setTucked] = useState(false)
  const reduced = useReducedMotion()
  const barRef = useRef<HTMLElement>(null)
  const openRef = useRef<string | null>(null)
  useEffect(() => {
    openRef.current = open
  }, [open])

  // Direction, from one scroll listener on an animation frame: down hides it, up brings it back.
  useEffect(() => {
    if (reduced) return
    let last = window.scrollY
    let frame = 0
    function read() {
      frame = 0
      const y = window.scrollY
      const delta = y - last
      if (y <= 80) {
        last = y
        setTucked(false)
        return
      }
      if (Math.abs(delta) < 6) return
      last = y
      // A menu that is open keeps it where it is.
      const held =
        openRef.current !== null || barRef.current?.querySelector('details[open]') !== null
      setTucked(delta > 0 && !held)
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(read)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [reduced])

  // A click anywhere outside the masthead closes an open menu.
  useEffect(() => {
    if (!open) return
    function onPointer(event: PointerEvent) {
      if (!barRef.current?.contains(event.target as Node)) setOpen(null)
    }
    window.addEventListener('pointerdown', onPointer)
    return () => window.removeEventListener('pointerdown', onPointer)
  }, [open])

  const cta = onFront ? '#early-access' : '/#early-access'
  return (
    <header
      ref={barRef}
      className={cn('glass-bar', className)}
      role="banner"
      data-scrolled={scrolled ? 'true' : 'false'}
      data-tucked={tucked && !reduced ? 'true' : 'false'}
      data-tone={tone}
      onFocus={() => setTucked(false)}
    >
      <Container className="glass-bar-inner">
        <SiteBrand />
        <nav className="desk-nav site-menus" aria-label={menu.label}>
          {menu.groups.map((group) => (
            <Menu
              key={group.key}
              group={group}
              open={open === group.key}
              onOpen={() => setOpen(group.key)}
              onClose={() =>
                setOpen((current) => (current === group.key ? null : current))
              }
            />
          ))}
          {menu.links.map((link) => (
            <a key={link.href} href={link.href} className="site-menu-link">
              {link.title}
            </a>
          ))}
          <ButtonLink
            href={cta}
            arrow
            className="desk-cta"
            aria-label={menu.cta}
            onClick={onFront ? focusEmail : undefined}
          >
            <span className="desk-cta-long">{menu.cta}</span>
            <span className="desk-cta-short">{menu.ctaShort}</span>
          </ButtonLink>
          <PhoneMenu cta={cta} onFront={onFront} />
        </nav>
      </Container>
    </header>
  )
}

type Group = (typeof menu.groups)[number]

function Menu({
  group,
  open,
  onOpen,
  onClose,
}: {
  group: Group
  open: boolean
  onOpen: () => void
  onClose: () => void
}) {
  const id = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const leave = useRef<number>(0)

  function items() {
    return [...(panelRef.current?.querySelectorAll<HTMLAnchorElement>('a') ?? [])]
  }

  function onButtonKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      onOpen()
      requestAnimationFrame(() => items()[0]?.focus())
    }
  }

  function onPanelKey(event: KeyboardEvent<HTMLDivElement>) {
    const links = items()
    const index = links.indexOf(document.activeElement as HTMLAnchorElement)
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      buttonRef.current?.focus()
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      links[(index + 1) % links.length]?.focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      links[(index - 1 + links.length) % links.length]?.focus()
    }
  }

  return (
    <div
      className="site-menu"
      data-open={open ? 'true' : 'false'}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'mouse') return
        window.clearTimeout(leave.current)
        onOpen()
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'mouse') return
        leave.current = window.setTimeout(onClose, 120)
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onClose()
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className="site-menu-button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => (open ? onClose() : onOpen())}
        onKeyDown={onButtonKey}
      >
        {group.label}
        <svg
          viewBox="0 0 12 12"
          aria-hidden="true"
          focusable="false"
          className="site-menu-chevron"
        >
          <path
            d="M3 4.75l3 3 3-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div ref={panelRef} id={id} className="site-menu-panel" onKeyDown={onPanelKey}>
        <ul>
          {group.items.map((item) => (
            <li key={item.href}>
              <a href={item.href} className="site-menu-item" onClick={onClose}>
                <span className="site-menu-title">{item.title}</span>
                <span className="site-menu-line">{item.line}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/**
 * The phone's menu: the same places as the bar's menus, in one sheet.
 *
 * A `<details>` rather than a button and a state: the disclosure works before
 * the page has hydrated and with no script, and the browser keeps its
 * expanded state for assistive technology. The sheet is the header's own
 * width, anchored to the bar rather than to the button (nothing between them
 * is positioned).
 */
function PhoneMenu({ cta, onFront }: { cta: string; onFront: boolean }) {
  const ref = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    function close() {
      if (ref.current) ref.current.open = false
    }
    function onPointer(event: PointerEvent) {
      if (ref.current?.open && !ref.current.contains(event.target as Node)) close()
    }
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key !== 'Escape' || !ref.current?.open) return
      close()
      ref.current.querySelector('summary')?.focus()
    }
    window.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  function close() {
    if (ref.current) ref.current.open = false
  }

  return (
    <details ref={ref} className="phone-menu">
      <summary className="phone-menu-button">
        <span>{menu.phone}</span>
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          focusable="false"
          className="phone-menu-icon"
        >
          <rect x="3" y="5.75" width="14" height="1.5" rx="0.75" />
          <rect x="3" y="12.75" width="14" height="1.5" rx="0.75" />
        </svg>
      </summary>
      <div className="phone-menu-sheet">
        {menu.groups.map((group) => (
          <section key={group.key} className="phone-menu-group" aria-label={group.label}>
            <p className="phone-menu-heading">{group.label}</p>
            <ul>
              {group.items.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="phone-menu-item" onClick={close}>
                    <span className="phone-menu-title">{item.title}</span>
                    <span className="phone-menu-line">{item.line}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <ul className="phone-menu-links">
          {menu.links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="phone-menu-item" onClick={close}>
                <span className="phone-menu-title">{link.title}</span>
              </a>
            </li>
          ))}
        </ul>
        <ButtonLink
          href={cta}
          arrow
          className="desk-cta phone-menu-cta"
          onClick={(event) => {
            close()
            if (onFront) focusEmail(event)
          }}
        >
          {menu.cta}
        </ButtonLink>
      </div>
    </details>
  )
}

/**
 * The button lands on the field rather than near it: on a wide screen the form
 * is already in view, and a plain jump would do nothing visible. Without a
 * script the anchor still jumps.
 */
function focusEmail(event: MouseEvent<HTMLAnchorElement>) {
  const field = document.querySelector<HTMLInputElement>(
    '#early-access input[type="email"]',
  )
  if (!field) return
  event.preventDefault()
  field.focus()
}
