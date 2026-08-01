import { deriveStatus } from './status'
import type { DriverSchedule, ExceptionItem, ScheduleData, TripSegment } from './types'
import { isSameDay } from '../lib/time'

// Small deterministic PRNG (mulberry32) so the demo board looks stable
// across refreshes instead of reshuffling every poll.
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST_NAMES = ['Maria', 'James', 'Wei', 'Amara', 'Luis', 'Sofia', 'Ahmed', 'Grace', 'Tom', 'Nadia', 'Sam', 'Priya']
const LAST_NAMES = ['Diaz', 'Carter', 'Chen', 'Okafor', 'Torres', 'Bianchi', 'Hassan', 'Kelly', 'Nguyen', 'Petrova', 'Reid', 'Sharma']
const RULE_NAMES = ['Harsh Braking', 'Speeding', 'Excessive Idling', 'Late Start', 'Seatbelt Not Fastened']

function seedFromDate(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
}

export function generateMockSchedule(date: Date): ScheduleData {
  const rand = mulberry32(seedFromDate(date))
  const now = Date.now()
  const today = isSameDay(date, new Date())
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)

  const driverCount = 12
  const drivers: DriverSchedule[] = []

  // For "today", anchor the generated shift window around the current time
  // (instead of a fixed 6am-4pm block) so the demo board looks lively
  // whenever someone previews it, rather than only mid-shift. Past dates
  // still use a fixed shift so they render as a fully completed day.
  const shiftStartMs = today ? Math.max(dayStart.getTime(), now - 5.5 * 3600_000) : dayStart.getTime()
  const fixedShiftEndMs = today ? shiftStartMs + 9 * 3600_000 : new Date(date).setHours(16, 0, 0, 0)

  for (let i = 0; i < driverCount; i++) {
    const first = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)]
    const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)]
    const driverName = `${first} ${last}`
    const driverId = `mock-driver-${i}`
    const deviceId = `mock-device-${i}`

    const cursorCeilingMs = today ? Math.min(now, fixedShiftEndMs) : fixedShiftEndMs

    const trips: TripSegment[] = []
    let cursor = shiftStartMs + Math.floor(rand() * 45) * 60_000
    const startsLate = rand() < 0.1
    if (startsLate) cursor += 90 * 60_000

    while (cursor < cursorCeilingMs - 10 * 60_000) {
      const driveMinutes = 20 + Math.floor(rand() * 70)
      const startMs = cursor
      let stopMs: number | null = Math.min(startMs + driveMinutes * 60_000, cursorCeilingMs)
      const isOngoing = today && stopMs >= cursorCeilingMs - 60_000 && rand() < 0.35
      if (isOngoing) stopMs = null

      trips.push({
        id: `${driverId}-trip-${trips.length}`,
        startMs,
        stopMs,
        distanceKm: Math.round((driveMinutes / 60) * (40 + rand() * 30) * 10) / 10,
        maxSpeedKmh: Math.round(75 + rand() * 40),
      })

      if (stopMs === null) break
      const breakMinutes = 8 + Math.floor(rand() * 40)
      cursor = stopMs + breakMinutes * 60_000
    }

    const exceptions: ExceptionItem[] = []
    const exceptionCount = rand() < 0.55 ? Math.floor(rand() * 3) : 0
    for (let e = 0; e < exceptionCount; e++) {
      if (trips.length === 0) break
      const trip = trips[Math.floor(rand() * trips.length)]
      const activeFromMs = trip.startMs + Math.floor(rand() * Math.max(1, (trip.stopMs ?? cursorCeilingMs) - trip.startMs))
      exceptions.push({
        id: `${driverId}-exc-${e}`,
        driverId,
        ruleName: RULE_NAMES[Math.floor(rand() * RULE_NAMES.length)],
        activeFromMs,
        activeToMs: activeFromMs + 60_000 * (1 + Math.floor(rand() * 4)),
        durationLabel: null,
      })
    }

    const lastActivityMs = trips.length
      ? Math.max(...trips.map((t) => t.stopMs ?? t.startMs))
      : null

    const status = today
      ? deriveStatus(now, trips, lastActivityMs, trips.some((t) => t.stopMs === null))
      : trips.length
        ? 'finished'
        : 'not_started'

    drivers.push({
      driverId,
      driverName,
      deviceId,
      deviceName: `Truck ${100 + i}`,
      status,
      lastActivityMs,
      trips,
      exceptions: exceptions.sort((a, b) => a.activeFromMs - b.activeFromMs),
      totalDistanceKm: Math.round(trips.reduce((sum, t) => sum + t.distanceKm, 0) * 10) / 10,
    })
  }

  drivers.sort((a, b) => {
    const order: Record<string, number> = { driving: 0, stopped: 1, not_started: 2, finished: 3 }
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status]
    return a.driverName.localeCompare(b.driverName)
  })

  return {
    dateISO: date.toISOString().slice(0, 10),
    generatedAtMs: now,
    drivers,
    isDemo: true,
  }
}
