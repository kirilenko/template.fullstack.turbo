import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useRenderLog } from 'react-render-log'

import { Input } from '@packages/ui'
import { paths } from '@/config'
import { useAuthWriting } from '@/services/auth'

import { EyeIcon, EyeOffIcon } from './eye-icons'

export function RegisterPage() {
  useRenderLog()('RegisterPage')()
  const { signUp } = useAuthWriting()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const isValid =
    name.trim().length > 0 &&
    email.includes('@') &&
    password.length >= 8 &&
    (showPassword || password === confirmPassword)

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signUp({
        email,
        password,
        name: name.trim(),
        callbackURL: window.location.origin + '/',
      })

      if (result.error) {
        setError(result.error.message ?? 'Ошибка регистрации')
        setLoading(false)
        return
      }

      setDone(true)
    } catch {
      setError('Ошибка регистрации')
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-2xl font-bold">Подтвердите email</h1>
          <p className="text-sm text-muted-foreground">
            Письмо с подтверждением отправлено на <span className="font-medium text-foreground">{email}</span>.
            Перейдите по ссылке из письма, затем войдите в панель.
          </p>
          <a
            href={paths.login}
            className="inline-flex h-10 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Войти
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Регистрация</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Доступ к панели получат только аккаунты из списка администраторов
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Имя</label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="reg-email" className="text-sm font-medium">Email</label>
            <Input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="reg-password" className="text-sm font-medium">Пароль</label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 inline-flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {!showPassword && (
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">Подтверждение пароля</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                autoComplete="new-password"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={!isValid || loading}
            className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{' '}
          <Link to={paths.login} className="text-foreground underline underline-offset-4 hover:text-primary">
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}
