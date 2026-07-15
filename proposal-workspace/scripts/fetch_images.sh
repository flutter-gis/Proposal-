#!/bin/bash
# Fetch images sequentially by capturing stdout (writing to file with -o seems to fail)
set -e

OUT_DIR="/home/z/my-project/scripts/imgs"
mkdir -p "$OUT_DIR"

# Each entry: "filename|query"
QUERIES=(
  "bearbrook|Bear Brook State Park New Hampshire forest pond"
  "pawtuckaway|Pawtuckaway State Park New Hampshire lake boulder"
  "railway|Granite State Scenic Railway Lincoln New Hampshire vintage train"
  "dixville|Dixville Notch New Hampshire mountain cliffs sunset"
  "table_rock|Table Rock cliffs Dixville Notch New Hampshire granite face"
  "coleman|Coleman State Park New Hampshire cabin wilderness pond"
  "moose|Moose Alleghany wild moose road twilight New Hampshire"
  "bakery|French bakery pastry coffee shop cozy interior morning"
  "waterfall|New Hampshire waterfall cascade forest rocks"
  "franconia|Franconia Notch New Hampshire White Mountains foliage"
  "flume|Flume Gorge New Hampshire waterfall boardwalk"
  "mtwashington|Mount Washington New Hampshire White Mountains summit"
  "campfire|Romantic campfire evening forest wilderness night"
  "stargazing|Milky Way night sky dark sky wilderness stars"
  "canoe|Canoe paddle peaceful lake sunset reflection pine"
  "hiking|New England hiking trail forest pine trees scenic"
  "cabin|Rustic log cabin porch forest wilderness New England"
  "pemigewasset|Pemigewasset River White Mountains New Hampshire scenic"
  "balsams|Balsams Grand Resort Dixville Notch New Hampshire historic hotel"
  "cookout|Camp cooking cast iron skillet outdoor picnic table"
)

fetch_one() {
  local filename="$1"
  local query="$2"
  local outfile="$OUT_DIR/${filename}.json"
  if [ -f "$outfile" ] && [ -s "$outfile" ]; then
    if python3 -c "import json; d=json.load(open('$outfile')); assert d.get('success')" 2>/dev/null; then
      echo "[SKIP] $filename"
      return 0
    fi
  fi
  echo "[FETCH] $filename: $query"
  for attempt in 1 2 3; do
    local result
    result=$(z-ai image-search -q "$query" --count 3 --gl us --no-rank 2>/dev/null)
    if echo "$result" | python3 -c "import json,sys; d=json.load(sys.stdin); assert d.get('success')" 2>/dev/null; then
      echo "$result" > "$outfile"
      echo "  -> OK (attempt $attempt)"
      return 0
    fi
    echo "  -> retry $attempt in 8s"
    sleep 8
  done
  echo "  -> FAILED"
  return 1
}

for entry in "${QUERIES[@]}"; do
  filename="${entry%%|*}"
  query="${entry##*|}"
  fetch_one "$filename" "$query" || true
  sleep 3
done

echo "=== ALL DONE ==="
ls -la "$OUT_DIR"
