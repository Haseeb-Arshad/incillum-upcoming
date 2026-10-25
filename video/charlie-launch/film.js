// The film's timeline. Read by index.html; every time in it is a moment of cues.js.
//
// Three cameras: the room's (a scale about the paper on the desk), the portal (the
// desk mapped into that paper by a homography, or filling the frame), and the
// world's (the point of the desk at the frame's centre, and the zoom). Each is a
// plain object the timeline tweens; `render` turns them into transforms on every
// frame, so a seek to any second lands exactly where the film is.
;(function () {
  const M = window.CUES.moments
  const $ = (selector) => document.querySelector(selector)
  const ICON = (name) => `<i class="ic">${window.ICONS[name]}</i>`
  for (const node of document.querySelectorAll('[data-icon]')) node.innerHTML = window.ICONS[node.dataset.icon]
  const orbit = `<svg viewBox="0 0 100 100" fill="none">${[0, 45, 90, 135].map((angle) => `<ellipse cx="50" cy="50" rx="43" ry="20.5" transform="rotate(${angle} 50 50)" stroke="currentColor" stroke-width="2.4"/>`).join('')}</svg>`
  for (const node of document.querySelectorAll('[data-mark]')) node.innerHTML = orbit
  const words = (text) =>
    text
      .split(' ')
      .map((word) => `<span class="w"><span>${word}</span></span>`)
      .join(' ')
  const lerp = (a, b, t) => a + (b - a) * t
  const clamp01 = (t) => Math.max(0, Math.min(1, t))
  const smooth = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

  const roomCam = $('#roomCam')
  const desk = $('#desk')
  const worldNode = $('#world')
  const mail = $('#mail')

  // ── The documents' contents: Studio's sample request, RFQ 1907 ──────────
  const lines = [
    ['01', 'NW3310-P', 'Control module, 24 V', 84, '19/09/2026', 'NovaWave Controls'],
    ['02', 'NW-3310-BR', 'Mounting bracket', 84, '19/09/2026', 'NovaWave Controls'],
    ['03', 'KLR-220-4', 'Relay block, 4-pole', 40, '19/09/2026', 'Kirchner Elektrik'],
    ['04', 'AX14', 'Mount assembly', 60, '23/09/2026', 'Ardent Systems'],
    ['05', 'TQ-8802', 'Bulkhead gland, M20', 120, '19/09/2026', 'Tessler Marine'],
    ['06', 'HLD-4471', 'Pressure sensor, 0-16 bar', 24, '26/09/2026', 'Halden Instruments'],
    ['07', 'VS-660-C', 'Cable tray, 660 mm', 30, '19/09/2026', 'Vestmar Steel'],
    ['08', 'KLR-220-2', 'Relay block, 2-pole', 40, '19/09/2026', 'Kirchner Elektrik'],
    ['09', 'CP-448', 'DC/DC converter, 300 W', 84, '19/09/2026', 'Corvid Power'],
    ['10', 'NW-3310-SP', 'Spare contact set', 12, '19/09/2026', 'NovaWave Controls'],
    ['11', 'AD-9020', 'Isolation switch, 63 A', 18, '19/09/2026', 'Ardent Systems'],
    ['12', 'TQ-8804', 'Bulkhead gland, M25', 60, '19/09/2026', 'Tessler Marine'],
    ['13', 'VS-400-C', 'Cable tray, 400 mm', 45, '19/09/2026', 'Vestmar Steel'],
  ]
  $('#bomRows').innerHTML =
    `<tr class="hd"><td class="n">11</td><td>Line</td><td>Part</td><td>Description</td><td class="q">Qty</td><td>Required</td><td>Manufacturer</td></tr>` +
    lines.map(([line, part, description, qty, date, maker], index) => `<tr id="bom-${index + 12}"><td class="n">${index + 12}</td><td>${line}</td><td>${part}</td><td>${description}</td><td class="q tnum">${qty}</td><td>${date}</td><td>${maker}</td></tr>`).join('')
  $('#quoteRows').innerHTML = lines
    .slice(0, 12)
    .map(([line, part, description, qty]) => `<tr id="q-${line}"><td>${line}</td><td>${part}</td><td>${description}</td><td class="q tnum">${qty}</td></tr>`)
    .join('')
  // The workbook's Sources sheet: every figure in the quotation, and where it came from.
  const sources = [
    ['01', 'Quantity', '84', 'BOM · row 12'],
    ['02', 'Quantity', '84', 'BOM · row 13'],
    ['03', 'Quantity', '40', 'BOM · row 14'],
    ['04', 'Part', 'AX14', 'BOM · row 15 · held'],
    ['05', 'Quantity', '120', 'BOM · row 16'],
    ['09', 'Quantity', '84', 'BOM, cell D20 · held'],
    ['', 'Cost basis', 'EUR 197,630', 'Aldermann quotation'],
    ['', 'Currency', 'EUR', 'Request, page 1, terms'],
    ['', 'Floor', '20.00%', 'Framework agreement'],
    ['', 'Reply by', 'Mon 27 July, 16:00', 'Request, page 1, terms'],
  ]
  $('#bookRows').innerHTML =
    `<tr class="hd"><td class="n">1</td><td>Line</td><td>Figure</td><td>Value</td><td>Source</td></tr>` +
    sources.map(([line, figure, value, source], index) => `<tr><td class="n">${index + 2}</td><td>${line}</td><td>${figure}</td><td>${value}</td><td>${source}</td></tr>`).join('')

  // The drafts: the customer, a supplier, a manufacturer and a meeting, each waiting for a person.
  const drafts = [
    ['mail', 'To Pernille Halvorsen', 'Halvorsen Marine · the customer · email', 'Line 09: your sheet says 84 and your note says 60. Which should we quote? Drawing HM-1907-D3 did not arrive.', 'Approve and send', 'Sent · 08:06'],
    ['mail', 'To Marsden Industrial', 'Supplier · email', 'Your quotation for RFQ 1907 could not be read. Could you send it again?', 'Approve and send', 'Sent · 08:06'],
    ['mail', 'To Corvid Power', 'Manufacturer of CP-448 · email', 'A firm price and lead time for CP-448, at 60 and at 84 units?', 'Approve and send', 'Sent · 08:06'],
    ['video', 'Aldermann Components', 'Google Meet · proposed for today, 11:00', 'Two lead times on one quotation. Fifteen minutes to settle which holds.', 'Approve invitation', 'Invitation sent · 08:06'],
  ]
  const DRAFT = { x: 8000, y: 140, w: 820, h: 236, gap: 28 }
  drafts.forEach(([icon, who, meta, say, action, done], index) => {
    const element = document.createElement('div')
    element.className = 'doc card draft'
    element.id = `draft${index}`
    Object.assign(element.style, { left: `${DRAFT.x}px`, top: `${DRAFT.y + index * (DRAFT.h + DRAFT.gap)}px`, width: `${DRAFT.w}px`, height: `${DRAFT.h}px` })
    element.innerHTML = `<div class="chead"><span class="tile">${window.ICONS[icon]}</span><div><div class="who">${who}</div><div class="meta">${meta}</div></div></div><div class="dsay">${say}</div><div class="foot"><span class="pill"><b></b>Awaiting your approval</span><span class="btn">${action}</span><span class="done">${ICON('check')}${done}</span></div>`
    $('#drafts').append(element)
  })

  // ── Overlays on the desk ──────────────────────────────────────────────
  const marks = $('#marks')
  function overlay(className, html = '') {
    const element = document.createElement('div')
    element.className = className
    element.innerHTML = html
    marks.append(element)
    return element
  }
  const selections = {}
  for (const id of ['hl-customer', 'hl-items', 'hl-eur', 'hl-due', 'hl-last', 'hl-floor', 'hl-sixty']) selections[id] = overlay('sel')
  // Charlie's name on what it is reading, three times: the request, the business system, the held question.
  const flags = [0, 1, 2].map(() => overlay('flag', `<i>${orbit}</i>Charlie`))
  flags[2].classList.add('light')
  const heldChip = overlay('held', '<b></b>Needs your decision')
  // Held, in the signal: line 09's quantity, line 04's question, line 04 in the quotation, the margin under the floor.
  const brackets = { q09: overlay('bracket'), q04: overlay('bracket'), quote04: overlay('bracket'), margin: overlay('bracket') }
  // Covers wiped off as things arrive.
  const factCovers = [0, 1, 2, 3, 4].map(() => overlay('cover'))
  const rowCovers = Array.from({ length: 13 }, () => overlay('cover'))
  const supCovers = [0, 1, 2, 3, 4].map(() => overlay('cover'))
  const evidCovers = [overlay('cover'), overlay('cover')]
  // The morning.
  const candidate = overlay('sel')
  const field = overlay('field')
  const sendBtn = overlay('send', 'Send answer')
  const answerText = overlay('typedAnswer', 'AX-14-M, panel mount.')
  const answer = overlay('note', `${ICON('check')}Answer sent · AX-14-M, panel mount`)
  const typedBox = overlay('typed', '<img src="stills/approve-typed.webp" alt="" />')
  const caret = overlay('caret')
  const settled = overlay('settled', `${ICON('check')}Exception approved · 08:05`)
  const asked = overlay('note', `${ICON('check')}Asked Halvorsen · 08:06`)
  const ready = overlay('note', `${ICON('check')}Ready for review`)
  const pointer = overlay('pointer', '<svg viewBox="0 0 24 24"><path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" /></svg>')

  // Threads: a figure and the place it came from, drawn as one line.
  const svg = $('#threads')
  const T = {}
  for (const key of ['f0', 'f1', 'f2', 'f3', 'b12', 'b13', 'b14', 'b20', 'e84', 'e60', 'last', 'goods']) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    group.innerHTML = '<path pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/><circle r="6"/><circle r="6"/>'
    group.style.opacity = 0
    svg.append(group)
    T[key] = group
  }
  function connect(group, [x1, y1], [x2, y2], bend = 0.45) {
    const dx = (x2 - x1) * bend
    group.querySelector('path').setAttribute('d', `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`)
    const [c1, c2] = group.querySelectorAll('circle')
    for (const [circle, x, y] of [[c1, x1, y1], [c2, x2, y2]]) {
      circle.setAttribute('cx', x)
      circle.setAttribute('cy', y)
      circle.style.transformOrigin = `${x}px ${y}px`
    }
  }

  // Studio's pages are images: a part is found at the still's own pixels (1440 x 900), scaled by k from the crop's corner.
  const at = (doc, k, cx, cy) => [doc[0] + (cx - doc[2]) * k, doc[1] + (cy - doc[3]) * k]
  const SHEET = [4300, 220, 262, 0]
  const EVID = [5980, 860, 1030, 495]
  const Q04 = [4300, 1680, 280, 145]
  const SUP = [5700, 1960, 272, 360]
  const READ = [1960, 690, 1085, 325]
  const APPROVE = [6840, 1060, 441, 189]
  const rowTop = (row) => at(SHEET, 1.36, 0, 298 + 48 * (row - 1))[1]

  function place(element, [x, y, w, h]) {
    if (x != null) element.style.left = `${x}px`
    if (y != null) element.style.top = `${y}px`
    if (w != null) element.style.width = `${w}px`
    if (h != null) element.style.height = `${h}px`
  }
  /** An element's rectangle in world units, measured with the desk and the world unmoved. */
  function rectOf(selector, pad = 0) {
    const node = typeof selector === 'string' ? $(selector) : selector
    const world = worldNode.getBoundingClientRect()
    const box = node.getBoundingClientRect()
    return [box.left - world.left - pad, box.top - world.top - pad, box.width + pad * 2, box.height + pad * 2]
  }

  function layout() {
    const saved = [desk.style.transform, worldNode.style.transform]
    desk.style.transform = 'none'
    worldNode.style.transform = 'none'
    for (const [id, element] of Object.entries(selections)) place(element, rectOf(`#${id}`, 6))
    const customer = rectOf('#hl-customer', 6)
    place(flags[0], [customer[0] + customer[2] + 14, customer[1] + (customer[3] - 34) / 2])
    const last = rectOf('#hl-last', 6)
    place(flags[1], [last[0], last[1] - 40])
    place(flags[2], [Q04[0] + 1088 + 30, Q04[1] + 2])
    place(heldChip, [Q04[0] + 1088 + 30, Q04[1] + 48])
    // The read panel's five facts, a row each, and a thread from each of the first four to its place on the page.
    ;[[355, 402], [405, 452], [455, 502], [505, 552], [555, 602]].forEach(([top, bottom], index) => {
      const corner = at(READ, 2, 1092, top)
      place(factCovers[index], [corner[0], corner[1], 640, (bottom - top) * 2])
      if (index < 4) {
        const from = rectOf(`#${['hl-customer', 'hl-items', 'hl-due', 'hl-eur'][index]}`, 6)
        connect(T[`f${index}`], [from[0] + from[2] + 4, from[1] + from[3] / 2], [corner[0] + 2, corner[1] + (bottom - top)], 0.5)
      }
    })
    // The sheet's rows, the threads from the bill of materials to them, and line 09's quantity.
    rowCovers.forEach((cover, index) => place(cover, [at(SHEET, 1.36, 272, 0)[0], rowTop(index + 1), (1416 - 272) * 1.36, index === 12 ? (900 - 874) * 1.36 : 48 * 1.36]))
    for (const [key, row] of [['b12', 1], ['b13', 2], ['b14', 3], ['b20', 9]]) {
      const source = rectOf(`#bom-${row + 11}`)
      const label = at(SHEET, 1.36, 332, 298 + 48 * (row - 1) + 31)
      connect(T[key], [source[0] + source[2] + 4, source[1] + source[3] / 2], [label[0] - 6, label[1]], 0.5)
    }
    const cell = [at(SHEET, 1.36, 1093, 0)[0], rowTop(9), 119 * 1.36, 47 * 1.36]
    place(brackets.q09, [cell[0] - 10, cell[1] + 3, cell[2] + 20, cell[3] - 6])
    place(asked, [cell[0] - 70, cell[1] + cell[3] + 14])
    // The evidence, Studio's finding: the bill of materials' 84 above, the covering email's 60 below.
    place(evidCovers[0], [EVID[0], EVID[1], 790, (635 - 495) * 2])
    place(evidCovers[1], [EVID[0], EVID[1] + (635 - 495) * 2, 790, (800 - 635) * 2])
    connect(T.e84, [cell[0] + cell[2] + 6, cell[1] + cell[3] / 2], at(EVID, 2, 1062, 572), 0.5)
    connect(T.e60, [cell[0] + cell[2] + 6, cell[1] + cell[3] / 2], at(EVID, 2, 1062, 714), 0.5)
    // Line 04: the question, its precedent in the business system, the person's answer.
    place(brackets.q04, [...at(Q04, 1.36, 288, 190), 784 * 1.36, 32 * 1.36])
    connect(T.last, [last[0] + last[2] + 4, last[1] + last[3] / 2], at(Q04, 1.36, 300, 441), 0.55)
    place(candidate, [...at(Q04, 1.36, 305, 380), 148 * 1.36, 26 * 1.36])
    place(field, [...at(Q04, 1.36, 302, 545), 750 * 1.36, 50 * 1.36])
    place(sendBtn, [...at(Q04, 1.36, 297, 612), 98 * 1.36, 26 * 1.36])
    place(answerText, at(Q04, 1.36, 312, 549))
    place(answer, [Q04[0] + 1088 + 30, Q04[1] + 48])
    // The suppliers' five rows, and the thread from the cost basis to Aldermann's quotation.
    ;[[405, 512], [515, 622], [628, 740], [743, 852], [855, 900]].forEach(([top, bottom], index) => place(supCovers[index], [SUP[0], at(SUP, 1.36, 0, top)[1], 1553, (bottom - top) * 1.36]))
    const goods = rectOf('#costGoods')
    connect(T.goods, [goods[0] - 4, goods[1] + 36], at(SUP, 1.36, 1146, 446), 0.5)
    // The quotation's line 04, and the margin on Studio's approval.
    const q4 = rectOf('#q-04')
    place(brackets.quote04, [q4[0] - 12, q4[1] + 3, q4[2] + 24, q4[3] - 6])
    place(brackets.margin, [...at(APPROVE, 1.6, 461, 288), 66 * 1.6, 44 * 1.6])
    // The reason, typed: the typed still revealed a letter at a time over the empty one.
    place(typedBox, [...at(APPROVE, 1.6, 470, 532), 0, 28 * 1.6])
    Object.assign(typedBox.querySelector('img').style, { left: `${-470 * 1.6}px`, top: `${-532 * 1.6}px`, width: `${1440 * 1.6}px`, height: `${900 * 1.6}px` })
    place(caret, [...at(APPROVE, 1.6, 471, 535), 2.4, 21 * 1.6])
    place(settled, [...at(APPROVE, 1.6, 600, 637), 380 * 1.6, 44 * 1.6])
    place(ready, [5980, 1222])
    desk.style.transform = saved[0]
    worldNode.style.transform = saved[1]
  }
  layout()
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout)

  // Lines of type over the desk, bottom left; each rises a word at a time.
  const says = {}
  function say(key, text, day = false) {
    const element = document.createElement('div')
    element.className = `say serif${day ? ' day' : ''}`
    element.innerHTML = words(text)
    $('#says').append(element)
    says[key] = element
  }
  say('reads', 'It reads the request,')
  says.reads.insertAdjacentHTML('beforeend', ` <span class="more">${words('and everything you hold.')}</span>`)
  say('source', 'Every figure keeps its source.')
  say('make', 'The quotation takes shape.')
  say('decision', 'This needs your decision.')
  say('approval', 'Nothing leaves without your approval.', true)
  says.approval.classList.add('top')
  $('#lineAnswer').innerHTML = words('This needs an answer.')

  // ── The cameras ───────────────────────────────────────────────────────
  // The paper on the desk in the room's photographs, its corners in the frame, and the page it opens into.
  const PAPER = [[697, 742], [1172, 757], [1081, 918], [369, 873]]
  const PC = [829.75, 822.5]
  const P = [323.5, 90, 1273, 900]
  const PCORNERS = [[P[0], P[1]], [P[0] + P[2], P[1]], [P[0] + P[2], P[1] + P[3]], [P[0], P[1] + P[3]]]
  const room = { s: 1, m: 0 }
  const portal = { e: 0, open: 0, fade: 0 }
  const cam = { x: 1236.5, y: 1050, z: 1 }
  const mailDrop = { e: 0 }
  const MAIL = [560, 560, 800, 270]
  const roomPoint = ([x, y]) => [lerp(PC[0], 960, room.m) + room.s * (x - PC[0]), lerp(PC[1], 540, room.m) + room.s * (y - PC[1])]

  function solve(A, b) {
    const n = b.length
    const m = A.map((row, i) => [...row, b[i]])
    for (let c = 0; c < n; c += 1) {
      let pivot = c
      for (let r = c + 1; r < n; r += 1) if (Math.abs(m[r][c]) > Math.abs(m[pivot][c])) pivot = r
      ;[m[c], m[pivot]] = [m[pivot], m[c]]
      for (let r = 0; r < n; r += 1) {
        if (r === c) continue
        const f = m[r][c] / m[c][c]
        for (let k = c; k <= n; k += 1) m[r][k] -= f * m[c][k]
      }
    }
    return m.map((row, i) => row[n] / row[i])
  }
  /** The projective map taking four points to four others, as a CSS matrix3d. */
  function homography(src, dst) {
    const A = []
    const b = []
    for (let i = 0; i < 4; i += 1) {
      const [x, y] = src[i]
      const [u, v] = dst[i]
      A.push([x, y, 1, 0, 0, 0, -u * x, -u * y])
      b.push(u)
      A.push([0, 0, 0, x, y, 1, -v * x, -v * y])
      b.push(v)
    }
    const h = solve(A, b)
    return `matrix3d(${h[0]},${h[3]},0,${h[6]},${h[1]},${h[4]},0,${h[7]},0,0,1,0,${h[2]},${h[5]},0,1)`
  }

  function render() {
    roomCam.style.transform = `translate(${lerp(PC[0], 960, room.m) - room.s * PC[0]}px, ${lerp(PC[1], 540, room.m) - room.s * PC[1]}px) scale(${room.s})`
    worldNode.style.transform = `translate(${960 - cam.z * cam.x}px, ${540 - cam.z * cam.y}px) scale(${cam.z})`
    const quad = PAPER.map(roomPoint)
    const e = smooth(clamp01(portal.e))
    desk.style.transform = e >= 0.9999 ? 'none' : homography(PCORNERS, quad.map((point, i) => [lerp(point[0], PCORNERS[i][0], e), lerp(point[1], PCORNERS[i][1], e)]))
    const open = smooth(clamp01(portal.open))
    desk.style.clipPath = `inset(${lerp(P[1], 0, open)}px ${lerp(1920 - P[0] - P[2], 0, open)}px ${lerp(1080 - P[1] - P[3], 0, open)}px ${lerp(P[0], 0, open)}px)`
    desk.style.opacity = clamp01(portal.fade)
    // The request lands on the desk as the paper under the lamp.
    const d = smooth(clamp01(mailDrop.e))
    if (d > 0) {
      const src = [[0, 0], [MAIL[2], 0], [MAIL[2], MAIL[3]], [0, MAIL[3]]]
      const from = [[MAIL[0], MAIL[1]], [MAIL[0] + MAIL[2], MAIL[1]], [MAIL[0] + MAIL[2], MAIL[1] + MAIL[3]], [MAIL[0], MAIL[1] + MAIL[3]]]
      mail.style.transform = homography(src, from.map((point, i) => [lerp(point[0], quad[i][0], d), lerp(point[1], quad[i][1], d)]))
    } else {
      mail.style.transform = `translate(${MAIL[0]}px, ${MAIL[1]}px)`
    }
  }

  // ── The timeline ──────────────────────────────────────────────────────
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' }, onUpdate: render })
  /** A move of a camera object from where its last move left it, so a seek to any second is exact. */
  function mover(target, state) {
    return (when, duration, to, easeName = 'power2.inOut') => {
      const from = {}
      for (const key of Object.keys(to)) from[key] = state[key]
      tl.fromTo(target, from, { ...to, duration, ease: easeName, immediateRender: false }, when)
      Object.assign(state, to)
    }
  }
  const camTo = mover(cam, { ...cam })
  const roomTo = mover(room, { ...room })
  const portalTo = mover(portal, { ...portal })
  /** In through the paper: the room rushes past as the desk lifts off the paper and squares to the frame. */
  function enter(when, duration) {
    roomTo(when, duration, { s: 2.6, m: 1 }, 'power2.in')
    portalTo(when, duration * 0.2, { fade: 1 }, 'none')
    portalTo(when + duration * 0.12, duration * 0.88, { e: 1 }, 'power1.inOut')
    portalTo(when + duration * 0.55, duration * 0.45, { open: 1 }, 'none')
  }
  /** Out through the paper: the desk folds back into the paper and the room comes back around it. */
  function leave(when, duration) {
    portalTo(when, duration * 0.4, { open: 0 }, 'none')
    portalTo(when + duration * 0.1, duration * 0.75, { e: 0 }, 'power1.inOut')
    portalTo(when + duration * 0.8, duration * 0.2, { fade: 0 }, 'none')
    roomTo(when + duration * 0.1, duration * 0.9, { s: 1, m: 0 }, 'power2.out')
  }
  function show(target, when, duration = 0.5, from = { opacity: 0 }, to = { opacity: 1 }) {
    tl.fromTo(target, from, { ...to, duration, ease: 'power2.out', immediateRender: false }, when)
    gsap.set(target, from)
  }
  const hide = (target, when, duration = 0.3) => tl.to(target, { opacity: 0, duration, ease: 'power1.in' }, when)
  function rise(spans, when, stagger = 0.045) {
    gsap.set(spans, { yPercent: 110 })
    tl.fromTo(spans, { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: 'power3.out', stagger, immediateRender: false }, when)
  }
  function sayIn(key, when, until) {
    rise(says[key].querySelectorAll(':scope > .w > span'), when)
    if (until) tl.to(says[key], { opacity: 0, duration: 0.35, ease: 'power1.in' }, until)
  }
  function draw(group, when, duration = 0.6) {
    const [c1, c2] = group.querySelectorAll('circle')
    gsap.set(c2, { scale: 0 })
    tl.set(group, { opacity: 1 }, when)
    tl.fromTo(c1, { scale: 0 }, { scale: 1, duration: 0.2, ease: 'power2.out', immediateRender: false }, when)
    tl.fromTo(group.querySelector('path'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration, ease: 'power1.inOut', immediateRender: false }, when)
    tl.fromTo(c2, { scale: 0 }, { scale: 1, duration: 0.2, ease: 'power2.out', immediateRender: false }, when + duration - 0.05)
  }
  const quiet = (group, when) => tl.to(group, { opacity: 0.3, duration: 0.5, ease: 'power1.out' }, when)
  /** A cover over something from `from`, wiped off at `when`: the thing arriving. */
  function wipe(cover, from, when, duration = 0.4) {
    gsap.set(cover, { opacity: 0 })
    tl.set(cover, { opacity: 1 }, from)
    tl.fromTo(cover, { scaleX: 1 }, { scaleX: 0, duration, ease: 'power2.inOut', immediateRender: false }, when)
  }
  function select(element, when, until) {
    tl.fromTo(element, { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 0.3, ease: 'power2.out', immediateRender: false }, when)
    if (until) tl.to(element, { opacity: 0, duration: 0.4 }, until)
  }
  const bracketIn = (element, when) => show(element, when, 0.4, { opacity: 0, scaleY: 0.4 }, { opacity: 1, scaleY: 1 })
  function flagIn(flag, when, until, scale = 1) {
    show(flag, when, 0.35, { opacity: 0, scale: scale * 0.85 }, { opacity: 1, scale })
    if (until) hide(flag, until)
  }
  /** The person's pointer: travels in, presses, and stays. `scale` keeps it a pointer's size at the camera's zoom. */
  function press(from, to, when, travel = 0.45, scale = 1) {
    tl.set(pointer, { opacity: 1, x: from[0], y: from[1], scale }, when - travel - 0.12)
    tl.fromTo(pointer, { x: from[0], y: from[1] }, { x: to[0], y: to[1], duration: travel, ease: 'power2.inOut', immediateRender: false }, when - travel)
    tl.to(pointer, { scale: scale * 0.82, duration: 0.07, ease: 'power1.in' }, when)
    tl.to(pointer, { scale, duration: 0.14, ease: 'power1.out' }, when + 0.07)
  }
  gsap.set(pointer, { opacity: 0 })
  gsap.set(['#nightOff', '#nightOn', '#morningOn', '#morningOff', '#dawnClip'], { opacity: 0 })

  // ── 0 · 23:47. This needs an answer ───────────────────────────────────
  tl.fromTo('#nightOff', { opacity: 0 }, { opacity: 1, duration: 1.0, ease: 'power1.out', immediateRender: false }, 0)
  roomTo(0, M.portalIn, { s: 1.04 }, 'none')
  show('#clock', M.clock, 0.6)
  rise($('#lineAnswer').querySelectorAll('.w > span'), M.lineAnswer, 0.06)
  hide(['#clock', '#lineAnswer'], M.lineAnswerOut, 0.4)
  show('#mailBody', M.mailIn, 0.55, { opacity: 0, y: 26 }, { opacity: 1, y: 0 })
  const chips = mail.querySelectorAll('.attchip')
  show(chips[0], M.attach, 0.35)
  show(chips[1], M.attach + 0.25, 0.35)
  // The request lands on the desk, as the paper under the lamp; the lamp comes on.
  tl.fromTo(mailDrop, { e: 0 }, { e: 1, duration: M.lampOn - M.mailDrop, ease: 'none', immediateRender: false }, M.mailDrop)
  tl.to('#mailBody', { opacity: 0, duration: 0.25, ease: 'power1.in' }, M.lampOn - 0.25)
  tl.set('#nightOn', { opacity: 1 }, M.lampOn)
  tl.set('#nightOff', { opacity: 0 }, M.lampOn + 0.08)
  tl.fromTo('#nightOn', { filter: 'brightness(0.5)' }, { filter: 'brightness(1)', duration: 0.16, ease: 'power2.out', immediateRender: false }, M.lampOn)
  show('#name .m', M.nameIn, 0.7, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1 })
  show('#name .t', M.nameIn + 0.1, 0.8, { opacity: 0, y: 18 }, { opacity: 1, y: 0 })
  hide(['#name .m', '#name .t'], M.nameOut, 0.35)

  // ── 1 · In through the paper ──────────────────────────────────────────
  enter(M.portalIn, 1.6)
  tl.set('#nightOn', { opacity: 0 }, M.portalIn + 1.62)

  // ── 2 · It reads the request, and everything you hold ─────────────────
  camTo(M.portalIn + 1.6, 0.9, { x: 1590, y: 1070, z: 0.82 })
  flagIn(flags[0], M.readPage, M.pullBack + 0.4)
  ;['hl-customer', 'hl-items', 'hl-due', 'hl-eur', null].forEach((id, index) => {
    const when = M.facts + index * 0.4
    if (id) select(selections[id], when - 0.15, M.pullBack + 0.8)
    wipe(factCovers[index], M.portalIn, when, 0.35)
    if (index < 4) {
      draw(T[`f${index}`], when - 0.1, 0.4)
      quiet(T[`f${index}`], when + 0.9)
      hide(T[`f${index}`], M.pullBack + 0.8, 0.4)
    }
  })
  sayIn('reads', M.lineReads, M.lineSource - 0.4)
  rise(says.reads.querySelectorAll('.more .w > span'), M.lineReadsMore)
  camTo(M.pullBack, 1.8, { x: 1710, y: 1240, z: 0.36 }, 'power3.inOut')
  flagIn(flags[1], M.readSystem, M.toSheet, 2.3)
  select(selections['hl-last'], M.readSystem, M.toSheet + 0.2)
  select(selections['hl-floor'], M.readAgreement, M.toSheet + 0.2)
  select(selections['hl-sixty'], M.readAgreement + 0.3, M.toSheet + 0.2)

  // ── 3 · Every figure keeps its source ─────────────────────────────────
  sayIn('source', M.lineSource, M.rowsDone - 0.6)
  camTo(M.toSheet, 1.6, { x: 4560, y: 760, z: 0.62 }, 'power3.inOut')
  camTo(M.toSheet + 1.6, M.rowsDone - M.toSheet - 1.6, { x: 4720, y: 800, z: 0.66 }, 'power1.inOut')
  rowCovers.forEach((cover, index) => wipe(cover, M.portalIn, M.rows + index * 0.2667, 0.32))
  draw(T.b12, M.threads, 0.7)
  draw(T.b13, M.threads + 0.35, 0.7)
  draw(T.b14, M.threads + 0.7, 0.7)
  quiet(T.b12, M.rows + 0.8)
  quiet(T.b13, M.rows + 1.0)
  quiet(T.b14, M.rows + 1.2)
  draw(T.b20, M.rows + 8 * 0.2667 - 0.3, 0.6)
  quiet(T.b20, M.rowsDone + 0.4)
  hide([T.b12, T.b13, T.b14, T.b20], M.toMount, 0.4)

  // ── 4 · 84 on the sheet, 60 in the email ──────────────────────────────
  camTo(M.rowsDone, 0.4, { x: 6050, y: 1150, z: 1.05 }, 'power2.out')
  show('#evid', M.evidence, 0.2)
  wipe(evidCovers[0], M.portalIn, M.evidence, 0.45)
  wipe(evidCovers[1], M.portalIn, M.sixty - 0.35, 0.35)
  draw(T.e84, M.evidence + 0.2, 0.5)
  draw(T.e60, M.sixty - 0.3, 0.4)
  bracketIn(brackets.q09, M.sixty)
  hide(['#evid', T.e84, T.e60], M.toMount + 0.3, 0.4)

  // ── 5 · Line 04: panel or rail? ───────────────────────────────────────
  camTo(M.toMount, 0.8, { x: 4860, y: 2000, z: 0.95 }, 'power3.inOut')
  draw(T.last, M.mountHold - 0.5, 0.6)
  hide(T.last, M.toSuppliers, 0.4)
  bracketIn(brackets.q04, M.mountHold)
  show(heldChip, M.mountHold + 0.4, 0.4, { opacity: 0, x: -10 }, { opacity: 1, x: 0 })
  flagIn(flags[2], M.mountHold + 0.6)

  // ── 6 · Five supplier quotations, one that could not be read ──────────
  camTo(M.toSuppliers, 1.0, { x: 6476, y: 2327, z: 0.82 }, 'power3.inOut')
  ;[0, 0.5, 1.0, 1.9, 2.4].forEach((offset, index) => wipe(supCovers[index], M.portalIn, M.supRows + offset, 0.35))
  camTo(M.toCost, 0.6, { x: 7150, y: 2330, z: 0.82 }, 'power2.inOut')
  show('#cost', M.goods - 0.5, 0.4)
  show('#costGoods', M.goods, 0.35, { opacity: 0, y: 10 }, { opacity: 1, y: 0 })
  draw(T.goods, M.goods + 0.05, 0.5)
  hide(T.goods, M.toMake, 0.3)
  show('#costFreight', M.freight, 0.35, { opacity: 0, y: 10 }, { opacity: 1, y: 0 })
  show('#costTotal', M.costBasis - 0.1, 0.35)
  const count = { v: 191900 }
  tl.fromTo(count, { v: 191900 }, { v: 197630, duration: 0.6, ease: 'power2.out', immediateRender: false, onUpdate: () => { $('#costValue').textContent = `EUR ${Math.round(count.v).toLocaleString('en-GB')}` } }, M.costBasis)

  // ── 7 · The quotation takes shape ─────────────────────────────────────
  camTo(M.toMake, 1.0, { x: 6500, y: 690, z: 0.6 }, 'power3.inOut')
  camTo(M.make, M.peakOne - M.make, { x: 6500, y: 700, z: 0.565 }, 'power1.inOut')
  show('#quote', M.make, 0.8, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' })
  show('#book', M.make + 0.13, 0.8, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' })
  show('#quoteLabel', M.make + 1.27, 0.5, { opacity: 0, y: 8 }, { opacity: 1, y: 0 })
  show('#bookLabel', M.make + 1.4, 0.5, { opacity: 0, y: 8 }, { opacity: 1, y: 0 })
  bracketIn(brackets.quote04, M.make + 0.9)
  sayIn('make', M.lineMake, M.toMargin + 0.2)

  // ── 8 · Drafted, each waiting for you; and the floor ──────────────────
  camTo(M.peakOne, 1.0, { x: 7700, y: 650, z: 0.62 }, 'power3.inOut')
  drafts.forEach((_, index) => show(`#draft${index}`, M.drafts + index * 0.4, 0.5, { opacity: 0, x: 40 }, { opacity: 1, x: 0 }))
  camTo(M.toMargin, 0.6, { x: 7600, y: 900, z: 0.58 }, 'power2.inOut')
  show('#approve', M.margin, 0.4, { opacity: 0, y: 14 }, { opacity: 1, y: 0 })
  bracketIn(brackets.margin, M.floor)

  // ── 9 · This needs your decision ──────────────────────────────────────
  sayIn('decision', M.stop + 0.1, M.portalOut + 0.4)
  camTo(M.stop + 0.2, 1.8, { x: 6250, y: 1300, z: 0.3 }, 'power2.inOut')
  tl.set('#nightOn', { opacity: 1 }, M.portalOut)
  leave(M.portalOut, 1.6)

  // ── 10 · 08:04 ────────────────────────────────────────────────────────
  tl.set('#dawnClip', { opacity: 1 }, M.dawn)
  tl.set('#morningOn', { opacity: 1 }, M.portalIn2 - 0.04)
  tl.set(['#nightOn', '#dawnClip'], { opacity: 0 }, M.portalIn2)
  show('#clockMorning', M.clockMorning, 0.7, { opacity: 0, y: 12 }, { opacity: 1, y: 0 })
  hide('#clockMorning', M.portalIn2 - 0.25, 0.25)
  // While the desk is out of sight it turns to paper, and Charlie steps back from the question.
  tl.set('#ground', { backgroundColor: '#f2f2f0' }, M.dawn)
  tl.set('.label', { color: '#111110' }, M.dawn)
  tl.set('.label em', { outlineColor: 'rgba(17, 17, 16, 0.22)', color: '#45453f' }, M.dawn)
  tl.set(flags[2], { opacity: 0 }, M.dawn)
  tl.set(['#sup', '#cost'], { opacity: 0 }, M.dawn)
  camTo(M.dawn, 0.1, { x: 4860, y: 2000, z: 0.95 }, 'none')

  // ── 11 · The person decides ───────────────────────────────────────────
  enter(M.portalIn2, 0.8)
  tl.set('#morningOn', { opacity: 0 }, M.portalIn2 + 0.82)
  select(candidate, M.choose, M.sendAnswer + 0.4)
  show(field, M.choose + 0.1, 0.12)
  show(answerText, M.choose + 0.12, 0.15)
  show(sendBtn, M.choose + 0.15, 0.15)
  press([4720, 2180], [4440, 2020], M.choose, 0.42)
  press([4440, 2020], [4378, 2328], M.sendAnswer, 0.32)
  tl.to(brackets.q04, { opacity: 0, scaleY: 0.4, duration: 0.3, ease: 'power2.in' }, M.sendAnswer + 0.1)
  hide(heldChip, M.sendAnswer + 0.05, 0.2)
  show(answer, M.sendAnswer + 0.15, 0.3, { opacity: 0, x: -10 }, { opacity: 1, x: 0 })
  hide(brackets.quote04, M.sendAnswer + 0.2, 0.2)
  tl.set(pointer, { opacity: 0 }, M.toApprove + 0.1)
  // The exception: the reason typed, held still, and approved.
  camTo(M.toApprove, 0.5, { x: 7286, y: 1478, z: 1.0 }, 'power3.inOut')
  tl.fromTo('#approve', { height: 234 }, { height: 837, duration: 0.45, ease: 'power3.out', immediateRender: false }, M.toApprove)
  camTo(M.typeStart + 0.5, 0.9, { x: 7290, y: 1650, z: 1.22 }, 'power2.inOut')
  gsap.set([typedBox, caret], { opacity: 0 })
  tl.set([typedBox, caret], { opacity: 1 }, M.typeStart)
  tl.fromTo(typedBox, { width: 0 }, { width: 312 * 1.6, duration: M.typeEnd - M.typeStart, ease: 'steps(51)', immediateRender: false }, M.typeStart)
  tl.fromTo(caret, { x: 0 }, { x: 310 * 1.6, duration: M.typeEnd - M.typeStart, ease: 'steps(51)', immediateRender: false }, M.typeStart)
  tl.set('#approveImg', { attr: { src: 'stills/approve-typed.webp' } }, M.typeEnd + 0.05)
  tl.set([typedBox, caret], { opacity: 0 }, M.typeEnd + 0.08)
  press([7860, 1960], [7592, 1813], M.approve, 0.5, 0.82)
  show(settled, M.approve + 0.1, 0.25)
  tl.set(pointer, { opacity: 0 }, M.approve + 0.35)
  sayIn('approval', M.lineApproval, M.send4 + 0.15)

  // ── 12 · Each message leaves when you approve it ──────────────────────
  camTo(M.approve + 0.3, 0.55, { x: 8410, y: 650, z: 0.8 }, 'power3.inOut')
  drafts.forEach((_, index) => show(`#draft${index} .btn`, M.approve + 0.6, 0.3))
  ;[M.send1, M.send2, M.send3, M.send4].forEach((when, index) => {
    const y = DRAFT.y + index * (DRAFT.h + DRAFT.gap) + DRAFT.h - 22 - 30
    const button = [DRAFT.x + DRAFT.w - 34 - 110, y]
    press(index === 0 ? [DRAFT.x + DRAFT.w + 60, y - 140] : [button[0], y - (DRAFT.h + DRAFT.gap)], button, when, 0.3, 1)
    hide(`#draft${index} .pill`, when + 0.05, 0.15)
    hide(`#draft${index} .btn`, when + 0.1, 0.15)
    show(`#draft${index} .done`, when + 0.12, 0.25)
  })
  tl.set(pointer, { opacity: 0 }, M.send4 + 0.35)
  hide(brackets.q09, M.send1 + 0.1, 0.3)
  show(asked, M.send1 + 0.2, 0.3)
  camTo(M.send4 + 0.3, 0.5, { x: 6360, y: 660, z: 0.8 }, 'power3.inOut')
  hide('#quoteLabel em', M.ready - 0.1, 0.2)
  show(ready, M.ready, 0.3, { opacity: 0, y: 8 }, { opacity: 1, y: 0 })
  camTo(M.settle, M.portalOut2 - M.settle, { x: 6250, y: 1300, z: 0.32 }, 'power2.inOut')

  // ── 13 · The morning, the lamp off, Charlie ───────────────────────────
  tl.set('#morningOn', { opacity: 1 }, M.portalOut2)
  leave(M.portalOut2, 1.6)
  tl.set('#morningOff', { opacity: 1 }, M.lampOff)
  tl.set('#morningOn', { opacity: 0 }, M.lampOff + 0.06)
  roomTo(M.toWhite, M.end - M.toWhite, { s: 7, m: 1 }, 'power3.in')
  show('#white', M.end - 0.55, 0.5)
  show('#end', M.end, 0.01)
  show('#end .m', M.end + 0.05, 0.9, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1 })
  show('#end .t', M.end + 0.15, 1.0, { opacity: 0, y: 22 }, { opacity: 1, y: 0 })
  show(['#end .s', '#end .u'], M.end + 0.65, 0.8, { opacity: 0, y: 12 }, { opacity: 1, y: 0 })
  tl.to('#end', { opacity: 1, duration: 0.01 }, window.CUES.duration - 0.01)

  // index.html registers it, where the renderer's linter looks for it.
  window.__filmTimeline = tl
  tl.seek(0, false)
  render()
})()
