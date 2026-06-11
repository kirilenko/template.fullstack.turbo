# web-public — Developer Guide

Public site and user cabinet built with Astro + React islands.

---

## Islands architecture

Astro pages are static HTML. Interactive pieces are React **islands** — they hydrate independently in the browser. Each island is a separate React root with no shared context or state.

**Key rule: fewer islands = fewer re-renders.** Every additional island that subscribes to shared state causes React 18's `useSyncExternalStore` to perform cross-root consistency checks, producing extra renders. Before making something an island, ask: can this be static HTML + a redirect instead?

### Example

The landing page CTA button used to be a React island that showed "Get started" vs "Go to profile" based on auth state. It was replaced with a static `<a href="/sign-in">` — the sign-in page redirects to `/profile` if the user is already authenticated. One less island, zero cross-island re-renders.

### Hydration directives

| Directive | When to use |
|---|---|
| `client:load` | Island must run immediately on page load |
| `client:only="react"` | Island reads `window.*` on mount and must not run during SSG (e.g. `reset-password-form` reads `window.location.search` for the token) |

---

## Sharing state between islands — Nanostores

React context does not cross island boundaries. Use **Nanostores** for any state that multiple islands need.

### Session store

`src/stores/session.ts` exposes better-auth's **internal** session atom directly:

```ts
export const $session = authClient.$store.atoms['session'] as WritableAtom<SessionState>
```

`authClient.useSession()` and `useStore($session)` subscribe to the exact same nanostores atom — no sync layer, no extra renders.

Every island reads session via `useStore($session)`:

```ts
import { useStore } from '@nanostores/react'
import { $session } from '@/stores/session'

const { data: session, isPending } = useStore($session)
```

Do **not** call `authClient.useSession()` directly in islands — it subscribes to better-auth's raw atom which fires on `isRefetching` transitions, producing an extra render per page load.

### Adding shared state for new features

```
src/stores/<name>.ts    ← atom definition + exported type
OneIsland               ← writes to atom (owns the data source)
OtherIsland             ← reads via useStore (no direct API call)
```

---

## Adding a new island

1. Create `src/components/<feature>.tsx` — default export wraps inner component in `<RenderLogIslandProvider>`
2. Add `useRenderLog()('<ComponentName>')()` at the top of the inner component
3. Session: use `useStore($session)` — do **not** call `authClient.useSession()` outside of `HeaderAuth`
4. New shared state: create `src/stores/<name>.ts`, follow the writer/reader pattern above
5. Use in an `.astro` page with `client:load` or `client:only="react"`

---

## Auth forms

Auth forms (`sign-in`, `register`, `forgot-password`, `reset-password`) call `authClient` methods directly and redirect via `window.location.href` on success. They do not write to `$session` — better-auth updates the internal atom automatically after sign-in/sign-out.

`sign-in-form` reads `$session` to redirect to `/profile` if the user is already authenticated.

`profile-section.tsx` reads `$session` for user info and guards the page client-side (redirects to `/sign-in` if no session).
