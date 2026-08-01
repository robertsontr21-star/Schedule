import { get } from '../geotab/client'
import type {
  GeotabDevice,
  GeotabDeviceStatusInfo,
  GeotabExceptionEvent,
  GeotabRule,
  GeotabTrip,
  GeotabUser,
  GeotabApi,
} from '../geotab/types'
import { deriveStatus } from './status'
import type { DriverSchedule, ExceptionItem, ScheduleData, TripSegment } from './types'

export async function fetchDailySchedule(api: GeotabApi, dayStart: Date, dayEnd: Date): Promise<ScheduleData> {
  const fromDate = dayStart.toISOString()
  const toDate = dayEnd.toISOString()

  const [users, devices, trips, statuses, exceptions, rules] = await Promise.all([
    get<GeotabUser>(api, 'User'),
    get<GeotabDevice>(api, 'Device'),
    get<GeotabTrip>(api, 'Trip', { fromDate, toDate }),
    get<GeotabDeviceStatusInfo>(api, 'DeviceStatusInfo').catch(() => [] as GeotabDeviceStatusInfo[]),
    get<GeotabExceptionEvent>(api, 'ExceptionEvent', { fromDate, toDate, includeMetadata: true }).catch(
      () => [] as GeotabExceptionEvent[],
    ),
    get<GeotabRule>(api, 'Rule').catch(() => [] as GeotabRule[]),
  ])

  const drivers = users.filter((u) => u.isDriver !== false && u.name !== 'UnknownDriver' && !!u.name)
  const deviceById = new Map(devices.map((d) => [d.id, d]))
  const ruleNameById = new Map(rules.map((r) => [r.id, r.name]))
  const now = Date.now()

  const tripsByDriver = new Map<string, GeotabTrip[]>()
  const deviceByDriver = new Map<string, GeotabDevice>()
  for (const trip of trips) {
    const driverId = trip.driver?.id
    if (!driverId) continue
    if (!tripsByDriver.has(driverId)) tripsByDriver.set(driverId, [])
    tripsByDriver.get(driverId)!.push(trip)
    const device = deviceById.get(trip.device.id)
    if (device) deviceByDriver.set(driverId, device)
  }

  const statusByDriver = new Map<string, GeotabDeviceStatusInfo>()
  for (const status of statuses) {
    const driverId = status.driver?.id
    if (!driverId) continue
    const existing = statusByDriver.get(driverId)
    if (!existing || new Date(status.dateTime).getTime() > new Date(existing.dateTime).getTime()) {
      statusByDriver.set(driverId, status)
    }
  }

  const exceptionsByDriver = new Map<string, ExceptionItem[]>()
  for (const ev of exceptions) {
    const driverId = ev.driver?.id ?? null
    if (!driverId) continue
    const item: ExceptionItem = {
      id: ev.id,
      driverId,
      ruleName: ruleNameById.get(ev.rule.id) ?? 'Exception',
      activeFromMs: new Date(ev.activeFrom).getTime(),
      activeToMs: ev.activeTo ? new Date(ev.activeTo).getTime() : null,
      durationLabel: ev.duration ?? null,
    }
    if (!exceptionsByDriver.has(driverId)) exceptionsByDriver.set(driverId, [])
    exceptionsByDriver.get(driverId)!.push(item)
  }

  const driverSchedules: DriverSchedule[] = drivers.map((user) => {
    const rawTrips = (tripsByDriver.get(user.id) ?? []).slice().sort((a, b) => a.start.localeCompare(b.start))
    const tripSegments: TripSegment[] = rawTrips.map((t) => ({
      id: t.id,
      startMs: new Date(t.start).getTime(),
      stopMs: t.stop ? new Date(t.stop).getTime() : null,
      distanceKm: t.distance ?? 0,
      maxSpeedKmh: t.maximumSpeed ?? 0,
    }))

    const device = deviceByDriver.get(user.id) ?? null
    const latestStatus = statusByDriver.get(user.id) ?? null
    const status = deriveStatus(
      now,
      tripSegments,
      latestStatus ? new Date(latestStatus.dateTime).getTime() : null,
      latestStatus?.isDriving ?? false,
    )

    const lastActivityMs = tripSegments.length
      ? Math.max(...tripSegments.map((t) => t.stopMs ?? t.startMs))
      : latestStatus
        ? new Date(latestStatus.dateTime).getTime()
        : null

    return {
      driverId: user.id,
      driverName: user.name,
      deviceId: device?.id ?? null,
      deviceName: device?.name ?? null,
      status,
      lastActivityMs,
      trips: tripSegments,
      exceptions: (exceptionsByDriver.get(user.id) ?? []).sort((a, b) => a.activeFromMs - b.activeFromMs),
      totalDistanceKm: tripSegments.reduce((sum, t) => sum + t.distanceKm, 0),
    }
  })

  driverSchedules.sort((a, b) => {
    const order: Record<string, number> = { driving: 0, stopped: 1, not_started: 2, finished: 3 }
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status]
    return a.driverName.localeCompare(b.driverName)
  })

  return {
    dateISO: fromDate.slice(0, 10),
    generatedAtMs: now,
    drivers: driverSchedules,
    isDemo: false,
  }
}
