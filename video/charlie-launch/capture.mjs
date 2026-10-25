/**
 * Captures the Studio pages the Meet Charlie film is cut from.
 *
 *   node video/charlie-launch/capture.mjs <studio base url>
 *
 * Run against Studio's demonstration workspace (the default data source): the
 * pages are Studio's own, at twice the pixel density so the film can push in.
 * Only the three pages the Charlie at work film does not show are captured
 * here; the other six stills are that film's (`video/charlie/capture.mjs`),
 * copied, so the two films show the same request on the same pages.
 * The demonstration banner and badges are hidden; nothing else is changed.
 * The rectangles the overlays need are measured here, while the page is
 * there, into captures/rects.json.
 */
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(path.join(here, '../../package.json'))
const { chromium } = require('@playwright/test')

const BASE = process.argv[2] ?? 'http://127.0.0.1:3301'
const OUT = path.join(here, 'captures')
mkdirSync(OUT, { recursive: true })

const QUOTATION = '/artifacts/0198a700-0033-7001-9298-003300000001'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
const rects = {}

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

async function open(route) {
  await page.goto(BASE + route, { waitUntil: 'load', timeout: 90_000 })
  await page.waitForTimeout(6000)
  await tidy()
}

const shot = (name) => page.screenshot({ path: path.join(OUT, `${name}.png`) })

/** The box of the first element with this text, in the still's own pixels. */
async function measure(key, text) {
  const box = await page.getByText(text, { exact: false }).first().boundingBox()
  rects[key] = box && [box.x, box.y, box.width, box.height].map(Math.round)
}

// The line Charlie could not settle, held on a person with its question narrowed.
await open('/needs-you')
await measure('heldQuestion', 'Which mount assembly does Halvorsen mean')
await measure('heldIfNothing', 'Line 04 stays out of the quotation')
await measure('heldCandidates', 'AX-14-M panel mount')
const answer = await page.getByPlaceholder('Tell Incillum what it needs to know').first().boundingBox()
rects.heldAnswer = [answer.x, answer.y, answer.width, answer.height].map(Math.round)
await shot('needs-you')

// What Charlie made: the work products, and the quotation itself.
await open('/artifacts')
await measure('quotationRow', 'Halvorsen quotation')
await measure('quotationSummary', 'Twenty lines · 84 units')
await shot('artifacts')
await open(QUOTATION)
const draft = page.getByText('Current durable draft').first().locator('xpath=../..')
await draft.screenshot({ path: path.join(OUT, 'quotation-draft.png') })

writeFileSync(path.join(OUT, 'rects.json'), JSON.stringify(rects, null, 2) + '\n')
await browser.close()
console.log('captured into', OUT)
