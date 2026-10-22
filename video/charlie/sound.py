"""The film's soundtrack, synthesised: a slow pad, and a sound for each cue.

    python video/charlie/sound.py

Reads the cue list from cues.js, the same file the picture reads, and writes
soundtrack.wav (48 kHz, stereo) beside it. Nothing is sampled, so nothing is
licensed: every sound is made here from sines and filtered noise.
"""

import json
import re
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

HERE = Path(__file__).resolve().parent
RATE = 48_000
rng = np.random.default_rng(1907)

cues = json.loads(re.search(r"window\.CUES = (\{.*\})", (HERE / "cues.js").read_text(encoding="utf-8"), re.S).group(1))
DURATION = cues["duration"]
MOMENTS = cues["moments"]
mix = np.zeros((int(DURATION * RATE), 2))


def seconds(length):
    return np.arange(int(length * RATE)) / RATE


def band(signal, low, high, order=2):
    return sosfilt(butter(order, [low, high], btype="band", fs=RATE, output="sos"), signal)


def lowpass(signal, cutoff, order=2):
    return sosfilt(butter(order, cutoff, btype="low", fs=RATE, output="sos"), signal)


def place(sound, at, gain=1.0, pan=0.0):
    """Adds a mono sound at `at` seconds, panned -1 (left) to 1 (right)."""
    start = int(at * RATE)
    if start >= len(mix):
        return
    sound = sound[: len(mix) - start] * gain
    mix[start : start + len(sound), 0] += sound * np.sqrt((1 - pan) / 2)
    mix[start : start + len(sound), 1] += sound * np.sqrt((1 + pan) / 2)


# ── The pad: four chords, slow, warm, under everything ─────────────────────
CHORDS = [
    [110.0, 164.81, 220.0, 261.63, 329.63],  # A minor
    [87.31, 130.81, 220.0, 261.63, 329.63],  # F major 7
    [130.81, 196.0, 261.63, 293.66, 392.0],  # C add 9
    [98.0, 146.83, 246.94, 293.66, 392.0],  # G
]
t = seconds(DURATION)
pad = np.zeros_like(t)
span = DURATION / len(CHORDS)
for index, chord in enumerate(CHORDS):
    centre = (index + 0.5) * span
    # Each chord swells in and out over its span, overlapping the next by two seconds.
    window = np.clip(1 - np.abs(t - centre) / (span / 2 + 1.5), 0, 1) ** 1.5
    voice = np.zeros_like(t)
    for number, frequency in enumerate(chord):
        level = 1.0 if number == 0 else 0.55
        for detune in (0.997, 1.003):
            voice += level * np.sin(2 * np.pi * frequency * detune * t + number)
        voice += 0.12 * level * np.sin(2 * np.pi * frequency * 2 * t)
    pad += voice * window
pad = lowpass(pad, 1400)
pad *= 0.85 + 0.15 * np.sin(2 * np.pi * 0.07 * t)
fade = np.minimum(1, t / 2.5) * np.minimum(1, (DURATION - t) / 3.0)
pad *= fade / np.max(np.abs(pad)) * 0.16
mix[:, 0] += pad
mix[:, 1] += np.roll(pad, int(0.011 * RATE))

# A quiet pulse while Charlie works: from the first page to the morning.
pulse_start, pulse_end = MOMENTS["email"], MOMENTS["toEnd"]
beat = 60 / 96
for at in np.arange(pulse_start, pulse_end, beat):
    k = seconds(0.35)
    thump = np.sin(2 * np.pi * (52 + 30 * np.exp(-k * 30)) * k) * np.exp(-k * 11)
    place(thump, at, 0.11)
    k = seconds(0.06)
    hat = band(rng.standard_normal(len(k)), 6000, 11000) * np.exp(-k * 70)
    place(hat, at + beat / 2, 0.018, 0.3)


# ── The cues ───────────────────────────────────────────────────────────────
def chime():
    k = seconds(1.6)
    tone = np.zeros_like(k)
    for delay, frequency in ((0.0, 659.25), (0.12, 987.77)):
        local = np.clip(k - delay, 0, None)
        tone += np.sin(2 * np.pi * frequency * local) * np.exp(-local * 3.2) * (k >= delay)
    return tone * 0.5


def whoosh():
    k = seconds(0.7)
    noise = rng.standard_normal(len(k))
    envelope = np.sin(np.pi * np.clip(k / 0.7, 0, 1)) ** 2
    return (0.6 * band(noise, 300, 2400) + 0.4 * band(noise, 2400, 7000)) * envelope * 0.5


def tick():
    k = seconds(0.05)
    return np.sin(2 * np.pi * 1760 * k) * np.exp(-k * 120) * 0.5


def pop():
    k = seconds(0.18)
    return np.sin(2 * np.pi * (520 + 380 * np.exp(-k * 40)) * k) * np.exp(-k * 26) * 0.55


def click():
    k = seconds(0.06)
    body = np.sin(2 * np.pi * 180 * k) * np.exp(-k * 90)
    edge = band(rng.standard_normal(len(k)), 2000, 8000) * np.exp(-k * 260)
    return body * 0.6 + edge * 0.5


def swell():
    k = seconds(1.2)
    return lowpass(rng.standard_normal(len(k)), 900) * (k / 1.2) ** 2 * np.exp(-np.clip(k - 1.0, 0, None) * 30) * 0.25


def alert():
    k = seconds(0.9)
    tone = np.zeros_like(k)
    for delay, frequency in ((0.0, 392.0), (0.16, 349.23)):
        local = np.clip(k - delay, 0, None)
        tone += np.sin(2 * np.pi * frequency * local) * np.exp(-local * 5) * (k >= delay)
    return tone * 0.4


def sent():
    k = seconds(1.8)
    tone = np.zeros_like(k)
    for delay, frequency in ((0.0, 523.25), (0.1, 659.25), (0.2, 783.99), (0.3, 1046.5)):
        local = np.clip(k - delay, 0, None)
        tone += np.sin(2 * np.pi * frequency * local) * np.exp(-local * 3.5) * (k >= delay)
    return tone * 0.32


def bloom():
    k = seconds(4.0)
    tone = np.zeros_like(k)
    for frequency in (130.81, 196.0, 261.63, 329.63, 392.0):
        tone += np.sin(2 * np.pi * frequency * k)
    envelope = np.minimum(1, k / 0.8) * np.exp(-np.clip(k - 0.8, 0, None) * 0.9)
    return lowpass(tone, 1800) * envelope * 0.12


SOUNDS = {"chime": chime, "whoosh": whoosh, "tick": tick, "pop": pop, "click": click, "swell": swell, "alert": alert, "sent": sent, "bloom": bloom}
for kind, moment, offset in cues["sounds"]:
    at = MOMENTS[moment] + offset
    if kind == "rows":
        for row in range(13):
            place(tick(), at + row * 0.18, 0.35, -0.4 + row * 0.06)
    elif kind == "typing":
        key = at
        while key < MOMENTS["typeEnd"]:
            k = seconds(0.03)
            stroke = band(rng.standard_normal(len(k)), 1500, 6500) * np.exp(-k * 180)
            place(stroke, key, rng.uniform(0.18, 0.3), rng.uniform(-0.2, 0.2))
            key += rng.uniform(0.032, 0.05)
    else:
        place(SOUNDS[kind](), at, 1.0, {"whoosh": 0.25, "pop": 0.15, "tick": 0.1}.get(kind, 0.0))

# Master: a soft clip, then -1 dBFS.
mix = np.tanh(mix * 1.4) / np.tanh(1.4)
mix *= 10 ** (-1 / 20) / np.max(np.abs(mix))
wavfile.write(HERE / "soundtrack.wav", RATE, (mix * 32767).astype(np.int16))
print("wrote soundtrack.wav", f"{DURATION}s")
