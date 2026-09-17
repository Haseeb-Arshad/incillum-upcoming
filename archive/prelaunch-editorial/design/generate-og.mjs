import { Buffer } from 'node:buffer'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from '@playwright/test'

import { brand, hero } from '../src/content/site.ts'

/**
 * The share card, generated.
 *
 * ```bash
 * pnpm generate-og
 * ```
 *
 * ── Why this script exists ────────────────────────────────────────────────
 *
 * The previous card was made by hand, and it did what hand-made assets do: the
 * page was rewritten around a new headline and a supplied logo, and the card
 * kept showing the old headline and the old mark to everybody who pasted the
 * link. A share card is the one part of a site nobody on the team ever looks
 * at, because it only renders in somebody else's feed — so it has to be
 * derived rather than remembered.
 *
 * Everything below therefore comes from the site itself:
 *
 *   - the wordmark and both headline lines are imported from `content/site.ts`,
 *     so the card cannot say something the page does not,
 *   - the mark is `public/logo.png`, the same file the masthead renders,
 *   - the typefaces are the real `src/fonts/` faces, embedded, so the card is
 *     set in the page's own serif rather than in whatever a rasteriser picks,
 *   - the colours, sizes and the grain are the values from `styles.css`.
 *
 * The token values are duplicated here as literals, and that is the one piece
 * of duplication in the file. A Node script cannot read Tailwind's `@theme`
 * block, and the alternative — booting the app to screenshot a hidden route —
 * makes a share card depend on the dev server, the router and the analytics
 * loader. Each literal below names the token it mirrors, and `styles.css` is
 * the source of truth if they ever disagree.
 *
 * ── What is deliberately not on the card ──────────────────────────────────
 *
 * No signal colour. `--ic-signal` means *something is still lit* and has a
 * four-place licence on the page (AGENTS.md section 4); a share card is not one
 * of the four, and an amber eyebrow here would be how this palette acquires a
 * brand colour by accident. Ink on paper is also what a reader lands on when
 * they click — a dark card into a paper page is a flinch at the door.
 */

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

/** 1.91:1, the ratio every platform crops to. Declared in `lib/seo.ts` too. */
const WIDTH = 1200
const HEIGHT = 630

/**
 * The output name carries a revision, and that is the actual fix.
 *
 * Overwriting `og-image.png` in place changes nothing a reader sees for days:
 * X, LinkedIn, Slack and iMessage cache a card against its URL and re-fetch on
 * their own schedule, so a corrected card at the old address is a corrected
 * card nobody is served. A new path is fetched on the next scrape. When this
 * card is redesigned again, bump the number here and in `lib/seo.ts` — the end-
 * to-end suite fails if the two disagree.
 */
const OUTPUT = resolve(root, 'public/og-image-v2.png')

/** `url(data:…)` for a font or image, so the render needs no network at all. */
async function dataUri(path, mime) {
  const bytes = await readFile(resolve(root, path))
  return `data:${mime};base64,${bytes.toString('base64')}`
}

const [serif, sans, mark] = await Promise.all([
  dataUri('src/fonts/subset_HarveySerif_Regular-s.p.3fyyxyg4mmi3v.woff2', 'font/woff2'),
  dataUri('src/fonts/HarveySansDiatypeVariable-s.p.3gw33igtr422g.woff2', 'font/woff2'),
  dataUri('public/logo.png', 'image/png'),
])

/**
 * The fractal-noise tile from `--ic-grain`, at the light scope's 3.8% alpha.
 *
 * It is worth the bytes. A flat #F7F7F5 rectangle in a feed reads as a screen-
 * shot of a screen; the same tone with a grain in it reads as stock, which is
 * the whole argument this site makes about commercial paper.
 */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.038'/%3E%3C/svg%3E\")"

/** HTML-escapes copy that arrives from the content module. */
function escape(value) {
  return value.replace(
    /[&<>]/g,
    (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character],
  )
}

/**
 * The stage, in the site's own words.
 *
 * Both halves are strings the page already says — `brand.access`, and the state
 * `standing` gives the quotation operator. Neither is a date, which is the rule
 * in AGENTS.md section 5: progress is a present-tense state, because a calendar
 * becomes a lie on a fixed schedule.
 */
const STAGE = `${brand.access} · In build`

const html = `<!doctype html>
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
        --paper: #f7f7f5;
        --ink-900: #111110;
        --ink-600: #45453f;
        --ink-400: #6e6e66;
        --line: rgba(17, 17, 16, 0.11);
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        width: ${WIDTH}px;
        height: ${HEIGHT}px;
        background-color: var(--paper);
        background-image: ${GRAIN};
        background-repeat: repeat;
        color: var(--ink-900);
        font-family: 'Incillum Sans', sans-serif;
        /* Diatype's default figures are proportional; 23:47 needs columns. */
        font-feature-settings: 'ss01';
        -webkit-font-smoothing: antialiased;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        /*
          The card is read at about a third of this size in a feed, so the
          margins are the page's rather than a poster's: generous enough that
          the type is never against an edge, tight enough that the headline
          still fills the frame at 400px wide.
        */
        padding: 68px 80px 60px;
      }

      /* ── The identity ─────────────────────────────────────────────────── */

      .masthead {
        display: flex;
        align-items: center;
        gap: 11px;
      }

      .masthead img {
        width: 40px;
        height: 40px;
      }

      /* Mirrors the masthead's wordmark, one step up for a 1200px frame. */
      .masthead span {
        font-family: 'Incillum Serif', serif;
        font-size: 36px;
        line-height: 1;
        letter-spacing: -0.02em;
      }

      /* ── The argument ─────────────────────────────────────────────────── */

      /*
        A step above --text-display's 5.75rem ceiling, with the token's own
        line height and tracking untouched. The page's ceiling is set for a
        reader at arm's length; this is read at a third of its size in a feed,
        where the headline has to survive being 400px wide. The two lines are
        the two the hero sets, from the same two fields, so the card breaks
        where the page breaks.
      */
      h1 {
        font-family: 'Incillum Serif', serif;
        font-weight: 400;
        font-size: 106px;
        line-height: 0.98;
        letter-spacing: -0.021em;
        /* Optical: the serif's left sidebearing sets the H further in than the
           mark above it. Pulling it back lines the two up on the same edge. */
        margin-left: -0.045em;
      }

      /* ── The hook ─────────────────────────────────────────────────────── */

      .close {
        border-top: 1px solid var(--line);
        padding-top: 26px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 48px;
      }

      /*
        The proof beat, split exactly as the hero splits it: the hour at full
        ink, the clause around it muted. It is the quietest line on the card and
        the one doing the most work — it turns a thesis into a Tuesday.
      */
      .proof {
        /* Wide enough to hold the whole beat on one line — a two-line version
           orphans the last two words under a headline that has none. */
        max-width: 700px;
        font-size: 19px;
        line-height: 1.5;
        letter-spacing: -0.006em;
        color: var(--ink-600);
      }

      .proof b {
        font-weight: inherit;
        color: var(--ink-900);
      }

      /* --text-label: the only tracked-out style the site has. */
      .stage {
        flex-shrink: 0;
        /* Optically centres the 16px label on the 28.5px first proof line. */
        padding-top: 6px;
        font-size: 13px;
        line-height: 16px;
        font-weight: 500;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--ink-400);
      }
    </style>
  </head>
  <body>
    <div class="masthead">
      <img src="${mark}" alt="" />
      <span>${escape(brand.name)}</span>
    </div>

    <h1>${escape(hero.headlineStart)}<br />${escape(hero.headlineEnd)}</h1>

    <div class="close">
      <p class="proof"><b>${escape(hero.proof)}</b> ${escape(hero.proofTail)}</p>
      <p class="stage">${escape(STAGE)}</p>
    </div>
  </body>
</html>`

const browser = await chromium.launch()

try {
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  })

  await page.setContent(html, { waitUntil: 'load' })
  /*
    `load` fires when the data URIs have been parsed, not when the faces have
    been applied. Screenshotting before this resolves catches the fallback
    serif, which is the failure that is hardest to notice: the card still looks
    deliberate, it is just set in Georgia.
  */
  await page.evaluate(() => document.fonts.ready)

  await mkdir(dirname(OUTPUT), { recursive: true })
  await writeFile(OUTPUT, await page.screenshot({ type: 'png' }))
} finally {
  await browser.close()
}

const { size } = await readFile(OUTPUT).then((bytes) => ({ size: bytes.byteLength }))
console.log(
  `${OUTPUT.slice(root.length + 1)} — ${WIDTH}x${HEIGHT}, ${Math.round(size / 1024)} kB`,
)
