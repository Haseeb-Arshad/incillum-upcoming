import { useEffect, useRef } from 'react'

import { chromeIcons, Icon } from '#/components/icons.tsx'
import { brand, glass } from '#/content/site.ts'

/**
 * The page's last word, set very large and left half in the light.
 *
 * The name, in the serif, across the whole width of the page and cut off by the
 * bottom of it: the upper two thirds of the letters, in a soft neutral that
 * goes from a pale ink at the top to the colour of the page at the bottom, so
 * it reads as a mark on the paper and not as a headline. It is the one gradient
 * the site has besides the hero's scrim, by the owner's call of 29 October 2026
 * ("only if you feel a gradient will look good at the bottom"), and it is only
 * ink and paper: it never gains a hue.
 *
 * It rises into place as the reader reaches the end: one custom property,
 * `--glass-end`, from 0 to 1, written on an animation frame from where the word
 * is on the screen (nothing re-renders). It has its resting value in the
 * stylesheet, which is where it ends up, so the server, a page with no script
 * and reduced motion all get it in place.
 *
 * It repeats the name, which the footer already carries as a link, so it is
 * hidden from assistive technology: it is a drawing of the word, not a second
 * mention of it.
 */
/**
 * The way back up, at the end of the footer's links. A plain `#` link, so it
 * works with no script; with one it scrolls to the top and leaves the address
 * as it was. The page's own `scroll-behavior` makes it smooth, and instant
 * under reduced motion.
 */
export function BackToTop() {
  return (
    <a
      href="#"
      className="glass-top"
      onClick={(event) => {
        event.preventDefault()
        window.scrollTo({ top: 0 })
      }}
    >
      {glass.top}
      <Icon icon={chromeIcons.top} />
    </a>
  )
}

export function FooterWordmark() {
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    let request = 0

    function place() {
      request = 0
      if (!element) return
      if (motion.matches) {
        element.style.removeProperty('--glass-end')
        return
      }
      const box = element.getBoundingClientRect()
      const progress = (window.innerHeight - box.top) / (box.height * 0.9)
      element.style.setProperty(
        '--glass-end',
        Math.min(1, Math.max(0, progress)).toFixed(3),
      )
    }
    function onScroll() {
      if (!request) request = requestAnimationFrame(place)
    }

    place()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    motion.addEventListener('change', onScroll)
    return () => {
      cancelAnimationFrame(request)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      motion.removeEventListener('change', onScroll)
    }
  }, [])

  return (
    <p ref={ref} className="glass-wordmark" aria-hidden="true">
      <span>{brand.name}</span>
    </p>
  )
}
