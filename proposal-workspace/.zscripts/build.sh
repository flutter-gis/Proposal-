#!/bin/bash

# Redirect stderr to stdout so the parent shell sees all output.
exec 2>&1

set -e

# Resolve paths relative to this script so the build is portable.
# NEXTJS_PROJECT_DIR becomes the parent of the .zscripts/ directory.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NEXTJS_PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ ! -d "$NEXTJS_PROJECT_DIR" ]; then
    echo "❌ ERROR: Next.js project directory does not exist: $NEXTJS_PROJECT_DIR"
    exit 1
fi

echo "🚀 Building Next.js app + mini-services..."
echo "📁 Project: $NEXTJS_PROJECT_DIR"

cd "$NEXTJS_PROJECT_DIR" || exit 1

export NEXT_TELEMETRY_DISABLED=1

BUILD_DIR="/tmp/build_fullstack_$BUILD_ID"
echo "📁 Preparing build dir: $BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Install dependencies (use bun; bun.lock is authoritative).
echo "📦 Installing dependencies..."
bun install

# Build Next.js (produces .next/standalone + copies static/public into it
# via the `build` script in package.json).
echo "🔨 Building Next.js..."
bun run build

# Build mini-services if the directory has any projects.
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

# Collect build artifacts into the staging directory.
echo "📦 Collecting artifacts into $BUILD_DIR..."

if [ -d ".next/standalone" ]; then
    echo "  - Copy .next/standalone → next-service-dist/"
    cp -r .next/standalone "$BUILD_DIR/next-service-dist/"
else
    echo "❌ ERROR: .next/standalone missing — did the build fail?"
    exit 1
fi

if [ -d ".next/static" ]; then
    echo "  - Copy .next/static"
    mkdir -p "$BUILD_DIR/next-service-dist/.next"
    cp -r .next/static "$BUILD_DIR/next-service-dist/.next/"
fi

if [ -d "public" ]; then
    echo "  - Copy public/"
    cp -r public "$BUILD_DIR/next-service-dist/"
fi

# NOTE: We no longer ship a database. The app does not use Prisma.
# If you re-add a database later, copy/migrate it here instead of bundling
# the dev DB into production.

if [ -f "Caddyfile" ]; then
    echo "  - Copy Caddyfile (for reference; platform runs its own Caddy on :81)"
    cp Caddyfile "$BUILD_DIR/"
else
    echo "ℹ️  Caddyfile not found — skipping"
fi

echo "  - Copy start.sh → $BUILD_DIR"
cp "$SCRIPT_DIR/start.sh" "$BUILD_DIR/start.sh"
chmod +x "$BUILD_DIR/start.sh"

# Pack everything into a tarball.
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
