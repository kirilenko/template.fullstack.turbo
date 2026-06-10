import { type AnyRoute, createRoute } from '@tanstack/react-router'

import { paths } from '@/config'

import { LoginPage } from './login.page'
import { LogoutPage } from './logout.page'
import { RegisterPage } from './register.page'
import { UnauthorizedPage } from './unauthorized.page'

export function createLoginRoute<TParent extends AnyRoute>(getParentRoute: () => TParent) {
  return createRoute({ getParentRoute, path: paths.login, component: LoginPage })
}

export function createRegisterRoute<TParent extends AnyRoute>(getParentRoute: () => TParent) {
  return createRoute({ getParentRoute, path: paths.register, component: RegisterPage })
}

export function createLogoutRoute<TParent extends AnyRoute>(getParentRoute: () => TParent) {
  return createRoute({ getParentRoute, path: paths.logout, component: LogoutPage })
}

export function createUnauthorizedRoute<TParent extends AnyRoute>(getParentRoute: () => TParent) {
  return createRoute({ getParentRoute, path: paths.unauthorized, component: UnauthorizedPage })
}
