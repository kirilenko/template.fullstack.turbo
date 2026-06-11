import { atom } from 'nanostores'

import type { authClient } from '@/services/auth/auth.client'

export type SessionData = typeof authClient.$Infer.Session | null

export type SessionState = {
  data: SessionData
  isPending: boolean
}

export const $session = atom<SessionState>({ data: null, isPending: true })
