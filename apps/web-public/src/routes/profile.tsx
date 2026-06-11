import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

import { ProfileSection } from '@/components/auth/profile-section'
import { auth } from '@/services/auth/auth.server'

const checkAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const request = await getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw redirect({ to: '/sign-in' })
  return session.user
})

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
  head: () => ({ meta: [{ title: 'Профиль — App' }] }),
  loader: () => checkAuth(),
})

function ProfilePage() {
  return <ProfileSection />
}
