import { percentOfDay } from '../lib/timeline'
import { formatClock, formatDurationMs } from '../lib/time'
import type { TripSegment } from '../data/types'

interface TripBlockProps {
  trip: TripSegment
  dayStartMs: number
  nowMs: number
}

export function TripBlock({ trip, dayStartMs, nowMs }: TripBlockProps) {
  const isOngoing = trip.stopMs === null
  const effectiveStop = trip.stopMs ?? nowMs
  const left = percentOfDay(trip.startMs, dayStartMs)
  const width = Math.max(0.4, percentOfDay(effectiveStop, dayStartMs) - left)

  const title = [
    `${formatClock(trip.startMs)} – ${isOngoing ? 'now' : formatClock(effectiveStop)}`,
    `${formatDurationMs(effectiveStop - trip.startMs)}`,
    `${trip.distanceKm.toFixed(1)} km, max ${Math.round(trip.maxSpeedKmh)} km/h`,
  ].join(' · ')

  return (
    <div
      className={`trip-block${isOngoing ? ' trip-block-ongoing' : ''}`}
      style={{ left: `${left}%`, width: `${width}%` }}
      title={title}
    />
  )
}
