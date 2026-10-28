import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))

// Keep the words, the artwork, and the finished export separately editable.
// The open-licensed Instrument pairing is used here because the site's own
// fonts are not licensed for a new public surface (AGENTS.md, section 7).
const covers = [
  {
    name: '01-the-unattended-hours',
    image: '01-night-office.png',
    title: 'Intelligence for<br>commercial work.',
    detail: 'incillum.com',
    tone: 'night',
  },
  {
    name: '02-from-request-to-decision',
    image: '02-night-desk.png',
    title: 'From request<br>to decision.',
    detail: 'Intelligence for commercial work.',
    tone: 'night',
  },
  {
    name: '03-before-morning',
    image: '03-morning-office.png',
    title: 'A lot can change<br>before morning.',
    detail: 'Intelligence for commercial work.',
    tone: 'day',
  },
  {
    name: '04-stay-with-the-work',
    image: '04-lamplight.png',
    title: 'Stay with<br>the work.',
    detail: 'Intelligence for commercial work.',
    tone: 'night',
  },
]

const css = `
  @font-face {
    font-family: 'Instrument Serif';
    src: url('./fonts/InstrumentSerif-Regular.ttf') format('truetype');
    font-style: normal;
    font-weight: 400;
  }
  @font-face {
    font-family: 'Instrument Sans';
    src: url('./fonts/InstrumentSans-Regular.ttf') format('truetype');
    font-style: normal;
    font-weight: 400;
  }
  * { box-sizing: border-box; }
  html, body { padding: 0; margin: 0; width: 1500px; height: 500px; overflow: hidden; }
  body { color: #fff; font-family: 'Instrument Sans', sans-serif; -webkit-font-smoothing: antialiased; }
  .cover { position: relative; width: 1500px; height: 500px; overflow: hidden; background: #111110; }
  .photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; }
  .day .paper { position: absolute; inset: 0 auto 0 0; width: 885px; background: #fff; }
  .day { color: #111110; }
  .copy { position: absolute; top: 88px; left: 355px; width: 590px; }
  .brand { margin: 0; font: 400 32px/1 'Instrument Serif', Georgia, serif; }
  h1 { margin: 32px 0 0; font: 400 84px/.94 'Instrument Serif', Georgia, serif; letter-spacing: -.016em; }
  .detail { margin: 25px 0 0; font: 400 23px/1.2 'Instrument Sans', sans-serif; letter-spacing: -.01em; }
  .day h1 { font-size: 78px; }
`

for (const cover of covers) {
  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Incillum · ${cover.name}</title><style>${css}</style></head>
<body>
  <main class="cover ${cover.tone}">
    <img class="photo" src="./sources/${cover.image}" alt="">
    ${cover.tone === 'day' ? '<div class="paper" aria-hidden="true"></div>' : ''}
    <div class="copy">
      <p class="brand">Incillum</p>
      <h1>${cover.title}</h1>
      <p class="detail">${cover.detail}</p>
    </div>
  </main>
</body></html>`
  await writeFile(path.join(here, `${cover.name}.html`), html, 'utf8')
}

console.log(`Created ${covers.length} editable cover layouts.`)
