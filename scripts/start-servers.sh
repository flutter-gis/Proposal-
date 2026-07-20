#!/bin/bash
# start-servers.sh — Robust server startup for Z.ai hosting
#
# Z.ai architecture:
#   - Container runs this script as CMD
#   - Caddy on :81 is the health check target (FC platform checks :81)
#   - Caddy reverse-proxies to Next.js on :3000
#   - Both must stay alive for the container to stay up

cd /home/z/my-project

# Kill any existing processes
kill $(lsof -t -i:3000 2>/dev/null) 2>/dev/null
kill $(lsof -t -i:81 2>/dev/null) 2>/dev/null
sleep 2

# Start Next.js dev server
echo "[START] Starting Next.js on :3000..."
nohup npx next dev -p 3000 > /tmp/next-dev.log 2>&1 &
NEXT_PID=$!
echo "[START] Next.js PID: $NEXT_PID"

# Wait for Next.js to be ready
echo "[START] Waiting for Next.js..."
for i in $(seq 1 30); do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null | grep -q "200"; then
    echo "[START] Next.js is ready! (attempt $i)"
    break
  fi
  sleep 2
done

# Start Caddy on :81
echo "[START] Starting Caddy on :81..."
nohup /usr/bin/caddy run --config /home/z/my-project/Caddyfile --adapter caddyfile > /tmp/caddy.log 2>&1 &
CADDY_PID=$!
echo "[START] Caddy PID: $CADDY_PID"

sleep 3

# Verify both are running
NEXT_OK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null)
CADDY_OK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:81/ 2>/dev/null)

echo "[START] Next.js: :3000=$NEXT_OK"
echo "[START] Caddy:   :81=$CADDY_OK"

if [ "$CADDY_OK" = "200" ]; then
  echo "[START] ✅ Site is live on :81"
else
  echo "[START] ❌ Caddy proxy not returning 200"
fi

# Keep alive — monitor both processes
while true; do
  if ! kill -0 $NEXT_PID 2>/dev/null; then
    echo "[MONITOR] Next.js died, restarting..."
    cd /home/z/my-project
    nohup npx next dev -p 3000 > /tmp/next-dev.log 2>&1 &
    NEXT_PID=$!
    sleep 10
  fi
  if ! kill -0 $CADDY_PID 2>/dev/null; then
    echo "[MONITOR] Caddy died, restarting..."
    nohup /usr/bin/caddy run --config /home/z/my-project/Caddyfile --adapter caddyfile > /tmp/caddy.log 2>&1 &
    CADDY_PID=$!
    sleep 3
  fi
  sleep 5
done
