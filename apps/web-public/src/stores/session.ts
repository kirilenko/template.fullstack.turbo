import type { WritableAtom } from 'nanostores'
import { atom } from 'nanostores'

import { authClient } from '@/services/auth/auth.client'

export type SessionData = typeof authClient.$Infer.Session | null

export type SessionState = {
  data: SessionData
  isPending: boolean
}

// better-auth's internal atom has extra fields (isRefetching, error, refetch)
// and fires on every fetch lifecycle event. We derive a stable atom that only
// updates when data or isPending actually changes — eliminating the isRefetching
// transition render.
type SourceState = SessionState & { isRefetching: boolean; error: unknown; refetch: unknown }
const _source = authClient.$store.atoms['session'] as WritableAtom<SourceState>

// Always start with isPending:true so the server-rendered skeleton matches
// the client's initial render.
// Use listen() not subscribe() — subscribe() fires immediately with the current
// value, which could be isPending:false if a fast 404 resolved before hydration,
// causing a hydration mismatch. listen() only fires on future changes.
export const $session = atom<SessionState>({ data: null, isPending: true })

_source.listen((next) => {
  const prev = $session.get()
  if (prev.data !== next.data || prev.isPending !== next.isPending) {
    $session.set({ data: next.data, isPending: next.isPending })
  }
})
