import { parseEnv } from '@packages/lib/env'

export const env = parseEnv({
  PUBLIC_API_URL: { type: 'url' },
  PUBLIC_RENDER_LOG: { type: 'boolean' },
})
