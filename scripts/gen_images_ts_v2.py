#!/usr/bin/env python3
"""Generate the images.ts file with URLs from both v1 and v2 fetched JSON files."""
import json
import os

V1_DIR = "/home/z/my-project/scripts/imgs"
V2_DIR = "/home/z/my-project/scripts/imgs_v2"
OUT_FILE = "/home/z/my-project/src/lib/images.ts"

# Alt text mapping
ALT_MAP = {
    "bakery": "French bakery pastries and coffee",
    "balsams": "Balsams Grand Resort historic hotel",
    "bearbrook": "Bear Brook State Park forest pond and cabin",
    "cabin": "Rustic log cabin porch forest",
    "campfire": "Romantic campfire in forest at night",
    "canoe": "Canoe paddle peaceful lake sunset",
    "coleman": "Coleman State Park cabin wilderness pond",
    "cookout": "Camp cooking cast iron skillet",
    "dixville": "Dixville Notch mountain cliffs at sunset",
    "flume": "Flume Gorge waterfall boardwalk",
    "forest_pine": "Deep pine forest trail New England",
    "franconia": "Franconia Notch White Mountains foliage",
    "hiking": "New England hiking trail forest",
    "moose": "Wild moose in New Hampshire twilight",
    "mtwashington": "Mount Washington White Mountains summit",
    "pawtuckaway": "Pawtuckaway State Park lake and boulder beach",
    "pemigewasset": "Pemigewasset River White Mountains",
    "railway": "Granite State Scenic Railway vintage train",
    "stargazing": "Milky Way night sky dark sky wilderness",
    "sunset_lake": "Mountain lake sunset golden hour reflection",
    "table_rock": "Table Rock cliffs granite face Dixville Notch",
    "waterfall": "New Hampshire waterfall cascade",
    # V2 new keys
    "the_basin": "The Basin Franconia Notch glacial pothole waterfall",
    "flume_gorge_real": "Flume Gorge boardwalk Franconia Notch New Hampshire",
    "benson_park": "Benson Park abandoned wild animal farm Hudson NH",
    "echo_lake": "Echo Lake Franconia Notch swimming beach",
    "artists_bluff": "Artists Bluff Trail Franconia Notch scenic view",
    "sabbaday_falls": "Sabbaday Falls Kancamagus Highway waterfall",
    "lower_falls": "Lower Falls Swift River Kancamagus swimming hole",
    "rocky_gorge": "Rocky Gorge Kancamagus Highway scenic",
    "profile_lake": "Profile Lake Franconia Notch Cannon Mountain",
    "old_man_mountain": "Old Man of the Mountain Memorial Franconia Notch",
    "dixville_notch_real": "Dixville Notch Table Rock Lake Gloriette scenic",
    "table_rock_real": "Table Rock Dixville Notch cliff face New Hampshire",
    "coleman_state_park_real": "Coleman State Park Little Diamond Pond cabin",
    "perch_cabin": "Perch Cabin Coleman State Park rustic",
    "pawtuckaway_real": "Pawtuckaway State Park Big Island cabin lake",
    "bear_brook_real": "Bear Brook State Park cabin Allenstown New Hampshire",
    "granite_railway_real": "Granite State Scenic Railway Lincoln NH train",
    "moose_night": "Wild moose New Hampshire Pittsburg twilight",
    "le_rendezvous_colebrook": "Le Rendez-Vous Cafe Colebrook French bakery",
    "huntington_cascade_real": "Huntington Falls Colebrook waterfall",
    "balsams_resort_real": "Balsams Grand Resort Dixville Notch historic hotel",
    "franconia_notch": "Franconia Notch State Park New Hampshire scenic drive",
    "kancamagus_highway": "Kancamagus Highway White Mountains scenic fall",
    "connecticut_lakes": "Connecticut Lakes Pittsburg New Hampshire Fourth Lake border",
    "colebrook_nh": "Colebrook New Hampshire downtown main street",
    "solar_shower": "Solar shower camping outdoor lake",
    "hammock_pine": "Hammock pine trees lake forest relaxing",
}


def load_dir(d):
    out = {}
    if not os.path.exists(d):
        return out
    for filename in sorted(os.listdir(d)):
        if not filename.endswith(".json"):
            continue
        key = filename[:-5]
        with open(os.path.join(d, filename)) as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                print(f"  -> invalid JSON in {filename}")
                continue
        if not data.get("success"):
            continue
        urls = [r["original_url"] for r in data.get("results", []) if r.get("original_url")]
        if urls:
            out[key] = urls
    return out


def main():
    v1 = load_dir(V1_DIR)
    v2 = load_dir(V2_DIR)

    # Merge: V2 overrides V1 if same key
    merged = {**v1, **v2}

    entries = []
    for key in sorted(merged.keys()):
        urls = merged[key]
        alt = ALT_MAP.get(key, key.replace("_", " ").title())
        entries.append((key, urls, alt))

    # Generate TypeScript
    out = []
    out.append('/**')
    out.append(' * Image Registry')
    out.append(' * Maps image keys to OSS-hosted image URLs fetched via z-ai image-search.')
    out.append(' * Each key has multiple image variants for variety.')
    out.append(' *')
    out.append(' * Sources: real visitor photos from YouTube, travel blogs, news sites, etc.')
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

    print(f"Wrote {OUT_FILE}")
    print(f"Total entries: {len(entries)}")
    print(f"Total images: {sum(len(u) for _, u, _ in entries)}")
    print(f"\nV1 entries: {len(v1)}")
    print(f"V2 entries: {len(v2)}")
    print(f"Merged entries: {len(merged)}")


if __name__ == "__main__":
    main()
