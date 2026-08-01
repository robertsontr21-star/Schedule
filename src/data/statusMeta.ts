import type { DriverStatus } from './types'

export const STATUS_META: Record<DriverStatus, { label: string; color: string; bg: string }> = {
  driving: { label: 'Driving', color: 'var(--status-driving)', bg: 'var(--status-driving-bg)' },
  stopped: { label: 'Stopped', color: 'var(--status-stopped)', bg: 'var(--status-stopped-bg)' },
  not_started: { label: 'Not started', color: 'var(--status-not-started)', bg: 'var(--status-not-started-bg)' },
  finished: { label: 'Finished', color: 'var(--status-finished)', bg: 'var(--status-finished-bg)' },
}
