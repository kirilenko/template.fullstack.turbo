import { type AnyRoute, createRoute } from '@tanstack/react-router'

import { paths } from '@/config'

import { LoginPage } from './login.page'
import { LogoutPage } from './logout.page'
import { RegisterPage } from './register.page'
import { UnauthorizedPage } from './unauthorized.page'

export function createLoginRoute<TParent extends AnyRoute>(getParentRoute: () => TParent) {
  return createRoute({ component: LoginPage, getParentRoute, path: paths.login })
}

export function createRegisterRoute<TParent extends AnyRoute>(getParentRoute: () => TParent) {
  return createRoute({ component: RegisterPage, getParentRoute, path: paths.register })
}

export function createLogoutRoute<TParent extends AnyRoute>(getParentRoute: () => TParent) {
  return createRoute({ component: LogoutPage, getParentRoute, path: paths.logout })
}

export function createUnauthorizedRoute<TParent extends AnyRoute>(getParentRoute: () => TParent) {
  return createRoute({ component: UnauthorizedPage, getParentRoute, path: paths.unauthorized })
}
