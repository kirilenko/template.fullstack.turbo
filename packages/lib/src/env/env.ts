type EnvConfigItemValue = {
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'protocol' | 'url'
}

type EnvConfig<Keys extends string> = Record<Keys, EnvConfigItemValue>

type EnvValue = string | number | boolean | null

// For required fields, infer the non-nullable value type; otherwise allow null.
type InferEnvValue<C extends EnvConfigItemValue> =
  C extends { required: true }
    ? C extends { type: 'number' } ? number
    : C extends { type: 'boolean' } ? boolean
    : string
  : EnvValue

const parseEnv = <Config extends Record<string, EnvConfigItemValue>>(
  envConfig: Config,
): { [K in keyof Config]: InferEnvValue<Config[K]> } => {
  const result = {} as Record<string, EnvValue>

  for (const [key, { required, type = 'string' }] of Object.entries(envConfig)) {
    const value = import.meta.env[key]
    if (required && value === undefined) {
      throw new Error(`No ${key} provided`)
    }

    switch (type) {
      case 'boolean':
        result[key] = value === 'true'
        break

      case 'number':
        result[key] = Number.isNaN(+value) ? null : +value
        break

      case 'protocol':
        if (!['http', 'https'].includes(value ?? ''))
          throw new Error(`${value} should be http or https`)
        result[key] = value
        break

      case 'string':
        result[key] = value ?? null
        break

      case 'url':
        try {
          new URL(value ?? '')
          result[key] = value
        } catch {
          throw new Error(`Invalid URL: ${value}`)
        }
        break

      default:
        throw new Error(`Unknown type: ${type}`)
    }
  }

  return result as { [K in keyof Config]: InferEnvValue<Config[K]> }
}

export type { EnvConfigItemValue, EnvConfig, EnvValue }
export { parseEnv }
