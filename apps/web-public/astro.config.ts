import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: process.env.SITE_URL,
  prefetch: false,
  server: {
    ...(process.env.PORT_ASTRO_PUBLIC && { port: Number(process.env.PORT_ASTRO_PUBLIC) }),
  },
  devToolbar: { enabled: false },
  integrations: [react()],
  vite: {
    // @ts-ignore — vite plugin type mismatch between @tailwindcss/vite and astro
    plugins: [tailwindcss()],
  },
})
