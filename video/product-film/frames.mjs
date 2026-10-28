/**
 * Stills of the composition at given seconds, without a render:
 *
 *   node frames.mjs <composition dir> 6.5 12 20.9 ...
 *
 * Opens index.html straight from disk, seeks the timeline and writes
 * <dir>/frames/<second>.png. Check every moment, and the moment just before
 * and after each cut, before rendering anything.
 */
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const dir = path.resolve(process.argv[2] ?? '.')
const seconds = process.argv.slice(3)

// Playwright from the project the film lives in (walking up from it), or from where this runs.
function playwright() {
  for (const base of [path.join(dir, 'package.json'), path.join(process.cwd(), 'package.json')]) {
    for (const name of ['@playwright/test', 'playwright']) {
      try {
        return createRequire(base)(name)
      } catch {}
    }
  }
  throw new Error('Playwright not found: run inside a project that has @playwright/test, or npm i -D playwright')
}

const { chromium } = playwright()
const out = path.join(dir, 'frames')
mkdirSync(out, { recursive: true })
// Chrome rather than Playwright's Chromium: the plates are H.264, which Chromium builds may not decode.
const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch())
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
page.on('pageerror', (error) => console.log('pageerror', String(error)))
page.setDefaultTimeout(20_000)
await page.goto(pathToFileURL(path.join(dir, 'index.html')).href, { waitUntil: 'load' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(800)
for (const second of seconds) {
  // Braces: returning the timeline from evaluate makes Playwright try to serialise it, and it hangs.
  await page.evaluate((t) => { window.__timelines.main.seek(Number(t), false) }, second)
  // The plates are <video> clips that HyperFrames seeks during a render; here they are seeked by hand.
  await page.evaluate(async (t) => {
    const waits = []
    for (const video of document.querySelectorAll('video[data-start]')) {
      const local = Number(t) - Number(video.dataset.start)
      if (local < 0 || local > Number(video.dataset.duration)) continue
      video.currentTime = Math.min(local, video.duration - 0.05)
      waits.push(new Promise((resolve) => video.addEventListener('seeked', resolve, { once: true })))
    }
    await Promise.all(waits)
  }, second)
  await page.waitForTimeout(80)
  await page.screenshot({ path: path.join(out, `${second}.png`) })
}
await browser.close()
console.log('wrote', seconds.length, 'frames to', out)
