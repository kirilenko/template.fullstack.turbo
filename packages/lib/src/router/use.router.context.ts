import { useContext } from 'react'

import { RouterContext } from './router.context'

const useRouterContext = () => useContext(RouterContext)

export { useRouterContext }
