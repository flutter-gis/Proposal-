#!/usr/bin/env bash
# Audit which src/components and src/lib files are actually imported.
# Outputs: USED files and ORPHAN candidates.

set -u
cd /home/z/my-project

echo "=== Auditing src/components/trip ==="
for f in src/components/trip/*.tsx; do
  base=$(basename "$f" .tsx)
  # Search for the component name being imported from this path anywhere in src/
  # (excluding the file itself)
  count=$(grep -rE "from [\"']@/components/trip/${base}[\"']|from [\"']\./${base}[\"']|from [\"']\.\./${base}[\"']" src/ --include='*.ts' --include='*.tsx' 2>/dev/null | grep -v "^${f}:" | wc -l)
  if [ "$count" -eq 0 ]; then
    # Check for dynamic import via string
    dyn=$(grep -rE "import\([\"']@/components/trip/${base}[\"']" src/ --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l)
    if [ "$dyn" -eq 0 ]; then
      echo "ORPHAN  $f"
    else
      echo "DYN-USED $f"
    fi
  else
    echo "USED    $f"
  fi
done

echo
echo "=== Auditing src/lib ==="
for f in src/lib/*.ts src/lib/*.tsx; do
  [ -e "$f" ] || continue
  base=$(basename "$f")
  base_noext="${base%.*}"
  count=$(grep -rE "from [\"']@/lib/${base_noext}[\"']|from [\"']\./${base}[\"']|from [\"']\.\./${base}[\"']" src/ --include='*.ts' --include='*.tsx' 2>/dev/null | grep -v "^${f}:" | wc -l)
  if [ "$count" -eq 0 ]; then
    echo "ORPHAN  $f"
  else
    echo "USED    $f"
  fi
done

echo
echo "=== Other junk candidates at project root ==="
for p in MUSIC_SYNTHESIS_RESEARCH.md RESEARCH_REPORT.md worklog.md repo.tar; do
  if [ -e "$p" ]; then
    sz=$(du -sh "$p" | cut -f1)
    echo "EXISTS  $p  ($sz)"
  fi
done
for d in tool-results screenshots upload mini-services db scripts download; do
  if [ -d "$d" ]; then
    sz=$(du -sh "$d" | cut -f1)
    files=$(find "$d" -type f 2>/dev/null | wc -l)
    echo "DIR     $d  ($sz, $files files)"
  fi
done
