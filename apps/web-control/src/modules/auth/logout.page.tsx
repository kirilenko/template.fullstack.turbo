import { useRenderLog } from 'react-render-log'

import { useAuthWriting } from '@/services/auth'

export function LogoutPage() {
  useRenderLog()('LogoutPage')()
  const { signOut } = useAuthWriting()

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/login'
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Выход</h1>
        <p className="text-muted-foreground">Вы уверены, что хотите выйти?</p>
        <div className="flex justify-center gap-2">
          <a
            href="/"
            className="inline-flex h-10 items-center rounded-md border border-input px-6 text-sm font-medium transition-colors hover:bg-accent"
          >
            Отмена
          </a>
          <button
            onClick={handleLogout}
            className="inline-flex h-10 items-center rounded-md bg-destructive px-6 text-sm font-medium text-white transition-colors hover:bg-destructive/90"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  )
}
