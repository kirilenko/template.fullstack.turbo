import { createContext } from 'react'

type RouterContextValue = {
  absoluteAuthPaths: {
    login: string
    logout: string
    privateStart: string
    publicStart: string
  }
}

const defaultAbsoluteAuthPaths: RouterContextValue['absoluteAuthPaths'] = {
  login: '/login',
  logout: '/logout',
  privateStart: '/',
  publicStart: '/',
}

const RouterContext = createContext<RouterContextValue>({
  absoluteAuthPaths: defaultAbsoluteAuthPaths,
})

export type { RouterContextValue }
export { RouterContext, defaultAbsoluteAuthPaths }
