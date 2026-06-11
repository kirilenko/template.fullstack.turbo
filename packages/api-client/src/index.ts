import { hc } from 'hono/client'

import type { AppType } from '@apps/service-api/src/app'
import type { auth } from '@apps/service-api/src/auth'

export type Auth = typeof auth

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Serialized shapes matching the runtime JSON the API sends.
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

export type ClientOptions = {
  init?: RequestInit
  headers?: Record<string, string> | (() => Record<string, string> | Promise<Record<string, string>>)
}

async function callRpc<T>(responsePromise: Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>): Promise<T> {
  const res = await responsePromise
  const data = await res.json()
  if (!res.ok) {
    throw new ApiError(res.status, (data as { error?: string }).error ?? `HTTP ${res.status}`)
  }
  return data as T
}

type NewsPayload = { content: string; published: boolean; title: string }

// --- Admin: /api/admin/* ---
// For web-control, mobile-admin, etc.

export function createAdminClient(baseUrl: string, options?: ClientOptions) {
  const client = hc<AppType>(baseUrl, options)

  return {
    news: {
      create: (data: NewsPayload): Promise<NewsItem> =>
        callRpc(client.api.admin.news.$post({ json: data })),
      delete: (id: string): Promise<{ success: true }> =>
        callRpc(client.api.admin.news[':id'].$delete({ param: { id } })),
      list: (): Promise<NewsItem[]> =>
        callRpc(client.api.admin.news.$get()),
      update: (id: string, data: Partial<NewsPayload>): Promise<NewsItem> =>
        callRpc(client.api.admin.news[':id'].$patch({ json: data, param: { id } })),
    },
    users: {
      delete: (id: string): Promise<{ success: true }> =>
        callRpc(client.api.admin.users[':id'].$delete({ param: { id } })),
      list: (): Promise<User[]> =>
        callRpc(client.api.admin.users.$get()),
      update: (id: string, data: { name?: string; role?: 'admin' | 'user' }): Promise<User> =>
        callRpc(client.api.admin.users[':id'].$patch({ json: data, param: { id } })),
    },
  }
}

// --- User: /api/users/* ---
// For web-public, mobile-public, web-control profile page, etc.

export type MeUser = User & { image: string | null; updatedAt: string }

export function createUserClient(baseUrl: string, options?: ClientOptions) {
  const client = hc<AppType>(baseUrl, options)

  return {
    me: {
      delete: (): Promise<{ success: true }> =>
        callRpc(client.api.users.me.$delete()),
      get: (): Promise<MeUser> =>
        callRpc(client.api.users.me.$get()),
      update: (data: { name?: string }): Promise<MeUser> =>
        callRpc(client.api.users.me.$patch({ json: data })),
    },
  }
}

// --- Convenience wrapper for apps that need both (e.g. web-control) ---

export function createApiClient(baseUrl: string, options?: ClientOptions) {
  return {
    admin: createAdminClient(baseUrl, options),
    me: createUserClient(baseUrl, options).me,
  }
}
