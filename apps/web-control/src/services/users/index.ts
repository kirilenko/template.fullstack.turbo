import { apiFetch } from '@/libs/api'

export interface User {
  id: string
  name: string
  email: string
  role: string | null
  emailVerified: boolean
  createdAt: string
}

export const usersApi = {
  list: () => apiFetch<User[]>('/api/admin/users'),

  update: (id: string, data: { name?: string; role?: string }) =>
    apiFetch<User>(`/api/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/admin/users/${id}`, { method: 'DELETE' }),
}
