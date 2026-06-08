import { useState } from 'react'

import { authClient } from '@/services/auth/auth.client'

export default function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const isValid =
    name.length >= 2 &&
    email.includes('@') &&
    password.length >= 8 &&
    (showPassword || password === confirmPassword)

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setError('')

    if (!showPassword && password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    setLoading(true)

    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: window.location.origin + '/profile',
      })
      if (result.error) {
        setError(result.error.message ?? 'Ошибка регистрации')
        setLoading(false)
        return
      }
      setSuccess(true)
    } catch {
      setError('Ошибка регистрации')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-2xl font-bold">Проверьте почту</h1>
          <p className="text-sm text-muted-foreground">
            Мы отправили письмо с подтверждением на <strong>{email}</strong>
          </p>
          <a href="/sign-in" className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Войти
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Регистрация</h1>
          <p className="mt-2 text-sm text-muted-foreground">Создайте аккаунт</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Имя</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required minLength={2}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              autoComplete="name" />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              autoComplete="email" />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Пароль</label>
            <div className="relative">
              <input id="password" type={showPassword ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)} required minLength={8}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                autoComplete="new-password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 inline-flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground">
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {!showPassword && (
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Подтверждение пароля</label>
              <input id="confirmPassword" type="password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                autoComplete="new-password" />
            </div>
          )}

          <button type="submit" disabled={!isValid || loading}
            className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{' '}
          <a href="/sign-in" className="text-primary hover:underline">Войти</a>
        </p>
      </div>
    </div>
  )
}
