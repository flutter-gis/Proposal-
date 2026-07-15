#!/usr/bin/env bash
# Persistent fetch runner - keeps the process alive across tool timeouts
LOG=/home/z/my-project/scripts/fetch_log.txt
PIDFILE=/home/z/my-project/scripts/fetch.pid

# Kill any existing fetch
if [ -f "$PIDFILE" ]; then
  OLDPID=$(cat "$PIDFILE")
  if kill -0 "$OLDPID" 2>/dev/null; then
    echo "Killing existing fetch PID $OLDPID"
    kill -9 "$OLDPID" 2>/dev/null
    pkill -P "$OLDPID" 2>/dev/null
  fi
fi
pkill -f fetch_images.py 2>/dev/null
pkill -f "z-ai image-search" 2>/dev/null
sleep 2

# Use setsid to fully detach
setsid bash -c '
  cd /home/z/my-project/scripts
  exec python3 fetch_images.py > fetch_log.txt 2>&1
' < /dev/null > /dev/null 2>&1 &
NEWPID=$!
echo "$NEWPID" > "$PIDFILE"
echo "Started fetch with PID $NEWPID"
sleep 3
ps -p "$NEWPID" 2>/dev/null && echo "Process alive" || echo "Process died"
