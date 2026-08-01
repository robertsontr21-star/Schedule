const TICKS = [0, 3, 6, 9, 12, 15, 18, 21, 24]

export function TimelineHeader() {
  return (
    <div className="board-row board-header-row">
      <div>Driver</div>
      <div>Status</div>
      <div className="col-right">Distance</div>
      <div />
      <div className="hour-ticks hour-grid-bg">
        {TICKS.map((h) => (
          <span key={h} className="hour-tick" style={{ left: `${(h / 24) * 100}%` }}>
            {h === 24 ? '24:00' : `${String(h).padStart(2, '0')}:00`}
          </span>
        ))}
      </div>
    </div>
  )
}
