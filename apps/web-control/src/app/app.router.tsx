import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  lazyRouteComponent,
  redirect,
} from '@tanstack/react-router'

import { paths } from '@/config'
import { ForgotPasswordPage, LoginPage, LogoutPage, RegisterPage, ResetPasswordPage } from '@/modules/auth'
import { HomePage } from '@/modules/home'

import { Layout } from './layout'

interface RouterContext {
  isAuthenticated: boolean
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

const privateRoute = createRoute({
  beforeLoad: ({ context, location }) => {
    if (!context.isAuthenticated) {
      throw redirect({
        search: { redirect: location.href },
        to: paths.login,
      })
    }
  },
  getParentRoute: () => layoutRoute,
  id: '_private',
})

const publicOnlyRoute = createRoute({
  beforeLoad: ({ context, location }) => {
    if (context.isAuthenticated) {
      const to =
        typeof (location.search as Record<string, unknown>).redirect === 'string'
          ? (location.search as Record<string, string>).redirect
          : paths.home
      throw redirect({ to })
    }
  },
  getParentRoute: () => rootRoute,
  id: '_public-only',
})

const homeRoute = createRoute({
  component: HomePage,
  getParentRoute: () => privateRoute,
  path: paths.home,
})

const ProfilePage = lazyRouteComponent(() =>
  import('@/modules/profile').then((m) => ({ default: m.ProfilePage })),
)

const profileRoute = createRoute({
  component: ProfilePage,
  getParentRoute: () => privateRoute,
  path: paths.profile,
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
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === 'string' ? s.redirect : undefined,
  }),
})

const registerRoute = createRoute({
  component: RegisterPage,
  getParentRoute: () => publicOnlyRoute,
  path: paths.register,
})

const forgotPasswordRoute = createRoute({
  component: ForgotPasswordPage,
  getParentRoute: () => publicOnlyRoute,
  path: paths.forgotPassword,
})

const resetPasswordRoute = createRoute({
  component: ResetPasswordPage,
  getParentRoute: () => publicOnlyRoute,
  path: paths.resetPassword,
})

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    privateRoute.addChildren([homeRoute, profileRoute, logoutRoute]),
  ]),
  publicOnlyRoute.addChildren([
    loginRoute,
    registerRoute,
    forgotPasswordRoute,
    resetPasswordRoute,
  ]),
])

export const router = createRouter({
  context: { isAuthenticated: false },
  routeTree,
})
