import type { JSX } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { RouterProvider } from '@tanstack/react-router'

import { AuthProvider, useAuthReading } from '@/services/auth'
import { ThemeProvider } from '@packages/lib/theme'

import { router } from './app.router'

function AppRouter(): JSX.Element {
  const { isAuthenticated, isLoaded, role } = useAuthReading()
  const [ready, setReady] = useState(false)
  const isInitialLoad = useRef(true)

  useEffect(() => {
    if (!isLoaded) return
    if (isInitialLoad.current) {
      isInitialLoad.current = false
      setReady(true)
      return
    }
    void router.invalidate()
  }, [isAuthenticated, isLoaded, role])

  const context = useMemo(
    () => ({ isAdmin: role === 'admin', isAuthenticated }),
    [role, isAuthenticated],
  )

  if (!ready) return <></>

  return <RouterProvider router={router} context={context} />
}

export function App(): JSX.Element {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  )
}
