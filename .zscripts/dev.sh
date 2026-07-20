#!/bin/bash
cd /home/z/my-project

echo "[DEV] Building Next.js..."
npx next build 2>&1 | tail -5

echo "[DEV] Starting production server on :3000..."
exec npx next start -p 3000
