#!/usr/bin/env python3
"""Fetch images using z-ai image-search CLI, parsing JSON from mixed output."""
import subprocess
import json
import os
import time
import sys

OUT_DIR = "/home/z/my-project/scripts/imgs"
os.makedirs(OUT_DIR, exist_ok=True)

QUERIES = [
    ("bearbrook", "Bear Brook State Park New Hampshire forest pond cabin"),
    ("pawtuckaway", "Pawtuckaway State Park New Hampshire lake boulder beach"),
    ("railway", "Granite State Scenic Railway Lincoln New Hampshire vintage train"),
    ("dixville", "Dixville Notch New Hampshire mountain cliffs sunset"),
    ("table_rock", "Table Rock cliffs Dixville Notch New Hampshire granite face"),
    ("coleman", "Coleman State Park New Hampshire cabin wilderness pond"),
    ("moose", "wild moose road twilight New Hampshire forest"),
    ("bakery", "French bakery pastry coffee shop cozy interior morning"),
    ("waterfall", "New Hampshire waterfall cascade forest rocks"),
    ("franconia", "Franconia Notch New Hampshire White Mountains foliage"),
    ("flume", "Flume Gorge New Hampshire waterfall boardwalk"),
    ("mtwashington", "Mount Washington New Hampshire White Mountains summit"),
    ("campfire", "Romantic campfire evening forest wilderness night"),
    ("stargazing", "Milky Way night sky dark sky wilderness stars"),
    ("canoe", "Canoe paddle peaceful lake sunset reflection pine"),
    ("hiking", "New England hiking trail forest pine trees scenic"),
    ("cabin", "Rustic log cabin porch forest wilderness New England"),
    ("pemigewasset", "Pemigewasset River White Mountains New Hampshire scenic"),
    ("balsams", "Balsams Grand Resort Dixville Notch New Hampshire historic hotel"),
    ("cookout", "Camp cooking cast iron skillet outdoor picnic table"),
    ("sunset_lake", "mountain lake sunset golden hour reflection granite cliff"),
    ("forest_pine", "deep pine forest sunlight trail New England wilderness"),
]


def extract_json(text: str) -> dict | None:
    """Find first { ... } JSON block in text."""
    start = text.find("{")
    if start < 0:
        return None
    # Walk to matching close brace
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


def fetch_one(filename: str, query: str, retries: int = 3) -> dict | None:
    outfile = os.path.join(OUT_DIR, f"{filename}.json")
    if os.path.exists(outfile) and os.path.getsize(outfile) > 0:
        try:
            with open(outfile) as f:
                d = json.load(f)
                if d.get("success"):
                    print(f"[SKIP] {filename}")
                    return d
        except json.JSONDecodeError:
            pass

    print(f"[FETCH] {filename}: {query}", flush=True)
    for attempt in range(1, retries + 1):
        try:
            result = subprocess.run(
                ["z-ai", "image-search", "-q", query, "--count", "3", "--gl", "us", "--no-rank"],
                capture_output=True, text=True, timeout=120
            )
            combined = result.stdout + result.stderr
            d = extract_json(combined)
            if d and d.get("success"):
                with open(outfile, "w") as f:
                    json.dump(d, f, indent=2)
                print(f"  -> OK (attempt {attempt}, {len(d.get('results',[]))} imgs)", flush=True)
                return d
            else:
                print(f"  -> retry {attempt}: no success JSON", flush=True)
        except subprocess.TimeoutExpired:
            print(f"  -> retry {attempt}: timeout", flush=True)
        except Exception as e:
            print(f"  -> retry {attempt}: {e}", flush=True)
        time.sleep(8)
    print(f"  -> FAILED", flush=True)
    return None


def main():
    results = {}
    for filename, query in QUERIES:
        d = fetch_one(filename, query)
        if d:
            results[filename] = d.get("results", [])
        time.sleep(2)

    print("\n=== SUMMARY ===")
    for k, v in results.items():
        print(f"{k}: {len(v)} images")
    print(f"\nTotal: {sum(len(v) for v in results.values())} images in {len(results)}/{len(QUERIES)} categories")


if __name__ == "__main__":
    main()
