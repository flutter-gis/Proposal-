#!/bin/bash
cd /home/z/my-project

echo "[DEV] Installing deps..."
npm install 2>&1 | tail -3

echo "[DEV] Building..."
npx next build 2>&1 | tail -5

echo "[DEV] Copying static assets..."
cp -r .next/static .next/standalone/.next/ 2>/dev/null
cp -r public .next/standalone/ 2>/dev/null

echo "[DEV] Starting standalone server on :3000..."
exec node .next/standalone/server.js
