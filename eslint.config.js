import {
  baseConfigs,
  ignores,
  languageOptionsConfig,
} from '@packages/config-eslint'

export default [
  {
    ignores: [
      ...ignores,
      '**/.astro',
      '**/.storybook',
      '**/eslint.config.js',
      '**/prettier.config.cjs',
      '**/vite.config.ts',
      '**/vitest.config.ts',
      '**/drizzle.config.ts',
      '**/astro.config.ts',
      '**/scripts/**',
    ],
  },
  ...baseConfigs,
  {
    ...languageOptionsConfig,
    files: ['**/*.{ts,tsx,js,jsx}'],
    settings: {
      react: {
        version: '19.0',
      },
    },
    rules: {
      'react-refresh/only-export-components': 'off',
      'sort-keys-fix/sort-keys-fix': 'off',
    },
  },
  {
    files: [
      'apps/web-control/**/*.{ts,tsx}',
      'apps/web-public/**/*.{ts,tsx}',
      'packages/lib/**/*.{ts,tsx}',
    ],
    rules: {
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    // TanStack Router uses `throw redirect()` — not an Error object by design
    files: ['apps/web-control/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/only-throw-error': 'off',
    },
  },
  {
    files: ['apps/service-api/**/*.ts'],
    rules: {
      'no-console': ['error', { allow: ['log', 'info', 'warn', 'error'] }],
      'no-void': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
]
