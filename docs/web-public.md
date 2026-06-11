# web-public — Developer Guide

Public site and user cabinet built with TanStack Start (SSR) + React.

---

## Architecture

TanStack Start is a full-stack React framework. Routes are server-rendered, then hydrated on the client. All components are regular React — no islands, no hydration directives.

```
src/
  routes/          # File-based routing (generated routeTree → src/route-tree.gen.ts)
    __root.tsx     # HTML shell, global styles, header layout
    index.tsx      # Landing page
    sign-in.tsx
    register.tsx
    profile.tsx    # Server-side auth check via createServerFn
    forgot-password.tsx
    reset-password.tsx
  components/
    header-auth.tsx
    auth/          # Auth forms
  stores/
    session.ts     # $session atom (nanostores)
  services/
    auth/
      auth.client.ts   # better-auth client for browser-side calls
      auth.server.ts   # better-auth server instance for createServerFn
  config/
    env.ts         # parseEnv (PUBLIC_API_URL, PUBLIC_RENDER_LOG)
```

---

## Routing

File-based routing via `@tanstack/router-cli`. Run `pnpm generate` to regenerate `route-tree.gen.ts` after adding routes. Vite plugin regenerates automatically during `pnpm dev`.

`tsr.config.json` configures the CLI: `routesDirectory` and `generatedRouteTree`.

---

## Auth

### Server-side (profile route)

Protected routes use `createServerFn` to check session before the page renders:

```ts
// routes/profile.tsx
const checkAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const request = await getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw redirect({ to: '/sign-in' })
  return session.user
})

export const Route = createFileRoute('/profile')({
  loader: () => checkAuth(),
  ...
})
```

The redirect happens on the server — the user never sees a flash of the protected page.

### Client-side session state

`src/stores/session.ts` exposes a nanostores atom `$session` that all components use:

```ts
import { useStore } from '@nanostores/react'
import { $session } from '@/stores/session'

const { data: session, isPending } = useStore($session)
```

**Do not** call `authClient.useSession()` directly in components — it subscribes to better-auth's raw internal atom which fires on `isRefetching` transitions, causing extra renders. `$session` is a derived atom that filters those out.

### How $session works

```
better-auth's internal atom (_source)
  ↓ listen() — only future changes, never fires immediately
  ↓ filter: only when data or isPending actually changes
$session atom (isPending:true → isPending:false when fetch completes)
  ↓ useStore($session)
HeaderAuth / other components
```

`listen()` (not `subscribe()`) is critical: `subscribe()` fires immediately with the current value, which can cause a hydration mismatch if the session resolved before React hydrated.

---

## Render count in dev

With SSR + hydration, `HeaderAuth` renders 4 times on initial page load (visible via react-render-log):

1. **Hydration render** — React matches server HTML
2. **React reconciler commit** — React DevTools observes this as a render
3. **Session resolves** — `$session` updates from `isPending:true` to `isPending:false`
4. **React reconciler commit** — after the state update

Renders 2 and 4 come from React DevTools hooking into the reconciler — they're not from application code. This is dev-only behavior; production has no DevTools overhead.

---

## Adding a new page

1. Create `src/routes/<name>.tsx` with `createFileRoute`
2. Run `pnpm generate` (or restart dev server — it auto-generates)
3. For protected pages: add a `loader` with a `createServerFn` auth check
4. For pages needing session client-side: use `useStore($session)`

---

## Auth forms

Forms call `authClient` methods directly and use `useNavigate()` for redirects after success. They do not need to update `$session` — better-auth updates its internal atom automatically after sign-in/sign-out, which propagates to `$session` via `listen()`.

`sign-in-form` reads `$session` to redirect to `/profile` if already authenticated.
