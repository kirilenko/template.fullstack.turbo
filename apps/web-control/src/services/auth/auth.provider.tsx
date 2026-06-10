import type { JSX, ReactNode } from 'react'
import { useCallback, useMemo, useRef } from 'react'

import { authClient } from './auth.client'
import { AuthContext } from './auth.context'
import type { AuthRole } from './auth.schema'

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const { data: session, isPending } = authClient.useSession()

  const signOut = useCallback(async () => {
    try {
      await authClient.signOut()
    } catch {
      // session may already be expired
    }
  }, [])

  const userId = session?.user?.id ?? null
  const sessionRole = ((session?.user as { role?: string } | null)?.role ?? null) as AuthRole | null

  // Stabilize by both id and role so a server-side role change is picked up
  const user = useMemo(() => session?.user ?? null, [userId, sessionRole]) // eslint-disable-line react-hooks/exhaustive-deps

  // Once loaded, stays loaded — prevents context churn during background session revalidation
  const wasLoadedRef = useRef(false)
  if (!isPending) wasLoadedRef.current = true
  const isLoaded = wasLoadedRef.current

  const value = useMemo(
    () => ({
      isAuthenticated: !!user,
      isLoaded,
      role: sessionRole,
      signOut,
      user,
    }),
    [user, isLoaded, sessionRole, signOut],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
