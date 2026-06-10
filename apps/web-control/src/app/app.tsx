import type { JSX } from 'react'
import { useEffect, useState } from 'react'
import { RouterProvider } from '@tanstack/react-router'

import { AuthProvider, useAuthReading } from '@/services/auth'
import { ThemeProvider } from '@packages/lib/theme'

import { router } from './app.router'

function AppRouter(): JSX.Element {
  const { isAuthenticated, isLoaded, role } = useAuthReading()
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (isLoaded) setHasLoaded(true)
  }, [isLoaded])

  useEffect(() => {
    if (isLoaded) void router.invalidate()
  }, [isAuthenticated, isLoaded, role])

  if (!hasLoaded) return <></>

  return (
    <RouterProvider
      router={router}
      context={{ isAdmin: role === 'admin', isAuthenticated }}
    />
  )
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
