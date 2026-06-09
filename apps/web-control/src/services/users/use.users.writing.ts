import { useCallback, useRef, useState } from 'react'

import { apiFetch } from '@/libs/api'

import type { User } from './users.schema'

export function useUsersWriting(setUsers: React.Dispatch<React.SetStateAction<User[]>>): {
  saving: boolean
  deleting: boolean
  error: string
  updateUser: (id: string, data: { name?: string; role?: string }) => Promise<boolean>
  deleteUser: (id: string) => Promise<boolean>
} {
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const deletingRef = useRef(false)
  const [error, setError] = useState('')

  const updateUser = useCallback(async (id: string, data: { name?: string; role?: string }) => {
    setSaving(true)
    setError('')
    try {
      const updated = await apiFetch<User>(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
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
    setDeleting(true)
    setError('')
    try {
      await apiFetch<{ success: boolean }>(`/api/admin/users/${id}`, { method: 'DELETE' })
      setUsers((prev) => prev.filter((u) => u.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления')
      return false
    } finally {
      deletingRef.current = false
      setDeleting(false)
    }
  }, [setUsers])

  return { saving, deleting, error, updateUser, deleteUser }
}
