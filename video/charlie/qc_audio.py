"""Checks a film's soundtrack without listening to it.

    python qc_audio.py <composition dir> [soundtrack.wav]

Prints the integrated loudness and true peak (ffmpeg's EBU R128 meter), a
loudness curve second by second, and writes <dir>/frames/soundtrack.png: the
spectrogram with every moment in cues.js drawn on it, and the level under it.
A section that should lift and does not, a cue lost under the music, a hole,
a clip — all of them show on the picture.
"""

import json
import re
import subprocess
import sys
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from scipy.io import wavfile
from scipy.signal import spectrogram

HERE = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
WAV = Path(sys.argv[2]) if len(sys.argv) > 2 else HERE / "soundtrack.wav"
cues = json.loads(re.search(r"window\.CUES\s*=\s*(\{.*\})", (HERE / "cues.js").read_text(encoding="utf-8"), re.S).group(1))

meter = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(WAV), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
summary = meter[meter.rfind("Summary:") :]
integrated = re.search(r"I:\s+(-?[\d.]+) LUFS", summary)
peak = re.search(r"Peak:\s+(-?[\d.]+) dBFS", summary)
print(f"integrated {integrated[1] if integrated else '?'} LUFS, true peak {peak[1] if peak else '?'} dBFS")

rate, data = wavfile.read(WAV)
mono = data.astype(np.float32).mean(axis=1) / 32768 if data.ndim > 1 else data.astype(np.float32) / 32768
window = rate // 2
levels = [20 * np.log10(np.sqrt(np.mean(mono[i : i + window] ** 2)) + 1e-9) for i in range(0, len(mono) - window + 1, window)]
print("level every half second (dBFS RMS):")
for row in range(0, len(levels), 10):
    print(f"  {row / 2:5.1f}s " + " ".join(f"{value:5.1f}" for value in levels[row : row + 10]))
clipped = int(np.sum(np.abs(mono) > 0.999))
print("samples at full scale:", clipped)

f, t, power = spectrogram(mono, rate, nperseg=2048, noverlap=1536)
keep = f <= 12000
fig, (top, bottom) = plt.subplots(2, 1, figsize=(18, 7), height_ratios=[3, 1], sharex=True)
top.pcolormesh(t, f[keep], 10 * np.log10(power[keep] + 1e-12), shading="auto", cmap="magma", vmin=-110, vmax=-30)
top.set_yscale("symlog", linthresh=200)
top.set_ylabel("Hz")
for name, at in cues["moments"].items():
    for axis in (top, bottom):
        axis.axvline(at, color="white" if axis is top else "#888", lw=0.6, alpha=0.7)
    top.text(at, 11000, name, rotation=90, color="white", fontsize=7, va="top")
# Section starts, laid end to end as the score engine lays them.
score = cues.get("score", {})
cursor = 0.0
for section in score.get("sections", []):
    start = float(section.get("at", cursor))
    bottom.axvline(start, color="#c60", lw=1.2)
    cursor = start + (float(section["seconds"]) if "seconds" in section else float(section.get("bars", 0)) * float(score.get("bar", 0)))
bottom.plot(np.arange(len(levels)) / 2 + 0.25, levels, color="#222")
bottom.set_ylabel("dBFS")
bottom.set_xlabel("seconds")
fig.tight_layout()
out = HERE / "frames"
out.mkdir(exist_ok=True)
fig.savefig(out / "soundtrack.png", dpi=90)
print("wrote", out / "soundtrack.png")
