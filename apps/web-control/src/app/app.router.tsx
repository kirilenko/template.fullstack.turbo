import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'

import { paths } from '@/config'
import { createLoginRoute, createLogoutRoute, createRegisterRoute, createUnauthorizedRoute } from '@/modules/auth'
import { createHomeRoute } from '@/modules/home'
import { createProfileRoute } from '@/modules/profile'
import { createUsersRoute } from '@/modules/users'

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

const homeRoute = createHomeRoute(() => adminRoute)
const profileRoute = createProfileRoute(() => adminRoute)
const usersRoute = createUsersRoute(() => adminRoute)
const logoutRoute = createLogoutRoute(() => privateRoute)
const loginRoute = createLoginRoute(() => publicOnlyRoute)
const registerRoute = createRegisterRoute(() => publicOnlyRoute)
const unauthorizedRoute = createUnauthorizedRoute(() => layoutRoute)

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
