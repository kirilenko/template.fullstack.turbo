# web-public — Developer Guide

Public site and user cabinet built with Astro + React islands.

---

## Islands architecture

Astro pages are static HTML. Interactive pieces are React **islands** — they hydrate independently in the browser. Each island is a separate React root: no shared context, no shared state by default.

Two directives are used:

| Directive | When to use |
|---|---|
| `client:load` | Island needs to run immediately on page load (auth header, buttons) |
| `client:only="react"` | Island reads `window.*` on mount — must not run during SSG (e.g. `reset-password-form` reads `window.location.search` for the token) |

---

## Sharing state between islands — Nanostores

Because islands are separate React roots, React context does not cross island boundaries. Use **Nanostores** (`nanostores` + `@nanostores/react`) for any state that multiple islands need.

### Pattern: one writer, many readers

One island owns the data and writes to the atom. All others read from it with `useStore`.

```
src/stores/<name>.ts   ← atom definition
HeaderAuth             ← writer (calls the real API/hook, writes to atom)
OtherIsland            ← reader (useStore only, no API call)
```

### Session store

`src/stores/session.ts` holds the current auth session. `HeaderAuth` is the **only** island that calls `authClient.useSession()` and syncs the result into `$session`:

```ts
// header-auth.tsx — the session writer
const { data, isPending } = authClient.useSession()
useEffect(() => { $session.set({ data: data ?? null, isPending }) }, [data, isPending])
```

Every other island that needs session reads from the atom:

```ts
// any-other-island.tsx — reader
import { useStore } from '@nanostores/react'
import { $session } from '@/stores/session'

const { data: session, isPending } = useStore($session)
```

**Why this matters:** if every island calls `authClient.useSession()` independently, each subscribes to better-auth's internal session atom separately. When a second island hydrates and subscribes, it triggers an extra re-render in the first island. The writer/reader split eliminates this.

---

## Adding a new island

1. Create `src/components/<feature>.tsx` — export a default component wrapping the inner component in `<RenderLogIslandProvider>`
2. Add `useRenderLog()('<ComponentName>')()` at the top of the inner component
3. If the island needs session: import `$session` and use `useStore($session)`
4. If the island owns new shared state: create `src/stores/<name>.ts` and follow the writer/reader pattern
5. Use the island in an `.astro` page with `client:load` or `client:only="react"`

---

## Auth forms

Auth forms (`sign-in`, `register`, `forgot-password`, `reset-password`) use `authClient` directly — they POST to the API and don't need to read the session atom. After a successful sign-in, they redirect via `window.location.href`.

`profile-section.tsx` reads `$session` to show user info and guards the page client-side (redirects to `/sign-in` if no session).
