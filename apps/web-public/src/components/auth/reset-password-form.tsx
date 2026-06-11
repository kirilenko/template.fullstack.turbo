import { useState } from 'react'
import { useRenderLog } from 'react-render-log'
import { useSearch } from '@tanstack/react-router'

import { authClient } from '@/services/auth/auth.client'

export function ResetPasswordForm() {
  useRenderLog()('ResetPasswordForm')()
  const search = useSearch({ strict: false }) as { token?: string; error?: string }
  const token = search.token ?? null
  const urlError = search.error ?? null

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  if (urlError === 'INVALID_TOKEN' || !token) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-2xl font-bold">Ссылка недействительна</h1>
          <p className="text-sm text-muted-foreground">Ссылка для сброса пароля истекла или недействительна</p>
          <a href="/forgot-password" className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Запросить новую ссылку
          </a>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-2xl font-bold">Пароль изменён</h1>
          <p className="text-sm text-muted-foreground">Ваш пароль успешно обновлён</p>
          <a href="/sign-in" className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Войти
          </a>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    setLoading(true)

    try {
      const result = await authClient.resetPassword({ newPassword: password, token })
      if (result.error) {
        setError(result.error.message ?? 'Ошибка сброса пароля')
        setLoading(false)
        return
      }
      setSuccess(true)
    } catch {
      setError('Ошибка сброса пароля')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Новый пароль</h1>
          <p className="mt-2 text-sm text-muted-foreground">Введите новый пароль</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Новый пароль</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required minLength={8}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirm" className="text-sm font-medium">Подтверждение пароля</label>
            <input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              required minLength={8}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button type="submit" disabled={password.length < 8 || loading}
            className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
            {loading ? 'Сохранение...' : 'Сохранить пароль'}
          </button>
        </form>
      </div>
    </div>
  )
}
