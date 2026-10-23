"""The soundtrack for a product film: an original score composed to the film's
cue sheet, and a sound for every cue.

    python video/charlie/sound.py      # writes video/charlie/soundtrack.wav

Reads <dir>/cues.js, the same file the picture reads:

  duration, moments   the film's clock
  sounds              [kind, moment, offset, ...] - a sound design cue each
  score               the music: a tempo grid, sections, chords, melodies
                      (see references/sound.md), or
  score.track         a licensed audio file to lay under the cues instead

Every sound is synthesised here from sines and filtered noise. Nothing is
sampled, so nothing needs a licence, and the music lands on the film's cuts
because it is written against the same clock.
"""

import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, oaconvolve, sosfilt

RATE = 48_000
HERE = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path(__file__).resolve().parent
rng = np.random.default_rng(1907)

source = (HERE / "cues.js").read_text(encoding="utf-8")
cues = json.loads(re.search(r"window\.CUES\s*=\s*(\{.*\})", source, re.S).group(1))
DURATION = float(cues["duration"])
MOMENTS = cues["moments"]
N = int(DURATION * RATE)


# ── Signal helpers ─────────────────────────────────────────────────────────
def seconds(length):
    return np.arange(max(1, int(length * RATE))) / RATE


def lowpass(signal, cutoff, order=2):
    return sosfilt(butter(order, min(cutoff, RATE / 2 - 100), btype="low", fs=RATE, output="sos"), signal, axis=0)


def highpass(signal, cutoff, order=2):
    return sosfilt(butter(order, cutoff, btype="high", fs=RATE, output="sos"), signal, axis=0)


def bandpass(signal, low, high, order=2):
    return sosfilt(butter(order, [low, min(high, RATE / 2 - 100)], btype="band", fs=RATE, output="sos"), signal, axis=0)


def db(value):
    return 10 ** (value / 20)


def fade_edges(sound, attack=0.004, release=0.03):
    """Ramps the first and last few milliseconds, so no note starts or stops with a click."""
    sound = sound.copy()
    a = min(len(sound) // 2, int(attack * RATE))
    r = min(len(sound) // 2, int(release * RATE))
    if a:
        sound[:a] *= np.linspace(0, 1, a)
    if r:
        sound[-r:] *= np.linspace(1, 0, r)
    return sound


class Bus:
    """A stereo track. Sounds are added at a time, with a gain and an equal-power pan."""

    def __init__(self):
        self.x = np.zeros((N, 2), np.float32)

    def add(self, sound, at, gain=1.0, pan=0.0):
        start = int(round(at * RATE))
        if start >= N or gain == 0:
            return
        if start < 0:
            sound, start = sound[-start:], 0
        sound = np.asarray(sound[: N - start], np.float32) * gain
        if sound.ndim == 1:
            angle = (np.clip(pan, -1, 1) + 1) * np.pi / 4
            self.x[start : start + len(sound), 0] += sound * np.cos(angle)
            self.x[start : start + len(sound), 1] += sound * np.sin(angle)
        else:
            self.x[start : start + len(sound)] += sound

    def level(self, target_db):
        """Scales the bus so its RMS, over the stretches where it plays, is `target_db` dBFS."""
        active = np.abs(self.x).max(axis=1) > 1e-4
        if active.any():
            rms = np.sqrt(np.mean(self.x[active] ** 2))
            self.x *= db(target_db) / max(rms, 1e-9)
        return self


# ── Notes and chords ───────────────────────────────────────────────────────
PITCH = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
ACCIDENTAL = {"#": 1, "b": -1, "": 0}
QUALITIES = {
    "": [0, 4, 7], "m": [0, 3, 7], "5": [0, 7],
    "maj7": [0, 4, 7, 11], "maj9": [0, 4, 7, 11, 14], "maj7#11": [0, 4, 7, 11, 18],
    "m7": [0, 3, 7, 10], "m9": [0, 3, 7, 10, 14], "m11": [0, 3, 7, 10, 14, 17], "m6": [0, 3, 7, 9],
    "7": [0, 4, 7, 10], "9": [0, 4, 7, 10, 14], "7sus4": [0, 5, 7, 10],
    "6": [0, 4, 7, 9], "69": [0, 4, 7, 9, 14], "add9": [0, 4, 7, 14], "madd9": [0, 3, 7, 14],
    "sus2": [0, 2, 7], "sus4": [0, 5, 7],
}


def pitch_class(name):
    return (PITCH[name[0]] + ACCIDENTAL[name[1:]]) % 12


def midi(note):
    """'E4' -> 64, 'Bb3' -> 58."""
    m = re.fullmatch(r"([A-G])([#b]?)(-?\d)", note)
    return 12 * (int(m[3]) + 1) + PITCH[m[1]] + ACCIDENTAL[m[2]]


def hz(number):
    return 440.0 * 2 ** ((number - 69) / 12)


def parse_chord(symbol):
    """'Am9', 'C69', 'G6/B', 'Fmaj7/C' -> (root pitch class, intervals, bass pitch class)."""
    main, _, slash = symbol.partition("/")
    m = re.fullmatch(r"([A-G][#b]?)(.*)", main)
    root = pitch_class(m[1])
    return root, QUALITIES[m[2]], pitch_class(slash) if slash else root


def voice(root, intervals, previous):
    """Four voices between E3 and G5, led from the previous chord by the smallest total move."""
    tones = [(root + i) % 12 for i in intervals]
    if len(tones) > 4 and 7 in intervals:
        tones.remove((root + 7) % 12)
    tones = tones[:5]
    base = sorted(52 + (t - 52) % 12 for t in tones)
    candidates = []
    for r in range(len(base)):
        candidate = sorted(base[r:] + [n + 12 for n in base[:r]])
        if candidate[-1] <= 79:
            candidates.append(candidate)
    if not previous:
        return min(candidates, key=lambda c: abs(np.mean(c) - 62))
    return min(candidates, key=lambda c: abs(np.mean(c) - np.mean(previous)) + 0.25 * abs(c[-1] - previous[-1]))


def bass_note(pc):
    return 36 + (pc - 36) % 12  # C2..B2


# ── Instruments ────────────────────────────────────────────────────────────
TABLE = 4096
_tables = {}


def saw_table(harmonics):
    """One cycle of a band-limited saw, with Lanczos smoothing so it does not ring."""
    if harmonics not in _tables:
        phase = np.arange(TABLE + 1) / TABLE
        k = np.arange(1, harmonics + 1)
        sigma = np.sinc(k / (harmonics + 1))
        _tables[harmonics] = (np.sin(2 * np.pi * np.outer(phase, k)) * (sigma / k)).sum(axis=1)
    return _tables[harmonics]


def saw(frequency, t):
    table = saw_table(int(min(48, 15000 // frequency)))
    phase = (frequency * t + rng.random()) % 1.0
    return np.interp(phase * TABLE, np.arange(TABLE + 1), table)


def pad_chord(notes, length, cutoff, attack=0.7, release=0.9):
    """Detuned saws, three to a note and spread across the field, through a low-pass."""
    t = seconds(length + release)
    out = np.zeros((len(t), 2))
    for number in notes:
        f = hz(number)
        for cents, pan in ((-7, -0.7), (0, 0.0), (7, 0.7)):
            tone = saw(f * 2 ** (cents / 1200), t)
            angle = (pan + 1) * np.pi / 4
            out[:, 0] += tone * np.cos(angle)
            out[:, 1] += tone * np.sin(angle)
    env = np.minimum(1, t / attack) * np.clip((length + release - t) / release, 0, 1)
    return highpass(lowpass(out * env[:, None], cutoff, 2), 170, 2)


def electric_piano(f, length, velocity):
    """FM tine: a 1:1 pair whose index falls as the note sounds, and a high bell on the strike."""
    t = seconds(length + 0.25)
    index = 1.6 * velocity * np.exp(-t * 4.5) + 0.25
    tone = np.sin(2 * np.pi * f * t + index * np.sin(2 * np.pi * f * t))
    tone += 0.12 * velocity * np.sin(2 * np.pi * f * 7.0 * t) * np.exp(-t * 14)
    env = (1 - np.exp(-t * 500)) * np.exp(-t * 0.9) * np.clip((length + 0.25 - t) / 0.25, 0, 1)
    return tone * env


def felt_piano(f, length, velocity):
    """Seven slightly stretched partials, the high ones dying first, a soft hammer, felt on top."""
    t = seconds(length + 1.6)
    tone = np.zeros_like(t)
    for n in range(1, 8):
        partial = n * f * np.sqrt(1 + 0.00035 * n * n)
        if partial > 16000:
            break
        tone += n ** -1.4 * np.sin(2 * np.pi * partial * t + rng.random() * 6.28) * np.exp(-t * (0.7 + 0.8 * n))
    tone = lowpass(tone, 1800 + 2600 * velocity)
    hammer = lowpass(rng.standard_normal(len(t)), 1100) * np.exp(-t * 80) * 0.18
    env = (1 - np.exp(-t * 300)) * np.clip((length + 1.6 - t) / 1.2, 0, 1)
    return (tone + hammer) * env * velocity


def pluck(f, velocity, brightness=0.5, length=0.42):
    """A plucked saw: each harmonic decays faster than the one below it, as a closing filter would."""
    t = seconds(length)
    tone = np.zeros_like(t)
    spread = 7.5 - 5.0 * brightness
    for n in range(1, 11):
        if n * f > 15000:
            break
        tone += np.sin(2 * np.pi * n * f * t) / n * np.exp(-t * (5 + spread * n))
    return fade_edges(tone * velocity, 0.002, 0.05)


def mallet(f, length, velocity):
    """Marimba-like: the fundamental, a fourth partial and a tenth, each shorter, and a soft sine under long notes."""
    t = seconds(length + 1.2)
    tone = np.sin(2 * np.pi * f * t) * np.exp(-t * 2.4)
    tone += 0.32 * np.sin(2 * np.pi * f * 3.98 * t) * np.exp(-t * 9)
    tone += 0.1 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 22)
    tone += 0.2 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 4)
    hold = np.clip((length - t) / 0.2, 0, 1) * np.minimum(1, t / 0.08)
    tone += 0.22 * np.sin(2 * np.pi * f * t + 0.003 * np.sin(2 * np.pi * 5 * t) * 200) * hold
    return fade_edges(tone * velocity * (1 - np.exp(-t * 900)), 0.001, 0.2)


def bass(f, length, velocity, sub=False):
    t = seconds(length + 0.06)
    if sub:
        tone = np.sin(2 * np.pi * f * t)
        env = np.minimum(1, t / 0.15) * np.clip((length + 0.06 - t) / 0.4, 0, 1)
    else:
        tone = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t) + 0.1 * np.sin(2 * np.pi * 3 * f * t)
        tone = np.tanh(1.6 * tone) / np.tanh(1.6)
        env = (1 - np.exp(-t * 250)) * (0.75 + 0.25 * np.exp(-t * 6)) * np.clip((length + 0.06 - t) / 0.06, 0, 1)
    return tone * env * velocity


def kick(velocity=1.0):
    t = seconds(0.5)
    phase = 2 * np.pi * (46 * t + 95 / 30 * (1 - np.exp(-t * 30)))
    body = np.sin(phase) * np.exp(-t * 6.5)
    click = highpass(rng.standard_normal(len(t)), 2500) * np.exp(-t * 400) * 0.25
    return np.tanh(1.8 * (body + click)) * velocity


def clap(velocity=1.0):
    t = seconds(0.45)
    noise = bandpass(rng.standard_normal(len(t)), 900, 5200)
    env = np.zeros_like(t)
    for delay in (0.0, 0.011, 0.022):
        local = np.clip(t - delay, 0, None)
        env += (t >= delay) * np.exp(-local * 140)
    env += (t >= 0.03) * np.exp(-np.clip(t - 0.03, 0, None) * 14) * 0.55
    body = np.sin(2 * np.pi * 185 * t) * np.exp(-t * 40) * 0.35
    return (noise * env + body) * velocity * 0.8


def snap(velocity=1.0):
    t = seconds(0.12)
    return (bandpass(rng.standard_normal(len(t)), 1800, 7000) * np.exp(-t * 60) + 0.4 * np.sin(2 * np.pi * 1650 * t) * np.exp(-t * 90)) * velocity


def hat(velocity=1.0, open_=False):
    t = seconds(0.32 if open_ else 0.06)
    return highpass(rng.standard_normal(len(t)), 7500, 3) * np.exp(-t * (11 if open_ else 75)) * velocity


def shaker(velocity=1.0):
    t = seconds(0.09)
    env = np.minimum(1, t / 0.012) * np.exp(-t * 55)
    return bandpass(rng.standard_normal(len(t)), 4500, 11000) * env * velocity


def crash(velocity=1.0):
    t = seconds(2.6)
    noise = rng.standard_normal(len(t))
    tone = highpass(noise, 4800, 2) * 0.7 + bandpass(noise, 2800, 9000) * 0.5
    return lowpass(tone, 12000) * np.exp(-t * 1.6) * (1 - np.exp(-t * 800)) * velocity


def impact(velocity=1.0):
    t = seconds(1.6)
    phase = 2 * np.pi * (36 * t + 26 / 3 * (1 - np.exp(-t * 3)))
    return np.sin(phase) * np.exp(-t * 2.2) * (1 - np.exp(-t * 300)) * velocity


def riser(length):
    """Noise that opens upward into the downbeat, with a quiet tone climbing under it, and a breath of silence before the hit."""
    t = seconds(length)
    x = t / length
    noise = rng.standard_normal(len(t))
    low, mid, high = bandpass(noise, 300, 1200), bandpass(noise, 1200, 4000), bandpass(noise, 4000, 11000)
    tone = low * (1 - x) ** 1.5 + mid * np.sin(np.pi * x) + high * x**2
    climb = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (2.5 * x)) / RATE) * 0.08
    env = x**2.2 * np.clip((length - t) / 0.03, 0, 1)
    return (tone * 0.6 + climb) * env


# ── The score ──────────────────────────────────────────────────────────────
# What plays in each kind of section. A section names one of these as its energy.
ENERGY = {
    "intro": dict(pad=1.0, cutoff=950, keys=None, bass=None, drums=None, arp=None),
    "verse": dict(pad=0.8, cutoff=1700, keys="comp", bass="verse", drums="verse", arp="late"),
    "chorus": dict(pad=0.7, cutoff=2600, keys="soft", bass="chorus", drums="chorus", arp="full"),
    "breakdown": dict(pad=1.0, cutoff=1300, keys="hold", bass="sub", drums=None, arp=None),
    "build": dict(pad=0.85, cutoff=1900, keys=None, bass="pulse", drums="build", arp="rise"),
    "end": dict(pad=1.0, cutoff=2200, keys="hold", bass="sub", drums=None, arp=None),
}
RANK = {"intro": 0, "breakdown": 1, "end": 1, "verse": 2, "build": 3, "chorus": 4}
# How loud each kind of section plays, so the piece has an arc: quiet at night, full when the work runs.
LOUDNESS = {"intro": (0.42, 0.42), "verse": (0.66, 0.7), "chorus": (1.0, 1.0), "breakdown": (0.5, 0.5), "build": (0.55, 0.95), "end": (0.62, 0.62)}
KEYS_RHYTHM = [(0.0, 1.5), (2.5, 1.0)]
BASS_RHYTHM = {
    "verse": [(0.0, 1.5, 0), (2.5, 1.0, 0), (3.5, 0.5, 12)],
    "chorus": [(0.0, 0.75, 0), (1.5, 0.5, 0), (2.0, 0.5, 12), (2.5, 0.75, 0), (3.5, 0.5, 7)],
}
ARP_ORDER = [0, 1, 2, 3, 4, 3, 2, 1]


def build_score(score, buses):
    bar = float(score["bar"])
    beat = bar / 4
    swing = float(score.get("swing", 0.55))
    kicks = []

    def at_beat(start, position):
        """A position in beats from `start`, with the off sixteenths pushed late by the swing."""
        sixteenth = round(position * 4)
        if abs(position * 4 - sixteenth) < 1e-6 and sixteenth % 2 == 1:
            position += (swing - 0.5) * 2 / 4
        return start + position * beat

    # Lay the sections end to end: each starts where the last ended unless it says `at`.
    sections, cursor = [], 0.0
    for raw in score["sections"]:
        start = float(raw.get("at", cursor))
        length = float(raw["seconds"]) if "seconds" in raw else float(raw["bars"]) * bar
        sections.append({**raw, "start": start, "end": min(start + length, DURATION)})
        cursor = start + length

    previous_voicing = []
    arc = []
    for index, section in enumerate(sections):
        style = ENERGY[section["energy"]]
        start, end = section["start"], section["end"]
        arc.append((start, end, *LOUDNESS[section["energy"]]))
        chords = section.get("chords", [])
        free = "seconds" in section
        span = (end - start) / max(1, len(chords)) if free else bar
        # Each chord entry may split its bar: "Gsus4|G".
        spans = []
        for i, entry in enumerate(chords if free else [chords[i % len(chords)] for i in range(int(np.ceil((end - start) / bar - 1e-6)))]):
            parts = entry.split("|")
            for j, symbol in enumerate(parts):
                s = start + i * span + j * span / len(parts)
                e = min(start + i * span + (j + 1) * span / len(parts), end)
                if s < end:
                    spans.append((s, e, symbol))

        bars_in_section = int(np.ceil((end - start) / bar - 1e-6))
        for s, e, symbol in spans:
            root, intervals, bass_pc = parse_chord(symbol)
            voicing = voice(root, intervals, previous_voicing)
            previous_voicing = voicing
            low = bass_note(bass_pc)
            # Pad: the voicing and the root an octave under it, overlapping the next chord as it fades.
            attack = 0.25 if style["drums"] else 0.8
            buses["pad"].add(pad_chord(voicing + [low + 12], e - s, style["cutoff"], attack), s, style["pad"])
            # Keys.
            if style["keys"] == "hold":
                for n in voicing:
                    buses["keys"].add(electric_piano(hz(n), e - s, 0.55), s + rng.uniform(0, 0.012), 1.0, (n - 64) / 24)
            elif style["keys"] in ("comp", "soft"):
                level = 1.0 if style["keys"] == "comp" else 0.55
                for position, length in KEYS_RHYTHM:
                    t0 = at_beat(s, position)
                    if t0 >= e - 0.05:
                        continue
                    for n in voicing:
                        buses["keys"].add(electric_piano(hz(n), min(length * beat, e - t0), 0.6), t0 + rng.uniform(0, 0.01), level, (n - 64) / 24)
            # Bass.
            if style["bass"] in BASS_RHYTHM:
                for position, length, step in BASS_RHYTHM[style["bass"]]:
                    t0 = at_beat(s, position)
                    if t0 < e - 0.05:
                        buses["bass"].add(bass(hz(low + step), min(length * beat, e - t0) * 0.92, 0.9), t0)
            elif style["bass"] == "sub":
                buses["bass"].add(bass(hz(low), e - s, 0.3, sub=True), s)
            elif style["bass"] == "pulse":
                eighths = int(round((e - s) / (beat / 2)))
                for k in range(eighths):
                    buses["bass"].add(bass(hz(low), beat / 2 * 0.8, 0.35 + 0.55 * k / max(1, eighths - 1)), s + k * beat / 2)
            # Arpeggio: sixteenths through the voicing, an octave up.
            if style["arp"]:
                bar_index = int(round((s - start) / bar))
                if style["arp"] == "late" and bar_index < max(1, bars_in_section // 2):
                    continue
                notes = voicing + [voicing[0] + 12]
                steps = int(round((e - s) / (beat / 4)))
                for k in range(steps):
                    t0 = at_beat(s, k / 4)
                    accent = 1.0 if k % 4 == 0 else 0.7 if k % 2 == 0 else 0.55
                    if style["arp"] == "rise":
                        brightness, gain = 0.15 + 0.8 * k / max(1, steps - 1), 0.3 + 0.7 * k / max(1, steps - 1)
                    else:
                        brightness, gain = (0.35, 0.7) if style["arp"] == "late" else (0.6, 1.0)
                    n = notes[ARP_ORDER[k % len(ARP_ORDER)] % len(notes)] + 12
                    buses["arp"].add(pluck(hz(n), accent * gain, brightness), t0, 1.0, 0.35 if k % 2 else -0.35)

        # Drums, bar by bar, and nothing past the section's end.
        def hit(sound, at, gain=1.0, pan=0.0, end=end):
            if at < end - 0.02:
                buses["drums"].add(sound, at, gain, pan)
                return True
            return False

        for b in range(bars_in_section):
            b0 = start + b * bar
            if b0 >= end - 0.05:
                break
            kind = style["drums"]
            last = b == bars_in_section - 1
            if kind == "verse":
                for position in (0.0, 2.5):
                    if hit(kick(0.85), at_beat(b0, position)):
                        kicks.append((at_beat(b0, position), 0.3))
                for position in (1.0, 3.0):
                    hit(snap(0.5), at_beat(b0, position) + 0.004, 1.0, 0.15)
                for k in range(16):
                    hit(shaker((0.55, 0.25, 0.4, 0.25)[k % 4] * rng.uniform(0.85, 1.1)), at_beat(b0, k / 4), 0.55, 0.45)
            elif kind == "chorus":
                for position in (0.0, 1.75, 2.5):
                    t0 = at_beat(b0, position)
                    if hit(kick(1.0 if position == 0 else 0.85), t0):
                        kicks.append((t0, 0.45))
                for position in (1.0, 3.0):
                    hit(clap(0.85), at_beat(b0, position) + 0.006, 1.0, -0.05)
                for position in (0.5, 1.5, 2.5, 3.5):
                    hit(hat(0.5, open_=position == 3.5), at_beat(b0, position) + rng.uniform(-0.004, 0.004), 0.7, 0.25)
                for k in range(16):
                    hit(shaker((0.6, 0.3, 0.45, 0.3)[k % 4] * rng.uniform(0.85, 1.1)), at_beat(b0, k / 4), 0.5, -0.4)
                if last and index + 1 < len(sections) and sections[index + 1]["energy"] != "chorus":
                    for k, position in enumerate((3.0, 3.25, 3.5, 3.75)):
                        hit(snap(0.3 + 0.12 * k), at_beat(b0, position), 1.0, 0.1)
            elif kind == "build":
                rolls = [2.25, 2.5, 2.75, 3.0, 3.25, 3.5, 3.625, 3.75, 3.875] if (end - start) <= bar + 1e-6 else [0, 1, 2, 2.5, 3, 3.25, 3.5, 3.75]
                for k, position in enumerate(rolls):
                    hit(clap(0.25 + 0.6 * k / len(rolls)), b0 + position * beat, 0.8, 0.05)

        # Melodies: the lead, and the felt piano's motif.
        for position, note, length in section.get("lead", []):
            buses["lead"].add(mallet(hz(midi(note)), length * beat, 0.9), start + position * beat + rng.uniform(0, 0.006), 1.0, 0.08)
        for position, note, length in section.get("piano", []):
            buses["piano"].add(felt_piano(hz(midi(note)), length * beat, 0.7), start + position * beat, 1.0, (midi(note) - 64) / 30)

        # Arrivals: a riser into a section with more energy than the last, and a hit on its downbeat.
        if index > 0:
            before = sections[index - 1]
            rise = RANK[section["energy"]] - RANK[before["energy"]]
            if rise > 0 and "build" not in (before["energy"], section["energy"]):
                length = min(bar if section["energy"] == "chorus" else bar / 2, start - before["start"])
                buses["fx"].add(riser(length), start - length, 0.55 if section["energy"] == "chorus" else 0.35)
            if section["energy"] == "build":
                buses["fx"].add(riser(end - start), start, 0.55)
            if section["energy"] in ("chorus", "end") or (section["energy"] == "verse" and before["energy"] == "intro"):
                buses["fx"].add(impact(0.9), start)
                if section["energy"] != "verse":
                    buses["fx"].add(crash(0.5 if section["energy"] == "chorus" else 0.35), start, 1.0, 0.2)
    return kicks, arc


def envelope(arc, fade_in=1.2):
    """The arc as a gain curve, eased over a quarter second at each section's edge, and faded in from silence."""
    gain = np.ones(N, np.float32)
    t = np.arange(N) / RATE
    for start, end, first, last in arc:
        inside = (t >= start) & (t < end)
        gain[inside] = first + (last - first) * (t[inside] - start) / max(end - start, 1e-6)
    width = int(0.25 * RATE)
    smooth = oaconvolve(np.pad(gain, width, mode="edge"), np.hanning(width) / np.hanning(width).sum(), mode="same")[width:-width]
    return (smooth * np.minimum(1, t / fade_in))[:, None].astype(np.float32)


def sidechain(kicks):
    """The music ducks under each kick and breathes back, so the beat has room without being loud."""
    duck = np.ones(N, np.float32)
    shape = seconds(0.36)
    for at, depth in kicks:
        start = int(at * RATE)
        if start >= N:
            continue
        env = 1 - depth * np.exp(-shape / 0.12) * np.minimum(1, shape / 0.004)
        end = min(N, start + len(env))
        duck[start:end] = np.minimum(duck[start:end], env[: end - start])
    return duck[:, None]


def impulse(length=2.6, rt60=2.1):
    t = seconds(length)
    ir = rng.standard_normal((len(t), 2)) * np.exp(-6.91 * t / rt60)[:, None]
    ir = lowpass(ir, 6000, 2)
    ir[: int(0.015 * RATE)] = 0  # pre-delay
    for delay, gain in ((0.019, 0.5), (0.027, 0.35), (0.041, 0.25)):
        ir[int(delay * RATE), 0] += gain
        ir[int((delay + 0.004) * RATE), 1] += gain
    return ir / np.sqrt(np.sum(ir**2) / 2)


def reverb(signal):
    ir = impulse()
    wet = np.stack([oaconvolve(signal[:, c], ir[:, c])[:N] for c in (0, 1)], axis=1)
    return highpass(wet, 180, 2).astype(np.float32)


def delay(signal, step, feedback=0.38):
    mono = bandpass(signal.mean(axis=1), 300, 3500)
    out = np.zeros((N, 2), np.float32)
    shift = int(step * RATE)
    for k in range(1, 7):
        offset = shift * k
        if offset >= N:
            break
        out[offset:, k % 2] += mono[: N - offset] * feedback ** (k - 1) * 0.6
    return out


# ── The cue sounds ─────────────────────────────────────────────────────────
def chime():
    k = seconds(1.6)
    tone = np.zeros_like(k)
    for delay_, frequency in ((0.0, 659.25), (0.12, 987.77)):
        local = np.clip(k - delay_, 0, None)
        tone += np.sin(2 * np.pi * frequency * local) * np.exp(-local * 3.2) * (k >= delay_)
    return tone * 0.5


def whoosh():
    k = seconds(0.7)
    noise = rng.standard_normal(len(k))
    envelope = np.sin(np.pi * np.clip(k / 0.7, 0, 1)) ** 2
    return (0.6 * bandpass(noise, 300, 2400) + 0.4 * bandpass(noise, 2400, 7000)) * envelope * 0.5


def tick():
    k = seconds(0.05)
    return np.sin(2 * np.pi * 1760 * k) * np.exp(-k * 120) * 0.5


def pop():
    k = seconds(0.18)
    return np.sin(2 * np.pi * (520 + 380 * np.exp(-k * 40)) * k) * np.exp(-k * 26) * 0.55


def click():
    k = seconds(0.06)
    body = np.sin(2 * np.pi * 180 * k) * np.exp(-k * 90)
    edge = bandpass(rng.standard_normal(len(k)), 2000, 8000) * np.exp(-k * 260)
    return body * 0.6 + edge * 0.5


def swell():
    k = seconds(1.2)
    return lowpass(rng.standard_normal(len(k)), 900) * (k / 1.2) ** 2 * np.exp(-np.clip(k - 1.0, 0, None) * 30) * 0.25


def alert():
    k = seconds(0.9)
    tone = np.zeros_like(k)
    for delay_, frequency in ((0.0, 392.0), (0.16, 349.23)):
        local = np.clip(k - delay_, 0, None)
        tone += np.sin(2 * np.pi * frequency * local) * np.exp(-local * 5) * (k >= delay_)
    return tone * 0.4


def sent():
    k = seconds(1.8)
    tone = np.zeros_like(k)
    for delay_, frequency in ((0.0, 523.25), (0.1, 659.25), (0.2, 783.99), (0.3, 1046.5)):
        local = np.clip(k - delay_, 0, None)
        tone += np.sin(2 * np.pi * frequency * local) * np.exp(-local * 3.5) * (k >= delay_)
    return tone * 0.32


def bloom():
    k = seconds(4.0)
    tone = np.zeros_like(k)
    for frequency in (130.81, 196.0, 261.63, 329.63, 392.0):
        tone += np.sin(2 * np.pi * frequency * k)
    envelope = np.minimum(1, k / 0.8) * np.exp(-np.clip(k - 0.8, 0, None) * 0.9)
    return lowpass(tone, 1800) * envelope * 0.12


SOUNDS = {"chime": chime, "whoosh": whoosh, "tick": tick, "pop": pop, "click": click, "swell": swell, "alert": alert, "sent": sent, "bloom": bloom}
PANS = {"whoosh": 0.25, "pop": 0.15, "tick": 0.1}


def lay_sounds(bus):
    for entry in cues.get("sounds", []):
        kind, moment, offset = entry[:3]
        at = MOMENTS[moment] + offset
        if kind in ("ticks", "rows"):
            count, spacing = (entry[3], entry[4]) if len(entry) > 4 else (13, 0.18)
            for row in range(count):
                bus.add(tick(), at + row * spacing, 0.35, -0.4 + row * 0.8 / max(1, count - 1))
        elif kind == "typing":
            until = MOMENTS[entry[3]] if len(entry) > 3 else MOMENTS.get("typeEnd", at + 2)
            key = at
            while key < until:
                k = seconds(0.03)
                stroke = bandpass(rng.standard_normal(len(k)), 1500, 6500) * np.exp(-k * 180)
                bus.add(stroke, key, rng.uniform(0.18, 0.3), rng.uniform(-0.2, 0.2))
                key += rng.uniform(0.032, 0.05)
        else:
            gain = entry[3] if len(entry) > 3 else 1.0
            bus.add(SOUNDS[kind](), at, gain, PANS.get(kind, 0.0))


def licensed_track(path, fade_in=0.0, fade_out=2.5):
    """A track the owner holds a licence for, decoded, trimmed to the film and faded."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "2", "-ar", str(RATE), "-"], capture_output=True, check=True).stdout
    music = np.frombuffer(raw, np.float32).reshape(-1, 2)[:N].copy()
    music = np.pad(music, ((0, N - len(music)), (0, 0)))
    t = np.arange(N) / RATE
    env = np.minimum(1, t / fade_in) if fade_in else np.ones(N)
    env = env * np.clip((DURATION - t) / fade_out, 0, 1)
    return music * env[:, None].astype(np.float32)


# ── Mix ────────────────────────────────────────────────────────────────────
score = cues.get("score")
sfx = Bus()
lay_sounds(sfx)
sfx.x = sfx.x * np.float32(db(-7) / max(np.abs(sfx.x).max(), 1e-9))  # cue peaks at -7 dBFS

if score and score.get("track"):
    music = licensed_track(HERE / score["track"], score.get("fadeIn", 0.0), score.get("fadeOut", 2.5))
    music *= db(score.get("trackGain", -15)) / max(np.sqrt(np.mean(music**2)), 1e-9)
    mix = music + sfx.x
elif score:
    buses = {name: Bus() for name in ("pad", "keys", "piano", "arp", "lead", "bass", "drums", "fx")}
    kicks, arc = build_score(score, buses)
    levels = {"pad": -25, "keys": -27, "piano": -23, "arp": -29, "lead": -22, "bass": -21, "drums": -21, "fx": -27}
    levels.update(score.get("levels", {}))
    for name, target in levels.items():
        buses[name].level(target)
    duck = sidechain(kicks)
    for name in ("pad", "keys", "arp", "bass"):
        buses[name].x *= duck
    send = buses["pad"].x * 0.35 + buses["keys"].x * 0.3 + buses["piano"].x * 0.45 + buses["lead"].x * 0.45 + buses["arp"].x * 0.3 + buses["drums"].x * 0.08 + sfx.x * 0.15
    echoes = delay(buses["lead"].x * 0.5 + buses["arp"].x * 0.35 + buses["piano"].x * 0.3, 0.75 * float(score["bar"]) / 4)
    music = sum(bus.x for name, bus in buses.items() if name != "fx") + reverb(send - sfx.x * 0.15) * db(-4) + echoes * db(-6)
    music = music * envelope(arc) + buses["fx"].x
    # A little out of the low mids, where pad, keys and bass pile up into mud.
    music = music - 0.3 * bandpass(music, 180, 400)
    mix = music + sfx.x + reverb(sfx.x) * db(-14)
    # The music fades at the very end; the last chord's tail goes with it.
    t = np.arange(N) / RATE
    mix *= np.clip((DURATION - t) / float(score.get("fadeOut", 2.0)), 0, 1)[:, None]
    for name, bus in buses.items():
        peak = np.abs(bus.x).max()
        print(f"  {name:6s} peak {20 * np.log10(max(peak, 1e-9)):6.1f} dBFS")
else:
    mix = sfx.x

mix = highpass(mix, 28, 2)
mix = np.tanh(mix * 1.3) / np.tanh(1.3)
mix *= db(-1) / max(np.abs(mix).max(), 1e-9)
wavfile.write(HERE / "soundtrack.wav", RATE, (np.clip(mix, -1, 1) * 32767).astype(np.int16))
print("wrote", HERE / "soundtrack.wav", f"{DURATION}s", "with score" if score else "cues only")
