import { percentOfDay } from '../lib/timeline'

export function NowMarker({ nowMs, dayStartMs }: { nowMs: number; dayStartMs: number }) {
  const left = percentOfDay(nowMs, dayStartMs)
  if (left <= 0 || left >= 100) return null
  return <div className="now-marker" style={{ left: `${left}%` }} />
}
