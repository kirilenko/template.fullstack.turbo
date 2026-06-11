import { type AnyRoute, createRoute } from '@tanstack/react-router'

import { paths } from '@/config'

import { HomePage } from './home.page'

export function createHomeRoute<TParent extends AnyRoute>(getParentRoute: () => TParent) {
  return createRoute({ component: HomePage, getParentRoute, path: paths.home })
}
