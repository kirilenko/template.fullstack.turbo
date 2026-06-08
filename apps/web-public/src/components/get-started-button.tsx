import { authClient } from '@/services/auth/auth.client'

export default function GetStartedButton() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="inline-flex h-10 w-36 animate-pulse items-center justify-center rounded-md bg-muted" />
    )
  }

  const href = session?.user ? '/profile' : '/sign-in'
  const label = session?.user ? 'Перейти в профиль' : 'Get started'

  return (
    <a
      href={href}
      className="inline-flex h-10 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
    >
      {label}
    </a>
  )
}
