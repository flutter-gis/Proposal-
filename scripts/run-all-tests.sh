#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# run-all-tests.sh — Master test runner
# ═══════════════════════════════════════════════════════════════════════════
# Runs all test suites in sequence and aggregates results.
#
# Usage:
#   bash scripts/run-all-tests.sh
# ═══════════════════════════════════════════════════════════════════════════

set -u
cd /home/z/my-project

echo "════════════════════════════════════════════════════════════════════════════"
echo "  WILDERNESS ROMANCE — FULL TEST SUITE"
echo "  $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "════════════════════════════════════════════════════════════════════════════"
echo

# Check server is up
if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:81/ | grep -q "200"; then
  echo "❌ Server not running on :81. Start it first: bash .zscripts/dev.sh"
  exit 1
fi
echo "✓ Server is up on :81"
echo

# Close any lingering browser
agent-browser close 2>/dev/null || true
sleep 1

# Track results
declare -a SUITES
declare -a RESULTS
TOTAL_PASS=0
TOTAL_FAIL=0

run_suite() {
  local name="$1"
  local script="$2"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Running: $name"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  if node "$script" 2>&1 | tee /tmp/test-output.txt; then
    SUITES+=("$name")
    RESULTS+=("PASS")
  else
    SUITES+=("$name")
    RESULTS+=("FAIL")
  fi

  # Extract pass/fail counts from output
  local summary=$(grep "SUMMARY:" /tmp/test-output.txt | tail -1)
  echo "  → $summary"
  echo

  # Close browser between suites
  agent-browser close 2>/dev/null || true
  sleep 1
}

# Run each suite
run_suite "Unit Tests (lib utilities)"      "scripts/unit-tests.mjs"
run_suite "E2E Flow Tests (user journeys)"  "scripts/e2e-tests.mjs"
run_suite "Accessibility Tests (ARIA, keyboard)" "scripts/a11y-tests.mjs"
run_suite "Mobile Viewport Tests (375px)"   "scripts/mobile-tests.mjs"
run_suite "Performance Tests (load, DOM)"   "scripts/perf-tests.mjs"
run_suite "PWA Tests (SW, manifest, offline)" "scripts/pwa-tests.mjs"
run_suite "Theme System Tests (12 themes)"  "scripts/theme-tests.mjs"
run_suite "3D Reveal Tests (box click flow)" "scripts/reveal-tests.mjs"
run_suite "Audit Verification (27 findings)" "scripts/audit-verify.mjs"
run_suite "Icon Audit (emoji + SVG spec)"   "scripts/icon-audit.mjs"
run_suite "Icon Component Tests (registry)" "scripts/icon-component-tests.mjs"
run_suite "Component Tests (SlideDeck, etc)" "scripts/component-tests.mjs"
run_suite "Routing Tests (deep links)"      "scripts/routing-tests.mjs"
run_suite "Persistence Tests (localStorage)" "scripts/persistence-tests.mjs"
run_suite "Edge Case Tests (404, offline)"  "scripts/edge-case-tests.mjs"
run_suite "Theme System Tests (12 themes)"  "scripts/theme-tests.mjs"
run_suite "3D Reveal Tests (box click flow)" "scripts/reveal-tests.mjs"
run_suite "Audit Verification (27 findings)" "scripts/audit-verify.mjs"

# Final summary
echo "════════════════════════════════════════════════════════════════════════════"
echo "  FINAL RESULTS"
echo "════════════════════════════════════════════════════════════════════════════"
for i in "${!SUITES[@]}"; do
  printf "  %-50s %s\n" "${SUITES[$i]}" "${RESULTS[$i]}"
done
echo "════════════════════════════════════════════════════════════════════════════"

# Count pass/fail
PASS_COUNT=0
FAIL_COUNT=0
for r in "${RESULTS[@]}"; do
  if [ "$r" = "PASS" ]; then
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
done

echo "  Suites passed: $PASS_COUNT / ${#RESULTS[@]}"
echo "  Suites failed: $FAIL_COUNT / ${#RESULTS[@]}"
echo "════════════════════════════════════════════════════════════════════════════"

# Aggregate individual test counts from JSON files
echo
echo "  Individual test counts:"
for f in /tmp/*-results.json; do
  if [ -f "$f" ]; then
    name=$(basename "$f" .json)
    p=$(python3 -c "import json; d=json.load(open('$f')); print(d.get('passed', '?'))" 2>/dev/null)
    t=$(python3 -c "import json; d=json.load(open('$f')); print(d.get('total', '?'))" 2>/dev/null)
    printf "    %-30s %s/%s\n" "$name" "$p" "$t"
  fi
done
echo "════════════════════════════════════════════════════════════════════════════"

exit $FAIL_COUNT
