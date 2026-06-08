import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

function loadPortsLocal(): Record<string, string> {
  const path = '../../.env.ports.local'
  if (!existsSync(path)) return {}
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
