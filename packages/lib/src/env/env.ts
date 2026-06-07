type EnvConfigItemValue = {
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'protocol' | 'url'
}

type EnvConfig<Keys extends string> = Record<Keys, EnvConfigItemValue>

type EnvValue = string | number | boolean | null

const parseEnv = <Keys extends string>(
  envConfig: EnvConfig<Keys>,
): Record<string, EnvValue> =>
  (Object.entries(envConfig) as [Keys, EnvConfigItemValue][]).reduce(
    (acc, [key, { required, type = 'string' }]) => {
      const value = import.meta.env[key]
      if (required && value === undefined) {
        throw new Error(`No ${key} provided`)
      }

      switch (type) {
        case 'boolean':
          acc[key] = value === 'true'
          break

        case 'number':
          acc[key] = Number.isNaN(+value) ? null : value
          break

        case 'protocol':
          acc[key] = (() => {
            if (!['http', 'https'].includes(value ?? ''))
              throw new Error(`${value} should be http or https`)

            return value  
          })()
          break

        case 'string':
          acc[key] = value ?? ''
          break

        case 'url':
          acc[key] = (() => {
            try {
              new URL(value ?? '')
              return value  
            } catch {
              throw new Error(`Invalid URL: ${value}`)
            }
          })()
          break

        default:
          throw new Error(`Unknown type: ${type}`)
      }

      return acc
    },
    {} as Record<string, EnvValue>,
  )

export type { EnvConfigItemValue, EnvConfig, EnvValue }
export { parseEnv }
