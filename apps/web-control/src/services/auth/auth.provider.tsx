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

  // Stabilize user reference by identity — better-auth may return a new object on each poll
  const userId = session?.user?.id ?? null
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const user = useMemo(() => session?.user ?? null, [userId])
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
