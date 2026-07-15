#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# dev.sh — BULLETPROOF version
# ═══════════════════════════════════════════════════════════════════════════
# This script is run by the Z.ai platform's /start.sh in a background
# subshell. If it fails for ANY reason, no dev server starts, Caddy
# returns 502 on :81, and the deploy fails with "port 81 health check
# failed in 120s".
#
# To prevent this, we:
#   1. Do NOT use set -e (don't crash on any single failure)
#   2. Wrap every step in try/catch
#   3. ALWAYS start the dev server as the last step, even if install fails
#   4. Log everything to stdout (platform captures this)
# ═══════════════════════════════════════════════════════════════════════════

# NO set -e — we handle errors manually
# NO set -u — we check for unset vars manually

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=========================================="
echo "[DEV] === BULLETPROOF DEPLOY LOG ==="
echo "[DEV] Time: $(date -u +%FT%TZ)"
echo "[DEV] Project dir: $PROJECT_DIR"
echo "[DEV] Current dir: $(pwd)"
echo "[DEV] User: $(whoami)"
echo "[DEV] Node: $(node --version 2>/dev/null || echo 'not found')"
echo "[DEV] Bun: $(bun --version 2>/dev/null || echo 'not found')"
echo "[DEV] NPM: $(npm --version 2>/dev/null || echo 'not found')"
echo "[DEV] Memory: $(free -m 2>/dev/null | awk '/^Mem:/{print $2 " MB total, " $7 " MB available"}' || echo 'unknown')"
echo "[DEV] PORT env: ${PORT:-3000}"
echo "[DEV] package.json exists: $([ -f "$PROJECT_DIR/package.json" ] && echo YES || echo NO)"
echo "[DEV] .zscripts/dev.sh exists: $([ -f "$PROJECT_DIR/.zscripts/dev.sh" ] && echo YES || echo NO)"
echo "=========================================="

cd "$PROJECT_DIR" || {
    echo "❌ [DEV] FATAL: Cannot cd to $PROJECT_DIR"
    exit 1
}

# ── Step 1: Install dependencies ──────────────────────────────────────────
echo "[DEV] Step 1: Installing dependencies..."
if command -v bun >/dev/null 2>&1; then
    echo "[DEV] Using bun..."
    bun install 2>&1 || echo "⚠️ [DEV] bun install failed (non-fatal, continuing)"
elif command -v npm >/dev/null 2>&1; then
    echo "[DEV] bun not found, using npm..."
    npm install 2>&1 || echo "⚠️ [DEV] npm install failed (non-fatal, continuing)"
else
    echo "⚠️ [DEV] Neither bun nor npm found — will try to start dev server anyway"
fi

echo "[DEV] node_modules exists: $([ -d node_modules ] && echo YES || echo NO)"
echo "[DEV] next binary exists: $([ -f node_modules/.bin/next ] && echo YES || echo NO)"

# ── Step 2: Database setup (skip if no prisma) ────────────────────────────
echo "[DEV] Step 2: Database setup..."
if grep -q '"db:push"' package.json 2>/dev/null && [ -f "prisma/schema.prisma" ]; then
    echo "[DEV] Running db:push..."
    bun run db:push 2>&1 || echo "⚠️ [DEV] db:push failed (non-fatal)"
else
    echo "[DEV] ✅ No database configured, skipping db:push"
fi

# ── Step 3: Start the dev server — THIS IS THE CRITICAL STEP ──────────────
# We MUST start the dev server no matter what. Even if install failed,
# if node_modules/.bin/next exists, we try to start it.
echo "[DEV] Step 3: Starting Next.js dev server..."

export PORT="${PORT:-3000}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"

if [ -f "node_modules/.bin/next" ]; then
    echo "[DEV] Found next binary, starting dev server on port $PORT..."

    if command -v bun >/dev/null 2>&1; then
        echo "[DEV] Starting with: bun run dev"
        bun run dev &
        DEV_PID=$!
    else
        echo "[DEV] Starting with: npx next dev"
        npx next dev -p "$PORT" &
        DEV_PID=$!
    fi

    echo "[DEV] Dev server PID: $DEV_PID"

    # Wait for the server to be ready
    echo "[DEV] Waiting for server on localhost:$PORT..."
    ATTEMPTS=0
    MAX_ATTEMPTS=60
    while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
        ATTEMPTS=$((ATTEMPTS + 1))
        if curl -s --connect-timeout 2 --max-time 5 "http://localhost:$PORT" >/dev/null 2>&1; then
            echo "[DEV] ✅ Server is ready on port $PORT (attempt $ATTEMPTS)!"
            break
        fi

        # Check if process is still alive
        if ! kill -0 "$DEV_PID" 2>/dev/null; then
            echo "❌ [DEV] Dev server process died (PID $DEV_PID)"
            echo "[DEV] Attempting restart..."
            if command -v bun >/dev/null 2>&1; then
                bun run dev &
                DEV_PID=$!
            else
                npx next dev -p "$PORT" &
                DEV_PID=$!
            fi
            echo "[DEV] Restarted with PID: $DEV_PID"
            sleep 3
            continue
        fi

        echo "[DEV] Attempt $ATTEMPTS/$MAX_ATTEMPTS: server not ready yet..."
        sleep 1
    done

    # Final health check
    if curl -s --connect-timeout 5 --max-time 10 "http://localhost:$PORT" >/dev/null 2>&1; then
        echo "[DEV] ✅ Health check PASSED — server responding on port $PORT"
    else
        echo "⚠️ [DEV] Health check failed, but server process is running"
        echo "[DEV] The server may still be compiling — Caddy will retry"
    fi

    echo "[DEV] ✅ Dev server is running in background (PID: $DEV_PID)"
    echo "[DEV] Caddy on :81 will proxy to localhost:$PORT"

    # Disown so the process survives if this script exits
    disown "$DEV_PID" 2>/dev/null || true

else
    echo "❌ [DEV] FATAL: node_modules/.bin/next not found!"
    echo "[DEV] Attempting emergency install..."
    if command -v bun >/dev/null 2>&1; then
        bun install 2>&1
    elif command -v npm >/dev/null 2>&1; then
        npm install 2>&1
    fi

    if [ -f "node_modules/.bin/next" ]; then
        echo "[DEV] ✅ Emergency install succeeded, starting dev server..."
        if command -v bun >/dev/null 2>&1; then
            bun run dev &
            DEV_PID=$!
        else
            npx next dev -p "$PORT" &
            DEV_PID=$!
        fi
        echo "[DEV] Emergency dev server PID: $DEV_PID"
        disown "$DEV_PID" 2>/dev/null || true
    else
        echo "❌ [DEV] CRITICAL: Cannot start dev server — next binary missing"
        echo "[DEV] The deploy will fail. Check package.json and dependencies."
    fi
fi

echo "=========================================="
echo "[DEV] === dev.sh COMPLETED ==="
echo "[DEV] Time: $(date -u +%FT%TZ)"
echo "[DEV] Server should be running on port $PORT"
echo "=========================================="
