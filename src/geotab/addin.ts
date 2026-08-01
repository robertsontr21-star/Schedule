import type { GeotabApi, GeotabState } from './types'

type GeotabWindow = Window & {
  geotab?: { addin?: Record<string, unknown> }
}

// Registers the standard MyGeotab Add-In lifecycle object on
// window.geotab.addin.<name>. MyGeotab calls initialize() once with an
// already-authenticated api instance when the add-in's iframe loads.
export function registerAddin(name: string, onReady: (api: GeotabApi) => void): void {
  const w = window as GeotabWindow
  w.geotab = w.geotab ?? {}
  w.geotab.addin = w.geotab.addin ?? {}

  w.geotab.addin[name] = function () {
    return {
      initialize(api: GeotabApi, _state: GeotabState, callback: () => void) {
        onReady(api)
        callback()
      },
      focus(_api: GeotabApi, _state: GeotabState) {
        // no-op: the board already polls for fresh data while mounted
      },
      blur() {
        // no-op
      },
    }
  }
}
