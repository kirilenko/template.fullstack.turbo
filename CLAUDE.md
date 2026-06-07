# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fullstack monorepo template. pnpm workspaces + Turborepo.

## Commands

```bash
# Setup environment (nvm, pnpm, direnv)
./scripts/setup-env.sh && pnpm i

# Development (syncs ports, starts Docker, runs migrations, starts all apps)
pnpm dev

# Stop Docker services
pnpm dev:stop

# Individual apps
pnpm --filter @apps/service-api dev
pnpm --filter @apps/service-api dev:worker
pnpm --filter @apps/web-control dev
pnpm --filter @apps/web-public dev

# Database
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema directly (dev only)
pnpm db:studio        # Open Drizzle Studio

# Quality
pnpm lint             # ESLint + Prettier across all packages
pnpm test             # Vitest across all packages
pnpm build            # Build all packages
```

## Architecture

```
apps/
  service-api/     # Hono + Drizzle + BullMQ (port 3001)
  web-control/     # React + Vite + TanStack Router admin panel (port 5181)
  web-public/      # Astro + React public landing (port 5182)
packages/
  config-eslint/   # Shared ESLint config (eslint-config-k8)
  config-tailwind/ # Shared Tailwind theme (shadcn tokens, dark mode)
  lib/             # Shared utilities (env, theme, router, i18n, style-helpers)
  ui/              # Shared UI components (Button, Input, Label, Card, Select, Tabs, DropdownMenu)
```

## Key Technical Decisions

- **Auth**: Better-Auth (email+password) with Drizzle adapter
- **DB**: PostgreSQL 17 via Drizzle ORM — text IDs for auth tables
- **Queue**: BullMQ + Redis 7 — worker runs as separate process/container from the same image
- **Worker scaling**: `docker service` replicas or Dokploy `deploy.replicas` in compose
- **web-control**: TanStack Router (not React Router), services/auth pattern with real Better-Auth client
- **web-public**: Astro + React islands (NOT SPA)
- **Ports**: synced from `../../ports.yml` via `scripts/sync-ports.sh` → `.env.ports.local`

## Deployment

- Docker images built and pushed to GHCR via GitHub Actions (`.github/workflows/ci.yml`)
- Three environments: `main` (production), `stage`, `dev` — each branch maps to its own compose in `dokploy/`
- Worker uses the same image as `service-api`, launched with `node dist/worker.js`
- To scale workers: uncomment `deploy.replicas` in the relevant `dokploy/*/compose.yml`
- Auto-deploy via Dokploy webhook: uncomment `trigger_deploy` job in CI and add webhook secrets

## Environment Setup

1. Copy `.env.example` → `.env` and `.env.local`
2. Fill in `BETTER_AUTH_SECRET` (generate: `openssl rand -base64 32`)
3. Add your project to `../../ports.yml` so `sync-ports.sh` picks up the right ports
4. Run `pnpm dev` — it syncs ports, starts Docker, migrates, and launches all apps

## Conventions

- Commit format: `type(scope): message` (feat, fix, chore, docs, refactor, test)
- `packages/lib/router` uses React Router v7 (for web-public Astro islands)
- `web-control` uses TanStack Router independently (does not use `packages/lib/router`)
- Secrets template in `secrets.template` (copy to `secrets.local`, gitignored)
- Environment: Node 24.12.0, pnpm 10.26.0
