import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RenderLogProvider } from 'react-render-log'

import { App } from '@/app'
import { env } from '@/config'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RenderLogProvider debugEnabled={env.PUBLIC_RENDER_LOG as boolean} isStrictMode={true}>
      <App />
    </RenderLogProvider>
  </StrictMode>,
)
