import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  envPrefix: 'PUBLIC_',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
    dedupe: ['react', 'react-dom', '@tanstack/react-router'],
  },
  server: { port: Number(process.env.PORT_VITE_CONTROL) || 5181 },
})
