import { useCallback, useRef } from 'react'
import {
  LoaderFunction,
  LoaderFunctionArgs,
  redirect,
  RouteObject,
} from 'react-router'

import { RouterContextValue } from './router.context'

const extractLngFromUrl = (url: string): string | null => {
  const match = new URL(url).pathname.match(/^\/([a-z]{2})(?:\/|$)/)
  return match?.[1] ?? null
}

const resolvePath = (path: string, lng: string | null): string => {
  if (!lng || !path.includes(':lng')) return path
  return path.replace(':lng', lng)
}

type UseGuard = (props: {
  authorized: boolean
  absoluteAuthPaths: RouterContextValue['absoluteAuthPaths']
}) => {
  loginLoader: LoaderFunction
  logoutLoader: LoaderFunction
  privateOnlyLoader: LoaderFunction
  publicOnlyLoader: LoaderFunction
}

const useGuard: UseGuard = ({ absoluteAuthPaths, authorized }) => {
  const authorizedRef = useRef(authorized)
  authorizedRef.current = authorized

  const loginLoader: RouteObject['loader'] = useCallback(
    ({ request }: LoaderFunctionArgs) => {
      if (!authorizedRef.current) return null

      const { searchParams } = new URL(request.url)
      const from = searchParams.get('from')
      const lng = extractLngFromUrl(request.url)

      return redirect(from ?? resolvePath(absoluteAuthPaths.privateStart, lng))
    },
    [absoluteAuthPaths.privateStart],
  )

  const logoutLoader: RouteObject['loader'] = useCallback(
    ({ request }: LoaderFunctionArgs) => {
      if (authorizedRef.current) return null

      const { searchParams } = new URL(request.url)
      const from = searchParams.get('from')
      const lng = extractLngFromUrl(request.url)

      return redirect(from ?? resolvePath(absoluteAuthPaths.publicStart, lng))
    },
    [absoluteAuthPaths.publicStart],
  )

  const privateOnlyLoader: RouteObject['loader'] = useCallback(
    ({ request }: LoaderFunctionArgs) => {
      if (authorizedRef.current) return null

      const lng = extractLngFromUrl(request.url)
      const params = new URLSearchParams()
      params.set('from', request.url)

      return redirect(
        `${resolvePath(absoluteAuthPaths.login, lng)}?${params.toString()}`,
      )
    },
    [absoluteAuthPaths.login],
  )

  const publicOnlyLoader: RouteObject['loader'] = useCallback(
    ({ request }: LoaderFunctionArgs) => {
      if (!authorizedRef.current) return null

      const lng = extractLngFromUrl(request.url)
      const params = new URLSearchParams()
      params.set('from', request.url)

      return redirect(
        `${resolvePath(absoluteAuthPaths.logout, lng)}?${params.toString()}`,
      )
    },
    [absoluteAuthPaths.logout],
  )

  return { loginLoader, logoutLoader, privateOnlyLoader, publicOnlyLoader }
}

export { useGuard }
