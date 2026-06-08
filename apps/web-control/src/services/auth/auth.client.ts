import { inferAdditionalFields } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import { env } from '@/config'
import type { auth } from '@apps/service-api/src/auth'

export const authClient = createAuthClient({
  baseURL: env.PUBLIC_API_URL,
  fetchOptions: { credentials: 'include' },
  plugins: [inferAdditionalFields<typeof auth>()],
})
