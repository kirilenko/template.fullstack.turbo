#!/bin/bash
set -e

export COMPOSE_PROJECT_NAME="app-dev"

echo "Stopping Docker services..."
docker compose stop
