import { useRenderLog } from 'react-render-log'

export function UnauthorizedPage() {
  useRenderLog()('UnauthorizedPage')()
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Нет доступа</h1>
        <p className="text-muted-foreground">Эта панель доступна только администраторам.</p>
        <a
          href="/login"
          className="inline-flex h-10 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Войти как администратор
        </a>
      </div>
    </div>
  )
}
