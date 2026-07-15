#!/bin/bash
# Search images in smaller batches with no delays - run in background
OUT_DIR="/home/z/my-project/scripts/image-data"
mkdir -p "$OUT_DIR"
LOG_FILE="$OUT_DIR/search.log"

run_search() {
  local id="$1"
  local query="$2"
  local out_file="$OUT_DIR/$id.json"
  
  if [ -f "$out_file" ] && [ -s "$out_file" ]; then
    echo "[$(date +%H:%M:%S)] SKIP: $id" >> "$LOG_FILE"
    return 0
  fi
  
  echo "[$(date +%H:%M:%S)] START: $id" >> "$LOG_FILE"
  z-ai image-search -q "$query" -c 2 --gl us --no-rank -o "$out_file" >> "$LOG_FILE" 2>&1
  echo "[$(date +%H:%M:%S)] END: $id" >> "$LOG_FILE"
}

# Run 4 at a time, wait, then next 4
run_search "bear-brook" "Bear Brook State Park New Hampshire pine forest cabin" &
run_search "pawtuckaway" "Pawtuckaway State Park New Hampshire lake beach forest" &
run_search "lincoln-railway" "Granite State Scenic Railway Lincoln New Hampshire vintage train" &
run_search "dixville-notch" "Dixville Notch New Hampshire granite cliffs sunset lake" &
wait

run_search "coleman-park" "Coleman State Park New Hampshire dark sky stargazing cabin" &
run_search "colebrook-bakery" "French bakery pastries croissants espresso coffee shop" &
run_search "beaver-pond" "calm pond lake sunset canoe paddle reflection forest" &
run_search "ccc-museum" "Civilian Conservation Corps historic barracks museum" &
wait

run_search "catamount-hike" "forest hiking trail New Hampshire panoramic overlook" &
run_search "boulders-glacial" "giant boulders glacial erratic forest New England" &
run_search "kayak-rental" "kayak canoe lake rental summer wooden dock" &
run_search "table-rock-cliffs" "Table Rock Dixville Notch granite vertical cliff" &
wait

run_search "moose-alley" "wild moose north woods New Hampshire forest bog" &
run_search "milky-way-stars" "Milky Way galaxy dark sky star field pond reflection" &
run_search "waterfall-cascades" "double tiered waterfall forest New Hampshire cascade" &
run_search "international-border" "US Canada border forest clearing marker survey" &
wait

run_search "white-mountains" "White Mountains New Hampshire Franconia Notch scenic" &
run_search "campfire-cooking" "campfire cooking cast iron pan outdoors night forest" &
run_search "flume-gorge" "Flume Gorge Franconia Notch New Hampshire boardwalk" &
run_search "cannon-mountain" "Cannon Mountain aerial tramway New Hampshire view" &
wait

run_search "echo-lake" "Echo Lake Franconia Notch New Hampshire swimming beach" &
run_search "basin-cascade" "The Basin Franconia Notch New Hampshire granite pothole" &
run_search "balsams-resort" "Balsams Grand Resort Dixville Notch historic hotel" &
run_search "lake-francis" "Lake Francis State Park Pittsburg New Hampshire boat" &
wait

run_search "magalloway-tower" "fire observation tower New Hampshire mountain summit" &
run_search "concord-nh" "New Hampshire State House capitol Concord golden dome" &
run_search "mt-sunapee" "Mount Sunapee New Hampshire summit hiking view lake" &
run_search "covered-bridge" "historic wooden covered bridge New England river" &
wait

run_search "fly-fishing" "fly fishing river trout New Hampshire mountains" &
run_search "loon-mountain" "Loon Mountain New Hampshire gondola scenic view" &

wait
echo "[$(date +%H:%M:%S)] ALL DONE" >> "$LOG_FILE"
