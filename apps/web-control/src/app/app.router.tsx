import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  lazyRouteComponent,
  redirect,
} from '@tanstack/react-router'

import { paths } from '@/config'
import { apiFetch } from '@/libs/api'
import { LoginPage, LogoutPage, RegisterPage, UnauthorizedPage } from '@/modules/auth'
import { HomePage } from '@/modules/home'
import { UsersPage } from '@/modules/users'
import type { User } from '@/services/users'

import { Layout } from './layout'

interface RouterContext {
  isAuthenticated: boolean
  isAdmin: boolean
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootRoute = createRootRouteWithContext<RouterContext>()({})

const layoutRoute = createRoute({
  component: Layout,
  getParentRoute: () => rootRoute,
  id: '_layout',
})

// Requires authenticated admin
const adminRoute = createRoute({
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: paths.login })
    }
    if (!context.isAdmin) {
      throw redirect({ to: paths.unauthorized })
    }
  },
  getParentRoute: () => layoutRoute,
  id: '_admin',
})

// Requires authenticated (any role) — used for logout
const privateRoute = createRoute({
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: paths.login })
    }
  },
  getParentRoute: () => layoutRoute,
  id: '_private',
})

// Redirects authenticated admins away to home
const publicOnlyRoute = createRoute({
  beforeLoad: ({ context }) => {
    if (context.isAuthenticated) {
      throw redirect({ to: paths.home })
    }
  },
  getParentRoute: () => rootRoute,
  id: '_public-only',
})

const homeRoute = createRoute({
  component: HomePage,
  getParentRoute: () => adminRoute,
  path: paths.home,
})

const ProfilePage = lazyRouteComponent(() =>
  import('@/modules/profile').then((m) => ({ default: m.ProfilePage })),
)

const profileRoute = createRoute({
  component: ProfilePage,
  getParentRoute: () => adminRoute,
  path: paths.profile,
})

function UsersPageLoaded() {
  const users = usersRoute.useLoaderData()
  return <UsersPage initialUsers={users} />
}

const usersRoute = createRoute({
  component: UsersPageLoaded,
  getParentRoute: () => adminRoute,
  path: paths.users,
  loader: (): Promise<User[]> => apiFetch<User[]>('/api/admin/users'),
})

const logoutRoute = createRoute({
  component: LogoutPage,
  getParentRoute: () => privateRoute,
  path: paths.logout,
})

const loginRoute = createRoute({
  component: LoginPage,
  getParentRoute: () => publicOnlyRoute,
  path: paths.login,
})

const registerRoute = createRoute({
  component: RegisterPage,
  getParentRoute: () => publicOnlyRoute,
  path: paths.register,
})

const unauthorizedRoute = createRoute({
  component: UnauthorizedPage,
  getParentRoute: () => layoutRoute,
  path: paths.unauthorized,
})

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    adminRoute.addChildren([homeRoute, profileRoute, usersRoute]),
    privateRoute.addChildren([logoutRoute]),
    unauthorizedRoute,
  ]),
  publicOnlyRoute.addChildren([loginRoute, registerRoute]),
])

export const router = createRouter({
  context: { isAdmin: false, isAuthenticated: false },
  routeTree,
})
