import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields } from 'better-auth/client/plugins'

import type { auth } from '@apps/service-api/src/auth'
import { env } from '@/config'

export const authClient = createAuthClient({
  baseURL: env.PUBLIC_API_URL,
  fetchOptions: { credentials: 'include' },
  plugins: [inferAdditionalFields<typeof auth>()],
})
