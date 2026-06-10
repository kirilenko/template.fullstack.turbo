import { useCallback, useRef, useState } from 'react'

import { apiClient } from '@/libs/api'

import type { NewsItem } from './news.schema'

type NewsPayload = { title: string; content: string; published: boolean }

export function useNewsWriting(setNews: React.Dispatch<React.SetStateAction<NewsItem[]>>): {
  saving: boolean
  error: string
  createNews: (data: NewsPayload) => Promise<boolean>
  updateNews: (id: string, data: Partial<NewsPayload>) => Promise<boolean>
  deleteNews: (id: string) => Promise<boolean>
} {
  const [saving, setSaving] = useState(false)
  const deletingRef = useRef(false)
  const [error, setError] = useState('')

  const createNews = useCallback(async (data: NewsPayload) => {
    setSaving(true)
    try {
      const created = await apiClient.admin.news.create(data)
      setError('')
      setNews((prev) => [...prev, created])
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания')
      return false
    } finally {
      setSaving(false)
    }
  }, [setNews])

  const updateNews = useCallback(async (id: string, data: Partial<NewsPayload>) => {
    setSaving(true)
    try {
      const updated = await apiClient.admin.news.update(id, data)
      setError('')
      setNews((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
      return false
    } finally {
      setSaving(false)
    }
  }, [setNews])

  const deleteNews = useCallback(async (id: string) => {
    if (deletingRef.current) return false
    deletingRef.current = true
    try {
      await apiClient.admin.news.delete(id)
      setError('')
      setNews((prev) => prev.filter((item) => item.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления')
      return false
    } finally {
      deletingRef.current = false
    }
  }, [setNews])

  return { saving, error, createNews, updateNews, deleteNews }
}
