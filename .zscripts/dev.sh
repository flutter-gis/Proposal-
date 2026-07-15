#!/bin/bash

set -euo pipefail

# 获取脚本所在目录（.zscripts）
# 使用 $0 获取脚本路径（与 build.sh 保持一致）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

log_step_start() {
        local step_name="$1"
        echo "=========================================="
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting: $step_name"
        echo "=========================================="
        export STEP_START_TIME
        STEP_START_TIME=$(date +%s)
}

log_step_end() {
        local step_name="${1:-Unknown step}"
        local end_time
        end_time=$(date +%s)
        local duration=$((end_time - STEP_START_TIME))
        echo "=========================================="
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Completed: $step_name"
        echo "[LOG] Step: $step_name | Duration: ${duration}s"
        echo "=========================================="
        echo ""
}

start_mini_services() {
        local mini_services_dir="$PROJECT_DIR/mini-services"
        local started_count=0

        log_step_start "Starting mini-services"
        if [ ! -d "$mini_services_dir" ]; then
                echo "Mini-services directory not found, skipping..."
                log_step_end "Starting mini-services"
                return 0
        fi

        echo "Found mini-services directory, scanning for sub-services..."

        for service_dir in "$mini_services_dir"/*; do
                if [ ! -d "$service_dir" ]; then
                        continue
                fi

                local service_name
                service_name=$(basename "$service_dir")
                echo "Checking service: $service_name"

                if [ ! -f "$service_dir/package.json" ]; then
                        echo "[$service_name] No package.json found, skipping..."
                        continue
                fi

                if ! grep -q '"dev"' "$service_dir/package.json"; then
                        echo "[$service_name] No dev script found, skipping..."
                        continue
                fi

                echo "Starting $service_name in background..."
                (
                        cd "$service_dir"
                        echo "[$service_name] Installing dependencies..."
                        bun install
                        echo "[$service_name] Running bun run dev..."
                        exec bun run dev
                ) >"$PROJECT_DIR/.zscripts/mini-service-${service_name}.log" 2>&1 &

                local service_pid=$!
                echo "[$service_name] Started in background (PID: $service_pid)"
                echo "[$service_name] Log: $PROJECT_DIR/.zscripts/mini-service-${service_name}.log"
                disown "$service_pid" 2>/dev/null || true
                started_count=$((started_count + 1))
        done

        echo "Mini-services startup completed. Started $started_count service(s)."
        log_step_end "Starting mini-services"
}

wait_for_service() {
        local host="$1"
        local port="$2"
        local service_name="$3"
        local max_attempts="${4:-60}"
        local attempt=1

        echo "Waiting for $service_name to be ready on $host:$port..."

        while [ "$attempt" -le "$max_attempts" ]; do
                if curl -s --connect-timeout 2 --max-time 5 "http://$host:$port" >/dev/null 2>&1; then
                        echo "$service_name is ready!"
                        return 0
                fi

                echo "Attempt $attempt/$max_attempts: $service_name not ready yet, waiting..."
                sleep 1
                attempt=$((attempt + 1))
        done

        echo "ERROR: $service_name failed to start within $max_attempts seconds"
        return 1
}

cleanup() {
        if [ -n "${DEV_PID:-}" ] && kill -0 "$DEV_PID" >/dev/null 2>&1; then
                echo "Stopping Next.js dev server (PID: $DEV_PID)..."
                kill "$DEV_PID" >/dev/null 2>&1 || true
        fi
}

trap cleanup EXIT INT TERM

cd "$PROJECT_DIR"

echo "=========================================="
echo "[DEV] === EXTENSIVE DEPLOY LOGGING ==="
echo "[DEV] Project dir: $PROJECT_DIR"
echo "[DEV] Current dir: $(pwd)"
echo "[DEV] User: $(whoami)"
echo "[DEV] Node: $(node --version 2>/dev/null || echo 'not found')"
echo "[DEV] Bun: $(bun --version 2>/dev/null || echo 'not found')"
echo "[DEV] Memory: $(free -m 2>/dev/null | awk '/^Mem:/{print $2 " MB total, " $7 " MB available"}' || echo 'unknown')"
echo "[DEV] Files in project dir:"
ls -la "$PROJECT_DIR" 2>&1 | head -20
echo "[DEV] .zscripts dir:"
ls -la "$PROJECT_DIR/.zscripts/" 2>&1
echo "[DEV] package.json exists: $([ -f package.json ] && echo YES || echo NO)"
echo "[DEV] .zscripts/dev.sh exists: $([ -f .zscripts/dev.sh ] && echo YES || echo NO)"
echo "=========================================="

if ! command -v bun >/dev/null 2>&1; then
        echo "❌ [DEV] ERROR: bun is not installed or not in PATH"
        echo "[DEV] PATH=$PATH"
        which node 2>/dev/null && echo "[DEV] node found at: $(which node)"
        echo "[DEV] Attempting npm fallback..."
        if command -v npm >/dev/null 2>&1; then
            echo "[DEV] npm found, using npm instead of bun"
            USE_NPM=true
        else
            echo "❌ [DEV] Neither bun nor npm found — cannot continue"
            exit 1
        fi
fi

log_step_start "bun install"
echo "[BUN] Installing dependencies..."
if [ "${USE_NPM:-false}" = "true" ]; then
    npm install 2>&1
else
    bun install 2>&1
fi
INSTALL_RC=$?
echo "[DEV] Install exit code: $INSTALL_RC"
if [ $INSTALL_RC -ne 0 ]; then
    echo "❌ [DEV] Dependency install failed with code $INSTALL_RC"
    exit 1
fi
log_step_end "bun install"

# Database setup — only run if prisma is configured.
echo "[DEV] Checking for database setup..."
echo "[DEV] package.json has db:push: $(grep -c '"db:push"' package.json 2>/dev/null || echo 0)"
echo "[DEV] prisma/schema.prisma exists: $([ -f prisma/schema.prisma ] && echo YES || echo NO)"
if grep -q '"db:push"' package.json 2>/dev/null && [ -f "prisma/schema.prisma" ]; then
    log_step_start "bun run db:push"
    echo "[BUN] Setting up database..."
    bun run db:push
    log_step_end "bun run db:push"
else
    echo "[DEV] ✅ No database configured (prisma not found), skipping db:push"
fi

log_step_start "Starting Next.js dev server"
echo "[BUN] Starting development server..."
echo "[DEV] package.json scripts:"
cat package.json | grep -A5 '"scripts"' 2>/dev/null
echo "[DEV] Running: bun run dev"
bun run dev &
DEV_PID=$!
echo "[DEV] Dev server PID: $DEV_PID"
log_step_end "Starting Next.js dev server"

log_step_start "Waiting for Next.js dev server"
echo "[DEV] Waiting for server on localhost:3000..."
wait_for_service "localhost" "3000" "Next.js dev server"
WAIT_RC=$?
echo "[DEV] Wait exit code: $WAIT_RC"
if [ $WAIT_RC -ne 0 ]; then
    echo "❌ [DEV] Server failed to start within timeout"
    echo "[DEV] Checking if process is still alive..."
    kill -0 $DEV_PID 2>/dev/null && echo "[DEV] Process $DEV_PID is alive" || echo "[DEV] Process $DEV_PID is DEAD"
    echo "[DEV] Last 20 lines of dev output:"
    # Try to capture any output
    sleep 2
    echo "[DEV] Port check:"
    ss -tlnp 2>/dev/null | grep ':3000' || echo "[DEV] Port 3000 not listening"
    exit 1
fi
log_step_end "Waiting for Next.js dev server"

log_step_start "Health check"
echo "[BUN] Performing health check..."
echo "[DEV] Curling localhost:3000..."
curl -fsS localhost:3000 >/dev/null 2>&1
HEALTH_RC=$?
echo "[DEV] Health check exit code: $HEALTH_RC"
if [ $HEALTH_RC -ne 0 ]; then
    echo "⚠️ [DEV] Health check failed (code $HEALTH_RC), but server may still be starting"
    echo "[DEV] Retrying in 3s..."
    sleep 3
    curl -fsS localhost:3000 >/dev/null 2>&1
    HEALTH_RC2=$?
    echo "[DEV] Health check retry exit code: $HEALTH_RC2"
fi
echo "[BUN] Health check passed"
log_step_end "Health check"

start_mini_services

echo "=========================================="
echo "[DEV] ✅ dev.sh completed successfully!"
echo "[DEV] Next.js dev server is running in background (PID: $DEV_PID)."
echo "[DEV] Use 'kill $DEV_PID' to stop it."
echo "=========================================="
disown "$DEV_PID" 2>/dev/null || true
unset DEV_PID
