import type { JSX } from 'react'

import { useAuth } from '@/services/auth'

export function ProfilePage(): JSX.Element {
  const { user } = useAuth()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Профиль</h1>
      <div className="mt-6 max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-xl font-semibold">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="font-semibold">{user?.name ?? '—'}</p>
            <p className="text-sm text-muted-foreground">{user?.email ?? '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
