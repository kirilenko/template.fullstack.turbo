import { hc } from 'hono/client'

import type { AppType } from '@apps/service-api/src/app'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Serialized shapes matching the runtime JSON the API sends.
// Defined here so they stay consistent between the client and the re-exported types.
export type User = {
  id: string
  name: string
  email: string
  role: string | null
  emailVerified: boolean
  createdAt: string
}

export type NewsItem = {
  id: string
  title: string
  content: string
  published: boolean
  createdAt: string
  updatedAt: string
}

async function callRpc<T>(responsePromise: Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>): Promise<T> {
  const res = await responsePromise
  const data = await res.json()
  if (!res.ok) {
    throw new ApiError(res.status, (data as { error?: string }).error ?? `HTTP ${res.status}`)
  }
  return data as T
}

type ClientOptions = {
  init?: RequestInit
  headers?: Record<string, string> | (() => Record<string, string> | Promise<Record<string, string>>)
}

type NewsPayload = { title: string; content: string; published: boolean }

export function createApiClient(baseUrl: string, options?: ClientOptions) {
  const client = hc<AppType>(baseUrl, options)

  return {
    admin: {
      users: {
        list: (): Promise<User[]> => callRpc(client.api.admin.users.$get()),
        update: (id: string, data: { name?: string; role?: 'admin' | 'user' }): Promise<User> =>
          callRpc(client.api.admin.users[':id'].$patch({ param: { id }, json: data })),
        delete: (id: string): Promise<{ success: true }> =>
          callRpc(client.api.admin.users[':id'].$delete({ param: { id } })),
      },
      news: {
        list: (): Promise<NewsItem[]> => callRpc(client.api.admin.news.$get()),
        create: (data: NewsPayload): Promise<NewsItem> =>
          callRpc(client.api.admin.news.$post({ json: data })),
        update: (id: string, data: Partial<NewsPayload>): Promise<NewsItem> =>
          callRpc(client.api.admin.news[':id'].$patch({ param: { id }, json: data })),
        delete: (id: string): Promise<{ success: true }> =>
          callRpc(client.api.admin.news[':id'].$delete({ param: { id } })),
      },
    },
    me: {
      get: (): Promise<User & { image: string | null; updatedAt: string }> =>
        callRpc(client.api.users.me.$get()),
      update: (data: { name?: string }): Promise<User & { image: string | null; updatedAt: string }> =>
        callRpc(client.api.users.me.$patch({ json: data })),
      delete: (): Promise<{ success: true }> =>
        callRpc(client.api.users.me.$delete()),
    },
  }
}
