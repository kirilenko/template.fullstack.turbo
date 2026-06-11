import type { WritableAtom } from 'nanostores'

import { authClient } from '@/services/auth/auth.client'

export type SessionData = typeof authClient.$Infer.Session | null

export type SessionState = {
  data: SessionData
  error: unknown
  isPending: boolean
}

// better-auth internally stores session in a nanostores atom.
// Exposing it directly means useSession() and useStore($session)
// subscribe to the exact same atom — no sync, no extra renders.
export const $session = authClient.$store.atoms['session'] as WritableAtom<SessionState>
