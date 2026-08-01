import { STATUS_META } from '../data/statusMeta'
import type { DriverSchedule, DriverStatus } from '../data/types'

interface StatTilesProps {
  drivers: DriverSchedule[]
}

const ORDER: DriverStatus[] = ['driving', 'stopped', 'not_started', 'finished']

export function StatTiles({ drivers }: StatTilesProps) {
  const counts: Record<DriverStatus, number> = {
    driving: 0,
    stopped: 0,
    not_started: 0,
    finished: 0,
  }
  let exceptionCount = 0
  for (const d of drivers) {
    counts[d.status] += 1
    exceptionCount += d.exceptions.length
  }

  return (
    <div className="stat-tiles">
      {ORDER.map((status) => (
        <div className="stat-tile" key={status}>
          <span className="stat-tile-value" style={{ color: STATUS_META[status].color }}>
            {counts[status]}
          </span>
          <span className="stat-tile-label">{STATUS_META[status].label}</span>
        </div>
      ))}
      <div className="stat-tile stat-tile-exceptions">
        <span className="stat-tile-value">{exceptionCount}</span>
        <span className="stat-tile-label">Exceptions today</span>
      </div>
    </div>
  )
}
