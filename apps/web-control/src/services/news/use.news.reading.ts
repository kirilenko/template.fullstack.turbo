import { useState } from 'react'

import type { NewsItem } from './news.schema'

export function useNewsReading(initialNews: NewsItem[]): {
  news: NewsItem[]
  setNews: React.Dispatch<React.SetStateAction<NewsItem[]>>
} {
  const [news, setNews] = useState<NewsItem[]>(initialNews)
  return { news, setNews }
}
