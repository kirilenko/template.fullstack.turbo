#!/bin/sh
set -e

echo "[entrypoint] Waiting for database..."
DB_HOST=$(printf '%s' "$DATABASE_URL" | sed 's|.*@\([^:/?]*\).*|\1|')
DB_PORT=$(printf '%s' "$DATABASE_URL" | sed 's|.*:\([0-9]*\)/.*|\1|')
i=0
until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
  i=$((i + 1))
  if [ "$i" -ge 30 ]; then
    echo "[entrypoint] Database not reachable after 30s, aborting"
    exit 1
  fi
  sleep 1
done

echo "[entrypoint] Running database migrations..."
node dist/db/migrate.js

echo "[entrypoint] Migrations complete. Starting application..."
exec "$@"
