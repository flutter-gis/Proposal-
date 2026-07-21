#!/bin/bash
cd /home/z/my-project

echo "[DEV] Installing deps..."
if command -v bun >/dev/null 2>&1; then
  bun install 2>&1 || npm install 2>&1
else
  npm install 2>&1
fi

echo "[DEV] Starting Next.js dev server on :3000..."
exec npx next dev -p 3000
