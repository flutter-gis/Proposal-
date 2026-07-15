#!/usr/bin/env python3
"""Build src/lib/images_v3.ts from the fetched JSON results in scripts/imgs_v3/.

Filters out watermarked stock-photo sources (Alamy, Shutterstock, etc.) and
maps each existing image key to its most relevant search results.
"""
import json
import os
import re

V3_DIR = "/home/z/my-project/scripts/imgs_v3"
OUT_TS = "/home/z/my-project/src/lib/images.ts"

# Sources to filter out (watermarked stock / scraped aggregators).
STOCK_BLACKLIST = {
    "Alamy",
    "Shutterstock",
    "Getty Images",
    "iStock",
    "Adobe Stock",
    "Dreamstime",
    "Dreamstime.com",
    "123RF",
    "Bigstock",
    "Depositphotos",
    "Pond5",
    "eBay",
    "Pinterest",
    "Wallpaper Abyss - Alpha Coders",
}

MIN_W = 800
MIN_H = 500


def load_results(slug):
    """Load results from <slug>.json (and <slug>_alt.json if it exists), filtered."""
    urls_seen = set()
    out = []
    paths = [os.path.join(V3_DIR, f"{slug}.json")]
    alt = os.path.join(V3_DIR, f"{slug}_alt.json")
    if os.path.exists(alt):
        paths.append(alt)
    for p in paths:
        if not os.path.exists(p):
            continue
        try:
            d = json.load(open(p))
        except Exception:
            continue
        for r in d.get("results", []):
            src = r.get("source", "") or ""
            if any(bad.lower() in src.lower() for bad in STOCK_BLACKLIST):
                continue
            try:
                w = int((r.get("original_width") or "0").replace("px", ""))
                h = int((r.get("original_height") or "0").replace("px", ""))
            except ValueError:
                continue
            if w < MIN_W or h < MIN_H:
                continue
            url = r.get("original_url")
            if not url or url in urls_seen:
                continue
            urls_seen.add(url)
            out.append(url)
    return out


# Map each IMAGES key → source slug. Keys without a dedicated v3 search reuse
# the closest related search (per the user's 30-query plan).
KEY_TO_SLUG = {
    "artists_bluff": "artists_bluff",
    "bakery": "le_rendezvous_bakery",
    "balsams": "balsams_resort",
    "balsams_resort_real": "balsams_resort",
    "bear_brook_real": "bear_brook",
    "bearbrook": "bear_brook",
    "benson_park": "benson_park",
    "cabin": "wilderness_cabin",
    "campfire": "campfire",
    "canoe": "canoe_lake",
    "colebrook_nh": "le_rendezvous_bakery",  # Colebrook town
    "coleman": "coleman_state_park",
    "coleman_state_park_real": "coleman_state_park",
    "connecticut_lakes": "connecticut_lakes",
    "cookout": "campfire",
    "dixville": "dixville_notch",
    "dixville_notch_real": "dixville_notch",
    "echo_lake": "echo_lake",
    "flume": "flume_gorge",
    "flume_gorge_real": "flume_gorge",
    "forest_pine": "pine_forest",
    "franconia": "flume_gorge",            # Franconia Notch (no dedicated v3 search)
    "franconia_notch": "flume_gorge",      # ditto
    "granite_railway_real": "granite_state_railway",
    "hammock_pine": "pine_forest",
    "hiking": "hiking_trail",
    "historic": "balsams_resort",          # historic grand resort
    "huntington_cascade_real": "huntington_cascades",
    "kancamagus_highway": "kancamagus_highway",
    "le_rendezvous_colebrook": "le_rendezvous_bakery",
    "lower_falls": "lower_falls",
    "moose": "moose_wildlife",
    "moose_night": "moose_wildlife",
    "mtwashington": "mt_washington",
    "old_man_mountain": "old_man_mountain",
    "pawtuckaway": "pawtuckaway",
    "pawtuckaway_real": "pawtuckaway",
    "pemigewasset": "lower_falls",         # Swift River feeds Pemigewasset
    "perch_cabin": "coleman_state_park",   # Perch Cabin is in Coleman State Park
    "profile_lake": "profile_lake",
    "railway": "granite_state_railway",
    "rocky_gorge": "rocky_gorge",
    "sabbaday_falls": "sabbaday_falls",
    "solar_shower": "campfire",            # camping fallback
    "stargazing": "stargazing",
    "sunset_lake": "lake_sunset",
    "table_rock": "table_rock",
    "table_rock_real": "table_rock",
    "the_basin": "the_basin",
    "waterfall": "huntington_cascades",
}

# Alt text per key (kept from the existing images.ts where possible).
ALT = {
    "artists_bluff": "Artists Bluff Trail Franconia Notch scenic view",
    "bakery": "French bakery pastries and coffee",
    "balsams": "Balsams Grand Resort historic hotel",
    "balsams_resort_real": "Balsams Grand Resort Dixville Notch historic hotel",
    "bear_brook_real": "Bear Brook State Park cabin Allenstown New Hampshire",
    "bearbrook": "Bear Brook State Park forest pond and cabin",
    "benson_park": "Benson Park abandoned wild animal farm Hudson NH",
    "cabin": "Rustic log cabin porch forest",
    "campfire": "Romantic campfire in forest at night",
    "canoe": "Canoe paddle peaceful lake sunset",
    "colebrook_nh": "Colebrook New Hampshire downtown main street",
    "coleman": "Coleman State Park cabin wilderness pond",
    "coleman_state_park_real": "Coleman State Park Little Diamond Pond cabin",
    "connecticut_lakes": "Connecticut Lakes Pittsburg New Hampshire Fourth Lake border",
    "cookout": "Camp cooking cast iron skillet",
    "dixville": "Dixville Notch mountain cliffs at sunset",
    "dixville_notch_real": "Dixville Notch Table Rock Lake Gloriette scenic",
    "echo_lake": "Echo Lake Franconia Notch swimming beach",
    "flume": "Flume Gorge waterfall boardwalk",
    "flume_gorge_real": "Flume Gorge boardwalk Franconia Notch New Hampshire",
    "forest_pine": "Deep pine forest trail New England",
    "franconia": "Franconia Notch White Mountains foliage",
    "franconia_notch": "Franconia Notch State Park New Hampshire scenic drive",
    "granite_railway_real": "Granite State Scenic Railway Lincoln NH train",
    "hammock_pine": "Hammock pine trees lake forest relaxing",
    "hiking": "New England hiking trail forest",
    "historic": "Historic New England grand resort hotel",
    "huntington_cascade_real": "Huntington Falls Colebrook waterfall",
    "kancamagus_highway": "Kancamagus Highway White Mountains scenic fall",
    "le_rendezvous_colebrook": "Le Rendez-Vous Cafe Colebrook French bakery",
    "lower_falls": "Lower Falls Swift River Kancamagus swimming hole",
    "moose": "Wild moose in New Hampshire twilight",
    "moose_night": "Wild moose New Hampshire Pittsburg twilight",
    "mtwashington": "Mount Washington White Mountains summit",
    "old_man_mountain": "Old Man of the Mountain Memorial Franconia Notch",
    "pawtuckaway": "Pawtuckaway State Park lake and boulder beach",
    "pawtuckaway_real": "Pawtuckaway State Park Big Island cabin lake",
    "pemigewasset": "Pemigewasset River White Mountains",
    "perch_cabin": "Perch Cabin Coleman State Park rustic",
    "profile_lake": "Profile Lake Franconia Notch Cannon Mountain",
    "railway": "Granite State Scenic Railway vintage train",
    "rocky_gorge": "Rocky Gorge Kancamagus Highway scenic",
    "sabbaday_falls": "Sabbaday Falls Kancamagus Highway waterfall",
    "solar_shower": "Solar shower camping outdoor lake",
    "stargazing": "Milky Way night sky dark sky wilderness",
    "sunset_lake": "Mountain lake sunset golden hour reflection",
    "table_rock": "Table Rock cliffs granite face Dixville Notch",
    "table_rock_real": "Table Rock Dixville Notch cliff face New Hampshire",
    "the_basin": "The Basin Franconia Notch glacial pothole waterfall",
    "waterfall": "New Hampshire waterfall cascade",
}


def main():
    # Pre-load each slug once.
    slug_cache = {}
    for slug in set(KEY_TO_SLUG.values()):
        slug_cache[slug] = load_results(slug)

    # Build entries in alphabetical key order (matches existing file).
    keys_sorted = sorted(KEY_TO_SLUG.keys())

    print(f"{'KEY':<28} {'SLUG':<24} URLS")
    print("-" * 70)
    lines = []
    for k in keys_sorted:
        slug = KEY_TO_SLUG[k]
        urls = list(slug_cache[slug])
        # Cap at 5 URLs per key.
        urls = urls[:5]
        alt = ALT.get(k, k.replace("_", " ").title())
        urls_str = ", ".join(f'"{u}"' for u in urls)
        block = (
            f"  {k}: {{\n"
            f"    key: \"{k}\",\n"
            f"    urls: [{urls_str}],\n"
            f"    alt: `{alt}`,\n"
            f"  }},"
        )
        lines.append(block)
        print(f"{k:<28} {slug:<24} {len(urls)}")

    body = "\n".join(lines)
    out = (
        "/**\n"
        " * Image Registry (v3 — real-photo sources)\n"
        " * Maps image keys to OSS-hosted image URLs fetched via z-ai image-search.\n"
        " *\n"
        " * Sources: real visitor photos from Tripadvisor, Yelp, NH State Parks,\n"
        " * WMUR, Yankee Magazine, Union Leader, Reddit, YouTube, hiking blogs,\n"
        " * US Forest Service / NPS, etc. Stock-photo sites (Alamy, Shutterstock,\n"
        " * Getty, Dreamstime, etc.) and tiny thumbnails are filtered out.\n"
        " */\n"
        "\n"
        "export type ImageEntry = {\n"
        "  key: string;\n"
        "  urls: string[];\n"
        "  alt: string;\n"
        "};\n"
        "\n"
        "export const IMAGES: Record<string, ImageEntry> = {\n"
        f"{body}\n"
        "};\n"
        "\n"
        "/**\n"
        " * Get image URL by key. If no URLs available, returns null (caller should fallback to gradient).\n"
        " */\n"
        "export function getImage(key: string, variant: number = 0): string | null {\n"
        "  const entry = IMAGES[key];\n"
        "  if (!entry || entry.urls.length === 0) return null;\n"
        "  return entry.urls[variant % entry.urls.length];\n"
        "}\n"
        "\n"
        "/**\n"
        " * Get all image URLs for a set of keys (for galleries / carousels).\n"
        " */\n"
        "export function getImages(keys: string[] = []): { key: string; url: string; alt: string }[] {\n"
        "  const out: { key: string; url: string; alt: string }[] = [];\n"
        "  for (const key of keys) {\n"
        "    const entry = IMAGES[key];\n"
        "    if (!entry) continue;\n"
        "    for (const url of entry.urls) {\n"
        "      out.push({ key, url, alt: entry.alt });\n"
        "    }\n"
        "  }\n"
        "  return out;\n"
        "}\n"
    )
    with open(OUT_TS, "w") as f:
        f.write(out)
    print(f"\nWrote {OUT_TS}")
    total_urls = sum(len(list(slug_cache[KEY_TO_SLUG[k]])[:5]) for k in keys_sorted)
    print(f"Total keys: {len(keys_sorted)} | Total URLs: {total_urls}")


if __name__ == "__main__":
    main()
