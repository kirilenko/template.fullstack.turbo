import { RouteObject, useMatches } from 'react-router'

type PathConfig = Record<'index', string>

type Paths = { [p: string]: PathConfig | Paths }

type PathWrapper = { parent: Paths; path: string }
const getAbsolutePath = (props: { path: string; paths: Paths }): string =>
  props.path.split('.').reduce(
    (acc, cur) =>
      ({
        parent: acc.parent[cur],
        path: (() => {
          if (!acc.path) return acc.parent[cur]?.index || ''
          if (acc.path === '/') return acc.path + acc.parent[cur].index

          return `${acc.path}/${acc.parent[cur].index}`
        })(),
      }) as PathWrapper,
    {
      parent: props.paths,
      path: '',
    } as PathWrapper,
  ).path

type RouteObjectWithAuth<CustomProps = object> = Omit<
  RouteObject,
  'children'
> & {
  children?: RouteObjectWithAuth<CustomProps>[]
  id: string
  isPrivate?: boolean
  isPublicOnly?: boolean
} & CustomProps

const getRoute: (p: {
  ids: string[]
  list: RouteObjectWithAuth[]
}) => RouteObjectWithAuth | null = ({ ids, list }) => {
  const [id, ...newIds] = ids
  const route = list.find((p) => p.id === id) ?? null
  const newList = route?.children ?? null
  if (ids.length === 1) return route

  if (!route || !newList) return null

  return getRoute({
    ids: newIds,
    list: newList,
  })
}

const useRouteFinder = (
  list: RouteObjectWithAuth[],
): RouteObjectWithAuth | null => {
  const ids = useMatches().map(({ id }) => id)

  return getRoute({ ids, list })
}

export type { Paths, RouteObjectWithAuth }
export { getAbsolutePath, getRoute, useRouteFinder }
