import type { JSX } from 'react'
import { useEffect } from 'react'
import { RouterProvider } from '@tanstack/react-router'

import { AuthProvider, useAuth } from '@/services/auth'

import { router } from './app.router'

function AppRouter(): JSX.Element {
  const { isAuthenticated, isLoaded } = useAuth()

  useEffect(() => {
    if (isLoaded) void router.invalidate()
  }, [isAuthenticated, isLoaded])

  if (!isLoaded) return <></>

  return <RouterProvider router={router} context={{ isAuthenticated }} />
}

export function App(): JSX.Element {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
