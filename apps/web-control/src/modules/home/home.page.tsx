import type { JSX } from 'react'
import { useRenderLog } from 'react-render-log'

import { useAuthReading } from '@/services/auth'

export function HomePage(): JSX.Element {
  useRenderLog()('HomePage')()
  const { user } = useAuthReading()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Привет, <strong>{user?.name ?? '...'}</strong>
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Добавьте виджеты</p>
          <p className="mt-2 text-3xl font-bold">—</p>
        </div>
      </div>
    </div>
  )
}
