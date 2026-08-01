import { formatClock } from '../lib/time'
import type { DriverSchedule } from '../data/types'

interface AlertsPanelProps {
  drivers: DriverSchedule[]
}

interface FlatAlert {
  driverName: string
  ruleName: string
  activeFromMs: number
}

export function AlertsPanel({ drivers }: AlertsPanelProps) {
  const alerts: FlatAlert[] = drivers
    .flatMap((d) => d.exceptions.map((e) => ({ driverName: d.driverName, ruleName: e.ruleName, activeFromMs: e.activeFromMs })))
    .sort((a, b) => b.activeFromMs - a.activeFromMs)

  return (
    <aside className="alerts-panel">
      <h2>Exceptions</h2>
      {alerts.length === 0 ? (
        <p className="alerts-empty">No exceptions for this day.</p>
      ) : (
        <ul className="alerts-list">
          {alerts.map((alert, i) => (
            <li key={i} className="alerts-item">
              <span className="alerts-time">{formatClock(alert.activeFromMs)}</span>
              <div>
                <div className="alerts-rule">{alert.ruleName}</div>
                <div className="alerts-driver">{alert.driverName}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
