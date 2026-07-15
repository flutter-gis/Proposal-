#!/bin/bash
# Search images for all key locations in parallel
set -e
OUT_DIR="/home/z/my-project/scripts/image-data"
mkdir -p "$OUT_DIR"

run_search() {
  local id="$1"
  local query="$2"
  local region="${3:-us}"
  echo "[$(date +%H:%M:%S)] Searching: $id"
  z-ai image-search -q "$query" -c 3 --gl "$region" --no-rank -o "$OUT_DIR/$id.json" 2>&1 | tail -1
  echo "[$(date +%H:%M:%S)] Done: $id"
}

# Main stops
run_search "bear-brook" "Bear Brook State Park New Hampshire pine forest cabin" us &
run_search "pawtuckaway" "Pawtuckaway State Park New Hampshire lake beach forest" us &
run_search "lincoln-railway" "Granite State Scenic Railway Lincoln New Hampshire vintage train" us &
run_search "dixville-notch" "Dixville Notch New Hampshire granite cliffs sunset lake" us &
run_search "coleman-park" "Coleman State Park New Hampshire dark sky stargazing cabin" us &
run_search "colebrook-bakery" "French bakery pastries croissants espresso coffee shop" us &

wait
echo "Batch 1 done"

# Activities and nearby places
run_search "beaver-pond" "calm pond lake sunset canoe paddle reflection" us &
run_search "ccc-museum" "Civilian Conservation Corps historic barracks museum" us &
run_search "catamount-hike" "forest hiking trail New Hampshire panoramic overlook" us &
run_search "boulders-glacial" "giant boulders glacial erratic forest New England" us &
run_search "kayak-rental" "kayak canoe lake rental summer wooden dock" us &
run_search "table-rock-cliffs" "Table Rock Dixville Notch granite vertical cliff face" us &
run_search "moose-alley" "wild moose north woods New Hampshire forest bog" us &
run_search "milky-way-stars" "Milky Way galaxy dark sky star field reflection pond" us &
run_search "waterfall-cascades" "double tiered waterfall forest New Hampshire cascade" us &
run_search "international-border" "US Canada border forest clearing slash line marker" us &
run_search "white-mountains" "White Mountains New Hampshire Franconia Notch scenic drive" us &
run_search "campfire-cooking" "campfire cooking cast iron pan outdoors night" us &

wait
echo "Batch 2 done"

# Nearby recommended stops
run_search "flume-gorge" "Flume Gorge Franconia Notch New Hampshire boardwalk waterfall" us &
run_search "cannon-mountain" "Cannon Mountain aerial tramway New Hampshire view" us &
run_search "echo-lake" "Echo Lake Franconia Notch New Hampshire swimming beach" us &
run_search "basin-cascade" "The Basin Franconia Notch New Hampshire granite pothole waterfall" us &
run_search "balsams-resort" "The Balsams Grand Resort Dixville Notch historic hotel" us &
run_search "lake-francis" "Lake Francis State Park Pittsburg New Hampshire fishing boat" us &
run_search "magalloway-tower" "fire observation tower New Hampshire mountain summit view" us &
run_search "moose-track" "live moose standing forest road twilight New Hampshire" us &
run_search "concord-nh" "New Hampshire State House capitol Concord golden dome" us &
run_search "mt-sunapee" "Mount Sunapee New Hampshire summit hiking view lake" us &
run_search "covered-bridge" "historic wooden covered bridge New England river autumn" us &
run_search "fly-fishing" "fly fishing river trout New Hampshire mountains" us &

wait
echo "Batch 3 done"
echo "ALL SEARCHES COMPLETE"
ls -la "$OUT_DIR"
