# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fullstack monorepo template. pnpm workspaces + Turborepo.

## Architecture

```
apps/
  service-api/     # REST API: Hono + Drizzle + PostgreSQL + Better-Auth + BullMQ (port 3001)
  web-public/      # Public site + user cabinet: Astro + React islands (port 5182)
  web-control/     # Admin panel: React + Vite + TanStack Router (port 5181)
packages/
  config-eslint/   # Shared ESLint config (eslint-config-k8)
  config-tailwind/ # Shared Tailwind theme (shadcn tokens, dark mode)
  lib/             # Shared utilities (env, theme, router, i18n, style-helpers)
  ui/              # Shared UI components (Button, Input, Label, Card, Select, Tabs, DropdownMenu)
```

### web-public — публичный сайт и личный кабинет пользователя

Astro + React islands. Доступен для всех зарегистрированных пользователей.

**Страницы:**
- `/` — лендинг
- `/sign-in` — вход
- `/register` — регистрация (с подтверждением email)
- `/forgot-password` — запрос сброса пароля
- `/reset-password` — установка нового пароля по токену
- `/profile` — личный кабинет (требует авторизации)

Auth-состояние в шапке (`HeaderAuth`) — React island, `client:load`.
Страница `/profile` редиректит на `/sign-in` если пользователь не авторизован (client-side).

### web-control — панель администратора

React SPA + TanStack Router. Доступ только для пользователей с `role = 'admin'`.

**Страницы:**
- `/login` — вход для администраторов
- `/` — дашборд (только admin)
- `/profile` — профиль администратора
- `/unauthorized` — страница при попытке войти без прав

Администраторы создаются автоматически при регистрации если их email есть в `ADMIN_EMAILS` (env).
Регистрации в web-control нет — только логин.

### service-api — REST API

Hono + Drizzle ORM + Better-Auth + BullMQ.

- `GET /health` — health check
- `POST /api/auth/*` — Better-Auth endpoints (sign-in, sign-up, verify-email, reset-password…)
- `GET /api/users/me`, `PATCH /api/users/me` — профиль текущего пользователя
- `GET /api/admin/stats` — пример admin-only эндпоинта
- Worker: тот же Docker-образ, `node dist/worker.js` — обрабатывает задачи из BullMQ

## Commands

```bash
# Setup environment (nvm, pnpm, direnv)
./scripts/setup-env.sh && pnpm i

# Development (syncs ports, starts Docker, pushes schema, starts all apps)
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

## Key Technical Decisions

- **Auth**: Better-Auth (email+password) with Drizzle adapter — email verification required on sign-up
- **Roles**: `role = 'admin'` auto-assigned on registration if email is in `ADMIN_EMAILS` env var
- **DB**: PostgreSQL 17 via Drizzle ORM — text IDs for auth tables
- **Queue**: BullMQ + Redis 7 — worker runs as separate process/container from the same image
- **Worker scaling**: uncomment `deploy.replicas` in `dokploy/*/compose.yml`
- **web-control**: TanStack Router — does NOT use `packages/lib/router` (React Router v7)
- **web-public**: Astro + React islands (NOT SPA) — auth components use `client:load` / `client:only="react"`
- **Ports**: synced from `../../ports.yml` via `scripts/sync-ports.sh` → `.env.ports.local`

## Deployment

- Docker images built and pushed to GHCR via GitHub Actions (`.github/workflows/ci.yml`)
- Three environments: `main` (production), `stage`, `dev` — each branch maps to its own compose in `dokploy/`
- Worker uses the same image as `service-api`, launched with `node dist/worker.js`
- Auto-deploy via Dokploy webhook: uncomment `trigger_deploy` job in CI and add webhook secrets

## Ports Setup

Порты хранятся в общем файле `ports.yml` вне репозитория. Каждый проект регистрирует свой блок.

**Пример `ports.yml`:**
```yaml
my-project:
  api: 3006
  web-control: 5184
  web-public: 5185
  postgres: 5438
  redis: 6381
```

`scripts/sync-ports.sh` читает этот файл и генерирует `.env.ports.local` в корне проекта.
`vite.config.ts` и `astro.config.ts` читают `.env.ports.local` напрямую — никаких хардкодов.

**Где лежит `ports.yml`:**
По умолчанию скрипт ищет файл на три уровня выше (`../../ports.yml` от корня проекта).
Если структура папок другая — задай переменную `PORTS_FILE` в `.envrc`:
```bash
# .envrc
export PORTS_FILE=/path/to/your/ports.yml
```

## Environment Setup

1. Создай запись для проекта в `ports.yml` (см. раздел "Ports Setup" выше)
2. Если `ports.yml` не на `../../`, добавь `export PORTS_FILE=...` в `.envrc`
3. Скопируй `.env.example` → `.env.local`, заполни `BETTER_AUTH_SECRET` и `ADMIN_EMAILS`
4. Запусти `pnpm dev` — синхронизирует порты, поднимает Docker, накатывает схему, стартует все приложения

## Local Development Notes

- **Email links in console**: SMTP не настроен → `mailer.ts` логирует ссылки (верификация, сброс пароля) в консоль `service-api`. Ищи строки `[mailer] →` в выводе API.
- **CORS / CSRF в dev**: Vite и Astro могут сдвинуть порт если нужный занят. `service-api` разрешает любой `localhost:*` origin и отключает CSRF-проверку Better-Auth когда `NODE_ENV` ≠ `production`.
- **Первый запуск**: `pnpm dev` делает `db:push --force` — схема применяется напрямую без миграций. Для продакшена: `pnpm db:generate` → закоммить `drizzle/` → `pnpm db:migrate`.

## Conventions

- Commit format: `type(scope): message` (feat, fix, chore, docs, refactor, test)
- `packages/lib/router` uses React Router v7 — для использования в web-public Astro islands
- `web-control` uses TanStack Router independently (does not use `packages/lib/router`)
- Secrets template in `secrets.template` (copy to `secrets.local`, gitignored)
- Environment: Node 24.12.0, pnpm 10.26.0
