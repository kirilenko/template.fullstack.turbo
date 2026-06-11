import { useRenderLog } from 'react-render-log'
import { useStore } from '@nanostores/react'

import { authClient } from '@/services/auth/auth.client'
import { $session } from '@/stores/session'

export function ProfileSection() {
  useRenderLog()('ProfileSection')()
  const { data: session, isPending } = useStore($session)

  if (isPending) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="text-sm text-muted-foreground">Загрузка...</div>
      </div>
    )
  }

  if (!session?.user) return null

  const { user } = session

  const handleSignOut = async () => {
    await authClient.signOut()
    window.location.href = '/'
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="text-2xl font-bold">Профиль</h1>

      <div className="mt-6 rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-xl font-semibold">
            {user.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={handleSignOut}
          className="inline-flex h-9 items-center rounded-md border border-input px-4 text-sm font-medium transition-colors hover:bg-accent"
        >
          Выйти
        </button>
      </div>
    </div>
  )
}
