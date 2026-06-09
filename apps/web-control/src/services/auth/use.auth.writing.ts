import { useContext } from 'react'

import { AuthContext } from './auth.context'

export function useAuthWriting(): { signOut: () => Promise<void> } {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthWriting must be used within AuthProvider')
  return { signOut: ctx.signOut }
}
