#!/bin/bash
set -e

export COMPOSE_PROJECT_NAME="app-dev"

# Sync ports from ../../ports.yml → .env.ports.local
./scripts/sync-ports.sh

# Build env file (all files are optional except .env.ports.local)
cat /dev/null .env .env.local .env.ports.local 2>/dev/null > .env.build.local

# Start Docker services
echo "Starting Docker services..."
docker compose --env-file .env.build.local up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
until docker compose exec -T postgres pg_isready -U app > /dev/null 2>&1; do
  sleep 1
done
sleep 2

# Run migrations
echo "Running migrations..."
dotenv -e .env.build.local -- pnpm --filter @apps/service-api db:migrate

echo "Ready! Starting all apps via turbo..."
dotenv -e .env.build.local -- turbo run dev dev:worker
