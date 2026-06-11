import { useCallback, useRef, useState } from 'react'

import { apiClient } from '@/libs/api'

import type { User } from './users.schema'

export function useUsersWriting(setUsers: React.Dispatch<React.SetStateAction<User[]>>): {
  saving: boolean
  error: string
  updateUser: (id: string, data: { name?: string; role?: 'admin' | 'user' }) => Promise<boolean>
  deleteUser: (id: string) => Promise<boolean>
} {
  const [saving, setSaving] = useState(false)
  const deletingRef = useRef(false)
  const [error, setError] = useState('')

  const updateUser = useCallback(async (id: string, data: { name?: string; role?: 'admin' | 'user' }) => {
    setSaving(true)
    try {
      const updated = await apiClient.admin.users.update(id, data)
      setError('')
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
      return false
    } finally {
      setSaving(false)
    }
  }, [setUsers])

  const deleteUser = useCallback(async (id: string) => {
    if (deletingRef.current) return false
    deletingRef.current = true
    try {
      await apiClient.admin.users.delete(id)
      setError('')
      setUsers((prev) => prev.filter((u) => u.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления')
      return false
    } finally {
      deletingRef.current = false
    }
  }, [setUsers])

  return { deleteUser, error, saving, updateUser }
}
