#!/bin/sh

set -e

# Build directory is the directory containing this script.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD_DIR="$SCRIPT_DIR"

# Stored PIDs of background services (mini-services, if any).
pids=""

# Graceful shutdown of background services on SIGTERM/SIGINT.
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    for pid in $pids; do
        if kill -0 "$pid" 2>/dev/null; then
            service_name=$(ps -p "$pid" -o comm= 2>/dev/null || echo "unknown")
            echo "   stopping $pid ($service_name)..."
            kill -TERM "$pid" 2>/dev/null
        fi
    done

    sleep 1
    for pid in $pids; do
        if kill -0 "$pid" 2>/dev/null; then
            timeout=4
            while [ $timeout -gt 0 ] && kill -0 "$pid" 2>/dev/null; do
                sleep 1
                timeout=$((timeout - 1))
            done
            if kill -0 "$pid" 2>/dev/null; then
                echo "   force-killing $pid..."
                kill -KILL "$pid" 2>/dev/null
            fi
        fi
    done

    echo "✅ All services stopped"
    exit 0
}

trap cleanup TERM INT

echo "🚀 Starting services..."
echo ""

cd "$BUILD_DIR" || exit 1

ls -lah

# ---------------------------------------------------------------------------
# Next.js standalone server
# ---------------------------------------------------------------------------
if [ -f "./next-service-dist/server.js" ]; then
    echo "🚀 Starting Next.js (standalone)..."
    cd next-service-dist/ || exit 1

    export NODE_ENV=production
    export PORT="${PORT:-3000}"
    export HOSTNAME="${HOSTNAME:-0.0.0.0}"

    # Bun is preferred (faster startup, lower memory) but fall back to node.
    if command -v bun >/dev/null 2>&1; then
        RUNNER=bun
    else
        RUNNER=node
    fi

    # Background launch so we can also start mini-services, then wait.
    $RUNNER server.js &
    NEXT_PID=$!
    pids="$NEXT_PID"

    # Wait longer (3s) for the server to bind — 1s was too short on slower
    # containers and caused false "failed to start" errors.
    sleep 3
    if ! kill -0 "$NEXT_PID" 2>/dev/null; then
        echo "❌ Next.js failed to start (process exited within 3s)"
        echo "   Runner: $RUNNER"
        echo "   Port: $PORT"
        echo "   Checking if port is in use..."
        ss -tlnp 2>/dev/null | grep ":$PORT" || echo "   Port $PORT is free"
        exit 1
    fi
    echo "✅ Next.js started (PID: $NEXT_PID, Port: $PORT, Runner: $RUNNER)"

    # Health check — verify the server actually responds to HTTP requests.
    # The platform may require this before marking the deploy as successful.
    echo "🏥 Running health check..."
    HEALTH_OK=false
    for i in 1 2 3 4 5; do
        if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/" 2>/dev/null | grep -q "200\|301\|302"; then
            HEALTH_OK=true
            echo "   ✅ Health check passed (attempt $i)"
            break
        fi
        echo "   ⏳ Waiting for server to respond (attempt $i)..."
        sleep 2
    done
    if [ "$HEALTH_OK" = "false" ]; then
        echo "   ⚠️  Health check failed — server is running but not responding"
        echo "   The deploy may still succeed if the platform retries"
    fi

    cd "$BUILD_DIR"
else
    echo "❌ Missing ./next-service-dist/server.js — build artifact not found"
    exit 1
fi

# ---------------------------------------------------------------------------
# mini-services (optional, only if a build exists)
# ---------------------------------------------------------------------------
if [ -f "./mini-services-start.sh" ]; then
    echo "🚀 Starting mini-services..."
    sh ./mini-services-start.sh &
    MINI_PID=$!
    pids="$pids $MINI_PID"

    sleep 1
    if ! kill -0 "$MINI_PID" 2>/dev/null; then
        echo "⚠️  mini-services may have failed, continuing..."
    else
        echo "✅ mini-services started (PID: $MINI_PID)"
    fi
elif [ -d "./mini-services-dist" ]; then
    echo "⚠️  mini-services-dist exists but no start script — skipping"
else
    echo "ℹ️  No mini-services — skipping"
fi

# ---------------------------------------------------------------------------
# NOTE: We deliberately DO NOT start Caddy here.
# The Z.ai deploy platform already runs Caddy as a root-level reverse proxy
# on :81, forwarding to localhost:3000. Starting a second Caddy here would
# fail with "bind: address already in use" and crash the container.
# ---------------------------------------------------------------------------

echo ""
echo "🎉 All services started."
echo "   Next.js listening on http://${HOSTNAME:-0.0.0.0}:${PORT}"
echo "   (Platform Caddy on :81 proxies here.)"
echo ""
echo "💡 Press Ctrl+C to stop."
echo ""

# Block forever, waiting for either signal or Next.js exit.
wait "$NEXT_PID"
exit $?
