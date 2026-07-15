#!/bin/sh

# ═══════════════════════════════════════════════════════════════════════════
# start.sh — Production container entrypoint for Z.ai FC deploy
# ═══════════════════════════════════════════════════════════════════════════
# This script is the container CMD in the FC (Function Compute) deployment.
# It handles MULTIPLE directory layouts:
#   1. Tarball layout: ./next-service-dist/server.js (from build.sh)
#   2. Dockerfile layout: ./server.js (platform copies standalone to /app/)
#   3. Local build: ./.next/standalone/server.js
#   4. Fallback: dev mode
#
# It MUST:
#   1. Start Next.js standalone server on 0.0.0.0:3000
#   2. Start Caddy on 0.0.0.0:81 (FC health check target)
#   3. Keep Caddy in the foreground (keeps container alive)
# ═══════════════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

pids=""

cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    for pid in $pids; do
        kill -TERM "$pid" 2>/dev/null
    done
    sleep 1
    for pid in $pids; do
        kill -KILL "$pid" 2>/dev/null
    done
    exit 0
}

trap cleanup TERM INT

echo "=========================================="
echo "[START] === PRODUCTION DEPLOY ==="
echo "[START] Time: $(date -u +%FT%TZ)"
echo "[START] Script dir: $SCRIPT_DIR"
echo "[START] PWD: $(pwd)"
echo "[START] User: $(whoami)"
echo "[START] Node: $(node --version 2>/dev/null || echo 'not found')"
echo "[START] Bun: $(bun --version 2>/dev/null || echo 'not found')"
echo "[START] Caddy: $(command -v caddy 2>/dev/null || echo 'not found')"
echo "[START] Files in current dir:"
ls -la 2>&1 | head -20
echo "=========================================="

export NODE_ENV=production
export PORT="${PORT:-3000}"
export HOSTNAME="0.0.0.0"

# ── Find and start the standalone server ───────────────────────────────────
# Try every possible location for server.js
SERVER_FOUND=false
SERVER_DIR=""

# Location 1: ./next-service-dist/server.js (tarball from build.sh)
if [ -f "./next-service-dist/server.js" ]; then
    SERVER_DIR="./next-service-dist"
    SERVER_FOUND=true
    echo "[START] ✅ Found server.js in ./next-service-dist/ (tarball layout)"

# Location 2: ./server.js (platform Dockerfile copies standalone to /app/)
elif [ -f "./server.js" ]; then
    SERVER_DIR="."
    SERVER_FOUND=true
    echo "[START] ✅ Found server.js in ./ (Dockerfile layout)"

# Location 3: ./.next/standalone/server.js (local build)
elif [ -f "./.next/standalone/server.js" ]; then
    SERVER_DIR="./.next/standalone"
    SERVER_FOUND=true
    echo "[START] ✅ Found server.js in ./.next/standalone/ (local build)"
    # Copy static + public if not already there
    if [ -d "../.next/static" ] && [ ! -d "./.next/static" ]; then
        mkdir -p .next && cp -r ../.next/static .next/ 2>/dev/null
    fi
    if [ -d "../public" ] && [ ! -d "./public" ]; then
        cp -r ../public . 2>/dev/null
    fi
fi

if [ "$SERVER_FOUND" = "true" ]; then
    echo "[START] Server dir: $SERVER_DIR"
    echo "[START] Contents of server dir:"
    ls -la "$SERVER_DIR" 2>&1 | head -15
    echo ""

    # CRITICAL: Verify static assets exist
    echo "[START] Checking for .next/static/:"
    if [ -d "$SERVER_DIR/.next/static" ]; then
        echo "  ✅ .next/static/ exists"
        echo "  CSS files: $(find "$SERVER_DIR/.next/static" -name "*.css" 2>/dev/null | wc -l)"
        echo "  JS files: $(find "$SERVER_DIR/.next/static" -name "*.js" 2>/dev/null | wc -l)"
    else
        echo "  ❌ .next/static/ MISSING — trying to copy from parent"
        # Try to find static files elsewhere and copy them
        for STATIC_PATH in "../.next/static" "../../.next/static" "/home/z/my-project/.next/static"; do
            if [ -d "$STATIC_PATH" ]; then
                mkdir -p "$SERVER_DIR/.next"
                cp -r "$STATIC_PATH" "$SERVER_DIR/.next/" 2>/dev/null
                echo "  ✅ Copied static from $STATIC_PATH"
                break
            fi
        done
    fi

    echo "[START] Checking for public/:"
    if [ -d "$SERVER_DIR/public" ]; then
        echo "  ✅ public/ exists"
    else
        echo "  ❌ public/ MISSING — trying to copy from parent"
        for PUBLIC_PATH in "../public" "../../public" "/home/z/my-project/public"; do
            if [ -d "$PUBLIC_PATH" ]; then
                cp -r "$PUBLIC_PATH" "$SERVER_DIR/" 2>/dev/null
                echo "  ✅ Copied public from $PUBLIC_PATH"
                break
            fi
        done
    fi
    echo ""

    cd "$SERVER_DIR" || exit 1

    # Use node (more reliable in FC containers)
    if command -v node >/dev/null 2>&1; then
        RUNNER=node
    elif command -v bun >/dev/null 2>&1; then
        RUNNER=bun
    else
        echo "❌ [START] No JS runtime found!"
        exit 1
    fi

    echo "[START] Starting: $RUNNER server.js (HOSTNAME=$HOSTNAME PORT=$PORT)"
    $RUNNER server.js &
    NEXT_PID=$!
    pids="$NEXT_PID"
    echo "[START] Next.js PID: $NEXT_PID"

    sleep 2
    if ! kill -0 "$NEXT_PID" 2>/dev/null; then
        echo "❌ [START] Next.js process died"
        echo "[START] Trying with bun..."
        if command -v bun >/dev/null 2>&1; then
            bun server.js &
            NEXT_PID=$!
            pids="$NEXT_PID"
            sleep 2
        fi
    fi

    if kill -0 "$NEXT_PID" 2>/dev/null; then
        echo "✅ [START] Next.js running (PID: $NEXT_PID) on 0.0.0.0:$PORT"
    else
        echo "❌ [START] Next.js failed to start — falling back to dev mode"
        SERVER_FOUND=false
    fi

    cd "$SCRIPT_DIR"
fi

# Fallback: dev mode
if [ "$SERVER_FOUND" = "false" ]; then
    echo "⚠️ [START] No standalone server found, starting dev mode..."
    cd "$SCRIPT_DIR"

    # Try to install deps if needed
    if [ ! -d "node_modules" ]; then
        echo "[START] Installing dependencies..."
        if command -v bun >/dev/null 2>&1; then
            bun install 2>&1
        elif command -v npm >/dev/null 2>&1; then
            npm install 2>&1
        fi
    fi

    if command -v bun >/dev/null 2>&1; then
        bun run dev &
    elif command -v npx >/dev/null 2>&1; then
        npx next dev -p "$PORT" &
    else
        echo "❌ [START] Cannot start Next.js"
        exit 1
    fi
    NEXT_PID=$!
    pids="$NEXT_PID"
    echo "[START] Dev server PID: $NEXT_PID"
    sleep 5
fi

# ── Start mini-services (optional) ─────────────────────────────────────────
if [ -f "./mini-services-start.sh" ]; then
    echo "[START] Starting mini-services..."
    sh ./mini-services-start.sh &
    MINI_PID=$!
    pids="$pids $MINI_PID"
    sleep 1
fi

# ── Start Caddy (CRITICAL — FC health check targets port 81) ───────────────
echo ""
echo "[START] Starting Caddy on :81..."

# Find Caddyfile
CADDYFILE=""
for CF in "./Caddyfile" "$SCRIPT_DIR/Caddyfile" "/app/Caddyfile"; do
    if [ -f "$CF" ]; then
        CADDYFILE="$CF"
        break
    fi
done

if [ -z "$CADDYFILE" ]; then
    echo "[START] No Caddyfile found, creating minimal one..."
    echo ":81 {
    reverse_proxy localhost:${PORT}
}" > /tmp/Caddyfile
    CADDYFILE="/tmp/Caddyfile"
fi

echo "[START] Caddyfile: $CADDYFILE"
echo ""

if command -v caddy >/dev/null 2>&1; then
    echo "✅ [START] Starting Caddy in FOREGROUND..."
    echo "   Next.js on 0.0.0.0:${PORT}"
    echo "   Caddy on 0.0.0.0:81 (FC health check target)"
    echo ""
    exec caddy run --config "$CADDYFILE" --adapter caddyfile
else
    echo "⚠️ [START] Caddy not found — keeping process alive"
    wait "$NEXT_PID"
    exit $?
fi
