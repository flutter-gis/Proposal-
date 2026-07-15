#!/bin/bash
# Search images sequentially with delay to avoid rate limiting
set -e
OUT_DIR="/home/z/my-project/scripts/image-data"
mkdir -p "$OUT_DIR"

run_search() {
  local id="$1"
  local query="$2"
  local region="${3:-us}"
  local out_file="$OUT_DIR/$id.json"
  
  if [ -f "$out_file" ] && [ -s "$out_file" ]; then
    echo "[$(date +%H:%M:%S)] SKIP (exists): $id"
    return 0
  fi
  
  echo "[$(date +%H:%M:%S)] Searching: $id"
  z-ai image-search -q "$query" -c 3 --gl "$region" --no-rank -o "$out_file" 2>&1 | tail -1
  
  if [ ! -f "$out_file" ] || [ ! -s "$out_file" ]; then
    echo "[$(date +%H:%M:%S)] RETRY: $id"
    sleep 5
    z-ai image-search -q "$query" -c 3 --gl "$region" --no-rank -o "$out_file" 2>&1 | tail -1
  fi
  
  sleep 3
}

# Main stops
run_search "bear-brook" "Bear Brook State Park New Hampshire pine forest cabin"
run_search "pawtuckaway" "Pawtuckaway State Park New Hampshire lake beach forest"
run_search "lincoln-railway" "Granite State Scenic Railway Lincoln New Hampshire vintage train"
run_search "dixville-notch" "Dixville Notch New Hampshire granite cliffs sunset lake"
run_search "coleman-park" "Coleman State Park New Hampshire dark sky stargazing cabin"
run_search "colebrook-bakery" "French bakery pastries croissants espresso coffee shop"

# Activities
run_search "beaver-pond" "calm pond lake sunset canoe paddle reflection forest"
run_search "ccc-museum" "Civilian Conservation Corps historic barracks museum New Deal"
run_search "catamount-hike" "forest hiking trail New Hampshire panoramic overlook granite ledge"
run_search "boulders-glacial" "giant boulders glacial erratic forest New England trail"
run_search "kayak-rental" "kayak canoe lake rental summer wooden dock"
run_search "table-rock-cliffs" "Table Rock Dixville Notch granite vertical cliff face"
run_search "moose-alley" "wild moose north woods New Hampshire forest bog roadside"
run_search "milky-way-stars" "Milky Way galaxy dark sky star field reflection pond"
run_search "waterfall-cascades" "double tiered waterfall forest New Hampshire cascade"
run_search "international-border" "US Canada border forest clearing marker survey"
run_search "white-mountains" "White Mountains New Hampshire Franconia Notch scenic drive"
run_search "campfire-cooking" "campfire cooking cast iron pan outdoors night forest"

# Nearby recommended stops
run_search "flume-gorge" "Flume Gorge Franconia Notch New Hampshire boardwalk waterfall"
run_search "cannon-mountain" "Cannon Mountain aerial tramway New Hampshire view"
run_search "echo-lake" "Echo Lake Franconia Notch New Hampshire swimming beach"
run_search "basin-cascade" "The Basin Franconia Notch New Hampshire granite pothole waterfall"
run_search "balsams-resort" "The Balsams Grand Resort Dixville Notch historic hotel"
run_search "lake-francis" "Lake Francis State Park Pittsburg New Hampshire fishing boat"
run_search "magalloway-tower" "fire observation tower New Hampshire mountain summit view"
run_search "concord-nh" "New Hampshire State House capitol Concord golden dome"
run_search "mt-sunapee" "Mount Sunapee New Hampshire summit hiking view lake"
run_search "covered-bridge" "historic wooden covered bridge New England river"
run_search "fly-fishing" "fly fishing river trout New Hampshire mountains"
run_search "loon-mountain" "Loon Mountain New Hampshire gondola scenic view"

echo "ALL SEARCHES COMPLETE"
ls -la "$OUT_DIR" | head -40
