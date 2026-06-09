import { parseEnv } from '@packages/lib/env'

const env = parseEnv({
  PUBLIC_API_URL: { required: true, type: 'url' },
  PUBLIC_REACT_SCAN: { type: 'boolean' },
  PUBLIC_RENDER_LOG: { type: 'boolean' },
})

export { env }
