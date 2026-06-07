#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORTS_FILE="$SCRIPT_DIR/../../../ports.yml"
OUT_FILE="$SCRIPT_DIR/../.env.ports.local"

# Replace with your project name as it appears in ports.yml
PROJECT="template-fullstack-turbo"

if [ ! -f "$PORTS_FILE" ]; then
  echo "Error: $PORTS_FILE not found" >&2
  exit 1
fi

parse_port() {
  local key=$1
  awk "/^${PROJECT}:/{found=1; next} found && /^[^ ]/{exit} found && /^ *${key}:/{print \$2}" "$PORTS_FILE"
}

PORT_API=$(parse_port "api")
PORT_CONTROL=$(parse_port "web-control")
PORT_PUBLIC=$(parse_port "web-public")
PORT_PG=$(parse_port "postgres")
PORT_RD=$(parse_port "redis")

if [ -z "$PORT_API" ] || [ -z "$PORT_CONTROL" ] || [ -z "$PORT_PUBLIC" ] || [ -z "$PORT_PG" ]; then
  echo "Error: could not parse all ports for '$PROJECT' from $PORTS_FILE" >&2
  exit 1
fi

cat > "$OUT_FILE" <<EOF
PORT=$PORT_API
PORT_VITE_CONTROL=$PORT_CONTROL
PORT_ASTRO_PUBLIC=$PORT_PUBLIC
PORT_POSTGRES=$PORT_PG
PUBLIC_API_URL=http://localhost:${PORT_API}
PUBLIC_APP_URL=http://localhost:${PORT_CONTROL},http://localhost:${PORT_PUBLIC}
DATABASE_URL=postgresql://app:app@localhost:${PORT_PG}/app
EOF

if [ -n "$PORT_RD" ]; then
  cat >> "$OUT_FILE" <<EOF
PORT_REDIS=$PORT_RD
REDIS_URL=redis://localhost:${PORT_RD}
EOF
fi

echo "Synced ports from $PORTS_FILE → $OUT_FILE"
echo "  PORT=$PORT_API  PORT_VITE_CONTROL=$PORT_CONTROL  PORT_ASTRO_PUBLIC=$PORT_PUBLIC  PORT_POSTGRES=$PORT_PG  PORT_REDIS=${PORT_RD:-—}"
