import type { JSX } from 'react'
import { memo, useCallback, useState } from 'react'
import { useRenderLog } from 'react-render-log'

import { Input } from '@packages/ui'
import { useAuthReading } from '@/services/auth'
import { type User, useUsersReading, useUsersWriting } from '@/services/users'

type EditingState = { user: User; name: string; role: string }

type UserRowProps = {
  user: User
  isCurrentUser: boolean
  isBeingDeleted: boolean
  isDeleting: boolean
  onEdit: (user: User) => void
  onDelete: (id: string) => void
  onSetDeletingId: (id: string | null) => void
}

const UserRow = memo(function UserRow({
  user,
  isCurrentUser,
  isBeingDeleted,
  isDeleting,
  onEdit,
  onDelete,
  onSetDeletingId,
}: UserRowProps) {
  return (
    <tr className="border-b last:border-0 hover:bg-muted/20">
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
          {isBeingDeleted ? (
            <>
              <span className="text-xs text-muted-foreground">Удалить?</span>
              <button
                onClick={() => { void onDelete(user.id) }}
                disabled={isDeleting}
                className="text-xs font-medium text-destructive hover:underline disabled:opacity-50"
              >
                Да
              </button>
              <button
                onClick={() => onSetDeletingId(null)}
                disabled={isDeleting}
                className="text-xs text-muted-foreground hover:underline disabled:opacity-50"
              >
                Отмена
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEdit(user)}
                className="text-xs font-medium hover:underline"
              >
                Изменить
              </button>
              {!isCurrentUser && (
                <button
                  onClick={() => onSetDeletingId(user.id)}
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
  )
})

export function UsersPage(): JSX.Element {
  useRenderLog()('UsersPage')()
  const { user: currentUser } = useAuthReading()
  const { users, setUsers, isLoading, error: readError } = useUsersReading()
  const { saving, deleting, updateUser, deleteUser, error: writeError } = useUsersWriting(setUsers)

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editing, setEditing] = useState<EditingState | null>(null)

  const error = readError || writeError

  const openEdit = useCallback((user: User) =>
    setEditing({ user, name: user.name, role: user.role ?? 'user' }), [])

  const handleDelete = useCallback(async (id: string) => {
    const ok = await deleteUser(id)
    if (ok) setDeletingId(null)
  }, [deleteUser])

  const handleSave = async () => {
    if (!editing) return
    const ok = await updateUser(editing.user.id, { name: editing.name, role: editing.role })
    if (ok) setEditing(null)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Пользователи</h1>

      {error && (
        <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border bg-card">
        {isLoading ? (
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
                <UserRow
                  key={user.id}
                  user={user}
                  isCurrentUser={user.id === currentUser?.id}
                  isBeingDeleted={deletingId === user.id}
                  isDeleting={deletingId === user.id ? deleting : false}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onSetDeletingId={setDeletingId}
                />
              ))}
            </tbody>
          </table>
        )}
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
