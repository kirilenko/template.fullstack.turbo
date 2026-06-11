import { createFileRoute } from '@tanstack/react-router'

import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
  head: () => ({ meta: [{ title: 'Сброс пароля — App' }] }),
})

function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
