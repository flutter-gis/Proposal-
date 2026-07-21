#!/bin/bash
# .zscripts/dev.sh — Z.ai entry point
# Starts Next.js dev server on :3000. Platform provides :81 proxy.
cd /home/z/my-project

echo "[DEV] Installing deps..."
npm install 2>&1 | tail -3

echo "[DEV] Starting Next.js on :3000..."
exec npx next dev -p 3000
