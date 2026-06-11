import { inferAdditionalFields } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import { env } from '@/config/env'
import type { Auth } from '@packages/api-client'

export const authClient = createAuthClient({
  baseURL: env.PUBLIC_API_URL ?? undefined,
  fetchOptions: { credentials: 'include' },
  plugins: [inferAdditionalFields<Auth>()],
})
