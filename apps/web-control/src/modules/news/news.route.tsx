import { createRoute } from '@tanstack/react-router'

import { paths } from '@/config'
import { apiFetch } from '@/libs/api'
import type { NewsItem } from '@/services/news'

import { NewsPage } from './news.page'

export function createNewsRoute<TParent>(getParentRoute: () => TParent) {
  const route = createRoute({
    getParentRoute,
    path: paths.news,
    loader: (): Promise<NewsItem[]> => apiFetch<NewsItem[]>('/api/admin/news'),
    component: function NewsPageLoaded() {
      const news = route.useLoaderData()
      return <NewsPage initialNews={news} />
    },
  })
  return route
}
