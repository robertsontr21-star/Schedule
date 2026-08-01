import { fromDateInputValue, isSameDay, toDateInputValue } from '../lib/time'

interface ToolbarProps {
  date: Date
  onDateChange: (date: Date) => void
  search: string
  onSearchChange: (value: string) => void
  isDemo: boolean
  loading: boolean
  lastUpdatedMs: number | null
  onRefresh: () => void
}

export function Toolbar({ date, onDateChange, search, onSearchChange, isDemo, loading, lastUpdatedMs, onRefresh }: ToolbarProps) {
  const today = new Date()

  function shiftDay(delta: number) {
    const next = new Date(date)
    next.setDate(next.getDate() + delta)
    onDateChange(next)
  }

  return (
    <div className="toolbar">
      <div className="toolbar-title">
        <h1>Driver Scheduler</h1>
        {isDemo && <span className="demo-badge">Demo data</span>}
      </div>

      <div className="toolbar-controls">
        <input
          className="search-input"
          type="search"
          placeholder="Filter drivers…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <div className="date-nav">
          <button aria-label="Previous day" onClick={() => shiftDay(-1)}>‹</button>
          <input
            type="date"
            value={toDateInputValue(date)}
            onChange={(e) => e.target.value && onDateChange(fromDateInputValue(e.target.value))}
          />
          <button aria-label="Next day" onClick={() => shiftDay(1)}>›</button>
          {!isSameDay(date, today) && (
            <button className="today-btn" onClick={() => onDateChange(today)}>
              Today
            </button>
          )}
        </div>

        <button className="refresh-btn" onClick={onRefresh} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>

        {lastUpdatedMs && (
          <span className="last-updated">
            Updated {new Date(lastUpdatedMs).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  )
}
