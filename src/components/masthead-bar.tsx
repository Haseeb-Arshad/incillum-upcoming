import { useEffect, useId, useRef, useState } from 'react'

import { ButtonLink, Container } from '#/components/primitives.tsx'
import { SiteBrand } from '#/components/site-brand.tsx'
import { menu } from '#/content/site.ts'
import { cn } from '#/lib/cn.ts'

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
 * It is fixed to the top of the page and above everything on it. On the front
 * page it is clear over the first screen and turns to a pane of glass once that
 * has gone (`scrolled`); on the other pages it is a pane from the start. Its
 * tokens are those of whatever it is over (`tone`): the night's while the
 * night is under it, the paper's after — so it is never a dark bar over white.
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
  const barRef = useRef<HTMLElement>(null)

  // A click anywhere outside the masthead closes an open menu.
  useEffect(() => {
    if (!open) return
    function onPointer(event: PointerEvent) {
      if (!barRef.current?.contains(event.target as Node)) setOpen(null)
    }
    window.addEventListener('pointerdown', onPointer)
    return () => window.removeEventListener('pointerdown', onPointer)
  }, [open])

  return (
    <header
      ref={barRef}
      className={cn('glass-bar', className)}
      role="banner"
      data-scrolled={scrolled ? 'true' : 'false'}
      data-tone={tone}
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
            href={onFront ? '#early-access' : '/#early-access'}
            arrow
            className="desk-cta"
            onClick={onFront ? focusEmail : undefined}
          >
            {menu.cta}
          </ButtonLink>
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
