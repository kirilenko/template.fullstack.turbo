# template.fullstack.turbo

Fullstack monorepo template: Hono API + Astro (public site) + React (admin panel).

## Stack

| Layer       | Tech                                                   |
| ----------- | ------------------------------------------------------ |
| API         | Hono · Drizzle ORM · PostgreSQL · Better-Auth · BullMQ |
| Public site | Astro · React islands · Tailwind v4                    |
| Admin panel | React · Vite · TanStack Router · Tailwind v4           |
| Infra       | pnpm workspaces · Turborepo · Docker · Dokploy         |

## Apps

### web-public — public site + user cabinet

Astro + React islands. Available to all registered users.

- `/` — landing
- `/sign-in` — login
- `/register` — registration (email verification required)
- `/forgot-password`, `/reset-password` — password reset
- `/profile` — user cabinet (auth required)

### web-control — admin panel

React SPA. Accessible only to users with `role = admin`.

- `/login` — admin login
- `/` — dashboard
- `/profile` — admin profile

Admins are created automatically on registration if their email is listed in the `ADMIN_EMAILS` env variable. No registration form in the admin panel.

### service-api — REST API

Hono + Drizzle + Better-Auth + BullMQ.

Worker runs from the same Docker image as the API: `node dist/worker.js`.
Scale horizontally by setting `deploy.replicas` in `dokploy/*/compose.yml`.

---

## Getting Started

### 1. Ports setup

Ports are stored in a shared `ports.yml` file outside the repository. Each project registers its own block.

Create or edit your `ports.yml`:

```yaml
# ports.yml — shared across all projects, lives outside repos
my-project:
  api: 3006
  web-control: 5184
  web-public: 5185
  postgres: 5438
  redis: 6381
```

By default `scripts/sync-ports.sh` looks for `ports.yml` two levels up (`../../ports.yml`).
If your folder structure is different, set `PORTS_FILE` in `.envrc`:

```bash
# .envrc
export PORTS_FILE=/path/to/your/ports.yml
```

Also update `PROJECT` variable in `scripts/sync-ports.sh` to match your block name in `ports.yml`.

### 2. Environment

Copy the example and fill in the required values:

```bash
cp .env.example .env.local
```

Required variables in `.env.local`:

```bash
BETTER_AUTH_SECRET=   # generate: openssl rand -base64 32
ADMIN_EMAILS=         # comma-separated, e.g. admin@example.com
```

### 3. Setup & run

```bash
# Install tools: nvm, pnpm, direnv
./scripts/setup-env.sh

# Install dependencies
pnpm install

# Start everything (syncs ports → Docker up → schema push → all apps)
pnpm dev
```

On first run `pnpm dev` applies the database schema directly via `db:push`.
For production use migrations: `pnpm db:generate` → commit `drizzle/` → `pnpm db:migrate`.

### 4. Useful commands

```bash
pnpm dev:stop         # stop Docker services

pnpm db:generate      # generate Drizzle migrations
pnpm db:migrate       # run migrations
pnpm db:push          # push schema directly (dev only)
pnpm db:studio        # open Drizzle Studio

pnpm lint             # ESLint + Prettier
pnpm test             # Vitest
pnpm build            # build all packages
```

---

## Deployment

Docker images are built and pushed to GHCR via GitHub Actions (`.github/workflows/ci.yml`).

Three environments map to branches: `main` → production, `stage` → staging, `dev` → dev.
Each has its own Dokploy compose in `dokploy/`.

To enable auto-deploy via Dokploy webhook:

1. Create compose apps in Dokploy for each environment
2. Add webhook secrets to GitHub: `WEBHOOK_IMAGES_PULLING_URL_MAIN`, `_STAGE`, `_DEV`
3. Uncomment the `trigger_deploy` job in `.github/workflows/ci.yml`

---

## Local dev notes

**Email verification links** — when SMTP is not configured, verification and password reset links are logged to the `service-api` console instead of being sent. Look for `[mailer] →` lines in the API output.

**Admin account** — add your email to `ADMIN_EMAILS` in `.env.local` before registering. On sign-up Better-Auth assigns `role = admin` automatically.

**Ports conflict** — if Vite or Astro shifts to a different port (because the configured one is taken), auth will still work: the API allows any `localhost:*` origin in non-production mode.
