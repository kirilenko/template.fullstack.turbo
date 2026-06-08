#!/bin/bash
set -e

export COMPOSE_PROJECT_NAME="app-dev"

# Sync ports from ../../ports.yml → .env.ports.local
./scripts/sync-ports.sh

# Build env file from whichever files exist (.env.ports.local always present after sync)
> .env.build.local
for f in .env .env.local .env.ports.local; do
  [ -f "$f" ] && cat "$f" >> .env.build.local || true
done

# Kill any stray processes on the required ports (leftover from previous dev sessions)
kill_port() {
  local port="$1"
  local pid
  pid=$(lsof -ti :"$port" 2>/dev/null) || true
  if [ -n "$pid" ]; then
    echo "Killing stray process on port $port (pid $pid)..."
    kill "$pid" 2>/dev/null || true
    sleep 1
  fi
}

get_port() {
  grep "^$1=" .env.ports.local 2>/dev/null | cut -d= -f2
}

kill_port "$(get_port PORT)"
kill_port "$(get_port PORT_VITE_CONTROL)"
kill_port "$(get_port PORT_ASTRO_PUBLIC)"

# Start Docker services
echo "Starting Docker services..."
docker compose --env-file .env.build.local up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
until docker compose exec -T postgres pg_isready -U app > /dev/null 2>&1; do
  sleep 1
done
sleep 2

# Push schema to DB (dev only — use db:generate + db:migrate for production)
echo "Pushing schema..."
dotenv -e .env.build.local -- pnpm --filter @apps/service-api db:push:force

echo "Ready! Starting all apps via turbo..."
dotenv -e .env.build.local -- turbo run dev dev:worker
