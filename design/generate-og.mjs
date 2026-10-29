import { Buffer } from 'node:buffer'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from '@playwright/test'

import { brand, charlie, hero } from '../src/content/site.ts'

/**
 * The share cards, generated.
 *
 * ```bash
 * pnpm generate-og
 * ```
 *
 * ── Why this script exists ────────────────────────────────────────────────
 *
 * A share card is the one part of a site nobody on the team ever looks at,
 * because it only renders in somebody else's feed, so it has to be derived
 * rather than remembered. The first card was made by hand and went on showing
 * the old headline after the page had moved on; the second was generated, but
 * from the retired launch page's copy ("A different kind of intelligence.",
 * "In build", tracked capitals on warm paper) and so said something the site
 * no longer says. Everything below now comes from the site itself:
 *
 *   - the wordmark, the headline and the sentence under it are imported from
 *     `content/site.ts`, so a card cannot say what the page does not,
 *   - the mark is `public/logo.png`, the same file the masthead draws,
 *   - the typefaces are the real `src/fonts/` faces, embedded,
 *   - the ground is the page's white paper, and the ink its ink (the literals
 *     below mirror `:root` in `styles.css`, which is the source of truth).
 *
 * ── Two cards ─────────────────────────────────────────────────────────────
 *
 * The company's, for the front page and everything without a card of its own;
 * and Charlie's, for `/charlie`, so a link to the agent says what the agent is.
 *
 * ── What is deliberately not on a card ────────────────────────────────────
 *
 * No signal colour (it has a four-place licence, AGENTS.md section 4), no
 * tracked capitals (nowhere on the site), no stage label ("in build" is kept off
 * every page), no dash, and no claim about Incillum's results.
 *
 * ── Names carry a revision ────────────────────────────────────────────────
 *
 * Platforms cache a card against its URL, so a redesign is a rename, not an
 * overwrite: bump the number here and in `lib/seo.ts` (`shareCards`) and delete
 * the old file. `lib/seo.test.ts` and `e2e/seo.spec.ts` fail if they disagree.
 */

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

/** 1.91:1, the ratio every platform crops to. Declared in `lib/seo.ts` too. */
const WIDTH = 1200
const HEIGHT = 630

const cards = [
  {
    file: 'public/og-image-v4.png',
    lines: [hero.headlineStart, hero.headlineEnd],
    lead: null,
    foot: hero.lede,
  },
  {
    file: 'public/og-charlie-v1.png',
    lines: charlie.hero.headline.split(/(?<=\.)\s+/),
    lead: charlie.hero.eyebrow,
    foot: charlie.hero.lede.split('. ').slice(0, 1).join('') + '.',
  },
]

/** `data:` URL for a font or image, so the render needs no network at all. */
async function dataUri(path, mime) {
  const bytes = await readFile(resolve(root, path))
  return `data:${mime};base64,${bytes.toString('base64')}`
}

const [serif, sans, mark] = await Promise.all([
  dataUri('src/fonts/subset_HarveySerif_Regular-s.p.3fyyxyg4mmi3v.woff2', 'font/woff2'),
  dataUri('src/fonts/HarveySansDiatypeVariable-s.p.3gw33igtr422g.woff2', 'font/woff2'),
  dataUri('public/logo.png', 'image/png'),
])

/** HTML-escapes copy that arrives from the content module. */
function escape(value) {
  return value.replace(
    /[&<>]/g,
    (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character],
  )
}

function page(card) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <style>
      @font-face {
        font-family: 'Incillum Serif';
        src: url('${serif}') format('woff2');
        font-weight: 400;
        font-style: normal;
      }
      @font-face {
        font-family: 'Incillum Sans';
        src: url('${sans}') format('woff2');
        font-weight: 200 1000;
        font-style: normal;
      }
      :root {
        /* Mirrors :root in styles.css. */
        --paper: #ffffff;
        --sunken: #f2f2f0;
        --ink-900: #111110;
        --ink-600: #45453f;
        --line: rgba(17, 17, 16, 0.22);
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: ${WIDTH}px;
        height: ${HEIGHT}px;
        background-color: var(--paper);
        color: var(--ink-900);
        font-family: 'Incillum Sans', sans-serif;
        -webkit-font-smoothing: antialiased;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        /* Read at about a third of this size in a feed: margins are the page's, not a poster's. */
        padding: 68px 80px 64px;
      }
      .masthead { display: flex; align-items: center; gap: 12px; }
      .masthead img { width: 44px; height: 44px; }
      .masthead span { font-family: 'Incillum Serif', serif; font-size: 38px; line-height: 1; letter-spacing: -0.02em; }
      .masthead .lead { margin-left: 18px; padding-left: 18px; border-left: 1px solid var(--line); font-family: 'Incillum Sans', sans-serif; font-size: 24px; letter-spacing: -0.006em; color: var(--ink-600); }
      h1 {
        font-family: 'Incillum Serif', serif;
        font-weight: 400;
        font-size: 108px;
        line-height: 0.98;
        letter-spacing: -0.021em;
        /* Optical: the serif's left sidebearing sets the first letter in from the mark above it. */
        margin-left: -0.045em;
      }
      .foot { border-top: 1px solid var(--line); padding-top: 26px; }
      .foot p { max-width: 1040px; font-size: 25px; line-height: 1.45; letter-spacing: -0.008em; color: var(--ink-600); }
    </style>
  </head>
  <body>
    <div class="masthead">
      <img src="${mark}" alt="" />
      <span>${escape(brand.name)}</span>
      ${card.lead ? `<span class="lead">${escape(card.lead)}</span>` : ''}
    </div>
    <h1>${card.lines.map(escape).join('<br />')}</h1>
    <div class="foot"><p>${escape(card.foot)}</p></div>
  </body>
</html>`
}

const browser = await chromium.launch()

try {
  const tab = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  })

  for (const card of cards) {
    await tab.setContent(page(card), { waitUntil: 'load' })
    /*
      `load` fires when the data URIs have been parsed, not when the faces have
      been applied. Screenshotting before this resolves catches the fallback
      serif, which looks deliberate and is set in Georgia.
    */
    await tab.evaluate(() => document.fonts.ready)
    const output = resolve(root, card.file)
    await mkdir(dirname(output), { recursive: true })
    const bytes = await tab.screenshot({ type: 'png' })
    await writeFile(output, bytes)
    console.log(`${card.file}: ${WIDTH}x${HEIGHT}, ${Math.round(Buffer.byteLength(bytes) / 1024)} kB`)
  }
  /*
    The icons a phone and a search result draw: the mark on white, with room
    round it. A touch icon is never transparent (iOS fills it black), and Google
    asks for a multiple of 48 pixels.
  */
  for (const [file, size] of [
    ['public/apple-touch-icon.png', 180],
    ['public/icon-48.png', 48],
  ]) {
    const icon = await browser.newPage({ viewport: { width: size, height: size } })
    await icon.setContent(
      `<body style="margin:0;background:#fff;display:grid;place-items:center;width:${size}px;height:${size}px"><img src="${mark}" style="width:${Math.round(size * 0.74)}px;height:${Math.round(size * 0.74)}px"></body>`,
      { waitUntil: 'load' },
    )
    await writeFile(resolve(root, file), await icon.screenshot({ type: 'png' }))
    console.log(`${file}: ${size}x${size}`)
    await icon.close()
  }
} finally {
  await browser.close()
}
