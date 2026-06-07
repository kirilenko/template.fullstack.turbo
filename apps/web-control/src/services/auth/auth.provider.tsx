import type { JSX, ReactNode } from 'react'
import { createContext, useContext } from 'react'

import { authClient } from './auth.client'
import type { AuthRole } from './auth.schema'

interface AuthContextValue {
  isAuthenticated: boolean
  isLoaded: boolean
  role: AuthRole | null
  user: { id: string; name: string; email: string; image?: string | null } | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isLoaded: false,
  role: null,
  signOut: async () => {},
  user: null,
})

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const { data: session, isPending } = authClient.useSession()

  const signOut = async () => {
    await authClient.signOut()
    window.location.href = '/login'
  }

  const user = session?.user ?? null
  const role = (user?.role ?? null) as AuthRole | null

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        isLoaded: !isPending,
        role,
        signOut,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}
