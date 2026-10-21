#!/usr/bin/env bash
# Encode the one photograph on /glass: the machined bracket from line 01,
# lying on the desk among the documents.
#
# Same rules as `encode-night.sh`: run once, by hand, and commit the output.
#
# The source is a generated studio photograph on a pure white sweep. It is
# shown with `mix-blend-mode: multiply`, so the white drops out against the
# desk and only the part and its contact shadow remain — which is why the
# crop keeps a margin of white rather than cutting the part out. A cutout
# would lose the shadow, and the shadow is what puts it on the desk.
set -euo pipefail

SRC=design/glass-bracket-source.png
OUT=public/glass
mkdir -p "$OUT"

# Square crop around the part and its shadow, read off the source once, and a
# curve that takes the sweep from 246 to pure white. `multiply` leaves pure
# white exactly neutral; the generated sweep sits at 250–254, which multiplies
# to a box one or two levels darker than the desk — faint, and exactly the
# kind of edge a reader's eye finds.
CROP="crop=1089:1089:103:78,curves=all='0/0 0.9/0.9 0.965/1 1/1'"

for W in 720 440; do
  ffmpeg -hide_banner -loglevel error -y -i "$SRC" \
    -vf "$CROP,scale=$W:-2:flags=lanczos" \
    -c:v libaom-av1 -crf 22 -cpu-used 2 -still-picture 1 -pix_fmt yuv420p10le \
    "$OUT/bracket-$W.avif"

  ffmpeg -hide_banner -loglevel error -y -i "$SRC" \
    -vf "$CROP,scale=$W:-2:flags=lanczos" \
    -c:v libwebp -quality 84 -compression_level 6 \
    "$OUT/bracket-$W.webp"
done

ffmpeg -hide_banner -loglevel error -y -i "$SRC" \
  -vf "$CROP,scale=720:-2:flags=lanczos" -q:v 3 "$OUT/bracket-720.jpg"

ls -la "$OUT" | awk 'NR>3 {printf "%-22s %6.0f kB\n", $9, $5/1024}'

# The morning plate: the night plate's own room at 08:04, generated from the
# night source as its reference so the two frames agree — same lamp, same
# desk, same quotation, same empty chair. Overcast, on purpose: the first one
# had a low orange sun, which read as evening and spent a sky's worth of the
# signal's hue. Generated at 16:7, the frame's own shape on a wide screen, so
# nothing is cropped there. It is encoded the way the night is: AVIF and WebP
# at four widths, one JPEG fallback.
#
# `delogo` interpolates over the one mark in the frame — a faint, illegible
# wordmark the generator put on the monitor's bezel. Illegible is not the same
# as absent, and the frame carries no brand.
MORNING=design/glass-morning-source.png
CLEAN="delogo=x=1424:y=573:w=30:h=14"
for W in 1896 1280 900 640; do
  ffmpeg -hide_banner -loglevel error -y -i "$MORNING" \
    -vf "$CLEAN,scale=$W:-2:flags=lanczos" \
    -c:v libaom-av1 -crf 20 -cpu-used 2 -still-picture 1 -pix_fmt yuv420p10le \
    "$OUT/morning-$W.avif"

  ffmpeg -hide_banner -loglevel error -y -i "$MORNING" \
    -vf "$CLEAN,scale=$W:-2:flags=lanczos" \
    -c:v libwebp -quality 82 -compression_level 6 \
    "$OUT/morning-$W.webp"
done
ffmpeg -hide_banner -loglevel error -y -i "$MORNING" \
  -vf "$CLEAN" -q:v 4 "$OUT/morning-1896.jpg"

ls -la "$OUT" | awk 'NR>3 && /morning/ {printf "%-22s %6.0f kB\n", $9, $5/1024}'
