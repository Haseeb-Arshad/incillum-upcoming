"""Lays a new soundtrack under a finished film without touching its picture.

    python mux_audio.py <film.mp4> <soundtrack.wav> [out.mp4] [--lufs -16]

The video stream is copied, not re-encoded, so the picture is bit-for-bit the
one already checked. The audio is normalised in two passes of ffmpeg's
loudnorm (measure, then apply linearly, so nothing pumps) to the target
integrated loudness, with a true peak of -1.5 dBTP, and encoded as AAC. The
file is written beside the original and moved over it only when it is whole.
"""

import json
import re
import subprocess
import sys
import time
from pathlib import Path

args = [a for a in sys.argv[1:] if not a.startswith("--")]
lufs = float(sys.argv[sys.argv.index("--lufs") + 1]) if "--lufs" in sys.argv else -16.0
if "--lufs" in sys.argv:
    args.remove(sys.argv[sys.argv.index("--lufs") + 1])
film, wav = Path(args[0]), Path(args[1])
out = Path(args[2]) if len(args) > 2 else film

target = f"I={lufs}:TP=-1.5:LRA=11"
probe = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(wav), "-af", f"loudnorm={target}:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
measured = json.loads(re.findall(r"\{[^{}]*\}", probe)[-1])
second = (
    f"loudnorm={target}:measured_I={measured['input_i']}:measured_TP={measured['input_tp']}"
    f":measured_LRA={measured['input_lra']}:measured_thresh={measured['input_thresh']}"
    f":offset={measured['target_offset']}:linear=true"
)
partial = out.with_name(out.stem + ".partial" + out.suffix)
subprocess.run(
    ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", str(film), "-i", str(wav),
     "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-af", second, "-ar", "48000",
     "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", str(partial)],
    check=True,
)
# On Windows a scanner or a server may hold the old file for a moment: try again before giving up.
for attempt in range(20):
    try:
        partial.replace(out)
        break
    except PermissionError:
        if attempt == 19:
            raise SystemExit(f"{out} is held open by another process; the new film is at {partial}")
        time.sleep(0.5)
print(f"wrote {out}: picture copied, audio at {lufs} LUFS (was {measured['input_i']})")
