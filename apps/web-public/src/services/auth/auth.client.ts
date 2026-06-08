import { inferAdditionalFields } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import type { auth } from '@apps/service-api/src/auth'

export const authClient = createAuthClient({
  baseURL: import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3001',
  fetchOptions: { credentials: 'include' },
  plugins: [inferAdditionalFields<typeof auth>()],
})
