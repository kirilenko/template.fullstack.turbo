import { createFileRoute } from '@tanstack/react-router'

import { RegisterForm } from '@/components/auth/register-form'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
  head: () => ({ meta: [{ title: 'Регистрация — App' }] }),
})

function RegisterPage() {
  return <RegisterForm />
}
