#!/usr/bin/env python3
"""Fetch high-quality real images for the 30 travel-app locations.
Runs searches in parallel with retries and writes JSON to scripts/imgs_v3/.
"""
import subprocess
import json
import os
import time
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

OUT_DIR = "/home/z/my-project/scripts/imgs_v3"
os.makedirs(OUT_DIR, exist_ok=True)

# 30 location queries (filename_slug, query, [extra_keys_using_same_results])
# Each query is designed to find REAL visitor photos, not stock photos.
QUERIES = [
    ("bear_brook", "Bear Brook State Park Allenstown New Hampshire"),
    ("pawtuckaway", "Pawtuckaway State Park Nottingham New Hampshire lake"),
    ("dixville_notch", "Dixville Notch New Hampshire mountain cliffs scenic"),
    ("coleman_state_park", "Coleman State Park New Hampshire Little Diamond Pond"),
    ("flume_gorge", "Flume Gorge Franconia Notch New Hampshire boardwalk"),
    ("the_basin", "The Basin Franconia Notch New Hampshire waterfall pothole"),
    ("old_man_mountain", "Old Man of the Mountain Franconia Notch New Hampshire memorial"),
    ("mt_washington", "Mount Washington New Hampshire summit White Mountains"),
    ("kancamagus_highway", "Kancamagus Highway New Hampshire White Mountains scenic"),
    ("echo_lake", "Echo Lake Franconia Notch New Hampshire beach"),
    ("sabbaday_falls", "Sabbaday Falls Kancamagus Highway New Hampshire waterfall"),
    ("lower_falls", "Lower Falls Swift River Kancamagus New Hampshire"),
    ("artists_bluff", "Artists Bluff Trail Franconia Notch New Hampshire view"),
    ("profile_lake", "Profile Lake Franconia Notch New Hampshire Cannon Mountain"),
    ("rocky_gorge", "Rocky Gorge Kancamagus Highway Swift River New Hampshire"),
    ("le_rendezvous_bakery", "Le Rendez-Vous Bakery Colebrook New Hampshire French cafe"),
    ("huntington_cascades", "Huntington Falls Dixville Notch New Hampshire waterfall"),
    ("balsams_resort", "The Balsams Grand Resort Hotel Dixville Notch New Hampshire"),
    ("moose_wildlife", "Wild moose New Hampshire wildlife forest"),
    ("benson_park", "Benson Park Hudson New Hampshire wild animal farm"),
    ("connecticut_lakes", "Connecticut Lakes Pittsburg New Hampshire scenic"),
    ("granite_state_railway", "Granite State Scenic Railway Lincoln New Hampshire train"),
    ("campfire", "Campfire camping night forest fire flames"),
    ("stargazing", "Milky Way night sky dark sky wilderness stars"),
    ("canoe_lake", "Canoe paddling peaceful lake sunset reflection"),
    ("hiking_trail", "Hiking trail White Mountains New Hampshire forest"),
    ("pine_forest", "Pine forest canopy tall trees New England"),
    ("lake_sunset", "Mountain lake sunset golden hour reflection"),
    ("wilderness_cabin", "Rustic log cabin porch wilderness forest"),
    ("table_rock", "Table Rock cliff Dixville Notch New Hampshire hike"),
]


def extract_json(text):
    start = text.find("{")
    if start < 0:
        return None
    depth = 0
    in_str = False
    esc = False
    for i, ch in enumerate(text[start:], start):
        if esc:
            esc = False
            continue
        if ch == "\\":
            esc = True
            continue
        if ch == '"':
            in_str = not in_str
            continue
        if in_str:
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                try:
                    return json.loads(text[start:i + 1])
                except json.JSONDecodeError:
                    return None
    return None


def fetch_one(filename, query, retries=4):
    outfile = os.path.join(OUT_DIR, f"{filename}.json")
    if os.path.exists(outfile) and os.path.getsize(outfile) > 0:
        try:
            with open(outfile) as f:
                d = json.load(f)
                if d.get("success") and d.get("results"):
                    print(f"[SKIP] {filename} ({len(d['results'])} imgs)", flush=True)
                    return filename, d
        except json.JSONDecodeError:
            pass

    print(f"[FETCH] {filename}: {query}", flush=True)
    for attempt in range(1, retries + 1):
        try:
            result = subprocess.run(
                ["z-ai", "image-search", "-q", query, "--count", "5",
                 "--gl", "us", "--no-rank"],
                capture_output=True, text=True, timeout=240
            )
            combined = result.stdout + result.stderr
            d = extract_json(combined)
            if d and d.get("success") and d.get("results"):
                with open(outfile, "w") as f:
                    json.dump(d, f, indent=2)
                print(f"  -> OK (attempt {attempt}, {len(d['results'])} imgs) {filename}", flush=True)
                return filename, d
            else:
                err = d.get("error") if d else "no JSON"
                snippet = combined[:200].replace("\n", " ")
                print(f"  -> retry {attempt} {filename}: {err} | {snippet}", flush=True)
        except subprocess.TimeoutExpired:
            print(f"  -> retry {attempt} {filename}: timeout", flush=True)
        except Exception as e:
            print(f"  -> retry {attempt} {filename}: {e}", flush=True)
        time.sleep(8)
    print(f"  -> FAILED: {filename}", flush=True)
    return filename, None


def main():
    results = {}
    # Run up to 6 searches in parallel to be polite to the upstream
    with ThreadPoolExecutor(max_workers=6) as ex:
        futures = {ex.submit(fetch_one, fname, q): fname for fname, q in QUERIES}
        for fut in as_completed(futures):
            fname, d = fut.result()
            if d:
                results[fname] = d.get("results", [])

    print("\n=== SUMMARY ===", flush=True)
    for fname, q in QUERIES:
        n = len(results.get(fname, []))
        print(f"{fname}: {n} images", flush=True)
    print(f"\nTotal: {sum(len(v) for v in results.values())} images in "
          f"{len(results)}/{len(QUERIES)} categories", flush=True)


if __name__ == "__main__":
    main()
