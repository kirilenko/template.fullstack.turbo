import type { JSX } from 'react'
import { useCallback, useState } from 'react'
import { useRenderLog } from 'react-render-log'

import { useAuthReading } from '@/services/auth'
import { type User, useUsersReading, useUsersWriting } from '@/services/users'
import { Input } from '@packages/ui'

import { UserRow } from './user-row/index'

type EditingState = { user: User; name: string; role: string }

export function UsersPage({ initialUsers }: { initialUsers: User[] }): JSX.Element {
  useRenderLog()('UsersPage')()
  const { user: currentUser } = useAuthReading()
  const { users, setUsers } = useUsersReading(initialUsers)
  const { saving, updateUser, deleteUser, error } = useUsersWriting(setUsers)

  const [editing, setEditing] = useState<EditingState | null>(null)

  const openEdit = useCallback((user: User) =>
    setEditing({ user, name: user.name, role: user.role ?? 'user' }), [])

  const handleSave = useCallback(async () => {
    if (!editing) return
    const ok = await updateUser(editing.user.id, { name: editing.name, role: editing.role })
    if (ok) setEditing(null)
  }, [editing, updateUser])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Пользователи</h1>

      {error && (
        <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border bg-card">
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
              <UserRow
                key={user.id}
                renderLogId={user.id}
                user={user}
                isCurrentUser={user.id === currentUser?.id}
                onEdit={openEdit}
                onDelete={deleteUser}
              />
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) setEditing(null) }}
        >
          <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Редактировать пользователя</h2>
            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Имя</label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing((prev) => prev && { ...prev, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Роль</label>
                <select
                  value={editing.role}
                  onChange={(e) => setEditing((prev) => prev && { ...prev, role: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                disabled={saving}
                className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={() => { void handleSave() }}
                disabled={saving || !editing.name.trim()}
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
