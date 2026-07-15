#!/usr/bin/env python3
"""Fetch a single image category and write to file. Designed to be called many times."""
import subprocess
import json
import os
import sys

OUT_DIR = "/home/z/my-project/scripts/imgs_v2"
os.makedirs(OUT_DIR, exist_ok=True)


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


def main():
    if len(sys.argv) < 3:
        print("Usage: fetch_one.py <filename> <query>")
        sys.exit(1)
    filename = sys.argv[1]
    query = sys.argv[2]
    outfile = os.path.join(OUT_DIR, f"{filename}.json")

    if os.path.exists(outfile) and os.path.getsize(outfile) > 0:
        try:
            with open(outfile) as f:
                d = json.load(f)
                if d.get("success") and d.get("results"):
                    print(f"SKIP: {filename} already has {len(d['results'])} images")
                    return
        except json.JSONDecodeError:
            pass

    print(f"FETCH: {filename}: {query}", flush=True)
    for attempt in range(1, 5):
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
                print(f"OK: {filename} - {len(d['results'])} images")
                return
            else:
                err = d.get("error") if d else "no JSON"
                print(f"  retry {attempt}: {err}", flush=True)
        except subprocess.TimeoutExpired:
            print(f"  retry {attempt}: timeout", flush=True)
        except Exception as e:
            print(f"  retry {attempt}: {e}", flush=True)
    print(f"FAILED: {filename}")


if __name__ == "__main__":
    main()
