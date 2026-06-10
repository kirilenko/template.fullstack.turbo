import { useState } from 'react'
import { useRenderLog } from 'react-render-log'
import { Link } from '@tanstack/react-router'
import { Eye, EyeOff } from 'lucide-react'

import { paths } from '@/config'
import { useAuthWriting } from '@/services/auth'
import { Input } from '@packages/ui'

export function LoginPage() {
  useRenderLog()('LoginPage')()
  const { signIn, signOut } = useAuthWriting()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isValid = email.includes('@') && password.length > 0

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn({ email, password })
      if (result.error) {
        setError(result.error.message ?? 'Ошибка входа')
        setLoading(false)
        return
      }

      if ((result.data?.user as { role?: string } | null)?.role !== 'admin') {
        setError('Этот аккаунт не является администратором. Обратитесь к владельцу системы.')
        setLoading(false)
        await signOut()
        return
      }

      window.location.href = '/'
    } catch {
      setError('Ошибка входа')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Панель управления</h1>
          <p className="mt-2 text-sm text-muted-foreground">Доступ только для администраторов</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Пароль</label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 inline-flex h-9 w-10 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isValid || loading}
            className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Нет аккаунта?{' '}
          <Link to={paths.register} className="text-foreground underline underline-offset-4 hover:text-primary">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  )
}
