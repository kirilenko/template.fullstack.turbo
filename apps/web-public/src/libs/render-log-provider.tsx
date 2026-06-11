import type { ReactNode } from 'react'
import { RenderLogProvider } from 'react-render-log'

import { env } from '@/config/env'

const enabled = env.PUBLIC_RENDER_LOG === true

export function RenderLogIslandProvider({ children }: { children: ReactNode }) {
  return (
    <RenderLogProvider debugEnabled={enabled} isStrictMode={false}>
      {children}
    </RenderLogProvider>
  )
}
