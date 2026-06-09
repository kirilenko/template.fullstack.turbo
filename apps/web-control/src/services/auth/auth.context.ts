import { createContext } from 'react'

import type { AuthRole } from './auth.schema'

export interface AuthContextValue {
  isAuthenticated: boolean
  isLoaded: boolean
  role: AuthRole | null
  user: { id: string; name: string; email: string; image?: string | null } | null
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
