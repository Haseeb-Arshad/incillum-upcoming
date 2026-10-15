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
