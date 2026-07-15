#!/usr/bin/env bash
# Full Gauntlet Test Suite for J & Dee's Wilderness Romance App
# Run this script to verify all features are working

set -e

APP_URL="http://localhost:3000"
PASS=0
FAIL=0
WARN=0

echo "=========================================="
echo "🧪 J & Dee App — Full Test Gauntlet"
echo "=========================================="
echo ""

# 1. HTTP Health Check
echo -n "1. HTTP Health Check... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/")
TIME=$(curl -s -o /dev/null -w "%{time_total}" "$APP_URL/")
if [ "$STATUS" = "200" ]; then
  echo "✅ PASS (200, ${TIME}s)"
  PASS=$((PASS + 1))
else
  echo "❌ FAIL ($STATUS)"
  FAIL=$((FAIL + 1))
fi

# 2. PWA Manifest
echo -n "2. PWA Manifest... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/manifest.json")
if [ "$STATUS" = "200" ]; then
  echo "✅ PASS"
  PASS=$((PASS + 1))
else
  echo "❌ FAIL ($STATUS)"
  FAIL=$((FAIL + 1))
fi

# 3. Service Worker
echo -n "3. Service Worker... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/sw.js")
if [ "$STATUS" = "200" ]; then
  echo "✅ PASS"
  PASS=$((PASS + 1))
else
  echo "❌ FAIL ($STATUS)"
  FAIL=$((FAIL + 1))
fi

# 4. PWA Icons
echo -n "4. PWA Icons... "
ICON192=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/icons/icon-192.png")
ICON512=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/icons/icon-512.png")
if [ "$ICON192" = "200" ] && [ "$ICON512" = "200" ]; then
  echo "✅ PASS"
  PASS=$((PASS + 1))
else
  echo "❌ FAIL (192:$ICON192, 512:$ICON512)"
  FAIL=$((FAIL + 1))
fi

# 5. Couple Photos
echo -n "5. Couple Photos (11)... "
ALL_OK=true
for i in $(seq 1 11); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/couple/photo-$i.jpg")
  if [ "$STATUS" != "200" ]; then
    echo "❌ FAIL (photo-$i: $STATUS)"
    ALL_OK=false
    break
  fi
done
if [ "$ALL_OK" = true ]; then
  echo "✅ PASS (all 11 accessible)"
  PASS=$((PASS + 1))
else
  FAIL=$((FAIL + 1))
fi

# 6. Lint Check
echo -n "6. ESLint... "
cd /home/z/my-project
LINT_OUTPUT=$(bun run lint 2>&1)
if echo "$LINT_OUTPUT" | grep -q "error"; then
  echo "❌ FAIL (errors found)"
  FAIL=$((FAIL + 1))
elif echo "$LINT_OUTPUT" | grep -q "warning"; then
  echo "⚠️ WARN (warnings found)"
  WARN=$((WARN + 1))
else
  echo "✅ PASS (clean)"
  PASS=$((PASS + 1))
fi

# 7. Check for TypeScript files
echo -n "7. Source files exist... "
FILES_OK=true
for f in src/app/page.tsx src/app/layout.tsx src/lib/trip-data.ts src/lib/timers.ts src/lib/tone-engine.ts src/lib/songs.ts src/lib/use-song-player.ts src/lib/app-pages.ts src/lib/day-themes.ts src/lib/confetti.ts src/lib/analytics.ts src/components/trip/AppShell.tsx src/components/trip/RingBox3DIntro.tsx src/components/trip/SoundToggle.tsx src/components/trip/FloatingShareButton.tsx src/components/trip/ComplexTexturedBackground.tsx src/components/trip/LoadingScreen.tsx src/components/trip/OnboardingHints.tsx src/components/trip/pages/HomePage.tsx src/components/trip/pages/StoryPage.tsx src/components/trip/pages/MapPage.tsx src/components/trip/pages/DaysPage.tsx src/components/trip/pages/RingPage.tsx; do
  if [ ! -f "$f" ]; then
    echo "❌ FAIL ($f missing)"
    FILES_OK=false
    break
  fi
done
if [ "$FILES_OK" = true ]; then
  echo "✅ PASS (all 20 files exist)"
  PASS=$((PASS + 1))
else
  FAIL=$((FAIL + 1))
fi

# 8. Dependencies installed
echo -n "8. Dependencies... "
DEPS_OK=true
for dep in three @react-three/fiber @react-three/drei tone canvas-confetti leaflet react-leaflet framer-motion; do
  if ! grep -q "\"$dep\"" package.json; then
    echo "❌ FAIL ($dep not in package.json)"
    DEPS_OK=false
    break
  fi
done
if [ "$DEPS_OK" = true ]; then
  echo "✅ PASS (all 8 deps present)"
  PASS=$((PASS + 1))
else
  FAIL=$((FAIL + 1))
fi

# 9. Check for gendered pronouns
echo -n "9. Gender-neutral pronouns... "
GENDERED=$(grep -rn "\bhis\b\|\bher\b\|\bshe \|\bhe " src/lib/ src/components/ --include="*.ts" --include="*.tsx" | grep -v "his-and\|His &\|heritage\|here\|himself\|herself\|Webster\|God Almighty\|node_modules\|quotes.ts" | wc -l)
if [ "$GENDERED" = "0" ]; then
  echo "✅ PASS (no gendered pronouns)"
  PASS=$((PASS + 1))
else
  echo "⚠️ WARN ($GENDERED potential gendered references)"
  WARN=$((WARN + 1))
fi

# 10. Check PWA manifest content
echo -n "10. Manifest content... "
MANIFEST=$(curl -s "$APP_URL/manifest.json")
if echo "$MANIFEST" | grep -q "standalone" && echo "$MANIFEST" | grep -q "icon-192"; then
  echo "✅ PASS (standalone + icons)"
  PASS=$((PASS + 1))
else
  echo "❌ FAIL (missing fields)"
  FAIL=$((FAIL + 1))
fi

# Summary
echo ""
echo "=========================================="
echo "📊 Test Results Summary"
echo "=========================================="
echo "✅ Pass: $PASS"
echo "❌ Fail: $FAIL"
echo "⚠️  Warn: $WARN"
echo "=========================================="
if [ "$FAIL" = "0" ]; then
  echo "🎉 ALL TESTS PASSED!"
else
  echo "⚠️  $FAIL test(s) failed — review above"
fi
