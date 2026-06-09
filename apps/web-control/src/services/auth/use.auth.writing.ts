import { useContext } from 'react'

import { authClient } from './auth.client'
import { AuthContext } from './auth.context'

export function useAuthWriting(): {
  signIn: typeof authClient.signIn.email
  signUp: typeof authClient.signUp.email
  signOut: () => Promise<void>
} {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthWriting must be used within AuthProvider')
  return {
    signIn: authClient.signIn.email,
    signUp: authClient.signUp.email,
    signOut: ctx.signOut,
  }
}
