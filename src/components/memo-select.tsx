import { useEffect, useId, useRef, useState } from 'react'

import type { KeyboardEvent } from 'react'

/**
 * The memo's select.
 *
 * A native `<select>` cannot be dressed to match a sheet of paper — its popup
 * is drawn by the operating system — so this is the ARIA "select-only combobox"
 * pattern: a button that owns a listbox, focus staying on the button while
 * `aria-activedescendant` walks the options. Arrow keys, Home and End move,
 * Enter and Space choose, Escape closes without choosing, and typing a letter
 * jumps to the next option that begins with it.
 *
 * There is no hidden native control alongside it. The value lives in
 * react-hook-form and the trigger carries the accessible name, so a second
 * control standing in for the first would only be something for a screen reader
 * to step over.
 *
 * The first option is always "skip", because every question on this page but
 * the address is optional and a select with no way back to empty would make an
 * accidental choice permanent.
 */
export function MemoSelect({
  id,
  label,
  options,
  skip,
  value,
  onChange,
  onBlur,
  invalid,
  describedBy,
}: {
  id: string
  label: string
  options: ReadonlyArray<string>
  /** The text of the option that clears the answer. */
  skip: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  invalid?: boolean
  describedBy?: string
}) {
  const reactId = useId()
  const listId = `${reactId}-list`
  const labelId = `${reactId}-label`
  const optionId = (index: number) => `${reactId}-option-${index}`

  const rows = ['', ...options]
  const selected = Math.max(0, rows.indexOf(value))

  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(selected)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  function openList() {
    setActive(selected)
    setOpen(true)
  }

  function choose(index: number) {
    onChange(rows[index] ?? '')
    setOpen(false)
    trigger.current?.focus()
  }

  /** A pointer press anywhere outside closes the list, and counts as leaving. */
  useEffect(() => {
    if (!open) return
    function away(event: PointerEvent) {
      if (root.current?.contains(event.target as Node)) return
      setOpen(false)
      onBlur?.()
    }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open, onBlur])

  /** Keep the highlighted option in view as the arrow keys walk a long list. */
  useEffect(() => {
    if (!open) return
    document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' })
    // `optionId` is a pure function of `reactId`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, active])

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const last = rows.length - 1

    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault()
        openList()
      }
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActive((index) => Math.min(index + 1, last))
        break
      case 'ArrowUp':
        event.preventDefault()
        setActive((index) => Math.max(index - 1, 0))
        break
      case 'Home':
        event.preventDefault()
        setActive(0)
        break
      case 'End':
        event.preventDefault()
        setActive(last)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        choose(active)
        break
      case 'Escape':
        event.preventDefault()
        setOpen(false)
        break
      case 'Tab':
        setOpen(false)
        break
      default: {
        if (event.key.length !== 1 || event.metaKey || event.ctrlKey || event.altKey) break
        const letter = event.key.toLowerCase()
        const from = [...rows.keys()].filter((index) => index > active)
        const all = [...from, ...rows.keys()]
        const next = all.find((index) => index > 0 && rows[index]!.toLowerCase().startsWith(letter))
        if (next !== undefined) setActive(next)
      }
    }
  }

  return (
    <div
      ref={root}
      className="floating-field"
      data-filled={value !== '' || undefined}
      data-open={open || undefined}
    >
      <label id={labelId} htmlFor={id} className="floating-label memo-worn">
        {label}
      </label>

      <button
        ref={trigger}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? optionId(active) : undefined}
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className="input-field select-trigger"
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        onBlur={() => {
          if (!open) onBlur?.()
        }}
      >
        <span className="select-value">{value}</span>
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="select-chevron">
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <ul id={listId} role="listbox" aria-labelledby={labelId} className="select-popup">
          {rows.map((row, index) => (
            <li
              key={row || 'skip'}
              id={optionId(index)}
              role="option"
              aria-selected={index === selected}
              data-active={index === active || undefined}
              data-skip={index === 0 || undefined}
              className="select-option"
              // `mousedown` would steal focus from the trigger; the click is enough.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
              onMouseMove={() => setActive(index)}
            >
              {index === 0 ? skip : row}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
