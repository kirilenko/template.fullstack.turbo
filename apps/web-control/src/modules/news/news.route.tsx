import { type AnyRoute, createRoute } from '@tanstack/react-router'

import { paths } from '@/config'
import { apiClient } from '@/libs/api'
import type { NewsItem } from '@/services/news'

import { NewsPage } from './news.page'

export function createNewsRoute<TParent extends AnyRoute>(getParentRoute: () => TParent) {
  const route = createRoute({
    component: function NewsPageLoaded() {
      const news = route.useLoaderData() as NewsItem[]
      return <NewsPage initialNews={news} />
    },
    getParentRoute,
    loader: () => apiClient.admin.news.list(),
    path: paths.news,
  })
  return route
}
