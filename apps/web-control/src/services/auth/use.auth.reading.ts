import { useContext } from 'react'

import { AuthContext } from './auth.context'
import type { AuthRole } from './auth.schema'

export function useAuthReading(): {
  isAuthenticated: boolean
  isLoaded: boolean
  role: AuthRole | null
  user: { id: string; name: string; email: string; image?: string | null } | null
} {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthReading must be used within AuthProvider')
  return { isAuthenticated: ctx.isAuthenticated, isLoaded: ctx.isLoaded, role: ctx.role, user: ctx.user }
}
