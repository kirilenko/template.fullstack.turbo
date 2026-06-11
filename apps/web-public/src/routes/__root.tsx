import type { ReactNode } from 'react'
import { RenderLogProvider } from 'react-render-log'
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'

import { HeaderAuth } from '@/components/header-auth'
import { env } from '@/config/env'

import '../styles/global.css'

export const Route = createRootRoute({
  component: RootComponent,
  head: () => ({
    links: [{ href: '/favicon.svg', rel: 'icon', type: 'image/svg+xml' }],
    meta: [
      { charSet: 'utf-8' },
      { content: 'width=device-width, initial-scale=1.0', name: 'viewport' },
    ],
  }),
})

function RootComponent() {
  return (
    <RootDocument>
      <RenderLogProvider debugEnabled={env.PUBLIC_RENDER_LOG === true} isStrictMode={false}>
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
          <div className="flex h-14 items-center justify-between px-4">
            <a href="/" className="font-semibold text-foreground">App</a>
            <HeaderAuth />
          </div>
        </header>
        <Outlet />
      </RenderLogProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
