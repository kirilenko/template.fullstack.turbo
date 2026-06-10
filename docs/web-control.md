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
  <feature>.schema.ts    # TypeScript types (interfaces matching the API response)
  use.<feature>.reading.ts  # Local state management (useState wrapper over loader data)
  use.<feature>.writing.ts  # Mutations: create / update / delete + local state sync
  index.ts
```

`src/app/app.router.tsx` is the **assembly point only** — it wires parent-child route
relationships and guards. No API calls, no component definitions.

---

## Route factory pattern

Every module exports a `create*Route` factory that receives `getParentRoute` as an argument:

```ts
// modules/news/news.route.tsx
export function createNewsRoute<TParent>(getParentRoute: () => TParent) {
  const route = createRoute({
    getParentRoute,
    path: paths.news,
    loader: (): Promise<NewsItem[]> => apiFetch<NewsItem[]>('/api/admin/news'),
    component: function NewsPageLoaded() {
      const news = route.useLoaderData()
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
// ...
adminRoute.addChildren([homeRoute, newsRoute, profileRoute, usersRoute])
```

This keeps each module self-contained: path, data fetching, and component are co-located
without any knowledge of the routing hierarchy.

---

## Data loading patterns

The router is configured with `defaultStaleTime: Infinity` — cached loader data never
expires automatically. Mutations update local state directly; call `router.invalidate()`
when you need a forced server refetch.

### Pattern 1 — Route loader (blocking navigation)

**Used by:** `modules/users/users.route.tsx`

The loader runs when the user navigates to the route. Navigation is blocked until the
loader resolves. The component renders **once**, with data already available.

```ts
const route = createRoute({
  getParentRoute,
  path: paths.users,
  loader: (): Promise<User[]> => apiFetch<User[]>('/api/admin/users'),
  component: function UsersPageLoaded() {
    const users = route.useLoaderData()
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
data is already cached — navigation is instant and the component renders once with data.

The route definition is identical to Pattern 1. The difference is in the nav link:

```tsx
// app/layout/layout.tsx
<Link to={paths.news} preload="intent">
  Новости
</Link>
```

In the layout the `preload` field is part of the `NavItem` type so it can be declared
alongside other nav metadata:

```ts
const NAV_ITEMS: NavItem[] = [
  { label: 'Пользователи', to: paths.users },
  { label: 'Новости',      to: paths.news, preload: 'intent' },
]
```

If the user navigates without hovering first, TanStack Router falls back to running the
loader on navigation (same as Pattern 1).

**When to use:** frequently visited pages where instant navigation is a priority.

---

## Adding a new module

1. **DB schema** — `apps/service-api/src/db/schema/<feature>.ts`, export from `schema/index.ts`
2. **API** — add CRUD handlers to `apps/service-api/src/routes/admin.ts`
3. **Types** — `src/services/<feature>/` (schema + reading hook + writing hook + index)
4. **Page** — `src/modules/<feature>/<feature>.page.tsx` — accepts `initial*` prop, no direct fetching
5. **Route** — `src/modules/<feature>/<feature>.route.tsx` — `create*Route` factory with loader
6. **Register** — import factory in `app.router.tsx`, call it with the parent route
7. **Nav** — add entry to `NAV_ITEMS` in `layout.tsx`; add `preload: 'intent'` if desired
8. **Path** — add to `src/config/paths.ts`

> After changing the DB schema run `pnpm db:push` (dev) or generate a migration (production).
