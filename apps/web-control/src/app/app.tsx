import type { JSX } from 'react'
import { useEffect, useRef } from 'react'
import { RouterProvider } from '@tanstack/react-router'

import { AuthProvider, useAuth } from '@/services/auth'

import { router } from './app.router'

function AppRouter(): JSX.Element {
  const { isAuthenticated, isLoaded, role } = useAuth()
  const hasLoaded = useRef(false)
  if (isLoaded) hasLoaded.current = true

  useEffect(() => {
    if (isLoaded) void router.invalidate()
  }, [isAuthenticated, isLoaded, role])

  if (!hasLoaded.current) return <></>

  return (
    <RouterProvider
      router={router}
      context={{ isAdmin: role === 'admin', isAuthenticated }}
    />
  )
}

export function App(): JSX.Element {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
