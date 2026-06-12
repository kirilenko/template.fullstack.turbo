# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fullstack monorepo template. pnpm workspaces + Turborepo.

## Architecture

```
apps/
  service-api/     # REST API: Hono + Drizzle + PostgreSQL + Better-Auth + BullMQ (port 3001)
  web-control/     # Admin panel: React + Vite + TanStack Router (port 5181)
packages/
  api-client/      # Typed Hono RPC client factories (shared across web and mobile)
  config-eslint/   # Shared ESLint config (eslint-config-k8)
  config-tailwind/ # Shared Tailwind theme (shadcn tokens, dark mode)
  lib/             # Shared utilities (env, theme, router, i18n, style-helpers)
  ui/              # Shared UI components (Button, Input, Label, Card, Select, Tabs, DropdownMenu)
```

### web-control — панель администратора

React SPA + TanStack Router. Доступ только для пользователей с `role = 'admin'`.

**Страницы:**

- `/login` — вход для администраторов
- `/` — дашборд (только admin)
- `/users` — управление пользователями
- `/news` — управление новостями
- `/profile` — профиль администратора
- `/unauthorized` — страница при попытке войти без прав

Администраторы создаются автоматически при регистрации если их email есть в `ADMIN_EMAILS` (env).
Регистрации в web-control нет — только логин.

**Паттерны загрузки данных в web-control:**

Каждый модуль (`modules/*/`) сам описывает способ загрузки через `create*Route` в `*.route.tsx`.
В `app.router.tsx` — только сборка дерева маршрутов, никаких API-вызовов.

| Паттерн              | Где используется                                     | Как работает                                                                                                                                                               |
| -------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Route loader**     | `users.route.tsx`                                    | Загрузка блокирует навигацию. Компонент рендерится один раз — сразу с данными. Применять когда данные обязательны для отображения страницы.                                |
| **Preload on hover** | `news.route.tsx` + `layout.tsx` (`preload="intent"`) | Загрузка стартует при наведении на пункт меню. К моменту клика данные уже закэшированы — навигация мгновенная. Применять для оптимизации UX на часто посещаемых страницах. |

Глобальный `defaultStaleTime: Infinity` — закэшированные данные не устаревают автоматически.
Мутации обновляют локальный стейт через `setNews`/`setUsers`. Для принудительного обновления — `router.invalidate()`.

### service-api — REST API

Hono + Drizzle ORM + Better-Auth + BullMQ.

- `GET /health` — health check
- `POST /api/auth/*` — Better-Auth endpoints (sign-in, sign-up, verify-email, reset-password…)
- `GET /api/users/me`, `PATCH /api/users/me` — профиль текущего пользователя
- `GET /api/admin/stats` — пример admin-only эндпоинта
- `GET /api/admin/users`, `PATCH /api/admin/users/:id`, `DELETE /api/admin/users/:id` — управление пользователями
- `GET /api/admin/news`, `POST /api/admin/news`, `PATCH /api/admin/news/:id`, `DELETE /api/admin/news/:id` — управление новостями
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

### packages/api-client — типизированный HTTP-клиент

Обёртка над Hono RPC (`hc<AppType>`). Экспортирует отдельные фабрики по уровню доступа — каждое приложение берёт только нужное:

| Фабрика             | Эндпоинты                 | Кто использует                         |
| ------------------- | ------------------------- | -------------------------------------- |
| `createAdminClient` | `/api/admin/*`            | web-control, mobile-admin              |
| `createUserClient`  | `/api/users/*`            | mobile-public, web-control             |
| `createApiClient`   | admin + user (комбинация) | web-control (удобство)                 |

Клиент использует стандартный `fetch` → работает в браузере, Node и React Native без изменений.

Типы `User`, `NewsItem`, `MeUser` определены здесь и реэкспортируются в `apps/*/services` — единственный источник правды.

## Key Technical Decisions

- **Auth**: Better-Auth (email+password) with Drizzle adapter — email verification required on sign-up
- **Roles**: `role = 'admin'` auto-assigned on registration if email is in `ADMIN_EMAILS` env var
- **DB**: PostgreSQL 17 via Drizzle ORM — text IDs for auth tables
- **Queue**: BullMQ + Redis 7 — worker runs as separate process/container from the same image
- **Worker scaling**: uncomment `deploy.replicas` in `dokploy/*/compose.yml`
- **web-control**: TanStack Router SPA — does NOT use `packages/lib/router` (React Router v7)
- **Ports**: synced from `../../ports.yml` via `scripts/sync-ports.sh` → `.env.ports.local`

## Deployment

- Docker images built and pushed to GHCR via GitHub Actions (`.github/workflows/ci.yml`)
- Three environments: `main` (production), `stage`, `dev` — each branch maps to its own compose in `dokploy/`
- Worker uses the same image as `service-api`, launched with `node dist/worker.js`
- Auto-deploy via Dokploy webhook: uncomment `trigger_deploy` job in CI and add webhook secrets

## Environment Setup

See `README.md` for full setup instructions (ports, env, first run).

Quick start:

1. Add project entry to `ports.yml`, set `PORTS_FILE` in `.envrc` if needed
2. Copy `.env.example` → `.env.local`, fill `BETTER_AUTH_SECRET` and `ADMIN_EMAILS`
3. `pnpm dev`

## Local Development Notes

- **Email links in console**: SMTP не настроен → `mailer.ts` логирует ссылки (верификация, сброс пароля) в консоль `service-api`. Ищи строки `[mailer] →` в выводе API.
- **CORS / CSRF в dev**: Vite может сдвинуть порт если нужный занят. `service-api` разрешает любой `localhost:*` origin и отключает CSRF-проверку Better-Auth когда `NODE_ENV` ≠ `production`.
- **Первый запуск**: `pnpm dev` делает `db:push --force` — схема применяется напрямую без миграций. Для продакшена: `pnpm db:generate` → закоммить `drizzle/` → `pnpm db:migrate`.

## Conventions

- Commit format: `type(scope): message` (feat, fix, chore, docs, refactor, test)
- `web-control` uses TanStack Router independently (does not use `packages/lib/router`)
- Secrets template in `secrets.template` (copy to `secrets.local`, gitignored)
- Environment: Node 24.12.0, pnpm 10.26.0
