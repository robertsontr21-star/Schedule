import type { DriverStatus, TripSegment } from './types'

const RECENTLY_ACTIVE_MS = 30 * 60 * 1000 // treat activity in the last 30min as "still around"

export function deriveStatus(
  nowMs: number,
  trips: TripSegment[],
  latestStatusMs: number | null,
  latestIsDriving: boolean,
): DriverStatus {
  if (trips.some((t) => t.stopMs === null) || latestIsDriving) return 'driving'

  const lastTripStop = trips.reduce<number | null>(
    (max, t) => (t.stopMs !== null && (max === null || t.stopMs > max) ? t.stopMs : max),
    null,
  )
  const candidates = [lastTripStop, latestStatusMs].filter((v): v is number => v !== null)
  const lastActivity = candidates.length ? Math.max(...candidates) : null

  if (lastActivity === null) return 'not_started'
  if (nowMs - lastActivity < RECENTLY_ACTIVE_MS) return 'stopped'
  return 'finished'
}
