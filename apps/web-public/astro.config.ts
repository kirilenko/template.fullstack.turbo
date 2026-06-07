import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: process.env.SITE_URL,
  prefetch: false,
  server: {
    port: process.env.PORT_ASTRO_PUBLIC ? Number(process.env.PORT_ASTRO_PUBLIC) : undefined,
  },
  devToolbar: { enabled: false },
  integrations: [react()],
  vite: {
    // @ts-ignore — vite plugin type mismatch between @tailwindcss/vite and astro
    plugins: [tailwindcss()],
  },
})
