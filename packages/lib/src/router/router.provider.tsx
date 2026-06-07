import { JSX, useCallback, useMemo, useRef } from 'react'
import {
  createBrowserRouter,
  LoaderFunction,
  RouteObject,
  RouterProvider as ReactRouterProvider,
} from 'react-router'

import {
  defaultAbsoluteAuthPaths,
  RouterContext,
  RouterContextValue,
} from './router.context'
import { RouteObjectWithAuth } from './router.features'
import { useGuard } from './use.guard'

type Props = {
  absoluteAuthPaths?: {
    login?: string
    logout?: string
    privateStart?: string
    publicStart?: string
  }
  authorized: boolean
  config: RouteObjectWithAuth[]
  createRouter?: typeof createBrowserRouter
}

const RouterProvider = ({
  absoluteAuthPaths: customAbsoluteAuthPaths,
  authorized,
  config,
  createRouter = createBrowserRouter,
}: Props): JSX.Element => {
  const absoluteAuthPaths: RouterContextValue['absoluteAuthPaths'] = useMemo(
    () => ({
      ...defaultAbsoluteAuthPaths,
      ...customAbsoluteAuthPaths,
    }),
    [customAbsoluteAuthPaths],
  )

  const { loginLoader, logoutLoader, privateOnlyLoader, publicOnlyLoader } =
    useGuard({ absoluteAuthPaths, authorized })

  const loadersRef = useRef({
    loginLoader,
    logoutLoader,
    privateOnlyLoader,
    publicOnlyLoader,
  })
  loadersRef.current = {
    loginLoader,
    logoutLoader,
    privateOnlyLoader,
    publicOnlyLoader,
  }

  const stableLoaders = useMemo(
    () => ({
      loginLoader: ((args) =>
        loadersRef.current.loginLoader(args)) as LoaderFunction,
      logoutLoader: ((args) =>
        loadersRef.current.logoutLoader(args)) as LoaderFunction,
      privateOnlyLoader: ((args) =>
        loadersRef.current.privateOnlyLoader(args)) as LoaderFunction,
      publicOnlyLoader: ((args) =>
        loadersRef.current.publicOnlyLoader(args)) as LoaderFunction,
    }),
    [],
  )

  const getLoader = useCallback(
    (
      rawRoute: RouteObjectWithAuth,
    ): Pick<RouteObject, 'loader'> | Record<string, never> => {
      if (rawRoute.id === 'login') return { loader: stableLoaders.loginLoader }
      if (rawRoute.id === 'logout')
        return { loader: stableLoaders.logoutLoader }
      if (rawRoute.isPublicOnly)
        return { loader: stableLoaders.publicOnlyLoader }
      if (rawRoute.isPrivate)
        return { loader: stableLoaders.privateOnlyLoader }

      return {}
    },
    [stableLoaders],
  )

  const mapConfigWithAuthToRoutes = useCallback(
    (rawRoutes: RouteObjectWithAuth[]): RouteObject[] =>
      rawRoutes.map((rawRoute) => {
        const { isPrivate, isPublicOnly, ...route } = rawRoute // eslint-disable-line @typescript-eslint/no-unused-vars

        return {
          ...getLoader(rawRoute),
          ...route,
          ...(route.children
            ? { children: mapConfigWithAuthToRoutes(route.children) }
            : {}),
          HydrateFallback: () => null,
        } as RouteObject
      }),
    [getLoader],
  )

  const router = useMemo(
    () => createRouter(mapConfigWithAuthToRoutes(config)),
    [createRouter, mapConfigWithAuthToRoutes, config],
  )

  const value: RouterContextValue = useMemo(
    () => ({ absoluteAuthPaths }),
    [absoluteAuthPaths],
  )

  return (
    <RouterContext.Provider {...{ value }}>
      <ReactRouterProvider router={router} />
    </RouterContext.Provider>
  )
}

export { RouterProvider }
