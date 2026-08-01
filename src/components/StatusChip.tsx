import { STATUS_META } from '../data/statusMeta'
import type { DriverStatus } from '../data/types'

export function StatusChip({ status }: { status: DriverStatus }) {
  const meta = STATUS_META[status]
  return (
    <span
      className="status-chip"
      style={{ color: meta.color, background: meta.bg }}
    >
      <span className="status-chip-dot" style={{ background: meta.color }} />
      {meta.label}
    </span>
  )
}
