import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './components/App'
import { registerAddin } from './geotab/addin'
import type { GeotabApi } from './geotab/types'

const container = document.getElementById('root')!
const root = createRoot(container)
let mounted = false

function mount(api: GeotabApi | null) {
  if (mounted) return
  mounted = true
  root.render(
    <StrictMode>
      <App api={api} />
    </StrictMode>,
  )
}

registerAddin('driverScheduler', (api) => mount(api))

// MyGeotab calls initialize() almost immediately when this page runs inside
// its Add-In iframe. If that hasn't happened shortly after load, we're being
// viewed standalone (e.g. the GitHub Pages URL opened directly) — boot into
// demo mode so the board is still fully interactive to preview.
setTimeout(() => mount(null), 300)
