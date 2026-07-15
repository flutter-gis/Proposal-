#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# cleanup.sh — Full-scale project cleanup
# ═══════════════════════════════════════════════════════════════════════════
# Removes:
#   1. Orphan source files (verified unused via import audit)
#   2. Root-level research/junk markdown files
#   3. Junk scratch directories (tool-results, screenshots, upload, mini-services)
#   4. Old one-time-use scripts in scripts/ (keeps only still-useful ones)
#   5. Build caches (.next, tsconfig.tsbuildinfo, node_modules/.cache)
#   6. Stale empty dirs
#
# Preserves:
#   - All src/ code (except 2 verified orphans)
#   - public/ assets (real photos, icons)
#   - skills/ (skill files — not ours to touch)
#   - .git/ (version history)
#   - .zscripts/ (deploy scripts)
#   - worklog.md (shared multi-agent log)
#   - db/ (SQLite database)
#   - download/ (deliverable directory)
#   - package-lock.json + bun.lock (both, for install resilience)
# ═══════════════════════════════════════════════════════════════════════════

set -u
cd /home/z/my-project

ORIG_SIZE=$(du -sh . 2>/dev/null | cut -f1)
echo "=== Project size BEFORE cleanup: $ORIG_SIZE ==="
echo

# ─────────────────────────────────────────────────────────────────────────
# 1. Orphan source files (verified unused — checked via import audit)
# ─────────────────────────────────────────────────────────────────────────
echo "── 1. Removing orphan source files ──"
ORPHANS=(
  "src/components/trip/Carousel.tsx"      # replaced by SlideDeck, only mentioned in a comment
  "src/components/trip/SourcesPage.tsx"   # replaced by inline SourcesModal in page.tsx
)
for f in "${ORPHANS[@]}"; do
  if [ -f "$f" ]; then
    echo "  rm $f"
    rm -f "$f"
  fi
done
echo

# ─────────────────────────────────────────────────────────────────────────
# 2. Root-level research/junk markdown files
# ─────────────────────────────────────────────────────────────────────────
echo "── 2. Removing root-level junk markdown ──"
JUNK_ROOT=(
  "MUSIC_SYNTHESIS_RESEARCH.md"   # research notes, no longer referenced
  "RESEARCH_REPORT.md"            # research notes, no longer referenced
  "tsconfig.tsbuildinfo"          # TS incremental-build cache, regenerates
)
for f in "${JUNK_ROOT[@]}"; do
  if [ -f "$f" ]; then
    sz=$(du -sh "$f" | cut -f1)
    echo "  rm $f ($sz)"
    rm -f "$f"
  fi
done
echo

# ─────────────────────────────────────────────────────────────────────────
# 3. Junk scratch directories
# ─────────────────────────────────────────────────────────────────────────
echo "── 3. Removing junk scratch directories ──"
JUNK_DIRS=(
  "tool-results"     # read snapshots from prior sessions
  "screenshots"      # debug screenshots from VLM verification runs
  "upload"           # user-uploaded scratch files from prior sessions
  "mini-services"    # empty placeholder dir, never used
)
for d in "${JUNK_DIRS[@]}"; do
  if [ -d "$d" ]; then
    sz=$(du -sh "$d" | cut -f1)
    files=$(find "$d" -type f 2>/dev/null | wc -l)
    echo "  rm -rf $d ($sz, $files files)"
    rm -rf "$d"
  fi
done
echo

# ─────────────────────────────────────────────────────────────────────────
# 4. Old one-time-use scripts in scripts/
#    Keep only: audit-imports.sh, convert-photos.js, optimize-photos-v2.js,
#               fetch-routes.ts
# ─────────────────────────────────────────────────────────────────────────
echo "── 4. Cleaning scripts/ directory ──"
KEEP_SCRIPTS=(
  "audit-imports.sh"
  "convert-photos.js"
  "optimize-photos-v2.js"
  "fetch-routes.ts"
  "cleanup.sh"
)
if [ -d scripts ]; then
  BEFORE=$(find scripts -type f | wc -l)
  for entry in scripts/*; do
    name=$(basename "$entry")
    keep=false
    for k in "${KEEP_SCRIPTS[@]}"; do
      if [ "$name" = "$k" ]; then
        keep=true
        break
      fi
    done
    if [ "$keep" = false ]; then
      rm -rf "$entry"
      echo "  rm scripts/$name"
    fi
  done
  AFTER=$(find scripts -type f | wc -l)
  echo "  scripts/ went from $BEFORE files to $AFTER files"
fi
echo

# ─────────────────────────────────────────────────────────────────────────
# 5. Build caches
# ─────────────────────────────────────────────────────────────────────────
echo "── 5. Clearing build caches ──"
for c in ".next" "node_modules/.cache" ".turbo" ".parcel-cache"; do
  if [ -d "$c" ]; then
    sz=$(du -sh "$c" | cut -f1)
    echo "  rm -rf $c ($sz)"
    rm -rf "$c"
  fi
done
# Also any stray standalone dirs from prior builds
if [ -d ".next/standalone" ]; then rm -rf .next/standalone; fi
echo

# ─────────────────────────────────────────────────────────────────────────
# 6. Stale empty dirs (find and remove)
# ─────────────────────────────────────────────────────────────────────────
echo "── 6. Removing stale empty directories ──"
find src scripts public db .zscripts -type d -empty -print -delete 2>/dev/null | sed 's/^/  rmdir /'
echo

# ─────────────────────────────────────────────────────────────────────────
# Final report
# ─────────────────────────────────────────────────────────────────────────
NEW_SIZE=$(du -sh . 2>/dev/null | cut -f1)
echo "=== Project size AFTER cleanup: $NEW_SIZE ==="
echo "=== Cleanup complete. Run 'npx next build' to verify integrity. ==="
