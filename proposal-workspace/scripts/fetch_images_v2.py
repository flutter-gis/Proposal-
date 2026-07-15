#!/usr/bin/env python3
"""Robust image fetcher that keeps running across queries, with longer timeouts and more retries."""
import subprocess
import json
import os
import time
import sys

OUT_DIR = "/home/z/my-project/scripts/imgs_v2"
os.makedirs(OUT_DIR, exist_ok=True)

# Mix of specific real-photo queries — target visitor photos and Tripadvisor/social content
QUERIES = [
    # New V18 stops
    ("the_basin", "The Basin Franconia Notch New Hampshire waterfall"),
    ("flume_gorge_real", "Flume Gorge Franconia Notch New Hampshire boardwalk"),
    ("benson_park", "Benson Park Hudson New Hampshire abandoned wild animal farm"),
    ("echo_lake", "Echo Lake Franconia Notch New Hampshire beach swimming"),
    ("artists_bluff", "Artists Bluff Trail Franconia Notch New Hampshire view"),
    ("sabbaday_falls", "Sabbaday Falls Kancamagus Highway New Hampshire waterfall"),
    ("lower_falls", "Lower Falls Swift River Kancamagus New Hampshire swimming hole"),
    ("rocky_gorge", "Rocky Gorge Kancamagus Highway New Hampshire scenic"),
    ("profile_lake", "Profile Lake Franconia Notch New Hampshire Cannon Mountain"),
    # Old Man of the Mountain Memorial
    ("old_man_mountain", "Old Man of the Mountain Memorial Franconia Notch New Hampshire profiler steel"),
    # Better quality main stops
    ("dixville_notch_real", "Dixville Notch New Hampshire Table Rock Lake Gloriette scenic"),
    ("table_rock_real", "Table Rock Dixville Notch cliff face New Hampshire"),
    ("coleman_state_park_real", "Coleman State Park Little Diamond Pond cabin New Hampshire"),
    ("perch_cabin", "Perch Cabin Coleman State Park New Hampshire"),
    ("pawtuckaway_real", "Pawtuckaway State Park Big Island cabin lake New Hampshire"),
    ("bear_brook_real", "Bear Brook State Park cabin Allenstown New Hampshire"),
    ("granite_railway_real", "Granite State Scenic Railway Lincoln NH train ride Pemigewasset"),
    ("moose_night", "moose New Hampshire Pittsburg Route 3 twilight wild"),
    ("le_rendezvous_colebrook", "Le Rendez-Vous Cafe Colebrook New Hampshire bakery"),
    ("huntington_cascade_real", "Huntington Falls Colebrook New Hampshire waterfall"),
    ("balsams_resort_real", "Balsams Grand Resort Dixville Notch New Hampshire hotel"),
    # Additional pretty scenes
    ("franconia_notch", "Franconia Notch State Park New Hampshire mountains scenic drive"),
    ("kancamagus_highway", "Kancamagus Highway White Mountains New Hampshire scenic fall"),
    ("connecticut_lakes", "Connecticut Lakes Pittsburg New Hampshire Fourth Lake border"),
    ("colebrook_nh", "Colebrook New Hampshire downtown main street town"),
    ("solar_shower", "solar shower camping outdoor lake"),
    ("hammock_pine", "hammock pine trees lake forest relaxing"),
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
                    return json.loads(text[start:i+1])
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
                    return d
        except json.JSONDecodeError:
            pass

    print(f"[FETCH] {filename}: {query}", flush=True)
    for attempt in range(1, retries + 1):
        try:
            result = subprocess.run(
                ["z-ai", "image-search", "-q", query, "--count", "5", "--gl", "us", "--no-rank"],
                capture_output=True, text=True, timeout=180
            )
            combined = result.stdout + result.stderr
            d = extract_json(combined)
            if d and d.get("success") and d.get("results"):
                with open(outfile, "w") as f:
                    json.dump(d, f, indent=2)
                print(f"  -> OK (attempt {attempt}, {len(d['results'])} imgs)", flush=True)
                return d
            else:
                err = d.get("error") if d else "no JSON"
                print(f"  -> retry {attempt}: {err}", flush=True)
        except subprocess.TimeoutExpired:
            print(f"  -> retry {attempt}: timeout", flush=True)
        except Exception as e:
            print(f"  -> retry {attempt}: {e}", flush=True)
        time.sleep(12)
    print(f"  -> FAILED: {filename}", flush=True)
    return None


def main():
    # Process queries sequentially with progress tracking
    results = {}
    for i, (filename, query) in enumerate(QUERIES, 1):
        print(f"\n=== {i}/{len(QUERIES)} ===", flush=True)
        d = fetch_one(filename, query)
        if d:
            results[filename] = d.get("results", [])
        time.sleep(3)

    print("\n=== SUMMARY ===", flush=True)
    for k, v in results.items():
        print(f"{k}: {len(v)} images", flush=True)
    print(f"\nTotal: {sum(len(v) for v in results.values())} images in {len(results)}/{len(QUERIES)} categories", flush=True)


if __name__ == "__main__":
    main()
