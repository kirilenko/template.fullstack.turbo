import { memo } from 'react'
import { type PropsWithRenderLog, withRenderLog } from 'react-render-log'

import type { User } from '@/services/users'

export type UserRowProps = PropsWithRenderLog<{
  user: User
  isCurrentUser: boolean
  isBeingDeleted: boolean
  isDeleting: boolean
  onEdit: (user: User) => void
  onDelete: (id: string) => void
  onSetDeletingId: (id: string | null) => void
}>

function UserRowBase({
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
}

export const UserRow = memo(withRenderLog(UserRowBase))
