type EnvConfigItemValue = {
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'protocol' | 'url'
}

type EnvConfig<Keys extends string> = Record<Keys, EnvConfigItemValue>

type EnvValue = string | number | boolean | null

// Infer the value type from the field config.
// required:true → non-nullable; optional → nullable variant of the same type.
type InferEnvValue<C extends EnvConfigItemValue> =
  C extends { required: true }
    ? C extends { type: 'number' }  ? number
    : C extends { type: 'boolean' } ? boolean
    : string
  : C extends { type: 'boolean' }              ? boolean
  : C extends { type: 'number' }               ? number | null
  : C extends { type: 'url' | 'protocol' | 'string' } ? string | null
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
        if (value === undefined) { result[key] = null; break }
        if (!['http', 'https'].includes(value))
          throw new Error(`${value} should be http or https`)
        result[key] = value
        break

      case 'string':
        result[key] = value ?? null
        break

      case 'url':
        if (value === undefined) { result[key] = null; break }
        try {
          new URL(value)
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
