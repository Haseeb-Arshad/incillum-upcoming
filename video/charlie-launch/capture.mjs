/**
 * Captures the Studio page the Meet Charlie film shows that Charlie at work
 * does not: the held question on line 04.
 *
 *   node video/charlie-launch/capture.mjs <studio base url>
 *
 * Run against Studio's demonstration workspace (the default data source): the
 * page is Studio's own, at twice the pixel density so the film can push in.
 * The film's other six stills are Charlie at work's (`video/charlie/capture.mjs`),
 * copied, so the two films show the same request on the same pages. The
 * demonstration banner and badges are hidden; nothing else is changed. Where
 * the film places things on a still is measured in the still's own pixels, in
 * `film.js`.
 */
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(path.join(here, '../../package.json'))
const { chromium } = require('@playwright/test')

const BASE = process.argv[2] ?? 'http://127.0.0.1:3301'
const OUT = path.join(here, 'captures')
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })

async function tidy() {
  await page.evaluate(() => {
    for (const node of document.querySelectorAll('body *')) {
      const own = [...node.childNodes].filter((child) => child.nodeType === 3).map((child) => child.textContent.trim()).join('')
      if (own.startsWith('Synthetic demonstration data')) {
        let bar = node
        while (bar.parentElement && bar.parentElement.getBoundingClientRect().height < 48) bar = bar.parentElement
        bar.style.display = 'none'
      }
      if (own === 'Demonstration') (node.closest('span,div') ?? node).style.display = 'none'
    }
  })
  await page.waitForTimeout(400)
}

// The line Charlie could not settle, held on a person with its question narrowed.
await page.goto(BASE + '/needs-you', { waitUntil: 'load', timeout: 90_000 })
await page.waitForTimeout(6000)
await tidy()
await page.screenshot({ path: path.join(OUT, 'needs-you.png') })
await browser.close()
console.log('captured into', OUT)
