#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# dev.sh — Z.ai Platform Entry Point
# ═══════════════════════════════════════════════════════════════════════════
# This script is run by the Z.ai platform's container orchestration.
#
# Z.ai Architecture:
#   - Platform runs this script as the container CMD
#   - Platform provides Caddy on :81 that proxies to localhost:3000
#   - Platform health-checks :81 (must return 200)
#   - We ONLY need to start Next.js on :3000 and keep it alive
#   - We do NOT need to run our own Caddy
#
# This script:
#   1. Installs dependencies (bun or npm)
#   2. Starts Next.js dev server on :3000
#   3. Waits for health check to pass
#   4. Keeps the process alive (foreground)
# ═══════════════════════════════════════════════════════════════════════════

# NO set -e — we handle errors manually
# NO set -u — we check for unset vars manually

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=========================================="
echo "[DEV] === Z.AI DEPLOY LOG ==="
echo "[DEV] Time: $(date -u +%FT%TZ)"
echo "[DEV] Project dir: $PROJECT_DIR"
echo "[DEV] Node: $(node --version 2>/dev/null || echo 'not found')"
echo "[DEV] Bun: $(bun --version 2>/dev/null || echo 'not found')"
echo "[DEV] NPM: $(npm --version 2>/dev/null || echo 'not found')"
echo "[DEV] PORT env: ${PORT:-3000}"
echo "=========================================="

cd "$PROJECT_DIR" || {
    echo "❌ [DEV] FATAL: Cannot cd to $PROJECT_DIR"
    exit 1
}

# ── Step 1: Install dependencies ──────────────────────────────────────
echo "[DEV] Step 1: Installing dependencies..."

if [ ! -d "node_modules" ]; then
    if command -v bun >/dev/null 2>&1; then
        echo "[DEV] Using bun..."
        bun install 2>&1 || echo "⚠️ [DEV] bun install failed (non-fatal)"
    elif command -v npm >/dev/null 2>&1; then
        echo "[DEV] Using npm..."
        npm install 2>&1 || echo "⚠️ [DEV] npm install failed (non-fatal)"
    else
        echo "⚠️ [DEV] Neither bun nor npm found"
    fi
else
    echo "[DEV] node_modules exists, skipping install"
fi

# Verify next binary exists
if [ ! -f "node_modules/.bin/next" ]; then
    echo "[DEV] next binary missing, attempting emergency install..."
    if command -v bun >/dev/null 2>&1; then
        bun install 2>&1
    elif command -v npm >/dev/null 2>&1; then
        npm install 2>&1
    fi
fi

# ── Step 2: Start Next.js dev server ──────────────────────────────────
echo "[DEV] Step 2: Starting Next.js dev server on port ${PORT:-3000}..."

# Use bun if available (faster), otherwise npm/npx
if command -v bun >/dev/null 2>&1; then
    echo "[DEV] Starting with: bun run dev"
    bun run dev &
    DEV_PID=$!
else
    echo "[DEV] Starting with: npx next dev"
    npx next dev -p ${PORT:-3000} &
    DEV_PID=$!
fi

echo "[DEV] Dev server PID: $DEV_PID"

# ── Step 3: Wait for server to be ready ───────────────────────────────
echo "[DEV] Step 3: Waiting for server on localhost:${PORT:-3000}..."

for attempt in $(seq 1 60); do
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:${PORT:-3000}/" 2>/dev/null | grep -q "200"; then
        echo "[DEV] ✅ Server is ready on port ${PORT:-3000} (attempt $attempt)!"
        break
    fi
    echo "[DEV] Attempt $attempt/60: server not ready yet..."

    # Check if process died
    if ! kill -0 $DEV_PID 2>/dev/null; then
        echo "[DEV] ❌ Dev server process died (PID: $DEV_PID)"
        echo "[DEV] Attempting emergency restart..."
        if command -v bun >/dev/null 2>&1; then
            bun run dev &
            DEV_PID=$!
        else
            npx next dev -p ${PORT:-3000} &
            DEV_PID=$!
        fi
        echo "[DEV] Restarted with PID: $DEV_PID"
        sleep 5
        continue
    fi
    sleep 2
done

# Final health check
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${PORT:-3000}/" 2>/dev/null)
if [ "$HTTP_CODE" = "200" ]; then
    echo "[DEV] ✅ Health check PASSED — server responding on port ${PORT:-3000}"
    echo "[DEV] ✅ Platform Caddy on :81 will proxy to localhost:${PORT:-3000}"
else
    echo "[DEV] ⚠️ Health check returned: $HTTP_CODE"
    echo "[DEV] Server may still be compiling — continuing anyway"
fi

echo "=========================================="
echo "[DEV] === dev.sh COMPLETED ==="
echo "[DEV] Server should be running on port ${PORT:-3000}"
echo "[DEV] Platform proxy on :81 → localhost:${PORT:-3000}"
echo "=========================================="

# ── Step 4: Keep alive — monitor the dev server ───────────────────────
# This is critical: the script MUST stay in the foreground to keep
# the container alive. If this script exits, the container dies.
while true; do
    if ! kill -0 $DEV_PID 2>/dev/null; then
        echo "[MONITOR] Dev server died, restarting..."
        cd "$PROJECT_DIR"
        if command -v bun >/dev/null 2>&1; then
            bun run dev &
            DEV_PID=$!
        else
            npx next dev -p ${PORT:-3000} &
            DEV_PID=$!
        fi
        echo "[MONITOR] Restarted with PID: $DEV_PID"
        sleep 10
    fi
    sleep 5
done
