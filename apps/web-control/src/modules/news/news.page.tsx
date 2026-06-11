import type { JSX } from 'react'
import { memo, useCallback, useState } from 'react'
import { useRenderLog } from 'react-render-log'

import { type NewsItem, useNewsReading, useNewsWriting } from '@/services/news'
import { Input } from '@packages/ui'

type EditingState = { item: NewsItem | null; title: string; content: string; published: boolean }

const EMPTY_FORM: EditingState = { item: null, title: '', content: '', published: false }

const NewsRow = memo(function NewsRow({
  item,
  onEdit,
  onDelete,
}: {
  item: NewsItem
  onEdit: (item: NewsItem) => void
  onDelete: (id: string) => Promise<boolean>
}) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    const ok = await onDelete(item.id)
    if (!ok) {
      setIsDeleting(false)
      setIsConfirming(false)
    }
  }

  return (
    <tr className="border-b last:border-0 hover:bg-muted/20">
      <td className="px-4 py-3 font-medium">{item.title}</td>
      <td className="max-w-xs px-4 py-3 text-muted-foreground">
        <span className="line-clamp-1">{item.content}</span>
      </td>
      <td className="px-4 py-3">
        <span
          className={[
            'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
            item.published
              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
              : 'bg-muted text-muted-foreground',
          ].join(' ')}
        >
          {item.published ? 'Опубликовано' : 'Черновик'}
        </span>
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {new Date(item.createdAt).toLocaleDateString('ru')}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-3">
          {isConfirming ? (
            <>
              <span className="text-xs text-muted-foreground">Удалить?</span>
              <button
                onClick={() => { void handleDeleteConfirm() }}
                disabled={isDeleting}
                className="text-xs font-medium text-destructive hover:underline disabled:opacity-50"
              >
                Да
              </button>
              <button
                onClick={() => setIsConfirming(false)}
                disabled={isDeleting}
                className="text-xs text-muted-foreground hover:underline disabled:opacity-50"
              >
                Отмена
              </button>
            </>
          ) : (
            <>
              <button onClick={() => onEdit(item)} className="text-xs font-medium hover:underline">
                Изменить
              </button>
              <button
                onClick={() => setIsConfirming(true)}
                className="text-xs font-medium text-destructive hover:underline"
              >
                Удалить
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
})

export function NewsPage({ initialNews }: { initialNews: NewsItem[] }): JSX.Element {
  useRenderLog()('NewsPage')()
  const { news, setNews } = useNewsReading(initialNews)
  const { saving, createNews, updateNews, deleteNews, error } = useNewsWriting(setNews)

  const [editing, setEditing] = useState<EditingState | null>(null)

  const openCreate = useCallback(() => setEditing(EMPTY_FORM), [])
  const openEdit = useCallback(
    (item: NewsItem) =>
      setEditing({ item, title: item.title, content: item.content, published: item.published }),
    [],
  )

  const handleSave = useCallback(async () => {
    if (!editing) return
    const payload = { title: editing.title, content: editing.content, published: editing.published }
    const ok = editing.item
      ? await updateNews(editing.item.id, payload)
      : await createNews(payload)
    if (ok) setEditing(null)
  }, [editing, createNews, updateNews])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Новости</h1>
        <button
          onClick={openCreate}
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          + Создать
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Заголовок</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Содержание</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Создан</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {news.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Нет новостей
                </td>
              </tr>
            )}
            {news.map((item) => (
              <NewsRow key={item.id} item={item} onEdit={openEdit} onDelete={deleteNews} />
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) setEditing(null) }}
        >
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-semibold">
              {editing.item ? 'Редактировать новость' : 'Новая новость'}
            </h2>
            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Заголовок</label>
                <Input
                  value={editing.title}
                  onChange={(e) => setEditing((prev) => prev && { ...prev, title: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Содержание</label>
                <textarea
                  value={editing.content}
                  onChange={(e) => setEditing((prev) => prev && { ...prev, content: e.target.value })}
                  rows={5}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={editing.published}
                  onChange={(e) =>
                    setEditing((prev) => prev && { ...prev, published: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm font-medium">Опубликовать</span>
              </label>
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
                disabled={saving || !editing.title.trim() || !editing.content.trim()}
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
