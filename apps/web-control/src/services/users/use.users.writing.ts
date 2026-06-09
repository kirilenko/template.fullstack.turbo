import { useState } from 'react'

import { apiFetch } from '@/libs/api'

import type { User } from './users.schema'

export function useUsersWriting(setUsers: React.Dispatch<React.SetStateAction<User[]>>): {
  saving: boolean
  deletingId: string | null
  setDeletingId: (id: string | null) => void
  error: string
  updateUser: (id: string, data: { name?: string; role?: string }) => Promise<boolean>
  deleteUser: (id: string) => Promise<boolean>
} {
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const updateUser = async (id: string, data: { name?: string; role?: string }) => {
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
  }

  const deleteUser = async (id: string) => {
    setError('')
    try {
      await apiFetch<{ success: boolean }>(`/api/admin/users/${id}`, { method: 'DELETE' })
      setUsers((prev) => prev.filter((u) => u.id !== id))
      setDeletingId(null)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления')
      setDeletingId(null)
      return false
    }
  }

  return { saving, deletingId, setDeletingId, error, updateUser, deleteUser }
}
