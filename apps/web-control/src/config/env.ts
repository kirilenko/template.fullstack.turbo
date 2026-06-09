import { parseEnv } from '@packages/lib/env'

const env = parseEnv({
  PUBLIC_API_URL: { required: true, type: 'url' },
})

export { env }
