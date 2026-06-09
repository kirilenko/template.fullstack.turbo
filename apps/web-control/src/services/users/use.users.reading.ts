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
    setIsLoading(true)
    setError('')
    apiFetch<User[]>('/api/admin/users')
      .then((data) => {
        setUsers(data)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки')
        setIsLoading(false)
      })
  }, [])

  return { users, setUsers, isLoading, error }
}
