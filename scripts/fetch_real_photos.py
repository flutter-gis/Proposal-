#!/usr/bin/env python3
"""Fetch HIGHER-QUALITY real photos by querying with very specific landmark names.
Uses Instagram/social-media style queries to get real visitor photos rather than stock images."""
import subprocess
import json
import os
import time

OUT_DIR = "/home/z/my-project/scripts/imgs_v2"
os.makedirs(OUT_DIR, exist_ok=True)

# Very specific queries — these target real visitor photography rather than stock.
# Each entry: (filename, [list of queries to try in order]) — we take ALL results from ALL queries.
QUERIES = [
    # === Major planned stops (specific real-photo queries) ===
    ("bearbrook_cabin", [
        "Bear Brook State Park Oaks Cabin NH visitor photo",
        "Bear Brook State Park Allenstown New Hampshire cabin interior",
    ]),
    ("beaver_pond_bb", [
        "Beaver Pond Bear Brook State Park New Hampshire reflection sunset",
        "beaver pond New Hampshire state park canoe launch",
    ]),
    ("catamount_hill", [
        "Catamount Hill Loop Bear Brook view granite ledge",
        "Bear Brook State Park hiking trail overlook NH",
    ]),
    ("pawtuckaway_lake", [
        "Pawtuckaway State Park lake aerial photo NH",
        "Pawtuckaway Big Island cabin loop visitor photo",
        "Pawtuckaway State Park beach sunset real photo",
    ]),
    ("pawtuckaway_boulder", [
        "Pawtuckaway glacial erratic boulder trail NH",
        "Pawtuckaway Boulder Trail devils den rock climbing",
    ]),
    ("granite_railway", [
        "Granite State Scenic Railway Lincoln NH train ride interior",
        "Hobo Railroad Lincoln NH Pemigewasset River scenic train",
    ]),
    ("franconia_notch", [
        "Franconia Notch State Park fall foliage iconic view",
        "Franconia Notch Profile Lake Cannon Mountain vista",
    ]),
    ("the_basin", [
        "The Basin Franconia Notch waterfall pothole closeup",
        "Franconia Notch The Basin granite pothole Pemigewasset",
    ]),
    ("flume_gorge_real", [
        "Flume Gorge Franconia Notch boardwalk between granite walls",
        "Flume Gorge New Hampshire visitor photo summer",
        "Flume Gorge waterfall covered bridge NH",
    ]),
    ("echo_lake", [
        "Echo Lake Beach Franconia Notch New Hampshire swimming",
        "Echo Lake Cannon Mountain reflection photo NH",
    ]),
    ("artists_bluff", [
        "Artists Bluff Trail Franconia Notch overlook Echo Lake",
        "Artists Bluff New Hampshire fall foliage iconic view",
    ]),
    ("old_man_mountain", [
        "Old Man of the Mountain Franconia Notch historic profile",
        "Old Man of the Mountain Memorial Plaza Franconia Notch profiler",
        "Old Man Mountain New Hampshire face rock formation",
    ]),
    ("cannon_aerial", [
        "Cannon Mountain Aerial Tramway Franconia Notch summit view",
        "Cannon Mountain Tramway New Hampshire observation tower",
    ]),
    ("mt_washington_real", [
        "Mount Washington summit cog railway New Hampshire real photo",
        "Mount Washington Auto Road tip top house observatory",
    ]),
    ("dixville_proposal", [
        "Dixville Notch New Hampshire Table Rock Lake Gloriette sunset",
        "Lake Gloriette Dixville Notch reflection granite cliff",
        "Dixville Notch State Park New Hampshire scenic view",
    ]),
    ("table_rock_cliff", [
        "Table Rock Dixville Notch cliff vertical granite face",
        "Dixville Notch Table Rock hiking trail New Hampshire",
    ]),
    ("balsams_resort", [
        "The Balsams Grand Resort Dixville Notch NH historic hotel",
        "Balsams Wilderness Hotel exterior New Hampshire",
    ]),
    ("coleman_cabin", [
        "Coleman State Park Perch Cabin Little Diamond Pond NH",
        "Coleman State Park cabin New Hampshire Great North Woods",
    ]),
    ("little_diamond_pond", [
        "Little Diamond Pond Coleman State Park New Hampshire",
        "Coleman State Park pond dock reflection NH",
    ]),
    ("moose_alley_real", [
        "Moose Alley Pittsburg New Hampshire Route 3 wildlife",
        "New Hampshire moose sighting Route 3 Pittsburg visitor photo",
        "wild moose New Hampshire roadside twilight photo",
    ]),
    ("us_canada_border", [
        "US Canada border slash Pittsburg New Hampshire 4th Connecticut Lake",
        "US Canada border trail New Hampshire forest clearing",
    ]),
    ("huntington_cascades", [
        "Huntington Cascades Colebrook New Hampshire waterfall",
        "Huntington Falls New Hampshire double tiered cascade",
    ]),
    ("le_rendez_vous", [
        "Le Rendez-Vous Bakery Colebrook NH French pastries",
        "Le Rendez Vous Cafe Colebrook New Hampshire interior",
    ]),
    ("benson_park", [
        "Benson Park Hudson NH abandoned wild animal farm ruins",
        "Benson Wild Animal Farm New Hampshire elephant barn gorilla cage",
        "Benson Park Hudson New Hampshire walking trail ruins",
    ]),
    ("sabbaday_falls", [
        "Sabbaday Falls Kancamagus Highway New Hampshire waterfall",
        "Sabbaday Falls White Mountain National Forest hiking",
    ]),
    ("lower_falls", [
        "Lower Falls Kancamagus Highway swimming hole New Hampshire",
        "Lower Falls Swift River NH swimming",
    ]),
    ("rocky_gorge", [
        "Rocky Gorge Kancamagus Highway Albany New Hampshire bridge",
        "Rocky Gorge Swift River scenic stop NH",
    ]),
    ("campfire_romantic", [
        "romantic campfire forest night sunset wilderness couple",
        "campfire picnic table evening forest New England",
    ]),
    ("milky_way_pond", [
        "Milky Way night sky reflection pond New Hampshire",
        "Bortle Class 2 dark sky Milky Way reflection water",
        "stargazing New Hampshire Great North Woods night sky",
    ]),
    ("canoe_sunset", [
        "canoe paddle lake sunset golden hour reflection pine forest",
        "canoeing New England lake twilight beaver pond",
    ]),
    ("pine_forest_trail", [
        "pine forest trail New England sunlight path wilderness",
        "white pine forest floor needles New Hampshire trail",
    ]),
    ("rustic_cabin_porch", [
        "rustic log cabin porch New England state park",
        "state park cabin exterior wood porch wilderness",
    ]),
    ("cookout_skillet", [
        "camp cooking cast iron skillet outdoor picnic table",
        "camp stove single burner cooking outdoor meal",
    ]),
    ("pemi_river", [
        "Pemigewasset River White Mountains New Hampshire scenic",
        "Pemigewasset River Lincoln NH water rocks",
    ]),
]


def extract_json(text: str):
    start = text.find("{")
    if start < 0:
        return None
    depth = 0
    in_str = False
    esc = False
    for i, ch in enumerate(text[start:], start):
        if esc:
            esc = False; continue
        if ch == "\\": esc = True; continue
        if ch == '"':
            in_str = not in_str; continue
        if in_str: continue
        if ch == "{": depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                try:
                    return json.loads(text[start:i+1])
                except: return None
    return None


def fetch_one(filename: str, queries: list):
    """Run multiple queries, collect all unique URLs into one file."""
    outfile = os.path.join(OUT_DIR, f"{filename}.json")
    if os.path.exists(outfile):
        try:
            with open(outfile) as f:
                d = json.load(f)
                if d.get("success") and len(d.get("results", [])) >= 2:
                    print(f"[SKIP] {filename} ({len(d['results'])} imgs)")
                    return d
        except: pass

    all_urls = []
    all_results = []
    seen = set()

    for q in queries:
        print(f"[FETCH] {filename} :: {q}", flush=True)
        for attempt in range(1, 4):
            try:
                result = subprocess.run(
                    ["z-ai", "image-search", "-q", q, "--count", "3", "--gl", "us", "--no-rank"],
                    capture_output=True, text=True, timeout=120
                )
                d = extract_json(result.stdout + result.stderr)
                if d and d.get("success"):
                    for r in d.get("results", []):
                        url = r.get("original_url")
                        if url and url not in seen:
                            seen.add(url)
                            all_urls.append(url)
                            all_results.append(r)
                    break  # success, next query
                else:
                    print(f"  -> retry {attempt}", flush=True)
            except subprocess.TimeoutExpired:
                print(f"  -> timeout {attempt}", flush=True)
            except Exception as e:
                print(f"  -> error {attempt}: {e}", flush=True)
            time.sleep(6)
        time.sleep(3)

    out = {
        "success": len(all_results) > 0,
        "results": all_results,
        "count": len(all_results),
    }
    with open(outfile, "w") as f:
        json.dump(out, f, indent=2)
    print(f"  -> {filename}: {len(all_results)} unique images", flush=True)
    return out


def main():
    print(f"Fetching {len(QUERIES)} categories with multiple queries each...")
    for filename, queries in QUERIES:
        fetch_one(filename, queries)
        time.sleep(2)
    print("\n=== ALL DONE ===")
    total = 0
    for f in os.listdir(OUT_DIR):
        if f.endswith(".json"):
            try:
                with open(os.path.join(OUT_DIR, f)) as fp:
                    d = json.load(fp)
                    total += len(d.get("results", []))
                    print(f"  {f}: {len(d.get('results', []))} images")
            except: pass
    print(f"Total: {total} images across {len(os.listdir(OUT_DIR))} files")


if __name__ == "__main__":
    main()
