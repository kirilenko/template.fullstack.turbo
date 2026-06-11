import { type AnyRoute, createRoute, lazyRouteComponent } from '@tanstack/react-router'

import { paths } from '@/config'

const ProfilePage = lazyRouteComponent(() =>
  import('./profile.page').then((m) => ({ default: m.ProfilePage })),
)

export function createProfileRoute<TParent extends AnyRoute>(getParentRoute: () => TParent) {
  return createRoute({ component: ProfilePage, getParentRoute, path: paths.profile })
}
