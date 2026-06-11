# template.fullstack.turbo

[![CI](https://github.com/kirilenko/template.fullstack.turbo/actions/workflows/ci.yml/badge.svg)](https://github.com/kirilenko/template.fullstack.turbo/actions/workflows/ci.yml)

Fullstack monorepo template: Hono API + Astro (public site) + React (admin panel).

## Stack

| Layer       | Tech                                                   |
| ----------- | ------------------------------------------------------ |
| API         | Hono · Drizzle ORM · PostgreSQL · Better-Auth · BullMQ |
| Public site | TanStack Start · React · Tailwind v4                   |
| Admin panel | React · Vite · TanStack Router · Tailwind v4           |
| Infra       | pnpm workspaces · Turborepo · Docker · Dokploy         |

---

## Architecture

```
apps/
  service-api/   # REST API (port 3001)
  web-public/    # Public site + user cabinet — TanStack Start SSR (port 5182)
  web-control/   # Admin panel (port 5181)
packages/
  api-client/    # Typed Hono RPC client factories — shared across web and mobile
  config-eslint/ # Shared ESLint config
  config-tailwind/ # Shared Tailwind theme (shadcn tokens, dark mode)
  lib/           # Shared utilities: env, i18n, router, style-helpers
  ui/            # Shared UI components: Button, Input, Card, Select, Tabs…
```

### Apps

#### web-public — public site + user cabinet

TanStack Start (SSR) + React. Available to all registered users.

- `/` — landing
- `/sign-in`, `/register` — auth (email verification required)
- `/forgot-password`, `/reset-password` — password reset
- `/profile` — user cabinet (auth required, redirects to `/sign-in` if not)

→ [Developer guide: islands architecture, session store, Nanostores pattern](docs/web-public.md)

#### web-control — admin panel

React SPA + TanStack Router. Accessible only to users with `role = admin`.

- `/login` — admin login (no registration — admins are seeded via `ADMIN_EMAILS`)
- `/` — dashboard · `/users` — user management · `/news` — news management
- `/profile` — admin profile · `/unauthorized` — shown on access denied

→ [Developer guide: module structure, routing, data loading patterns](docs/web-control.md)

#### service-api — REST API

Hono + Drizzle + Better-Auth + BullMQ.

| Route                                                                                 | Description                                                   |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `GET /health`                                                                         | Health check                                                  |
| `POST /api/auth/*`                                                                    | Better-Auth (sign-in, sign-up, verify-email, reset-password…) |
| `GET /api/users/me` · `PATCH /api/users/me` · `DELETE /api/users/me`                  | Current user profile                                          |
| `GET /api/admin/users` · `PATCH /api/admin/users/:id` · `DELETE /api/admin/users/:id` | User management                                               |
| `GET /api/admin/news` · `POST` · `PATCH /api/admin/news/:id` · `DELETE`               | News management                                               |

Worker runs from the same Docker image: `node dist/worker.js`. Scale with `deploy.replicas` in `dokploy/*/compose.yml`.

### packages/api-client

Typed HTTP client built on Hono RPC (`hc<AppType>`). Uses the standard `fetch` API — works in browser, Node, and React Native.

Exports separate factories by access level — each app takes only what it needs:

| Factory             | Endpoints             | Used by                                |
| ------------------- | --------------------- | -------------------------------------- |
| `createAdminClient` | `/api/admin/*`        | web-control, mobile-admin              |
| `createUserClient`  | `/api/users/*`        | web-public, mobile-public, web-control |
| `createApiClient`   | admin + user combined | web-control (convenience)              |

Types `User`, `NewsItem`, `MeUser` are the source of truth — imported from this package in all apps.

---

## Getting Started

### 1. Ports

Ports live in a shared `ports.yml` outside the repo (one file for all your projects):

```yaml
# ~/ports.yml  (or wherever — set PORTS_FILE in .envrc)
my-project:
  api: 3006
  web-control: 5184
  web-public: 5185
  postgres: 5438
  redis: 6381
```

By default `scripts/sync-ports.sh` reads `../../ports.yml`. Override with `PORTS_FILE` in `.envrc`:

```bash
export PORTS_FILE=/path/to/ports.yml
```

Also set `PROJECT` in `scripts/sync-ports.sh` to match your block name.

### 2. Environment

```bash
cp .env.example .env.local
```

Required:

```bash
BETTER_AUTH_SECRET=   # openssl rand -base64 32
ADMIN_EMAILS=         # comma-separated: admin@example.com,ops@example.com
```

### 3. Run

```bash
./scripts/setup-env.sh   # install nvm, pnpm, direnv (first time only)
pnpm install
pnpm dev                 # syncs ports → Docker up → db:push → starts all apps
```

`pnpm dev` applies the DB schema directly on first run (`db:push`).  
For production use migrations: `pnpm db:generate` → commit `drizzle/` → `pnpm db:migrate`.

### 4. Commands

```bash
pnpm dev:stop         # stop Docker services

pnpm db:generate      # generate Drizzle migration files
pnpm db:migrate       # run pending migrations
pnpm db:push          # push schema directly (dev only)
pnpm db:studio        # open Drizzle Studio

pnpm lint             # ESLint + Prettier (with autofix)
pnpm test             # Vitest
pnpm build            # build all packages
```

---

## Conventions

### Commits

```
type(scope): message

feat(web-control): add news page
fix(service-api): correct token expiry check
chore: update dependencies
```

Types: `feat` · `fix` · `refactor` · `chore` · `docs` · `test` · `perf`

Keep commits small and focused. One logical change per commit.

### Adding a new feature

1. **DB schema** — `service-api/src/db/schema/<feature>.ts`, re-export from `schema/index.ts`
2. **API routes** — add to `service-api/src/routes/` with `zValidator` on POST/PATCH
3. **api-client** — add methods to the appropriate factory in `packages/api-client/src/index.ts`
4. **web-control module** — see [web-control developer guide](docs/web-control.md)

### Environment variables

- `parseEnv` in `packages/lib/src/env` — validates and types env vars at startup
- `required: true` fields throw on missing value; inferred as non-nullable in TypeScript
- Port variables come from `.env.ports.local` (generated by `scripts/sync-ports.sh`)

---

## Deployment

Images are built and pushed to GHCR via GitHub Actions (`.github/workflows/ci.yml`).

Three environments map to branches:

| Branch  | Environment | Compose          |
| ------- | ----------- | ---------------- |
| `main`  | production  | `dokploy/main/`  |
| `stage` | staging     | `dokploy/stage/` |
| `dev`   | dev         | `dokploy/dev/`   |

To enable auto-deploy via Dokploy webhook:

1. Create compose apps in Dokploy for each environment
2. Add webhook secrets to GitHub: `WEBHOOK_IMAGES_PULLING_URL_MAIN`, `_STAGE`, `_DEV`
3. Uncomment the `trigger_deploy` job in `.github/workflows/ci.yml`

---

## Local dev notes

**Email links** — SMTP is not configured by default. Verification and password reset links are logged to the `service-api` console. Look for `[mailer] →` lines.

**Admin account** — add your email to `ADMIN_EMAILS` in `.env.local` before registering. Better-Auth assigns `role = admin` automatically on sign-up.

**Port conflicts** — if Vite or Astro shifts to a different port, auth still works: the API allows any `localhost:*` origin in non-production mode.
