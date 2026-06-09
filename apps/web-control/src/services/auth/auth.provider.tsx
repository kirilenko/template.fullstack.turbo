import type { JSX, ReactNode } from 'react'
import { useCallback, useMemo } from 'react'

import { authClient } from './auth.client'
import { AuthContext } from './auth.context'
import type { AuthRole } from './auth.schema'

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const { data: session, isPending } = authClient.useSession()

  const signOut = useCallback(async () => {
    await authClient.signOut()
    window.location.href = '/login'
  }, [])

  const user = session?.user ?? null
  const role = (user?.role ?? null) as AuthRole | null

  const value = useMemo(
    () => ({
      isAuthenticated: !!user,
      isLoaded: !isPending,
      role,
      signOut,
      user,
    }),
    [user, isPending, role, signOut],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
