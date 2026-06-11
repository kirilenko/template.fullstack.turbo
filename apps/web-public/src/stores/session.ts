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

export const $session = atom<SessionState>(_source.get())

_source.subscribe((next) => {
  const prev = $session.get()
  if (prev.data !== next.data || prev.isPending !== next.isPending) {
    $session.set({ data: next.data, isPending: next.isPending })
  }
})
