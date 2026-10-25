// The film's clock, in seconds. Read by index.html for the picture and by
// sound.py for the soundtrack, so a moment moved here moves in both. The
// score is one original piece on the same clock, at 120 BPM: a bar is two
// seconds, so every chapter of the film starts on a downbeat.
window.CUES = {
  "duration": 60,
  "fps": 30,
  "moments": {
    "lineArrives": 0.7,
    "toGlass": 4.0,
    "lineHome": 4.2,
    "toBlack": 6.0,
    "lineWork": 6.2,
    "reveal": 8.0,
    "tagline": 9.0,
    "toWindow": 10.8,
    "agentLine": 12.3,

    "cardReads": 14.0,
    "toPdf": 15.0,
    "pdfScan": 15.3,
    "pdfItems": 15.7,

    "cardSheet": 18.0,
    "toMatrix": 19.0,
    "rows": 19.25,

    "cardCites": 22.0,
    "toCell": 23.0,
    "click1": 23.65,
    "findTop": 24.0,
    "citeA": 24.5,
    "citeB": 24.95,

    "cardCosts": 26.0,
    "toSuppliers": 27.0,
    "supRows": 27.25,
    "supCost": 28.5,

    "cardHolds": 30.0,
    "toHeld": 31.0,
    "heldMark": 31.35,
    "heldRing": 32.0,
    "heldChip": 32.55,

    "cardMakes": 34.0,
    "toWork": 35.0,
    "workRing": 35.4,
    "docLift": 35.9,
    "docPush": 36.6,

    "cardReach": 38.0,
    "toReach": 39.0,
    "reachCards": 39.2,
    "reachPills": 40.5,

    "toBoundary": 42.0,
    "toApprove": 44.0,
    "approveNums": 44.35,
    "toReason": 44.95,
    "typeStart": 45.4,
    "typeEnd": 46.6,
    "click2": 47.3,

    "toGrid": 48.0,
    "tiles": 48.35,

    "toMorning": 52.0,
    "lineWorked": 52.4,
    "toEnd": 56.0
  },
  "sounds": [
    ["whoosh", "toGlass", -0.12, 0.7],
    ["whoosh", "toBlack", -0.12, 0.7],
    ["swell", "reveal", -1.2, 0.8],
    ["chime", "tagline", 0.0, 0.8],
    ["whoosh", "toWindow", 0.1, 0.9],

    ["pop", "cardReads", 0.06],
    ["whoosh", "toPdf", -0.1, 0.8],
    ["tick", "pdfItems", 0.0],
    ["tick", "pdfItems", 0.25],
    ["tick", "pdfItems", 0.5],
    ["tick", "pdfItems", 0.75],
    ["tick", "pdfItems", 1.0],

    ["pop", "cardSheet", 0.06],
    ["whoosh", "toMatrix", -0.1, 0.8],
    ["ticks", "rows", 0.0, 13, 0.13],

    ["pop", "cardCites", 0.06],
    ["whoosh", "toCell", -0.1, 0.8],
    ["click", "click1", 0.0],
    ["pop", "citeA", 0.0],
    ["pop", "citeB", 0.0],

    ["pop", "cardCosts", 0.06],
    ["whoosh", "toSuppliers", -0.1, 0.8],
    ["tick", "supRows", 0.0],
    ["tick", "supRows", 0.25],
    ["tick", "supRows", 0.5],
    ["tick", "supRows", 0.75],
    ["pop", "supCost", 0.0],

    ["pop", "cardHolds", 0.06],
    ["whoosh", "toHeld", -0.1, 0.8],
    ["alert", "heldRing", 0.0, 0.8],
    ["pop", "heldChip", 0.0],

    ["pop", "cardMakes", 0.06],
    ["whoosh", "toWork", -0.1, 0.8],
    ["pop", "workRing", 0.0],
    ["swell", "docLift", -0.3, 0.7],

    ["pop", "cardReach", 0.06],
    ["whoosh", "toReach", -0.1, 0.8],
    ["pop", "reachCards", 0.0],
    ["pop", "reachCards", 0.35],
    ["pop", "reachCards", 0.7],
    ["tick", "reachPills", 0.0],
    ["tick", "reachPills", 0.15],

    ["whoosh", "toApprove", -0.1, 0.8],
    ["alert", "approveNums", 0.2, 0.9],
    ["typing", "typeStart", 0.0, "typeEnd"],
    ["click", "click2", 0.0],

    ["ticks", "tiles", 0.0, 8, 0.1],
    ["chime", "toMorning", 0.3, 0.7, -4],
    ["sent", "toEnd", 0.25, 0.8, 0]
  ],
  "score": {
    "piece": "Original, for this film: A minor to C major at 120 BPM, one piano figure from the first frame to the last",
    "bar": 2.0,
    "swing": 0.5,
    "fadeOut": 2.6,
    "ease": 0.5,
    "arrivals": false,
    "figure": [0, 1, 2, 3, 4, 3, 2, 1],
    "echo": {"piano": 0.08, "arp": 0.18, "lead": 0.4},
    "levels": {"piano": -21, "pad": -27, "arp": -30, "drums": -19, "bass": -20, "lead": -23},
    "hits": [
      ["riser", 8.0, 0.6, 2.0], ["impact", 8.0, 1.0], ["crash", 8.0, 0.5],
      ["crash", 14.0, 0.3],
      ["riser", 44.0, 0.5, 1.0], ["impact", 44.0, 0.7], ["crash", 44.0, 0.45],
      ["crash", 48.0, 0.35],
      ["crash", 56.0, 0.25]
    ],
    "sections": [
      {"name": "the night", "energy": "dark", "at": 0, "bars": 3, "figureStep": 0.5, "chords": ["Am9", "Am9", "Fmaj9"]},
      {"name": "the work hasn't stopped", "energy": "build", "bars": 1, "chords": ["E7sus4|E7"]},
      {"name": "meet Charlie", "energy": "reveal", "bars": 3, "chords": ["Am", "F", "G"]},
      {"name": "what it does", "energy": "drive", "bars": 14, "chords": ["Am", "F", "C", "G"],
        "lead": [
          [0, "E5", 1.5], [1.5, "D5", 0.5], [2, "C5", 1], [3, "E5", 1], [4, "F5", 1.5], [5.5, "E5", 0.5], [6, "C5", 2],
          [8, "G5", 1.5], [9.5, "F5", 0.5], [10, "E5", 1], [11, "C5", 1], [12, "D5", 2], [14, "B4", 1], [15, "G4", 1],
          [16, "E5", 1.5], [17.5, "D5", 0.5], [18, "C5", 1], [19, "E5", 1], [20, "F5", 1.5], [21.5, "E5", 0.5], [22, "C5", 2],
          [24, "G5", 1.5], [25.5, "F5", 0.5], [26, "E5", 1], [27, "C5", 1], [28, "D5", 2], [30, "B4", 1], [31, "G4", 1],
          [32, "E5", 1.5], [33.5, "D5", 0.5], [34, "C5", 1], [35, "E5", 1], [36, "F5", 1.5], [37.5, "E5", 0.5], [38, "C5", 2],
          [40, "G5", 1.5], [41.5, "F5", 0.5], [42, "E5", 1], [43, "C5", 1], [44, "D5", 2], [46, "B4", 1], [47, "G4", 1],
          [48, "E5", 1.5], [49.5, "D5", 0.5], [50, "C5", 1], [51, "E5", 1], [52, "F5", 2], [54, "A5", 2]
        ]},
      {"name": "nothing leaves without a person", "energy": "hush", "bars": 1, "chords": ["Dm9"]},
      {"name": "asks", "energy": "drive", "bars": 2, "chords": ["F", "G"],
        "lead": [[0, "C5", 1.5], [1.5, "A4", 0.5], [2, "C5", 2], [4, "D5", 1.5], [5.5, "B4", 0.5], [6, "D5", 2]]},
      {"name": "what Charlie does", "energy": "drive", "bars": 2, "chords": ["Am", "G"],
        "lead": [[0, "A5", 2], [2, "G5", 1], [3, "E5", 1], [4, "D5", 2], [6, "B4", 2]]},
      {"name": "morning", "energy": "reveal", "bars": 2, "chords": ["Fmaj9", "G6"]},
      {"name": "home", "energy": "settle", "seconds": 4.0, "chords": ["Cmaj9"], "figure": null,
        "piano": [[0, "C2", 7], [0.06, "G2", 7], [0.12, "C3", 7], [0.18, "E3", 7], [0.24, "G3", 7], [0.3, "B3", 7], [0.36, "D4", 7], [0.42, "E4", 7]]}
    ]
  }
}
