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

// Extract the success-response body from a Hono ClientResponse union.
// Hono types ok:true for 2xx and ok:false for 4xx/5xx, so this picks only the happy path.
type OkBody<R> = R extends { ok: true; json: () => Promise<infer T> } ? T : never

async function callRpc<R extends { ok: boolean; status: number; json: () => Promise<unknown> }>(
  responsePromise: Promise<R>,
): Promise<OkBody<R>> {
  const res = await responsePromise
  const data = await res.json()
  if (!res.ok) {
    throw new ApiError(res.status, (data as { error?: string }).error ?? `HTTP ${res.status}`)
  }
  return data as OkBody<R>
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
        list: () => callRpc(client.api.admin.users.$get()),
        update: (id: string, data: { name?: string; role?: 'admin' | 'user' }) =>
          callRpc(client.api.admin.users[':id'].$patch({ param: { id }, json: data })),
        delete: (id: string) =>
          callRpc(client.api.admin.users[':id'].$delete({ param: { id } })),
      },
      news: {
        list: () => callRpc(client.api.admin.news.$get()),
        create: (data: NewsPayload) =>
          callRpc(client.api.admin.news.$post({ json: data })),
        update: (id: string, data: Partial<NewsPayload>) =>
          callRpc(client.api.admin.news[':id'].$patch({ param: { id }, json: data })),
        delete: (id: string) =>
          callRpc(client.api.admin.news[':id'].$delete({ param: { id } })),
      },
    },
    me: {
      get: () => callRpc(client.api.users.me.$get()),
      update: (data: { name?: string }) =>
        callRpc(client.api.users.me.$patch({ json: data })),
      delete: () => callRpc(client.api.users.me.$delete()),
    },
  }
}

// Types derived from AppType via the client — no manual maintenance needed.
type ApiClient = ReturnType<typeof createApiClient>
export type User = Awaited<ReturnType<ApiClient['admin']['users']['list']>>[number]
export type NewsItem = Awaited<ReturnType<ApiClient['admin']['news']['list']>>[number]
