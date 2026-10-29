import { readFileSync } from 'node:fs'
import { Script } from 'node:vm'

import { describe, expect, it } from 'vitest'

import {
  dayAttribute,
  liveAttribute,
  mastheadHeadScript,
  paneAttribute,
} from '#/lib/masthead.ts'

const source = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

describe('the masthead head script', () => {
  it('is a script a browser can run: it parses', () => {
    // A syntax error here would silently cost every visitor the pre-hydration state.
    expect(() => new Script(mastheadHeadScript)).not.toThrow()
  })

  it('asks the page the same two questions its own observers ask, of the same two markers', () => {
    const page = source('components/glass-page.tsx')
    for (const marker of ['glass-sentinel', 'glass-dusk']) {
      expect(mastheadHeadScript).toContain(`.${marker}`)
      expect(page).toContain(`className="${marker}"`)
    }
    // The attributes it sets are the ones the stylesheet reads, and the page ends its say with its own.
    const styles = source('styles.css')
    for (const attribute of [paneAttribute, dayAttribute, liveAttribute]) {
      expect(mastheadHeadScript).toContain(attribute)
      expect(styles).toContain(attribute)
    }
    expect(page).toContain('liveAttribute')
  })

  it('sets its attributes from the markers’ geometry and stops when the page says so', () => {
    expect(mastheadHeadScript).toContain('getBoundingClientRect().bottom<0')
    expect(mastheadHeadScript).toContain('getBoundingClientRect().top<0')
    expect(mastheadHeadScript).toContain(`hasAttribute('${liveAttribute}')`)
    expect(mastheadHeadScript).toContain("removeEventListener('scroll'")
    // On a page without the markers it takes its listeners off once the document has loaded.
    expect(mastheadHeadScript).toContain("document.readyState==='complete'")
  })

  it('is wired into the document head, after the opening’s', () => {
    const root = source('routes/__root.tsx')
    expect(root).toContain('{ children: mastheadHeadScript }')
    expect(root.indexOf('{ children: openingHeadScript }')).toBeLessThan(
      root.indexOf('{ children: mastheadHeadScript }'),
    )
  })
})

describe('the masthead goes out of the way going down', () => {
  it('hides on a scroll down, returns on a scroll up, and has no progress line', () => {
    const bar = source('components/masthead-bar.tsx')
    expect(bar).toContain('data-tucked')
    expect(bar).not.toContain('glass-progress')
    const styles = source('styles.css')
    expect(styles).toContain("[data-tucked='true']")
    expect(styles).not.toMatch(/\.glass-bar::after/)
    expect(styles).not.toContain('--glass-progress')
  })
})
