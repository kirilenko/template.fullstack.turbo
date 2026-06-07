import eslintConfigK8 from 'eslint-config-k8'
import globals from 'globals'

export const baseConfigs = eslintConfigK8

export const languageOptionsConfig = {
  languageOptions: {
    ecmaVersion: 2020,
    globals: {
      ...globals.browser,
      ...globals.node,
    },
  },
}

export const ignores = ['dist', 'node_modules', '*.d.ts']

export default { baseConfigs, ignores, languageOptionsConfig }
