import { useEffect, useState } from 'react'

import { apiFetch } from '@/libs/api'

import type { User } from './users.schema'

export function useUsersReading(): {
  users: User[]
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
  isLoading: boolean
  error: string
} {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setIsLoading(true)
    setError('')
    apiFetch<User[]>('/api/admin/users', { signal: controller.signal })
      .then((data) => {
        setUsers(data)
        setIsLoading(false)
      })
      .catch((err) => {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Ошибка загрузки')
        setIsLoading(false)
      })
    return () => controller.abort()
  }, [])

  return { users, setUsers, isLoading, error }
}
