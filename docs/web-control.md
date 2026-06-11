# web-control — Developer Guide

Admin panel built with React + Vite + TanStack Router.

---

## Module structure

Each feature lives in its own directory under `src/modules/`:

```
src/modules/<feature>/
  <feature>.page.tsx     # React component — receives data as props, no direct API calls
  <feature>.route.tsx    # Route factory — owns the path, loader, and component wrapper
  index.ts               # Public exports
```

Service hooks live in `src/services/<feature>/`:

```
src/services/<feature>/
  <feature>.schema.ts       # Re-exports types from @packages/api-client
  use.<feature>.reading.ts  # Local state (useState wrapper over loader data)
  use.<feature>.writing.ts  # Mutations: create / update / delete + local state sync
  index.ts
```

`src/app/app.router.tsx` is the **assembly point only** — it wires parent-child route
relationships and guards. No API calls, no component definitions.

---

## API client

All API calls go through the typed client from `@packages/api-client`:

```ts
// src/libs/api/index.ts
import { createApiClient } from '@packages/api-client'
import { env } from '@/config'

export const apiClient = createApiClient(env.PUBLIC_API_URL, {
  headers: { 'Content-Type': 'application/json' },
  init: { credentials: 'include' },
})
```

`createApiClient` returns `{ admin, me }` — a convenience wrapper combining
`createAdminClient` and `createUserClient`. Use it directly in loaders and hooks:

```ts
apiClient.admin.users.list()
apiClient.admin.news.create({ title, content, published })
apiClient.me.get()
```

On error, methods throw `ApiError` (from `@packages/api-client`) with a `.status` field.

Types (`User`, `NewsItem`, `MeUser`) come from `@packages/api-client` — import them
from `@/services/<feature>` which re-exports them:

```ts
// services/news/news.schema.ts
export type { NewsItem } from '@packages/api-client'
```

---

## Route factory pattern

Every module exports a `create*Route` factory that receives `getParentRoute`:

```ts
// modules/news/news.route.tsx
export function createNewsRoute<TParent extends AnyRoute>(getParentRoute: () => TParent) {
  const route = createRoute({
    getParentRoute,
    path: paths.news,
    loader: () => apiClient.admin.news.list(),
    component: function NewsPageLoaded() {
      const news = route.useLoaderData() as NewsItem[]
      return <NewsPage initialNews={news} />
    },
  })
  return route
}
```

Registration in the router:

```ts
// app/app.router.tsx
const newsRoute = createNewsRoute(() => adminRoute)
adminRoute.addChildren([homeRoute, newsRoute, profileRoute, usersRoute])
```

This keeps each module self-contained: path, data fetching, and component are co-located
without any knowledge of the routing hierarchy.

---

## Data loading patterns

The router uses `defaultStaleTime: Infinity` — cached loader data never expires
automatically. Mutations update local state directly; call `router.invalidate()` to
force a server refetch.

### Pattern 1 — Route loader (blocking navigation)

**Used by:** `modules/users/users.route.tsx`

Navigation is blocked until the loader resolves. The component renders once with data.

```ts
const route = createRoute({
  getParentRoute,
  path: paths.users,
  loader: () => apiClient.admin.users.list(),
  component: function UsersPageLoaded() {
    const users = route.useLoaderData() as User[]
    return <UsersPage initialUsers={users} />
  },
})
```

Nav link — no `preload` prop (default behaviour):

```tsx
<Link to={paths.users}>Пользователи</Link>
```

**When to use:** data is required to render the page; a brief navigation delay is acceptable.

---

### Pattern 2 — Preload on hover (`intent`)

**Used by:** `modules/news/news.route.tsx` + `app/layout/layout.tsx`

The loader fires as soon as the user hovers over the nav link. By the time they click,
data is already cached — navigation is instant.

The route definition is identical to Pattern 1. The difference is in the nav link:

```tsx
<Link to={paths.news} preload="intent">Новости</Link>
```

In the layout the `preload` field is part of the `NavItem` type:

```ts
const NAV_ITEMS: NavItem[] = [
  { label: 'Пользователи', to: paths.users },
  { label: 'Новости', preload: 'intent', to: paths.news },
]
```

If the user navigates without hovering first, TanStack Router falls back to running the
loader on navigation (same as Pattern 1).

**When to use:** frequently visited pages where instant navigation is a priority.

---

## Adding a new module

1. **DB schema** — `apps/service-api/src/db/schema/<feature>.ts`, export from `schema/index.ts`
2. **API routes** — add handlers to `service-api/src/routes/` with `zValidator` on POST/PATCH
3. **api-client** — add methods to the appropriate factory in `packages/api-client/src/index.ts`; export types if needed
4. **Types** — `src/services/<feature>/<feature>.schema.ts` re-exports from `@packages/api-client`
5. **Hooks** — `use.<feature>.reading.ts` (state) + `use.<feature>.writing.ts` (mutations)
6. **Page** — `src/modules/<feature>/<feature>.page.tsx` — accepts `initial*` prop, calls hooks
7. **Route** — `src/modules/<feature>/<feature>.route.tsx` — `create*Route` factory with loader
8. **Register** — import factory in `app.router.tsx`, add to parent's children
9. **Nav** — add to `NAV_ITEMS` in `layout.tsx`; set `preload: 'intent'` if desired
10. **Path** — add to `src/config/paths.ts`

> After changing the DB schema run `pnpm db:push` (dev) or `pnpm db:generate` + commit + `pnpm db:migrate` (production).
