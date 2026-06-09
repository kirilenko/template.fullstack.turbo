import type { ReactNode } from 'react'
import { RenderLogProvider } from 'react-render-log'

const enabled = import.meta.env.PUBLIC_RENDER_LOG === 'true'

export function RenderLogIslandProvider({ children }: { children: ReactNode }) {
  return (
    <RenderLogProvider debugEnabled={enabled} isStrictMode={false}>
      {children}
    </RenderLogProvider>
  )
}
