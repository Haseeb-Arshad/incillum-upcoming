/**
 * Whether this visit has already seen the front page's opening.
 *
 * The opening plays once a visit: the first time the front page is opened in a
 * tab, and again on a reload — never on a return from another page of the site,
 * where it would only be in the way. The flag lives in `sessionStorage`, which
 * belongs to the tab and goes with it.
 *
 * A return has to be known before the first paint, or the dark would flash up
 * and vanish on hydration. So a small script in the head reads the flag and the
 * navigation's type and marks the document (`data-opened`), and the stylesheet
 * draws the page already assembled under that mark. Without a script the mark is
 * never set, and the opening plays, as it always has.
 *
 * Under reduced motion the opening never plays, so it is never recorded as seen.
 */

const key = 'incillum:opening'
const attribute = 'data-opened'

/** The head script: marks the document when this is a return, not a first visit or a reload. */
export const openingHeadScript = `try{var n=performance.getEntriesByType('navigation')[0];if((!n||n.type!=='reload')&&sessionStorage.getItem('${key}'))document.documentElement.setAttribute('${attribute}','')}catch(e){}`

/** Seen during this page's life, for a return by client-side navigation, which runs no head script. */
let seen = false

export function openingSeen(): boolean {
  return seen || document.documentElement.hasAttribute(attribute)
}

export function markOpeningSeen() {
  seen = true
  try {
    sessionStorage.setItem(key, '1')
  } catch {
    // Storage refused: the opening plays on the next return too, which is only the old behaviour.
  }
}
