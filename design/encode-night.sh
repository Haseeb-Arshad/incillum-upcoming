#!/usr/bin/env bash
# Encode the night plate into the responsive set the page serves.
#
# Run once, by hand, and commit the output. A build-time image pipeline would be
# a native dependency carried on every install to re-encode one photograph that
# changes about never.
set -euo pipefail

SRC=design/night-source.png
OUT=public/night
mkdir -p "$OUT"

for W in 1672 1280 900 640; do
  # AVIF. cpu-used 2 is slow and worth it here: this runs once and the file
  # ships to every visitor. crf 16, not the 40 this started at: AV1 is so
  # efficient on a dark smooth image that 40 came out at 5 kB and destroyed the
  # one thing the picture is about — the ruled columns on the lit quotation,
  # which are the difference between a document and a beige rectangle.
  ffmpeg -hide_banner -loglevel error -y -i "$SRC" \
    -vf "scale=$W:-2:flags=lanczos" \
    -c:v libaom-av1 -crf 16 -cpu-used 2 -still-picture 1 -pix_fmt yuv420p10le \
    "$OUT/night-$W.avif"

  ffmpeg -hide_banner -loglevel error -y -i "$SRC" \
    -vf "scale=$W:-2:flags=lanczos" \
    -c:v libwebp -quality 82 -compression_level 6 \
    "$OUT/night-$W.webp"
done

# One JPEG, at the largest size, as the <img> fallback. Anything that reaches
# it has already failed to understand two modern formats and is not a browser
# worth shipping four sizes to.
ffmpeg -hide_banner -loglevel error -y -i "$SRC" \
  -vf "scale=1672:-2:flags=lanczos" -q:v 4 "$OUT/night-1672.jpg"

ls -la "$OUT" | awk 'NR>3 {printf "%-22s %6.0f kB\n", $9, $5/1024}'
