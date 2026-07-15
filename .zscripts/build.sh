#!/bin/bash

# Redirect stderr to stdout so the parent shell sees all output.
exec 2>&1

set -e

# Resolve paths relative to this script so the build is portable.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NEXTJS_PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ ! -d "$NEXTJS_PROJECT_DIR" ]; then
    echo "❌ ERROR: Next.js project directory does not exist: $NEXTJS_PROJECT_DIR"
    exit 1
fi

echo "🚀 Building Next.js app + mini-services..."
echo "📁 Project: $NEXTJS_PROJECT_DIR"
echo "📋 Environment:"
echo "   - Node: $(node --version 2>/dev/null || echo 'not found')"
echo "   - Bun:  $(bun --version 2>/dev/null || echo 'not found')"
echo "   - NPM:  $(npm --version 2>/dev/null || echo 'not found')"
echo "   - Memory available: $(free -m 2>/dev/null | awk '/^Mem:/{print $2 " MB"}' || echo 'unknown')"

cd "$NEXTJS_PROJECT_DIR" || exit 1

export NEXT_TELEMETRY_DISABLED=1

# Cap Node heap size to prevent OOM on memory-constrained deploy containers.
# 1536MB is conservative — enough for this project but leaves room for the OS.
export NODE_OPTIONS="${NODE_OPTIONS:-} --max-old-space-size=1536"

BUILD_DIR="/tmp/build_fullstack_$BUILD_ID"
echo "📁 Preparing build dir: $BUILD_DIR"
mkdir -p "$BUILD_DIR"

# ── Install dependencies ──────────────────────────────────────────────────
# Prefer bun (faster), fall back to npm if bun isn't available.
# This is the #1 cause of deploy failures — the deploy container may not have bun.
echo "📦 Installing dependencies..."
if command -v bun >/dev/null 2>&1; then
    echo "   Using bun..."
    bun install
elif command -v npm >/dev/null 2>&1; then
    echo "   ⚠️  bun not found, falling back to npm..."
    npm install
else
    echo "❌ ERROR: Neither bun nor npm is available. Cannot install dependencies."
    exit 1
fi

# ── Build Next.js ─────────────────────────────────────────────────────────
# Prefer bun (faster), fall back to npx/node.
echo "🔨 Building Next.js..."
if command -v bun >/dev/null 2>&1; then
    bun run build
elif command -v npx >/dev/null 2>&1; then
    npx next build
else
    echo "❌ ERROR: Cannot find a way to run next build (tried bun and npx)."
    exit 1
fi

# Verify the build produced the expected output
if [ ! -d ".next/standalone" ]; then
    echo "❌ ERROR: .next/standalone missing after build!"
    echo "   Build output was:"
    ls -la .next/ 2>/dev/null || echo "   .next/ directory does not exist"
    exit 1
fi

# ── Build mini-services (optional) ────────────────────────────────────────
if [ -d "$NEXTJS_PROJECT_DIR/mini-services" ] && [ -n "$(ls -A "$NEXTJS_PROJECT_DIR/mini-services" 2>/dev/null)" ]; then
    echo "🔨 Building mini-services..."
    sh "$SCRIPT_DIR/mini-services-install.sh"
    sh "$SCRIPT_DIR/mini-services-build.sh"

    echo "  - Copy mini-services-start.sh → $BUILD_DIR"
    cp "$SCRIPT_DIR/mini-services-start.sh" "$BUILD_DIR/mini-services-start.sh"
    chmod +x "$BUILD_DIR/mini-services-start.sh"
else
    echo "ℹ️  mini-services directory is empty or missing — skipping"
fi

# ── Collect build artifacts ───────────────────────────────────────────────
echo "📦 Collecting artifacts into $BUILD_DIR..."

echo "  - Copy .next/standalone → next-service-dist/"
cp -r .next/standalone "$BUILD_DIR/next-service-dist/"

if [ -d ".next/static" ]; then
    echo "  - Copy .next/static"
    mkdir -p "$BUILD_DIR/next-service-dist/.next"
    cp -r .next/static "$BUILD_DIR/next-service-dist/.next/"
fi

if [ -d "public" ]; then
    echo "  - Copy public/"
    cp -r public "$BUILD_DIR/next-service-dist/"
fi

if [ -f "Caddyfile" ]; then
    echo "  - Copy Caddyfile (for reference; platform runs its own Caddy on :81)"
    cp Caddyfile "$BUILD_DIR/"
else
    echo "ℹ️  Caddyfile not found — skipping"
fi

echo "  - Copy start.sh → $BUILD_DIR"
cp "$SCRIPT_DIR/start.sh" "$BUILD_DIR/start.sh"
chmod +x "$BUILD_DIR/start.sh"

# ── Verify the final artifact ─────────────────────────────────────────────
if [ ! -f "$BUILD_DIR/next-service-dist/server.js" ]; then
    echo "❌ ERROR: next-service-dist/server.js is missing!"
    echo "   The standalone build did not produce server.js."
    exit 1
fi

echo "  ✅ server.js found — build artifact verified"

# ── Pack everything into a tarball ────────────────────────────────────────
PACKAGE_FILE="${BUILD_DIR}.tar.gz"
echo ""
echo "📦 Packing artifacts → $PACKAGE_FILE..."
cd "$BUILD_DIR" || exit 1
tar -czf "$PACKAGE_FILE" .
cd - > /dev/null || exit 1

echo ""
echo "✅ Build complete. Artifacts: $PACKAGE_FILE"
echo "📊 Size:"
ls -lh "$PACKAGE_FILE"
