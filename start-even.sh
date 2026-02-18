#!/usr/bin/env bash

set -e

PORT="${PORT:-5173}"
URL="http://127.0.0.1:${PORT}"

echo "Starting Pong Even G2 development environment... ${URL}"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed."
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Starting Vite dev server..."
npx vite --host 0.0.0.0 --port "${PORT}" &

VITE_PID=$!
trap "kill ${VITE_PID}" EXIT

echo "Waiting for Vite server..."
until curl --output /dev/null --silent --head --fail "$URL"; do
  sleep 1
done

echo "Vite is ready."

echo "Launching Even Hub Simulator..."
if command -v evenhub-simulator >/dev/null 2>&1; then
  evenhub-simulator "${URL}"
else
  npx @evenrealities/evenhub-simulator "${URL}"
fi
