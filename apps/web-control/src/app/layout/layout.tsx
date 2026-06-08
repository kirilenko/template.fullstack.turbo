import type { JSX } from 'react'
import { Link, Outlet, useLocation } from '@tanstack/react-router'

import { paths } from '@/config'
import { useAuth } from '@/services/auth'

const NAV_ITEMS = [
  { label: 'Dashboard', to: paths.home },
  { label: 'Пользователи', to: paths.users },
  { label: 'Профиль', to: paths.profile },
]

export function Layout(): JSX.Element {
  const { user } = useAuth()
  const location = useLocation()

  return (
    <div className="flex h-full">
      <aside className="w-56 shrink-0 border-r bg-sidebar">
        <div className="flex h-14 items-center border-b px-4">
          <span className="font-semibold text-sidebar-foreground">Admin</span>
        </div>
        <nav className="flex flex-col gap-1 p-2">
          {NAV_ITEMS.map(({ label, to }) => {
            const isActive = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={[
                  'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                ].join(' ')}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-6">
          <div />
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Link
              to={paths.logout}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Выйти
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
