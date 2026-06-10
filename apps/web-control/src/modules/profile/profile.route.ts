import { createRoute, lazyRouteComponent } from '@tanstack/react-router'

import { paths } from '@/config'

const ProfilePage = lazyRouteComponent(() =>
  import('./profile.page').then((m) => ({ default: m.ProfilePage })),
)

export function createProfileRoute<TParent>(getParentRoute: () => TParent) {
  return createRoute({ getParentRoute, path: paths.profile, component: ProfilePage })
}
