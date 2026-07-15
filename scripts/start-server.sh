#!/bin/bash
# Persistent launcher for the Next.js standalone server.
# Uses double-fork to fully detach from the parent shell so the process
# survives across bash tool calls.
cd /home/z/my-project/proposal-workspace
( ( PORT=3000 HOSTNAME=0.0.0.0 exec node .next/standalone/server.js > /tmp/runtime.log 2>&1 & ) & )
echo "Daemonized"
