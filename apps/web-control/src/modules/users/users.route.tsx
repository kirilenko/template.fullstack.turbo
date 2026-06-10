import { type AnyRoute, createRoute } from '@tanstack/react-router'

import { paths } from '@/config'
import { apiClient } from '@/libs/api'
import type { User } from '@/services/users'

import { UsersPage } from './users.page'

export function createUsersRoute<TParent extends AnyRoute>(getParentRoute: () => TParent) {
  const route = createRoute({
    getParentRoute,
    path: paths.users,
    loader: () => apiClient.admin.users.list(),
    component: function UsersPageLoaded() {
      const users = route.useLoaderData() as User[]
      return <UsersPage initialUsers={users} />
    },
  })
  return route
}
