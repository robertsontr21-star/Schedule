import { useState } from 'react'
import { TimelineHeader } from './TimelineHeader'
import { DriverRow } from './DriverRow'
import type { DriverSchedule } from '../data/types'

interface ScheduleBoardProps {
  drivers: DriverSchedule[]
  dayStartMs: number
  nowMs: number
  isToday: boolean
}

export function ScheduleBoard({ drivers, dayStartMs, nowMs, isToday }: ScheduleBoardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (drivers.length === 0) {
    return (
      <div className="board board-empty">
        <p>No drivers match the current filter.</p>
      </div>
    )
  }

  return (
    <div className="board">
      <div className="board-scroll">
        <div className="board-inner">
          <TimelineHeader />
          {drivers.map((driver) => (
            <DriverRow
              key={driver.driverId}
              driver={driver}
              dayStartMs={dayStartMs}
              nowMs={nowMs}
              isToday={isToday}
              expanded={expandedId === driver.driverId}
              onToggle={() => setExpandedId((cur) => (cur === driver.driverId ? null : driver.driverId))}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
