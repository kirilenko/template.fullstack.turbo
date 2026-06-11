import { useRenderLog } from 'react-render-log'
import { useStore } from '@nanostores/react'

import { $session } from '@/stores/session'

export function HeaderAuth() {
  useRenderLog()('HeaderAuth')('expected: 4 in dev (SSR hydration + session fetch)')
  const { data: session, isPending } = useStore($session)

  if (isPending) return <div className="h-8 w-20 animate-pulse rounded bg-muted" />

  if (!session?.user) {
    return (
      <div className="flex items-center gap-3">
        <a href="/sign-in" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          Войти
        </a>
        <a
          href="/register"
          className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Регистрация
        </a>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <a href="/profile" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
        {session.user.name}
      </a>
    </div>
  )
}
