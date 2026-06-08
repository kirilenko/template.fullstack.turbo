import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadPortsLocal(): Record<string, string> {
  const path = resolve(__dirname, '../../.env.ports.local')
  if (!existsSync(path)) {
    console.warn('[astro] .env.ports.local not found — run pnpm dev to sync ports')
    return {}
  }
  return Object.fromEntries(
    readFileSync(path, 'utf-8')
      .split('\n')
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => l.split('=', 2) as [string, string]),
  )
}

const portsEnv = loadPortsLocal()

export default defineConfig({
  site: process.env.SITE_URL,
  prefetch: false,
  server: {
    port: parseInt(portsEnv.PORT_ASTRO_PUBLIC ?? process.env.PORT_ASTRO_PUBLIC ?? ''),
  },
  devToolbar: { enabled: false },
  integrations: [react()],
  vite: {
    // @ts-ignore — vite plugin type mismatch between @tailwindcss/vite and astro
    plugins: [tailwindcss()],
  },
})
