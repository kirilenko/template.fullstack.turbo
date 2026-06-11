import { parseEnv } from '@packages/lib/env'

export const env = parseEnv({
  PUBLIC_API_URL: { required: true, type: 'url' },
  PUBLIC_RENDER_LOG: { type: 'boolean' },
})
