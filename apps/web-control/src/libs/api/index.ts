import { env } from '@/config'
import { ApiError, createApiClient } from '@packages/api-client'

export { ApiError }

export const apiClient = createApiClient(env.PUBLIC_API_URL, {
  init: { credentials: 'include' },
  headers: { 'Content-Type': 'application/json' },
})
