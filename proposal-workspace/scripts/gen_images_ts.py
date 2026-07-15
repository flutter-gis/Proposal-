#!/usr/bin/env python3
"""Generate the images.ts file with URLs from all fetched JSON files."""
import json
import os
import re

IMG_DIR = "/home/z/my-project/scripts/imgs"
OUT_FILE = "/home/z/my-project/src/lib/images.ts"

# Mapping: filename (without .json) -> (key, alt text)
ALT_MAP = {
    "bearbrook": "Bear Brook State Park forest pond and cabin",
    "pawtuckaway": "Pawtuckaway State Park lake and boulder beach",
    "railway": "Granite State Scenic Railway vintage train",
    "dixville": "Dixville Notch mountain cliffs at sunset",
    "table_rock": "Table Rock cliffs granite face Dixville Notch",
    "coleman": "Coleman State Park cabin wilderness pond",
    "moose": "Wild moose in New Hampshire twilight",
    "bakery": "French bakery pastries and coffee",
    "waterfall": "New Hampshire waterfall cascade",
    "franconia": "Franconia Notch White Mountains foliage",
    "flume": "Flume Gorge waterfall boardwalk",
    "mtwashington": "Mount Washington White Mountains summit",
    "campfire": "Romantic campfire in forest at night",
    "stargazing": "Milky Way night sky dark sky wilderness",
    "canoe": "Canoe paddle peaceful lake sunset",
    "hiking": "New England hiking trail forest",
    "cabin": "Rustic log cabin porch forest",
    "pemigewasset": "Pemigewasset River White Mountains",
    "balsams": "Balsams Grand Resort historic hotel",
    "cookout": "Camp cooking cast iron skillet",
    "sunset_lake": "Mountain lake sunset golden hour reflection",
    "forest_pine": "Deep pine forest trail New England",
    "historic": "Historic New England 1930s building",
}


def main():
    entries = []
    for filename in sorted(os.listdir(IMG_DIR)):
        if not filename.endswith(".json"):
            continue
        key = filename[:-5]
        with open(os.path.join(IMG_DIR, filename)) as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                print(f"  -> invalid JSON in {filename}")
                continue
        if not data.get("success"):
            continue
        urls = [r["original_url"] for r in data.get("results", []) if r.get("original_url")]
        alt = ALT_MAP.get(key, key.replace("_", " ").title())
        entries.append((key, urls, alt))
        print(f"  {key}: {len(urls)} URLs")

    # Generate TypeScript
    out = []
    out.append('/**')
    out.append(' * Image Registry')
    out.append(' * Maps image keys to OSS-hosted image URLs fetched via z-ai image-search.')
    out.append(' * Each key has multiple image variants for variety.')
    out.append(' */')
    out.append('')
    out.append('export type ImageEntry = {')
    out.append('  key: string;')
    out.append('  urls: string[];')
    out.append('  alt: string;')
    out.append('};')
    out.append('')
    out.append('export const IMAGES: Record<string, ImageEntry> = {')

    for key, urls, alt in entries:
        # Escape backticks in alt
        alt_escaped = alt.replace("`", "\\`").replace("${", "\\${")
        urls_str = ", ".join(f'"{u}"' for u in urls)
        out.append(f'  {key}: {{')
        out.append(f'    key: "{key}",')
        out.append(f'    urls: [{urls_str}],')
        out.append(f'    alt: `{alt_escaped}`,')
        out.append('  },')

    out.append('};')
    out.append('')
    out.append('/**')
    out.append(' * Get image URL by key. If no URLs available, returns null (caller should fallback to gradient).')
    out.append(' */')
    out.append('export function getImage(key: string, variant: number = 0): string | null {')
    out.append('  const entry = IMAGES[key];')
    out.append('  if (!entry || entry.urls.length === 0) return null;')
    out.append('  return entry.urls[variant % entry.urls.length];')
    out.append('}')
    out.append('')
    out.append('/**')
    out.append(' * Get all image URLs for a set of keys (for galleries / carousels).')
    out.append(' */')
    out.append('export function getImages(keys: string[] = []): { key: string; url: string; alt: string }[] {')
    out.append('  const out: { key: string; url: string; alt: string }[] = [];')
    out.append('  for (const key of keys) {')
    out.append('    const entry = IMAGES[key];')
    out.append('    if (!entry) continue;')
    out.append('    for (const url of entry.urls) {')
    out.append('      out.push({ key, url, alt: entry.alt });')
    out.append('    }')
    out.append('  }')
    out.append('  return out;')
    out.append('}')

    with open(OUT_FILE, "w") as f:
        f.write("\n".join(out))

    print(f"\nWrote {OUT_FILE}")
    print(f"Total entries: {len(entries)}")
    print(f"Total images: {sum(len(u) for _, u, _ in entries)}")


if __name__ == "__main__":
    main()
