import { useState } from 'react'
import { useRenderLog } from 'react-render-log'

import { RenderLogIslandProvider } from '@/libs/render-log-provider'
import { authClient } from '@/services/auth/auth.client'

function ForgotPasswordFormInner() {
  useRenderLog()('ForgotPasswordForm')()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      })
      setSuccess(true)
    } catch {
      setError('Ошибка отправки письма')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-2xl font-bold">Письмо отправлено</h1>
          <p className="text-sm text-muted-foreground">
            Проверьте почту <strong>{email}</strong> и перейдите по ссылке для сброса пароля
          </p>
          <a href="/sign-in" className="text-sm text-primary hover:underline">Вернуться к входу</a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Сброс пароля</h1>
          <p className="mt-2 text-sm text-muted-foreground">Введите ваш email для получения ссылки</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              autoComplete="email" />
          </div>
          <button type="submit" disabled={!email.includes('@') || loading}
            className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
            {loading ? 'Отправка...' : 'Отправить ссылку'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <a href="/sign-in" className="text-primary hover:underline">Вернуться к входу</a>
        </p>
      </div>
    </div>
  )
}

export default function ForgotPasswordForm() {
  return <RenderLogIslandProvider><ForgotPasswordFormInner /></RenderLogIslandProvider>
}
