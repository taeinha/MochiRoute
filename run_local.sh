#!/bin/sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

remove_legacy_containers() {
  for name in mochiroute-db mochiroute-app; do
    if docker ps -a --format '{{.Names}}' | grep -qx "$name"; then
      echo "Removing legacy container: $name"
      docker rm -f "$name"
    fi
  done
}

if [ "${1:-}" = "down" ]; then
  echo "Stopping local stack..."
  docker compose down
  exit 0
fi

if [ "${1:-}" = "clean" ]; then
  echo "Stopping local stack and removing volumes..."
  docker compose down -v
  exit 0
fi

echo "Starting local stack (app + postgres)..."
echo "  app:    http://localhost:3000"
echo "  health: http://localhost:3000/health"
echo "  seed:   enabled by default (SEED_DB=true)"
echo ""
echo "Disable seed: SEED_DB=false ./run_local.sh"
echo "Press Ctrl+C to stop. Run './run_local.sh down' to stop in another terminal."

remove_legacy_containers
docker compose up --build
