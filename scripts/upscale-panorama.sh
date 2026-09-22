#!/usr/bin/env bash
set -euo pipefail

input=${1:?Usage: upscale-panorama.sh INPUT OUTPUT.webp ENGINE MODEL_DIRECTORY [TILE]}
output=${2:?Output WebP path required}
engine=${3:?Real-ESRGAN ncnn Vulkan executable required}
models=${4:?Directory containing realesrgan-x4plus models required}
tile=${5:-128}
read -r width height < <(magick identify -format '%w %h\n' "$input")
if (( width != height * 2 )); then
  printf 'Expected a 2:1 equirectangular input, got %s x %s\n' "$width" "$height" >&2
  exit 1
fi

work_dir=$(mktemp -d)
trap 'rm -rf -- "$work_dir"' EXIT
padding=64
# Give the model context from across the panorama's horizontal seam.
magick "$input" -crop "${padding}x${height}+$((width-padding))+0" +repage "$work_dir/right.png"
magick "$input" -crop "${padding}x${height}+0+0" +repage "$work_dir/left.png"
magick "$work_dir/right.png" "$input" "$work_dir/left.png" +append "$work_dir/wrapped.png"
"$engine" -i "$work_dir/wrapped.png" -o "$work_dir/upscaled.png" \
  -m "$models" -n realesrgan-x4plus -s 4 -t "$tile" -g 0 -j 1:1:1 -f png
magick "$work_dir/upscaled.png" \
  -crop "$((width*4))x$((height*4))+$((padding*4))+0" +repage \
  -quality 88 -define webp:method=6 "$work_dir/final.webp"
mkdir -p "$(dirname "$output")"
cp "$work_dir/final.webp" "$output"
magick identify "$output"
