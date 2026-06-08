import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadPortsLocal(): Record<string, string> {
  const path = resolve(__dirname, '../../.env.ports.local')
  if (!existsSync(path)) {
    console.warn('[vite] .env.ports.local not found — run pnpm dev to sync ports')
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
  envPrefix: 'PUBLIC_',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
    dedupe: ['react', 'react-dom', '@tanstack/react-router'],
  },
  server: {
    port: parseInt(portsEnv.PORT_VITE_CONTROL ?? process.env.PORT_VITE_CONTROL ?? ''),
  },
})
