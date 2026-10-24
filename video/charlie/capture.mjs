/**
 * Captures the Studio pages the Charlie film is cut from.
 *
 *   node video/charlie/capture.mjs <studio base url>
 *
 * Run against Studio's demonstration workspace (the default data source): the
 * pages are Studio's own, at twice the pixel density so the film can push in.
 * The demonstration banner and badges are hidden; nothing else is changed.
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

const RFQ_1907 = '/review/0198a700-00bb-7005-9984-00bb00000005'
const SUPPLIERS = '/review/0198a700-00bb-7001-9980-00bb00000001'

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

async function open(route) {
  await page.goto(BASE + route, { waitUntil: 'load', timeout: 90_000 })
  await page.waitForTimeout(6000)
  await tidy()
}

const shot = (name) => page.screenshot({ path: path.join(OUT, `${name}.png`) })

await open('/files/file_rfq1907_cover')
await shot('email')

await open('/files/file_rfq1907_request')
await shot('pdf')

await open(RFQ_1907)
await shot('matrix')
await page.getByText('84 / On li', { exact: false }).first().click()
await page.waitForTimeout(2500)
await shot('finding')

await open(SUPPLIERS)
await shot('suppliers')

await open('/approvals')
await page.getByRole('button', { name: 'Approve exception' }).click()
await page.waitForTimeout(1500)
await shot('approve')
await page.locator('[role="dialog"] textarea').fill('Strategic account. One-off for the Ålesund fit-out.')
await page.waitForTimeout(600)
await shot('approve-typed')

await browser.close()
console.log('captured into', OUT)
