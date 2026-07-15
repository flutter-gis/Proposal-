#!/bin/sh

# ═══════════════════════════════════════════════════════════════════════════
# start.sh — Production container entrypoint for Z.ai FC deploy
# ═══════════════════════════════════════════════════════════════════════════
# This script is the container CMD in the FC (Function Compute) deployment.
# It MUST:
#   1. Start Next.js standalone server on 0.0.0.0:3000
#   2. Start Caddy on 0.0.0.0:81 (reverse proxy :81 → :3000)
#   3. Keep running in the foreground (Caddy is the foreground process)
#
# The FC health check does a TCP connect to port 81 within 120 seconds.
# If Caddy isn't listening on 0.0.0.0:81 within 120s, the deploy fails.
# ═══════════════════════════════════════════════════════════════════════════

# NO set -e — we handle errors manually to avoid crashing on non-fatal issues

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD_DIR="$SCRIPT_DIR"

pids=""

cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    for pid in $pids; do
        kill -TERM "$pid" 2>/dev/null
    done
    sleep 1
    for pid in $pids; do
        kill -KILL "$pid" 2>/dev/null
    done
    echo "✅ All services stopped"
    exit 0
}

trap cleanup TERM INT

echo "=========================================="
echo "[START] === PRODUCTION DEPLOY START ==="
echo "[START] Time: $(date -u +%FT%TZ)"
echo "[START] Build dir: $BUILD_DIR"
echo "[START] User: $(whoami)"
echo "[START] Caddy available: $(command -v caddy 2>/dev/null && echo YES || echo NO)"
echo "[START] Bun available: $(command -v bun 2>/dev/null && echo YES || echo NO)"
echo "[START] Node available: $(command -v node 2>/dev/null && echo YES || echo NO)"
echo "=========================================="

cd "$BUILD_DIR" || exit 1

# ── Step 1: Start Next.js standalone server ────────────────────────────────
export NODE_ENV=production
export PORT="${PORT:-3000}"
export HOSTNAME="0.0.0.0"  # MUST be 0.0.0.0, not localhost, for FC health check

# Find the standalone server
STANDALONE_DIR=""
if [ -f "./next-service-dist/server.js" ]; then
    STANDALONE_DIR="./next-service-dist"
    echo "[START] Found standalone server in next-service-dist/"
elif [ -f "./.next/standalone/server.js" ]; then
    STANDALONE_DIR="./.next/standalone"
    echo "[START] Found standalone server in .next/standalone/"
    # Copy static + public if not already there
    if [ -d "../.next/static" ] && [ ! -d "./.next/static" ]; then
        mkdir -p .next && cp -r ../.next/static .next/ 2>/dev/null
    fi
    if [ -d "../public" ] && [ ! -d "./public" ]; then
        cp -r ../public . 2>/dev/null
    fi
fi

if [ -n "$STANDALONE_DIR" ]; then
    echo "[START] Starting Next.js standalone on $HOSTNAME:$PORT..."
    cd "$STANDALONE_DIR"

    # Use node (more reliable than bun for standalone server in FC)
    if command -v node >/dev/null 2>&1; then
        RUNNER=node
    elif command -v bun >/dev/null 2>&1; then
        RUNNER=bun
    else
        echo "❌ [START] Neither node nor bun found!"
        exit 1
    fi

    echo "[START] Runner: $RUNNER"
    echo "[START] HOSTNAME=$HOSTNAME PORT=$PORT"

    $RUNNER server.js &
    NEXT_PID=$!
    pids="$NEXT_PID"

    echo "[START] Next.js PID: $NEXT_PID"

    # Wait for Next.js to start
    sleep 2
    if ! kill -0 "$NEXT_PID" 2>/dev/null; then
        echo "❌ [START] Next.js failed to start"
        exit 1
    fi
    echo "✅ [START] Next.js started (PID: $NEXT_PID)"

    cd "$BUILD_DIR"
else
    echo "⚠️ [START] No standalone server found, starting dev mode..."
    if command -v bun >/dev/null 2>&1; then
        bun run dev &
        NEXT_PID=$!
    elif command -v npx >/dev/null 2>&1; then
        npx next dev -p "$PORT" &
        NEXT_PID=$!
    else
        echo "❌ [START] Cannot start Next.js — no runner available"
        exit 1
    fi
    pids="$NEXT_PID"
    echo "[START] Dev server PID: $NEXT_PID"
    sleep 5
fi

# ── Step 2: Start mini-services (optional) ─────────────────────────────────
if [ -f "./mini-services-start.sh" ]; then
    echo "[START] Starting mini-services..."
    sh ./mini-services-start.sh &
    MINI_PID=$!
    pids="$pids $MINI_PID"
    sleep 1
    echo "[START] Mini-services PID: $MINI_PID"
fi

# ── Step 3: Start Caddy (CRITICAL — FC health check targets port 81) ───────
# Caddy MUST be started on 0.0.0.0:81 and run in the FOREGROUND.
# This is the process that keeps the container alive.
echo ""
echo "[START] Starting Caddy on :81..."

if [ -f "./Caddyfile" ]; then
    CADDYFILE="./Caddyfile"
elif [ -f "/app/Caddyfile" ]; then
    CADDYFILE="/app/Caddyfile"
else
    # Create a minimal Caddyfile if none exists
    echo ":81 {
    reverse_proxy localhost:${PORT:-3000}
}" > /tmp/Caddyfile
    CADDYFILE="/tmp/Caddyfile"
fi

echo "[START] Caddyfile: $CADDYFILE"
echo "[START] Caddy config:"
cat "$CADDYFILE"
echo ""

if command -v caddy >/dev/null 2>&1; then
    echo "✅ [START] Starting Caddy in FOREGROUND (this keeps the container alive)..."
    echo ""
    echo "🎉 All services started:"
    echo "   Next.js on 0.0.0.0:${PORT:-3000}"
    echo "   Caddy on 0.0.0.0:81 (FC health check target)"
    echo ""
    exec caddy run --config "$CADDYFILE" --adapter caddyfile
else
    echo "❌ [START] Caddy not found! Falling back to wait..."
    echo "⚠️ [START] FC health check on :81 will FAIL without Caddy"
    # Last resort: keep the process alive
    wait "$NEXT_PID"
    exit $?
fi
