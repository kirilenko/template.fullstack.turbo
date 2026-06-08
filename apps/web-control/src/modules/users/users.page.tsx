import type { JSX } from 'react'
import { useEffect, useState } from 'react'

import { useAuth } from '@/services/auth'

import { type User,usersApi } from './users.api'

export function UsersPage(): JSX.Element {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      setError('')
      setUsers(await usersApi.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const openEdit = (user: User) => {
    setEditingUser(user)
    setEditName(user.name)
    setEditRole(user.role ?? 'user')
  }

  const handleSave = async () => {
    if (!editingUser) return
    setSaving(true)
    try {
      const updated = await usersApi.update(editingUser.id, { name: editName, role: editRole })
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      setEditingUser(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await usersApi.delete(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      setDeletingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления')
      setDeletingId(null)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Пользователи</h1>

      {error && (
        <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border bg-card">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Загрузка...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Имя</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Роль</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email подтверждён</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Создан</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Нет пользователей
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                        user.role === 'admin'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground',
                      ].join(' ')}
                    >
                      {user.role ?? 'user'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.emailVerified ? 'Да' : 'Нет'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString('ru')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      {deletingId === user.id ? (
                        <>
                          <span className="text-xs text-muted-foreground">Удалить?</span>
                          <button
                            onClick={() => { void handleDelete(user.id) }}
                            className="text-xs font-medium text-destructive hover:underline"
                          >
                            Да
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="text-xs text-muted-foreground hover:underline"
                          >
                            Отмена
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => openEdit(user)}
                            className="text-xs font-medium hover:underline"
                          >
                            Изменить
                          </button>
                          {user.id !== currentUser?.id && (
                            <button
                              onClick={() => setDeletingId(user.id)}
                              className="text-xs font-medium text-destructive hover:underline"
                            >
                              Удалить
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) setEditingUser(null) }}
        >
          <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Редактировать пользователя</h2>
            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Имя</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Роль</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setEditingUser(null)}
                disabled={saving}
                className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={() => { void handleSave() }}
                disabled={saving || !editName.trim()}
                className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
