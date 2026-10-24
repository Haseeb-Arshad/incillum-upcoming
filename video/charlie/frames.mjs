/**
 * Stills of the film at given seconds, for checking a cut without a render:
 *
 *   node video/charlie/frames.mjs 6.5 12 20.9 ...
 *
 * Opens index.html straight from disk, seeks the timeline, and writes
 * frames/<second>.png.
 */
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(path.join(here, '../../package.json'))
const { chromium } = require('@playwright/test')
const out = path.join(here, 'frames')
mkdirSync(out, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
page.on('pageerror', (error) => console.log('pageerror', String(error)))
page.setDefaultTimeout(20_000)
await page.goto(pathToFileURL(path.join(here, 'index.html')).href, { waitUntil: 'load' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(800)
for (const second of process.argv.slice(2)) {
  await page.evaluate((t) => { window.__timelines.main.seek(Number(t), false) }, second)
  await page.waitForTimeout(60)
  await page.screenshot({ path: path.join(out, `${second}.png`) })
}
await browser.close()
console.log('wrote', process.argv.length - 2, 'frames')
