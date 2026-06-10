import { createRoute } from '@tanstack/react-router'

import { paths } from '@/config'
import { apiFetch } from '@/libs/api'
import type { User } from '@/services/users'

import { UsersPage } from './users.page'

export function createUsersRoute<TParent>(getParentRoute: () => TParent) {
  const route = createRoute({
    getParentRoute,
    path: paths.users,
    loader: (): Promise<User[]> => apiFetch<User[]>('/api/admin/users'),
    component: function UsersPageLoaded() {
      const users = route.useLoaderData()
      return <UsersPage initialUsers={users} />
    },
  })
  return route
}
