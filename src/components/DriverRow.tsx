import { TripBlock } from './TripBlock'
import { NowMarker } from './NowMarker'
import { StatusChip } from './StatusChip'
import { formatClock, formatDurationMs } from '../lib/time'
import type { DriverSchedule } from '../data/types'

interface DriverRowProps {
  driver: DriverSchedule
  dayStartMs: number
  nowMs: number
  isToday: boolean
  expanded: boolean
  onToggle: () => void
}

export function DriverRow({ driver, dayStartMs, nowMs, isToday, expanded, onToggle }: DriverRowProps) {
  return (
    <div className={`driver-row${expanded ? ' driver-row-expanded' : ''}`}>
      <button className="board-row driver-row-header" onClick={onToggle}>
        <div className="driver-identity">
          <span className="driver-name">{driver.driverName}</span>
          <span className="driver-device">{driver.deviceName ?? 'No vehicle assigned'}</span>
        </div>
        <StatusChip status={driver.status} />
        <span className="driver-distance col-right">{driver.totalDistanceKm.toFixed(0)} km</span>
        <span className="driver-exception-badge" title={driver.exceptions.length ? `${driver.exceptions.length} exception(s) today` : undefined}>
          {driver.exceptions.length > 0 ? driver.exceptions.length : ''}
        </span>
        <div className="driver-track hour-grid-bg">
          {driver.trips.map((trip) => (
            <TripBlock key={trip.id} trip={trip} dayStartMs={dayStartMs} nowMs={nowMs} />
          ))}
          {isToday && <NowMarker nowMs={nowMs} dayStartMs={dayStartMs} />}
        </div>
      </button>

      {expanded && (
        <div className="driver-detail">
          {driver.trips.length === 0 ? (
            <p className="driver-detail-empty">No trips recorded for this day.</p>
          ) : (
            <table className="driver-detail-table">
              <thead>
                <tr>
                  <th>Start</th>
                  <th>End</th>
                  <th>Duration</th>
                  <th>Distance</th>
                  <th>Max speed</th>
                </tr>
              </thead>
              <tbody>
                {driver.trips.map((trip) => (
                  <tr key={trip.id}>
                    <td>{formatClock(trip.startMs)}</td>
                    <td>{trip.stopMs ? formatClock(trip.stopMs) : 'In progress'}</td>
                    <td>{formatDurationMs((trip.stopMs ?? nowMs) - trip.startMs)}</td>
                    <td>{trip.distanceKm.toFixed(1)} km</td>
                    <td>{Math.round(trip.maxSpeedKmh)} km/h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!isToday && <p className="driver-detail-note">Viewing a past day — status reflects that day's activity only.</p>}
        </div>
      )}
    </div>
  )
}
