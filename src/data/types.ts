export type DriverStatus = 'driving' | 'stopped' | 'not_started' | 'finished'

export interface TripSegment {
  id: string
  startMs: number
  stopMs: number | null
  distanceKm: number
  maxSpeedKmh: number
}

export interface ExceptionItem {
  id: string
  driverId: string | null
  ruleName: string
  activeFromMs: number
  activeToMs: number | null
  durationLabel: string | null
}

export interface DriverSchedule {
  driverId: string
  driverName: string
  deviceId: string | null
  deviceName: string | null
  status: DriverStatus
  lastActivityMs: number | null
  trips: TripSegment[]
  exceptions: ExceptionItem[]
  totalDistanceKm: number
}

export interface ScheduleData {
  dateISO: string
  generatedAtMs: number
  drivers: DriverSchedule[]
  isDemo: boolean
}
