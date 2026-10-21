#!/usr/bin/env bash
# Encode the two desk photographs under the home page's tabs
# (`components/how-it-works.tsx`).
#
# Same rules as `encode-night.sh`: run once, by hand, and commit the output.
#
# Both are the night plate's own desk, seen from directly above and empty, so
# the built documents can be laid on them and nothing in a photograph has to be
# legible. The night frame was generated with `night-source.png` as its
# reference, for the wood, the lamp and the grade; the morning frame with the
# night frame and `glass-morning-source.png`, so it is the same desk in the
# morning plate's overcast light, the lamp still on. The sources are kept as
# quality-95 JPEG at the generator's full 2336 × 1744: wood grain has nothing a
# lossless copy would keep that this one loses, at a fifth of the size.
#
# Widths match the `srcSet` in the component. The panel is at most about 58vw
# wide, so 1600 covers a 2× display at 1380px.
set -euo pipefail

OUT=public/how
mkdir -p "$OUT"

for LIGHT in night morning; do
  SRC="design/how-desk-$LIGHT-source.jpg"
  for W in 1600 1120 720; do
    ffmpeg -hide_banner -loglevel error -y -i "$SRC" \
      -vf "scale=$W:-2:flags=lanczos" \
      -c:v libaom-av1 -crf 26 -cpu-used 2 -still-picture 1 -pix_fmt yuv420p10le \
      "$OUT/desk-$LIGHT-$W.avif"

    ffmpeg -hide_banner -loglevel error -y -i "$SRC" \
      -vf "scale=$W:-2:flags=lanczos" \
      -c:v libwebp -quality 80 -compression_level 6 \
      "$OUT/desk-$LIGHT-$W.webp"
  done

  ffmpeg -hide_banner -loglevel error -y -i "$SRC" \
    -vf "scale=1600:-2:flags=lanczos" -q:v 4 "$OUT/desk-$LIGHT-1600.jpg"
done

ls -la "$OUT" | awk 'NR>3 {printf "%-24s %6.0f kB\n", $9, $5/1024}'
