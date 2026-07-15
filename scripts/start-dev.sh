#!/bin/bash
# Start the Next.js dev server in a way that survives shell exit.
cd /home/z/my-project
PORT=3100 exec npx next dev -p 3100
